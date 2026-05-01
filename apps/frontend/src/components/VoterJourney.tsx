"use client";

import React, { useState } from "react";
import "./VoterJourney.css";

interface ChecklistItem {
  title: string;
  description: string;
  link: string | null;
}

export default function VoterJourney() {
  const [step, setStep] = useState(1);
  const [situation, setSituation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!situation.trim()) return;

    setIsLoading(true);
    setError(null);
    setStep(2);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
      const response = await fetch(`${backendUrl}/api/journey/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate checklist.");
      }

      setChecklist(data.data);
      setStep(3);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred.");
      setStep(1); // Go back so they can try again
    } finally {
      setIsLoading(false);
    }
  };

  const toggleComplete = (index: number) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedItems(newCompleted);
  };

  const progressPercentage = checklist.length > 0 ? (completedItems.size / checklist.length) * 100 : 0;

  return (
    <div className="voter-journey-container">
      <div className="journey-header">
        <h2>🗺️ Personalized Voter Journey</h2>
        <p>Tell us your situation, and our AI will build a step-by-step checklist just for you.</p>
      </div>

      {step === 1 && (
        <div className="journey-step card-panel">
          <h3>Step 1: What is your situation?</h3>
          <p className="subtitle">Choose a common scenario or type your own.</p>
          
          <div className="quick-options">
            <button className="btn btn-outline" onClick={() => setSituation("I just turned 18 and want to vote.")}>Turning 18</button>
            <button className="btn btn-outline" onClick={() => setSituation("I moved from Delhi to Bangalore.")}>Changed City</button>
            <button className="btn btn-outline" onClick={() => setSituation("My name is spelled wrong on my Voter ID.")}>Correction</button>
          </div>

          <textarea 
            className="situation-input"
            rows={4}
            placeholder="e.g. I recently got married and changed my surname. I need to update my voter ID."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
          ></textarea>

          {error && <div className="error-message">{error}</div>}

          <button 
            className="btn btn-primary generate-btn" 
            onClick={handleGenerate}
            disabled={!situation.trim()}
          >
            Generate My Plan ✨
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="journey-step card-panel loading-panel">
          <div className="spinner"></div>
          <h3>AI is analyzing your situation...</h3>
          <p>Consulting official ECI guidelines and building your personalized checklist.</p>
        </div>
      )}

      {step === 3 && (
        <div className="journey-step checklist-panel">
          <div className="checklist-header">
            <h3>Your Action Plan</h3>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <p className="progress-text">{completedItems.size} of {checklist.length} steps completed</p>
          </div>

          <div className="checklist-items">
            {checklist.map((item, index) => {
              const isDone = completedItems.has(index);
              return (
                <div key={index} className={`checklist-item ${isDone ? 'completed' : ''}`}>
                  <div className="checkbox-wrapper" onClick={() => toggleComplete(index)}>
                    <div className={`custom-checkbox ${isDone ? 'checked' : ''}`}>
                      {isDone && "✓"}
                    </div>
                  </div>
                  <div className="item-content">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="item-link">
                        Go to official portal ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button className="btn btn-outline reset-btn" onClick={() => {
            setStep(1);
            setChecklist([]);
            setCompletedItems(new Set());
            setSituation("");
          }}>Start Over</button>
        </div>
      )}
    </div>
  );
}
