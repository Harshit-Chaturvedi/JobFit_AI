import { ChunkType, DocumentChunk } from "../types/semantic";

const RESUME_SECTION_PATTERNS: Array<{ pattern: RegExp; type: ChunkType }> = [
  { pattern: /^\s*(?:summary|profile|about\s*me|objective|professional\s*summary)[\s:.-]*$/i, type: "summary" },
  { pattern: /^\s*(?:skills|technical\s*skills|core\s*competencies|technologies|tech\s*stack)[\s:.-]*$/i, type: "skills" },
  { pattern: /^\s*(?:experience|work\s*experience|employment|professional\s*experience|work\s*history)[\s:.-]*$/i, type: "experience" },
  { pattern: /^\s*(?:projects|personal\s*projects|key\s*projects|notable\s*projects|side\s*projects)[\s:.-]*$/i, type: "projects" },
  { pattern: /^\s*(?:education|academic|degrees|academic\s*background)[\s:.-]*$/i, type: "education" },
  { pattern: /^\s*(?:certifications?|certificates?|licenses?|accreditations?)[\s:.-]*$/i, type: "certifications" },
];

const JD_SECTION_PATTERNS: Array<{ pattern: RegExp; type: ChunkType }> = [
  { pattern: /^\s*(?:responsibilities|duties|what\s*you'll\s*do|role|what\s*you\s*will\s*do|key\s*responsibilities)[\s:.-]*$/i, type: "responsibilities" },
  { pattern: /^\s*(?:required|must\s*have|requirements|required\s*skills|minimum\s*qualifications|prerequisites)[\s:.-]*$/i, type: "required_skills" },
  { pattern: /^\s*(?:preferred|nice\s*to\s*have|bonus|desired|preferred\s*qualifications|advantage)[\s:.-]*$/i, type: "preferred_skills" },
  { pattern: /^\s*(?:qualifications|about\s*you|who\s*you\s*are|what\s*we're\s*looking\s*for|what\s*we\s*are\s*looking\s*for)[\s:.-]*$/i, type: "qualifications" },
];

function extractSections(
  text: string,
  patterns: Array<{ pattern: RegExp; type: ChunkType }>,
  defaultType: ChunkType
): { sections: { content: string; type: ChunkType }[]; hasFoundHeader: boolean } {
  const lines = text.split(/\r?\n/);
  const sections: { content: string; type: ChunkType }[] = [];
  
  let currentContent: string[] = [];
  let currentType: ChunkType = defaultType;
  let hasFoundHeader = false;

  for (const line of lines) {
    let matchedType: ChunkType | null = null;
    
    // Check if line is a likely header
    if (line.trim().length > 0 && line.trim().length < 100) {
      for (const { pattern, type } of patterns) {
        if (pattern.test(line)) {
          matchedType = type;
          break;
        }
      }
    }

    if (matchedType) {
      if (currentContent.length > 0) {
        const content = currentContent.join("\n").trim();
        if (content) {
          sections.push({ content, type: currentType });
        }
      }
      // Start a new section, including the header for context
      currentContent = [line];
      currentType = matchedType;
      hasFoundHeader = true;
    } else {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    const content = currentContent.join("\n").trim();
    if (content) {
      sections.push({ content, type: currentType });
    }
  }

  return { sections, hasFoundHeader };
}

export function fallbackChunk(text: string, chunkType: ChunkType): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const lines = text.split(/\r?\n/);
  
  let currentChunk = "";
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      currentChunk += "\n";
      continue;
    }
    
    // Target chunk size ~500-1000. We flush if we exceed 800 chars and already have some substance.
    if (currentChunk.length + trimmed.length > 800 && currentChunk.trim().length > 300) {
      chunks.push({
        content: currentChunk.trim(),
        chunkType
      });
      currentChunk = trimmed;
    } else {
      currentChunk = currentChunk ? currentChunk + "\n" + trimmed : trimmed;
    }
  }
  
  if (currentChunk.trim().length >= 30) {
    chunks.push({
      content: currentChunk.trim(),
      chunkType
    });
  }
  
  return chunks;
}

export function chunkResumeText(text: string): DocumentChunk[] {
  if (!text || text.trim().length === 0) return [];
  
  const { sections, hasFoundHeader } = extractSections(text, RESUME_SECTION_PATTERNS, "summary");
  
  if (!hasFoundHeader) {
    return fallbackChunk(text, "general");
  }
  
  const finalChunks: DocumentChunk[] = [];
  
  for (const section of sections) {
    if (section.content.length > 1500) {
      finalChunks.push(...fallbackChunk(section.content, section.type));
    } else {
      if (section.content.length >= 30) {
        finalChunks.push({
          content: section.content,
          chunkType: section.type
        });
      }
    }
  }
  
  return finalChunks;
}

export function chunkJobDescription(text: string): DocumentChunk[] {
  if (!text || text.trim().length === 0) return [];
  
  const { sections, hasFoundHeader } = extractSections(text, JD_SECTION_PATTERNS, "general");
  
  if (!hasFoundHeader) {
    return fallbackChunk(text, "general");
  }
  
  const finalChunks: DocumentChunk[] = [];
  
  for (const section of sections) {
    if (section.content.length > 1500) {
      finalChunks.push(...fallbackChunk(section.content, section.type));
    } else {
      if (section.content.length >= 30) {
        finalChunks.push({
          content: section.content,
          chunkType: section.type
        });
      }
    }
  }
  
  return finalChunks;
}
