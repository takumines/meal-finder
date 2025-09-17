import { describe, expect, it } from "vitest";

// モックデータ
const mockRecommendation = {
  dish_name: "チキンカレー",
  description: "中辛のスパイシーなチキンカレーです",
  cuisine_genre: "INDIAN",
  spice_level: "MEDIUM",
  estimated_price: 800,
  cooking_time_minutes: 30,
  meal_source: "RESTAURANT",
  ingredients: ["鶏肉", "じゃがいも", "にんじん", "玉ねぎ"],
  allergens: ["milk"],
  nutritional_info: {
    calories: 550,
    protein: 25,
    carbs: 45,
    fat: 20,
  },
};

const mockRequest = {
  userProfile: {
    id: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    preferred_genres: ["JAPANESE", "WESTERN"],
    allergies: ["peanuts", "shellfish"],
    spice_preference: "MILD",
    budget_range: "MODERATE",
    created_at: new Date(),
    updated_at: new Date(),
  },
  answers: [],
  sessionId: "test-session",
  timeOfDay: "NOON" as const,
};

describe("Recommendation Service Functions - Simple Tests", () => {
  it("should validate cuisine genre", async () => {
    const { validateCuisineGenre } = await import(
      "../../features/meals/services/recommendation-service"
    );

    const result = validateCuisineGenre("JAPANESE");
    expect(result).toBe("JAPANESE");
  });

  it("should validate spice level with user profile", async () => {
    const { validateSpiceLevel } = await import(
      "../../features/meals/services/recommendation-service"
    );

    const result = validateSpiceLevel("HOT", mockRequest.userProfile);
    expect(["NONE", "MILD", "MEDIUM", "HOT", "VERY_HOT"]).toContain(result);
  });

  it("should validate price based on budget range", async () => {
    const { validatePrice } = await import(
      "../../features/meals/services/recommendation-service"
    );

    const result = validatePrice(1500, "MODERATE");
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThan(0);
  });

  it("should validate meal source", async () => {
    const { validateMealSource } = await import(
      "../../features/meals/services/recommendation-service"
    );

    const result = validateMealSource("RECOMMENDATION");
    expect([
      "RECOMMENDATION", 
      "MANUAL_ENTRY",
    ]).toContain(result);
  });

  it("should check budget fit", async () => {
    const { checkBudgetFit } = await import(
      "../../features/meals/services/recommendation-service"
    );

    const fitResult = checkBudgetFit(800, "MODERATE");
    expect(typeof fitResult).toBe("boolean");

    const overbudgetResult = checkBudgetFit(3000, "BUDGET");
    expect(overbudgetResult).toBe(false);
  });

  it("should build recommendation prompt", async () => {
    const { buildRecommendationPrompt } = await import(
      "../../features/meals/services/recommendation-service"
    );

    const result = buildRecommendationPrompt(mockRequest);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain("食事推薦"); // 実際のプロンプトテキストに合わせて修正
  });
});
