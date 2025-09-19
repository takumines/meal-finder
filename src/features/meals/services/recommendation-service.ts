import { openai } from "@/lib/openai";
import type {
  Answer,
  BudgetRange,
  CuisineGenre,
  MealSource,
  SpiceLevel,
  TimeSlot,
  UserProfile,
} from "@/types";

// Types
export interface RecommendationRequest {
  userProfile: UserProfile;
  answers: Answer[];
  timeOfDay: TimeSlot;
  location?: {
    latitude: number;
    longitude: number;
    prefecture?: string;
    city?: string;
  };
  sessionId: string;
}

export interface GeneratedMealRecommendation {
  name: string;
  description: string;
  cuisine_genre: CuisineGenre;
  spice_level: SpiceLevel;
  estimated_price: number;
  cooking_time_minutes: number;
  ingredients: string[];
  instructions: string[];
  meal_source: MealSource;
  confidence_score: number;
  reasoning: string;
}

export interface NutritionalScore {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  estimated_calories: number;
}

export interface RecommendationFitEvaluation {
  fit_score: number;
  reasons: string[];
  improvements: string[];
}

// Constants
const BUDGET_RANGES = {
  BUDGET: { min: 0, max: 500 },
  MODERATE: { min: 500, max: 1000 },
  PREMIUM: { min: 1000, max: 2000 },
  LUXURY: { min: 2000, max: 10000 },
} as const;

const BASE_CALORIES: Record<CuisineGenre, number> = {
  JAPANESE: 400,
  CHINESE: 550,
  KOREAN: 500,
  ITALIAN: 650,
  FRENCH: 700,
  AMERICAN: 600,
  INDIAN: 500,
  THAI: 450,
  MEXICAN: 550,
  OTHER: 500,
} as const;

const FALLBACK_OPTIONS: Record<
  TimeSlot,
  {
    name: string;
    description: string;
    cuisine_genre: CuisineGenre;
    cooking_time_minutes: number;
    ingredients: string[];
    instructions: string[];
  }
> = {
  BREAKFAST: {
    name: "和風朝食セット",
    description: "ご飯、味噌汁、焼き魚の定番朝食",
    cuisine_genre: "JAPANESE",
    cooking_time_minutes: 20,
    ingredients: ["ご飯", "味噌", "魚", "野菜"],
    instructions: ["ご飯を炊く", "味噌汁を作る", "魚を焼く"],
  },
  LUNCH: {
    name: "カレーライス",
    description: "野菜たっぷりのカレーライス",
    cuisine_genre: "AMERICAN",
    cooking_time_minutes: 40,
    ingredients: ["ご飯", "カレールー", "玉ねぎ", "にんじん", "じゃがいも"],
    instructions: ["野菜を切る", "炒める", "煮込む", "ご飯にかける"],
  },
  DINNER: {
    name: "焼き魚定食",
    description: "魚の塩焼きと小鉢の定食",
    cuisine_genre: "JAPANESE",
    cooking_time_minutes: 25,
    ingredients: ["魚", "ご飯", "野菜", "味噌"],
    instructions: ["魚を焼く", "ご飯を炊く", "味噌汁を作る"],
  },
  SNACK: {
    name: "フルーツサラダ",
    description: "季節のフルーツを使ったサラダ",
    cuisine_genre: "OTHER",
    cooking_time_minutes: 10,
    ingredients: ["季節のフルーツ", "ヨーグルト", "ナッツ"],
    instructions: [
      "フルーツを切る",
      "ヨーグルトと混ぜる",
      "ナッツをトッピング",
    ],
  },
} as const;

// Validation functions
export const validateCuisineGenre = (genre: string): CuisineGenre => {
  const validGenres: CuisineGenre[] = [
    "JAPANESE",
    "CHINESE",
    "KOREAN",
    "ITALIAN",
    "FRENCH",
    "AMERICAN",
    "INDIAN",
    "THAI",
    "MEXICAN",
    "OTHER",
  ];
  return validGenres.includes(genre as CuisineGenre)
    ? (genre as CuisineGenre)
    : "OTHER";
};

export const validateSpiceLevel = (
  level: string,
  userProfile: UserProfile,
): SpiceLevel => {
  const validLevels: SpiceLevel[] = [
    "NONE",
    "MILD",
    "MEDIUM",
    "HOT",
    "VERY_HOT",
  ];
  if (validLevels.includes(level as SpiceLevel)) {
    return level as SpiceLevel;
  }
  return userProfile.spice_preference;
};

export const validatePrice = (
  price: number,
  budgetRange: BudgetRange,
): number => {
  const range = BUDGET_RANGES[budgetRange];
  return Math.max(range.min, Math.min(price || range.max / 2, range.max));
};

export const validateMealSource = (source: string): MealSource => {
  const validSources: MealSource[] = ["RECOMMENDATION", "MANUAL_ENTRY"];
  return validSources.includes(source as MealSource)
    ? (source as MealSource)
    : "RECOMMENDATION";
};

// Core validation function
export const validateRecommendation = (
  recommendation: GeneratedMealRecommendation,
  request: RecommendationRequest,
): GeneratedMealRecommendation => {
  return {
    name: recommendation.name || "おすすめ料理",
    description: recommendation.description || "美味しい料理です",
    cuisine_genre: validateCuisineGenre(recommendation.cuisine_genre),
    spice_level: validateSpiceLevel(
      recommendation.spice_level,
      request.userProfile,
    ),
    estimated_price: validatePrice(
      recommendation.estimated_price,
      request.userProfile.budget_range,
    ),
    cooking_time_minutes: Math.max(
      5,
      Math.min(recommendation.cooking_time_minutes || 30, 180),
    ),
    ingredients: Array.isArray(recommendation.ingredients)
      ? recommendation.ingredients
      : [],
    instructions: Array.isArray(recommendation.instructions)
      ? recommendation.instructions
      : [],
    meal_source: validateMealSource(recommendation.meal_source),
    confidence_score: Math.max(
      0.1,
      Math.min(recommendation.confidence_score || 0.5, 1.0),
    ),
    reasoning:
      recommendation.reasoning || "ユーザーの好みに基づいて選択しました",
  };
};

// Prompt building function
export const buildRecommendationPrompt = (
  request: RecommendationRequest,
): string => {
  const { userProfile, answers, timeOfDay, location } = request;

  let prompt = `食事推薦を生成してください。

ユーザー情報:
- 好みのジャンル: ${userProfile.preferred_genres.join(", ")}
- アレルギー: ${userProfile.allergies.join(", ") || "なし"}
- 辛さの好み: ${userProfile.spice_preference}
- 予算: ${userProfile.budget_range}

時間帯: ${timeOfDay}`;

  if (location) {
    prompt += `\n場所: ${location.prefecture || ""}${location.city || ""}`;
  }

  if (answers.length > 0) {
    prompt += `\n\n質問への回答:`;
    answers.forEach((answer, index) => {
      prompt += `\n${index + 1}. 質問ID: ${answer.question_id}, 回答: ${answer.response ? "はい" : "いいえ"}`;
    });
  }

  prompt += `\n\n上記の情報に基づいて、最適な食事を1つ推薦してください。料理は具体的で実現可能なものにしてください。`;

  return prompt;
};

// AI recommendation generation
export const generateAIRecommendation = async (
  request: RecommendationRequest,
): Promise<GeneratedMealRecommendation> => {
  const prompt = buildRecommendationPrompt(request);

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `あなたは日本の食事推薦エキスパートです。ユーザーの回答に基づいて最適な食事を推薦してください。
        
回答は以下のJSON形式で返してください:
{
  "name": "料理名",
  "description": "料理の説明（50文字以内）",
  "cuisine_genre": "JAPANESE|WESTERN|CHINESE|KOREAN|ITALIAN|FRENCH|OTHER",
  "spice_level": "NONE|MILD|MEDIUM|HOT|VERY_HOT",
  "estimated_price": 価格（円）,
  "cooking_time_minutes": 調理時間（分）,
  "ingredients": ["材料1", "材料2", ...],
  "instructions": ["手順1", "手順2", ...],
  "meal_source": "HOME_COOKING|RESTAURANT|DELIVERY|CONVENIENCE_STORE",
  "confidence_score": 0.8,
  "reasoning": "推薦理由"
}`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const responseContent = response.choices[0]?.message?.content?.trim();
  if (!responseContent) {
    throw new Error("Failed to generate AI recommendation");
  }

  try {
    const recommendation = JSON.parse(
      responseContent,
    ) as GeneratedMealRecommendation;
    return validateRecommendation(recommendation, request);
  } catch (parseError) {
    console.error("Failed to parse AI recommendation:", parseError);
    throw new Error("Invalid AI recommendation format");
  }
};

// Fallback recommendation generation
export const generateFallbackRecommendation = (
  request: RecommendationRequest,
): GeneratedMealRecommendation => {
  const { userProfile, timeOfDay } = request;
  const fallback = FALLBACK_OPTIONS[timeOfDay] || FALLBACK_OPTIONS.LUNCH;

  return {
    name: fallback.name,
    description: fallback.description,
    cuisine_genre: fallback.cuisine_genre,
    spice_level: userProfile.spice_preference,
    estimated_price: validatePrice(800, userProfile.budget_range),
    cooking_time_minutes: fallback.cooking_time_minutes,
    ingredients: fallback.ingredients,
    instructions: fallback.instructions,
    meal_source: "RECOMMENDATION",
    confidence_score: 0.6,
    reasoning: "基本的な推薦を提供しました",
  };
};

// Main recommendation generation function
export const generateRecommendation = async (
  request: RecommendationRequest,
): Promise<GeneratedMealRecommendation> => {
  try {
    const aiRecommendation = await generateAIRecommendation(request);
    return aiRecommendation;
  } catch (error) {
    console.error("AI recommendation generation failed:", error);
    // フォールバック: 基本的な推薦
    return generateFallbackRecommendation(request);
  }
};

// Utility functions
export const calculateNutritionalScore = (
  recommendation: GeneratedMealRecommendation,
): NutritionalScore => {
  const calories = BASE_CALORIES[recommendation.cuisine_genre] || 500;

  return {
    protein: Math.round(calories * 0.15), // 15% protein
    carbs: Math.round(calories * 0.55), // 55% carbs
    fat: Math.round(calories * 0.3), // 30% fat
    fiber: Math.round(calories * 0.05), // 5% fiber
    estimated_calories: calories,
  };
};

export const checkBudgetFit = (
  price: number,
  budgetRange: BudgetRange,
): boolean => {
  const ranges = {
    BUDGET: 500,
    MODERATE: 1000,
    PREMIUM: 2000,
    LUXURY: 10000,
  };

  return price <= ranges[budgetRange];
};

export const evaluateRecommendationFit = async (
  recommendation: GeneratedMealRecommendation,
  userProfile: UserProfile,
  _answers: Answer[],
): Promise<RecommendationFitEvaluation> => {
  let score = 0.5;
  const reasons: string[] = [];
  const improvements: string[] = [];

  // ジャンル適合性
  if (userProfile.preferred_genres.includes(recommendation.cuisine_genre)) {
    score += 0.2;
    reasons.push("好みのジャンルに合致");
  } else {
    improvements.push("好みのジャンルを検討");
  }

  // 辛さレベル適合性
  if (recommendation.spice_level === userProfile.spice_preference) {
    score += 0.15;
    reasons.push("辛さレベルが適切");
  }

  // 予算適合性
  const budgetFit = checkBudgetFit(
    recommendation.estimated_price,
    userProfile.budget_range,
  );
  if (budgetFit) {
    score += 0.15;
    reasons.push("予算内に収まっている");
  } else {
    improvements.push("予算を見直す");
  }

  return {
    fit_score: Math.min(1.0, score),
    reasons,
    improvements,
  };
};

// Service object for convenience
export const recommendationService = {
  generateRecommendation,
  generateAIRecommendation,
  generateFallbackRecommendation,
  calculateNutritionalScore,
  evaluateRecommendationFit,
  validateRecommendation,
} as const;
