// ============================================================
// MatdataMitra Backend — Environment Configuration
// Centralized env variable validation and export
// ============================================================

import dotenv from "dotenv";
import path from "path";

// Load .env from monorepo root
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

interface EnvConfig {
  // Server
  PORT: number;
  NODE_ENV: string;
  FRONTEND_URL: string;

  // Google Cloud
  GOOGLE_CLOUD_PROJECT_ID: string;
  GCS_BUCKET_NAME: string;

  // Gemini
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;

  // Google Civic
  CIVIC_API_KEY: string;

  // WhatsApp (Meta Developer Sandbox)
  WHATSAPP_VERIFY_TOKEN: string;
  WHATSAPP_ACCESS_TOKEN: string;
  WHATSAPP_PHONE_NUMBER_ID: string;

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  WHATSAPP_RATE_LIMIT_MAX: number;
}

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    console.warn(`⚠️  Missing environment variable: ${key}`);
    return "";
  }
  return value;
}

function getEnvNumber(key: string, fallback: number): number {
  const value = process.env[key];
  return value ? parseInt(value, 10) : fallback;
}

export const env: EnvConfig = {
  PORT: getEnvNumber("PORT", 8080),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  FRONTEND_URL: getEnv("FRONTEND_URL", "http://localhost:3000"),

  GOOGLE_CLOUD_PROJECT_ID: getEnv("GOOGLE_CLOUD_PROJECT_ID"),
  GCS_BUCKET_NAME: getEnv("GCS_BUCKET_NAME", "matdata-mitra-documents"),

  GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),
  GEMINI_MODEL: getEnv("GEMINI_MODEL", "gemini-2.5-flash"),

  CIVIC_API_KEY: getEnv("CIVIC_API_KEY"),

  WHATSAPP_VERIFY_TOKEN: getEnv("WHATSAPP_VERIFY_TOKEN"),
  WHATSAPP_ACCESS_TOKEN: getEnv("WHATSAPP_ACCESS_TOKEN"),
  WHATSAPP_PHONE_NUMBER_ID: getEnv("WHATSAPP_PHONE_NUMBER_ID"),

  RATE_LIMIT_WINDOW_MS: getEnvNumber("RATE_LIMIT_WINDOW_MS", 900000),
  RATE_LIMIT_MAX_REQUESTS: getEnvNumber("RATE_LIMIT_MAX_REQUESTS", 100),
  WHATSAPP_RATE_LIMIT_MAX: getEnvNumber("WHATSAPP_RATE_LIMIT_MAX", 20),
};

export default env;
