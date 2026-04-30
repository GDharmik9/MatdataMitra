import request from "supertest";
import { app } from "../index";

// Mock firebase admin and other dependencies to avoid initialization during tests
jest.mock("firebase-admin", () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  firestore: jest.fn(() => ({})),
}));

jest.mock("../services/rag.service", () => ({
  initializeRAGPipeline: jest.fn(),
}));

jest.mock("../websocket/media-gateway", () => ({
  initializeWebSocket: jest.fn(),
}));

describe("Health API", () => {
  it("should return healthy status on GET /health", async () => {
    const response = await request(app).get("/health");
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "healthy");
    expect(response.body).toHaveProperty("service", "matdata-mitra-backend");
    expect(response.body).toHaveProperty("version");
    expect(response.body).toHaveProperty("timestamp");
  });

  it("should return 404 for unknown routes", async () => {
    const response = await request(app).get("/unknown-route-123");
    
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error", "Endpoint not found");
  });
});
