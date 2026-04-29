// ============================================================
// MatdataMitra Backend — Translation Service
// Primary: Google Cloud Translation API
// Fallback: Gemini (if Cloud Translation unavailable)
// ============================================================

import { v2 } from "@google-cloud/translate";
import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";

const translateClient = new v2.Translate({
  projectId: env.GOOGLE_CLOUD_PROJECT_ID,
});

const genai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

export const SUPPORTED_LANGUAGES: Record<string, string> = {
  hi: "Hindi", en: "English", bn: "Bengali", ta: "Tamil",
  te: "Telugu", mr: "Marathi", gu: "Gujarati", kn: "Kannada",
  ml: "Malayalam", pa: "Punjabi", or: "Odia", as: "Assamese",
  ur: "Urdu", ne: "Nepali", sa: "Sanskrit",
};

/**
 * Translate text using Google Cloud Translation API
 * Falls back to Gemini if Cloud Translation fails
 */
export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  if (sourceLanguage === targetLanguage) return text;

  // Try Google Cloud Translation first
  try {
    const [translation] = await translateClient.translate(text, {
      from: sourceLanguage,
      to: targetLanguage,
    });
    return translation;
  } catch (error) {
    console.warn("⚠️  Cloud Translation failed, falling back to Gemini:", (error as Error).message);
  }

  // Fallback: Gemini translation
  try {
    const srcName = SUPPORTED_LANGUAGES[sourceLanguage] ?? sourceLanguage;
    const tgtName = SUPPORTED_LANGUAGES[targetLanguage] ?? targetLanguage;

    const response = await genai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: [{
        role: "user",
        parts: [{
          text: `Translate the following text from ${srcName} to ${tgtName}. 
Return ONLY the translated text, nothing else. No explanations, no quotes, no labels.

Text to translate:
${text}`,
        }],
      }],
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("❌ Translation Error (both services failed):", error);
    return text;
  }
}

/**
 * Detect language using Google Cloud Translation API
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const [detections] = await translateClient.detect(text);
    const detection = Array.isArray(detections) ? detections[0] : detections;
    return detection?.language ?? "en";
  } catch {
    return "en";
  }
}
