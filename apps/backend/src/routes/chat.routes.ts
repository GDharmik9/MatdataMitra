// ============================================================
// MatdataMitra Backend — Chat Routes
// Text-based chat endpoint with Gemini translation
// ============================================================

import { Router, Request, Response } from "express";
import { generateResponse, determineIntent } from "../services/gemini.service";
import { buildAugmentedPrompt } from "../services/rag.service";
import { translateText } from "../services/bhashini.service";
import { findLocalAnswer } from "../services/firestore.service";
import { apiCache, generateCacheKey } from "../services/cache.service";
import type { ChatRequest, ChatResponse, ApiResponse } from "@matdata-mitra/shared-types";

import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  language: z.enum(['en','hi','mr','bn','te','ta','gu','kn','ml','pa','or','as','ur']).optional().default('en'),
  conversationId: z.string().uuid().optional(),
});

const router = Router();

/**
 * POST /api/chat
 * Process a text-based chat message through the full pipeline:
 * 1. Translate to English (if needed) — via Gemini
 * 2. Determine intent
 * 3. Retrieve RAG context
 * 4. Generate Gemini response
 * 5. Translate response back to user language — via Gemini
 * (STT/TTS handled by browser's Web Speech API on the frontend)
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = chatSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        timestamp: Date.now(),
      } as ApiResponse);
    }

    const { message, language } = parsed.data;

    // --- CACHE CHECK ---
    const cacheKey = generateCacheKey(language, message);
    const cachedResponse = apiCache.get<ChatResponse>(cacheKey);
    
    if (cachedResponse) {
      console.log(`⚡ Cache Hit! Returning response in 0ms for: "${message}"`);
      return res.json({
        success: true,
        data: cachedResponse,
        timestamp: Date.now(),
      } satisfies ApiResponse<ChatResponse>);
    }
    // -------------------

    // Step 1: Translate to English for processing
    let processableText = message;
    if (language !== "en") {
      try {
        processableText = await translateText(message, language, "en");
      } catch {
        processableText = message;
      }
    }

    // Step 2: Check Local Database FIRST (The "Wall")
    const localAnswer = await findLocalAnswer(processableText);
    
    if (localAnswer) {
      console.log(`🛡️  Wall activated: Returning local data, bypassing Gemini API.`);
      
      // Translate back if necessary
      let finalReply = localAnswer;
      if (language !== "en") {
        try {
          finalReply = await translateText(localAnswer, "en", language);
        } catch {
          finalReply = localAnswer;
        }
      }

      return res.json({
        success: true,
        data: {
          reply: localAnswer,
          translatedReply: language !== "en" ? finalReply : undefined,
          language,
          sources: [{ 
            documentId: "local-db", 
            title: "MatdataMitra Local Cache", 
            excerpt: "Retrieved from Firestore cache", 
            relevanceScore: 1.0, 
            source: "Firestore" 
          }]
        },
        timestamp: Date.now(),
      } satisfies ApiResponse<ChatResponse>);
    }

    // Step 3: Determine intent (only if local DB didn't match)
    const intent = await determineIntent(processableText);
    console.log(`🎯 Intent: ${intent.intent} (${intent.confidence})`);

    // Step 3: Build RAG-augmented prompt
    const ragContext = await buildAugmentedPrompt(processableText);

    // Step 4: Generate AI response
    const aiResponse = await generateResponse(
      processableText,
      ragContext.augmentedPrompt !== processableText
        ? ragContext.augmentedPrompt
        : undefined
    );

    // Step 5: Translate response back to user language
    let translatedReply = aiResponse;
    if (language !== "en") {
      try {
        translatedReply = await translateText(aiResponse, "en", language);
      } catch {
        translatedReply = aiResponse;
      }
    }

    const response: ChatResponse = {
      reply: aiResponse,
      translatedReply: language !== "en" ? translatedReply : undefined,
      language,
      sources: ragContext.retrievedDocuments,
    };

    // Store in cache for future identical queries (5 minutes TTL)
    apiCache.set(cacheKey, response);

    return res.json({
      success: true,
      data: response,
      timestamp: Date.now(),
    } satisfies ApiResponse<ChatResponse>);
  } catch (error) {
    console.error("❌ Chat Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process chat message",
      timestamp: Date.now(),
    } satisfies ApiResponse);
  }
});

export default router;
