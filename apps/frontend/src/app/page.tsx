import Link from "next/link";
import HomeContent from "@/components/HomeContent";

export default function HomePage() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <span className="hero-badge">🇮🇳 Built for Every Indian Voter</span>
          <h1>
            Your AI Electoral
            <br />
            <span className="hero-gradient">Assistant</span>
          </h1>
          <p className="hero-subtitle">
            Navigate India&apos;s electoral process with confidence. Get instant answers about voter
            registration, polling booths, and election rules — in your language.
          </p>
          <HomeContent />
          <div className="hero-cta" style={{ marginTop: '30px' }}>
            <Link href="/verify" className="btn btn-secondary">
              🔍 Verify Voter ID
            </Link>
            <Link href="/candidates" className="btn btn-secondary">
              🏛️ Know Your Candidate
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">22+</span>
              <span className="stat-label">Languages</span>
            </div>
            <div className="stat">
              <span className="stat-value">🎙️</span>
              <span className="stat-label">Voice Support</span>
            </div>
            <div className="stat">
              <span className="stat-value">♿</span>
              <span className="stat-label">Accessible</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Built with ❤️ for Indian Democracy | Google Hackathon 2026</p>
        <p className="footer-sub">Powered by Google Gemini • Google Cloud AI • Firebase</p>
      </footer>
    </div>
  );
}
