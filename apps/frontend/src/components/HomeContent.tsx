"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getFirebaseDB } from "@/lib/firebase";
import { collection, getDocs, query, limit } from "firebase/firestore";

interface VoterService {
  id: string;
  title_en: string;
  description_en?: string;
  pdf_en?: string;
  category: string;
}

export default function HomeContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<VoterService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const db = getFirebaseDB();
        if (!db) {
          console.warn("Firestore not initialized");
          setLoading(false);
          return;
        }

        const q = query(collection(db, "voter_services"), limit(50));
        const querySnapshot = await getDocs(q);
        const fetchedData: VoterService[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedData.push({ id: doc.id, ...doc.data() } as VoterService);
        });

        setServices(fetchedData);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const openAiChat = () => {
    window.dispatchEvent(new CustomEvent("open-chat", { detail: searchQuery.trim() }));
  };

  // Filter services based on the search query
  const filteredServices = services.filter((service) => {
    const queryLower = searchQuery.toLowerCase();
    return (
      service.title_en.toLowerCase().includes(queryLower) ||
      (service.description_en && service.description_en.toLowerCase().includes(queryLower)) ||
      service.category.toLowerCase().includes(queryLower)
    );
  });

  return (
    <>
      <form className="home-search-container" onSubmit={handleSearchSubmit}>
        <div className="home-search-input-wrapper">
          <span className="home-search-icon" aria-hidden="true">✨</span>
          <input
            type="text"
            className="home-search-input"
            placeholder="Search forms, guidelines, SRC, or registration info..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search ECI information"
            role="searchbox"
            aria-autocomplete="list"
          />
        </div>
        
        {/* Keyword Suggestions */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          {["Form 6", "SRC", "Updates", "Address Change", "Voter ID"].map((keyword) => (
            <button 
              key={keyword} 
              type="button" 
              role="option"
              aria-selected={searchQuery === keyword}
              onClick={() => setSearchQuery(keyword)}
              onKeyDown={(e) => e.key === "Enter" && setSearchQuery(keyword)}
              style={{ padding: "5px 12px", borderRadius: "15px", border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.85rem" }}
            >
              {keyword}
            </button>
          ))}
        </div>

        {/* Suggestion / AI Trigger below search bar */}
        <div className="search-ai-suggestion" style={{ marginTop: "15px" }}>
          <p>Didn't find what you're looking for?</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={openAiChat}>
            Ask AI Agent
          </button>
        </div>
      </form>

      {/* Dynamic Results vs Static Features */}
      {searchQuery ? (
        <section className="features" id="search-results">
          <h2 className="section-title">Search Results ({filteredServices.length})</h2>
          
          {loading ? (
            <p style={{ textAlign: 'center', color: '#888' }}>Loading ECI Data...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "800px", margin: "0 auto" }}>
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <div key={service.id} style={{ backgroundColor: "var(--card-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "1.5rem" }}>{service.pdf_en ? "📄" : service.category === "Election Updates" ? "📰" : "📋"}</span>
                      <h3 style={{ margin: 0, color: "var(--text-primary)" }}>{service.title_en}</h3>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--primary-color)", backgroundColor: "rgba(255,107,107,0.1)", padding: "2px 8px", borderRadius: "8px" }}>
                      {service.category}
                    </span>
                    {service.description_en && <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.5", margin: 0 }}>{service.description_en}</p>}
                    
                    {service.pdf_en ? (
                      <a href={service.pdf_en} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: '5px' }}>
                        Download Official PDF
                      </a>
                    ) : (
                      <Link href={`/services/${service.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: '5px' }}>
                        View Information
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: "3rem" }}>
                  <p>No local results found for "{searchQuery}".</p>
                  <button type="button" className="btn btn-primary" onClick={openAiChat} style={{ marginTop: '15px' }}>
                    Ask the AI Agent Instead
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="features" id="features">
          <h2 className="section-title">Everything You Need</h2>
          <div className="features-grid">
            <Link href="/verify-document" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="feature-card" style={{ height: '100%', cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--primary-color)' }}>
                <span className="feature-icon">🔍</span>
                <h3>AI Document Verifier</h3>
                <p>Upload your Aadhaar or ID proof. Gemini Vision verifies if it's clear and valid before applying.</p>
              </div>
            </Link>
            <div className="feature-card">
              <span className="feature-icon">🤖</span>
              <h3>AI-Powered Guidance</h3>
              <p>Google Gemini simplifies complex election rules and jargon into plain language.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🎤</span>
              <h3>Voice in Your Language</h3>
              <p>Speak in your local dialect. Google Cloud AI transcribes, translates, and speaks back in 22+ Indian languages.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📍</span>
              <h3>Find Your Booth</h3>
              <p>Enter your EPIC number to instantly locate your polling station and constituency.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📱</span>
              <h3>WhatsApp Integration</h3>
              <p>Get voter assistance directly on WhatsApp — no app download needed.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🏛️</span>
              <h3>Know Your Candidate</h3>
              <p>View candidate backgrounds, assets, education, and criminal records before you vote.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🛡️</span>
              <h3>Anti-Disinformation</h3>
              <p>RAG pipeline ensures answers come only from official ECI documents — no hallucinations.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">📋</span>
              <h3>Step-by-Step Timeline</h3>
              <p>Interactive guide from registration to casting your vote with confidence.</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">♿</span>
              <h3>Accessible for All</h3>
              <p>Large fonts, high contrast, voice assistance, and screen-reader support for PwD voters.</p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
