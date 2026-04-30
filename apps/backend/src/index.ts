// ============================================================
// MatdataMitra Backend — Express Server Entry Point
// ============================================================

import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";

import { env } from "./config/env";
import { initializeRAGPipeline } from "./services/rag.service";
import { initializeWebSocket } from "./websocket/media-gateway";
import { apiLimiter } from "./middleware/rateLimiter";

// ── Route Imports ──
import chatRoutes from "./routes/chat.routes";
import voterRoutes from "./routes/voter.routes";
import civicRoutes from "./routes/civic.routes";
import candidateRoutes from "./routes/candidate.routes";
import whatsappRoutes from "./routes/whatsapp.routes";

export const app = express();
const server = http.createServer(app);

// ── Global Middleware ──
app.use(helmet());
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://matdatamitra.com"
];

if (env.FRONTEND_URL) {
  allowedOrigins.push(env.FRONTEND_URL);
}

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check (Cloud Run requirement) ──
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "matdata-mitra-backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ──
app.use("/api/chat", apiLimiter, chatRoutes);
app.use("/api/voter", voterRoutes);
app.use("/api/civic", apiLimiter, civicRoutes);
app.use("/api/candidates", apiLimiter, candidateRoutes);
app.use("/api/whatsapp", whatsappRoutes);


// ── 404 Handler ──
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    timestamp: Date.now(),
  });
});

// ── Global Error Handler ──
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("💥 Unhandled Error:", err);
  res.status(500).json({
    success: false,
    error: env.NODE_ENV === "production" ? "Internal server error" : err.message,
    timestamp: Date.now(),
  });
});

// ── Start Server ──
async function start(): Promise<void> {
  // Initialize RAG pipeline (load documents)
  await initializeRAGPipeline();

  // Initialize WebSocket Media Gateway
  initializeWebSocket(server);

  server.listen(env.PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║         🗳️  MatdataMitra Backend             ║
║══════════════════════════════════════════════║
║  REST API:    http://localhost:${env.PORT}         ║
║  WebSocket:   ws://localhost:${env.PORT}/ws/media   ║
║  Health:      http://localhost:${env.PORT}/health   ║
║  Environment: ${env.NODE_ENV.padEnd(30)}║
╚══════════════════════════════════════════════╝
    `);
  });
}

start().catch((error) => {
  console.error("💥 Failed to start server:", error);
  process.exit(1);
});

export default app;
