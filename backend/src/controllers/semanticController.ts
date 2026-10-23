import { Request, Response } from "express";
import { performSemanticMatch } from "../services/semanticMatchingService";
import { calculateFinalScore, calculateSkillMatchScore } from "../services/matchScoringService";
import { validateTextInputs } from "../middleware/apiProtection";

export async function semanticMatchController(req: Request, res: Response): Promise<void> {
  try {
    const { resumeText, jobDescription, llmAnalysis } = req.body;

    if (!validateTextInputs(resumeText, jobDescription, res)) {
      return;
    }

    // Perform semantic match
    const match = await performSemanticMatch({
      resumeText: resumeText.trim(),
      jobDescription: jobDescription.trim(),
    });

    // Calculate combined score
    const llmScore = typeof llmAnalysis?.matchScore === "number" ? llmAnalysis.matchScore : match.result.overallSemanticScore;
    const matchingSkills = Array.isArray(llmAnalysis?.matchingSkills) ? llmAnalysis.matchingSkills : [];
    const missingSkills = Array.isArray(llmAnalysis?.missingSkills) ? llmAnalysis.missingSkills : [];
    const skillScore = calculateSkillMatchScore(matchingSkills, missingSkills);

    const scoreBreakdown = calculateFinalScore(
      match.result.overallSemanticScore,
      llmScore,
      skillScore
    );

    res.status(200).json({
      semanticScore: match.result.overallSemanticScore,
      finalScore: scoreBreakdown.finalScore,
      scoreBreakdown,
      matchedRequirements: match.result.requirementMatches,
      unmatchedRequirements: match.result.unmatchedRequirements,
      evidence: match.evidence,
      resumeId: match.resumeId,
      jobDescriptionId: match.jobDescriptionId,
    });
  } catch (error) {
    console.error("[semanticController] Error:", error);
    const message = error instanceof Error ? error.message : "Semantic matching failed.";

    if (message.includes("API key")) {
      res.status(503).json({ error: message });
      return;
    }

    res.status(500).json({ error: message || "Failed to perform semantic match. Please try again." });
  }
}
