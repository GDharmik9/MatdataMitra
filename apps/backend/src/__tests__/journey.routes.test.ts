import express from "express";
import journeyRoutes from "../routes/journey.routes";

// Mock the Gemini service
jest.mock("@google/genai", () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: JSON.stringify([
              {
                title: "Mock Step",
                description: "Mock description",
                link: "https://mock.com"
              }
            ])
          })
        }
      };
    })
  };
});

describe("Voter Journey API (/api/journey/generate)", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/journey", journeyRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Since we are not using supertest directly here to avoid node environment issues in some setups,
  // we can mock req and res or use supertest if we import it. Let's use supertest locally inside the test block.
  it("should generate a checklist successfully", async () => {
    // We will use standard express mock since supertest was flaky in the monorepo setup earlier without it being explicit.
    // Actually we can just test the route logic directly or use supertest.
    const request = require("supertest");
    const res = await request(app)
      .post("/api/journey/generate")
      .send({
        situation: "I just moved to a new city"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].title).toBe("Mock Step");
  });

  it("should return 400 if situation is missing", async () => {
    const request = require("supertest");
    const res = await request(app)
      .post("/api/journey/generate")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
