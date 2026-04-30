# 📐 Stage 1: Architecture & Foundation

## Overview
The project is built as a **Turborepo monorepo** — a single Git repository containing the frontend, backend, scraper, and shared type packages. This allows consistent TypeScript types across the entire stack and a single `docker-compose.yml` to spin up everything locally.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 15 + React 19 | App Router, SSG for fast pages, PWA support |
| Backend | Node.js + Express | Lightweight, fast, compatible with Gemini SDK |
| Database | Google Firestore | Free-tier, real-time, no-SQL, serverless |
| AI | Google Gemini 1.5 Flash | Best Indian language support + cheap |
| Voice | Google Cloud TTS + STT | 22+ Indian language voice support |
| Auth | Firebase Auth (Google) | Zero-config Google Sign-In |
| Deployment | Google Cloud Run | Serverless containers, pay-per-use |
| CI/CD | GitHub Actions | Auto-scraper cron job |

---

## Monorepo Structure

```
MatdataMitra/
├── apps/
│   ├── frontend/          # Next.js app (Port 3000)
│   │   ├── src/app/       # Next.js App Router pages
│   │   ├── src/components/ # Reusable React components
│   │   └── src/lib/       # Firebase client SDK, utils
│   ├── backend/           # Express API (Port 8080)
│   │   └── src/
│   │       ├── routes/    # Express route handlers
│   │       └── services/  # Business logic (RAG, Firestore, translate)
│   └── scraper/           # Node.js ECI scraper
│       └── src/
│           ├── index.ts   # Main scraper
│           └── seed-updates.ts # Authentic data seed script
├── packages/
│   └── shared-types/      # TypeScript interfaces shared by all apps
│       └── src/index.ts   # VoterInfo, ChatRequest, RAGSource, etc.
├── docker-compose.yml     # Local dev orchestration
├── turbo.json             # Turborepo build pipeline
└── yarn.lock              # Locked dependency tree
```

---

## Docker Compose Local Setup

```yaml
# docker-compose.yml (simplified)
services:
  frontend:
    build: ./apps/frontend
    ports: ["3000:3000"]
    env_file: .env

  backend:
    build: ./apps/backend
    ports: ["8080:8080"]
    env_file: .env
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
```

**Key Decision:** Both frontend and backend are built in Docker using multi-stage builds:
1. **Stage 1 (builder):** Install all deps, compile TypeScript → JS
2. **Stage 2 (runner):** Copy only the built output + production deps → small final image

---

## Shared Types Package

All TypeScript interfaces shared between frontend and backend live in `packages/shared-types/src/index.ts`.

```typescript
// Key interfaces
export interface RAGSource {
  documentId: string;
  title: string;
  excerpt: string;
  relevanceScore: number;
  source: string;           // e.g. "Firestore" or "ECI Website"
}

export interface ChatResponse {
  reply: string;
  translatedReply?: string;
  language: string;
  sources?: RAGSource[];
}

export interface VoterService {
  id: string;
  category: string;
  title_en: string;
  description_en?: string;
  pdf_en?: string;          // Official ECI PDF URL
  source_url?: string;      // Source page
  title_hi?: string;        // Hindi title
  title_mr?: string;        // Marathi title
}
```

**Why shared types?** Prevents the #1 bug in full-stack apps — frontend and backend having mismatched data shapes. TypeScript errors at build time instead of runtime.

---

## Firebase Configuration

**Frontend (Client SDK):**
```typescript
// apps/frontend/src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ...
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

**Backend (Admin SDK):**
```typescript
// apps/backend/src/services/firestore.service.ts
import * as admin from 'firebase-admin';
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
```

**Why two SDKs?**
- Client SDK runs in the browser — respects Firestore security rules, user-level auth
- Admin SDK runs on the server — has full database access, used for privileged operations like the cost-saving wall

---

## Firestore Data Model

**Collection: `voter_services`**

```
voter_services/
  ├── form-6/
  │   ├── id: "form-6"
  │   ├── category: "Forms & Guidelines"
  │   ├── title_en: "Form 6: New Voter Registration"
  │   ├── description_en: "Use Form 6 if you have never voted before..."
  │   ├── pdf_en: "https://eci.gov.in/.../Form6.pdf"
  │   ├── source_url: "https://eci.gov.in/forms"
  │   ├── title_hi: "फ़ॉर्म 6: नया मतदाता पंजीकरण"
  │   └── title_mr: "फॉर्म 6: नवीन मतदार नोंदणी"
  │
  ├── src-2024/
  │   ├── category: "Election SRC"
  │   ├── title_en: "Special Summary Revision of Electoral Rolls (SRC)"
  │   └── source_url: "https://eci.gov.in/electoral-roll/special-summary-revision/"
  │
  └── update-2024-general/
      ├── category: "Election Updates"
      └── title_en: "2024 General Election Results Declared"
```
