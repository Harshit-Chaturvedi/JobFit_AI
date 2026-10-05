"use client";

import { useState } from "react";
import Link from "next/link";
import ResumeUpload from "@/components/ResumeUpload";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import AnalysisResults from "@/components/AnalysisResults";
import CareerPlanResults from "@/components/CareerPlanResults";
import SemanticMatchResults from "@/components/SemanticMatchResults";
import { parseResume, analyzeMatch, generateCareerPlan, performSemanticMatch } from "@/lib/api";
import { AnalysisResult, CareerPlanResult, SemanticMatchResponse } from "@/types/analysis";

type Status = "idle" | "parsing" | "analyzing" | "done" | "generating-plan" | "plan-done" | "error";

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [careerPlan, setCareerPlan] = useState<CareerPlanResult | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [semanticResult, setSemanticResult] = useState<SemanticMatchResponse | null>(null);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticError, setSemanticError] = useState<string | null>(null);

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
    setCareerPlan(null);
    setPlanError(null);
    setSemanticResult(null);
    setSemanticError(null);

    try {
      // Step 1: Parse resume
      setStatus("parsing");
      const parsed = await parseResume(file);
      setResumeText(parsed.text);

      // Step 2: Analyze match (LLM)
      setStatus("analyzing");
      const analysis = await analyzeMatch(parsed.text, jobDescription.trim());

      setResult(analysis);
      setStatus("done");

      // Step 3: Trigger Semantic Matching asynchronously
      fetchSemanticMatch(parsed.text, jobDescription.trim(), analysis);
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  };

  const fetchSemanticMatch = async (
    rText: string,
    jdText: string,
    llmAnalysis?: AnalysisResult
  ) => {
    setSemanticLoading(true);
    setSemanticError(null);
    try {
      const semResult = await performSemanticMatch(rText, jdText, llmAnalysis);
      setSemanticResult(semResult);
    } catch (err) {
      console.warn("Semantic matching could not complete:", err);
      setSemanticError(
        err instanceof Error ? err.message : "Semantic matching is currently unavailable."
      );
    } finally {
      setSemanticLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!result || !resumeText) return;

    setPlanError(null);
    setCareerPlan(null);

    try {
      setStatus("generating-plan");
      const plan = await generateCareerPlan(
        resumeText,
        jobDescription.trim(),
        result
      );
      setCareerPlan(plan);
      setStatus("plan-done");
    } catch (err) {
      setPlanError(
        err instanceof Error ? err.message : "Failed to generate career plan."
      );
      setStatus("done");
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileError(null);
    setJobDescription("");
    setResumeText("");
    setStatus("idle");
    setError(null);
    setResult(null);
    setCareerPlan(null);
    setPlanError(null);
    setSemanticResult(null);
    setSemanticError(null);
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
        {status !== "done" && status !== "generating-plan" && status !== "plan-done" && (
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
        {(status === "done" || status === "generating-plan" || status === "plan-done") && result && (
          <div className="space-y-6">
            <AnalysisResults result={result} />

            {/* Semantic Matching Section */}
            {semanticLoading && (
              <div className="rounded-xl border border-indigo-500/20 bg-slate-900/40 p-5 text-center">
                <div className="inline-flex items-center gap-3">
                  <svg className="animate-spin h-4 w-4 text-indigo-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-indigo-300 text-sm font-medium">
                    Computing vector embeddings and semantic similarity...
                  </span>
                </div>
              </div>
            )}

            {semanticResult && !semanticLoading && (
              <SemanticMatchResults semanticResult={semanticResult} />
            )}

            {semanticError && !semanticLoading && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center justify-between gap-3">
                <p className="text-amber-400 text-xs">
                  ⚠️ Semantic vector matching: {semanticError} (LLM analysis remains fully active).
                </p>
                <button
                  onClick={() => fetchSemanticMatch(resumeText, jobDescription.trim(), result)}
                  className="text-xs px-3 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Career Plan Section */}
            {!careerPlan && status !== "generating-plan" && (
              <div className="space-y-3">
                {planError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-red-400 text-sm">{planError}</p>
                  </div>
                )}
                <button
                  onClick={handleGeneratePlan}
                  className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-400/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  🚀 Generate My Improvement Plan
                </button>
              </div>
            )}

            {/* Generating Plan Loading State */}
            {status === "generating-plan" && (
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-6 text-center">
                <div className="inline-flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-indigo-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-indigo-300 font-medium">
                    Creating your personalized improvement plan...
                  </span>
                </div>
                <p className="text-slate-500 text-sm mt-2">
                  Analyzing skills gaps, generating project ideas, and building your roadmap
                </p>
              </div>
            )}

            {/* Career Plan Results */}
            {careerPlan && (
              <CareerPlanResults plan={careerPlan} />
            )}

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
