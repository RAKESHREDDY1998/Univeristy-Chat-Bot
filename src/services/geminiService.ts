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
