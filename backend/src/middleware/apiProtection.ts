import { NextFunction, Request, Response } from "express";
import { config } from "../config/env";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

export const MAX_RESUME_TEXT_LENGTH = 100_000;
export const MAX_JOB_DESCRIPTION_LENGTH = 50_000;
export const MAX_HISTORY_CONTENT_LENGTH = 2_000;
export const MAX_HISTORY_TOTAL_LENGTH = 12_000;

export function apiRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const current = requestCounts.get(key);

  if (!current || current.resetAt <= now) {
    requestCounts.set(key, { count: 1, resetAt: now + config.rateLimitWindowMs });
    next();
    return;
  }

  if (current.count >= config.rateLimitMaxRequests) {
    res.status(429).json({ error: "Too many requests. Please try again later." });
    return;
  }

  current.count += 1;
  next();
}

export function validateTextInputs(
  resumeText: unknown,
  jobDescription: unknown,
  res: Response
): resumeText is string {
  if (typeof resumeText !== "string" || !resumeText.trim()) {
    res.status(400).json({ error: "Resume text is required." });
    return false;
  }
  if (resumeText.length > MAX_RESUME_TEXT_LENGTH) {
    res.status(400).json({ error: `Resume text exceeds the ${MAX_RESUME_TEXT_LENGTH.toLocaleString()} character limit.` });
    return false;
  }
  if (typeof jobDescription !== "string" || !jobDescription.trim()) {
    res.status(400).json({ error: "Job description is required." });
    return false;
  }
  if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
    res.status(400).json({ error: `Job description exceeds the ${MAX_JOB_DESCRIPTION_LENGTH.toLocaleString()} character limit.` });
    return false;
  }
  return true;
}
