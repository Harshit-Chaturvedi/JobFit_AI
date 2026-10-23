/**
 * Career Chat Feature Tests
 *
 * Run with: npx ts-node src/tests/careerChat.test.ts
 * From the backend/ directory
 */

import { buildChatContext } from "../services/chatContextService";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.log(`  ❌ ${message}`);
    failed++;
  }
}

function test(name: string, fn: () => void) {
  console.log(`\n🧪 ${name}`);
  try {
    fn();
  } catch (e) {
    console.log(`  ❌ THREW: ${e instanceof Error ? e.message : String(e)}`);
    failed++;
  }
}

const SAMPLE_RESUME = `
SUMMARY
Experienced backend developer with 4 years of Node.js and Python experience.

SKILLS
Node.js, Express, Python, PostgreSQL, MongoDB, Git, REST APIs

EXPERIENCE
Backend Engineer | Acme Corp (2021 - Present)
- Designed REST APIs serving 10k requests/minute using Node.js and Express.
- Managed PostgreSQL databases with complex query optimization.

Junior Developer | StartupX (2019 - 2021)
- Built internal tools using Python and Flask.

EDUCATION
B.S. Computer Science, State University, 2019
`;

const SAMPLE_JD = `
Senior Full Stack Engineer

RESPONSIBILITIES
- Build and maintain scalable web applications using React and Node.js
- Design database schemas and optimize SQL queries

REQUIRED SKILLS
- 3+ years of React and TypeScript experience
- Strong Node.js and Express knowledge
- PostgreSQL proficiency
- Experience with CI/CD pipelines

PREFERRED
- Docker and Kubernetes experience
- GraphQL knowledge
`;

const SAMPLE_ANALYSIS = {
  matchScore: 62,
  summary: "Strong backend match but significant frontend gaps.",
  matchingSkills: ["Node.js", "Express", "PostgreSQL"],
  missingSkills: ["React", "TypeScript", "CI/CD", "Docker"],
  matchingExperience: ["Backend API development", "Database management"],
  missingRequirements: ["Frontend development experience", "TypeScript proficiency"],
  strengths: ["Strong backend skills", "Database optimization experience"],
  improvements: ["Learn React and TypeScript", "Add CI/CD to workflow"],
};

const SAMPLE_SEMANTIC = {
  semanticScore: 58,
  matchedRequirements: [
    { requirement: "Strong Node.js and Express knowledge", similarity: 0.89 },
    { requirement: "PostgreSQL proficiency", similarity: 0.82 },
  ],
  unmatchedRequirements: [
    "3+ years of React and TypeScript experience",
    "Experience with CI/CD pipelines",
  ],
};

const SAMPLE_CAREER_PLAN = {
  candidateSummary: {
    overviewStatement: "Strong backend developer with gaps in frontend technologies.",
    currentMatchScore: 62,
    topStrength: "Node.js and database skills",
    biggestGap: "No React or TypeScript experience",
    recommendedNextStep: "Learn React fundamentals and TypeScript basics.",
  },
  missingSkillsAnalysis: [
    {
      skillName: "React",
      importance: "High" as const,
      reason: "Core frontend framework for the role.",
      learningDifficulty: "Moderate effort" as const,
      recommendation: "Complete a React course and build a project.",
    },
    {
      skillName: "TypeScript",
      importance: "High" as const,
      reason: "Required for all code in this role.",
      learningDifficulty: "Quick to learn" as const,
      recommendation: "Transition existing JavaScript knowledge to TypeScript.",
    },
  ],
  resumeImprovement: {
    skillsToHighlight: ["Node.js", "PostgreSQL", "REST APIs"],
    relevantProjects: [],
    keywordsToMention: ["scalable", "microservices"],
    sectionsToImprove: ["Add metrics to project descriptions"],
    projectDescriptionSuggestions: ["Quantify API performance improvements at Acme Corp."],
  },
  projectRecommendations: [
    {
      title: "Full Stack Task Manager",
      problem: "No frontend project experience",
      description: "Build a task management app with React, TypeScript, and Node.js.",
      technologies: ["React", "TypeScript", "Node.js", "PostgreSQL"],
      skillsCovered: ["React", "TypeScript", "Full Stack"],
      difficulty: "Intermediate" as const,
      estimatedTime: "3-4 weeks",
    },
  ],
  learningRoadmap: {
    mustLearn: [
      { topic: "TypeScript", reason: "Required by the job", suggestedOrder: 1 },
      { topic: "React", reason: "Core frontend framework", suggestedOrder: 2 },
    ],
    shouldLearn: [
      { topic: "CI/CD", reason: "Expected for the role", suggestedOrder: 1 },
    ],
    niceToHave: [
      { topic: "Docker", reason: "Preferred qualification", suggestedOrder: 1 },
    ],
  },
};

// ── Test 1: Context building with full data ──

test("Context: Builds context with all analysis data", () => {
  const { systemPrompt, contextSummary } = buildChatContext({
    resumeText: SAMPLE_RESUME,
    jobDescription: SAMPLE_JD,
    analysis: SAMPLE_ANALYSIS,
    semanticResult: SAMPLE_SEMANTIC,
    careerPlan: SAMPLE_CAREER_PLAN,
  });

  assert(systemPrompt.includes("JobFit AI Career Assistant"), "System prompt identifies as Career Assistant");
  assert(systemPrompt.includes("NEVER invent"), "System prompt includes grounding rules");
  assert(systemPrompt.includes("NEVER add technologies"), "System prompt prevents resume fabrication");

  assert(contextSummary.includes("CANDIDATE RESUME"), "Context includes resume section");
  assert(contextSummary.includes("JOB DESCRIPTION"), "Context includes JD section");
  assert(contextSummary.includes("MATCH ANALYSIS"), "Context includes match analysis");
  assert(contextSummary.includes("Match Score: 62%"), "Context includes match score");
  assert(contextSummary.includes("Node.js, Express, PostgreSQL"), "Context includes matching skills");
  assert(contextSummary.includes("React, TypeScript, CI/CD, Docker"), "Context includes missing skills");

  assert(contextSummary.includes("SEMANTIC VECTOR MATCHING"), "Context includes semantic results");
  assert(contextSummary.includes("89% semantic match"), "Context includes semantic similarity");
  assert(contextSummary.includes("3+ years of React"), "Context includes unmatched requirements");

  assert(contextSummary.includes("CANDIDATE IMPROVEMENT PLAN"), "Context includes career plan");
  assert(contextSummary.includes("React"), "Context includes missing skill details");
  assert(contextSummary.includes("Full Stack Task Manager"), "Context includes project recommendations");
  assert(contextSummary.includes("Must Learn"), "Context includes learning roadmap");
});

// ── Test 2: Context building with minimal data ──

test("Context: Builds context with only resume and JD", () => {
  const { systemPrompt, contextSummary } = buildChatContext({
    resumeText: SAMPLE_RESUME,
    jobDescription: SAMPLE_JD,
  });

  assert(systemPrompt.length > 100, "System prompt generated");
  assert(contextSummary.includes("CANDIDATE RESUME"), "Context includes resume");
  assert(contextSummary.includes("JOB DESCRIPTION"), "Context includes JD");
  assert(!contextSummary.includes("MATCH ANALYSIS"), "Context omits analysis when not provided");
  assert(!contextSummary.includes("SEMANTIC VECTOR MATCHING"), "Context omits semantic when not provided");
  assert(!contextSummary.includes("CANDIDATE IMPROVEMENT PLAN"), "Context omits career plan when not provided");
});

// ── Test 3: Context with analysis but no semantic or career plan ──

test("Context: Builds context with analysis only (no semantic or career plan)", () => {
  const { contextSummary } = buildChatContext({
    resumeText: SAMPLE_RESUME,
    jobDescription: SAMPLE_JD,
    analysis: SAMPLE_ANALYSIS,
  });

  assert(contextSummary.includes("MATCH ANALYSIS"), "Context includes analysis");
  assert(contextSummary.includes("Strong backend match"), "Context includes analysis summary");
  assert(!contextSummary.includes("SEMANTIC VECTOR MATCHING"), "Context omits semantic");
  assert(!contextSummary.includes("CANDIDATE IMPROVEMENT PLAN"), "Context omits career plan");
});

// ── Test 4: Resume truncation for long resumes ──

test("Context: Truncates very long resumes", () => {
  const longResume = "A".repeat(5000);
  const { contextSummary } = buildChatContext({
    resumeText: longResume,
    jobDescription: SAMPLE_JD,
  });

  assert(contextSummary.includes("[... resume truncated for brevity ...]"), "Long resume is truncated");
  assert(contextSummary.length < longResume.length + 3000, "Context is shorter than raw resume");
});

// ── Test 5: Job description truncation ──

test("Context: Truncates very long job descriptions", () => {
  const longJd = "B".repeat(4000);
  const { contextSummary } = buildChatContext({
    resumeText: SAMPLE_RESUME,
    jobDescription: longJd,
  });

  assert(contextSummary.includes("[... job description truncated for brevity ...]"), "Long JD is truncated");
});

// ── Test 6: Grounding rules in system prompt ──

test("Context: System prompt contains all critical grounding rules", () => {
  const { systemPrompt } = buildChatContext({
    resumeText: SAMPLE_RESUME,
    jobDescription: SAMPLE_JD,
    analysis: SAMPLE_ANALYSIS,
  });

  assert(systemPrompt.includes("GROUNDING RULES"), "Contains grounding rules header");
  assert(systemPrompt.includes("NEVER invent or fabricate"), "Rule: no fabrication");
  assert(
    systemPrompt.includes("I don't see that information"),
    "Rule: fallback statement for missing info"
  );
  assert(systemPrompt.includes("ALREADY HAS"), "Rule: distinguish existing vs recommended");
  assert(systemPrompt.includes("no generic career advice"), "Rule: job-specific answers");
});

// ── Test 7: Empty skills handled gracefully ──

test("Context: Handles empty analysis arrays gracefully", () => {
  const emptyAnalysis = {
    matchScore: 0,
    summary: "",
    matchingSkills: [],
    missingSkills: [],
    matchingExperience: [],
    missingRequirements: [],
    strengths: [],
    improvements: [],
  };

  const { contextSummary } = buildChatContext({
    resumeText: SAMPLE_RESUME,
    jobDescription: SAMPLE_JD,
    analysis: emptyAnalysis,
  });

  assert(contextSummary.includes("None identified"), "Empty arrays show 'None identified'");
  assert(contextSummary.includes("Match Score: 0%"), "Zero score is shown");
});

// ── Test 8: Semantic result with empty matches ──

test("Context: Handles empty semantic matches", () => {
  const emptySemantic = {
    semanticScore: 0,
    matchedRequirements: [],
    unmatchedRequirements: [],
  };

  const { contextSummary } = buildChatContext({
    resumeText: SAMPLE_RESUME,
    jobDescription: SAMPLE_JD,
    semanticResult: emptySemantic,
  });

  assert(contextSummary.includes("Semantic Score: 0%"), "Zero semantic score shown");
  assert(contextSummary.includes("  None"), "Empty matched requirements show None");
});

// ── Summary ──

console.log(`\n${"═".repeat(50)}`);
console.log(`Tests complete: ${passed} passed, ${failed} failed`);
console.log(`${"═".repeat(50)}`);

if (failed > 0) {
  process.exit(1);
}
