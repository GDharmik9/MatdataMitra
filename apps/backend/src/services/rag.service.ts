// ============================================================
// MatdataMitra Backend — RAG (Retrieval-Augmented Generation) Service
// Retrieves official ECI documents to ground Gemini responses
// ============================================================

import { Storage } from "@google-cloud/storage";
import { env } from "../config/env";
import type { RAGSource, RAGContext } from "@matdata-mitra/shared-types";

// Initialize Google Cloud Storage client
const storage = new Storage({
  projectId: env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucket = storage.bucket(env.GCS_BUCKET_NAME);

/**
 * In-memory document store for development
 * In production, replace with Google Vector Search (Matching Engine)
 * or Vertex AI Vector Search for semantic retrieval
 */
const documentCache: Map<
  string,
  { content: string; metadata: Record<string, string> }
> = new Map();

/**
 * Load documents from Google Cloud Storage into the local cache
 * Call this during server startup
 */
export async function initializeRAGPipeline(): Promise<void> {
  try {
    console.log("📚 Initializing RAG pipeline...");

    const [files] = await bucket.getFiles({ prefix: "documents/" });

    for (const file of files) {
      if (
        file.name.endsWith(".txt") ||
        file.name.endsWith(".json") ||
        file.name.endsWith(".md")
      ) {
        const [content] = await file.download();
        documentCache.set(file.name, {
          content: content.toString("utf-8"),
          metadata: {
            name: file.name,
            updated: file.metadata.updated ?? "",
          },
        });
      }
    }

    console.log(
      `✅ RAG pipeline initialized — ${documentCache.size} documents loaded`
    );
  } catch (error) {
    console.warn(
      "⚠️  RAG pipeline initialization skipped (GCS not configured):",
      (error as Error).message
    );
    // Load sample documents for development
    loadSampleDocuments();
  }
}

/**
 * Load sample ECI documents for development/demo purposes
 */
function loadSampleDocuments(): void {
  const sampleDocs = [
    {
      id: "docs/voter-registration.txt",
      content: `VOTER REGISTRATION PROCESS (Form 6)
      
To register as a new voter in India:
1. You must be an Indian citizen.
2. You must have attained the age of 18 years on the qualifying date (1st January of the year of revision).
3. You must be ordinarily resident at the address mentioned in the application.

Steps to register:
Step 1: Visit the National Voters' Service Portal (NVSP) at voters.eci.gov.in
Step 2: Click on "New Voter Registration" and fill Form 6.
Step 3: Upload required documents — proof of age (birth certificate, school certificate, passport) 
        and proof of address (Aadhaar, utility bill, bank passbook).
Step 4: Submit the form online. You will receive an application reference number.
Step 5: A Booth Level Officer (BLO) will visit your address for verification.
Step 6: Once approved, your name will appear in the electoral roll, and you will receive your EPIC card.

Source: Election Commission of India — Voter Registration Manual 2024`,
      metadata: { name: "Voter Registration Guide", source: "ECI Manual" },
    },
    {
      id: "docs/form-7-deletion.txt",
      content: `FORM 7 — OBJECTION TO INCLUSION OF NAME IN ELECTORAL ROLL

Form 7 is used to object to the inclusion of a name in the electoral roll. This is typically filed when:
- A person has died and their name needs to be removed.
- A person has shifted to another constituency.
- A person has been registered fraudulently or with incorrect details.

How to file Form 7:
1. Visit voters.eci.gov.in → Select "Deletion of Name"
2. Fill in the EPIC number or details of the person whose name should be removed.
3. Provide the reason for deletion.
4. Upload supporting documents (death certificate, shifting proof, etc.).
5. Submit — the Electoral Registration Officer (ERO) will verify and process.

Source: ECI — Form 7 Guidelines`,
      metadata: { name: "Form 7 Deletion Guide", source: "ECI Guidelines" },
    },
    {
      id: "docs/form-8-correction.txt",
      content: `FORM 8 — CORRECTION / TRANSPOSITION OF ENTRY IN ELECTORAL ROLL

Form 8 is used for two purposes:
A) Form 8A — Correction of entries (name, age, photo, address) in the electoral roll.
B) Form 8 — Shifting/transposition of entry from one constituency to another within the same state.

How to file Form 8:
1. Visit voters.eci.gov.in → Select "Correction in Voter Details" or "Shifting from One AC to Another".
2. Enter your EPIC number.
3. Fill in the fields you want to correct or provide new address details.
4. Upload proof documents for the correction.
5. Submit and track using the reference number.

IMPORTANT: Form 8 for shifting does NOT create a new voter ID. It transfers your existing entry.

Source: ECI — Electoral Roll Maintenance Guidelines`,
      metadata: { name: "Form 8 Correction/Shifting Guide", source: "ECI Guidelines" },
    },
    {
      id: "docs/epic-download.txt",
      content: `e-EPIC (Digital Voter ID) DOWNLOAD PROCESS

The e-EPIC is a portable document format (PDF) version of the EPIC (Electors Photo Identity Card) 
that can be downloaded on mobile phones or stored digitally.

Steps to download e-EPIC:
Step 1: Visit voters.eci.gov.in or download the Voter Helpline App.
Step 2: Login with your registered mobile number (linked to your EPIC).
Step 3: Complete OTP verification.
Step 4: Navigate to "Download e-EPIC" section.
Step 5: Your e-EPIC will be downloaded as a secured PDF with a QR code.

Note: e-EPIC is a valid proof of identity at the polling station, 
equivalent to the physical EPIC card.

Source: ECI Notification — e-EPIC Launch Guidelines 2021`,
      metadata: { name: "e-EPIC Download Guide", source: "ECI Notification" },
    },
    {
      id: "docs/alternative-photo-ids.txt",
      content: `12 APPROVED ALTERNATIVE PHOTO IDs FOR VOTING

If a voter does not have their EPIC card, they can use any of the following 12 alternative 
photo identity documents to prove their identity at the polling station:

1.  Aadhaar Card (UIDAI)
2.  MNREGA Job Card
3.  Passbook with photograph issued by Bank/Post Office
4.  Health Insurance Smart Card (under RSBY scheme)
5.  Driving License
6.  PAN Card
7.  Smart Card issued by Registrar General of India (NPR)
8.  Indian Passport
9.  Pension document with photograph
10. Service Identity Card issued by Central/State Government, Public Sector Undertakings
11. Official identity card issued to Members of Parliament / State Legislatures
12. Photo Voter Slip (issued by the election authorities for the current election)

IMPORTANT: The photo on the ID must be clearly identifiable. If the presiding officer 
cannot match the face, the voter may be challenged and asked additional questions.

Source: ECI Order No. 51/8/7/2015-EPS (Vol. III)`,
      metadata: { name: "Alternative Photo IDs for Voting", source: "ECI Order" },
    },
    {
      id: "docs/polling-day.txt",
      content: `POLLING DAY PROCEDURE — WHAT TO DO AT THE BOOTH

On Election Day:
1. CARRY: Your EPIC card (physical or e-EPIC) or any of the 12 approved alternative photo IDs 
   (Aadhaar, Passport, Driving License, PAN Card, etc.).
2. LOCATE: Find your assigned polling station. You can check on the Voter Helpline App or by 
   sending an SMS "EPIC <your EPIC number>" to 1950.
3. ARRIVE: Polling hours are typically 7:00 AM to 6:00 PM. Arrive early to avoid queues.
4. QUEUE: Stand in the designated queue. Separate queues exist for men, women, and persons with disabilities.
5. VERIFY: At the polling officer's desk, show your ID. Your finger will be checked for indelible ink.
6. RECEIVE: You will receive a voter slip with your serial number.
7. VOTE: Enter the voting compartment. Press the button on the EVM (Electronic Voting Machine) 
   next to your preferred candidate's name and symbol.
8. VVPAT: Verify your vote on the VVPAT (Voter Verifiable Paper Audit Trail) slip displayed for 7 seconds.
9. INK: Get indelible ink applied on your left index finger.
10. EXIT: Leave the polling station quietly.

QUEUE CUTOFF RULE: Any voter who is present in the queue at exactly 6:00 PM (or the official 
closing time) will be issued a numbered slip by the polling officer and WILL be allowed to vote, 
even if the actual voting happens after 6:00 PM. No one can be turned away once they are in the queue.

IMPORTANT: 
- No mobile phones or cameras are allowed inside the polling booth.
- Violation of polling rules is punishable under Section 135A of the Representation of the People Act, 1951.

Source: ECI — Handbook for Presiding Officers 2024`,
      metadata: { name: "Polling Day Guide", source: "ECI Handbook" },
    },
    {
      id: "docs/pwd-accessible-voting.txt",
      content: `ACCESSIBLE VOTING FOR PERSONS WITH DISABILITIES (PwD)

The Election Commission of India (ECI) has mandated several measures to ensure accessible 
and inclusive elections for Persons with Disabilities (PwD):

1. SEPARATE QUEUE: PwD voters have a separate, priority queue at every polling station.
2. WHEELCHAIR: Every polling station has a wheelchair available for mobility-impaired voters.
3. BRAILLE: Braille-enabled EVM/VVPAT for visually impaired voters. Each EVM button has a 
   Braille label corresponding to the candidate.
4. COMPANION: A PwD voter can bring a companion (above 18 years) to assist in the voting 
   process. The companion must sign a declaration at the polling station.
5. RAMP: Polling stations on upper floors must have ramp access.
6. POSTAL BALLOT: PwD voters with 40%+ disability can opt for postal ballot (Form 12D).
7. SAKSHAM APP: ECI's Saksham App provides accessible voter education and booth information.
8. SIGN LANGUAGE: Voter education materials are available in Indian Sign Language (ISL).

Source: ECI — Guidelines for Accessible Elections 2024`,
      metadata: { name: "PwD Accessible Voting Guide", source: "ECI Guidelines" },
    },
    {
      id: "docs/candidate-info.txt",
      content: `KNOW YOUR CANDIDATE — MANDATORY DISCLOSURES

Under Section 33A of the Representation of the People Act, 1951, every candidate MUST 
disclose the following at the time of filing their nomination:

1. CRIMINAL ANTECEDENTS: Details of all criminal cases (pending or convicted), including 
   FIR numbers, court names, charges, and current status.
2. ASSETS: Total movable and immovable assets including cash, deposits, vehicles, land, 
   buildings, and investments.
3. LIABILITIES: Outstanding loans, dues, and any government dues.
4. EDUCATION: Highest educational qualification.
5. INCOME TAX: Last 5 years' income tax returns.

The Supreme Court of India (2018) mandated that parties must publicize criminal 
antecedents of their candidates in newspapers and on their website within 48 hours of selection.

Voters can access affidavit data through:
- MyNeta.info (Association for Democratic Reforms)
- ECI website under candidate affidavits
- Voter Helpline App

Source: ECI — Candidate Affidavit Disclosure Rules`,
      metadata: { name: "Know Your Candidate Rules", source: "ECI Rules" },
    },
    {
      id: "docs/src-ssr-revision.txt",
      content: `WHAT IS SRC (SPECIAL SUMMARY REVISION)? - SIMPLE GUIDE

Sometimes you hear about "SRC" or "SSR" happening in your state. This stands for "Special Summary Revision". 

What is it?
It's basically a special month-long campaign by the Election Commission to clean up and update the voter list before an election year. 

Why does it happen?
1. To add new voters (people who just turned 18).
2. To remove dead people or people who moved away.
3. To fix mistakes in names, photos, or addresses.

When does it happen?
Usually once a year, often between November and January. During this time, the ECI sets up special camps on weekends at your local polling booth.

What should you do during SRC?
1. Check your name: Even if you voted last time, check the list to make sure your name wasn't accidentally removed.
2. Fix details: If your photo is old or name is spelled wrong, submit Form 8.
3. Register: If you are 18, submit Form 6 right away. 
During SRC, Booth Level Officers (BLOs) work faster to process your forms!

Source: ECI — Voter List Updates Explained`,
      metadata: { name: "SRC / SSR Simple Guide", source: "ECI Simple Guide" },
    },
  ];

  for (const doc of sampleDocs) {
    documentCache.set(doc.id, {
      content: doc.content,
      metadata: doc.metadata,
    });
  }

  console.log(
    `📝 Loaded ${sampleDocs.length} sample documents for development`
  );
}


/**
 * Retrieve relevant documents for a given query
 * Uses simple keyword matching for development;
 * Replace with Vector Search embeddings in production
 */
export async function retrieveDocuments(
  query: string,
  topK: number = 3
): Promise<RAGSource[]> {
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  const scored: Array<{ id: string; score: number; content: string; metadata: Record<string, string> }> = [];

  for (const [id, doc] of documentCache) {
    const contentLower = doc.content.toLowerCase();
    let score = 0;

    for (const term of queryTerms) {
      const matches = contentLower.split(term).length - 1;
      score += matches;
    }

    if (score > 0) {
      scored.push({ id, score, content: doc.content, metadata: doc.metadata });
    }
  }

  // Sort by relevance score (descending) and take top K
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK).map((item) => ({
    documentId: item.id,
    title: item.metadata.name || item.id,
    excerpt: item.content.substring(0, 500) + "...",
    relevanceScore: item.score / Math.max(queryTerms.length, 1),
    source: item.metadata.source || "ECI Official Document",
  }));
}

/**
 * Build an augmented prompt by combining the user query with retrieved documents
 */
export async function buildAugmentedPrompt(
  query: string,
  documents?: RAGSource[]
): Promise<RAGContext> {
  const docs = documents ?? (await retrieveDocuments(query));

  const contextText = docs
    .map(
      (doc, i) =>
        `[Source ${i + 1}: ${doc.title}]\n${doc.excerpt}`
    )
    .join("\n\n");

  const augmentedPrompt = contextText
    ? `Based on the following official Election Commission documents, answer the user's question accurately.
    
${contextText}

User's Question: ${query}

Provide a clear, step-by-step answer in simple language. Cite the source document(s) used.`
    : query;

  return {
    query,
    retrievedDocuments: docs,
    augmentedPrompt,
  };
}

/**
 * Upload a document to GCS for the RAG pipeline
 */
export async function uploadDocument(
  filename: string,
  content: string,
  metadata: Record<string, string> = {}
): Promise<void> {
  try {
    const file = bucket.file(`documents/${filename}`);
    await file.save(content, {
      metadata: { metadata },
      contentType: "text/plain",
    });

    // Also add to local cache
    documentCache.set(`documents/${filename}`, { content, metadata });

    console.log(`📤 Document uploaded: ${filename}`);
  } catch (error) {
    console.error(`❌ Failed to upload document: ${filename}`, error);
    throw error;
  }
}
