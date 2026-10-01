const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function parseResume(file: File): Promise<{ text: string; pages: number; filename: string }> {
  const formData = new FormData();
  formData.append("resume", file);

  const res = await fetch(`${API_BASE}/resume/parse`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to parse resume.");
  }

  return data;
}

export async function analyzeMatch(
  resumeText: string,
  jobDescription: string
): Promise<import("@/types/analysis").AnalysisResult> {
  const res = await fetch(`${API_BASE}/matching/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jobDescription }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to analyze match.");
  }

  return data;
}
