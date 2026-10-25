"use client";

import Link from "next/link";
import Brand from "@/components/Brand";
import { useEffect, useState } from "react";
import { SavedAnalysis } from "@/types/analysis";

const analysesKey = "jobfit-saved-analyses";
const pinKey = "jobfit-dashboard-pin";

export default function DashboardPage() {
  const [saved, setSaved] = useState<SavedAnalysis[]>([]);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSaved(JSON.parse(localStorage.getItem(analysesKey) || "[]"));
      setHasPin(!!localStorage.getItem(pinKey));
      setProgress(JSON.parse(localStorage.getItem("jobfit-roadmap-progress") || "{}"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  function unlock() {
    if (!hasPin) { if (pin.length < 4) return; localStorage.setItem(pinKey, pin); setHasPin(true); setUnlocked(true); return; }
    if (pin === localStorage.getItem(pinKey)) setUnlocked(true);
  }
  function toggle(key: string) { const next = { ...progress, [key]: !progress[key] }; setProgress(next); localStorage.setItem("jobfit-roadmap-progress", JSON.stringify(next)); }
  function remove(id: string) { const next = saved.filter((item) => item.id !== id); setSaved(next); localStorage.setItem(analysesKey, JSON.stringify(next)); }
  if (!unlocked) return <main className="app-shell min-h-screen flex items-center justify-center px-6"><div className="w-full max-w-md rounded-2xl border border-indigo-500/30 bg-slate-900 p-7"><Link href="/" className="site-brand"><Brand /></Link><h1 className="text-2xl font-bold text-white mt-5">Private dashboard</h1><p className="text-slate-400 text-sm mt-2">{hasPin ? "Enter your local dashboard PIN." : "Create a local PIN to protect this browser’s saved analyses."}</p><input type="password" value={pin} onChange={(event) => setPin(event.target.value)} onKeyDown={(event) => event.key === "Enter" && unlock()} placeholder="4+ character PIN" className="w-full mt-5 rounded-lg bg-slate-800 border border-slate-700 p-3 text-white"/><button onClick={unlock} className="w-full mt-3 bg-indigo-500 hover:bg-indigo-400 rounded-lg py-3 text-white font-semibold">{hasPin ? "Unlock" : "Create PIN & unlock"}</button><p className="text-[11px] text-slate-500 mt-3">This is a local browser lock, not a cloud account. Your saved data never leaves this device.</p></div></main>;
  return <main className="app-shell min-h-screen py-8"><div className="dashboard-content"><div className="flex items-center justify-between mb-8"><div><Link href="/" className="site-brand"><Brand /></Link><h1 className="text-3xl font-bold text-white mt-2">Saved analyses</h1><p className="text-slate-400 text-sm">Your analyses and learning progress, saved on this device.</p></div><Link href="/analyze" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">New analysis</Link></div>{saved.length === 0 ? <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center text-slate-400">No saved analyses yet. Run an analysis and choose “Save to dashboard.”</div> : <div className="space-y-5">{saved.map((entry) => <section key={entry.id} className="rounded-xl border border-slate-700 bg-slate-900/60 p-5"><div className="flex gap-4 justify-between"><div><h2 className="text-white font-semibold">{entry.label}</h2><p className="text-xs text-slate-500 mt-1">{new Date(entry.createdAt).toLocaleString()}</p></div><div className="text-3xl font-bold text-indigo-300">{entry.result.matchScore}%</div></div><p className="text-sm text-slate-300 mt-4">{entry.result.summary}</p><div className="mt-4 flex flex-wrap gap-2">{entry.result.missingSkills.slice(0, 6).map((skill) => <span key={skill} className="text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-200">{skill}</span>)}</div>{entry.careerPlan?.learningRoadmap.mustLearn.length ? <div className="mt-5 pt-4 border-t border-slate-700"><h3 className="text-sm font-medium text-white mb-2">Learning progress</h3>{entry.careerPlan.learningRoadmap.mustLearn.map((item) => { const key = `${entry.id}-${item.topic}`; return <label key={key} className="flex items-start gap-2 py-1 text-sm text-slate-300"><input type="checkbox" checked={!!progress[key]} onChange={() => toggle(key)} className="mt-1 accent-indigo-500"/><span className={progress[key] ? "line-through text-slate-500" : ""}>{item.topic} — {item.reason}</span></label>; })}</div> : null}<button onClick={() => remove(entry.id)} className="mt-5 text-xs text-red-300 hover:text-red-200">Delete saved analysis</button></section>)}</div>}</div></main>;
}
