import { Request, Response } from "express";
import { validateTextInputs } from "../middleware/apiProtection";
import { tailorResume } from "../services/resumeTailorService";
import { isTransientGeminiError } from "../services/geminiRequest";

export async function tailorResumeController(req: Request, res: Response): Promise<void> {
  const { resumeText, jobDescription } = req.body;
  if (!validateTextInputs(resumeText, jobDescription, res)) return;
  try {
    res.status(200).json(await tailorResume(resumeText.trim(), jobDescription.trim()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Resume tailoring failed.";
    if (isTransientGeminiError(error)) {
      res.status(503).json({ error: "Resume tailoring is temporarily busy. Please try again in a moment." });
      return;
    }    res.status(message.includes("API key") ? 503 : 500).json({ error: message });
  }
}
