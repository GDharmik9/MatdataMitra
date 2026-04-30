// ============================================================
// MatdataMitra Backend — Cache Service
// High-performance in-memory caching to reduce AI API costs
// ============================================================

import NodeCache from "node-cache";

// Standard TTL of 5 minutes (300 seconds) to prevent stale responses
// Check period is 120 seconds to clean up expired keys
export const apiCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

/**
 * Generates a consistent cache key for chat requests
 * @param language The requested language code
 * @param query The user's query
 * @returns A normalized cache key string
 */
export function generateCacheKey(language: string, query: string): string {
  // Normalize by lowering case and trimming whitespace
  const normalizedQuery = query.toLowerCase().trim();
  return `chat_${language}_${Buffer.from(normalizedQuery).toString("base64")}`;
}
