import Link from "next/link";
import HomeSearch from "@/components/HomeSearch";

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
          <HomeSearch />
          <div className="hero-cta">
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

      {/* Features */}
      <section className="features" id="features">
        <h2 className="section-title">Everything You Need</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🤖</span>
            <h3>AI-Powered Guidance</h3>
            <p>Google Gemini simplifies complex election rules and jargon into plain language.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎤</span>
            <h3>Voice in Your Language</h3>
            <p>Speak in your local dialect. Google Cloud AI transcribes, translates, and speaks back in 22+ Indian languages.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📍</span>
            <h3>Find Your Booth</h3>
            <p>Enter your EPIC number to instantly locate your polling station and constituency.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📱</span>
            <h3>WhatsApp Integration</h3>
            <p>Get voter assistance directly on WhatsApp — no app download needed.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🏛️</span>
            <h3>Know Your Candidate</h3>
            <p>View candidate backgrounds, assets, education, and criminal records before you vote.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🛡️</span>
            <h3>Anti-Disinformation</h3>
            <p>RAG pipeline ensures answers come only from official ECI documents — no hallucinations.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📋</span>
            <h3>Step-by-Step Timeline</h3>
            <p>Interactive guide from registration to casting your vote with confidence.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">♿</span>
            <h3>Accessible for All</h3>
            <p>Large fonts, high contrast, voice assistance, and screen-reader support for PwD voters.</p>
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
