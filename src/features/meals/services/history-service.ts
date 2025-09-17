import { supabase } from "../../../lib/supabase/client";
import type {
  MealHistory,
  MealHistoryResponse,
  MealRecommendation,
  QuestionSession,
  UserProfile,
} from "../../../types/database";

// Types
export interface CreateHistoryRequest {
  userId: string;
  sessionId: string;
  recommendationId: string;
  reaction: "liked" | "disliked" | "saved";
  notes?: string;
}

export interface HistoryFilters {
  startDate?: Date;
  endDate?: Date;
  reactions?: Array<"liked" | "disliked" | "saved">;
  cuisineGenres?: string[];
  limit?: number;
  offset?: number;
}

export interface HistoryAnalytics {
  totalMeals: number;
  likedMeals: number;
  dislikedMeals: number;
  savedMeals: number;
  topCuisines: Array<{ genre: string; count: number }>;
  averageRating: number;
  recentTrends: {
    thisWeek: number;
    lastWeek: number;
    change: number;
  };
}

export interface MealPattern {
  preferredTimeSlots: string[];
  favoriteGenres: string[];
  averageBudget: number;
  commonIngredients: string[];
  seasonalPreferences: Record<string, string[]>;
}

export interface ScoredMealHistory extends MealHistory {
  similarity?: number;
}

// Core CRUD functions
export const createHistory = async (
  request: CreateHistoryRequest,
): Promise<MealHistory> => {
  const { userId, sessionId, recommendationId, reaction, notes } = request;

  try {
    const { data, error } = await supabase
      .from("meal_history")
      .insert({
        user_id: userId,
        session_id: sessionId,
        recommendation_id: recommendationId,
        reaction,
        notes: notes || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create meal history: ${error.message}`);
    }

    return data as MealHistory;
  } catch (error) {
    console.error("Error creating meal history:", error);
    throw error;
  }
};

export const getUserHistory = async (
  userId: string,
  filters: HistoryFilters = {},
): Promise<MealHistoryResponse> => {
  const {
    startDate,
    endDate,
    reactions,
    cuisineGenres,
    limit = 20,
    offset = 0,
  } = filters;

  try {
    let query = supabase
      .from("meal_history")
      .select(`
        *,
        meal_recommendation:recommendation_id(
          id,
          name,
          description,
          cuisine_genre,
          spice_level,
          estimated_price,
          cooking_time_minutes,
          ingredients,
          meal_source
        ),
        question_session:session_id(
          id,
          time_of_day,
          created_at
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // 日付フィルター
    if (startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }
    if (endDate) {
      query = query.lte("created_at", endDate.toISOString());
    }

    // リアクションフィルター
    if (reactions && reactions.length > 0) {
      query = query.in("reaction", reactions);
    }

    // ページネーション
    const { data, error } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch user history: ${error.message}`);
    }

    // 総数を取得
    const { count: totalCount } = await supabase
      .from("meal_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    return {
      items: (data || []) as MealHistory[],
      total: totalCount || 0,
      hasMore: offset + limit < (totalCount || 0),
    };
  } catch (error) {
    console.error("Error fetching user history:", error);
    throw error;
  }
};

export const updateHistoryReaction = async (
  historyId: string,
  userId: string,
  reaction: "liked" | "disliked" | "saved",
  notes?: string,
): Promise<MealHistory> => {
  try {
    const { data, error } = await supabase
      .from("meal_history")
      .update({
        reaction,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", historyId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update history reaction: ${error.message}`);
    }

    return data as MealHistory;
  } catch (error) {
    console.error("Error updating history reaction:", error);
    throw error;
  }
};

export const deleteHistory = async (
  historyId: string,
  userId: string,
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("meal_history")
      .delete()
      .eq("id", historyId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to delete history: ${error.message}`);
    }
  } catch (error) {
    console.error("Error deleting history:", error);
    throw error;
  }
};

// Analytics functions
export const calculateReactionCounts = (
  history: any[],
): {
  liked: number;
  disliked: number;
  saved: number;
} => {
  return {
    liked: history.filter((h) => h.reaction === "liked").length,
    disliked: history.filter((h) => h.reaction === "disliked").length,
    saved: history.filter((h) => h.reaction === "saved").length,
  };
};

export const calculateTopCuisines = (
  history: any[],
  limit: number = 5,
): Array<{ genre: string; count: number }> => {
  const cuisineCount: Record<string, number> = {};

  history.forEach((h) => {
    if (h.meal_recommendation?.cuisine_genre) {
      const genre = h.meal_recommendation.cuisine_genre;
      cuisineCount[genre] = (cuisineCount[genre] || 0) + 1;
    }
  });

  return Object.entries(cuisineCount)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};

export const calculateAverageRating = (history: any[]): number => {
  if (history.length === 0) return 0;

  const ratingSum = history.reduce((sum, h) => {
    switch (h.reaction) {
      case "liked":
        return sum + 1;
      case "saved":
        return sum + 0.5;
      default:
        return sum;
    }
  }, 0);

  return ratingSum / history.length;
};

export const calculateRecentTrends = (
  history: any[],
): {
  thisWeek: number;
  lastWeek: number;
  change: number;
} => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeek = history.filter(
    (h) => new Date(h.created_at) >= oneWeekAgo,
  ).length;

  const lastWeek = history.filter((h) => {
    const date = new Date(h.created_at);
    return date >= twoWeeksAgo && date < oneWeekAgo;
  }).length;

  const change = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

  return { thisWeek, lastWeek, change };
};

export const getHistoryAnalytics = async (
  userId: string,
): Promise<HistoryAnalytics> => {
  try {
    // 基本統計の取得
    const { data: historyData, error: historyError } = await supabase
      .from("meal_history")
      .select(`
        reaction,
        created_at,
        meal_recommendation:recommendation_id(cuisine_genre)
      `)
      .eq("user_id", userId);

    if (historyError) {
      throw new Error(
        `Failed to fetch history analytics: ${historyError.message}`,
      );
    }

    const history = historyData || [];
    const totalMeals = history.length;

    // 各種統計を計算
    const reactionCounts = calculateReactionCounts(history);
    const topCuisines = calculateTopCuisines(history);
    const averageRating = calculateAverageRating(history);
    const recentTrends = calculateRecentTrends(history);

    return {
      totalMeals,
      likedMeals: reactionCounts.liked,
      dislikedMeals: reactionCounts.disliked,
      savedMeals: reactionCounts.saved,
      topCuisines,
      averageRating,
      recentTrends,
    };
  } catch (error) {
    console.error("Error fetching history analytics:", error);
    throw error;
  }
};

// Pattern analysis functions
export const analyzeTimeSlotPreferences = (likedMeals: any[]): string[] => {
  const timeSlotCount: Record<string, number> = {};

  likedMeals.forEach((meal) => {
    if (meal.question_session?.time_of_day) {
      const timeSlot = meal.question_session.time_of_day;
      timeSlotCount[timeSlot] = (timeSlotCount[timeSlot] || 0) + 1;
    }
  });

  return Object.entries(timeSlotCount)
    .sort(([, a], [, b]) => b - a)
    .map(([timeSlot]) => timeSlot);
};

export const analyzeFavoriteGenres = (likedMeals: any[]): string[] => {
  const genreCount: Record<string, number> = {};

  likedMeals.forEach((meal) => {
    if (meal.meal_recommendation?.cuisine_genre) {
      const genre = meal.meal_recommendation.cuisine_genre;
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    }
  });

  return Object.entries(genreCount)
    .sort(([, a], [, b]) => b - a)
    .map(([genre]) => genre);
};

export const calculateAverageBudget = (likedMeals: any[]): number => {
  const prices = likedMeals
    .map((meal) => meal.meal_recommendation?.estimated_price)
    .filter((price) => typeof price === "number") as number[];

  return prices.length > 0
    ? prices.reduce((sum, price) => sum + price, 0) / prices.length
    : 0;
};

export const analyzeCommonIngredients = (
  likedMeals: any[],
  limit: number = 10,
): string[] => {
  const ingredientCount: Record<string, number> = {};

  likedMeals.forEach((meal) => {
    if (meal.meal_recommendation?.ingredients) {
      meal.meal_recommendation.ingredients.forEach((ingredient: string) => {
        ingredientCount[ingredient] = (ingredientCount[ingredient] || 0) + 1;
      });
    }
  });

  return Object.entries(ingredientCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([ingredient]) => ingredient);
};

export const analyzeSeasonalPreferences = (
  likedMeals: any[],
): Record<string, string[]> => {
  const seasonalPreferences: Record<string, string[]> = {
    spring: [],
    summer: [],
    autumn: [],
    winter: [],
  };

  likedMeals.forEach((meal) => {
    const date = new Date(meal.created_at);
    const month = date.getMonth();
    let season: string;

    if (month >= 2 && month <= 4) season = "spring";
    else if (month >= 5 && month <= 7) season = "summer";
    else if (month >= 8 && month <= 10) season = "autumn";
    else season = "winter";

    if (meal.meal_recommendation?.cuisine_genre) {
      const genre = meal.meal_recommendation.cuisine_genre;
      if (!seasonalPreferences[season].includes(genre)) {
        seasonalPreferences[season].push(genre);
      }
    }
  });

  return seasonalPreferences;
};

export const getMealPatterns = async (userId: string): Promise<MealPattern> => {
  try {
    const { data, error } = await supabase
      .from("meal_history")
      .select(`
        reaction,
        created_at,
        meal_recommendation:recommendation_id(
          cuisine_genre,
          estimated_price,
          ingredients
        ),
        question_session:session_id(
          time_of_day
        )
      `)
      .eq("user_id", userId)
      .eq("reaction", "liked");

    if (error) {
      throw new Error(`Failed to fetch meal patterns: ${error.message}`);
    }

    const likedMeals = data || [];

    return {
      preferredTimeSlots: analyzeTimeSlotPreferences(likedMeals),
      favoriteGenres: analyzeFavoriteGenres(likedMeals),
      averageBudget: calculateAverageBudget(likedMeals),
      commonIngredients: analyzeCommonIngredients(likedMeals),
      seasonalPreferences: analyzeSeasonalPreferences(likedMeals),
    };
  } catch (error) {
    console.error("Error analyzing meal patterns:", error);
    throw error;
  }
};

// Similarity functions
export const calculateSimilarity = (current: any, target: any): number => {
  if (!current || !target) return 0;

  let score = 0;

  // ジャンルの類似度
  if (current.cuisine_genre === target.cuisine_genre) {
    score += 0.4;
  }

  // 辛さレベルの類似度
  if (current.spice_level === target.spice_level) {
    score += 0.3;
  }

  // 価格の類似度
  const priceDiff = Math.abs(current.estimated_price - target.estimated_price);
  const priceScore = Math.max(0, 1 - priceDiff / 1000); // 1000円差で0点
  score += priceScore * 0.3;

  return score;
};

export const getSimilarMeals = async (
  userId: string,
  recommendationId: string,
  limit: number = 5,
): Promise<MealHistory[]> => {
  try {
    // 現在の推薦を取得
    const { data: currentRecommendation, error: currentError } = await supabase
      .from("meal_recommendation")
      .select("cuisine_genre, spice_level, estimated_price")
      .eq("id", recommendationId)
      .single();

    if (currentError) {
      throw new Error(
        `Failed to fetch current recommendation: ${currentError.message}`,
      );
    }

    // 類似の食事履歴を検索
    const { data, error } = await supabase
      .from("meal_history")
      .select(`
        *,
        meal_recommendation:recommendation_id(
          id,
          name,
          description,
          cuisine_genre,
          spice_level,
          estimated_price,
          cooking_time_minutes,
          ingredients,
          meal_source
        )
      `)
      .eq("user_id", userId)
      .eq("reaction", "liked")
      .neq("recommendation_id", recommendationId)
      .limit(limit * 2); // より多く取得してフィルタリング

    if (error) {
      throw new Error(`Failed to fetch similar meals: ${error.message}`);
    }

    const history = data || [];

    // 類似度に基づいてソート
    const scoredHistory = history
      .map((h) => ({
        ...h,
        similarity: calculateSimilarity(
          currentRecommendation,
          h.meal_recommendation,
        ),
      }))
      .filter((h) => h.similarity > 0.3) // 最低限の類似度
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return scoredHistory.map(
      ({ similarity, ...rest }) => rest,
    ) as MealHistory[];
  } catch (error) {
    console.error("Error fetching similar meals:", error);
    throw error;
  }
};

// Export functions
export const convertToCSV = (history: MealHistory[]): string => {
  if (history.length === 0) return "";

  const headers = [
    "日付",
    "料理名",
    "ジャンル",
    "価格",
    "リアクション",
    "メモ",
  ];

  const rows = history.map((h) => [
    new Date(h.created_at).toLocaleDateString("ja-JP"),
    h.meal_name,
    h.cuisine_genre,
    h.source,
    h.satisfaction || "",
    "",
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");
};

export const exportHistory = async (
  userId: string,
  format: "json" | "csv" = "json",
): Promise<string> => {
  try {
    const historyResponse = await getUserHistory(userId, { limit: 1000 });
    const history = historyResponse.items;

    if (format === "csv") {
      return convertToCSV(history);
    }

    return JSON.stringify(history, null, 2);
  } catch (error) {
    console.error("Error exporting history:", error);
    throw error;
  }
};

// Service object for convenience
export const historyService = {
  createHistory,
  getUserHistory,
  updateHistoryReaction,
  deleteHistory,
  getHistoryAnalytics,
  getMealPatterns,
  getSimilarMeals,
  exportHistory,

  // Utility functions
  calculateSimilarity,
  analyzeTimeSlotPreferences,
  analyzeFavoriteGenres,
  calculateAverageBudget,
  analyzeCommonIngredients,
  analyzeSeasonalPreferences,
} as const;
