// ============================================================
// MatdataMitra — Shared Type Definitions
// Used by both frontend and backend workspaces
// ============================================================

// ── Voter Information (Eko Bharat Ventures API Response) ──

export interface VoterInfo {
  epicNumber: string;
  name: string;
  relativeName: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  address: string;
  assemblyConstituency: string;
  assemblyConstituencyNumber: string;
  parliamentaryConstituency: string;
  partNumber: string;
  pollingStation: string;
  sectionName: string;
  state: string;
  district: string;
}

export interface VoterVerifyRequest {
  epicNumber: string;
}

export interface VoterVerifyResponse {
  success: boolean;
  data?: VoterInfo;
  error?: string;
}

// ── Chat & Messaging ──

export type MessageRole = "user" | "assistant" | "system";
export type MessageType = "text" | "audio" | "image";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  language?: string;
  audioUrl?: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  language: string;
  conversationId?: string;
  userId?: string;
}

export interface ChatResponse {
  reply: string;
  translatedReply?: string;
  audioBase64?: string;
  language: string;
  sources?: RAGSource[];
}

// ── WebSocket Events ──

export enum WSEventType {
  AUDIO_CHUNK = "audio_chunk",
  TRANSCRIPTION = "transcription",
  AI_RESPONSE = "ai_response",
  TTS_AUDIO = "tts_audio",
  ERROR = "error",
  CONNECTED = "connected",
  PROCESSING = "processing",
}

export interface WSMessage {
  event: WSEventType;
  data: unknown;
  timestamp: number;
}

export interface WSAudioChunk {
  audio: string; // base64 encoded audio
  language: string;
  sampleRate: number;
  isLast: boolean;
}

export interface WSTranscription {
  text: string;
  language: string;
  confidence: number;
}

// ── RAG Pipeline ──

export interface RAGSource {
  documentId: string;
  title: string;
  excerpt: string;
  relevanceScore: number;
  source: string;
}

export interface RAGContext {
  query: string;
  retrievedDocuments: RAGSource[];
  augmentedPrompt: string;
}

// ── Election & Civic Data (Google Civic API) ──

export interface ElectionInfo {
  id: string;
  name: string;
  electionDay: string;
  ocdDivisionId?: string;
}

export interface Representative {
  name: string;
  party: string;
  photoUrl?: string;
  phones?: string[];
  urls?: string[];
  emails?: string[];
  channels?: SocialChannel[];
  office: string;
}

export interface SocialChannel {
  type: string;
  id: string;
}

export interface CivicElectionsResponse {
  elections: ElectionInfo[];
}

export interface CivicRepresentativesResponse {
  representatives: Representative[];
  offices: string[];
}

// ── Language Support (Gemini Translation + Browser Web Speech API) ──

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

/** Supported Indian languages for translation and voice */
export type SupportedLanguageCode =
  | "hi" | "en" | "bn" | "ta" | "te" | "mr" | "gu"
  | "kn" | "ml" | "pa" | "or" | "as" | "ur";


// ── WhatsApp Webhook ──

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text" | "audio" | "image" | "interactive";
  text?: { body: string };
  audio?: { id: string; mime_type: string };
}

export interface WhatsAppWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{ profile: { name: string }; wa_id: string }>;
        messages?: WhatsAppMessage[];
        statuses?: Array<{ id: string; status: string; timestamp: string }>;
      };
      field: string;
    }>;
  }>;
}

// ── Voter Timeline ──

export enum TimelineStage {
  REGISTER = "register",
  DOWNLOAD_EPIC = "download_epic",
  FIND_BOOTH = "find_booth",
  PREPARE_VOTE = "prepare_vote",
  CAST_VOTE = "cast_vote",
  TRACK_RESULTS = "track_results",
}

export interface TimelineStep {
  stage: TimelineStage;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  active: boolean;
}

// ── API Response Envelope ──

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}
