const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

export function getGeminiStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : undefined;
}

export function isTransientGeminiError(error: unknown): boolean {
  return RETRYABLE_STATUSES.has(getGeminiStatus(error) || 0);
}

export async function withGeminiRetry<T>(request: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      if (!isTransientGeminiError(error) || attempt >= 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 600 * 2 ** attempt));
    }
  }
}