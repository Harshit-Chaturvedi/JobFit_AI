import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  databaseUrl: process.env.DATABASE_URL || "",
  embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-004",
  embeddingDimension: parseInt(process.env.EMBEDDING_DIMENSION || "768", 10),
  scoreWeights: {
    semantic: parseFloat(process.env.SCORE_WEIGHT_SEMANTIC || "0.35"),
    llm: parseFloat(process.env.SCORE_WEIGHT_LLM || "0.45"),
    skillMatch: parseFloat(process.env.SCORE_WEIGHT_SKILL || "0.20"),
  },
};
