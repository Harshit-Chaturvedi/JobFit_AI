import { config } from "../config/env";
import { AnalysisResult } from "../types/analysis";
import { ScoreBreakdown } from "../types/semantic";

/**
 * Match Scoring Service
 *
 * Combines three signals into a single match score:
 *   1. Semantic similarity (embedding-based vector comparison)
 *   2. LLM analysis score (Gemini text analysis)
 *   3. Explicit skill match score (keyword overlap)
 *
 * Weights are configurable via environment variables:
 *   SCORE_WEIGHT_SEMANTIC (default 0.35)
 *   SCORE_WEIGHT_LLM     (default 0.45)
 *   SCORE_WEIGHT_SKILL    (default 0.20)
 *
 * The semantic score provides evidence of conceptual alignment.
 * The LLM score captures nuance that embeddings miss.
 * The skill match score anchors the result in explicit keyword presence.
 */

export function calculateSkillMatchScore(
  matchingSkills: string[],
  missingSkills: string[]
): number {
  const total = matchingSkills.length + missingSkills.length;
  if (total === 0) return 0;
  return Math.round((matchingSkills.length / total) * 100);
}

export function calculateFinalScore(
  semanticScore: number,
  llmScore: number,
  skillMatchScore: number
): ScoreBreakdown {
  const weights = config.scoreWeights;

  // Normalize weights to sum to 1.0 in case of config error
  const totalWeight = weights.semantic + weights.llm + weights.skillMatch;
  const normSemantic = weights.semantic / totalWeight;
  const normLlm = weights.llm / totalWeight;
  const normSkill = weights.skillMatch / totalWeight;

  const finalScore = Math.round(
    semanticScore * normSemantic +
    llmScore * normLlm +
    skillMatchScore * normSkill
  );

  return {
    semanticScore: Math.round(semanticScore),
    llmScore: Math.round(llmScore),
    skillMatchScore: Math.round(skillMatchScore),
    finalScore: Math.max(0, Math.min(100, finalScore)),
    weights: {
      semantic: normSemantic,
      llm: normLlm,
      skillMatch: normSkill,
    },
  };
}

/**
 * Calculate a combined score when only LLM analysis is available
 * (database/embeddings unavailable).
 */
export function calculateFallbackScore(
  analysis: AnalysisResult
): ScoreBreakdown {
  const skillScore = calculateSkillMatchScore(
    analysis.matchingSkills,
    analysis.missingSkills
  );

  return {
    semanticScore: 0,
    llmScore: analysis.matchScore,
    skillMatchScore: skillScore,
    finalScore: analysis.matchScore, // Use LLM score as-is when no semantic data
    weights: { semantic: 0, llm: 1, skillMatch: 0 },
  };
}
