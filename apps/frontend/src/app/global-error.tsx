"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif" }}>
          <h2>Fatal Error</h2>
          <p>A critical layout error occurred in MatdataMitra.</p>
          <p style={{ color: "red", fontSize: "0.8rem", marginTop: "1rem", marginBottom: "2rem" }}>{error.message}</p>
          <button
            onClick={() => reset()}
            style={{ padding: "10px 20px", background: "#f97316", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
