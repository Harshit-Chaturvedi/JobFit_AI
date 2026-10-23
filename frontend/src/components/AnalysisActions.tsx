"use client";

import { CareerPlanResult, AnalysisResult, SavedAnalysis } from "@/types/analysis";

const storageKey = "jobfit-saved-analyses";
export default function AnalysisActions({ result, jobDescription, careerPlan }: { result: AnalysisResult; jobDescription: string; careerPlan?: CareerPlanResult | null }) {
  function save() {
    const current: SavedAnalysis[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const record: SavedAnalysis = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), label: jobDescription.split("\n")[0].slice(0, 70) || "Untitled role", jobDescription, result, careerPlan };
    localStorage.setItem(storageKey, JSON.stringify([record, ...current].slice(0, 20)));
    alert("Saved privately in this browser. Open Dashboard to revisit it.");
  }
  function exportPdf() {
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) return;
    const escape = (value: string) => value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] || character);
    popup.document.write(`<!doctype html><html><head><title>JobFit Report</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#172033}h1{color:#4f46e5}.score{font-size:48px;font-weight:bold;color:#4f46e5}section{border-top:1px solid #ddd;padding:18px 0}li{margin:7px 0}@media print{body{margin:20px}}</style></head><body><h1>JobFit AI — Match Report</h1><p>Generated ${new Date().toLocaleDateString()}</p><p class="score">${result.matchScore}% match</p><section><h2>Summary</h2><p>${escape(result.summary)}</p></section><section><h2>Matching skills</h2><ul>${result.matchingSkills.map((item) => `<li>${escape(item)}</li>`).join("")}</ul></section><section><h2>Skills to develop</h2><ul>${result.missingSkills.map((item) => `<li>${escape(item)}</li>`).join("")}</ul></section><section><h2>Next improvements</h2><ul>${result.improvements.map((item) => `<li>${escape(item)}</li>`).join("")}</ul></section></body></html>`);
    popup.document.close(); popup.focus(); setTimeout(() => popup.print(), 250);
  }
  return <div className="grid grid-cols-2 gap-3"><button onClick={save} className="py-2.5 rounded-lg border border-slate-600 text-slate-200 text-sm hover:bg-slate-800">Save to dashboard</button><button onClick={exportPdf} className="py-2.5 rounded-lg bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400">Export PDF</button></div>;
}
