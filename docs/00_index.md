# 📘 MatdataMitra — Documentation Index

> **Project:** MatdataMitra (मतदाता मित्र)  
> **Hackathon:** Google x ECI Civic Tech Hackathon  
> **Goal:** A zero-cost, AI-assisted, multilingual portal making Indian election information accessible to every citizen.

---

## 📂 Document Suite

| # | Document | Stage | Status |
|---|----------|-------|--------|
| 1 | [Architecture & Foundation](./docs/01_foundation_architecture.md) | Project Kickoff | ✅ Complete |
| 2 | [ECI Data Scraper](./docs/02_eci_scraper.md) | Data Layer | ✅ Complete |
| 3 | [Firestore AI Cost-Saving Wall](./docs/03_firestore_backend_wall.md) | Backend | ✅ Complete |
| 4 | [Frontend Portal — Search & Pages](./docs/04_frontend_portal.md) | Frontend | ✅ Complete |
| 5 | [Navigation & UI Overhaul](./docs/05_navigation_ui.md) | UI/UX | ✅ Complete |
| 6 | [Multilingual Translation System](./docs/06_multilingual.md) | Accessibility | 🔄 In Progress |

---

## 🏛️ System Architecture (High-Level)

```
User (Web Browser)
        │
        ▼
  Next.js Frontend (Port 3000)
  ├─ Homepage Search Bar → Firestore (real-time filter)
  ├─ /forms, /guidelines, /updates → Firestore category pages
  ├─ /services/[id] → Dynamic step-by-step guide
  └─ Language Dropdown → Google Translate (cookie-based)
        │
        │  Chat / Voice Query
        ▼
  Node.js Backend (Port 8080)
  ├─ findLocalAnswer() → Firestore (cost-saving wall)
  │       │ Miss
  │       ▼
  └─ Gemini 1.5 Flash API (RAG pipeline)
        │
        ▼
  Firestore (voter_services collection)
  └─ Populated by: ECI Scraper + Seed Scripts
```

---

## 🔑 Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Firestore over JSON files | Real-time, scalable, free-tier friendly, survives deployments |
| "Local-first" AI wall | Minimize Gemini API costs — answer from DB before calling AI |
| Google Translate Widget | 22+ Indian languages at zero cost vs. manual translation |
| Cookie-based translation | Only reliable way to programmatically set Google Translate language |
| Docker Compose | Reproducible local dev; matches Cloud Run container environment |
| Static PDF links | ECI PDFs are stable government URLs — no scraping needed, just link |

---

## 🌐 Live Endpoints

| Service | Local | Cloud Run |
|---------|-------|-----------|
| Frontend | http://localhost:3000 | Configured via NEXT_PUBLIC_BACKEND_URL |
| Backend | http://localhost:8080 | Configured via BACKEND_URL |
| Firestore | Firebase Console | matdatamitra project |

---

## 📋 Environment Variables Required

```env
# Firebase (Frontend)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Backend)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Backend
GEMINI_API_KEY=
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```
