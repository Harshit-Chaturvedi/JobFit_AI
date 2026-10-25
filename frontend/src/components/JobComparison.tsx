"use client";

import { useState } from "react";
import { analyzeMatch } from "@/lib/api";
import { AnalysisResult } from "@/types/analysis";

type Comparison = { description: string; result?: AnalysisResult; error?: string };
export default function JobComparison({ resumeText, currentDescription, currentResult }: { resumeText: string; currentDescription: string; currentResult: AnalysisResult }) {
  const [descriptions, setDescriptions] = useState(["", ""]);
  const [items, setItems] = useState<Comparison[]>([]);
  const [loading, setLoading] = useState(false);
  async function compare() {
    const candidates = [currentDescription, ...descriptions].filter((text, index, all) => text.trim() && all.indexOf(text) === index).slice(0, 4);
    setLoading(true);
    const compared = await Promise.all(candidates.map(async (description, index) => {
      if (index === 0) return { description, result: currentResult };
      try { return { description, result: await analyzeMatch(resumeText, description) }; }
      catch (error) { return { description, error: error instanceof Error ? error.message : "Analysis failed" }; }
    }));
    setItems(compared); setLoading(false);
  }
  return <section className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-5 space-y-4">
    <div><h2 className="text-lg font-semibold text-white">Compare job opportunities</h2><p className="text-xs text-slate-400 mt-1">Paste up to three additional descriptions and compare their fit against the same resume.</p></div>
    {descriptions.map((description, index) => <textarea key={index} value={description} onChange={(event) => setDescriptions(descriptions.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} rows={3} placeholder={`Additional job description ${index + 1}`} className="w-full rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm text-slate-200 placeholder:text-slate-600" />)}
    <div className="flex gap-2"><button onClick={() => descriptions.length < 3 && setDescriptions([...descriptions, ""])} className="px-3 py-2 text-xs border border-slate-600 rounded-lg text-slate-300">Add another</button><button onClick={compare} disabled={loading} className="px-4 py-2 text-xs font-semibold rounded-lg bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white">{loading ? "Comparing…" : "Compare roles"}</button></div>
    {items.length > 0 && <div className="grid gap-3 sm:grid-cols-2">{items.map((item, index) => <div key={index} className="rounded-lg bg-slate-900/60 border border-slate-700 p-4"><p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>{item.result ? <><p className="text-3xl font-bold text-violet-300 mt-3">{item.result.matchScore}%</p><p className="text-xs text-slate-300 mt-2 line-clamp-3">{item.result.summary}</p></> : <p className="text-red-400 text-xs mt-3">{item.error}</p>}</div>)}</div>}
  </section>;
}
