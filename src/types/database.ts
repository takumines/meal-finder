import type {
  Answer,
  BudgetRange,
  CuisineGenre,
  MealHistory,
  MealRecommendation,
  MealSource,
  QuestionCategory,
  QuestionSession,
  SessionStatus,
  SpiceLevel,
  TimeSlot,
  UserProfile,
} from "@prisma/client";

export type {
  UserProfile,
  QuestionSession,
  Answer,
  MealRecommendation,
  MealHistory,
  CuisineGenre,
  SpiceLevel,
  BudgetRange,
  TimeSlot,
  SessionStatus,
  QuestionCategory,
  MealSource,
};

export interface UserProfileUpdate {
  preferred_genres?: CuisineGenre[];
  allergies?: string[];
  spice_preference?: SpiceLevel;
  budget_range?: BudgetRange;
}

export interface Location {
  latitude: number;
  longitude: number;
  prefecture?: string;
  city?: string;
}

export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  priority: number;
  isSystemQuestion: boolean;
  questionIndex: number;
}

export interface QuestionSessionWithRelations extends QuestionSession {
  answers: Answer[];
  meal_recommendation?: MealRecommendation;
}

export interface MealHistoryResponse {
  items: MealHistory[];
  total: number;
  hasMore: boolean;
}

export interface CreateQuestionSessionRequest {
  timeOfDay: TimeSlot;
  location?: Location;
}

export interface CreateAnswerRequest {
  questionId: string;
  response: boolean;
  responseTime: number;
}

export interface GenerateQuestionRequest {
  sessionId: string;
  userProfile: UserProfile;
  previousAnswers?: Answer[];
  timeOfDay: TimeSlot;
  location?: Location;
}

export interface GenerateRecommendationRequest {
  sessionId: string;
  userProfile: UserProfile;
  answers: Answer[];
}

export interface RecommendationReactionRequest {
  reaction: "liked" | "disliked" | "saved";
}

export interface ApiError {
  error: string;
  message: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}
