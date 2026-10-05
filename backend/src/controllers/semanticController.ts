import { Request, Response } from "express";
import { performSemanticMatch } from "../services/semanticMatchingService";
import { calculateFinalScore, calculateSkillMatchScore } from "../services/matchScoringService";
import { isDatabaseAvailable, getPool } from "../services/databaseService";
import { AnalysisResult } from "../types/analysis";

export async function semanticMatchController(req: Request, res: Response): Promise<void> {
  try {
    let { resumeId, jobDescriptionId, resumeText, jobDescription, llmAnalysis } = req.body;

    // If IDs are provided but text isn't, try to fetch from PostgreSQL
    if ((!resumeText || !jobDescription) && resumeId && jobDescriptionId) {
      const dbReady = await isDatabaseAvailable();
      if (!dbReady) {
        res.status(400).json({
          error: "Database is unavailable. Please provide resumeText and jobDescription directly in the request body.",
        });
        return;
      }

      const pool = await getPool();
      const resumeRow = await pool.query("SELECT extracted_text FROM resumes WHERE id = $1", [resumeId]);
      if (resumeRow.rows.length === 0) {
        res.status(404).json({ error: `Resume with ID '${resumeId}' not found.` });
        return;
      }
      resumeText = resumeRow.rows[0].extracted_text;

      const jdRow = await pool.query("SELECT description FROM job_descriptions WHERE id = $1", [jobDescriptionId]);
      if (jdRow.rows.length === 0) {
        res.status(404).json({ error: `Job description with ID '${jobDescriptionId}' not found.` });
        return;
      }
      jobDescription = jdRow.rows[0].description;
    }

    if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
      res.status(400).json({ error: "resumeText or valid resumeId is required." });
      return;
    }

    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      res.status(400).json({ error: "jobDescription or valid jobDescriptionId is required." });
      return;
    }

    // Perform semantic match
    const match = await performSemanticMatch({
      resumeText: resumeText.trim(),
      jobDescription: jobDescription.trim(),
      resumeId,
      jobDescriptionId,
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
