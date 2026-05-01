# System Architecture

MatdataMitra is built entirely on a Google-centric technology stack to ensure high availability, fast AI reasoning, and seamless scalability.

## Infrastructure Stack

### 1. Monorepo Architecture (Turborepo)
The repository is managed via Turborepo, isolating concerns into three primary workspaces:
- `apps/frontend`: Next.js 15 web application.
- `apps/backend`: Express.js / TypeScript API server.
- `@matdata-mitra/shared-types`: Common TypeScript interfaces ensuring contract validity between frontend and backend.

### 2. Frontend (Next.js 15)
- **Framework:** Next.js (App Router).
- **Styling:** Vanilla CSS variables for high-performance theming and accessibility toggles.
- **Voice/Speech:** Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) for local, low-latency audio capture and playback.
- **Deployment:** Vercel or Google Firebase Hosting.

### 3. Backend (Node.js + Express)
- **Role:** Acts as the secure orchestration layer between the frontend and Google Cloud APIs.
- **RAG Engine:** In-memory vector matching (currently using curated `sampleDocs` for the hackathon prototype) capable of expanding to Google Cloud Storage (GCS) and Vertex AI Vector Search.

### 4. AI & Cloud Services (Google)
- **Google Gemini 2.0 Flash (`@google/genai`):** The core reasoning engine. Gemini parses user intents, simplifies legal language, translates regional queries, and dynamically generates JSON for structured features (Quiz, Journey).
- **Google Gemini Vision:** Powers the AI Document Pre-Verifier and the Candidate Affidavit OCR extraction.
- **Google Cloud Auth (ADC):** Secure server-to-server communication using Application Default Credentials, bypassing the need for exposed service account JSON keys.
- **Firebase Authentication & Firestore:** Handles user identity via Google Sign-In providers and acts as a "Cost-Saving Wall" cache and real-time database for scraped ECI announcements.

## Core Pipelines

### 1. The RAG Pipeline
1. **Query Input:** User asks a question (e.g., "What is SRC?").
2. **Intent Classification:** Gemini classifies the intent (e.g., `general_query`, `voter_verification`).
3. **Document Retrieval:** The RAG service scans official ECI documents and extracts the most relevant text chunks.
4. **Augmented Prompting:** The retrieved context is injected into the Gemini `SYSTEM_PROMPT`.
5. **Generation:** Gemini synthesizes a highly accurate, jargon-free response based *only* on the provided context.

### 2. The Multilingual Voice Pipeline
1. **Capture:** Browser captures audio via `SpeechRecognition` in the user's local dialect (e.g., Marathi).
2. **Transcription:** Transcribed regional text is sent to the backend.
3. **Translation (Inbound):** Gemini translates the regional text to English.
4. **Reasoning:** English text passes through the RAG pipeline.
5. **Translation (Outbound):** The English response is translated back to Marathi.
6. **Synthesis:** Browser plays the response back using `SpeechSynthesis` TTS.

### 3. The Document Verification & OCR Pipeline
1. **Upload:** User uploads an image of an ID/Form or a PDF of a candidate affidavit.
2. **Processing:** The frontend converts the file to base64 and sends it to the backend.
3. **Vision Analysis:** The backend utilizes Gemini Vision to analyze the document.
4. **Validation/Extraction:** Gemini checks for legibility, formatting, or extracts complex structured data (like criminal antecedents).
5. **Feedback:** The frontend displays actionable feedback or structured summaries to the user.

### 4. The Live Data Pipeline (Scraper)
1. **Execution:** A Python script periodically runs, fetching data from `voters.eci.gov.in` and `www.eci.gov.in`.
2. **Storage:** Scraped announcements and forms are validated and stored in Firebase Firestore.
3. **Streaming:** The frontend React components subscribe to Firestore, providing users with a live "📡 ECI Updates" feed on the dashboard.
