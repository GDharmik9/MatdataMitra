// ============================================================
// MatdataMitra Frontend — Polling Booth Locator Component
// EPIC number lookup for constituency and polling station details
// ============================================================

"use client";

import { useState, FormEvent } from "react";

interface VoterResult {
  epicNumber: string;
  name: string;
  age: number;
  gender: string;
  address: string;
  assemblyConstituency: string;
  pollingStation: string;
  parliamentaryConstituency: string;
  state: string;
  district: string;
  partNumber: string;
}

export default function PollingBoothLocator() {
  const [epicNumber, setEpicNumber] = useState("");
  const [result, setResult] = useState<VoterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const cleaned = epicNumber.trim().toUpperCase();
    if (!/^[A-Z]{3}\d{7}$/.test(cleaned)) {
      setError("Invalid EPIC format. Expected 3 letters followed by 7 digits (e.g., ABC1234567)");
      return;
    }

    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
      const res = await fetch(`${backendUrl}/api/voter/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ epicNumber: cleaned }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error ?? "Voter not found. Please check your EPIC number.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booth-locator">
      <div className="locator-header">
        <span className="locator-icon">📍</span>
        <h2>Polling Booth Locator</h2>
        <p>Enter your EPIC (Voter ID) number to find your polling station and constituency details</p>
      </div>

      <form className="locator-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="epic-input">EPIC Number</label>
          <input
            id="epic-input"
            type="text"
            value={epicNumber}
            onChange={(e) => setEpicNumber(e.target.value.toUpperCase())}
            placeholder="e.g., ABC1234567"
            maxLength={10}
            className="epic-input"
            disabled={loading}
          />
        </div>
        <button type="submit" className="locator-submit" disabled={loading || !epicNumber.trim()}>
          {loading ? (
            <><span className="spinner-sm" /> Verifying...</>
          ) : (
            "🔍 Find My Booth"
          )}
        </button>
      </form>

      {error && (
        <div className="locator-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {result && (
        <div className="locator-result">
          <div className="result-header">
            <span className="result-check">✅</span>
            <h3>Voter Details Found</h3>
          </div>

          <div className="result-grid">
            <div className="result-card">
              <span className="result-label">👤 Name</span>
              <span className="result-value">{result.name}</span>
            </div>
            <div className="result-card">
              <span className="result-label">🎂 Age / Gender</span>
              <span className="result-value">{result.age} / {result.gender}</span>
            </div>
            <div className="result-card highlight">
              <span className="result-label">🏛️ Assembly Constituency</span>
              <span className="result-value">{result.assemblyConstituency}</span>
            </div>
            <div className="result-card highlight">
              <span className="result-label">📍 Polling Station</span>
              <span className="result-value">{result.pollingStation}</span>
            </div>
            <div className="result-card">
              <span className="result-label">🏠 Address</span>
              <span className="result-value">{result.address}</span>
            </div>
            <div className="result-card">
              <span className="result-label">🗺️ Parliamentary Constituency</span>
              <span className="result-value">{result.parliamentaryConstituency}</span>
            </div>
            <div className="result-card">
              <span className="result-label">📋 State / District</span>
              <span className="result-value">{result.state} — {result.district}</span>
            </div>
            <div className="result-card">
              <span className="result-label">🔢 Part Number</span>
              <span className="result-value">{result.partNumber}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
