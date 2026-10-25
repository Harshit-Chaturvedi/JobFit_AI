"use client";

import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "@/lib/api";
import AssistantMarkdown from "@/components/AssistantMarkdown";
import {
  ChatMessage,
  AnalysisResult,
  SemanticMatchResponse,
  CareerPlanResult,
} from "@/types/analysis";

interface CareerChatProps {
  resumeText: string;
  jobDescription: string;
  analysis: AnalysisResult;
  semanticResult?: SemanticMatchResponse | null;
  careerPlan?: CareerPlanResult | null;
}

const SUGGESTED_QUESTIONS = [
  "Am I ready to apply?",
  "What should I learn first?",
  "Which missing skill matters most?",
  "How can I improve my resume for this role?",
  "Suggest a project I can build.",
  "Why did I get this match score?",
];

export default function CareerChat({
  resumeText,
  jobDescription,
  analysis,
  semanticResult,
  careerPlan,
}: CareerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const messageText = (text || input).trim();
    if (!messageText || loading) return;

    setInput("");
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: messageText };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await sendChatMessage({
        resumeText,
        jobDescription,
        message: messageText,
        conversationHistory: messages,
        analysis,
        semanticResult: semanticResult
          ? {
              semanticScore: semanticResult.semanticScore,
              matchedRequirements: semanticResult.matchedRequirements.map((m) => ({
                requirement: m.requirement,
                similarity: m.similarity,
              })),
              unmatchedRequirements: semanticResult.unmatchedRequirements,
            }
          : undefined,
        careerPlan: careerPlan || undefined,
      });

      const assistantMsg: ChatMessage = { role: "assistant", content: response.message };
      setMessages([...updatedMessages, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get a response.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="analysis-result-action w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
      >
        Open Career Assistant
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-slate-900/60 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">Career Assistant</h3>
          <span className="text-xs text-emerald-400/70 hidden sm:inline">
            — grounded in your resume &amp; this role
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded border border-slate-700 hover:border-slate-500 transition-colors"
        >
          Minimize
        </button>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-3 scroll-smooth">
        {/* Intro message */}
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <p className="text-sm text-slate-300">
                Ask me anything about your fit for this role. I have access to your resume, the job description,
                match analysis{semanticResult ? ", semantic matching" : ""}{careerPlan ? ", and your improvement plan" : ""}.
              </p>
            </div>

            {/* Suggested questions */}
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/50 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all duration-150 cursor-pointer disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-500/20 text-indigo-100 border border-indigo-500/30"
                  : "bg-slate-800/60 text-slate-200 border border-slate-700/50"
              }`}
            >
              {msg.role === "assistant" ? (
                <AssistantMarkdown content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3.5 py-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-4 py-3 bg-slate-900/80 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your fit, skills, or next steps..."
            maxLength={2000}
            disabled={loading}
            className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              loading || !input.trim()
                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
