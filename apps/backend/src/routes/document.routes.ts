import { Router, Request, Response } from "express";
import { verifyDocumentImage } from "../services/gemini.service";
import { apiLimiter } from "../middleware/rateLimiter";
import type { ApiResponse } from "@matdata-mitra/shared-types";

const router = Router();

router.post("/verify", apiLimiter, async (req: Request, res: Response) => {
  try {
    const { base64Image, mimeType } = req.body;

    if (!base64Image || !mimeType) {
      return res.status(400).json({
        success: false,
        error: "base64Image and mimeType are required",
        timestamp: Date.now(),
      } satisfies ApiResponse);
    }

    // Clean up base64 prefix if present (e.g. data:image/jpeg;base64,...)
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const result = await verifyDocumentImage(base64Data, mimeType);

    return res.json({
      success: true,
      data: result,
      message: "Document verified successfully",
      timestamp: Date.now(),
    } satisfies ApiResponse<any>);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Document verification failed";
    console.error("Document verify route error:", message);

    return res.status(500).json({
      success: false,
      error: message,
      timestamp: Date.now(),
    } satisfies ApiResponse);
  }
});

export default router;
