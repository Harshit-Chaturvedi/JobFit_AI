import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';

/**
 * Generate an embedding for a single text string.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    return [];
  }

  if (!config.geminiApiKey) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: config.embeddingModel });
    const result = await model.embedContent({
      content: { parts: [{ text }], role: "user" },
      embedContentConfig: {
        outputDimensionality: config.embeddingDimension,
        taskType: "SEMANTIC_SIMILARITY",
      },
    } as Parameters<typeof model.embedContent>[0]);
    const embedding = result.embedding.values;

    if (embedding.length !== config.embeddingDimension) {
      console.warn(`[embeddingService] Unexpected embedding dimension: expected ${config.embeddingDimension}, got ${embedding.length}`);
    }

    return embedding;
  } catch (error) {
    console.error('[embeddingService] Failed to generate embedding:', error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: config.embeddingModel });
  const results: number[][] = [];
  const batchSize = 100;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);

    try {
      const response = await model.batchEmbedContents({
        requests: batch.map((text) => ({
          content: { parts: [{ text }], role: "user" },
          embedContentConfig: {
            outputDimensionality: config.embeddingDimension,
            taskType: "SEMANTIC_SIMILARITY",
          },
        } as any)),
      });

      results.push(...response.embeddings.map((embedding) => embedding.values));
    } catch (error) {
      console.error(`[embeddingService] Embedding batch failed:`, error);
      results.push(...batch.map(() => []));
    }
  }

  console.log(`[embeddingService] Generated ${results.filter((embedding) => embedding.length > 0).length}/${texts.length} embeddings`);
  return results;
}

/**
 * Calculate cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  if (magA === 0 || magB === 0) {
    return 0;
  }

  const similarity = dotProduct / (Math.sqrt(magA) * Math.sqrt(magB));
  
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Return true if embedding service is available.
 */
export function isEmbeddingServiceAvailable(): boolean {
  return !!config.geminiApiKey && config.geminiApiKey.trim().length > 0;
}
