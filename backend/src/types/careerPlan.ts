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

export interface CareerPlanRequest {
  resumeText: string;
  jobDescription: string;
  analysis: import('./analysis').AnalysisResult;
}
