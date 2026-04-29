// ============================================================
// MatdataMitra Backend — Voter Verification Service
// Mock data for hackathon demo (Eko API dropped)
// ============================================================

import type { VoterInfo } from "@matdata-mitra/shared-types";

/**
 * Mock voter database for demo purposes
 * Covers multiple states and constituencies to showcase the feature
 */
const MOCK_VOTERS: Record<string, VoterInfo> = {
  "DL01234567": {
    epicNumber: "DL01234567",
    name: "Rajesh Kumar Sharma",
    relativeName: "Mohan Lal Sharma",
    age: 35,
    gender: "Male",
    address: "H.No. 42, Sector 15, Rohini, Delhi - 110085",
    assemblyConstituency: "Rohini",
    assemblyConstituencyNumber: "24",
    parliamentaryConstituency: "North West Delhi",
    partNumber: "142",
    pollingStation: "Govt. Boys Sr. Sec. School, Sector 15, Rohini",
    sectionName: "Sector 15 Block B",
    state: "Delhi",
    district: "North West Delhi",
  },
  "MH09876543": {
    epicNumber: "MH09876543",
    name: "Priya Deshmukh",
    relativeName: "Anil Deshmukh",
    age: 28,
    gender: "Female",
    address: "Flat 301, Sai Apartments, Baner Road, Pune - 411045",
    assemblyConstituency: "Kothrud",
    assemblyConstituencyNumber: "210",
    parliamentaryConstituency: "Pune",
    partNumber: "87",
    pollingStation: "Z.P. School, Baner, Pune",
    sectionName: "Baner Ward 5",
    state: "Maharashtra",
    district: "Pune",
  },
  "TN05678901": {
    epicNumber: "TN05678901",
    name: "Karthik Subramanian",
    relativeName: "Subramanian V.",
    age: 42,
    gender: "Male",
    address: "12, Gandhi Street, T. Nagar, Chennai - 600017",
    assemblyConstituency: "T. Nagar",
    assemblyConstituencyNumber: "133",
    parliamentaryConstituency: "Chennai South",
    partNumber: "56",
    pollingStation: "Corporation Middle School, T. Nagar",
    sectionName: "T. Nagar Zone 3",
    state: "Tamil Nadu",
    district: "Chennai",
  },
  "KA03456789": {
    epicNumber: "KA03456789",
    name: "Lakshmi Devi",
    relativeName: "Ramu K.",
    age: 55,
    gender: "Female",
    address: "45, 4th Cross, Jayanagar 4th Block, Bengaluru - 560041",
    assemblyConstituency: "Jayanagar",
    assemblyConstituencyNumber: "176",
    parliamentaryConstituency: "Bangalore South",
    partNumber: "203",
    pollingStation: "National High School, Jayanagar 4th Block",
    sectionName: "Jayanagar 4th Block East",
    state: "Karnataka",
    district: "Bengaluru Urban",
  },
  "UP07654321": {
    epicNumber: "UP07654321",
    name: "Mohammad Irfan Khan",
    relativeName: "Abdul Khan",
    age: 31,
    gender: "Male",
    address: "Mohalla Qazipur, Aminabad, Lucknow - 226018",
    assemblyConstituency: "Lucknow Central",
    assemblyConstituencyNumber: "182",
    parliamentaryConstituency: "Lucknow",
    partNumber: "118",
    pollingStation: "Primary School, Aminabad, Lucknow",
    sectionName: "Aminabad Ward 12",
    state: "Uttar Pradesh",
    district: "Lucknow",
  },
};

/**
 * Verify a voter's EPIC number using mock data
 * In production, this would call the actual Voter ID API
 */
export async function verifyVoter(epicNumber: string): Promise<VoterInfo> {
  const cleanEpic = epicNumber.trim().toUpperCase();

  // Validate EPIC format (2–3 letters + 7 digits)
  if (!/^[A-Z]{2,3}\d{7,8}$/.test(cleanEpic)) {
    throw new Error(
      "Invalid EPIC format. Expected 2-3 letters followed by 7-8 digits (e.g., DL01234567)"
    );
  }

  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  const voter = MOCK_VOTERS[cleanEpic];
  if (!voter) {
    throw new Error(
      "Voter not found. Try one of our demo EPICs: DL01234567, MH09876543, TN05678901, KA03456789, UP07654321"
    );
  }

  return voter;
}

/** Get list of available demo EPIC numbers */
export function getDemoEpics(): string[] {
  return Object.keys(MOCK_VOTERS);
}
