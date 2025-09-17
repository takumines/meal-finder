import type {
  Answer,
  CreateAnswerRequest,
  CreateQuestionSessionRequest,
  Location,
  MealHistory,
  MealRecommendation,
  QuestionSession,
  UserProfile,
  UserProfileUpdate,
} from "../../types/database";
import { supabase } from "./client";

export interface DatabaseError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export interface QueryResult<T> {
  data: T | null;
  error: DatabaseError | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  error: DatabaseError | null;
}

export class DatabaseManager {
  // User Profile operations
  async createUserProfile(
    userId: string,
    profile: Partial<UserProfile>,
  ): Promise<QueryResult<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          id: userId,
          preferred_genres: profile.preferred_genres || [],
          allergies: profile.allergies || [],
          spice_preference: profile.spice_preference || "MILD",
          budget_range: profile.budget_range || "MEDIUM",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: data as UserProfile, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: "Failed to create user profile", details: error },
      };
    }
  }

  async getUserProfile(userId: string): Promise<QueryResult<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: data as UserProfile, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: "Failed to fetch user profile", details: error },
      };
    }
  }

  async updateUserProfile(
    userId: string,
    updates: UserProfileUpdate,
  ): Promise<QueryResult<UserProfile>> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: data as UserProfile, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: "Failed to update user profile", details: error },
      };
    }
  }

  async deleteUserProfile(userId: string): Promise<QueryResult<boolean>> {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("id", userId);

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: true, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: "Failed to delete user profile", details: error },
      };
    }
  }

  // Question Session operations
  async createQuestionSession(
    userId: string,
    request: CreateQuestionSessionRequest,
  ): Promise<QueryResult<QuestionSession>> {
    try {
      const sessionData = {
        id: crypto.randomUUID(),
        user_id: userId,
        time_of_day: request.timeOfDay,
        location: request.location ? JSON.stringify(request.location) : null,
        status: "ACTIVE" as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("question_sessions")
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: data as QuestionSession, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: "Failed to create question session", details: error },
      };
    }
  }

  async getQuestionSession(
    sessionId: string,
  ): Promise<QueryResult<QuestionSession>> {
    try {
      const { data, error } = await supabase
        .from("question_sessions")
        .select(`
          *,
          answers(*),
          meal_recommendation(*)
        `)
        .eq("id", sessionId)
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: data as QuestionSession, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: "Failed to fetch question session", details: error },
      };
    }
  }

  async getUserQuestionSessions(
    userId: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<QuestionSession>> {
    try {
      const {
        page = 1,
        limit = 20,
        orderBy = "created_at",
        orderDirection = "desc",
      } = options;
      const offset = (page - 1) * limit;

      // データを取得
      const { data, error } = await supabase
        .from("question_sessions")
        .select(`
          *,
          answers(count),
          meal_recommendation(id, name, cuisine_genre)
        `)
        .eq("user_id", userId)
        .order(orderBy, { ascending: orderDirection === "asc" })
        .range(offset, offset + limit - 1);

      if (error) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          hasNext: false,
          hasPrev: false,
          error: { message: error.message, code: error.code },
        };
      }

      // 総数を取得
      const { count } = await supabase
        .from("question_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const total = count || 0;
      const hasNext = offset + limit < total;
      const hasPrev = page > 1;

      return {
        data: data as QuestionSession[],
        total,
        page,
        limit,
        hasNext,
        hasPrev,
        error: null,
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 20,
        hasNext: false,
        hasPrev: false,
        error: {
          message: "Failed to fetch user question sessions",
          details: error,
        },
      };
    }
  }

  async updateQuestionSessionStatus(
    sessionId: string,
    status: "ACTIVE" | "COMPLETED" | "ABANDONED",
  ): Promise<QueryResult<QuestionSession>> {
    try {
      const { data, error } = await supabase
        .from("question_sessions")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: data as QuestionSession, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: "Failed to update question session status",
          details: error,
        },
      };
    }
  }

  // Answer operations
  async createAnswer(
    request: CreateAnswerRequest & { sessionId: string },
  ): Promise<QueryResult<Answer>> {
    try {
      const answerData = {
        id: crypto.randomUUID(),
        session_id: request.sessionId,
        question_id: request.questionId,
        response: request.response,
        response_time: request.responseTime,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("answers")
        .insert(answerData)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: data as Answer, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: "Failed to create answer", details: error },
      };
    }
  }

  async getSessionAnswers(sessionId: string): Promise<QueryResult<Answer[]>> {
    try {
      const { data, error } = await supabase
        .from("answers")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: data as Answer[], error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: "Failed to fetch session answers", details: error },
      };
    }
  }

  // Meal Recommendation operations
  async createMealRecommendation(
    sessionId: string,
    recommendation: Omit<
      MealRecommendation,
      "id" | "session_id" | "created_at"
    >,
  ): Promise<QueryResult<MealRecommendation>> {
    try {
      const recommendationData = {
        id: crypto.randomUUID(),
        session_id: sessionId,
        ...recommendation,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("meal_recommendations")
        .insert(recommendationData)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: data as MealRecommendation, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: "Failed to create meal recommendation",
          details: error,
        },
      };
    }
  }

  async getMealRecommendation(
    recommendationId: string,
  ): Promise<QueryResult<MealRecommendation>> {
    try {
      const { data, error } = await supabase
        .from("meal_recommendations")
        .select("*")
        .eq("id", recommendationId)
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: data as MealRecommendation, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: "Failed to fetch meal recommendation",
          details: error,
        },
      };
    }
  }

  async updateRecommendationReaction(
    recommendationId: string,
    reaction: "liked" | "disliked" | "saved",
  ): Promise<QueryResult<MealRecommendation>> {
    try {
      const { data, error } = await supabase
        .from("meal_recommendations")
        .update({ user_reaction: reaction })
        .eq("id", recommendationId)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: data as MealRecommendation, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          message: "Failed to update recommendation reaction",
          details: error,
        },
      };
    }
  }

  // Meal History operations
  async createMealHistory(
    userId: string,
    sessionId: string,
    recommendationId: string,
    reaction: "liked" | "disliked" | "saved",
    notes?: string,
  ): Promise<QueryResult<MealHistory>> {
    try {
      const historyData = {
        id: crypto.randomUUID(),
        user_id: userId,
        session_id: sessionId,
        recommendation_id: recommendationId,
        reaction,
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("meal_history")
        .insert(historyData)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }

      return { data: data as MealHistory, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: "Failed to create meal history", details: error },
      };
    }
  }

  async getUserMealHistory(
    userId: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<MealHistory>> {
    try {
      const {
        page = 1,
        limit = 20,
        orderBy = "created_at",
        orderDirection = "desc",
      } = options;
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from("meal_history")
        .select(`
          *,
          meal_recommendation(*),
          question_session(id, time_of_day, created_at)
        `)
        .eq("user_id", userId)
        .order(orderBy, { ascending: orderDirection === "asc" })
        .range(offset, offset + limit - 1);

      if (error) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          hasNext: false,
          hasPrev: false,
          error: { message: error.message, code: error.code },
        };
      }

      const { count } = await supabase
        .from("meal_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      const total = count || 0;
      const hasNext = offset + limit < total;
      const hasPrev = page > 1;

      return {
        data: data as MealHistory[],
        total,
        page,
        limit,
        hasNext,
        hasPrev,
        error: null,
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 20,
        hasNext: false,
        hasPrev: false,
        error: { message: "Failed to fetch user meal history", details: error },
      };
    }
  }

  // Utility methods
  async checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .select("id")
        .limit(1)
        .single();

      return !error || error.code === "PGRST116"; // PGRST116 = no rows returned, but connection is OK
    } catch (error) {
      console.error("Database connection check failed:", error);
      return false;
    }
  }

  async executeTransaction<T>(
    operations: (() => Promise<any>)[],
  ): Promise<QueryResult<T[]>> {
    try {
      // Supabaseには組み込みのトランザクション機能がないため、
      // 個別の操作を順次実行し、エラーが発生した場合は手動でロールバックする
      const results: T[] = [];
      const rollbackOperations: (() => Promise<void>)[] = [];

      for (const operation of operations) {
        try {
          const result = await operation();
          results.push(result);
        } catch (error) {
          // ロールバック実行
          for (const rollback of rollbackOperations.reverse()) {
            try {
              await rollback();
            } catch (rollbackError) {
              console.error("Rollback error:", rollbackError);
            }
          }
          throw error;
        }
      }

      return { data: results, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: "Transaction failed", details: error },
      };
    }
  }

  async batchInsert<T>(
    table: string,
    records: any[],
    batchSize: number = 100,
  ): Promise<QueryResult<T[]>> {
    try {
      const results: T[] = [];

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        const { data, error } = await supabase
          .from(table)
          .insert(batch)
          .select();

        if (error) {
          return {
            data: null,
            error: { message: error.message, code: error.code },
          };
        }

        results.push(...(data as T[]));
      }

      return { data: results, error: null };
    } catch (error) {
      return {
        data: null,
        error: { message: "Batch insert failed", details: error },
      };
    }
  }

  async getTableStats(table: string): Promise<
    QueryResult<{
      count: number;
      firstRecord: Date | null;
      lastRecord: Date | null;
    }>
  > {
    try {
      const { count } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      let firstRecord: Date | null = null;
      let lastRecord: Date | null = null;

      if (count && count > 0) {
        const { data: first } = await supabase
          .from(table)
          .select("created_at")
          .order("created_at", { ascending: true })
          .limit(1)
          .single();

        const { data: last } = await supabase
          .from(table)
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        firstRecord = first?.created_at ? new Date(first.created_at) : null;
        lastRecord = last?.created_at ? new Date(last.created_at) : null;
      }

      return {
        data: {
          count: count || 0,
          firstRecord,
          lastRecord,
        },
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: { message: "Failed to fetch table stats", details: error },
      };
    }
  }

  // Search and filtering
  async searchMealRecommendations(
    query: string,
    filters: {
      userId?: string;
      cuisineGenres?: string[];
      spiceLevels?: string[];
      priceRange?: { min: number; max: number };
    } = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<MealRecommendation>> {
    try {
      const { page = 1, limit = 20 } = options;
      const offset = (page - 1) * limit;

      let queryBuilder = supabase
        .from("meal_recommendations")
        .select(`
          *,
          question_session!inner(user_id)
        `)
        .ilike("name", `%${query}%`)
        .order("created_at", { ascending: false });

      // フィルターの適用
      if (filters.userId) {
        queryBuilder = queryBuilder.eq(
          "question_session.user_id",
          filters.userId,
        );
      }

      if (filters.cuisineGenres && filters.cuisineGenres.length > 0) {
        queryBuilder = queryBuilder.in("cuisine_genre", filters.cuisineGenres);
      }

      if (filters.spiceLevels && filters.spiceLevels.length > 0) {
        queryBuilder = queryBuilder.in("spice_level", filters.spiceLevels);
      }

      if (filters.priceRange) {
        queryBuilder = queryBuilder
          .gte("estimated_price", filters.priceRange.min)
          .lte("estimated_price", filters.priceRange.max);
      }

      const { data, error } = await queryBuilder.range(
        offset,
        offset + limit - 1,
      );

      if (error) {
        return {
          data: [],
          total: 0,
          page,
          limit,
          hasNext: false,
          hasPrev: false,
          error: { message: error.message, code: error.code },
        };
      }

      // 総数の取得（同じフィルターで）
      let countQuery = supabase
        .from("meal_recommendations")
        .select("*", { count: "exact", head: true })
        .ilike("name", `%${query}%`);

      if (filters.cuisineGenres && filters.cuisineGenres.length > 0) {
        countQuery = countQuery.in("cuisine_genre", filters.cuisineGenres);
      }

      const { count } = await countQuery;

      const total = count || 0;
      const hasNext = offset + limit < total;
      const hasPrev = page > 1;

      return {
        data: data as MealRecommendation[],
        total,
        page,
        limit,
        hasNext,
        hasPrev,
        error: null,
      };
    } catch (error) {
      return {
        data: [],
        total: 0,
        page: options.page || 1,
        limit: options.limit || 20,
        hasNext: false,
        hasPrev: false,
        error: {
          message: "Failed to search meal recommendations",
          details: error,
        },
      };
    }
  }
}

export const databaseManager = new DatabaseManager();
