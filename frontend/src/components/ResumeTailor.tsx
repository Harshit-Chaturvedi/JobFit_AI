"use client";

import { useState } from "react";
import { tailorResume } from "@/lib/api";
import { ResumeTailorResult } from "@/types/analysis";

export default function ResumeTailor({ resumeText, jobDescription }: { resumeText: string; jobDescription: string }) {
  const [result, setResult] = useState<ResumeTailorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true); setError(null);
    try { setResult(await tailorResume(resumeText, jobDescription)); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not tailor your resume."); }
    finally { setLoading(false); }
  }

  return <section className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5 space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div><h2 className="text-lg font-semibold text-white">✨ ATS Resume Tailor</h2><p className="text-xs text-slate-400 mt-1">Get truthful, role-specific wording suggestions. Review every suggestion before using it.</p></div>
      <button onClick={generate} disabled={loading} className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-sm font-bold">{loading ? "Tailoring…" : result ? "Refresh suggestions" : "Tailor my resume"}</button>
    </div>
    {error && <p className="text-sm text-red-400">{error}</p>}
    {result && <div className="space-y-4 text-sm">
      <div className="rounded-lg bg-slate-900/60 border border-slate-700 p-4"><p className="text-xs uppercase tracking-wide text-cyan-300">Suggested headline</p><p className="text-white font-medium mt-1">{result.headline || "No headline suggested"}</p><p className="text-slate-300 mt-3 leading-relaxed">{result.professionalSummary}</p></div>
      <TagList title="Skills to prioritize" items={result.skillsToPrioritize} />
      <TagList title="ATS keywords evidenced by your resume" items={result.atsKeywords} />
      {result.bulletSuggestions.length > 0 && <div><h3 className="font-medium text-slate-200 mb-2">Bullet improvements</h3><div className="space-y-2">{result.bulletSuggestions.map((item, index) => <div key={index} className="rounded-lg border border-slate-700 bg-slate-900/40 p-3"><p className="text-xs text-slate-500">Focus: {item.originalFocus || "Resume experience"}</p><p className="text-slate-200 mt-1">{item.suggestion}</p></div>)}</div></div>}
      {result.warnings.length > 0 && <div className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">{result.warnings.map((warning, index) => <p key={index}>• {warning}</p>)}</div>}
    </div>}
  </section>;
}

function TagList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return <div><h3 className="font-medium text-slate-200 mb-2">{title}</h3><div className="flex flex-wrap gap-2">{items.map((item, index) => <span key={`${item}-${index}`} className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-200">{item}</span>)}</div></div>;
}
