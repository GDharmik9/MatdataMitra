# Low-Level Design (LLD)

## 1. Core Data Models (`@matdata-mitra/shared-types`)

### Chat Interfaces
```typescript
export interface ChatRequest {
  message: string;
  language?: string; // e.g., 'en', 'hi', 'mr'
}

export interface ChatResponse {
  reply: string;
  translatedReply?: string;
  language: string;
  sources?: Array<{
    id: string;
    score: number;
    metadata: Record<string, string>;
  }>;
}
```

### Knowledge Base Interface
```typescript
export interface RagDocument {
  id: string;
  content: string;
  metadata: {
    name: string;
    source: string;
  };
}
```

## 2. API Contracts

### `POST /api/chat`
- **Request Body:** `ChatRequest`
- **Response Body:**
```json
{
  "success": true,
  "data": {
    "reply": "SRC stands for Special Summary Revision...",
    "language": "en",
    "sources": [
      {
        "id": "docs/src-ssr-revision.txt",
        "score": 1.0,
        "metadata": { "name": "SRC Simple Guide", "source": "ECI" }
      }
    ]
  },
  "timestamp": 1714392000000
}
```

### `GET /api/candidates?query=...`
- **Request Parameters:** `query` (string)
- **Response Body:** Array of `Candidate` objects containing ID, Name, Party, Education, Assets, Liabilities, and Criminal records boolean.

### `POST /api/candidates/analyze-affidavit`
- **Request Body:** `{ base64Pdf: "...", mimeType: "application/pdf" }`
- **Response Body:** `ApiResponse<AffidavitSummary>`

### `POST /api/document/verify`
- **Request Body:** `{ base64Image: "...", mimeType: "image/jpeg" }`
- **Response Body:** `ApiResponse<DocumentVerificationResult>`

### `POST /api/journey/generate`
- **Request Body:** `{ ageGroup: "18-21", location: "Urban", isPwD: false }`
- **Response Body:** `ApiResponse<JourneyChecklist>`

### `POST /api/quiz/generate`
- **Request Body:** Empty (or optional difficulty)
- **Response Body:** `ApiResponse<QuizQuestion[]>`

## 3. RAG Retrieval Logic (`rag.service.ts`)
The `buildAugmentedPrompt` function performs the following logic:
1. Normalizes the user query to lowercase.
2. Checks against hardcoded keywords (e.g., `src`, `ssr`, `form 6`, `form 8`, `pwd`).
3. If a match is found, retrieves the corresponding `RagDocument.content`.
4. Wraps the content in a template:
```text
--- RETRIEVED CONTEXT (from official ECI documents) ---
[CONTENT]
--- END CONTEXT ---

User Query: [QUERY]
```
5. Returns the augmented string back to `chat.routes.ts`.

## 4. Environment & Configuration
```env
PORT=8080
GOOGLE_CLOUD_PROJECT_ID=matdatamitra
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash
NEXT_PUBLIC_FIREBASE_API_KEY=...
```
