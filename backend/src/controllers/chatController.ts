import { Request, Response } from "express";
import { handleChatMessage } from "../services/careerChatService";
import {
  MAX_HISTORY_CONTENT_LENGTH,
  MAX_HISTORY_TOTAL_LENGTH,
  validateTextInputs,
} from "../middleware/apiProtection";

const MAX_HISTORY_SIZE = 20;
const MAX_MESSAGE_LENGTH = 2000;

export async function chatController(req: Request, res: Response): Promise<void> {
  try {
    const { resumeText, jobDescription, message, conversationHistory, analysis, semanticResult, careerPlan } = req.body;

    // Validate required fields
    if (!validateTextInputs(resumeText, jobDescription, res)) {
      return;
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "message is required and cannot be empty." });
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({ error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.` });
      return;
    }

    // Validate conversation history
    if (conversationHistory && !Array.isArray(conversationHistory)) {
      res.status(400).json({ error: "conversationHistory must be an array." });
      return;
    }

    if (conversationHistory && conversationHistory.length > MAX_HISTORY_SIZE) {
      res.status(400).json({ error: `Conversation history exceeds maximum of ${MAX_HISTORY_SIZE} messages.` });
      return;
    }

    const history = Array.isArray(conversationHistory) ? conversationHistory : [];
    const validHistory = history.every(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" &&
        item.content.length <= MAX_HISTORY_CONTENT_LENGTH
    );
    const historyLength = history.reduce(
      (total, item) => total + (typeof item?.content === "string" ? item.content.length : 0),
      0
    );
    if (!validHistory || historyLength > MAX_HISTORY_TOTAL_LENGTH) {
      res.status(400).json({ error: "Conversation history contains invalid or oversized messages." });
      return;
    }

    const result = await handleChatMessage({
      resumeText: resumeText.trim(),
      jobDescription: jobDescription.trim(),
      message: message.trim(),
      conversationHistory: history,
      analysis,
      semanticResult,
      careerPlan,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("[chatController] Error:", error);
    const msg = error instanceof Error ? error.message : "Chat request failed.";

    if (msg.includes("API key")) {
      res.status(503).json({ error: msg });
      return;
    }

    res.status(500).json({ error: msg || "Failed to process chat message." });
  }
}
