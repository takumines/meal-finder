import { describe, expect, it } from "vitest";

describe("Question Service Functions - Simple Tests", () => {
  it("should handle basic categorization", async () => {
    // モジュールを動的インポート
    const { categorizeQuestion } = await import(
      "../../features/questions/services/question-service"
    );

    const result = categorizeQuestion("今日は疲れていますか？");
    expect(["MOOD", "PREFERENCE", "DIETARY", "LOCATION"]).toContain(result);
  });

  it("should handle system questions", async () => {
    const { getNextSystemQuestion, systemQuestions } = await import(
      "../../features/questions/services/question-service"
    );

    const result = getNextSystemQuestion([]);

    expect(result).toBeDefined();
    expect(result?.isSystemQuestion).toBe(true);
    expect(result?.questionIndex).toBe(1);
  });

  it("should create fallback questions", async () => {
    const { createFallbackQuestion } = await import(
      "../../features/questions/services/question-service"
    );

    const result = createFallbackQuestion(6);

    expect(result).toBeDefined();
    expect(result.isSystemQuestion).toBe(false);
    expect(result.category).toBe("PREFERENCE");
    expect(result.questionIndex).toBe(7); // answerCount + 1
    expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it("should validate question structure", async () => {
    const { createFallbackQuestion } = await import(
      "../../features/questions/services/question-service"
    );

    const result = createFallbackQuestion(1);

    // 必須フィールドの検証
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("string");
    expect(result.text).toBeDefined();
    expect(typeof result.text).toBe("string");
    expect(result.text.length).toBeGreaterThan(0);
    expect(result.questionIndex).toBeDefined();
    expect(typeof result.questionIndex).toBe("number");
    expect(typeof result.isSystemQuestion).toBe("boolean");
    expect(result.category).toBeDefined();
    expect(result.priority).toBeDefined();
    expect(typeof result.priority).toBe("number");
  });
});
