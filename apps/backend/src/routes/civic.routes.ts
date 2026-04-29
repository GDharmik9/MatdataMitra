// ============================================================
// MatdataMitra Backend — Civic Information Routes
// Proxy to Google Civic Information API
// ============================================================

import { Router, Request, Response } from "express";
import { getElections, getRepresentatives } from "../services/civic.service";
import type { ApiResponse } from "@matdata-mitra/shared-types";

const router = Router();

/** GET /api/civic/elections — Fetch upcoming elections */
router.get("/elections", async (_req: Request, res: Response) => {
  try {
    const elections = await getElections();
    return res.json({
      success: true,
      data: elections,
      timestamp: Date.now(),
    } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch elections",
      timestamp: Date.now(),
    } satisfies ApiResponse);
  }
});

/** GET /api/civic/representatives?address=... — Fetch representatives */
router.get("/representatives", async (req: Request, res: Response) => {
  try {
    const { address } = req.query;
    if (!address || typeof address !== "string") {
      return res.status(400).json({
        success: false,
        error: "Address query parameter is required",
        timestamp: Date.now(),
      } satisfies ApiResponse);
    }
    const data = await getRepresentatives(address);
    return res.json({ success: true, data, timestamp: Date.now() } satisfies ApiResponse);
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch representatives",
      timestamp: Date.now(),
    } satisfies ApiResponse);
  }
});

export default router;
