// ────────────────────────── Semantic Matching Types ──────────────────────────

export type ChunkType =
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "responsibilities"
  | "required_skills"
  | "preferred_skills"
  | "qualifications"
  | "general";

export interface DocumentChunk {
  id?: string;
  resumeId?: string;
  jobDescriptionId?: string;
  content: string;
  chunkType: ChunkType;
  embedding?: number[];
  createdAt?: Date;
}

export interface ResumeRecord {
  id?: string;
  filename: string;
  extractedText: string;
  createdAt?: Date;
}

export interface JobDescriptionRecord {
  id?: string;
  title: string;
  description: string;
  createdAt?: Date;
}

export interface AnalysisRecord {
  id?: string;
  resumeId: string;
  jobDescriptionId: string;
  matchScore: number;
  analysisJson: object;
  createdAt?: Date;
}

// ────────────────────────── Semantic Matching Results ────────────────────────

export interface RequirementMatch {
  requirement: string;
  matchedContent: string;
  similarity: number;
  chunkType: ChunkType;
}

export interface SemanticMatchResult {
  overallSemanticScore: number;
  requirementMatches: RequirementMatch[];
  unmatchedRequirements: string[];
}

// ────────────────────────── Combined Score ───────────────────────────────────

export interface ScoreBreakdown {
  semanticScore: number;
  llmScore: number;
  skillMatchScore: number;
  finalScore: number;
  weights: {
    semantic: number;
    llm: number;
    skillMatch: number;
  };
}

export interface SemanticMatchResponse {
  semanticScore: number;
  finalScore: number;
  scoreBreakdown: ScoreBreakdown;
  matchedRequirements: RequirementMatch[];
  unmatchedRequirements: string[];
  evidence: EvidenceItem[];
  resumeId: string;
  jobDescriptionId: string;
}

export interface EvidenceItem {
  requirement: string;
  resumeExcerpt: string;
  similarity: number;
  sourceSection: ChunkType;
}

// ────────────────────────── API Request ──────────────────────────────────────

export interface SemanticMatchRequest {
  resumeText: string;
  jobDescription: string;
  jobTitle?: string;
  llmAnalysis?: import("./analysis").AnalysisResult;
}
