import { Request, Response } from "express";
import { generateCareerPlan } from "../services/careerPlanService";
import { CareerPlanRequest } from "../types/careerPlan";
import { AnalysisResult } from "../types/analysis";
import { validateTextInputs } from "../middleware/apiProtection";
import { isTransientGeminiError } from "../services/geminiRequest";

export async function careerPlanController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { resumeText, jobDescription, analysis } = req.body as CareerPlanRequest;

    if (!validateTextInputs(resumeText, jobDescription, res)) {
      return;
    }

    if (!analysis || typeof analysis !== "object") {
      res.status(400).json({ error: "Analysis result is required." });
      return;
    }

    // Validate analysis has expected fields
    const requiredFields: (keyof AnalysisResult)[] = [
      "matchScore", "summary", "matchingSkills", "missingSkills",
      "matchingExperience", "missingRequirements", "strengths", "improvements"
    ];
    
    for (const field of requiredFields) {
      if (analysis[field] === undefined) {
        res.status(400).json({ error: `Analysis is missing required field: ${field}` });
        return;
      }
    }

    const result = await generateCareerPlan(
      resumeText.trim(),
      jobDescription.trim(),
      analysis
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error("[careerPlanController] Error:", error);

    const message = error instanceof Error ? error.message : "Career plan generation failed.";

    const upstreamStatus = (error as { status?: number })?.status;
    if ([429, 500, 502, 503, 504].includes(upstreamStatus || 0)) {
      res.status(503).json({
        error: "The career plan service is temporarily busy. Please try again in a moment.",
      });
      return;
    }
    if (message.includes("API key")) {
      res.status(503).json({ error: message });
      return;
    }

    res.status(500).json({
      error: "Failed to generate career plan. Please try again.",
    });
  }
}
