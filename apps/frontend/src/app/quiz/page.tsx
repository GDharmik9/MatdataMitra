import React from "react";
import DemocracyQuiz from "@/components/DemocracyQuiz";

export const metadata = {
  title: "Democracy Defender Quiz | MatdataMitra",
  description: "Test your knowledge about the Election Commission of India and voting rights.",
};

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      <div className="container mx-auto px-4 py-8" style={{ marginTop: '40px' }}>
        <DemocracyQuiz />
      </div>
    </div>
  );
}
