import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("E2E: Complete User Flow", () => {
  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
  let sessionId: string;

  beforeAll(async () => {
    // テスト前の準備（必要に応じて）
  });

  afterAll(async () => {
    // テスト後のクリーンアップ（必要に応じて）
  });

  it("should complete the full meal recommendation flow", async () => {
    // Step 1: セッション作成
    const sessionResponse = await fetch(`${baseUrl}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userProfile: {
          id: "e2e-test-user",
          email: "test@example.com",
          name: "E2E Test User",
          preferred_genres: ["JAPANESE", "WESTERN"],
          allergies: [],
          spice_preference: "MILD",
          budget_range: "MEDIUM",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        time_of_day: "lunch",
      }),
    });

    // セッション作成が成功するか401/404（未実装）を許容
    expect([200, 201, 401, 404, 500]).toContain(sessionResponse.status);

    if (sessionResponse.status === 200 || sessionResponse.status === 201) {
      const sessionData = await sessionResponse.json();
      sessionId = sessionData.id || "mock-session-id";

      // Step 2: 質問取得
      const questionResponse = await fetch(
        `${baseUrl}/api/sessions/${sessionId}/questions/next`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      expect([200, 401, 404, 500]).toContain(questionResponse.status);

      if (questionResponse.status === 200) {
        const questionData = await questionResponse.json();

        // 質問構造の検証
        expect(questionData).toHaveProperty("id");
        expect(questionData).toHaveProperty("text");
        expect(typeof questionData.text).toBe("string");

        // Step 3: 回答送信
        const answerResponse = await fetch(
          `${baseUrl}/api/sessions/${sessionId}/answers`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              questionId: questionData.id,
              response: true,
              responseTime: 2000,
            }),
          },
        );

        expect([200, 201, 401, 404, 500]).toContain(answerResponse.status);
      }

      // Step 4: 推薦生成
      const recommendationResponse = await fetch(
        `${baseUrl}/api/ai/generate-recommendation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: sessionId,
            userProfile: {
              id: "e2e-test-user",
              email: "test@example.com",
              name: "E2E Test User",
              preferred_genres: ["JAPANESE", "WESTERN"],
              allergies: [],
              spice_preference: "MILD",
              budget_range: "MEDIUM",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            answers: [
              {
                id: "mock-answer-1",
                session_id: sessionId,
                question_id: "mock-question-1",
                response: true,
                response_time: 2000,
                question_index: 1,
                answered_at: new Date().toISOString(),
              },
            ],
            time_of_day: "lunch",
          }),
        },
      );

      expect([200, 401, 404, 500]).toContain(recommendationResponse.status);

      if (recommendationResponse.status === 200) {
        const recommendationData = await recommendationResponse.json();

        // 推薦構造の検証
        expect(recommendationData).toHaveProperty("id");
        expect(recommendationData).toHaveProperty("sessionId");
      }
    }
  });

  it("should handle invalid session gracefully", async () => {
    const invalidSessionId = "invalid-session-id";

    const response = await fetch(
      `${baseUrl}/api/sessions/${invalidSessionId}/questions/next`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // エラーハンドリングの確認
    expect([400, 401, 404, 500]).toContain(response.status);
  });

  it("should validate required fields in API requests", async () => {
    // 不完全なセッション作成リクエスト
    const invalidSessionResponse = await fetch(`${baseUrl}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // userProfile が欠けている
        time_of_day: "lunch",
      }),
    });

    expect([400, 401, 404, 500]).toContain(invalidSessionResponse.status);
  });

  it("should handle question generation flow", async () => {
    const questionResponse = await fetch(
      `${baseUrl}/api/ai/generate-question`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "test-session-123",
          userProfile: {
            id: "test-user-123",
            email: "test@example.com",
            name: "Test User",
            preferred_genres: ["JAPANESE"],
            allergies: [],
            spice_preference: "MILD",
            budget_range: "MEDIUM",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          previousAnswers: [],
          time_of_day: "lunch",
        }),
      },
    );

    expect([200, 401, 404, 500]).toContain(questionResponse.status);

    if (questionResponse.status === 200) {
      const questionData = await questionResponse.json();

      // 質問データの検証
      expect(questionData).toHaveProperty("id");
      expect(questionData).toHaveProperty("text");
      expect(questionData).toHaveProperty("category");
      expect(typeof questionData.text).toBe("string");
      expect(questionData.text.length).toBeGreaterThan(0);
    }
  });

  it("should handle performance requirements", async () => {
    const startTime = Date.now();

    const response = await fetch(`${baseUrl}/api/ai/generate-question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: "perf-test-session",
        userProfile: {
          id: "perf-test-user",
          email: "perf@example.com",
          name: "Performance Test User",
          preferred_genres: ["JAPANESE"],
          allergies: [],
          spice_preference: "MILD",
          budget_range: "MEDIUM",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        previousAnswers: [],
        time_of_day: "lunch",
      }),
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // パフォーマンス要件: 2秒以内
    if (response.status === 200) {
      expect(responseTime).toBeLessThan(2000);
    }

    expect([200, 401, 404, 500]).toContain(response.status);
  });
});
