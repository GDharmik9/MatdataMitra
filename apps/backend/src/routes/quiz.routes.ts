import { Router, Request, Response } from "express";
import { generateCivicQuiz } from "../services/gemini.service";
import { apiLimiter } from "../middleware/rateLimiter";
import type { ApiResponse } from "@matdata-mitra/shared-types";

const router = Router();

router.get("/generate", apiLimiter, async (req: Request, res: Response) => {
  try {
    const quiz = await generateCivicQuiz();

    return res.json({
      success: true,
      data: quiz,
      message: "Civic quiz generated successfully.",
      timestamp: Date.now(),
    } satisfies ApiResponse<any>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Quiz generation failed.";
    console.error("Quiz route error:", message);

    return res.status(500).json({
      success: false,
      error: message,
      timestamp: Date.now(),
    } satisfies ApiResponse);
  }
});

export default router;
