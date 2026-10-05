"use client";

import { SemanticMatchResponse, RequirementMatch, EvidenceItem } from "@/types/analysis";

interface SemanticMatchResultsProps {
  semanticResult: SemanticMatchResponse;
}

export default function SemanticMatchResults({ semanticResult }: SemanticMatchResultsProps) {
  const { semanticScore, finalScore, scoreBreakdown, matchedRequirements, unmatchedRequirements, evidence } = semanticResult;

  const scoreColor =
    semanticScore >= 75 ? "text-emerald-400" : semanticScore >= 50 ? "text-amber-400" : "text-red-400";

  const finalColor =
    finalScore >= 75 ? "text-emerald-400" : finalScore >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-6">
      {/* Header & Overview */}
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2">
              <span>⚡ Vector Search & Embeddings</span>
            </div>
            <h2 className="text-xl font-bold text-white">Semantic Match Analysis</h2>
            <p className="text-slate-400 text-xs mt-1">
              Deep conceptual alignment measured using text embeddings and vector similarity
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
              <span className="text-xs text-slate-400 block">Semantic</span>
              <span className={`text-2xl font-bold ${scoreColor}`}>{semanticScore}%</span>
            </div>
            <div className="text-center px-4 py-2 rounded-lg bg-slate-800/60 border border-indigo-500/30">
              <span className="text-xs text-indigo-300 block">Combined</span>
              <span className={`text-2xl font-bold ${finalColor}`}>{finalScore}%</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-700/50">
          <div className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Vector Similarity (35%)</span>
            <span className="font-semibold text-white">{scoreBreakdown.semanticScore}%</span>
          </div>
          <div className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">LLM Reasoning (45%)</span>
            <span className="font-semibold text-white">{scoreBreakdown.llmScore}%</span>
          </div>
          <div className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-500 block">Skill Match (20%)</span>
            <span className="font-semibold text-white">{scoreBreakdown.skillMatchScore}%</span>
          </div>
        </div>

        {/* Note on data rules */}
        <p className="text-[11px] text-slate-400 italic mt-3 bg-slate-800/40 p-2 rounded border border-slate-700/30">
          ℹ️ Semantic similarity represents conceptual closeness based on embeddings. It serves as supporting evidence, while explicit resume verification remains the source of truth for claimed experience.
        </p>
      </div>

      {/* Matched Requirements with Evidence */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span>🎯 Matched Requirements ({matchedRequirements.length})</span>
        </h3>

        {matchedRequirements.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No strong semantic matches found above the similarity threshold.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {matchedRequirements.map((match, i) => {
              const simPercent = Math.round(match.similarity * 100);
              const badgeColor =
                simPercent >= 75
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-indigo-500/15 text-indigo-300 border-indigo-500/30";

              return (
                <div key={i} className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-white">{match.requirement}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                        {match.chunkType}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${badgeColor}`}>
                        {simPercent}% semantic match
                      </span>
                    </div>
                  </div>

                  {/* Evidence quote */}
                  <div className="mt-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-500 font-semibold block mb-1">Evidence from Resume:</span>
                    <p className="italic text-slate-300 leading-relaxed font-mono text-[11px]">
                      &quot;{match.matchedContent.slice(0, 260)}{match.matchedContent.length > 260 ? "..." : ""}&quot;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unmatched Requirements */}
      {unmatchedRequirements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>⚠️ Unmatched Requirements ({unmatchedRequirements.length})</span>
          </h3>

          <div className="grid grid-cols-1 gap-2.5">
            {unmatchedRequirements.map((req, i) => (
              <div key={i} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 flex items-start justify-between gap-4">
                <span className="text-xs text-slate-300 leading-relaxed">{req}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/30 whitespace-nowrap shrink-0">
                  No strong evidence found
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
