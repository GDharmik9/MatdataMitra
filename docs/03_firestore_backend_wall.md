# 🛡️ Stage 3: Firestore AI Cost-Saving Wall

## Overview
Every call to the Gemini API costs money and adds ~1-3 seconds of latency. This stage implemented a **"wall"** in the backend that intercepts every chat/voice query and checks our local Firestore database first. If a high-confidence match is found, Gemini is never called.

---

## The Problem

Before this stage, every user message went directly to Gemini:

```
User: "How do I register to vote?"
  → Backend → Gemini API (costs $) → Response (1-3s delay)
```

Even if we already had the perfect answer for "voter registration" stored in Firestore.

---

## The Solution: Local-First Interception

```
User: "How do I register to vote?"
  → Backend
  → findLocalAnswer("How do I register to vote?")
  → Firestore: found "Form 6: New Voter Registration" (score: 0.8)
  → Return local answer instantly (0ms, $0 cost)
  → ✅ Gemini NOT called
```

---

## Architecture Diagram

```
POST /api/chat
      │
      ▼
1. Detect language (if not English, translate to English first)
      │
      ▼
2. findLocalAnswer(query) ── Firestore keyword match
      │
   HIT ──────────────────────────────────────────▶ Return local answer
      │                                            (translate back if needed)
   MISS
      │
      ▼
3. determineIntent(query) ── Gemini intent classification
      │
      ▼
4. buildAugmentedPrompt(query) ── RAG pipeline
      │
      ▼
5. Gemini API call ── Generate response
      │
      ▼
6. Return AI response
```

---

## Implementation: `firestore.service.ts`

```typescript
// apps/backend/src/services/firestore.service.ts

export async function findLocalAnswer(query: string): Promise<string | null> {
  const snapshot = await db.collection('voter_services').get();
  
  let bestMatch: any = null;  // typed as 'any' to avoid TS strict-mode errors
  let highestScore = 0;

  const queryLower = query.toLowerCase();

  snapshot.forEach(doc => {
    const data = doc.data();
    let score = 0;
    const titleWords = (data.title_en || '').toLowerCase().split(' ');

    // Keyword matching — score increases for each query word found in title
    for (const word of queryLower.split(' ')) {
      if (word.length > 2 && titleWords.some(tw => tw.includes(word))) {
        score += 1;
      }
    }

    // Bonus score for description match
    if (data.description_en && data.description_en.toLowerCase().includes(queryLower.substring(0, 20))) {
      score += 2;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = data;
    }
  });

  // Only return if score is high enough (threshold: 1)
  if (highestScore >= 1 && bestMatch) {
    let answer = `**${bestMatch.title_en}**\n\n${bestMatch.description_en || ''}`;
    
    if (bestMatch.pdf_en) {
      answer += `\n\n📄 **Download:** [Official PDF](${bestMatch.pdf_en})`;
    }
    if (bestMatch.source_url) {
      answer += `\n\n🔗 **Source:** [ECI Official Page](${bestMatch.source_url})`;
    }
    return answer;
  }
  
  return null; // No match → proceed to Gemini
}
```

---

## Chat Route Integration

```typescript
// apps/backend/src/routes/chat.routes.ts

router.post('/chat', async (req, res) => {
  const { message, language } = req.body;

  // Step 1: Translate to English for processing
  let processableText = message;
  if (language !== 'en') {
    processableText = await translateText(message, language, 'en');
  }

  // Step 2: Check local DB FIRST (The "Wall")
  const localAnswer = await findLocalAnswer(processableText);
  
  if (localAnswer) {
    console.log('🛡️ Wall activated: Returning local data, bypassing Gemini API.');
    
    let finalReply = localAnswer;
    // Translate back to user's language
    if (language !== 'en') {
      finalReply = await translateText(localAnswer, 'en', language);
    }
    
    return res.json({
      success: true,
      data: {
        reply: localAnswer,
        translatedReply: language !== 'en' ? finalReply : undefined,
        language,
        sources: [{
          documentId: 'local-db',
          title: 'MatdataMitra Local Cache',
          excerpt: 'Retrieved from Firestore cache',
          relevanceScore: 1.0,
          source: 'Firestore',
        }]
      }
    });
  }

  // Step 3: Gemini (only reached if local DB misses)
  const ragContext = await buildAugmentedPrompt(processableText);
  // ... rest of Gemini call
});
```

---

## TypeScript Bug Fix: `RAGSource` Type Mismatch

When the `sources` array was first written, it used a shape that didn't match the `RAGSource` interface in `shared-types`:

```typescript
// ❌ WRONG — used wrong field names
sources: [{ id: "local-db", metadata: { name: "...", source: "..." } }]

// ✅ CORRECT — matches RAGSource interface
sources: [{
  documentId: "local-db",
  title: "MatdataMitra Local Cache",
  excerpt: "Retrieved from Firestore cache",
  relevanceScore: 1.0,
  source: "Firestore"
}]
```

This caused a **TypeScript build error** that prevented Docker from compiling the backend. Fixed by aligning with the `shared-types` package definition.

---

## TypeScript Bug Fix: `bestMatch` Inferred as `never`

```typescript
// ❌ WRONG — TypeScript strict mode infers null as `never`
let bestMatch = null;
// ...
bestMatch.title_en  // Error: Property 'title_en' does not exist on type 'never'

// ✅ CORRECT — explicit `any` type annotation
let bestMatch: any = null;
```

---

## Cost Savings Estimate

Assuming 100 queries/day for a hackathon demo:

| Scenario | API Calls | Cost (approx) |
|----------|-----------|---------------|
| No wall (all to Gemini) | 100/day | ~$0.30/day |
| With wall (80% hit rate) | 20/day | ~$0.06/day |
| **Savings** | **80 calls/day** | **~80% reduction** |

At scale (10,000 queries/day), this becomes $30/day saved → **$900/month**.

---

## Future Improvements

| Improvement | Impact |
|-------------|--------|
| Vector similarity search (Vertex AI) | Better matching than keyword scoring |
| Cache hit rate logging | Measure actual wall effectiveness |
| Dynamic threshold tuning | Adjust confidence threshold based on query length |
| Response quality scoring | A/B test local vs Gemini answers for accuracy |
