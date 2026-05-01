import React from "react";
import VoterJourney from "@/components/VoterJourney";

export const metadata = {
  title: "Personalized Voter Journey | MatdataMitra",
  description: "Get a personalized step-by-step checklist for your ECI voter registration and updates.",
};

export default function JourneyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      <div className="container mx-auto px-4 py-8" style={{ marginTop: '40px' }}>
        <VoterJourney />
      </div>
    </div>
  );
}
