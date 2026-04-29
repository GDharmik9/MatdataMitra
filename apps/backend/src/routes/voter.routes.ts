// ============================================================
// MatdataMitra Backend — Voter Verification Routes
// ============================================================

import { Router, Request, Response } from "express";
import { verifyVoter } from "../services/voter.service";
import { voterVerifyLimiter } from "../middleware/rateLimiter";
import type { ApiResponse, VoterInfo } from "@matdata-mitra/shared-types";

const router = Router();

/**
 * POST /api/voter/verify
 * Verify a voter's EPIC number and return registration details
 */
router.post("/verify", voterVerifyLimiter, async (req: Request, res: Response) => {
  try {
    const { epicNumber } = req.body;

    if (!epicNumber?.trim()) {
      return res.status(400).json({
        success: false,
        error: "EPIC number is required",
        timestamp: Date.now(),
      } satisfies ApiResponse);
    }

    const voterInfo = await verifyVoter(epicNumber);

    return res.json({
      success: true,
      data: voterInfo,
      message: "Voter verified successfully",
      timestamp: Date.now(),
    } satisfies ApiResponse<VoterInfo>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    const status = message.includes("not found") ? 404 : 500;

    return res.status(status).json({
      success: false,
      error: message,
      timestamp: Date.now(),
    } satisfies ApiResponse);
  }
});

export default router;
