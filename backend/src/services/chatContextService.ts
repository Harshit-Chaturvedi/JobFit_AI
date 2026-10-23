import { AnalysisResult } from "../types/analysis";
import { CareerPlanResult } from "../types/careerPlan";

/**
 * Chat Context Service
 *
 * Builds a concise, structured context string from all available analysis data
 * to ground the Career Assistant's responses in the candidate's actual profile.
 */

interface SemanticSummary {
  semanticScore: number;
  matchedRequirements: Array<{ requirement: string; similarity: number }>;
  unmatchedRequirements: string[];
}

export interface ChatContext {
  systemPrompt: string;
  contextSummary: string;
}

export function buildChatContext(params: {
  resumeText: string;
  jobDescription: string;
  analysis?: AnalysisResult;
  semanticResult?: SemanticSummary;
  careerPlan?: CareerPlanResult;
}): ChatContext {
  const { resumeText, jobDescription, analysis, semanticResult, careerPlan } = params;

  const sections: string[] = [];

  // ── Resume summary (truncated to key content) ──
  const resumeTruncated = resumeText.length > 3000
    ? resumeText.slice(0, 3000) + "\n[... resume truncated for brevity ...]"
    : resumeText;
  sections.push(`=== CANDIDATE RESUME ===\n${resumeTruncated}`);

  // ── Job description summary ──
  const jdTruncated = jobDescription.length > 2000
    ? jobDescription.slice(0, 2000) + "\n[... job description truncated for brevity ...]"
    : jobDescription;
  sections.push(`=== JOB DESCRIPTION ===\n${jdTruncated}`);

  // ── LLM match analysis ──
  if (analysis) {
    sections.push(`=== MATCH ANALYSIS ===
Match Score: ${analysis.matchScore}%
Summary: ${analysis.summary}
Matching Skills: ${analysis.matchingSkills.join(", ") || "None identified"}
Missing Skills: ${analysis.missingSkills.join(", ") || "None identified"}
Matching Experience: ${analysis.matchingExperience.join("; ") || "None identified"}
Missing Requirements: ${analysis.missingRequirements.join("; ") || "None identified"}
Strengths: ${analysis.strengths.join("; ") || "None identified"}
Suggested Improvements: ${analysis.improvements.join("; ") || "None identified"}`);
  }

  // ── Semantic matching results ──
  if (semanticResult) {
    const matched = semanticResult.matchedRequirements
      .map((m) => `  - ${m.requirement} (${Math.round(m.similarity * 100)}% semantic match)`)
      .join("\n");
    const unmatched = semanticResult.unmatchedRequirements
      .map((r) => `  - ${r}`)
      .join("\n");

    sections.push(`=== SEMANTIC VECTOR MATCHING ===
Semantic Score: ${semanticResult.semanticScore}%
Requirements with strong resume evidence:
${matched || "  None"}
Requirements without strong resume evidence:
${unmatched || "  None"}`);
  }

  // ── Career plan (if generated) ──
  if (careerPlan) {
    const missingSkills = careerPlan.missingSkillsAnalysis
      .map((s) => `  - ${s.skillName} [${s.importance}]: ${s.recommendation}`)
      .join("\n");

    const projects = careerPlan.projectRecommendations
      .map((p) => `  - ${p.title} (${p.difficulty}, ~${p.estimatedTime}): ${p.description}`)
      .join("\n");

    const mustLearn = careerPlan.learningRoadmap.mustLearn
      .map((i) => `  ${i.suggestedOrder}. ${i.topic}: ${i.reason}`)
      .join("\n");
    const shouldLearn = careerPlan.learningRoadmap.shouldLearn
      .map((i) => `  ${i.suggestedOrder}. ${i.topic}: ${i.reason}`)
      .join("\n");

    const resumeImprovements = [
      careerPlan.resumeImprovement.skillsToHighlight.length > 0
        ? `Skills to highlight: ${careerPlan.resumeImprovement.skillsToHighlight.join(", ")}`
        : "",
      careerPlan.resumeImprovement.sectionsToImprove.length > 0
        ? `Sections to improve: ${careerPlan.resumeImprovement.sectionsToImprove.join("; ")}`
        : "",
      careerPlan.resumeImprovement.projectDescriptionSuggestions.length > 0
        ? `Project description tips: ${careerPlan.resumeImprovement.projectDescriptionSuggestions.join("; ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    sections.push(`=== CANDIDATE IMPROVEMENT PLAN ===
Overview: ${careerPlan.candidateSummary.overviewStatement}
Top Strength: ${careerPlan.candidateSummary.topStrength}
Biggest Gap: ${careerPlan.candidateSummary.biggestGap}
Recommended Next Step: ${careerPlan.candidateSummary.recommendedNextStep}

Missing Skills Analysis:
${missingSkills || "  None"}

Resume Improvement Suggestions:
${resumeImprovements || "  None"}

Recommended Projects:
${projects || "  None"}

Learning Roadmap — Must Learn:
${mustLearn || "  None"}
Learning Roadmap — Should Learn:
${shouldLearn || "  None"}`);
  }

  const contextSummary = sections.join("\n\n");

  const systemPrompt = `You are the JobFit AI Career Assistant — a specialized advisor that helps candidates understand their fit for a specific job role.

GROUNDING RULES (CRITICAL):
1. You have access to the candidate's ACTUAL resume, the SPECIFIC job description they are targeting, and all analysis results. Use ONLY this information.
2. NEVER invent or fabricate skills, experience, companies, projects, certifications, education, or job requirements that are not present in the provided data.
3. If information is not available in the resume or job description, say: "I don't see that information in your resume or this job description."
4. Clearly distinguish between what the candidate ALREADY HAS (from resume) and what is RECOMMENDED (from analysis).
5. When suggesting resume improvements, NEVER add technologies or achievements that aren't supported by the resume. Instead, suggest how to better present existing experience.
6. All answers must be specific to THIS role and THIS candidate — no generic career advice.

CAPABILITIES:
- Explain match scores and why they are what they are
- Identify which missing skills matter most for this specific role
- Advise on learning priorities based on the job requirements
- Suggest resume improvements grounded in actual experience
- Recommend projects that address real skill gaps
- Help the candidate decide if they are ready to apply
- Compare skills and help prioritize learning paths

STYLE:
- Be concise and direct
- Use bullet points for lists
- Reference specific skills, requirements, and resume content
- Be encouraging but honest about gaps`;

  return { systemPrompt, contextSummary };
}
