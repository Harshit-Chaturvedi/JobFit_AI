import dotenv from "dotenv";

dotenv.config();

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function nonNegativeNumber(value: string | undefined, fallback: number): number {
  const parsed = Number.parseFloat(value || "");
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

const defaultScoreWeights = { semantic: 0.35, llm: 0.45, skillMatch: 0.2 };
const configuredScoreWeights = {
  semantic: nonNegativeNumber(process.env.SCORE_WEIGHT_SEMANTIC, defaultScoreWeights.semantic),
  llm: nonNegativeNumber(process.env.SCORE_WEIGHT_LLM, defaultScoreWeights.llm),
  skillMatch: nonNegativeNumber(process.env.SCORE_WEIGHT_SKILL, defaultScoreWeights.skillMatch),
};

const scoreWeights =
  configuredScoreWeights.semantic +
    configuredScoreWeights.llm +
    configuredScoreWeights.skillMatch >
  0
    ? configuredScoreWeights
    : defaultScoreWeights;

export const config = {
  port: positiveInteger(process.env.PORT, 3001),
  nodeEnv: process.env.NODE_ENV || "development",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  databaseUrl: process.env.DATABASE_URL || "",
  embeddingModel: process.env.EMBEDDING_MODEL || "gemini-embedding-2",
  embeddingDimension: positiveInteger(process.env.EMBEDDING_DIMENSION, 768),
  scoreWeights,
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  persistAnalyses: process.env.PERSIST_ANALYSES === "true",
  rateLimitWindowMs: positiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMaxRequests: positiveInteger(process.env.RATE_LIMIT_MAX_REQUESTS, 30),
};
