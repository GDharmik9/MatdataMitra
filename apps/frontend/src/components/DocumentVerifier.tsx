"use client";

import React, { useState, useRef } from "react";
import "./DocumentVerifier.css";

interface VerificationResult {
  isValid: boolean;
  documentType: string;
  confidence: number;
  feedback: string;
}

export default function DocumentVerifier() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit. Please upload a smaller image.");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleVerify = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const base64String = await toBase64(selectedFile);
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
      const response = await fetch(`${backendUrl}/api/document/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          base64Image: base64String,
          mimeType: selectedFile.type,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Verification failed on the server.");
      }

      setResult(data.data);
    } catch (err) {
      console.error("Document verify error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="document-verifier-container">
      <div className="verifier-header">
        <h2>🔍 AI Document Pre-Verifier</h2>
        <p>Before applying on the ECI portal, upload your identity document (Aadhaar, Voter ID, Age Proof) to check if it's clearly readable and valid.</p>
      </div>

      <div className="verifier-content">
        <div className="upload-section">
          <div 
            className="drop-zone"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Document Preview" className="preview-image" />
            ) : (
              <div className="drop-zone-placeholder">
                <span className="upload-icon">📄</span>
                <p>Click to upload your document image</p>
                <small>Max 5MB. JPEG or PNG.</small>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: "none" }} 
              aria-label="Upload document image for verification"
              data-testid="file-upload"
            />
          </div>

          {selectedFile && (
            <button 
              className="btn btn-primary verify-btn" 
              onClick={handleVerify}
              disabled={isLoading}
            >
              {isLoading ? "Analyzing with Gemini Vision..." : "Verify Document"}
            </button>
          )}

          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="result-section">
          {isLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Scanning document for legibility, glare, and validity...</p>
            </div>
          )}

          {result && (
            <div className={`verification-result ${result.isValid ? "valid" : "invalid"}`}>
              <div className="result-header">
                <h3>{result.isValid ? "✅ Document Accepted" : "❌ Document Rejected"}</h3>
                <span className="confidence-badge">Confidence: {result.confidence}%</span>
              </div>
              
              <div className="result-details">
                <div className="detail-item">
                  <strong>Document Type Detected:</strong>
                  <span>{result.documentType}</span>
                </div>
                <div className="detail-item feedback">
                  <strong>AI Feedback:</strong>
                  <p>{result.feedback}</p>
                </div>
              </div>
              
              {result.isValid ? (
                <div className="next-steps-success">
                  <p>Your document looks perfect! You are ready to upload this to the official ECI portal.</p>
                </div>
              ) : (
                <div className="next-steps-error">
                  <p>Please take a new photo ensuring good lighting, no glare, and that all text is clearly visible.</p>
                </div>
              )}
            </div>
          )}

          {!result && !isLoading && (
            <div className="empty-state">
              <span className="empty-icon">🤖</span>
              <p>Upload a document to see the AI analysis here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
