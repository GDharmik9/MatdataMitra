import express from "express";
import candidateRoutes from "../routes/candidate.routes";

jest.mock("@google/genai", () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: JSON.stringify({
              candidateName: "John Doe",
              party: "Independent",
              constituency: "Mock City",
              criminalCases: { count: 0, summary: "None" },
              totalAssets: "Rs. 1,00,000",
              totalLiabilities: "Rs. 0",
              education: "B.Tech"
            })
          })
        }
      };
    })
  };
});

describe("Candidate API (/api/candidates)", () => {
  const app = express();
  // Using 50mb limit for tests as we send base64 pdfs
  app.use(express.json({ limit: "50mb" }));
  app.use("/api/candidates", candidateRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return constituencies when no query is provided", async () => {
    const request = require("supertest");
    const res = await request(app).get("/api/candidates");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.constituencies).toBeDefined();
  });

  it("should analyze candidate affidavit successfully", async () => {
    const request = require("supertest");
    const res = await request(app)
      .post("/api/candidates/analyze-affidavit")
      .send({
        base64Data: "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9Q",
        mimeType: "application/pdf"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.candidateName).toBe("John Doe");
    expect(res.body.data.party).toBe("Independent");
  });

  it("should return 400 if mimeType is not application/pdf", async () => {
    const request = require("supertest");
    const res = await request(app)
      .post("/api/candidates/analyze-affidavit")
      .send({
        base64Data: "mock-base-64",
        mimeType: "image/png"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Only PDF files are supported for affidavit analysis");
  });
});
