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

export interface AnalyzeRequest {
  resumeText: string;
  jobDescription: string;
}
