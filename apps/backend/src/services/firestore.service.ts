// ============================================================
// MatdataMitra Backend — Firestore Service
// Cost-saving layer to intercept AI queries with local data
// ============================================================

import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Backend: Firebase Admin initialized via Service Account Key');
    } else {
      admin.initializeApp();
      console.log('Backend: Firebase Admin initialized via Application Default Credentials');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin in backend:', error);
  }
}

const db = admin.firestore();

/**
 * Searches the Firestore `voter_services` collection for highly relevant keywords.
 * If a match is found, it returns the structured data to be used as an immediate 
 * response instead of calling the Gemini API.
 */
export async function findLocalAnswer(query: string): Promise<string | null> {
  if (!query) return null;

  const queryLower = query.toLowerCase();
  
  // Define keyword mapping to document IDs (or we could fetch all and filter locally since it's small)
  try {
    const snapshot = await db.collection('voter_services').get();
    
    // Simple relevance matching algorithm
    let bestMatch: any = null;
    let highestScore = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      let score = 0;

      const title = (data.title_en || '').toLowerCase();
      const desc = (data.description_en || '').toLowerCase();

      // Check if query exactly mentions the form or title
      if (title.includes(queryLower) || queryLower.includes(title)) {
        score += 10;
      }
      
      // Keyword matching
      const keywords = queryLower.split(' ').filter(k => k.length > 3);
      for (const word of keywords) {
        if (title.includes(word)) score += 3;
        if (desc.includes(word)) score += 1;
      }

      if (score > highestScore && score >= 5) {
        highestScore = score;
        bestMatch = data;
      }
    });

    if (bestMatch) {
      console.log(`✅ Backend found local match with score ${highestScore}: ${bestMatch.title_en}`);
      
      // Format a clean string response
      let response = `I found exactly what you need in our database! \n\n**${bestMatch.title_en}**\n${bestMatch.description_en || ''}\n`;
      
      if (bestMatch.pdf_en) {
        response += `\n📄 **Download Official PDF:** [Click here to download](${bestMatch.pdf_en})`;
      } else if (bestMatch.source_url) {
        response += `\n🌐 **Official Link:** [Click here to open](${bestMatch.source_url})`;
      }

      return response;
    }
    
    console.log(`❌ No local match found for: "${query}". Proceeding to AI Agent...`);
    return null;

  } catch (error) {
    console.error("Error searching Firestore:", error);
    return null;
  }
}
