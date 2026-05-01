# 🗳️ MatdataMitra (मतदाता मित्र)

**An AI-powered, multilingual Interactive Electoral Assistant for Indian Voters.**

MatdataMitra acts as an intelligent reasoning layer between complex government data (Election Commission of India) and the end-user. Built entirely on Google Cloud infrastructure, it simplifies legal and administrative jargon, answers voter queries in real-time, and provides step-by-step guidance on the electoral process in the user's native language.

![MatdataMitra Dashboard](https://github.com/user-attachments/assets/matdatamitra-banner.png)

## 🌐 Live Demonstration (Cloud Run)
- **Frontend Portal**: [https://frontend-1052506309358.asia-south1.run.app](https://frontend-1052506309358.asia-south1.run.app)
- **Backend API**: [https://backend-1052506309358.asia-south1.run.app/health](https://backend-1052506309358.asia-south1.run.app/health)

## ✨ Key Features

1. **AI Chat Assistant (Floating Widget)**
   - Powered by **Google Gemini 2.0 Flash**, the assistant translates complex ECI manuals into plain, 5th-grade level explanations (e.g., explaining "Special Summary Revision / SRC").
   - Universally accessible floating chat widget on every page.

2. **Multilingual Voice Integration**
   - Supports 22+ regional Indian languages using the browser's native Speech APIs. Speak in Hindi, Marathi, Bengali, or Tamil, and the AI translates and processes the query seamlessly.

3. **Anti-Disinformation RAG Pipeline**
   - Answers are strictly generated from verified ECI documents (Forms 6/7/8 guidelines, PwD rules) using a Retrieval-Augmented Generation approach. Hallucinations are prevented via strict system prompt scoping.

4. **Know Your Candidate (KYC)**
   - Search for candidates to view their educational background, declared assets, party affiliation, and any criminal antecedents, ensuring voters make informed decisions.

5. **Polling Booth Locator & Voter Verification**
   - Enter an EPIC number to instantly find voter registration status and the exact geographical polling booth location.

6. **Interactive Voter Journey**
   - A step-by-step interactive roadmap that guides users from registration to polling day, customized dynamically via Gemini JSON generation based on user demographics.

7. **AI Document Pre-Verifier (Gemini Vision)**
   - Upload images of application forms or IDs. Gemini Vision analyzes the document instantly to ensure it meets strict ECI formatting and legibility standards before actual submission, preventing rejections.

8. **Democracy Defender Quiz**
   - An interactive, dynamically generated civic education quiz (using Gemini JSON mode) to gamify voter awareness and test knowledge on the electoral process.

9. **Know Your Candidate (KYC) & Affidavit OCR**
   - Search for candidates to view their details. Users can upload candidate affidavit PDFs, which are analyzed by Gemini Vision OCR to extract complex asset, education, and criminal antecedent data into readable summaries.

10. **Multi-Domain ECI Data Scraper**
    - A Python-based scraper fetching live announcements and forms from both `voters.eci.gov.in` and `www.eci.gov.in`. The scraped data is stored in Firestore and streamed live to the "Live ECI Updates" section on the frontend dashboard.

11. **Universal Accessibility (PwD Support & WCAG)**
    - High Contrast modes, Font Scaling, ARIA labels, Keyboard navigation, and dynamic language tagging built-in for Persons with Disabilities (PwD) voters. All modules follow global design system variables.

12. **Firestore "Cost-Saving Wall" (Efficiency)**
    - Before hitting the Gemini RAG API, incoming queries are intercepted and matched against local Firestore keywords. Common queries (like "Form 6") instantly return verified forms at 0ms latency and $0 cost.

---

## 🏗️ Tech Stack (Google-Centric)

MatdataMitra is a Turborepo monorepo designed to scale:

- **Frontend:** Next.js 15 (React 19), Server Components, Vanilla CSS
- **Backend:** Node.js, Express.js, TypeScript
- **AI Engine:** Google Gen AI SDK (`@google/genai`), Gemini 2.0 Flash
- **Voice/Translation:** Google Cloud Translation API (via Gemini), Web Speech API
- **Authentication:** Firebase Auth (Google Sign-In)
- **Infrastructure:** Turborepo, Google Cloud Application Default Credentials (ADC)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Yarn (`npm install -g yarn`)
- Google Cloud CLI (`gcloud`) installed and configured.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/MatdataMitra.git
cd MatdataMitra
```

### 2. Install dependencies
```bash
yarn install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your keys (see `.env.example`):
```env
# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=matdatamitra.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=matdatamitra
# ... (see .env.example)
```

Create a `.env.local` inside `apps/frontend/` with the exact same Firebase `NEXT_PUBLIC_` variables to ensure Next.js loads them.

### 4. Authenticate with Google Cloud
Because the backend uses Application Default Credentials (ADC), you must authenticate your local terminal:
```bash
gcloud auth application-default login
gcloud config set project your-gcp-project-id
```

### 5. Run the Application
Start the Turborepo development server:
```bash
yarn dev
```
- **Frontend UI:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080`

### 6. Run Tests
The project includes automated tests using Jest and React Testing Library:
```bash
yarn workspace frontend test
yarn workspace backend test
```

---

## 📚 Documentation
For detailed architecture and system design, please see the `docs/` folder:
- [Overview](docs/Overview.md)
- [Description & Impact](docs/description.md)
- [System Architecture](docs/SystemArchitecture.md)
- [High-Level Design (HLD)](docs/HLD.md)
- [Low-Level Design (LLD)](docs/LLD.md)

---
*Built with ❤️ for Indian Democracy | Google Hackathon 2026*
