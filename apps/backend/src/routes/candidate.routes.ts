// ============================================================
// MatdataMitra Backend — Candidate / KYC Routes
// Know Your Candidate feature
// ============================================================

import { Router, Request, Response } from "express";
import {
  getCandidatesByConstituency,
  getCandidateById,
  getConstituencies,
} from "../services/candidate.service";
import type { ApiResponse } from "@matdata-mitra/shared-types";

const router = Router();

/** GET /api/candidates?constituency=... — Search candidates by constituency */
router.get("/", (req: Request, res: Response) => {
  const { constituency } = req.query;

  if (!constituency || typeof constituency !== "string") {
    // Return all constituencies if no query
    const constituencies = getConstituencies();
    return res.json({
      success: true,
      data: { constituencies },
      message: "Pass ?constituency=name to search for candidates",
      timestamp: Date.now(),
    } satisfies ApiResponse);
  }

  const q = constituency as string;
  const candidates = getCandidatesByConstituency(q);
  return res.json({
    success: true,
    data: { candidates, query: q },
    timestamp: Date.now(),
  } satisfies ApiResponse);
});

/** GET /api/candidates/:id — Get single candidate details */
router.get("/:id", (req: Request, res: Response) => {
  const candidate = getCandidateById(req.params.id as string);

  if (!candidate) {
    return res.status(404).json({
      success: false,
      error: "Candidate not found",
      timestamp: Date.now(),
    } satisfies ApiResponse);
  }

  return res.json({
    success: true,
    data: candidate,
    timestamp: Date.now(),
  } satisfies ApiResponse);
});

export default router;
