// ============================================================
// MatdataMitra Frontend — ChatBot Component
// Voice: Browser Web Speech API (SpeechRecognition + SpeechSynthesis)
// Translation: Gemini via backend API
// ============================================================

"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const LANGUAGES = [
  { code: "hi", label: "हिन्दी", bcp47: "hi-IN" },
  { code: "en", label: "English", bcp47: "en-IN" },
  { code: "bn", label: "বাংলা", bcp47: "bn-IN" },
  { code: "ta", label: "தமிழ்", bcp47: "ta-IN" },
  { code: "te", label: "తెలుగు", bcp47: "te-IN" },
  { code: "mr", label: "मराठी", bcp47: "mr-IN" },
  { code: "gu", label: "ગુજરાતી", bcp47: "gu-IN" },
  { code: "kn", label: "ಕನ್ನಡ", bcp47: "kn-IN" },
  { code: "ml", label: "മലയാളം", bcp47: "ml-IN" },
  { code: "pa", label: "ਪੰਜਾਬੀ", bcp47: "pa-IN" },
];

// Get SpeechRecognition constructor (browser-specific, not in TS stdlib)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSpeechRecognition(): any {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function ChatBot({ isActive = true, initialMode = "text" }: { isActive?: boolean; initialMode?: "text" | "voice" }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("hi");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [lastMode, setLastMode] = useState<"text" | "voice">("text");

  // Handle auto-starting voice when opened manually
  useEffect(() => {
    // Intentionally left blank to prevent auto-starting microphone which burns API quota via background noise.
  }, [isActive, initialMode, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback((role: "user" | "assistant", content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, role, content, timestamp: Date.now() },
    ]);
  }, []);

  // ── Send text to backend ──
  const sendToBackend = useCallback(
    async (text: string, mode: "text" | "voice" = "text") => {
      setLastMode(mode);
      addMessage("user", text);
      setIsProcessing(true);

      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
        const res = await fetch(`${backendUrl}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, language }),
        });

        const data = await res.json();
        if (data.success && data.data) {
          const reply = data.data.translatedReply ?? data.data.reply;
          addMessage("assistant", reply);
          // Auto-speak the reply using browser TTS
          speakText(reply);
        } else {
          // If the backend returned a specific error or failed
          if (res.status === 429 || data.error?.includes("429")) {
            addMessage("assistant", "I am experiencing high traffic right now. Please try again in a moment.");
          } else {
            addMessage("assistant", "Sorry, I couldn't process your request. Please try again.");
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        addMessage("assistant", "Connection error. Please check your network.");
      } finally {
        setIsProcessing(false);
      }
    },
    [language, addMessage]
  );

  // ── Text input handler ──
  const handleSendText = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    sendToBackend(text, "text");
  };

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        sendToBackend(customEvent.detail, "text");
      }
    };
    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, [sendToBackend]);

  // ── Browser Speech Recognition (STT) ──
  const startRecording = () => {
    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    const langConfig = LANGUAGES.find((l) => l.code === language);
    recognition.lang = langConfig?.bcp47 ?? "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript?.trim()) {
        sendToBackend(transcript, "voice");
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone permissions.");
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  // ── Browser Speech Synthesis (TTS) ──
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langConfig = LANGUAGES.find((l) => l.code === language);
    utterance.lang = langConfig?.bcp47 ?? "hi-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(language));
    if (matchingVoice) utterance.voice = matchingVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Conversational flow: auto-restart mic if last mode was voice and chat is still active
      if (lastMode === "voice" && isActive) {
        startRecording();
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="chatbot">
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-info">
          <img src="/images/logo_mitra.png" alt="Logo" className="nav-logo" />
          <div>
            <h2>MatdataMitra</h2>
            <span className="chatbot-status">
              {isProcessing ? "Thinking..." : isSpeaking ? "🔊 Speaking..." : isRecording ? "🎤 Listening..." : "Online"}
            </span>
          </div>
        </div>
        <select
          className="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Select language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="chatbot-messages" aria-live="polite" aria-atomic="false">
        {messages.length === 0 && (
          <div className="chatbot-welcome">
            <span className="chatbot-welcome-icon">🇮🇳</span>
            <h3>Welcome to MatdataMitra!</h3>
            <p>Ask me anything about voter registration, polling booths, election dates, or the voting process.</p>
            <p className="chatbot-voice-hint">🎤 Tap the mic to speak in your language</p>
            <div className="chatbot-suggestions">
              {["How do I register to vote?", "Where is my polling booth?", "How to download e-EPIC?"].map((q) => (
                <button key={q} className="suggestion-chip" onClick={() => sendToBackend(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message message-${msg.role}`}>
            <div className="message-bubble">
              <p>{msg.content}</p>
              <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            {/* Replay button for assistant messages */}
            {msg.role === "assistant" && (
              <button
                className="replay-btn"
                onClick={() => speakText(msg.content)}
                aria-label="Read aloud"
                title="Read aloud"
              >
                🔊
              </button>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="message message-assistant">
            <div className="message-bubble typing">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chatbot-input">
        {isSpeaking ? (
          <button className="voice-btn speaking" onClick={stopSpeaking} aria-label="Stop speaking" title="Stop speaking">
            🔇
          </button>
        ) : (
          <button
            className={`voice-btn ${isRecording ? "recording" : ""}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            title={isRecording ? "Stop recording" : "Tap to speak"}
          >
            {isRecording ? "⏹" : "🎤"}
          </button>
        )}
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendText()}
          placeholder="Type your question..."
          disabled={isProcessing || isRecording}
        />
        <button
          className="send-btn"
          onClick={handleSendText}
          disabled={!input.trim() || isProcessing}
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
