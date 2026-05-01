import { Router, Request, Response } from "express";
import { generateJourneyChecklist } from "../services/gemini.service";
import { apiLimiter } from "../middleware/rateLimiter";
import type { ApiResponse } from "@matdata-mitra/shared-types";

const router = Router();

router.post("/generate", apiLimiter, async (req: Request, res: Response) => {
  try {
    const { situation } = req.body;

    if (!situation || typeof situation !== "string" || situation.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "A valid 'situation' string is required.",
        timestamp: Date.now(),
      } satisfies ApiResponse);
    }

    const checklist = await generateJourneyChecklist(situation);

    return res.json({
      success: true,
      data: checklist,
      message: "Personalized journey generated successfully.",
      timestamp: Date.now(),
    } satisfies ApiResponse<any>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Journey generation failed.";
    console.error("Journey route error:", message);

    return res.status(500).json({
      success: false,
      error: message,
      timestamp: Date.now(),
    } satisfies ApiResponse);
  }
});

export default router;
