"use client";

import { AnalysisResult } from "@/types/analysis";

interface AnalysisResultsProps {
  result: AnalysisResult;
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75
      ? "text-emerald-400"
      : score >= 50
      ? "text-amber-400"
      : "text-red-400";
  const strokeColor =
    score >= 75
      ? "stroke-emerald-400"
      : score >= 50
      ? "stroke-amber-400"
      : "stroke-red-400";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-800"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${strokeColor} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{score}%</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-400">Match Score</p>
    </div>
  );
}

function Section({
  title,
  items,
  icon,
  variant = "default",
}: {
  title: string;
  items: string[];
  icon: string;
  variant?: "success" | "warning" | "default";
}) {
  if (items.length === 0) return null;

  const styles = {
    success: "border-emerald-500/20 bg-emerald-500/5",
    warning: "border-amber-500/20 bg-amber-500/5",
    default: "border-slate-700/50 bg-slate-800/30",
  };

  const bulletStyles = {
    success: "text-emerald-400",
    warning: "text-amber-400",
    default: "text-indigo-400",
  };

  return (
    <div className={`rounded-xl border p-5 ${styles[variant]}`}>
      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
        <span className="text-slate-500 font-normal">({items.length})</span>
      </h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className={`mt-0.5 ${bulletStyles[variant]}`}>
              {variant === "success" ? "✓" : variant === "warning" ? "•" : "›"}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      {/* Score + Summary */}
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreRing score={result.matchScore} />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-semibold text-white mb-2">Analysis Summary</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{result.summary}</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section
          title="Matching Skills"
          items={result.matchingSkills}
          icon="✅"
          variant="success"
        />
        <Section
          title="Missing Skills"
          items={result.missingSkills}
          icon="⚠️"
          variant="warning"
        />
      </div>

      {/* Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section
          title="Relevant Experience"
          items={result.matchingExperience}
          icon="💼"
          variant="success"
        />
        <Section
          title="Missing Requirements"
          items={result.missingRequirements}
          icon="📋"
          variant="warning"
        />
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section
          title="Strengths"
          items={result.strengths}
          icon="💪"
          variant="success"
        />
        <Section
          title="Areas to Improve"
          items={result.improvements}
          icon="🎯"
          variant="default"
        />
      </div>
    </div>
  );
}
