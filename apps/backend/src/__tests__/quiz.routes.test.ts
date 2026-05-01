import express from "express";
import quizRoutes from "../routes/quiz.routes";

// Mock the Gemini service
jest.mock("@google/genai", () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: jest.fn().mockResolvedValue({
            text: JSON.stringify([
              {
                question: "Mock Question",
                options: ["A", "B", "C", "D"],
                correctIndex: 1,
                explanation: "Mock explanation"
              }
            ])
          })
        }
      };
    })
  };
});

describe("Civic Quiz API (/api/quiz/generate)", () => {
  const app = express();
  app.use(express.json());
  app.use("/api/quiz", quizRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate a quiz successfully", async () => {
    const request = require("supertest");
    const res = await request(app).get("/api/quiz/generate");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].question).toBe("Mock Question");
    expect(res.body.data[0].options.length).toBe(4);
    expect(res.body.data[0].correctIndex).toBe(1);
  });
});
