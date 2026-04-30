import * as admin from 'firebase-admin';

// Initialize Firebase Admin (will use application default credentials if not provided)
if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();

const authenticData = [
  {
    id: "src-2024",
    category: "Election SRC",
    title_en: "Special Summary Revision of Electoral Rolls (SRC)",
    description_en: "The Election Commission of India (ECI) conducts a Special Summary Revision of Electoral Rolls every year. This is the process of updating the voter list to include new voters who have turned 18, removing names of deceased or shifted voters, and correcting errors. During the SRC period, Booth Level Officers (BLOs) visit homes for verification, and special camps are held at polling stations.",
    source_url: "https://eci.gov.in/electoral-roll/special-summary-revision/",
    title_hi: "निर्वाचक नामावलियों का विशेष संक्षिप्त पुनरीक्षण (SRC)",
    title_mr: "मतदार याद्यांची विशेष संक्षिप्त उजळणी (SRC)"
  },
  {
    id: "update-2024-general",
    category: "Election Updates",
    title_en: "2024 General Election Results Declared",
    description_en: "The 2024 Indian general elections concluded on June 1, 2024, following a massive 7-phase exercise. With over 968 million registered voters and 642 million participating (the highest ever for women voters), the Election Commission successfully managed the largest democratic exercise in history. Results were declared on June 4, 2024, constituting the 18th Lok Sabha.",
    source_url: "https://results.eci.gov.in/",
    title_hi: "2024 आम चुनाव परिणाम घोषित",
    title_mr: "2024 सार्वत्रिक निवडणूक निकाल जाहीर"
  },
  {
    id: "update-new-facilities",
    category: "Election Updates",
    title_en: "New Facilitations for Voters Above 85 & PwD",
    description_en: "For the first time in the 2024 General Elections, the ECI introduced the 'Home Voting' facility. Voters over the age of 85 years and Persons with Disabilities (PwD) with 40% benchmark disability can opt to vote from their homes. Form 12D is required to be filled and submitted to the Returning Officer to avail this facility.",
    source_url: "https://eci.gov.in/voter/pwd-voter/",
    title_hi: "85 से ऊपर के मतदाताओं और PwD के लिए नई सुविधाएँ",
    title_mr: "85 वर्षांवरील आणि PwD मतदारांसाठी नवीन सुविधा"
  }
];

async function seedData() {
  console.log("Seeding authentic SRC and Election Update data to Firestore...");
  const batch = db.batch();

  for (const item of authenticData) {
    const docRef = db.collection('voter_services').doc(item.id);
    batch.set(docRef, item);
  }

  await batch.commit();
  console.log("✅ Successfully seeded SRC and Update data.");
}

seedData().catch(console.error);
