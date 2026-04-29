// ============================================================
// MatdataMitra Backend — WhatsApp Business API Webhook
// Jugalbandi-style architecture for voter queries via WhatsApp
// ============================================================

import { Router, Request, Response } from "express";
import axios from "axios";
import { env } from "../config/env";
import { generateResponse } from "../services/gemini.service";
import { buildAugmentedPrompt } from "../services/rag.service";

import { whatsappLimiter } from "../middleware/rateLimiter";
import type { WhatsAppWebhookPayload } from "@matdata-mitra/shared-types";

const router = Router();

// ── Opt-in tracking (use a database in production) ──
const optedInUsers: Set<string> = new Set();

/**
 * GET /api/whatsapp/webhook
 * Verification endpoint for WhatsApp webhook registration
 */
router.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"] as string;
  const token = req.query["hub.verify_token"] as string;
  const challenge = req.query["hub.challenge"] as string;

  if (mode === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ WhatsApp webhook verified");
    return res.status(200).send(challenge);
  }

  console.warn("⚠️  WhatsApp webhook verification failed");
  return res.sendStatus(403);
});

/**
 * POST /api/whatsapp/webhook
 * Handle incoming WhatsApp messages
 */
router.post("/webhook", whatsappLimiter, async (req: Request, res: Response) => {
  try {
    // Always respond 200 immediately to WhatsApp (required)
    res.sendStatus(200);

    const payload: WhatsAppWebhookPayload = req.body;
    const changes = payload?.entry?.[0]?.changes?.[0]?.value;
    if (!changes?.messages?.[0]) return;

    const message = changes.messages[0];
    const senderPhone = message.from;

    // ── Opt-in compliance check ──
    if (!optedInUsers.has(senderPhone)) {
      if (message.type === "text" && message.text?.body.toLowerCase().includes("start")) {
        optedInUsers.add(senderPhone);
        await sendWhatsAppMessage(
          senderPhone,
          "🗳️ *Welcome to MatdataMitra!*\n\nYou've opted in to receive voter assistance. " +
          "Ask me anything about:\n• Voter registration\n• Polling booth location\n• Election dates\n• e-EPIC download\n\n" +
          "Type *STOP* to opt out anytime."
        );
      } else {
        await sendWhatsAppMessage(
          senderPhone,
          "👋 Welcome! Please type *START* to opt in and begin using MatdataMitra, your electoral assistant."
        );
      }
      return;
    }

    // ── Opt-out handling ──
    if (message.type === "text" && message.text?.body.toLowerCase().includes("stop")) {
      optedInUsers.delete(senderPhone);
      await sendWhatsAppMessage(
        senderPhone,
        "You've been opted out of MatdataMitra. Type *START* anytime to re-subscribe. 🙏"
      );
      return;
    }

    // ── Process text messages ──
    if (message.type === "text" && message.text?.body) {
      const userQuery = message.text.body;
      await processAndReply(senderPhone, userQuery);
    }
  } catch (error) {
    console.error("❌ WhatsApp Webhook Error:", error);
  }
});

/** Process a user query through RAG + Gemini and reply via WhatsApp */
async function processAndReply(phone: string, query: string): Promise<void> {
  try {
    // Send "typing" indicator
    await sendWhatsAppMessage(phone, "🔍 Looking up your answer...");

    // Translate to English if needed (auto-detect via Gemini)
    const ragContext = await buildAugmentedPrompt(query);
    const aiResponse = await generateResponse(query, ragContext.augmentedPrompt);

    // WhatsApp has a 4096 character limit per message
    const truncated = aiResponse.length > 4000 ? aiResponse.substring(0, 4000) + "..." : aiResponse;

    await sendWhatsAppMessage(phone, truncated);
  } catch (error) {
    console.error("❌ WhatsApp processing error:", error);
    await sendWhatsAppMessage(phone, "Sorry, I encountered an error. Please try again.");
  }
}

/** Send a text message via WhatsApp Business API */
async function sendWhatsAppMessage(to: string, body: string): Promise<void> {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      },
      {
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ WhatsApp send error:", error);
  }
}

export default router;
