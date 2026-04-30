"use client";

import { useState, useEffect } from "react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "or", label: "ଓଡ଼ିଆ (Odia)" },
  { code: "as", label: "অসমীয়া (Assamese)" },
  { code: "ur", label: "اردو (Urdu)" },
];

function triggerGoogleTranslate(lang: string) {
  if (lang === "en") {
    // Clear cookie and reload to restore English
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
    window.location.reload();
    return;
  }

  // Set the googtrans cookie — this is how Google Translate reads the target language
  const cookieValue = `/en/${lang}`;
  document.cookie = `googtrans=${cookieValue}; path=/`;
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}`;

  // Try the DOM widget first (if initialized)
  const googleSelect = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (googleSelect) {
    googleSelect.value = lang;
    googleSelect.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    // Fallback: cookie is set, reload will pick it up
    window.location.reload();
  }
}

export default function GoogleTranslate() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    // Read current language from cookie on mount so dropdown stays in sync
    const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
    if (match && match[1] && match[1] !== "en") {
      setSelectedLanguage(match[1]);
    }

    // Initialize the hidden Google Translate widget
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).googleTranslateElementInit = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setSelectedLanguage(lang);
    triggerGoogleTranslate(lang);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
      {/* 
        The hidden Google widget MUST use visibility:hidden (not display:none)
        so the script fully initialises its internal listeners. 
      */}
      <div
        id="google_translate_element"
        style={{ position: "absolute", visibility: "hidden", width: 0, height: 0, overflow: "hidden" }}
      />

      {/* Our custom styled dropdown */}
      <select
        value={selectedLanguage}
        onChange={handleLanguageChange}
        aria-label="Select Language"
        style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          color: "var(--text-primary, #fff)",
          border: "1px solid rgba(255,255,255,0.2)",
          padding: "6px 10px",
          borderRadius: "8px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "13px",
          cursor: "pointer",
          outline: "none",
          maxWidth: "160px",
        }}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} style={{ color: "#111", background: "#fff" }}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
