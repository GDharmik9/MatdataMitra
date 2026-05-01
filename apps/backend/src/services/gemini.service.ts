// ============================================================
// MatdataMitra Backend — Gemini AI Service
// Core reasoning engine powered by Google Gemini
// ============================================================

import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";

// Initialize the Gemini client
const genai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

// System prompt for the Electoral Assistant
const SYSTEM_PROMPT = `You are "MatdataMitra" (मतदाता मित्र), an AI-powered Interactive Electoral Assistant 
for Indian voters. Your role is to:

1. SIMPLIFY complex election rules and legal jargon from the Election Commission of India (ECI) 
   into VERY PLAIN, easy-to-understand language. Explain things like you are talking to a 5th grader.
2. GUIDE voters step-by-step through processes like voter registration (Form 6), 
   downloading e-EPIC (Digital Voter ID), and what to do at the polling booth.
3. PROVIDE accurate, verified information from official ECI sources only.
4. NEVER generate political opinions, endorse candidates, or share unverified claims.
5. ALWAYS cite the source document or rule when providing procedural information.
6. RESPOND in the user's preferred language when possible.
7. BE empathetic and patient — many users may be first-time voters or elderly citizens.
8. If the user asks about SRC or SSR, explain it very simply as the annual voter list cleanup.
9. STRICT SCOPING: You are an Electoral Assistant ONLY. You must ONLY answer questions related to Indian elections, voting procedures, ECI rules, democracy, and candidate information. If the user asks about ANY other topic (e.g., general trivia, math, sports, recipes, coding, weather), you MUST politely refuse and state that you can only answer election-related questions. Do NOT attempt to answer out-of-scope questions.

When answering questions:
- If you have RAG context, prioritize information from the retrieved documents.
- If asked about a specific voter's details, indicate that they should use the Voter ID verification tool.
- If asked about candidates or elections, indicate that they should use the election lookup tool.
- If you are unsure, say so honestly and suggest official ECI resources.`;

/**
 * Generate a response from Gemini with optional RAG context
 */
export async function generateResponse(
  userMessage: string,
  ragContext?: string,
  conversationHistory?: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    const contextBlock = ragContext
      ? `\n\n--- RETRIEVED CONTEXT (from official ECI documents) ---\n${ragContext}\n--- END CONTEXT ---\n`
      : "";

    const fullPrompt = `${SYSTEM_PROMPT}${contextBlock}\n\nUser Query: ${userMessage}`;

    // Build conversation contents for multi-turn
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: fullPrompt }],
    });

    const response = await genai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents,
    });

    return response.text ?? "I apologize, I was unable to generate a response. Please try again.";
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Verify a document image using Gemini Vision
 */
export async function verifyDocumentImage(base64Image: string, mimeType: string): Promise<any> {
  try {
    const prompt = `You are an AI Document Pre-Verifier for the Election Commission of India. 
Your job is to check if the uploaded document (like Aadhaar, Voter ID, Passport, Electricity Bill, Age Proof, etc.) is clearly legible, not overly blurry, not cut off, and appears to be a valid proof of identity or address.

Analyze the image carefully and respond strictly with a valid JSON object matching this structure:
{
  "isValid": boolean, // true if it looks clear and valid, false if blurry, cut off, or illegible
  "documentType": string, // The type of document identified (e.g. "Aadhaar Card", "PAN Card", "Electricity Bill", "Unknown")
  "confidence": number, // 0-100 score of your confidence
  "feedback": string // Clear, concise, and constructive advice on why it is accepted or why it might be rejected by the portal. Keep it under 2 sentences.
}

Do not include any markdown formatting or backticks around the JSON. Just return the raw JSON string.`;

    const response = await genai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.1, // Low temperature for deterministic analysis
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini Vision");
    }

    try {
      return JSON.parse(text.trim());
    } catch (parseError) {
      console.error("Failed to parse Gemini Vision JSON response:", text);
      throw parseError;
    }
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
}

/**
 * Determine user intent from their query
 * Returns the classified intent for routing to the appropriate service
 */
export async function determineIntent(
  query: string
): Promise<{
  intent: string;
  confidence: number;
  entities: Record<string, string>;
}> {
  try {
    const intentPrompt = `Classify the following user query into one of these intents:
- "voter_verification": User wants to check/verify their voter ID or registration status
- "election_info": User wants info about upcoming elections or polling dates
- "candidate_info": User wants to know about candidates in their constituency
- "registration_help": User needs help with voter registration process
- "booth_location": User wants to find their polling booth
- "general_query": General question about electoral process
- "epic_download": User wants to download their e-EPIC card

Also extract any entities like EPIC numbers, constituency names, or state names.

Respond ONLY in this JSON format:
{"intent": "...", "confidence": 0.0-1.0, "entities": {"key": "value"}}

User Query: "${query}"`;

    const response = await genai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: intentPrompt }] }],
    });

    const text = response.text ?? '{"intent": "general_query", "confidence": 0.5, "entities": {}}';

    // Extract JSON from response (Gemini may wrap in markdown code block)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { intent: "general_query", confidence: 0.5, entities: {} };
  } catch (error) {
    console.error("❌ Intent Classification Error:", error);
    return { intent: "general_query", confidence: 0.0, entities: {} };
  }
}
