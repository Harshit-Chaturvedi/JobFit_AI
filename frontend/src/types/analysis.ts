export interface AnalysisResult {
  matchScore: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  matchingExperience: string[];
  missingRequirements: string[];
  strengths: string[];
  improvements: string[];
}

export interface ParseResult {
  text: string;
  pages: number;
  filename: string;
}

export interface ApiError {
  error: string;
}

export interface MissingSkillAnalysis {
  skillName: string;
  importance: 'High' | 'Medium' | 'Low';
  reason: string;
  learningDifficulty: 'Quick to learn' | 'Moderate effort' | 'Requires deep preparation';
  recommendation: string;
}

export interface ResumeImprovement {
  skillsToHighlight: string[];
  relevantProjects: string[];
  keywordsToMention: string[];
  sectionsToImprove: string[];
  projectDescriptionSuggestions: string[];
}

export interface ProjectRecommendation {
  title: string;
  problem: string;
  description: string;
  technologies: string[];
  skillsCovered: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
}

export interface LearningRoadmapItem {
  topic: string;
  reason: string;
  suggestedOrder: number;
}

export interface LearningRoadmap {
  mustLearn: LearningRoadmapItem[];
  shouldLearn: LearningRoadmapItem[];
  niceToHave: LearningRoadmapItem[];
}

export interface CandidateSummary {
  overviewStatement: string;
  currentMatchScore: number;
  topStrength: string;
  biggestGap: string;
  recommendedNextStep: string;
}

export interface CareerPlanResult {
  candidateSummary: CandidateSummary;
  missingSkillsAnalysis: MissingSkillAnalysis[];
  resumeImprovement: ResumeImprovement;
  projectRecommendations: ProjectRecommendation[];
  learningRoadmap: LearningRoadmap;
}

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

export interface RequirementMatch {
  requirement: string;
  matchedContent: string;
  similarity: number;
  chunkType: ChunkType;
}

export interface EvidenceItem {
  requirement: string;
  resumeExcerpt: string;
  similarity: number;
  sourceSection: ChunkType;
}

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

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSource {
  type: "resume" | "job_description" | "analysis" | "semantic" | "career_plan";
  content: string;
}

export interface ChatResponse {
  message: string;
  sources: ChatSource[];
}

export interface ResumeTailorResult {
  headline: string;
  professionalSummary: string;
  skillsToPrioritize: string[];
  bulletSuggestions: Array<{ originalFocus: string; suggestion: string }>;
  atsKeywords: string[];
  warnings: string[];
}

export interface SavedAnalysis {
  id: string;
  createdAt: string;
  label: string;
  jobDescription: string;
  result: AnalysisResult;
  careerPlan?: CareerPlanResult | null;
}

