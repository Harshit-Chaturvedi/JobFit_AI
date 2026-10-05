/**
 * Semantic Matching & Vector Search Feature Tests
 *
 * Run with: npx ts-node src/tests/semanticMatching.test.ts
 * From the backend/ directory
 */

import { chunkResumeText, chunkJobDescription, fallbackChunk } from "../services/chunkingService";
import { cosineSimilarity } from "../services/embeddingService";
import { calculateFinalScore, calculateSkillMatchScore, calculateFallbackScore } from "../services/matchScoringService";
import { extractRequirementsFromChunks, SIMILARITY_THRESHOLD } from "../services/semanticMatchingService";
import { DocumentChunk } from "../types/semantic";

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

function test(name: string, fn: () => void | Promise<void>) {
  console.log(`\n🧪 ${name}`);
  try {
    const res = fn();
    if (res instanceof Promise) {
      res.catch((e) => {
        console.log(`  ❌ ASYNC THREW: ${e instanceof Error ? e.message : String(e)}`);
        failed++;
      });
    }
  } catch (e) {
    console.log(`  ❌ THREW: ${e instanceof Error ? e.message : String(e)}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Text Chunking Tests
// ─────────────────────────────────────────────────────────────────────────────

test("Chunking: Resume text with distinct section headers", () => {
  const resumeText = `
SUMMARY
Experienced software engineer with 5+ years building web applications and APIs.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python
Frameworks: React, Node.js, Express, Next.js
Databases: PostgreSQL, Redis, MongoDB

EXPERIENCE
Senior Backend Engineer | Acme Corp (2022 - Present)
- Designed and built RESTful microservices in Node.js and TypeScript.
- Managed PostgreSQL database migrations and queries for high throughput.

Software Developer | Tech Start (2019 - 2022)
- Developed responsive web interfaces using React.

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2019
`;

  const chunks = chunkResumeText(resumeText);

  assert(chunks.length >= 4, `Extracted ${chunks.length} chunks (expected at least 4)`);

  const types = chunks.map((c) => c.chunkType);
  assert(types.includes("summary"), "Detected summary section");
  assert(types.includes("skills"), "Detected skills section");
  assert(types.includes("experience"), "Detected experience section");
  assert(types.includes("education"), "Detected education section");

  const skillsChunk = chunks.find((c) => c.chunkType === "skills");
  assert(
    !!skillsChunk && skillsChunk.content.includes("TypeScript"),
    "Skills chunk contains expected content"
  );
});

test("Chunking: Job description with standard sections", () => {
  const jdText = `
Role Overview
We are looking for a Senior Full Stack Engineer to lead product development.

RESPONSIBILITIES
- Architect scalable web services using Node.js and TypeScript.
- Collaborate with cross-functional teams to deliver modern web apps.

REQUIRED SKILLS
- 4+ years of professional backend experience with Node.js.
- Strong proficiency in PostgreSQL and database indexing.
- Deep familiarity with React and modern frontend state management.

PREFERRED QUALIFICATIONS
- Experience with Docker and CI/CD pipelines.
- Knowledge of vector databases and embedding search.
`;

  const chunks = chunkJobDescription(jdText);

  assert(chunks.length >= 3, `Extracted ${chunks.length} chunks from JD`);

  const types = chunks.map((c) => c.chunkType);
  assert(types.includes("responsibilities"), "Detected responsibilities section");
  assert(types.includes("required_skills"), "Detected required_skills section");
  assert(types.includes("preferred_skills"), "Detected preferred_skills section");
});

test("Chunking: Empty and whitespace documents", () => {
  assert(chunkResumeText("").length === 0, "Empty string returns empty array for resume");
  assert(chunkResumeText("   \n\t  ").length === 0, "Whitespace returns empty array for resume");
  assert(chunkJobDescription("").length === 0, "Empty string returns empty array for JD");
  assert(chunkJobDescription("   \n\t  ").length === 0, "Whitespace returns empty array for JD");
});

test("Chunking: Fallback paragraph chunking for text without section headers", () => {
  const unstructuredResume = `
Jane Doe is a software developer with 4 years of hands-on experience in full stack web development.
She specializes in building enterprise applications using modern web technologies and cloud infrastructure.

Throughout her career, she has developed multiple high-profile projects using Node.js, Express, React, and PostgreSQL.
She has also contributed to open source libraries and mentored junior engineers on test-driven development.
`;

  const chunks = chunkResumeText(unstructuredResume);
  assert(chunks.length >= 1, "Fallback produced chunks without explicit headers");
  assert(chunks[0].chunkType === "general", "Fallback chunk assigned 'general' type");
  assert(chunks[0].content.includes("Jane Doe"), "Chunk preserved original text content");
});

test("Chunking: Long section gets subdivided with fallback chunking", () => {
  const longParagraph = "This is a detailed description of architectural decisions and system design. ".repeat(25);
  const text = `EXPERIENCE\n${longParagraph}\n\n${longParagraph}`;

  const chunks = chunkResumeText(text);
  assert(chunks.length > 1, `Long section subdivided into ${chunks.length} chunks`);
  assert(chunks.every((c) => c.chunkType === "experience"), "All subdivided chunks retain original section type");
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Cosine Similarity & Vector Math Tests
// ─────────────────────────────────────────────────────────────────────────────

test("Cosine Similarity: Identical vectors yield similarity 1.0", () => {
  const v1 = [0.2, 0.5, 0.8, 0.1];
  const sim = cosineSimilarity(v1, v1);
  assert(Math.abs(sim - 1.0) < 0.0001, `Identical vector similarity is 1.0 (got ${sim})`);
});

test("Cosine Similarity: Orthogonal vectors yield similarity 0.0", () => {
  const v1 = [1, 0, 0];
  const v2 = [0, 1, 0];
  const sim = cosineSimilarity(v1, v2);
  assert(Math.abs(sim - 0.0) < 0.0001, `Orthogonal vector similarity is 0.0 (got ${sim})`);
});

test("Cosine Similarity: Empty or mismatched dimension vectors return 0", () => {
  assert(cosineSimilarity([], [1, 2, 3]) === 0, "Empty vector A returns 0");
  assert(cosineSimilarity([1, 2, 3], []) === 0, "Empty vector B returns 0");
  assert(cosineSimilarity([1, 2], [1, 2, 3]) === 0, "Mismatched dimensions return 0");
});

test("Cosine Similarity: Result always clamped to [0, 1]", () => {
  const v1 = [-1, -2, -3];
  const v2 = [1, 2, 3];
  const sim = cosineSimilarity(v1, v2);
  assert(sim >= 0 && sim <= 1, `Similarity is within [0, 1] range (got ${sim})`);
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Match Scoring Service Tests
// ─────────────────────────────────────────────────────────────────────────────

test("Scoring: calculateSkillMatchScore", () => {
  assert(calculateSkillMatchScore(["Node.js", "React"], []) === 100, "100% when no missing skills");
  assert(calculateSkillMatchScore([], ["Node.js", "React"]) === 0, "0% when no matching skills");
  assert(calculateSkillMatchScore(["Node.js"], ["React"]) === 50, "50% with equal matching and missing");
  assert(calculateSkillMatchScore([], []) === 0, "0% with empty arrays");
});

test("Scoring: calculateFinalScore combines all three signals with configured weights", () => {
  // semantic: 35%, llm: 45%, skill: 20%
  // 80 * 0.35 = 28
  // 90 * 0.45 = 40.5
  // 70 * 0.20 = 14
  // Total = 82.5 -> rounded 83
  const breakdown = calculateFinalScore(80, 90, 70);

  assert(breakdown.semanticScore === 80, "Semantic score recorded correctly");
  assert(breakdown.llmScore === 90, "LLM score recorded correctly");
  assert(breakdown.skillMatchScore === 70, "Skill match score recorded correctly");
  assert(breakdown.finalScore === 83, `Final composite score is 83 (got ${breakdown.finalScore})`);
  assert(
    Math.abs(breakdown.weights.semantic + breakdown.weights.llm + breakdown.weights.skillMatch - 1.0) < 0.001,
    "Normalized weights sum to 1.0"
  );
});

test("Scoring: calculateFinalScore clamps to [0, 100]", () => {
  const zeroBreakdown = calculateFinalScore(0, 0, 0);
  assert(zeroBreakdown.finalScore === 0, "Zero inputs yield 0");

  const maxBreakdown = calculateFinalScore(100, 100, 100);
  assert(maxBreakdown.finalScore === 100, "100 inputs yield 100");
});

test("Scoring: calculateFallbackScore when semantic matching is unavailable", () => {
  const dummyAnalysis = {
    matchScore: 78,
    summary: "Good fit",
    matchingSkills: ["Python", "SQL"],
    missingSkills: ["React"],
    matchingExperience: ["Backend"],
    missingRequirements: ["Frontend"],
    strengths: ["Python"],
    improvements: ["React"],
  };

  const fallback = calculateFallbackScore(dummyAnalysis);
  assert(fallback.finalScore === 78, "Fallback retains LLM match score");
  assert(fallback.semanticScore === 0, "Fallback semantic score is 0");
  assert(fallback.skillMatchScore === 67, "Fallback calculates skill percentage (2/3 = 67%)");
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. End-to-End Semantic Flow Simulation (Chunks -> Vectors -> Similarity -> Score)
// ─────────────────────────────────────────────────────────────────────────────

test("E2E Simulation: Requirement extraction from JD chunks", () => {
  const jdChunks: DocumentChunk[] = [
    {
      chunkType: "required_skills",
      content: "REQUIRED SKILLS\n• Proficiency with Node.js and Express REST APIs\n• Strong understanding of PostgreSQL indexing\n• Experience with TypeScript",
    },
    {
      chunkType: "responsibilities",
      content: "RESPONSIBILITIES\n• Build and scale cloud microservices architectures",
    },
  ];

  const requirements = extractRequirementsFromChunks(jdChunks);
  assert(requirements.length >= 3, `Extracted ${requirements.length} requirement phrases`);
  assert(
    requirements.some((r) => r.toLowerCase().includes("node.js")),
    "Extracted Node.js requirement"
  );
  assert(
    requirements.some((r) => r.toLowerCase().includes("postgresql")),
    "Extracted PostgreSQL requirement"
  );
});

test("E2E Simulation: Synthetic vector matching and evidence alignment", () => {
  // Simulate synthetic 4D embeddings representing: [backend, database, frontend, devops]
  const resumeChunks: DocumentChunk[] = [
    {
      chunkType: "experience",
      content: "Built high throughput REST APIs using Node.js and Express.",
      embedding: [0.9, 0.4, 0.1, 0.1], // strong backend
    },
    {
      chunkType: "skills",
      content: "PostgreSQL, query optimization, database indexing, Redis caching.",
      embedding: [0.3, 0.95, 0.1, 0.2], // strong database
    },
  ];

  // Requirements to test
  const backendReq = { text: "Node.js REST API development", embedding: [0.88, 0.35, 0.1, 0.1] };
  const frontendReq = { text: "React state management and CSS animations", embedding: [0.05, 0.05, 0.95, 0.1] };

  // 1. Match backend requirement against resume chunks
  let bestBackendSim = 0;
  let bestBackendChunk: DocumentChunk | null = null;
  for (const chunk of resumeChunks) {
    const sim = cosineSimilarity(backendReq.embedding, chunk.embedding!);
    if (sim > bestBackendSim) {
      bestBackendSim = sim;
      bestBackendChunk = chunk;
    }
  }

  assert(bestBackendSim >= SIMILARITY_THRESHOLD, `Backend requirement similarity ${bestBackendSim.toFixed(2)} exceeds threshold`);
  assert(bestBackendChunk?.chunkType === "experience", "Matched with experience section");

  // 2. Match frontend requirement against resume chunks
  let bestFrontendSim = 0;
  for (const chunk of resumeChunks) {
    const sim = cosineSimilarity(frontendReq.embedding, chunk.embedding!);
    if (sim > bestFrontendSim) {
      bestFrontendSim = sim;
    }
  }

  assert(bestFrontendSim < SIMILARITY_THRESHOLD, `Frontend requirement similarity ${bestFrontendSim.toFixed(2)} is below threshold (correctly unmatched)`);

  // 3. Compute combined score with LLM analysis
  const overallSemantic = Math.round(((bestBackendSim + bestFrontendSim * 0.5) / 2) * 100);
  const finalScoreResult = calculateFinalScore(overallSemantic, 80, 75);

  assert(finalScoreResult.finalScore > 0 && finalScoreResult.finalScore <= 100, `Final score generated in valid range (${finalScoreResult.finalScore})`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log(`\n${"═".repeat(50)}`);
console.log(`Tests complete: ${passed} passed, ${failed} failed`);
console.log(`${"═".repeat(50)}`);

if (failed > 0) {
  process.exit(1);
}
