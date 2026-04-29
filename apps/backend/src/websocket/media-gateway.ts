// ============================================================
// MatdataMitra Backend — WebSocket Media Gateway
// Audio pipeline: Browser audio → Cloud STT → Gemini → Cloud TTS → audio back
// Also supports text-only mode as fallback
// ============================================================

import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { speechToText, textToSpeechAudio } from "../services/speech.service";
import { generateResponse } from "../services/gemini.service";
import { buildAugmentedPrompt } from "../services/rag.service";
import { translateText } from "../services/bhashini.service";
import { WSEventType } from "@matdata-mitra/shared-types";

interface ClientSession {
  ws: WebSocket;
  language: string;
  isProcessing: boolean;
}

const sessions: Map<string, ClientSession> = new Map();

export function initializeWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws/media" });
  console.log("🔌 WebSocket Media Gateway initialized on /ws/media");

  wss.on("connection", (ws: WebSocket) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const session: ClientSession = { ws, language: "hi", isProcessing: false };
    sessions.set(sessionId, session);

    console.log(`🟢 Client connected: ${sessionId}`);
    sendEvent(ws, WSEventType.CONNECTED, { sessionId, message: "Connected to MatdataMitra" });

    ws.on("message", async (data: Buffer | string) => {
      try {
        const message = JSON.parse(data.toString());
        switch (message.event) {
          case WSEventType.AUDIO_CHUNK:
            await handleAudioQuery(sessionId, message.data);
            break;
          case WSEventType.TRANSCRIPTION:
            // Text-only mode (browser STT fallback)
            await handleTextQuery(sessionId, message.data);
            break;
          default:
            console.warn(`Unknown event: ${message.event}`);
        }
      } catch (error) {
        console.error("❌ WebSocket message error:", error);
        sendEvent(ws, WSEventType.ERROR, { message: "Failed to process message" });
      }
    });

    ws.on("close", () => { sessions.delete(sessionId); });
    ws.on("error", (error) => {
      console.error(`❌ WebSocket error (${sessionId}):`, error);
      sessions.delete(sessionId);
    });
  });

  return wss;
}

/**
 * Handle audio from browser MediaRecorder → Cloud STT → Gemini → Cloud TTS
 */
async function handleAudioQuery(
  sessionId: string,
  data: { audio: string; language: string }
): Promise<void> {
  const session = sessions.get(sessionId);
  if (!session || session.isProcessing) return;

  session.language = data.language || session.language;
  session.isProcessing = true;

  try {
    // 1. Google Cloud STT
    sendEvent(session.ws, WSEventType.PROCESSING, { stage: "transcribing" });
    const transcription = await speechToText(data.audio, session.language);
    sendEvent(session.ws, WSEventType.TRANSCRIPTION, {
      text: transcription.text,
      language: session.language,
      confidence: transcription.confidence,
    });

    if (!transcription.text.trim()) {
      sendEvent(session.ws, WSEventType.ERROR, { message: "Could not transcribe audio. Please try again." });
      return;
    }

    // 2–4. Process with Gemini and respond
    await processAndRespond(session, transcription.text);
  } catch (error) {
    console.error("❌ Audio Pipeline Error:", error);
    sendEvent(session.ws, WSEventType.ERROR, {
      message: error instanceof Error ? error.message : "Processing failed",
    });
  } finally {
    session.isProcessing = false;
  }
}

/**
 * Handle text query (browser STT fallback)
 */
async function handleTextQuery(
  sessionId: string,
  data: { text: string; language: string }
): Promise<void> {
  const session = sessions.get(sessionId);
  if (!session || session.isProcessing) return;

  session.language = data.language || session.language;
  session.isProcessing = true;

  try {
    await processAndRespond(session, data.text);
  } catch (error) {
    console.error("❌ Text Pipeline Error:", error);
    sendEvent(session.ws, WSEventType.ERROR, {
      message: error instanceof Error ? error.message : "Processing failed",
    });
  } finally {
    session.isProcessing = false;
  }
}

/**
 * Shared pipeline: Translate → RAG → Gemini → Translate back → TTS
 */
async function processAndRespond(session: ClientSession, userText: string): Promise<void> {
  // Translate to English
  sendEvent(session.ws, WSEventType.PROCESSING, { stage: "thinking" });
  let englishQuery = userText;
  if (session.language !== "en") {
    englishQuery = await translateText(userText, session.language, "en");
  }

  // RAG + Gemini
  const ragContext = await buildAugmentedPrompt(englishQuery);
  const aiResponse = await generateResponse(englishQuery, ragContext.augmentedPrompt);

  // Translate response back
  let localResponse = aiResponse;
  if (session.language !== "en") {
    localResponse = await translateText(aiResponse, "en", session.language);
  }

  sendEvent(session.ws, WSEventType.AI_RESPONSE, {
    text: localResponse,
    englishText: aiResponse,
    sources: ragContext.retrievedDocuments,
  });

  // Google Cloud TTS
  sendEvent(session.ws, WSEventType.PROCESSING, { stage: "synthesizing" });
  try {
    const ttsAudio = await textToSpeechAudio(localResponse, session.language);
    sendEvent(session.ws, WSEventType.TTS_AUDIO, { audio: ttsAudio, language: session.language });
  } catch {
    // TTS is optional — the frontend has browser TTS fallback
    console.warn("⚠️  Cloud TTS failed, frontend will use browser SpeechSynthesis");
  }
}

function sendEvent(ws: WebSocket, event: WSEventType, data: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ event, data, timestamp: Date.now() }));
  }
}
