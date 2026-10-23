import { Request, Response } from "express";
import { validateTextInputs } from "../middleware/apiProtection";
import { tailorResume } from "../services/resumeTailorService";

export async function tailorResumeController(req: Request, res: Response): Promise<void> {
  const { resumeText, jobDescription } = req.body;
  if (!validateTextInputs(resumeText, jobDescription, res)) return;
  try {
    res.status(200).json(await tailorResume(resumeText.trim(), jobDescription.trim()));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Resume tailoring failed.";
    res.status(message.includes("API key") ? 503 : 500).json({ error: message });
  }
}
