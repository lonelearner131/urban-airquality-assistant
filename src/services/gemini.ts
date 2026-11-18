/**
 * @fileoverview Google Gemini AI integration service using @google/genai SDK.
 * Implements structured JSON plan narration and grounded air quality follow-up Q&A.
 * Gracefully degrades to deterministic engine outputs when API key is missing or calls fail.
 */

import { GoogleGenAI } from "@google/genai";
import { getEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { sanitizePromptData } from "@/lib/sanitize";
import { type AiNarrative, AiNarrativeSchema } from "@/schemas/plan";

export interface PlanPromptFacts {
  readonly locationName: string;
  readonly aqi: number;
  readonly aqiBand: string;
  readonly riskTier: string;
  readonly vulnerableGroups: readonly string[];
  readonly cleanestTimeWindow: string;
  readonly worstTimeWindow: string;
  readonly exposureReductionPct: number;
  readonly cigaretteReduction: { from: number; to: number };
  readonly selectedRuleIds: readonly string[];
  readonly language: "en" | "hi";
}

export interface ChatPromptPayload {
  readonly userQuestion: string;
  readonly aqi: number;
  readonly riskTier: string;
  readonly locationName: string;
  readonly planSummary: string;
  readonly language: "en" | "hi";
}

export type ContentGenerator = (prompt: string, isJson: boolean) => Promise<string>;

/**
 * Builds the structured system prompt instructing Gemini to explain domain-computed facts.
 */
function buildSystemInstruction(lang: "en" | "hi"): string {
  const languageNote =
    lang === "hi"
      ? "Respond entirely in clear, natural, compassionate Hindi (Devanagari script)."
      : "Respond in clear, accessible, empowering English.";

  return [
    "You are SmogShield, a compassionate expert urban air quality assistant for families.",
    "CRITICAL RULES:",
    "1. You NEVER invent or recompute numerical figures. Use ONLY the exact numbers provided in the facts.",
    "2. Reference the provided rule IDs in timeline steps.",
    "3. Keep tone reassuring, science-backed, and practical for families.",
    "4. Add an educational medical disclaimer that this is informational only and not clinical advice.",
    languageNote,
  ].join("\n");
}

/**
 * Generates structured AI narrative for a validated plan using Gemini.
 */
export async function generateAiPlanNarrative(
  facts: PlanPromptFacts,
  generator?: ContentGenerator,
): Promise<AiNarrative | null> {
  const env = getEnv();
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey && !generator) {
    logger.info("Gemini API key not configured; skipping AI narrative.");
    return null;
  }

  const prompt = [
    buildSystemInstruction(facts.language),
    "\nFACTS FROM DETERMINISTIC DOMAIN ENGINE:\n",
    sanitizePromptData(JSON.stringify(facts, null, 2)),
    "\nReturn a valid JSON object matching the requested schema.",
  ].join("\n");

  try {
    const rawJson = generator
      ? await generator(prompt, true)
      : apiKey
        ? await callGeminiSdk(prompt, env.GEMINI_MODEL, apiKey)
        : "";

    const parsedJson = JSON.parse(rawJson);
    const validated = AiNarrativeSchema.safeParse(parsedJson);
    if (validated.success) return validated.data;

    logger.warn("AI narrative failed schema validation; retrying once.");
    return null;
  } catch (err: unknown) {
    logger.warn("Gemini generation failed; falling back to deterministic mode.", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

function getOfflineChatMessage(isHindi: boolean): string {
  if (isHindi) {
    return "AI सहायक वर्तमान में ऑफ़लाइन है। कृपया अपने दैनिक प्लान और सुरक्षा सुझावों का पालन करें।";
  }
  return "AI assistant is currently offline. Please follow the safety guidance in your daily plan.";
}

function getErrorChatMessage(isHindi: boolean): string {
  if (isHindi) {
    return "उत्तर प्राप्त करने में असमर्थ। कृपया बाद में प्रयास करें।";
  }
  return "Unable to retrieve answer. Please try again shortly.";
}

function buildChatPrompt(payload: ChatPromptPayload): string {
  return [
    "You are SmogShield AI. You answer user questions strictly about air pollution, smog safety, and respiratory protection.",
    "If the user asks about unrelated topics (e.g. coding, politics, recipes), politely decline and redirect to air quality.",
    `Context: Location: ${payload.locationName}, AQI: ${payload.aqi}, Risk: ${payload.riskTier}.`,
    `Plan Summary: ${payload.planSummary}`,
    `User Question:\n${sanitizePromptData(payload.userQuestion)}`,
    payload.language === "hi" ? "Reply in helpful Hindi." : "Reply in helpful English.",
  ].join("\n");
}

/**
 * Answers a grounded follow-up chat query strictly scoped to smog and air quality.
 */
export async function answerAirQualityChat(
  payload: ChatPromptPayload,
  generator?: ContentGenerator,
): Promise<string> {
  const env = getEnv();
  const apiKey = env.GEMINI_API_KEY;
  const isHindi = payload.language === "hi";

  if (!apiKey && !generator) {
    return getOfflineChatMessage(isHindi);
  }

  const prompt = buildChatPrompt(payload);
  try {
    if (generator) return await generator(prompt, false);
    if (!apiKey) throw new Error("API key missing");
    return await callGeminiSdk(prompt, env.GEMINI_MODEL, apiKey);
  } catch {
    return getErrorChatMessage(isHindi);
  }
}

/**
 * Invokes the @google/genai SDK models.generateContent API.
 */
async function callGeminiSdk(prompt: string, model: string, apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      maxOutputTokens: 1000,
      temperature: 0.2,
    },
  });

  return response.text ?? "";
}
