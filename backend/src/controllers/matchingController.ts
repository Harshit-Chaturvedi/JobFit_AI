import { Request, Response } from "express";
import { analyzeMatch } from "../services/aiService";
import { AnalyzeRequest } from "../types/analysis";
import { validateTextInputs } from "../middleware/apiProtection";

export async function analyzeMatchController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { resumeText, jobDescription } = req.body as AnalyzeRequest;

    if (!validateTextInputs(resumeText, jobDescription, res)) {
      return;
    }

    const result = await analyzeMatch(resumeText.trim(), jobDescription.trim());
    res.status(200).json(result);
  } catch (error) {
    console.error("[matchingController] Analysis error:", error);

    const message =
      error instanceof Error ? error.message : "Analysis failed.";

    // Check if it's a configuration error
    if (message.includes("GEMINI_API_KEY")) {
      res.status(503).json({ error: message });
      return;
    }

    res.status(500).json({
      error: "Failed to analyze the resume. Please try again.",
    });
  }
}
