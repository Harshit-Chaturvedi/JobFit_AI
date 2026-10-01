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
