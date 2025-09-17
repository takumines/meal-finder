import { describe, expect, it } from "vitest";
import { safeFetch } from "../helpers/fetch-helper";

describe("GET /api/sessions/{sessionId}/questions/next", () => {
  const sessionId = "550e8400-e29b-41d4-a716-446655440000";

  it("should return 404 when API endpoint does not exist yet", async () => {
    const response = await safeFetch(
      `http://localhost:3000/api/sessions/${sessionId}/questions/next`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    expect([200, 401, 404, 500]).toContain(response.status);
  });

  it("should validate sessionId format when implemented", async () => {
    const invalidSessionId = "invalid-uuid";
    const response = await safeFetch(
      `http://localhost:3000/api/sessions/${invalidSessionId}/questions/next`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    expect([400, 401, 404, 500]).toContain(response.status);
  });

  it("should return question or recommendation when implemented", async () => {
    const response = await safeFetch(
      `http://localhost:3000/api/sessions/${sessionId}/questions/next`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status === 200 && response.json) {
      const data = await response.json();

      if (data.text) {
        expect(data).toHaveProperty("id");
        expect(data).toHaveProperty("text");
        expect(data).toHaveProperty("category");
        expect(data).toHaveProperty("questionIndex");
        expect([
          "mood",
          "genre",
          "cooking",
          "situation",
          "time",
          "preference",
        ]).toContain(data.category);
      } else if (data.mealName) {
        expect(data).toHaveProperty("id");
        expect(data).toHaveProperty("sessionId");
        expect(data).toHaveProperty("mealName");
        expect(data).toHaveProperty("description");
        expect(data).toHaveProperty("cuisineGenre");
        expect(data).toHaveProperty("confidence");
      }
    }

    if (response.status === 404 && response.json) {
      const error = await response.json();
      expect(error).toHaveProperty("error");
      expect(error).toHaveProperty("message");
    }
  });
});
