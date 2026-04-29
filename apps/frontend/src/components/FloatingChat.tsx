"use client";

import { useState, useEffect } from "react";
import ChatBot from "./ChatBot";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, []);

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        className="floating-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Assistant"
      >
        {isOpen ? "✕" : "💬 Ask AI"}
      </button>

      {/* Chat Modal */}
      <div className={`floating-chat-modal ${isOpen ? "open" : ""}`}>
        <ChatBot />
      </div>
    </>
  );
}
