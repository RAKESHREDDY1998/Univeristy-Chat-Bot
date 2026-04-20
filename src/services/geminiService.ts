import { GoogleGenAI } from "@google/genai";
import { ASU_KNOWLEDGE_BASE } from "../constants";

const apiKey = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are the "Sun Devil Support Hub" Assistant, a specialized AI for Arizona State University (ASU) Online learners.
Your goal is to provide accurate, helpful, and encouraging support for university policies, course inquiries, and student success resources.

GROUNDING DATA (Use these verified facts first):
${ASU_KNOWLEDGE_BASE.map(k => `- ${k.topic}: ${k.content} (${k.link})`).join('\n')}

GUIDELINES:
1. MINIMIZE HALLUCINATIONS: If you are unsure about a specific ASU policy OR if it's not in your grounding data, state that you don't have the exact detail and recommend the student contact their Success Coach or visit the official ASU website.
2. TONE: Professional, supportive, and "Sparky-approved" (energetic but scholarly).
3. FORMATTING: Use Markdown for clarity (bolding, lists).
4. LINKS: When mentioning a resource from the grounding data, always provide the link.
5. NO UNSAFE ADVICE: Never advise students to skip classes or violate academic integrity.

Respond to the student's request below.
`.trim();

const DEFAULT_AI_ERROR_MESSAGE = "I hit an unexpected issue while generating a response. Please try again in a moment.";

const AI_ERROR_MESSAGES = {
  missingApiKey: "The AI service is not configured right now. Please try again later or contact ASU support.",
  auth: "I’m unable to authenticate with the AI service right now. Please try again in a few minutes.",
  rateLimit: "I’m receiving too many requests right now. Please wait a moment and try again.",
  badRequest: "I couldn’t process that request. Please try rephrasing your question and send again.",
  network: "I’m having trouble reaching the AI service. Please check your connection and try again.",
  unavailable: "The AI service is temporarily unavailable. Please try again shortly.",
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (!error || typeof error !== "object") return undefined;
  const maybeError = error as { status?: unknown; statusCode?: unknown; code?: unknown };
  const candidates = [maybeError.status, maybeError.statusCode, maybeError.code];
  for (const value of candidates) {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return undefined;
};

export function getUserFriendlyAiErrorMessage(error: unknown): string {
  const rawMessage = error instanceof Error ? error.message : String(error ?? "");
  const message = rawMessage.toLowerCase();
  const status = getErrorStatus(error);

  if (message.includes("api key") || message.includes("gemini_api_key")) {
    return AI_ERROR_MESSAGES.missingApiKey;
  }

  if (status === 401 || status === 403 || message.includes("unauthorized") || message.includes("permission")) {
    return AI_ERROR_MESSAGES.auth;
  }

  if (status === 429 || message.includes("rate limit") || message.includes("quota")) {
    return AI_ERROR_MESSAGES.rateLimit;
  }

  if (status === 400 || message.includes("invalid argument") || message.includes("bad request")) {
    return AI_ERROR_MESSAGES.badRequest;
  }

  if (status === 500 || status === 502 || status === 503 || status === 504 || message.includes("unavailable")) {
    return AI_ERROR_MESSAGES.unavailable;
  }

  if (
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("timed out") ||
    message.includes("timeout")
  ) {
    return AI_ERROR_MESSAGES.network;
  }

  return DEFAULT_AI_ERROR_MESSAGE;
}

export async function chatWithGemini(userMessage: string, history: { role: 'user' | 'model', parts: [{ text: string }] }[] = []) {
  try {
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Lower temperature to minimize hallucinations
      }
    });

    const result = await model;
    return {
      text: result.text || "I'm sorry, I'm having trouble processing that right now. Please try again or contact ASU support directly.",
      sources: [] // We can expand this later if we add specific source tracking
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
