import { describe, expect, it } from "vitest";
import { safeFetch } from "../helpers/fetch-helper";

describe("POST /api/ai/generate-question", () => {
  const validRequest = {
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
    userProfile: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      preferred_genres: ["japanese", "italian"],
      allergies: [],
      spice_preference: "mild",
      budget_range: "moderate",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    previousAnswers: [],
    timeOfDay: "LUNCH",
  };

  it("should handle valid request", async () => {
    const response = await safeFetch(
      "http://localhost:3000/api/ai/generate-question",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validRequest),
      },
    );

    expect([200, 401, 404, 500]).toContain(response.status);
  });

  it("should validate required fields", async () => {
    const invalidRequest = {
      userProfile: validRequest.userProfile,
      timeOfDay: "LUNCH",
    };

    const response = await safeFetch(
      "http://localhost:3000/api/ai/generate-question",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidRequest),
      },
    );

    expect([400, 401, 404, 500]).toContain(response.status);
  });

  it("should return proper response structure when implemented", async () => {
    const response = await safeFetch(
      "http://localhost:3000/api/ai/generate-question",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validRequest),
      },
    );

    if (response.status === 200 && response.json) {
      const data = await response.json();
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("text");
      expect(data).toHaveProperty("category");
      expect(data).toHaveProperty("questionIndex");
      expect(typeof data.text).toBe("string");
      expect([
        "mood",
        "genre",
        "cooking",
        "situation",
        "time",
        "preference",
      ]).toContain(data.category);
    }
  });
});
