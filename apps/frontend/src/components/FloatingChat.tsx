"use client";

import { useState, useEffect } from "react";
import ChatBot from "./ChatBot";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<"text" | "voice">("text");

  useEffect(() => {
    const handleOpenChat = () => {
      setInitialMode("text"); // Text mode when triggered via search
      setIsOpen(true);
    };
    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, []);

  const handleManualOpen = () => {
    if (!isOpen) {
      setInitialMode("text"); // Prevent accidental API calls by defaulting to text mode
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        className="floating-chat-toggle"
        onClick={handleManualOpen}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? "✕" : "💬 Ask AI"}
      </button>

      {/* Chat Modal */}
      <div className={`floating-chat-modal ${isOpen ? "open" : ""}`}>
        <ChatBot isActive={isOpen} initialMode={initialMode} />
      </div>
    </>
  );
}
