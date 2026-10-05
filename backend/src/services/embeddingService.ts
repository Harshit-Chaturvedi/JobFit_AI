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
    const result = await model.embedContent(text);
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

  const results: number[][] = [];
  const batchSize = 5;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    const batchPromises = batch.map(text => 
      generateEmbedding(text).catch(error => {
        console.error(`[embeddingService] Embedding failed for text batch item:`, error);
        return [];
      })
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Wait 100ms between batches to avoid rate limiting
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`[embeddingService] Generated ${texts.length} embeddings`);
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
