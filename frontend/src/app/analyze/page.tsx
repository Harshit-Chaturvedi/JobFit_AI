"use client";

import { useState } from "react";
import Link from "next/link";
import ResumeUpload from "@/components/ResumeUpload";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import AnalysisResults from "@/components/AnalysisResults";
import { parseResume, analyzeMatch } from "@/lib/api";
import { AnalysisResult } from "@/types/analysis";

type Status = "idle" | "parsing" | "analyzing" | "done" | "error";

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const canAnalyze = file && jobDescription.trim().length > 0 && status !== "parsing" && status !== "analyzing";

  const handleAnalyze = async () => {
    if (!file) {
      setFileError("Please upload a resume.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setError(null);
    setResult(null);

    try {
      // Step 1: Parse resume
      setStatus("parsing");
      const parsed = await parseResume(file);

      // Step 2: Analyze match
      setStatus("analyzing");
      const analysis = await analyzeMatch(parsed.text, jobDescription.trim());

      setResult(analysis);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileError(null);
    setJobDescription("");
    setStatus("idle");
    setError(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">JF</span>
          </div>
          <span className="text-white font-semibold text-xl group-hover:text-indigo-300 transition-colors">
            JobFit AI
          </span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Analyze Your Match
          </h1>
          <p className="text-slate-400 text-sm">
            Upload your resume and paste the job description to see how well you fit.
          </p>
        </div>

        {/* Input Section */}
        {status !== "done" && (
          <div className="space-y-6">
            <ResumeUpload
              file={file}
              onFileSelect={setFile}
              error={fileError}
              onError={setFileError}
            />

            <JobDescriptionInput
              value={jobDescription}
              onChange={setJobDescription}
            />

            {/* Error message */}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Analyze button */}
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                canAnalyze
                  ? "bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-400/30 hover:-translate-y-0.5 cursor-pointer"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
              }`}
            >
              {status === "parsing" && (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Extracting resume text...
                </span>
              )}
              {status === "analyzing" && (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing match with AI...
                </span>
              )}
              {(status === "idle" || status === "error") && "Analyze My Match"}
            </button>
          </div>
        )}

        {/* Results Section */}
        {status === "done" && result && (
          <div className="space-y-6">
            <AnalysisResults result={result} />

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium transition-all duration-200 cursor-pointer"
            >
              Analyze Another Resume
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
