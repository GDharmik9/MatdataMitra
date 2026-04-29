// ============================================================
// MatdataMitra Backend — Rate Limiter Middleware
// ============================================================

import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/** General API rate limiter */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
    timestamp: Date.now(),
  },
});

/** Stricter rate limiter for WhatsApp webhook to prevent account bans */
export const whatsappLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.WHATSAPP_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per sender phone number
    const from =
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
    return from ?? req.ip ?? "unknown";
  },
  message: {
    success: false,
    error: "WhatsApp rate limit exceeded. Please wait before sending more messages.",
    timestamp: Date.now(),
  },
});

/** Voter verification rate limiter (prevent API abuse) */
export const voterVerifyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // 5 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many verification attempts. Please wait a minute.",
    timestamp: Date.now(),
  },
});
