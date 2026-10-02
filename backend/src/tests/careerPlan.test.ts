/**
 * Career Plan Feature Tests
 * 
 * Run with: npx ts-node src/tests/careerPlan.test.ts
 * From the backend/ directory
 */

import { validateCareerPlanResult } from "../services/careerPlanService";
import { CareerPlanResult } from "../types/careerPlan";

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

// ── Test 1: Strong candidate / Strong match ──

test("Strong candidate with complete AI response", () => {
  const input = {
    candidateSummary: {
      overviewStatement: "You are an excellent match for this Senior Full-Stack Developer role.",
      currentMatchScore: 85,
      topStrength: "Strong backend development with Node.js and TypeScript",
      biggestGap: "Limited experience with GraphQL",
      recommendedNextStep: "Build a project using GraphQL to round out your skill set."
    },
    missingSkillsAnalysis: [
      {
        skillName: "GraphQL",
        importance: "Medium",
        reason: "The job mentions GraphQL for API development.",
        learningDifficulty: "Moderate effort",
        recommendation: "Build a GraphQL API to complement your REST experience."
      }
    ],
    resumeImprovement: {
      skillsToHighlight: ["TypeScript", "Node.js", "React", "PostgreSQL"],
      relevantProjects: ["E-commerce platform", "Real-time chat application"],
      keywordsToMention: ["CI/CD", "microservices", "agile"],
      sectionsToImprove: ["Add metrics to project descriptions"],
      projectDescriptionSuggestions: ["Quantify the impact of your e-commerce platform."]
    },
    projectRecommendations: [
      {
        title: "GraphQL API Gateway",
        problem: "Need to demonstrate GraphQL skills",
        description: "Build a GraphQL gateway that aggregates multiple REST APIs.",
        technologies: ["GraphQL", "Node.js", "TypeScript", "Apollo Server"],
        skillsCovered: ["GraphQL", "API Design"],
        difficulty: "Intermediate",
        estimatedTime: "2-3 weeks"
      }
    ],
    learningRoadmap: {
      mustLearn: [
        { topic: "GraphQL", reason: "Required by the job description", suggestedOrder: 1 }
      ],
      shouldLearn: [
        { topic: "Docker", reason: "Mentioned in the deployment section", suggestedOrder: 1 }
      ],
      niceToHave: [
        { topic: "Kubernetes", reason: "Would strengthen DevOps knowledge", suggestedOrder: 1 }
      ]
    }
  };

  const result = validateCareerPlanResult(input);
  
  assert(result.candidateSummary.currentMatchScore === 85, "Match score preserved");
  assert(result.candidateSummary.overviewStatement.includes("excellent match"), "Overview statement preserved");
  assert(result.missingSkillsAnalysis.length === 1, "Missing skills count correct");
  assert(result.missingSkillsAnalysis[0].skillName === "GraphQL", "Missing skill name correct");
  assert(result.missingSkillsAnalysis[0].importance === "Medium", "Importance preserved");
  assert(result.resumeImprovement.skillsToHighlight.length === 4, "Skills to highlight count correct");
  assert(result.projectRecommendations.length === 1, "Project recommendations count correct");
  assert(result.projectRecommendations[0].difficulty === "Intermediate", "Project difficulty correct");
  assert(result.learningRoadmap.mustLearn.length === 1, "Must learn count correct");
  assert(result.learningRoadmap.shouldLearn.length === 1, "Should learn count correct");
  assert(result.learningRoadmap.niceToHave.length === 1, "Nice to have count correct");
});

// ── Test 2: Weak candidate / Many missing skills ──

test("Weak candidate with many gaps", () => {
  const input = {
    candidateSummary: {
      overviewStatement: "Your profile has significant gaps for this role.",
      currentMatchScore: 25,
      topStrength: "Basic Python knowledge",
      biggestGap: "No web development experience",
      recommendedNextStep: "Start learning React and Node.js fundamentals."
    },
    missingSkillsAnalysis: [
      {
        skillName: "React",
        importance: "High",
        reason: "Core frontend framework required.",
        learningDifficulty: "Requires deep preparation",
        recommendation: "Complete a comprehensive React course."
      },
      {
        skillName: "Node.js",
        importance: "High",
        reason: "Backend development is in Node.js.",
        learningDifficulty: "Moderate effort",
        recommendation: "Build REST APIs with Express."
      },
      {
        skillName: "TypeScript",
        importance: "High",
        reason: "All code is in TypeScript.",
        learningDifficulty: "Quick to learn",
        recommendation: "Transition from JavaScript to TypeScript."
      },
      {
        skillName: "PostgreSQL",
        importance: "Medium",
        reason: "Database experience required.",
        learningDifficulty: "Moderate effort",
        recommendation: "Learn SQL and PostgreSQL basics."
      },
      {
        skillName: "Docker",
        importance: "Low",
        reason: "Used for deployment.",
        learningDifficulty: "Quick to learn",
        recommendation: "Learn Docker basics."
      }
    ],
    resumeImprovement: {
      skillsToHighlight: ["Python"],
      relevantProjects: [],
      keywordsToMention: [],
      sectionsToImprove: ["Add a technical skills section", "Include GitHub link"],
      projectDescriptionSuggestions: ["Add technical details to project descriptions."]
    },
    projectRecommendations: [
      {
        title: "Personal Portfolio Website",
        problem: "No web development projects to show",
        description: "Build a portfolio using React and TypeScript.",
        technologies: ["React", "TypeScript", "Tailwind CSS"],
        skillsCovered: ["React", "TypeScript", "CSS"],
        difficulty: "Beginner",
        estimatedTime: "1-2 weeks"
      },
      {
        title: "Task Management API",
        problem: "No backend experience",
        description: "Build a REST API with Node.js and PostgreSQL.",
        technologies: ["Node.js", "Express", "TypeScript", "PostgreSQL"],
        skillsCovered: ["Node.js", "TypeScript", "PostgreSQL", "REST APIs"],
        difficulty: "Intermediate",
        estimatedTime: "2-3 weeks"
      }
    ],
    learningRoadmap: {
      mustLearn: [
        { topic: "JavaScript fundamentals", reason: "Foundation for React and Node.js", suggestedOrder: 1 },
        { topic: "TypeScript", reason: "Required by the job", suggestedOrder: 2 },
        { topic: "React", reason: "Core frontend framework", suggestedOrder: 3 },
        { topic: "Node.js", reason: "Core backend runtime", suggestedOrder: 4 }
      ],
      shouldLearn: [
        { topic: "PostgreSQL", reason: "Database for the role", suggestedOrder: 1 }
      ],
      niceToHave: [
        { topic: "Docker", reason: "Deployment tooling", suggestedOrder: 1 }
      ]
    }
  };

  const result = validateCareerPlanResult(input);

  assert(result.candidateSummary.currentMatchScore === 25, "Low match score preserved");
  assert(result.missingSkillsAnalysis.length === 5, "All 5 missing skills captured");
  assert(result.missingSkillsAnalysis[0].importance === "High", "High importance preserved");
  assert(result.missingSkillsAnalysis[4].importance === "Low", "Low importance preserved");
  assert(result.resumeImprovement.relevantProjects.length === 0, "Empty relevant projects handled");
  assert(result.projectRecommendations.length === 2, "Two project recommendations");
  assert(result.learningRoadmap.mustLearn.length === 4, "Four must-learn items");
});

// ── Test 3: Candidate with projects but little professional experience ──

test("Candidate with projects but little professional experience", () => {
  const input = {
    candidateSummary: {
      overviewStatement: "You have relevant project experience but lack professional work history.",
      currentMatchScore: 55,
      topStrength: "Strong personal projects in React and Node.js",
      biggestGap: "No professional work experience",
      recommendedNextStep: "Focus on contributing to open source to build credibility."
    },
    missingSkillsAnalysis: [
      {
        skillName: "CI/CD",
        importance: "Medium",
        reason: "DevOps experience expected.",
        learningDifficulty: "Moderate effort",
        recommendation: "Set up GitHub Actions for one of your projects."
      }
    ],
    resumeImprovement: {
      skillsToHighlight: ["React", "Node.js", "TypeScript", "MongoDB"],
      relevantProjects: ["Full-stack todo app", "Chat application"],
      keywordsToMention: ["full-stack", "REST API", "responsive design"],
      sectionsToImprove: ["Add an 'Open Source Contributions' section", "Highlight project complexity"],
      projectDescriptionSuggestions: [
        "Add user counts or performance metrics to your todo app description.",
        "Describe the real-time architecture of your chat application."
      ]
    },
    projectRecommendations: [
      {
        title: "Open Source Contribution",
        problem: "Need to demonstrate collaboration skills",
        description: "Contribute to a popular open-source project.",
        technologies: ["Git", "TypeScript", "React"],
        skillsCovered: ["Collaboration", "Code Review", "Git"],
        difficulty: "Intermediate",
        estimatedTime: "Ongoing"
      }
    ],
    learningRoadmap: {
      mustLearn: [
        { topic: "CI/CD with GitHub Actions", reason: "Expected for the role", suggestedOrder: 1 }
      ],
      shouldLearn: [
        { topic: "Testing (Jest, React Testing Library)", reason: "Professional code quality", suggestedOrder: 1 }
      ],
      niceToHave: []
    }
  };

  const result = validateCareerPlanResult(input);

  assert(result.candidateSummary.currentMatchScore === 55, "Mid-range score preserved");
  assert(result.resumeImprovement.relevantProjects.length === 2, "Relevant projects captured");
  assert(result.resumeImprovement.projectDescriptionSuggestions.length === 2, "Project suggestions captured");
  assert(result.learningRoadmap.niceToHave.length === 0, "Empty nice-to-have handled");
});

// ── Test 4: Completely empty/invalid AI response ──

test("Handles completely empty AI response without crashing", () => {
  const result = validateCareerPlanResult({});

  assert(result.candidateSummary.overviewStatement === "", "Empty overview statement");
  assert(result.candidateSummary.currentMatchScore === 0, "Zero match score");
  assert(result.candidateSummary.topStrength === "", "Empty top strength");
  assert(result.candidateSummary.biggestGap === "", "Empty biggest gap");
  assert(result.candidateSummary.recommendedNextStep === "", "Empty next step");
  assert(result.missingSkillsAnalysis.length === 0, "Empty missing skills array");
  assert(result.resumeImprovement.skillsToHighlight.length === 0, "Empty skills to highlight");
  assert(result.resumeImprovement.relevantProjects.length === 0, "Empty relevant projects");
  assert(result.projectRecommendations.length === 0, "Empty project recommendations");
  assert(result.learningRoadmap.mustLearn.length === 0, "Empty must learn");
  assert(result.learningRoadmap.shouldLearn.length === 0, "Empty should learn");
  assert(result.learningRoadmap.niceToHave.length === 0, "Empty nice to have");
});

// ── Test 5: Null/undefined input ──

test("Handles null input without crashing", () => {
  const result = validateCareerPlanResult(null);
  
  assert(result.candidateSummary !== undefined, "Candidate summary exists");
  assert(result.missingSkillsAnalysis !== undefined, "Missing skills exists");
  assert(result.resumeImprovement !== undefined, "Resume improvement exists");
  assert(result.projectRecommendations !== undefined, "Project recommendations exists");
  assert(result.learningRoadmap !== undefined, "Learning roadmap exists");
});

test("Handles undefined input without crashing", () => {
  const result = validateCareerPlanResult(undefined);
  
  assert(result.candidateSummary !== undefined, "Candidate summary exists");
  assert(Array.isArray(result.missingSkillsAnalysis), "Missing skills is array");
  assert(Array.isArray(result.projectRecommendations), "Project recommendations is array");
});

// ── Test 6: Invalid enum values ──

test("Handles invalid importance and difficulty values", () => {
  const input = {
    missingSkillsAnalysis: [
      {
        skillName: "Test Skill",
        importance: "Critical",  // Invalid value
        reason: "Test reason",
        learningDifficulty: "Impossible", // Invalid value
        recommendation: "Test"
      }
    ],
    projectRecommendations: [
      {
        title: "Test Project",
        problem: "Test",
        description: "Test",
        technologies: [],
        skillsCovered: [],
        difficulty: "Expert", // Invalid value
        estimatedTime: "1 week"
      }
    ]
  };

  const result = validateCareerPlanResult(input);

  assert(result.missingSkillsAnalysis[0].importance === "Medium", "Invalid importance defaults to Medium");
  assert(result.missingSkillsAnalysis[0].learningDifficulty === "Moderate effort", "Invalid difficulty defaults to Moderate effort");
  assert(result.projectRecommendations[0].difficulty === "Intermediate", "Invalid project difficulty defaults to Intermediate");
});

// ── Test 7: Partial response ──

test("Handles partial response with some sections missing", () => {
  const input = {
    candidateSummary: {
      overviewStatement: "Partial response test",
      currentMatchScore: 60
      // missing topStrength, biggestGap, recommendedNextStep
    },
    missingSkillsAnalysis: [
      {
        skillName: "React"
        // missing other fields
      }
    ]
    // missing resumeImprovement, projectRecommendations, learningRoadmap
  };

  const result = validateCareerPlanResult(input);

  assert(result.candidateSummary.overviewStatement === "Partial response test", "Partial overview preserved");
  assert(result.candidateSummary.currentMatchScore === 60, "Partial score preserved");
  assert(result.candidateSummary.topStrength === "", "Missing topStrength defaults to empty");
  assert(result.candidateSummary.biggestGap === "", "Missing biggestGap defaults to empty");
  assert(result.missingSkillsAnalysis[0].skillName === "React", "Partial skill name preserved");
  assert(result.missingSkillsAnalysis[0].importance === "Medium", "Missing importance defaults to Medium");
  assert(result.resumeImprovement.skillsToHighlight.length === 0, "Missing section defaults to empty arrays");
  assert(result.projectRecommendations.length === 0, "Missing projects defaults to empty array");
  assert(result.learningRoadmap.mustLearn.length === 0, "Missing roadmap defaults to empty");
});

// ── Summary ──

console.log(`\n${"═".repeat(50)}`);
console.log(`Tests complete: ${passed} passed, ${failed} failed`);
console.log(`${"═".repeat(50)}`);

if (failed > 0) {
  process.exit(1);
}
