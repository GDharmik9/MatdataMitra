// ============================================================
// MatdataMitra Backend — Google Civic Information Service
// Fetches elections and representative details
// ============================================================

import axios from "axios";
import { env } from "../config/env";
import type { ElectionInfo, Representative } from "@matdata-mitra/shared-types";

const CIVIC_API_BASE = "https://www.googleapis.com/civicinfo/v2";

/** Fetch upcoming elections from Google Civic Information API */
export async function getElections(): Promise<ElectionInfo[]> {
  try {
    const response = await axios.get(`${CIVIC_API_BASE}/elections`, {
      params: { key: env.CIVIC_API_KEY },
      timeout: 10000,
    });
    return (response.data?.elections ?? []).map((e: Record<string, string>) => ({
      id: e.id,
      name: e.name,
      electionDay: e.electionDay,
      ocdDivisionId: e.ocdDivisionId ?? "",
    }));
  } catch (error) {
    console.error("❌ Civic Elections API Error:", error);
    throw new Error("Failed to fetch elections");
  }
}

/** Fetch representative info for a given address */
export async function getRepresentatives(
  address: string
): Promise<{ representatives: Representative[]; offices: string[] }> {
  try {
    const response = await axios.get(`${CIVIC_API_BASE}/representatives`, {
      params: { key: env.CIVIC_API_KEY, address },
      timeout: 10000,
    });
    const data = response.data;
    const offices: string[] = (data.offices ?? []).map((o: Record<string, string>) => o.name);
    const officials: Representative[] = (data.officials ?? []).map(
      (o: Record<string, unknown>, i: number) => ({
        name: o.name as string ?? "",
        party: o.party as string ?? "",
        photoUrl: o.photoUrl as string ?? undefined,
        phones: (o.phones as string[]) ?? [],
        urls: (o.urls as string[]) ?? [],
        emails: (o.emails as string[]) ?? [],
        channels: (o.channels as Array<{ type: string; id: string }>) ?? [],
        office: offices[i] ?? "",
      })
    );
    return { representatives: officials, offices };
  } catch (error) {
    console.error("❌ Civic Representatives API Error:", error);
    throw new Error("Failed to fetch representatives");
  }
}
