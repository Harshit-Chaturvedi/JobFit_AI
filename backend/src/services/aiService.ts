import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env";
import { AnalysisResult } from "../types/analysis";

const ANALYSIS_PROMPT = `You are an expert career advisor and resume analyst. Analyze the following resume against the job description.

IMPORTANT RULES:
- ONLY use information actually present in the resume. Do NOT invent skills, experience, education, projects, or certifications.
- If the resume lacks something the job requires, explicitly list it as missing.
- Be honest and precise. Do not fabricate or assume anything.
- The matchScore should be a realistic percentage (0-100) based on how well the resume matches the job description.

Resume Text:
---
{resumeText}
---

Job Description:
---
{jobDescription}
---

Respond with ONLY a valid JSON object (no markdown, no code fences) in this exact format:
{
  "matchScore": <number 0-100>,
  "summary": "<2-3 sentence summary of the overall fit>",
  "matchingSkills": ["<skills from resume that match the job>"],
  "missingSkills": ["<skills required by job but not found in resume>"],
  "matchingExperience": ["<experience from resume relevant to the job>"],
  "missingRequirements": ["<job requirements not evidenced in resume>"],
  "strengths": ["<candidate strengths for this role based on resume>"],
  "improvements": ["<specific suggestions to improve fit for this role>"]
}`;

export async function analyzeMatch(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const apiKey = config.geminiApiKey;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Please set it in your .env file."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = ANALYSIS_PROMPT
    .replace("{resumeText}", resumeText)
    .replace("{jobDescription}", jobDescription);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Clean the response - remove markdown code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed: AnalysisResult = JSON.parse(cleaned);

    // Validate the structure
    if (
      typeof parsed.matchScore !== "number" ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.matchingSkills) ||
      !Array.isArray(parsed.missingSkills) ||
      !Array.isArray(parsed.matchingExperience) ||
      !Array.isArray(parsed.missingRequirements) ||
      !Array.isArray(parsed.strengths) ||
      !Array.isArray(parsed.improvements)
    ) {
      throw new Error("Invalid response structure from AI.");
    }

    // Clamp score
    parsed.matchScore = Math.max(0, Math.min(100, Math.round(parsed.matchScore)));

    return parsed;
  } catch (e) {
    throw new Error(
      `Failed to parse AI response: ${e instanceof Error ? e.message : "Unknown error"}`
    );
  }
}
