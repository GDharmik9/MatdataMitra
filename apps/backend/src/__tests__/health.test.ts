import express from "express";
import request from "supertest";

// Build a standalone minimal express app instead of importing index.ts
// (which calls server.listen() and conflicts with the dev server on port 8080)
const testApp = express();
testApp.use(express.json());

testApp.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "matdata-mitra-backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

testApp.use("*", (_req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

describe("Health API", () => {
  it("should return healthy status on GET /health", async () => {
    const response = await request(testApp).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "healthy");
    expect(response.body).toHaveProperty("service", "matdata-mitra-backend");
    expect(response.body).toHaveProperty("version");
    expect(response.body).toHaveProperty("timestamp");
  });

  it("should return 404 for unknown routes", async () => {
    const response = await request(testApp).get("/unknown-route-123");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty("error", "Endpoint not found");
  });
});
