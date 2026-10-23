// ────────────────────────── Chat Types ───────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatSource {
  type: "resume" | "job_description" | "analysis" | "semantic" | "career_plan";
  content: string;
}

export interface ChatRequest {
  resumeText: string;
  jobDescription: string;
  message: string;
  conversationHistory: ChatMessage[];
  analysis?: import("./analysis").AnalysisResult;
  semanticResult?: {
    semanticScore: number;
    matchedRequirements: Array<{ requirement: string; similarity: number }>;
    unmatchedRequirements: string[];
  };
  careerPlan?: import("./careerPlan").CareerPlanResult;
}

export interface ChatResponse {
  message: string;
  sources: ChatSource[];
}
