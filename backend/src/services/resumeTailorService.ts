import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env";
import { ResumeTailorResult } from "../types/tailor";

const prompt = `You are an expert resume editor. Tailor recommendations for a candidate applying to a job.
Use only facts found in the resume. Never invent an employer, degree, project, metric, responsibility, or skill.
Return JSON only with this schema:
{
  "headline":"string",
  "professionalSummary":"string",
  "skillsToPrioritize":["string"],
  "bulletSuggestions":[{"originalFocus":"string","suggestion":"string"}],
  "atsKeywords":["string"],
  "warnings":["string"]
}`;

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 12) : [];
}

export function normalizeTailorResult(value: unknown): ResumeTailorResult {
  const data = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const bullets = Array.isArray(data.bulletSuggestions) ? data.bulletSuggestions : [];
  return {
    headline: typeof data.headline === "string" ? data.headline : "",
    professionalSummary: typeof data.professionalSummary === "string" ? data.professionalSummary : "",
    skillsToPrioritize: strings(data.skillsToPrioritize),
    bulletSuggestions: bullets
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item) => ({
        originalFocus: typeof item.originalFocus === "string" ? item.originalFocus : "",
        suggestion: typeof item.suggestion === "string" ? item.suggestion : "",
      }))
      .filter((item) => item.suggestion)
      .slice(0, 8),
    atsKeywords: strings(data.atsKeywords),
    warnings: strings(data.warnings),
  };
}

export async function tailorResume(resumeText: string, jobDescription: string): Promise<ResumeTailorResult> {
  if (!config.geminiApiKey) throw new Error("Gemini API key is not configured.");
  const model = new GoogleGenerativeAI(config.geminiApiKey).getGenerativeModel({ model: "gemini-2.0-flash" });
  const response = await model.generateContent(`${prompt}\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`);
  const cleaned = response.response.text().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return normalizeTailorResult(JSON.parse(cleaned));
  } catch {
    throw new Error("Failed to generate a valid tailored resume response.");
  }
}
