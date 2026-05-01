"use client";

import { useEffect, useState } from "react";
import { getFirebaseDB } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";

interface VoterService {
  id: string;
  title_en: string;
  description_en?: string;
  pdf_en?: string;
  category: string;
}

export default function CategoryList({ categoryFilter, title, description }: { categoryFilter: string | string[], title: string, description: string }) {
  const [services, setServices] = useState<VoterService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const db = getFirebaseDB();
        if (!db) return;

        // Note: For 'Forms & Guidelines' we might want to fetch by 'category' 
        // We will fetch all and filter client side if categoryFilter is an array or complex
        const q = query(collection(db, "voter_services"));
        const querySnapshot = await getDocs(q);
        const fetchedData: VoterService[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedData.push({ id: doc.id, ...doc.data() } as VoterService);
        });

        // Filter locally
        const filtered = fetchedData.filter(s => {
          if (Array.isArray(categoryFilter)) {
            return categoryFilter.some(c => s.category.includes(c));
          }
          if (categoryFilter === 'Forms') {
            return !!s.pdf_en; // Forms must have a PDF
          }
          if (categoryFilter === 'Guidelines') {
            return !s.pdf_en; // Guidelines page shows all interactive step-by-step guides (no PDF)
          }
          return s.category.includes(categoryFilter);
        });

        setServices(filtered);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, [categoryFilter]);

  return (
    <div className="page-container">
      <h1 style={{ color: "var(--text-primary)", marginBottom: "0.5rem" }}>{title}</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "3rem", fontSize: "1.1rem" }}>{description}</p>

      {loading ? (
        <p style={{ textAlign: "center", color: "#888" }}>Loading Data...</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {services.length > 0 ? (
            services.map((service) => (
              <div key={service.id} style={{ backgroundColor: "var(--card-bg)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.5rem" }}>{service.pdf_en ? "📄" : service.category === "Election Updates" ? "📰" : "📋"}</span>
                  <h3 style={{ margin: 0, color: "var(--text-primary)" }}>{service.title_en}</h3>
                </div>
                {service.description_en && <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.5", margin: 0 }}>{service.description_en}</p>}
                
                {service.pdf_en ? (
                  <a href={service.pdf_en} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ marginTop: '5px' }}>
                    Download Official PDF
                  </a>
                ) : (
                  <Link href={`/services/${service.id}`} className="btn btn-secondary btn-sm" style={{ marginTop: '5px' }}>
                    View Information
                  </Link>
                )}
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", padding: "2rem" }}>No information available for this category yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
