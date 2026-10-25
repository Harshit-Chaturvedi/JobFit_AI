import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env";
import { ChatMessage, ChatResponse, ChatSource } from "../types/chat";
import { buildChatContext } from "./chatContextService";
import { AnalysisResult } from "../types/analysis";
import { CareerPlanResult } from "../types/careerPlan";
import { withGeminiRetry } from "./geminiRequest";

const MAX_CONVERSATION_HISTORY = 20;
const MAX_MESSAGE_LENGTH = 2000;

interface CareerChatParams {
  resumeText: string;
  jobDescription: string;
  message: string;
  conversationHistory: ChatMessage[];
  analysis?: AnalysisResult;
  semanticResult?: {
    semanticScore: number;
    matchedRequirements: Array<{ requirement: string; similarity: number }>;
    unmatchedRequirements: string[];
  };
  careerPlan?: CareerPlanResult;
}

export async function handleChatMessage(params: CareerChatParams): Promise<ChatResponse> {
  const {
    resumeText,
    jobDescription,
    message,
    conversationHistory,
    analysis,
    semanticResult,
    careerPlan,
  } = params;

  // Validation
  if (!config.geminiApiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  if (!message || message.trim().length === 0) {
    throw new Error("Message cannot be empty.");
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`Message exceeds the maximum length of ${MAX_MESSAGE_LENGTH} characters.`);
  }

  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error("Resume text is required for the Career Assistant.");
  }

  if (!jobDescription || jobDescription.trim().length === 0) {
    throw new Error("Job description is required for the Career Assistant.");
  }

  // Trim conversation history to prevent oversized requests
  const trimmedHistory = conversationHistory.slice(-MAX_CONVERSATION_HISTORY);

  // Build grounded context
  const { systemPrompt, contextSummary } = buildChatContext({
    resumeText,
    jobDescription,
    analysis,
    semanticResult,
    careerPlan,
  });

  // Construct the full prompt with context and conversation history
  const fullPrompt = buildPrompt(systemPrompt, contextSummary, trimmedHistory, message);

  // Call Gemini
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.5-flash-lite",
    generationConfig: {
      thinkingConfig: { thinkingLevel: "LOW" },
      maxOutputTokens: 1200,
    } as any,
  });

  const result = await withGeminiRetry(() => model.generateContent(fullPrompt));
  const responseText = result.response.text();

  // Identify which data sources were likely referenced
  const sources = identifySources(message, responseText, analysis, semanticResult, careerPlan);

  return {
    message: responseText.trim(),
    sources,
  };
}

function buildPrompt(
  systemPrompt: string,
  contextSummary: string,
  history: ChatMessage[],
  currentMessage: string
): string {
  const parts: string[] = [
    systemPrompt,
    "",
    "--- ANALYSIS DATA ---",
    contextSummary,
    "",
    "--- CONVERSATION ---",
  ];

  for (const msg of history) {
    const role = msg.role === "user" ? "User" : "Assistant";
    parts.push(`${role}: ${msg.content}`);
  }

  parts.push(`User: ${currentMessage}`);
  parts.push("");
  parts.push("Respond as the Career Assistant. Be concise, specific, and grounded in the data above.");

  return parts.join("\n");
}

function identifySources(
  userMessage: string,
  assistantResponse: string,
  analysis?: AnalysisResult,
  semanticResult?: { semanticScore: number; matchedRequirements: Array<{ requirement: string; similarity: number }>; unmatchedRequirements: string[] },
  careerPlan?: CareerPlanResult
): ChatSource[] {
  const sources: ChatSource[] = [];
  const combined = (userMessage + " " + assistantResponse).toLowerCase();

  // Check if response references match analysis data
  if (analysis) {
    const analysisKeywords = ["score", "match", "matching", "missing", "strength", "improvement", "gap"];
    if (analysisKeywords.some((k) => combined.includes(k))) {
      sources.push({
        type: "analysis",
        content: `Match Score: ${analysis.matchScore}% — ${analysis.summary}`,
      });
    }
  }

  // Check if response references semantic matching
  if (semanticResult) {
    const semanticKeywords = ["semantic", "vector", "evidence", "similarity", "embedding"];
    if (semanticKeywords.some((k) => combined.includes(k))) {
      sources.push({
        type: "semantic",
        content: `Semantic Score: ${semanticResult.semanticScore}%`,
      });
    }
  }

  // Check if response references career plan data
  if (careerPlan) {
    const planKeywords = ["learn", "project", "roadmap", "priority", "resume", "improve", "build", "skill"];
    if (planKeywords.some((k) => combined.includes(k))) {
      sources.push({
        type: "career_plan",
        content: careerPlan.candidateSummary.overviewStatement || "Career improvement plan",
      });
    }
  }

  // Resume and JD are always referenced
  if (sources.length === 0) {
    sources.push({ type: "resume", content: "Candidate resume" });
    sources.push({ type: "job_description", content: "Target job description" });
  }

  return sources;
}
