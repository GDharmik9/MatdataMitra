// ============================================================
// MatdataMitra Backend — Google Cloud Speech Services
// Cloud Speech-to-Text (STT) and Cloud Text-to-Speech (TTS)
// ============================================================

import { SpeechClient, protos as speechProtos } from "@google-cloud/speech";
import { TextToSpeechClient, protos as ttsProtos } from "@google-cloud/text-to-speech";
import { env } from "../config/env";

// ── Clients (lazy-initialized) ──
let sttClient: SpeechClient | null = null;
let ttsClient: TextToSpeechClient | null = null;

function getSTTClient(): SpeechClient {
  if (!sttClient) {
    sttClient = new SpeechClient({
      projectId: env.GOOGLE_CLOUD_PROJECT_ID,
    });
  }
  return sttClient;
}

function getTTSClient(): TextToSpeechClient {
  if (!ttsClient) {
    ttsClient = new TextToSpeechClient({
      projectId: env.GOOGLE_CLOUD_PROJECT_ID,
    });
  }
  return ttsClient;
}

// BCP-47 language codes for Indian languages (used by Google Cloud)
export const LANGUAGE_CODES: Record<string, string> = {
  hi: "hi-IN", en: "en-IN", bn: "bn-IN", ta: "ta-IN",
  te: "te-IN", mr: "mr-IN", gu: "gu-IN", kn: "kn-IN",
  ml: "ml-IN", pa: "pa-IN", or: "or-IN", as: "as-IN",
  ur: "ur-IN", ne: "ne-NP", sa: "sa-IN",
};

/**
 * Transcribe audio to text using Google Cloud Speech-to-Text
 * @param audioBase64 - Base64 encoded audio (WebM/Opus from browser MediaRecorder)
 * @param languageCode - Short language code (e.g., "hi", "ta")
 * @returns Transcribed text and confidence score
 */
export async function speechToText(
  audioBase64: string,
  languageCode: string
): Promise<{ text: string; confidence: number }> {
  try {
    const client = getSTTClient();
    const bcp47 = LANGUAGE_CODES[languageCode] ?? "hi-IN";

    const request: speechProtos.google.cloud.speech.v1.IRecognizeRequest = {
      config: {
        encoding: "WEBM_OPUS",
        sampleRateHertz: 48000,
        languageCode: bcp47,
        enableAutomaticPunctuation: true,
        alternativeLanguageCodes: ["en-IN"],
        model: "latest_long",
      },
      audio: {
        content: audioBase64,
      },
    };

    const [response] = await client.recognize(request);
    const result = response.results?.[0]?.alternatives?.[0];
    return {
      text: result?.transcript ?? "",
      confidence: result?.confidence ?? 0,
    };
  } catch (error) {
    console.error("❌ Google Cloud STT Error:", error);
    throw new Error("Speech-to-text transcription failed");
  }
}

/**
 * Convert text to speech audio using Google Cloud Text-to-Speech
 * @param text - Text to synthesize
 * @param languageCode - Short language code (e.g., "hi", "ta")
 * @returns Base64 encoded MP3 audio
 */
export async function textToSpeechAudio(
  text: string,
  languageCode: string
): Promise<string> {
  try {
    const client = getTTSClient();
    const bcp47 = LANGUAGE_CODES[languageCode] ?? "hi-IN";

    const request: ttsProtos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text },
      voice: {
        languageCode: bcp47,
        ssmlGender: "FEMALE",
      },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: 0.95,
        pitch: 0,
      },
    };

    const [response] = await client.synthesizeSpeech(request);

    if (response.audioContent) {
      const buffer = Buffer.from(response.audioContent as Uint8Array);
      return buffer.toString("base64");
    }

    throw new Error("No audio content in TTS response");
  } catch (error) {
    console.error("❌ Google Cloud TTS Error:", error);
    throw new Error("Text-to-speech synthesis failed");
  }
}
