# 📅 MatdataMitra — Project Timeline

> Latest changes appear at the **top**. Each entry captures the key decision, what changed, and why.

---

## 🌐 [Apr 30, 2026 — 7:40 PM] Translation Fix: Cookie-Based Approach
**Decision:** Switched from DOM event-dispatching to `googtrans` cookie-based translation.  
**Why:** Google Translate doesn't watch DOM events reliably. The real mechanism is a browser cookie (`googtrans=/en/hi`) read on page load. Using `display:none` on the hidden widget also prevented Google's script from initialising.  
**Changed:**
- `GoogleTranslate.tsx` — complete rewrite with `setCookie()`, `triggerGoogleTranslate()`, cookie persistence on mount
- `globals.css` — fixed `.skiptranslate` and `.goog-te-banner-frame` selectors to suppress Google's injected banner

---

## 🖥️ [Apr 30, 2026 — 6:54 PM] UI Review & Translation Root-Cause Diagnosis
**Decision:** Opened the live site in a browser and took screenshots of all pages.  
**Findings:**
- Homepage looks modern: dark hero gradient, smart search bar with keyword chips ✅
- Forms page correctly lists downloadable PDF forms ✅
- Guidelines page shows SRC and Election Update cards ✅
- Language dropdown visible in Navbar but not translating ❌ (root cause: `display:none` preventing widget init)

---

## 🌍 [Apr 30, 2026 — 6:40 PM] Custom Native Language Dropdown (Attempt 2)
**Decision:** Used `visibility:hidden` instead of `display:none` + added `bubbles:true` to the dispatched event.  
**Why:** `display:none` hides the element from the render tree entirely — Google's JS wouldn't find it to attach listeners.  
**Changed:**
- `GoogleTranslate.tsx` — switched to `position:absolute; visibility:hidden; width:0; height:0`

---

## 🗂️ [Apr 30, 2026 — 6:36 PM] Git Push — Grouped Feature Commits
**Decision:** Committed all session changes to GitHub in four logical groups.  
**Commits:**
1. `feat(backend)` — Firestore cost-saving wall, RAGSource type fix
2. `feat(scraper)` — ECI scraper + authentic SRC/election seed data
3. `feat(frontend)` — Homepage search, dynamic service pages, /forms /guidelines /updates /services/[id]
4. `feat(ui)` — Navbar nav links, Google Translate dropdown, global CSS polish

---

## 🌍 [Apr 30, 2026 — 6:35 PM] Custom Native Language Dropdown (Attempt 1)
**Decision:** Completely hidden the Google Translate default widget and replaced it with a custom `<select>`.  
**Why:** Google's default widget injected rogue CSS that was expanding and breaking the Navbar layout.  
**Changed:**
- `GoogleTranslate.tsx` — new custom React select that proxies selection to the hidden `.goog-te-combo`
- `globals.css` — added `.goog-te-banner-frame`, `#goog-gt-tt`, `.goog-te-gadget` overrides

---

## 🌍 [Apr 30, 2026 — 6:10 PM] Google Translate Widget — Initial Integration
**Decision:** Use the Google Website Translator widget for 22+ regional languages instead of manual translations or API calls.  
**Why:** Writing translation files for 22 languages is impossible at hackathon speed; backend API calls per UI element would be slow and costly.  
**Changed:**
- `GoogleTranslate.tsx` — new component injecting Google's translate script
- `Navbar.tsx` — added `<GoogleTranslate />` in the nav-links section
- `globals.css` — Google Translate override CSS block added

---

## 🗂️ [Apr 30, 2026 — 6:04 PM] Navbar Navigation Links
**Decision:** Replaced old links (Timeline, Verify, KYC) with portal-focused links.  
**New Links:** Home | Forms | Guidelines | Updates  
**Changed:**
- `Navbar.tsx` — updated `nav-links` section
- `globals.css` — changed `.navbar` from `position:sticky` to `position:relative` per user request

---

## 📄 [Apr 30, 2026 — 6:00 PM] Dedicated Category Pages Created
**Decision:** Build separate pages for each content type so users can navigate directly.  
**Pages Added:**
- `/forms` — shows only items with a `pdf_en` link
- `/guidelines` — shows all interactive cards without a PDF
- `/updates` — shows `Election Updates` and `Election SRC` categories

**Changed:**
- `apps/frontend/src/app/forms/page.tsx` — [NEW]
- `apps/frontend/src/app/guidelines/page.tsx` — [NEW]
- `apps/frontend/src/app/updates/page.tsx` — [NEW]
- `apps/frontend/src/components/CategoryList.tsx` — [NEW] reusable filter component

---

## 🏠 [Apr 30, 2026 — 5:50 PM] Homepage Search Redesign
**Decision:** Restore the original feature cards on the homepage by default; only show full-width search result cards when the user types.  
**Why:** The previous version always showed database cards, removing the welcome "Everything You Need" feature grid.  
**Also Added:**
- Clickable keyword suggestion chips below the search bar (Form 6, SRC, Updates, Address Change, Voter ID)
- Full-width explanatory cards with category badge + description + action button in search results

**Changed:**
- `HomeContent.tsx` — conditional render: feature grid when no query, full-width cards when searching

---

## 📰 [Apr 30, 2026 — 5:47 PM] Authentic ECI Data — SRC & Election Updates
**Decision:** Seed authentic (non-mock) data from official ECI sources into Firestore.  
**Data Added:**
- **Special Summary Revision (SRC)** — source: `eci.gov.in/electoral-roll/special-summary-revision/`
- **2024 General Election Results** — source: `results.eci.gov.in`
- **Home Voting for 85+ & PwD** — source: `eci.gov.in/voter/pwd-voter/`

**Changed:**
- `apps/scraper/src/seed-updates.ts` — [NEW] one-time seed script, runs via `ts-node`

---

## 🛡️ [Apr 30, 2026 — 11:50 AM] TypeScript Build Fix — RAGSource Type Error
**Decision:** Fix Docker build failure caused by TypeScript strict typing on `bestMatch`.  
**Root Cause:** TypeScript inferred `bestMatch` as `never` after `null` assignment in strict mode; accessing `.source_url` on `never` is illegal.  
**Also Fixed:**
- `chat.routes.ts` — the inline `sources` object shape didn't match `RAGSource` interface (missing `documentId`, `title`, `excerpt`, `relevanceScore`)

**Changed:**
- `firestore.service.ts` — `let bestMatch: any = null`
- `chat.routes.ts` — updated sources array to match `RAGSource` shared type

---

## 🗃️ [Apr 30, 2026 — 11:50 AM] Firestore Backend Service — AI Cost-Saving Wall
**Decision:** Add a `findLocalAnswer()` function in a new `firestore.service.ts` that intercepts backend chat requests.  
**Why:** Every Gemini API call costs money. If the user's query matches a known ECI topic in Firestore, return that data immediately without calling Gemini.  
**Architecture:** `User Query → Backend → findLocalAnswer() in Firestore → (hit) return local / (miss) → Gemini`

**Changed:**
- `apps/backend/src/services/firestore.service.ts` — [NEW] keyword-matching Firestore query
- `apps/backend/src/routes/chat.routes.ts` — intercept logic, local-first response

---

## 🔥 [Apr 30, 2026 — 11:30 AM] Firebase Admin SDK Added to Backend
**Decision:** Add `firebase-admin` to the backend so Node.js can query Firestore server-side.  
**Changed:**
- `apps/backend/package.json` — added `firebase-admin`
- `yarn.lock` — updated

---

## 🕸️ [Apr 30, 2026 — 11:00 AM] ECI Scraper — Node.js App Created
**Decision:** Build a Node.js scraper that extracts form and guideline data from `voters.eci.gov.in` and pushes it to Firestore.  
**Data Scraped (static seed):**
- Form 6, 6A, 7, 8, 8A, 12D — official ECI PDF links
- Voter registration, address change, deletion, NRI registration guidelines

**Changed:**
- `apps/scraper/src/index.ts` — [NEW] Firestore push logic
- `apps/scraper/package.json` — [NEW]
- `.github/workflows/scraper.yml` — [NEW] GitHub Actions cron job

---

## 🔍 [Apr 30, 2026 — 10:55 AM] Dynamic Homepage Search & Interactive Service Pages
**Decision:** Replace the static feature grid on the homepage with a live search component querying Firestore.  
**Also Added:**
- Dynamic route `/services/[id]` — renders a step-by-step interactive card page for any scraped service
- "Ask AI Agent" button below the search bar as a fallback

**Changed:**
- `apps/frontend/src/app/page.tsx` — replaced static JSX with `<HomeContent />`
- `apps/frontend/src/components/HomeContent.tsx` — [NEW]
- `apps/frontend/src/lib/firebase.ts` — added Firestore SDK initialisation
- `apps/frontend/src/app/services/[id]/page.tsx` — [NEW]

---

## 🏛️ [Project Start — Hackathon Kickoff] MatdataMitra Foundation
**Objective:** Build an interactive ECI portal that makes voter information accessible to every Indian citizen in their language.  
**Core Stack:**
- **Frontend:** Next.js 15 + React 19, hosted on Cloud Run
- **Backend:** Node.js + Express, Gemini AI for RAG-based Q&A
- **Database:** Firestore (Google Cloud, free tier)
- **AI:** Gemini 1.5 Flash + Google Cloud TTS/STT

**Key Design Principles Established:**
- "Search-First" — Local Firestore data answers before AI API is called
- "Accessibility-First" — Multilingual support for 22+ regional languages
- "Anti-Disinformation" — All answers sourced only from official ECI documents
