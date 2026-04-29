// ============================================================
// MatdataMitra Frontend — Know Your Candidate (KYC) Component
// Search candidates by constituency and view their details
// ============================================================

"use client";

import { useState, FormEvent } from "react";

interface Candidate {
  id: string;
  name: string;
  party: string;
  partyShort: string;
  constituency: string;
  state: string;
  age: number;
  gender: string;
  education: string;
  assets: string;
  liabilities: string;
  criminalCases: number;
  criminalDetails: string;
}

export default function CandidateKYC() {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [constituencies, setConstituencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      // Fetch constituency list
      await fetchConstituencies();
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
      const res = await fetch(`${backendUrl}/api/candidates?constituency=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setCandidates(data.data.candidates ?? []);
      }
    } catch {
      console.error("Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  const fetchConstituencies = async () => {
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
      const res = await fetch(`${backendUrl}/api/candidates`);
      const data = await res.json();
      if (data.success) {
        setConstituencies(data.data.constituencies ?? []);
      }
    } catch {
      console.error("Failed to fetch constituencies");
    } finally {
      setLoading(false);
    }
  };

  const getPartyColor = (party: string): string => {
    const colors: Record<string, string> = {
      BJP: "#ff9933", INC: "#19aaed", AAP: "#0066b3",
      DMK: "#e30613", AIADMK: "#006400", NCP: "#004c8c", "JD(S)": "#1b8c1b",
    };
    return colors[party] ?? "#888";
  };

  return (
    <div className="kyc-container">
      <div className="kyc-header">
        <span className="kyc-icon">🏛️</span>
        <h2>Know Your Candidate</h2>
        <p>Search by constituency to view candidate backgrounds, assets, and criminal records</p>
      </div>

      <form className="kyc-search" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter constituency name (e.g., Rohini, Kothrud, T. Nagar)"
          className="kyc-input"
          disabled={loading}
        />
        <button type="submit" className="kyc-submit" disabled={loading}>
          {loading ? "Searching..." : "🔍 Search"}
        </button>
      </form>

      {/* Constituency suggestions */}
      {constituencies.length > 0 && !searched && (
        <div className="kyc-suggestions">
          <p className="kyc-suggestions-label">Available constituencies:</p>
          <div className="kyc-chips">
            {constituencies.map((c) => (
              <button key={c} className="suggestion-chip" onClick={() => { setQuery(c.split(",")[0]); }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {searched && candidates.length === 0 && !loading && (
        <div className="kyc-empty">
          <p>No candidates found for &ldquo;{query}&rdquo;. Try: Rohini, Kothrud, T. Nagar, or Jayanagar</p>
        </div>
      )}

      <div className="kyc-results">
        {candidates.map((c) => (
          <div key={c.id} className="candidate-card" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
            <div className="candidate-header">
              <div className="candidate-avatar" style={{ borderColor: getPartyColor(c.partyShort) }}>
                {c.name.charAt(0)}
              </div>
              <div className="candidate-info">
                <h3>{c.name}</h3>
                <span className="candidate-party" style={{ color: getPartyColor(c.partyShort) }}>
                  {c.partyShort} — {c.party}
                </span>
                <span className="candidate-meta">{c.constituency}, {c.state} • Age {c.age} • {c.gender}</span>
              </div>
              {c.criminalCases > 0 && (
                <span className="criminal-badge" title={`${c.criminalCases} criminal case(s)`}>
                  ⚠️ {c.criminalCases}
                </span>
              )}
            </div>

            {expandedId === c.id && (
              <div className="candidate-details">
                <div className="detail-row">
                  <span className="detail-icon">🎓</span>
                  <div><span className="detail-label">Education</span><span className="detail-value">{c.education}</span></div>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">💰</span>
                  <div><span className="detail-label">Total Assets</span><span className="detail-value">{c.assets}</span></div>
                </div>
                <div className="detail-row">
                  <span className="detail-icon">📉</span>
                  <div><span className="detail-label">Liabilities</span><span className="detail-value">{c.liabilities}</span></div>
                </div>
                <div className={`detail-row ${c.criminalCases > 0 ? "criminal-row" : ""}`}>
                  <span className="detail-icon">{c.criminalCases > 0 ? "⚠️" : "✅"}</span>
                  <div>
                    <span className="detail-label">Criminal Record</span>
                    <span className="detail-value">{c.criminalDetails}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
