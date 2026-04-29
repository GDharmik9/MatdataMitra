"use client";

import { useState } from "react";

export default function HomeSearch() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Dispatch event to open floating chat and send query
    window.dispatchEvent(new CustomEvent("open-chat", { detail: query.trim() }));
    setQuery("");
  };

  return (
    <form className="home-search-container" onSubmit={handleSearch}>
      <div className="home-search-input-wrapper">
        <span className="home-search-icon">✨</span>
        <input
          type="text"
          className="home-search-input"
          placeholder="Ask AI anything about elections... (e.g., What is SRC?)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="home-search-button">Ask</button>
      </div>
    </form>
  );
}
