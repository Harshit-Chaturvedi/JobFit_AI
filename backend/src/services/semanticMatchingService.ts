import { DocumentChunk, RequirementMatch, SemanticMatchResult, EvidenceItem } from "../types/semantic";
import { generateEmbeddings, cosineSimilarity, isEmbeddingServiceAvailable } from "./embeddingService";
import { chunkResumeText, chunkJobDescription } from "./chunkingService";
import * as databaseService from "./databaseService";

// Threshold above which a requirement is considered matched by semantic similarity
export const SIMILARITY_THRESHOLD = 0.58;

/**
 * Extract distinct requirement phrases or bullet points from job description chunks.
 */
export function extractRequirementsFromChunks(jdChunks: DocumentChunk[]): string[] {
  const requirements: string[] = [];
  const reqChunks = jdChunks.filter(
    (c) =>
      c.chunkType === "required_skills" ||
      c.chunkType === "preferred_skills" ||
      c.chunkType === "qualifications" ||
      c.chunkType === "responsibilities"
  );

  const targetChunks = reqChunks.length > 0 ? reqChunks : jdChunks;

  for (const chunk of targetChunks) {
    const lines = chunk.content.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.replace(/^[\s*•\-–—\d.)]+/, "").trim();
      // Only keep meaningful requirement sentences / phrases
      if (trimmed.length >= 15 && trimmed.length <= 250 && !/^(responsibilities|requirements|qualifications|duties):?$/i.test(trimmed)) {
        requirements.push(trimmed);
      }
    }
  }

  // Deduplicate and limit to top 15 most distinctive requirements
  const unique = Array.from(new Set(requirements));
  return unique.length > 0 ? unique.slice(0, 15) : targetChunks.map((c) => c.content.slice(0, 150));
}

/**
 * Perform semantic matching between resume chunks and job description chunks.
 * Uses PostgreSQL/pgvector if available; falls back to in-memory cosine similarity.
 */
export async function performSemanticMatch(params: {
  resumeText: string;
  jobDescription: string;
  resumeId?: string;
  jobDescriptionId?: string;
}): Promise<{
  result: SemanticMatchResult;
  evidence: EvidenceItem[];
  resumeId: string;
  jobDescriptionId: string;
}> {
  const { resumeText, jobDescription } = params;

  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text cannot be empty.");
  }
  if (!jobDescription || !jobDescription.trim()) {
    throw new Error("Job description cannot be empty.");
  }

  if (!isEmbeddingServiceAvailable()) {
    throw new Error("Embedding service is not available (Gemini API key missing).");
  }

  const isDbReady = await databaseService.isDatabaseAvailable();
  let resumeId = params.resumeId || "";
  let jobDescriptionId = params.jobDescriptionId || "";

  // 1. Chunk documents
  const resumeChunks = chunkResumeText(resumeText);
  const jdChunks = chunkJobDescription(jobDescription);

  if (resumeChunks.length === 0) {
    throw new Error("Could not extract meaningful sections from resume.");
  }
  if (jdChunks.length === 0) {
    throw new Error("Could not extract meaningful sections from job description.");
  }

  // 2. Persist records and reuse or generate embeddings
  let resumeChunksWithEmbeddings: DocumentChunk[] = [];
  let jdChunksWithEmbeddings: DocumentChunk[] = [];

  if (isDbReady) {
    try {
      // Save / fetch resume
      if (!resumeId) {
        resumeId = await databaseService.saveResume("uploaded_resume.pdf", resumeText);
      }
      const existingResumeChunks = await databaseService.getChunksByResumeId(resumeId);
      if (existingResumeChunks.length > 0 && existingResumeChunks.some((c) => c.embedding && c.embedding.length > 0)) {
        resumeChunksWithEmbeddings = existingResumeChunks;
      } else {
        // Generate embeddings for resume chunks
        const embeddings = await generateEmbeddings(resumeChunks.map((c) => c.content));
        resumeChunks.forEach((c, i) => {
          c.resumeId = resumeId;
          c.embedding = embeddings[i] || [];
        });
        await databaseService.saveChunks(
          resumeChunks.map((c) => ({
            resumeId,
            content: c.content,
            chunkType: c.chunkType,
            embedding: c.embedding,
          }))
        );
        resumeChunksWithEmbeddings = resumeChunks;
      }

      // Save / fetch job description
      if (!jobDescriptionId) {
        jobDescriptionId = await databaseService.saveJobDescription("Job Description", jobDescription);
      }
      const existingJdChunks = await databaseService.getChunksByJobDescriptionId(jobDescriptionId);
      if (existingJdChunks.length > 0 && existingJdChunks.some((c) => c.embedding && c.embedding.length > 0)) {
        jdChunksWithEmbeddings = existingJdChunks;
      } else {
        const embeddings = await generateEmbeddings(jdChunks.map((c) => c.content));
        jdChunks.forEach((c, i) => {
          c.jobDescriptionId = jobDescriptionId;
          c.embedding = embeddings[i] || [];
        });
        await databaseService.saveChunks(
          jdChunks.map((c) => ({
            jobDescriptionId,
            content: c.content,
            chunkType: c.chunkType,
            embedding: c.embedding,
          }))
        );
        jdChunksWithEmbeddings = jdChunks;
      }
    } catch (dbErr) {
      console.warn("[semanticMatchingService] Database operation failed, falling back to in-memory matching:", dbErr);
      resumeChunksWithEmbeddings = [];
      jdChunksWithEmbeddings = [];
    }
  }

  // In-memory fallback if DB was not ready or DB storage failed
  if (resumeChunksWithEmbeddings.length === 0) {
    const resumeEmbeddings = await generateEmbeddings(resumeChunks.map((c) => c.content));
    resumeChunks.forEach((c, i) => {
      c.embedding = resumeEmbeddings[i] || [];
    });
    resumeChunksWithEmbeddings = resumeChunks;
  }

  if (jdChunksWithEmbeddings.length === 0) {
    const jdEmbeddings = await generateEmbeddings(jdChunks.map((c) => c.content));
    jdChunks.forEach((c, i) => {
      c.embedding = jdEmbeddings[i] || [];
    });
    jdChunksWithEmbeddings = jdChunks;
  }

  // 3. Extract requirements and compare with resume chunks
  const requirements = extractRequirementsFromChunks(jdChunks);
  const requirementEmbeddings = await generateEmbeddings(requirements);

  const requirementMatches: RequirementMatch[] = [];
  const unmatchedRequirements: string[] = [];
  const evidenceList: EvidenceItem[] = [];
  const similarities: number[] = [];

  for (let i = 0; i < requirements.length; i++) {
    const reqText = requirements[i];
    const reqEmb = requirementEmbeddings[i];

    if (!reqEmb || reqEmb.length === 0) {
      unmatchedRequirements.push(reqText);
      continue;
    }

    let bestSimilarity = -1;
    let bestChunk: DocumentChunk | null = null;

    // Compare against resume chunks with embeddings
    for (const rChunk of resumeChunksWithEmbeddings) {
      if (!rChunk.embedding || rChunk.embedding.length === 0) continue;
      const sim = cosineSimilarity(reqEmb, rChunk.embedding);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        bestChunk = rChunk;
      }
    }

    if (bestSimilarity >= SIMILARITY_THRESHOLD && bestChunk) {
      const matchItem: RequirementMatch = {
        requirement: reqText,
        matchedContent: bestChunk.content,
        similarity: parseFloat(bestSimilarity.toFixed(2)),
        chunkType: bestChunk.chunkType,
      };
      requirementMatches.push(matchItem);
      similarities.push(bestSimilarity);

      evidenceList.push({
        requirement: reqText,
        resumeExcerpt: bestChunk.content.slice(0, 300) + (bestChunk.content.length > 300 ? "..." : ""),
        similarity: parseFloat(bestSimilarity.toFixed(2)),
        sourceSection: bestChunk.chunkType,
      });
    } else {
      unmatchedRequirements.push(reqText);
      if (bestSimilarity > 0) {
        similarities.push(bestSimilarity * 0.5); // partial penalty for unmatched
      }
    }
  }

  // Calculate overall semantic score (0-100)
  let overallScore = 0;
  if (similarities.length > 0) {
    const avg = similarities.reduce((a, b) => a + b, 0) / similarities.length;
    overallScore = Math.max(0, Math.min(100, Math.round(avg * 100)));
  }

  return {
    result: {
      overallSemanticScore: overallScore,
      requirementMatches,
      unmatchedRequirements,
    },
    evidence: evidenceList,
    resumeId: resumeId || "in-memory",
    jobDescriptionId: jobDescriptionId || "in-memory",
  };
}
