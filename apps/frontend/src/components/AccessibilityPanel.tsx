// ============================================================
// MatdataMitra Frontend — Accessibility Panel (PwD Support)
// Font size toggle, high contrast, auto-read
// ============================================================

"use client";

import { useState, useEffect } from "react";

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");
  const [highContrast, setHighContrast] = useState(false);
  const [autoRead, setAutoRead] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    // Font size
    const scale = fontSize === "xlarge" ? "1.4" : fontSize === "large" ? "1.2" : "1";
    root.style.setProperty("--a11y-scale", scale);
    root.style.fontSize = `${parseFloat(scale) * 100}%`;

    // High contrast
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Store auto-read preference for ChatBot to read
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, boolean>).__matdataMitraAutoRead = autoRead;
    }
  }, [fontSize, highContrast, autoRead]);

  return (
    <>
      <button
        className="a11y-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Accessibility settings"
        title="Accessibility settings"
      >
        ♿
      </button>

      {isOpen && (
        <div className="a11y-panel">
          <div className="a11y-panel-header">
            <h3>♿ Accessibility</h3>
            <button className="a11y-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="a11y-option">
            <label>🔤 Font Size</label>
            <div className="a11y-buttons">
              {(["normal", "large", "xlarge"] as const).map((size) => (
                <button
                  key={size}
                  className={`a11y-btn ${fontSize === size ? "active" : ""}`}
                  onClick={() => setFontSize(size)}
                >
                  {size === "normal" ? "A" : size === "large" ? "A+" : "A++"}
                </button>
              ))}
            </div>
          </div>

          <div className="a11y-option">
            <label>🌓 High Contrast</label>
            <button
              className={`a11y-btn toggle ${highContrast ? "active" : ""}`}
              onClick={() => setHighContrast(!highContrast)}
            >
              {highContrast ? "ON" : "OFF"}
            </button>
          </div>

          <div className="a11y-option">
            <label>🔊 Auto-Read Replies</label>
            <button
              className={`a11y-btn toggle ${autoRead ? "active" : ""}`}
              onClick={() => setAutoRead(!autoRead)}
            >
              {autoRead ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
