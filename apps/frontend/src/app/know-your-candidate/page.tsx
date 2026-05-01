import React from "react";
import KnowYourCandidate from "@/components/KnowYourCandidate";

export const metadata = {
  title: "Know Your Candidate | MatdataMitra",
  description: "Upload a candidate's affidavit to instantly extract criminal records, assets, and education.",
};

export default function KnowYourCandidatePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      <div className="container mx-auto px-4 py-8" style={{ marginTop: '40px' }}>
        <KnowYourCandidate />
      </div>
    </div>
  );
}
