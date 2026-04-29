// ============================================================
// MatdataMitra Backend — Candidate / KYC Service
// Mock candidate data (structured like india-votes-data)
// ============================================================

export interface CandidateInfo {
  id: string;
  name: string;
  party: string;
  partyShort: string;
  constituency: string;
  state: string;
  age: number;
  gender: string;
  education: string;
  assets: string;
  liabilities: string;
  criminalCases: number;
  criminalDetails: string;
}

const MOCK_CANDIDATES: CandidateInfo[] = [
  {
    id: "c1", name: "Amit Verma", party: "Bharatiya Janata Party", partyShort: "BJP",
    constituency: "Rohini", state: "Delhi", age: 52, gender: "Male",
    education: "Graduate (B.Com)", assets: "₹3.2 Crore", liabilities: "₹45 Lakh",
    criminalCases: 0, criminalDetails: "No criminal cases",
  },
  {
    id: "c2", name: "Sunita Yadav", party: "Indian National Congress", partyShort: "INC",
    constituency: "Rohini", state: "Delhi", age: 45, gender: "Female",
    education: "Post Graduate (MA Political Science)", assets: "₹1.8 Crore", liabilities: "₹12 Lakh",
    criminalCases: 0, criminalDetails: "No criminal cases",
  },
  {
    id: "c3", name: "Manoj Tiwari", party: "Aam Aadmi Party", partyShort: "AAP",
    constituency: "Rohini", state: "Delhi", age: 38, gender: "Male",
    education: "Graduate (B.Tech)", assets: "₹92 Lakh", liabilities: "₹8 Lakh",
    criminalCases: 1, criminalDetails: "IPC 188 — Disobedience of public servant order (pending)",
  },
  {
    id: "c4", name: "Ramesh Patil", party: "Bharatiya Janata Party", partyShort: "BJP",
    constituency: "Kothrud", state: "Maharashtra", age: 58, gender: "Male",
    education: "Post Graduate (MBA)", assets: "₹8.5 Crore", liabilities: "₹1.2 Crore",
    criminalCases: 0, criminalDetails: "No criminal cases",
  },
  {
    id: "c5", name: "Anjali Shinde", party: "Nationalist Congress Party", partyShort: "NCP",
    constituency: "Kothrud", state: "Maharashtra", age: 41, gender: "Female",
    education: "Graduate (LLB)", assets: "₹2.1 Crore", liabilities: "₹35 Lakh",
    criminalCases: 0, criminalDetails: "No criminal cases",
  },
  {
    id: "c6", name: "K. Selvam", party: "Dravida Munnetra Kazhagam", partyShort: "DMK",
    constituency: "T. Nagar", state: "Tamil Nadu", age: 55, gender: "Male",
    education: "Post Graduate (MA Economics)", assets: "₹4.6 Crore", liabilities: "₹90 Lakh",
    criminalCases: 2, criminalDetails: "IPC 341, 506 — Wrongful restraint, Criminal intimidation (acquitted in 1, pending 1)",
  },
  {
    id: "c7", name: "Priya Rajan", party: "All India Anna Dravida Munnetra Kazhagam", partyShort: "AIADMK",
    constituency: "T. Nagar", state: "Tamil Nadu", age: 44, gender: "Female",
    education: "Doctorate (PhD Literature)", assets: "₹1.5 Crore", liabilities: "₹20 Lakh",
    criminalCases: 0, criminalDetails: "No criminal cases",
  },
  {
    id: "c8", name: "Naveen Gowda", party: "Janata Dal (Secular)", partyShort: "JD(S)",
    constituency: "Jayanagar", state: "Karnataka", age: 49, gender: "Male",
    education: "Graduate (B.Sc Agriculture)", assets: "₹5.2 Crore", liabilities: "₹75 Lakh",
    criminalCases: 0, criminalDetails: "No criminal cases",
  },
];

/** Get candidates for a specific constituency */
export function getCandidatesByConstituency(constituency: string): CandidateInfo[] {
  const search = constituency.toLowerCase().trim();
  return MOCK_CANDIDATES.filter(
    (c) =>
      c.constituency.toLowerCase().includes(search) ||
      c.state.toLowerCase().includes(search)
  );
}

/** Get a single candidate by ID */
export function getCandidateById(id: string): CandidateInfo | undefined {
  return MOCK_CANDIDATES.find((c) => c.id === id);
}

/** Get all unique constituencies */
export function getConstituencies(): string[] {
  return [...new Set(MOCK_CANDIDATES.map((c) => `${c.constituency}, ${c.state}`))];
}
