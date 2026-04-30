"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFirebaseDB } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

interface VoterService {
  id: string;
  title_en: string;
  description_en?: string;
  category: string;
  source_url?: string;
}

// Temporary mock steps generator since the scraper currently only gets title/description
// In a full production app, the scraper would extract these steps from the ECI pages directly.
function generateStepsForService(serviceId: string, title: string) {
  return [
    {
      title: "Step 1: Check Eligibility",
      content: `Before applying for ${title}, ensure you meet the basic criteria as per ECI guidelines (e.g., 18+ years of age, Indian citizen).`,
    },
    {
      title: "Step 2: Gather Documents",
      content: "Keep your Aadhaar Card, Address Proof (Utility Bill/Passport), and a Passport-sized photo ready.",
    },
    {
      title: "Step 3: Fill the Application",
      content: `Navigate to the official ECI portal and fill out the required form for ${title}.`,
    },
    {
      title: "Step 4: Track Status",
      content: "After submission, you will receive a Reference Number. Use it on the ECI portal to track your application status.",
    }
  ];
}

export default function ServiceInteractivePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [service, setService] = useState<VoterService | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    async function fetchService() {
      try {
        const db = getFirebaseDB();
        if (!db) return;

        const docRef = doc(db, "voter_services", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setService({ id: docSnap.id, ...docSnap.data() } as VoterService);
        }
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchService();
  }, [id]);

  if (loading) {
    return <div style={{ padding: "4rem", textAlign: "center", color: "#888" }}>Loading Interactive Guide...</div>;
  }

  if (!service) {
    return (
      <div style={{ padding: "4rem", textAlign: "center" }}>
        <h2>Service Not Found</h2>
        <p>The guide you are looking for does not exist in our local database.</p>
        <button onClick={() => router.push('/')} className="btn btn-secondary" style={{ marginTop: '20px' }}>
          Go Back Home
        </button>
      </div>
    );
  }

  const steps = generateStepsForService(service.id, service.title_en);

  return (
    <div className="container" style={{ padding: "4rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
      <Link href="/" style={{ color: "var(--primary-light)", textDecoration: "none", marginBottom: "2rem", display: "inline-block" }}>
        &larr; Back to Search
      </Link>
      
      <div style={{ backgroundColor: "var(--card-bg)", padding: "2rem", borderRadius: "16px", border: "1px solid var(--border-color)" }}>
        <h1 style={{ color: "var(--text-primary)", marginBottom: "1rem" }}>{service.title_en}</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "1.1rem", lineHeight: "1.6" }}>
          {service.description_en || "Follow this simple step-by-step guide to complete this process."}
        </p>

        {/* Vertical Step-by-Step UI */}
        <div className="steps-container" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
          {steps.map((step, index) => (
            <div 
              key={index} 
              style={{
                padding: "1.5rem",
                borderRadius: "12px",
                backgroundColor: currentStep === index ? "rgba(255, 107, 107, 0.1)" : "var(--bg-dark)",
                border: currentStep === index ? "1px solid var(--primary-color)" : "1px solid var(--border-color)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onClick={() => setCurrentStep(index)}
            >
              <h3 style={{ color: currentStep === index ? "var(--primary-light)" : "var(--text-primary)", marginBottom: "0.5rem" }}>
                {step.title}
              </h3>
              {currentStep === index && (
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.5", marginTop: "1rem" }}>
                  {step.content}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", borderTop: "1px solid var(--border-color)", paddingTop: "2rem" }}>
          <button 
            className="btn btn-secondary" 
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          >
            Previous Step
          </button>
          <span style={{ color: "var(--text-secondary)" }}>Step {currentStep + 1} of {steps.length}</span>
          <button 
            className="btn btn-primary" 
            disabled={currentStep === steps.length - 1}
            onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
          >
            Next Step
          </button>
        </div>

        {/* Verified Official Links Section */}
        <div style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", padding: "1.5rem", borderRadius: "12px", marginTop: "2rem" }}>
          <h4 style={{ color: "var(--text-primary)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span>✅</span> Official Links (Verified)
          </h4>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            To actually submit your application or view the official guidelines, use the verified Election Commission of India links below:
          </p>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <a 
              href={service.source_url || "https://voters.eci.gov.in/"} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary btn-sm"
              style={{ backgroundColor: "#2196F3", color: "white", border: "none" }}
            >
              🌐 Open ECI Portal
            </a>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                const query = `How to ${service.title_en} in India ECI`;
                window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
              }}
            >
              🔍 Google Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
