import React from "react";
import DocumentVerifier from "@/components/DocumentVerifier";

export const metadata = {
  title: "Document Pre-Verifier | MatdataMitra",
  description: "Verify your ECI documents before uploading using AI",
};

export default function VerifyDocumentPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      <div className="container mx-auto px-4 py-8" style={{ marginTop: '40px' }}>
        <DocumentVerifier />
      </div>
    </div>
  );
}
