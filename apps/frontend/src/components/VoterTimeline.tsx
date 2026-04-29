// ============================================================
// MatdataMitra Frontend — Voter Timeline Component
// Step-by-step interactive timeline for the electoral process
// ============================================================

"use client";

import { useState } from "react";

interface TimelineStep {
  id: string;
  stage: string;
  title: string;
  titleHi: string;
  description: string;
  icon: string;
  details: string[];
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: "register",
    stage: "Step 1",
    title: "Register as a Voter",
    titleHi: "मतदाता के रूप में पंजीकरण",
    icon: "📝",
    description: "Fill Form 6 online or offline to register in the electoral roll.",
    details: [
      "Visit voters.eci.gov.in or your nearest ERO office",
      "Fill Form 6 with personal details and address proof",
      "Upload ID proof (Aadhaar, passport, etc.) and address proof",
      "A Booth Level Officer (BLO) will visit for verification",
      "Your name will appear in the electoral roll once approved",
    ],
  },
  {
    id: "download_epic",
    stage: "Step 2",
    title: "Download e-EPIC Card",
    titleHi: "e-EPIC कार्ड डाउनलोड करें",
    icon: "🪪",
    description: "Get your digital voter ID card on your phone.",
    details: [
      "Visit voters.eci.gov.in or use the Voter Helpline App",
      "Login with your registered mobile number",
      "Complete OTP verification",
      "Download your e-EPIC as a secured PDF with QR code",
      "e-EPIC is valid as ID proof at the polling station",
    ],
  },
  {
    id: "find_booth",
    stage: "Step 3",
    title: "Find Your Polling Booth",
    titleHi: "अपना मतदान केंद्र खोजें",
    icon: "📍",
    description: "Locate your assigned polling station using your EPIC number.",
    details: [
      "Use the MatdataMitra Booth Locator tool",
      "SMS 'EPIC <your number>' to 1950",
      "Check the Voter Helpline App",
      "Your booth is assigned based on your registered address",
      "Visit during polling hours: typically 7 AM to 6 PM",
    ],
  },
  {
    id: "prepare",
    stage: "Step 4",
    title: "Prepare for Voting Day",
    titleHi: "मतदान दिवस की तैयारी",
    icon: "✅",
    description: "Know what to bring and what to expect at the booth.",
    details: [
      "Carry your EPIC card or any of the 12 approved photo IDs",
      "Know your candidate — check candidate backgrounds",
      "No mobile phones or cameras allowed inside the booth",
      "Separate queues for men, women, and PwD voters",
      "Indelible ink will be applied on your left index finger",
    ],
  },
  {
    id: "cast_vote",
    stage: "Step 5",
    title: "Cast Your Vote",
    titleHi: "अपना मत डालें",
    icon: "🗳️",
    description: "Use the EVM to cast your vote securely and verify on VVPAT.",
    details: [
      "Show your ID to the polling officer at the desk",
      "Receive your voter slip with serial number",
      "Enter the voting compartment privately",
      "Press the button next to your chosen candidate on the EVM",
      "Verify your vote on the VVPAT slip (displayed for 7 seconds)",
    ],
  },
  {
    id: "track_results",
    stage: "Step 6",
    title: "Track Election Results",
    titleHi: "चुनाव परिणाम ट्रैक करें",
    icon: "📊",
    description: "Follow real-time counting and results on official channels.",
    details: [
      "Results are available on results.eci.gov.in",
      "Follow the Election Commission's official social media",
      "Counting typically begins a few days after polling",
      "Results are declared constituency-wise",
      "Use MatdataMitra to get live updates in your language",
    ],
  },
];

export default function VoterTimeline() {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  return (
    <div className="voter-timeline">
      <div className="timeline-header">
        <h2>🗳️ Your Voting Journey</h2>
        <p>Follow these steps to participate in India&apos;s democratic process</p>
      </div>

      <div className="timeline-track">
        {TIMELINE_STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`timeline-step ${activeStep === step.id ? "active" : ""}`}
            onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
          >
            {/* Connector line */}
            {index < TIMELINE_STEPS.length - 1 && <div className="timeline-connector" />}

            {/* Step marker */}
            <div className="timeline-marker">
              <span className="timeline-icon">{step.icon}</span>
            </div>

            {/* Step content */}
            <div className="timeline-content">
              <span className="timeline-stage">{step.stage}</span>
              <h3>{step.title}</h3>
              <p className="timeline-title-hi">{step.titleHi}</p>
              <p className="timeline-desc">{step.description}</p>

              {/* Expandable details */}
              {activeStep === step.id && (
                <div className="timeline-details">
                  <ul>
                    {step.details.map((detail, i) => (
                      <li key={i}>
                        <span className="detail-bullet">→</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button className="timeline-toggle" aria-label="Toggle details">
                {activeStep === step.id ? "Hide details ▲" : "Show details ▼"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
