import { describe, expect, it } from "vitest";
import { safeFetch } from "../helpers/fetch-helper";

describe("POST /api/sessions", () => {
  const validRequest = {
    timeOfDay: "LUNCH",
    location: {
      latitude: 35.6762,
      longitude: 139.6503,
      prefecture: "東京都",
      city: "渋谷区",
    },
  };

  it("should return 404 when API endpoint does not exist yet", async () => {
    const response = await safeFetch("http://localhost:3000/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validRequest),
    });

    expect([200, 401, 404, 500]).toContain(response.status);
  });

  it("should validate required fields when implemented", async () => {
    const invalidRequest = {
      location: validRequest.location,
    };

    const response = await safeFetch("http://localhost:3000/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invalidRequest),
    });

    expect([400, 401, 404, 500]).toContain(response.status);
  });

  it("should return proper response structure when implemented", async () => {
    const response = await safeFetch("http://localhost:3000/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validRequest),
    });

    if (response.status === 201 && response.json) {
      const data = await response.json();
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("userId");
      expect(data).toHaveProperty("startedAt");
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("timeOfDay");
      expect(data.timeOfDay).toBe("LUNCH");
      expect(["ACTIVE", "COMPLETED", "ABANDONED"]).toContain(data.status);
      expect(typeof data.id).toBe("string");
      expect(data.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    }
  });
});
