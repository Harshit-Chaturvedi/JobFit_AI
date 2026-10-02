"use client";

import {
  CareerPlanResult,
  MissingSkillAnalysis,
  ProjectRecommendation,
  LearningRoadmapItem,
} from "@/types/analysis";

interface CareerPlanResultsProps {
  plan: CareerPlanResult;
}

/* ──────────────────────────── Candidate Summary ──────────────────────────── */

function CandidateSummary({ plan }: { plan: CareerPlanResult }) {
  const { candidateSummary } = plan;
  const score = candidateSummary.currentMatchScore;
  const scoreColor =
    score >= 75
      ? "text-emerald-400"
      : score >= 50
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6">
      <h2 className="text-lg font-semibold text-white mb-3">
        📊 Your Candidate Summary
      </h2>
      <p className="text-slate-300 text-sm leading-relaxed mb-5">
        {candidateSummary.overviewStatement}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SummaryCard
          label="Match Score"
          value={`${score}%`}
          valueClass={scoreColor}
        />
        <SummaryCard label="Top Strength" value={candidateSummary.topStrength} />
        <SummaryCard label="Biggest Gap" value={candidateSummary.biggestGap} />
        <SummaryCard
          label="Next Step"
          value={candidateSummary.recommendedNextStep}
        />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueClass = "text-slate-200",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-sm font-medium leading-snug ${valueClass}`}>
        {value || "—"}
      </p>
    </div>
  );
}

/* ────────────────────────── Missing Skills Analysis ──────────────────────── */

function MissingSkillsSection({
  skills,
}: {
  skills: MissingSkillAnalysis[];
}) {
  if (skills.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        🎯 Missing Skills Analysis
      </h2>
      <div className="space-y-3">
        {skills.map((skill, i) => (
          <SkillCard key={i} skill={skill} />
        ))}
      </div>
    </div>
  );
}

function SkillCard({ skill }: { skill: MissingSkillAnalysis }) {
  const importanceColor =
    skill.importance === "High"
      ? "bg-red-500/20 text-red-300 border-red-500/30"
      : skill.importance === "Medium"
      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
      : "bg-slate-600/20 text-slate-300 border-slate-500/30";

  const difficultyColor =
    skill.learningDifficulty === "Quick to learn"
      ? "text-emerald-400"
      : skill.learningDifficulty === "Moderate effort"
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">{skill.skillName}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${importanceColor}`}
        >
          {skill.importance}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-2">{skill.reason}</p>
      <p className={`text-xs mb-2 ${difficultyColor}`}>
        ⏱ {skill.learningDifficulty}
      </p>
      <p className="text-sm text-indigo-300 bg-indigo-500/10 rounded-lg px-3 py-2">
        💡 {skill.recommendation}
      </p>
    </div>
  );
}

/* ─────────────────────────── Resume Improvement ──────────────────────────── */

function ResumeImprovementSection({ plan }: { plan: CareerPlanResult }) {
  const { resumeImprovement } = plan;
  const hasContent =
    resumeImprovement.skillsToHighlight.length > 0 ||
    resumeImprovement.relevantProjects.length > 0 ||
    resumeImprovement.keywordsToMention.length > 0 ||
    resumeImprovement.sectionsToImprove.length > 0 ||
    resumeImprovement.projectDescriptionSuggestions.length > 0;

  if (!hasContent) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        📝 How to Improve Your Resume
      </h2>
      <div className="space-y-3">
        <ResumeList
          title="Skills to Highlight"
          icon="⭐"
          items={resumeImprovement.skillsToHighlight}
        />
        <ResumeList
          title="Relevant Projects to Emphasize"
          icon="🔗"
          items={resumeImprovement.relevantProjects}
        />
        <ResumeList
          title="Keywords to Mention"
          icon="🔑"
          items={resumeImprovement.keywordsToMention}
        />
        <ResumeList
          title="Sections to Improve"
          icon="🔧"
          items={resumeImprovement.sectionsToImprove}
        />
        <ResumeList
          title="Project Description Suggestions"
          icon="✍️"
          items={resumeImprovement.projectDescriptionSuggestions}
        />
      </div>
    </div>
  );
}

function ResumeList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="mt-0.5 text-indigo-400">›</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ────────────────────────── Project Recommendations ──────────────────────── */

function ProjectRecommendationsSection({
  projects,
}: {
  projects: ProjectRecommendation[];
}) {
  if (projects.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        🚀 Projects That Can Improve Your Profile
      </h2>
      <div className="space-y-4">
        {projects.map((project, i) => (
          <ProjectCard key={i} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  index,
}: {
  project: ProjectRecommendation;
  index: number;
}) {
  const difficultyColor =
    project.difficulty === "Beginner"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : project.difficulty === "Intermediate"
      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
      : "bg-red-500/20 text-red-300 border-red-500/30";

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400 font-bold text-sm">
            #{index + 1}
          </span>
          <h3 className="text-sm font-semibold text-white">{project.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${difficultyColor}`}
          >
            {project.difficulty}
          </span>
          {project.estimatedTime && (
            <span className="text-xs text-slate-500">
              ⏱ {project.estimatedTime}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-2">
        <span className="text-slate-500 font-medium">Problem: </span>
        {project.problem}
      </p>
      <p className="text-sm text-slate-300 mb-3">{project.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {project.technologies.map((tech, i) => (
          <span
            key={i}
            className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20"
          >
            {tech}
          </span>
        ))}
      </div>

      {project.skillsCovered.length > 0 && (
        <p className="text-xs text-slate-500">
          Skills covered: {project.skillsCovered.join(", ")}
        </p>
      )}
    </div>
  );
}

/* ──────────────────────────── Learning Roadmap ────────────────────────────── */

function LearningRoadmapSection({ plan }: { plan: CareerPlanResult }) {
  const { learningRoadmap } = plan;
  const hasContent =
    learningRoadmap.mustLearn.length > 0 ||
    learningRoadmap.shouldLearn.length > 0 ||
    learningRoadmap.niceToHave.length > 0;

  if (!hasContent) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        🗺️ Your Learning Roadmap
      </h2>
      <div className="space-y-4">
        <RoadmapPriority
          title="Priority 1 — Must Learn"
          items={learningRoadmap.mustLearn}
          color="red"
        />
        <RoadmapPriority
          title="Priority 2 — Should Learn"
          items={learningRoadmap.shouldLearn}
          color="amber"
        />
        <RoadmapPriority
          title="Priority 3 — Nice to Have"
          items={learningRoadmap.niceToHave}
          color="slate"
        />
      </div>
    </div>
  );
}

function RoadmapPriority({
  title,
  items,
  color,
}: {
  title: string;
  items: LearningRoadmapItem[];
  color: "red" | "amber" | "slate";
}) {
  if (items.length === 0) return null;

  const styles = {
    red: "border-red-500/20 bg-red-500/5",
    amber: "border-amber-500/20 bg-amber-500/5",
    slate: "border-slate-700/50 bg-slate-800/30",
  };

  const dotColor = {
    red: "bg-red-400",
    amber: "bg-amber-400",
    slate: "bg-slate-500",
  };

  const sorted = [...items].sort(
    (a, b) => a.suggestedOrder - b.suggestedOrder
  );

  return (
    <div className={`rounded-xl border p-4 ${styles[color]}`}>
      <h3 className="text-sm font-semibold text-slate-200 mb-3">{title}</h3>
      <div className="space-y-3">
        {sorted.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center mt-1">
              <div className={`w-2.5 h-2.5 rounded-full ${dotColor[color]}`} />
              {i < sorted.length - 1 && (
                <div className="w-px h-full min-h-[20px] bg-slate-700 mt-1" />
              )}
            </div>
            <div className="pb-2">
              <p className="text-sm font-medium text-white">{item.topic}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────── Divider ─────────────────────────────────────── */

function SectionDivider() {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
    </div>
  );
}

/* ────────────────────────── Main Export ──────────────────────────────────── */

export default function CareerPlanResults({ plan }: CareerPlanResultsProps) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-3">
          <span className="text-indigo-400 text-sm font-medium">
            Your Action Plan
          </span>
        </div>
        <h2 className="text-xl font-bold text-white">
          Candidate Improvement Plan
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Personalized recommendations to improve your fit for this role
        </p>
      </div>

      <CandidateSummary plan={plan} />

      <SectionDivider />

      <MissingSkillsSection skills={plan.missingSkillsAnalysis} />

      <SectionDivider />

      <ResumeImprovementSection plan={plan} />

      <SectionDivider />

      <ProjectRecommendationsSection projects={plan.projectRecommendations} />

      <SectionDivider />

      <LearningRoadmapSection plan={plan} />
    </div>
  );
}
