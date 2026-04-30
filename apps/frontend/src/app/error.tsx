"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("MatdataMitra Runtime Error:", error);
  }, [error]);

  return (
    <div className="page-container" style={{ textAlign: "center", marginTop: "10vh" }}>
      <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Something went wrong!</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
        We apologize, but an unexpected error occurred while loading this page.
      </p>
      <button
        className="btn btn-primary"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </button>
    </div>
  );
}
