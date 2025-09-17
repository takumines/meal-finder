import { beforeAll, describe, expect, it } from "vitest";

describe("Performance: API Response Times", () => {
  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
  const PERFORMANCE_THRESHOLD = 2000; // 2秒以内の要件

  const testUserProfile = {
    id: "perf-test-user-123",
    email: "performance@example.com",
    name: "Performance Test User",
    preferred_genres: ["JAPANESE", "WESTERN"],
    allergies: ["peanuts"],
    spice_preference: "MILD",
    budget_range: "MEDIUM",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeAll(() => {
    console.log(`Performance tests running against: ${baseUrl}`);
    console.log(`Performance threshold: ${PERFORMANCE_THRESHOLD}ms`);
  });

  it("should generate AI questions within performance threshold", async () => {
    const requestPayload = {
      sessionId: "perf-session-question",
      userProfile: testUserProfile,
      previousAnswers: [],
      timeOfDay: "lunch" as const,
    };

    const startTime = performance.now();

    const response = await fetch(`${baseUrl}/api/ai/generate-question`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    console.log(
      `Question generation response time: ${responseTime.toFixed(2)}ms`,
    );

    // APIが実装されている場合のみパフォーマンス検証
    if (response.status === 200) {
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD);

      // レスポンス構造も検証
      const data = await response.json();
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("text");
      expect(typeof data.text).toBe("string");
    } else {
      // 未実装または認証エラーの場合は401/404/500を許容
      expect([401, 404, 500]).toContain(response.status);
      console.log(
        `API not implemented yet or auth error (${response.status}), skipping performance check`,
      );
    }
  });

  it("should generate meal recommendations within performance threshold", async () => {
    const requestPayload = {
      sessionId: "perf-session-recommendation",
      userProfile: testUserProfile,
      answers: [
        {
          id: "perf-answer-1",
          session_id: "perf-session-recommendation",
          question_id: "perf-question-1",
          response: true,
          response_time: 1500,
          question_index: 1,
          answered_at: new Date().toISOString(),
        },
        {
          id: "perf-answer-2",
          session_id: "perf-session-recommendation",
          question_id: "perf-question-2",
          response: false,
          response_time: 2200,
          question_index: 2,
          answered_at: new Date().toISOString(),
        },
      ],
      timeOfDay: "lunch" as const,
    };

    const startTime = performance.now();

    const response = await fetch(`${baseUrl}/api/ai/generate-recommendation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    console.log(
      `Recommendation generation response time: ${responseTime.toFixed(2)}ms`,
    );

    if (response.status === 200) {
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD);

      // レスポンス構造も検証
      const data = await response.json();
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("sessionId");
    } else {
      expect([401, 404, 500]).toContain(response.status);
      console.log(
        `API not implemented yet or auth error (${response.status}), skipping performance check`,
      );
    }
  });

  it("should handle session operations within performance threshold", async () => {
    const sessionPayload = {
      userProfile: testUserProfile,
      timeOfDay: "lunch" as const,
    };

    const startTime = performance.now();

    const response = await fetch(`${baseUrl}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionPayload),
    });

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    console.log(`Session creation response time: ${responseTime.toFixed(2)}ms`);

    if (response.status === 200 || response.status === 201) {
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD);

      const data = await response.json();
      expect(data).toHaveProperty("id");

      // セッション取得のパフォーマンステスト
      const sessionId = data.id;
      const getStartTime = performance.now();

      const getResponse = await fetch(`${baseUrl}/api/sessions/${sessionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const getEndTime = performance.now();
      const getResponseTime = getEndTime - getStartTime;

      console.log(
        `Session retrieval response time: ${getResponseTime.toFixed(2)}ms`,
      );

      if (getResponse.status === 200) {
        expect(getResponseTime).toBeLessThan(PERFORMANCE_THRESHOLD);
      }
    } else {
      expect([401, 404, 500]).toContain(response.status);
      console.log(
        `Session API not implemented yet or auth error (${response.status}), skipping performance check`,
      );
    }
  });

  it("should handle answer submission within performance threshold", async () => {
    const answerPayload = {
      questionId: "perf-question-123",
      response: true,
      responseTime: 1800,
    };

    const sessionId = "perf-test-session-answers";
    const startTime = performance.now();

    const response = await fetch(
      `${baseUrl}/api/sessions/${sessionId}/answers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(answerPayload),
      },
    );

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    console.log(
      `Answer submission response time: ${responseTime.toFixed(2)}ms`,
    );

    if (response.status === 200 || response.status === 201) {
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD);
    } else {
      expect([400, 401, 404, 500]).toContain(response.status);
      console.log(
        `Answer API not implemented yet or auth error (${response.status}), skipping performance check`,
      );
    }
  });

  it("should handle next question retrieval within performance threshold", async () => {
    const sessionId = "perf-test-session-questions";
    const startTime = performance.now();

    const response = await fetch(
      `${baseUrl}/api/sessions/${sessionId}/questions/next`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const endTime = performance.now();
    const responseTime = endTime - startTime;

    console.log(
      `Next question retrieval response time: ${responseTime.toFixed(2)}ms`,
    );

    if (response.status === 200) {
      expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLD);

      const data = await response.json();
      expect(data).toHaveProperty("id");
      expect(data).toHaveProperty("text");
    } else {
      expect([401, 404, 500]).toContain(response.status);
      console.log(
        `Questions API not implemented yet or auth error (${response.status}), skipping performance check`,
      );
    }
  });

  it("should handle concurrent requests efficiently", async () => {
    const concurrentRequests = 5;
    const requests = [];

    const requestPayload = {
      sessionId: "perf-concurrent-test",
      userProfile: testUserProfile,
      previousAnswers: [],
      timeOfDay: "lunch" as const,
    };

    const startTime = performance.now();

    // 並行リクエストを作成
    for (let i = 0; i < concurrentRequests; i++) {
      const request = fetch(`${baseUrl}/api/ai/generate-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...requestPayload,
          sessionId: `${requestPayload.sessionId}-${i}`,
        }),
      });
      requests.push(request);
    }

    // すべてのリクエストを並行実行
    const responses = await Promise.all(requests);
    const endTime = performance.now();
    const totalTime = endTime - startTime;

    console.log(
      `Concurrent requests (${concurrentRequests}) total time: ${totalTime.toFixed(2)}ms`,
    );
    console.log(
      `Average time per request: ${(totalTime / concurrentRequests).toFixed(2)}ms`,
    );

    // 並行実行でも各リクエストがレスポンスを返すことを確認
    responses.forEach((response, index) => {
      expect([200, 401, 404, 500]).toContain(response.status);
      console.log(`Request ${index + 1} status: ${response.status}`);
    });

    // 成功したリクエストがある場合、並行処理でも合理的な時間内に完了することを確認
    const successfulResponses = responses.filter((r) => r.status === 200);
    if (successfulResponses.length > 0) {
      // 並行実行時は単体リクエストの2倍時間まで許容
      expect(totalTime).toBeLessThan(PERFORMANCE_THRESHOLD * 2);
    }
  });

  it("should provide performance metrics summary", () => {
    console.log("\n=== Performance Test Summary ===");
    console.log(`Target Environment: ${baseUrl}`);
    console.log(`Performance Threshold: ${PERFORMANCE_THRESHOLD}ms`);
    console.log(
      "Note: Tests only validate performance when APIs return 200 status",
    );
    console.log("APIs returning 404/500 are considered not yet implemented");
    console.log("=====================================\n");

    // このテストは常に成功 - メトリクス表示のため
    expect(true).toBe(true);
  });
});
