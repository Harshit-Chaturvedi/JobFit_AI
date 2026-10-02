import { Request, Response } from "express";
import { generateCareerPlan } from "../services/careerPlanService";
import { CareerPlanRequest } from "../types/careerPlan";
import { AnalysisResult } from "../types/analysis";

export async function careerPlanController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { resumeText, jobDescription, analysis } = req.body as CareerPlanRequest;

    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length === 0) {
      res.status(400).json({ error: "Resume text is required." });
      return;
    }

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length === 0) {
      res.status(400).json({ error: "Job description is required." });
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

    if (message.includes("API key")) {
      res.status(503).json({ error: message });
      return;
    }

    res.status(500).json({
      error: "Failed to generate career plan. Please try again.",
    });
  }
}
