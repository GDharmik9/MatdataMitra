"use client";

import React, { useState, useRef } from "react";
import "./KnowYourCandidate.css";

interface CandidateData {
  candidateName: string | null;
  party: string | null;
  constituency: string | null;
  criminalCases: { count: number; summary: string } | null;
  totalAssets: string | null;
  totalLiabilities: string | null;
  education: string | null;
}

export default function KnowYourCandidate() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        setError("Please upload a valid PDF file.");
        return;
      }
      setSelectedFile(file);
      setError(null);
      setCandidateData(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf") {
        setError("Please upload a valid PDF file.");
        return;
      }
      setSelectedFile(file);
      setError(null);
      setCandidateData(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(",")[1];
        
        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
          const response = await fetch(`${backendUrl}/api/candidates/analyze-affidavit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              base64Data: base64String,
              mimeType: selectedFile.type,
            }),
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.error || "Analysis failed.");
          }

          setCandidateData(data.data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to analyze affidavit.");
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError("Failed to read file.");
      setIsLoading(false);
    }
  };

  return (
    <div className="kyc-container">
      <div className="kyc-header">
        <h2>📄 Know Your Candidate (OCR)</h2>
        <p>Upload a candidate's official Form 26 Affidavit (PDF). Our AI will scan the document and instantly extract their criminal records, assets, and education.</p>
      </div>

      <div 
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="upload-icon">📥</span>
        {selectedFile ? (
          <p className="file-name">Selected: {selectedFile.name}</p>
        ) : (
          <p>Drag and drop a PDF file here, or click to browse</p>
        )}
        <input 
          type="file" 
          accept="application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      {selectedFile && !candidateData && !isLoading && (
        <button className="btn btn-primary analyze-btn" onClick={handleAnalyze}>
          Extract Details via AI ✨
        </button>
      )}

      {isLoading && (
        <div className="loading-state">
          <div className="scanner"></div>
          <p>Scanning PDF and extracting structured data...</p>
        </div>
      )}

      {candidateData && (
        <div className="candidate-dashboard">
          <div className="dashboard-header">
            <h3>{candidateData.candidateName || "Unknown Candidate"}</h3>
            <span className="party-badge">{candidateData.party || "Unknown Party"}</span>
            <p className="constituency">{candidateData.constituency || "Unknown Constituency"}</p>
          </div>

          <div className="stats-grid">
            <div className={`stat-card ${candidateData.criminalCases && candidateData.criminalCases.count > 0 ? 'danger' : 'safe'}`}>
              <span className="stat-icon">⚖️</span>
              <h4>Criminal Cases</h4>
              <p className="stat-value">{candidateData.criminalCases?.count ?? 0}</p>
              <p className="stat-sub">{candidateData.criminalCases?.summary || "No criminal cases reported."}</p>
            </div>

            <div className="stat-card success">
              <span className="stat-icon">💰</span>
              <h4>Total Assets</h4>
              <p className="stat-value">{candidateData.totalAssets || "N/A"}</p>
            </div>

            <div className="stat-card warning">
              <span className="stat-icon">💳</span>
              <h4>Total Liabilities</h4>
              <p className="stat-value">{candidateData.totalLiabilities || "N/A"}</p>
            </div>

            <div className="stat-card neutral">
              <span className="stat-icon">🎓</span>
              <h4>Education</h4>
              <p className="stat-value small-text">{candidateData.education || "N/A"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
