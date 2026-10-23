export interface ResumeTailorResult {
  headline: string;
  professionalSummary: string;
  skillsToPrioritize: string[];
  bulletSuggestions: Array<{ originalFocus: string; suggestion: string }>;
  atsKeywords: string[];
  warnings: string[];
}
