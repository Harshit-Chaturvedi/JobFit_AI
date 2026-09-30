export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">JF</span>
          </div>
          <span className="text-white font-semibold text-xl">JobFit AI</span>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <a href="#features" className="text-slate-400 hover:text-white transition-colors text-sm">Features</a>
          <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors text-sm">How It Works</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            <span className="text-indigo-300 text-sm font-medium">AI-Powered Resume Analysis</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
            Know how well you fit the job{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              before you apply.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your resume, paste a job description, and let AI analyze your fit — highlighting strengths, gaps, and actionable improvements.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-400/30 hover:-translate-y-0.5 cursor-pointer">
              Analyze My Resume
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium rounded-xl transition-all duration-200 cursor-pointer">
              Learn More
            </button>
          </div>

          {/* Feature Pills */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
            {[
              "Resume Parsing",
              "Job Matching",
              "Skill Gap Analysis",
              "AI Recommendations",
            ].map((feature) => (
              <span
                key={feature}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 text-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-6 text-center">
        <p className="text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} JobFit AI. Built with Next.js, TypeScript &amp; Tailwind CSS.
        </p>
      </footer>
    </div>
  );
}
