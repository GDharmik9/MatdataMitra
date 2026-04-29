// ============================================================
// MatdataMitra Frontend — WebSocket Client Utility
// Connects to the backend Media Gateway for real-time voice chat
// ============================================================

import { WSEventType } from "@matdata-mitra/shared-types";

type WSCallback = (data: unknown) => void;

class MediaWebSocket {
  private ws: WebSocket | null = null;
  private listeners: Map<WSEventType, WSCallback[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  /** Connect to the WebSocket Media Gateway */
  connect(url?: string): void {
    const wsUrl = url ?? process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws/media";

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log("🟢 WebSocket connected");
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const callbacks = this.listeners.get(message.event) ?? [];
          callbacks.forEach((cb) => cb(message.data));
        } catch (error) {
          console.error("WebSocket message parse error:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("🔴 WebSocket disconnected");
        this.attemptReconnect(wsUrl);
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("WebSocket connection failed:", error);
    }
  }

  /** Disconnect from the WebSocket */
  disconnect(): void {
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /** Send an audio chunk to the backend */
  sendAudioChunk(audioBase64: string, language: string, isLast: boolean): void {
    this.send(WSEventType.AUDIO_CHUNK, { audio: audioBase64, language, isLast, sampleRate: 16000 });
  }

  /** Subscribe to a WebSocket event */
  on(event: WSEventType, callback: WSCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /** Remove event listener */
  off(event: WSEventType, callback: WSCallback): void {
    const callbacks = this.listeners.get(event) ?? [];
    this.listeners.set(event, callbacks.filter((cb) => cb !== callback));
  }

  /** Check if connected */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private send(event: WSEventType, data: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data, timestamp: Date.now() }));
    } else {
      console.warn("WebSocket not connected, cannot send message");
    }
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
    setTimeout(() => this.connect(url), this.reconnectDelay * this.reconnectAttempts);
  }
}

// Singleton instance
export const mediaWS = new MediaWebSocket();
export default mediaWS;
