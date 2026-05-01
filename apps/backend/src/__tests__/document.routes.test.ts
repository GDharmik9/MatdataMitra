import request from "supertest";
import express from "express";
import documentRoutes from "../routes/document.routes";
import { GoogleGenAI } from "@google/genai";

// Mock the Gemini service directly via the @google/genai mock
jest.mock("@google/genai", () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: JSON.stringify({
              isValid: true,
              documentType: "Aadhaar Card",
              confidence: 95,
              feedback: "The document is clearly legible."
            })
          })
        }
      };
    })
  };
});

describe("Document Verifier API (/api/document/verify)", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/document", documentRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should verify a base64 document successfully", async () => {
    const res = await request(app)
      .post("/api/document/verify")
      .send({
        base64Image: "data:image/jpeg;base64,mockbase64data",
        mimeType: "image/jpeg"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isValid).toBe(true);
    expect(res.body.data.documentType).toBe("Aadhaar Card");
  });

  it("should return 400 if base64Image or mimeType is missing", async () => {
    const res = await request(app)
      .post("/api/document/verify")
      .send({
        base64Image: "mockbase64data"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
