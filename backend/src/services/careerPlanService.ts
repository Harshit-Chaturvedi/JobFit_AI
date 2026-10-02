import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env";
import { CareerPlanResult } from "../types/careerPlan";
import { AnalysisResult } from "../types/analysis";

const CAREER_PLAN_PROMPT = `
You are an expert technical recruiter and career coach. Your task is to analyze a candidate's resume against a job description and their current matching analysis to produce a targeted, practical Career Improvement Plan.

RULES:
1. Use the resume as the source of truth for the candidate's experience.
2. Use the job description as the source of truth for requirements.
3. Use the provided analysis results to understand the current match.
4. Clearly distinguish between existing skills and recommended skills.
5. NEVER fabricate candidate experience.
6. Give recommendations specific to the target role.
7. Prefer practical, actionable recommendations over generic career advice.
8. Output ONLY valid JSON matching the exact schema below, with no markdown fences, no preamble, and no postscript.

EXPECTED JSON SCHEMA:
{
  "candidateSummary": {
    "overviewStatement": "string",
    "currentMatchScore": "number (0-100)",
    "topStrength": "string",
    "biggestGap": "string",
    "recommendedNextStep": "string"
  },
  "missingSkillsAnalysis": [
    {
      "skillName": "string",
      "importance": "High" | "Medium" | "Low",
      "reason": "string",
      "learningDifficulty": "Quick to learn" | "Moderate effort" | "Requires deep preparation",
      "recommendation": "string"
    }
  ],
  "resumeImprovement": {
    "skillsToHighlight": ["string"],
    "relevantProjects": ["string"],
    "keywordsToMention": ["string"],
    "sectionsToImprove": ["string"],
    "projectDescriptionSuggestions": ["string"]
  },
  "projectRecommendations": [
    {
      "title": "string",
      "problem": "string",
      "description": "string",
      "technologies": ["string"],
      "skillsCovered": ["string"],
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "estimatedTime": "string"
    }
  ],
  "learningRoadmap": {
    "mustLearn": [
      {
        "topic": "string",
        "reason": "string",
        "suggestedOrder": "number"
      }
    ],
    "shouldLearn": [
      {
        "topic": "string",
        "reason": "string",
        "suggestedOrder": "number"
      }
    ],
    "niceToHave": [
      {
        "topic": "string",
        "reason": "string",
        "suggestedOrder": "number"
      }
    ]
  }
}
`;

function cleanJsonResponse(response: string): string {
  return response
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export function validateCareerPlanResult(data: any): CareerPlanResult {
  const result: any = {};
  
  // candidateSummary
  result.candidateSummary = {
    overviewStatement: data?.candidateSummary?.overviewStatement || "",
    currentMatchScore: typeof data?.candidateSummary?.currentMatchScore === 'number' ? data.candidateSummary.currentMatchScore : 0,
    topStrength: data?.candidateSummary?.topStrength || "",
    biggestGap: data?.candidateSummary?.biggestGap || "",
    recommendedNextStep: data?.candidateSummary?.recommendedNextStep || ""
  };
  
  // missingSkillsAnalysis
  result.missingSkillsAnalysis = Array.isArray(data?.missingSkillsAnalysis) 
    ? data.missingSkillsAnalysis.map((item: any) => ({
        skillName: item?.skillName || "",
        importance: ['High', 'Medium', 'Low'].includes(item?.importance) ? item.importance : 'Medium',
        reason: item?.reason || "",
        learningDifficulty: ['Quick to learn', 'Moderate effort', 'Requires deep preparation'].includes(item?.learningDifficulty) ? item.learningDifficulty : 'Moderate effort',
        recommendation: item?.recommendation || ""
      }))
    : [];

  // resumeImprovement
  result.resumeImprovement = {
    skillsToHighlight: Array.isArray(data?.resumeImprovement?.skillsToHighlight) ? data.resumeImprovement.skillsToHighlight : [],
    relevantProjects: Array.isArray(data?.resumeImprovement?.relevantProjects) ? data.resumeImprovement.relevantProjects : [],
    keywordsToMention: Array.isArray(data?.resumeImprovement?.keywordsToMention) ? data.resumeImprovement.keywordsToMention : [],
    sectionsToImprove: Array.isArray(data?.resumeImprovement?.sectionsToImprove) ? data.resumeImprovement.sectionsToImprove : [],
    projectDescriptionSuggestions: Array.isArray(data?.resumeImprovement?.projectDescriptionSuggestions) ? data.resumeImprovement.projectDescriptionSuggestions : []
  };

  // projectRecommendations
  result.projectRecommendations = Array.isArray(data?.projectRecommendations)
    ? data.projectRecommendations.map((item: any) => ({
        title: item?.title || "",
        problem: item?.problem || "",
        description: item?.description || "",
        technologies: Array.isArray(item?.technologies) ? item.technologies : [],
        skillsCovered: Array.isArray(item?.skillsCovered) ? item.skillsCovered : [],
        difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(item?.difficulty) ? item.difficulty : 'Intermediate',
        estimatedTime: item?.estimatedTime || ""
      }))
    : [];

  // learningRoadmap
  const parseRoadmapItems = (items: any) => {
    return Array.isArray(items) ? items.map((item: any) => ({
      topic: item?.topic || "",
      reason: item?.reason || "",
      suggestedOrder: typeof item?.suggestedOrder === 'number' ? item.suggestedOrder : 0
    })) : [];
  };

  result.learningRoadmap = {
    mustLearn: parseRoadmapItems(data?.learningRoadmap?.mustLearn),
    shouldLearn: parseRoadmapItems(data?.learningRoadmap?.shouldLearn),
    niceToHave: parseRoadmapItems(data?.learningRoadmap?.niceToHave)
  };

  return result as CareerPlanResult;
}

export async function generateCareerPlan(
  resumeText: string,
  jobDescription: string,
  analysis: AnalysisResult
): Promise<CareerPlanResult> {
  if (!config.geminiApiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const fullPrompt = `${CAREER_PLAN_PROMPT}

--- INPUT DATA ---

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

CURRENT MATCHING ANALYSIS:
${JSON.stringify(analysis, null, 2)}
`;

  const result = await model.generateContent(fullPrompt);
  const responseText = result.response.text();
  
  const cleanedJson = cleanJsonResponse(responseText);
  
  try {
    const parsedData = JSON.parse(cleanedJson);
    return validateCareerPlanResult(parsedData);
  } catch (error) {
    console.error("Failed to parse Gemini response as JSON", error);
    throw new Error("Failed to generate valid career plan.");
  }
}
