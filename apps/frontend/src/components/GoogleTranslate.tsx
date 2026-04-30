"use client";

import { useEffect, useState } from "react";

export default function GoogleTranslate() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    // Define the callback function globally
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).googleTranslateElementInit = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (window as any).google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,mr,ta,te,bn,gu,kn,ml,pa,or,as,ur", // Supported Indian languages
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    // Load the script if it hasn't been loaded
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

    // Find the hidden Google Translate select element
    const googleSelect = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    
    if (googleSelect) {
      googleSelect.value = lang;
      // Trigger the change event so Google Translate picks it up
      googleSelect.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
    } else {
      console.warn("Google Translate widget not ready yet.");
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
      {/* Hidden original Google Translate element */}
      <div 
        id="google_translate_element" 
        style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", opacity: 0, zIndex: -10 }}
      ></div>

      {/* Our Custom Clean Dropdown */}
      <select 
        value={selectedLanguage}
        onChange={handleLanguageChange}
        className="custom-lang-select"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-color)",
          padding: "6px 12px",
          borderRadius: "8px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "14px",
          cursor: "pointer",
          outline: "none"
        }}
      >
        <option value="en" style={{ color: "black" }}>English</option>
        <option value="hi" style={{ color: "black" }}>हिन्दी (Hindi)</option>
        <option value="mr" style={{ color: "black" }}>मराठी (Marathi)</option>
        <option value="bn" style={{ color: "black" }}>বাংলা (Bengali)</option>
        <option value="te" style={{ color: "black" }}>తెలుగు (Telugu)</option>
        <option value="ta" style={{ color: "black" }}>தமிழ் (Tamil)</option>
        <option value="gu" style={{ color: "black" }}>ગુજરાતી (Gujarati)</option>
        <option value="kn" style={{ color: "black" }}>ಕನ್ನಡ (Kannada)</option>
      </select>
    </div>
  );
}
