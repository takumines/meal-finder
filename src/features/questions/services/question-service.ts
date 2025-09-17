import { openai } from "@/lib/openai";
import type {
  Answer,
  QuestionCategory,
  TimeSlot,
  UserProfile,
} from "@/types";

// Types
export interface Question {
  id: string;
  text: string;
  category: QuestionCategory;
  priority: number;
  isSystemQuestion: boolean;
  questionIndex: number;
}

export interface GenerateQuestionParams {
  userProfile: UserProfile;
  previousAnswers?: Answer[];
  timeOfDay: TimeSlot;
  location?: {
    latitude: number;
    longitude: number;
    prefecture?: string;
    city?: string;
  };
  sessionId: string;
}

export interface QuestionProgress {
  current: number;
  total: number;
  percentage: number;
}

// Constants
const SYSTEM_QUESTIONS: readonly Question[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    text: "今日は何か特別な気分ですか？",
    category: "MOOD",
    priority: 1,
    isSystemQuestion: true,
    questionIndex: 1,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    text: "辛い料理は好きですか？",
    category: "PREFERENCE",
    priority: 2,
    isSystemQuestion: true,
    questionIndex: 2,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    text: "今日は軽めの食事がいいですか？",
    category: "PREFERENCE",
    priority: 3,
    isSystemQuestion: true,
    questionIndex: 3,
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    text: "温かい料理を食べたいですか？",
    category: "PREFERENCE",
    priority: 4,
    isSystemQuestion: true,
    questionIndex: 4,
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    text: "外食気分ですか？",
    category: "SITUATION",
    priority: 5,
    isSystemQuestion: true,
    questionIndex: 5,
  },
] as const;

const FALLBACK_QUESTIONS: readonly string[] = [
  "今日は新しい料理に挑戦したい気分ですか？",
  "おなかはどのくらい空いていますか？",
  "一人で食事をする予定ですか？",
  "野菜をたくさん食べたい気分ですか？",
  "お米やパンなどの主食は必要ですか？",
] as const;

const MAX_QUESTIONS = 10;
const MIN_QUESTIONS = 3;

// Pure functions
export const getNextSystemQuestion = (
  previousAnswers: Answer[],
): Question | null => {
  const answeredQuestionIds = new Set(
    previousAnswers.map((a) => a.question_id),
  );

  return SYSTEM_QUESTIONS.find((q) => !answeredQuestionIds.has(q.id)) || null;
};

export const categorizeQuestion = (questionText: string): QuestionCategory => {
  if (questionText.includes("辛い") || questionText.includes("味")) {
    return "PREFERENCE";
  }
  if (questionText.includes("気分") || questionText.includes("今日")) {
    return "MOOD";
  }
  if (
    questionText.includes("アレルギー") ||
    questionText.includes("食べられない")
  ) {
    return "PREFERENCE";
  }
  if (questionText.includes("場所") || questionText.includes("外食")) {
    return "SITUATION";
  }
  return "PREFERENCE";
};

export const buildPrompt = (params: {
  userProfile: UserProfile;
  previousAnswers: Answer[];
  timeOfDay: TimeSlot;
  location?: {
    latitude: number;
    longitude: number;
    prefecture?: string;
    city?: string;
  };
}): string => {
  const { userProfile, previousAnswers, timeOfDay, location } = params;

  let prompt = `ユーザーの食事推薦のための質問を生成してください。

ユーザー情報:
- 好みのジャンル: ${userProfile.preferred_genres.join(", ")}
- アレルギー: ${userProfile.allergies.join(", ") || "なし"}
- 辛さの好み: ${userProfile.spice_preference}
- 予算: ${userProfile.budget_range}

時間帯: ${timeOfDay}`;

  if (location) {
    prompt += `\n場所: ${location.prefecture || ""}${location.city || ""}`;
  }

  if (previousAnswers.length > 0) {
    prompt += `\n\n過去の回答数: ${previousAnswers.length}件`;
  }

  prompt += `\n\n効果的な質問を1つ生成してください。質問は具体的で、ユーザーの食事選択に役立つものにしてください。`;

  return prompt;
};

// UUID生成用のヘルパー関数
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const createFallbackQuestion = (answerCount: number): Question => {
  const questionText =
    FALLBACK_QUESTIONS[answerCount % FALLBACK_QUESTIONS.length];

  return {
    id: generateUUID(),
    text: questionText,
    category: "PREFERENCE",
    priority: 20 + answerCount,
    isSystemQuestion: false,
    questionIndex: answerCount + 1,
  };
};

export const generateAIQuestion = async (
  params: GenerateQuestionParams,
): Promise<Question> => {
  const { userProfile, previousAnswers, timeOfDay, location } = params;

  const prompt = buildPrompt({
    userProfile,
    previousAnswers: previousAnswers || [],
    timeOfDay,
    location,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "あなたは日本の食事推薦システムのエキスパートです。ユーザーの好みを理解するための効果的な質問を1つ生成してください。質問は自然で親しみやすい日本語で、はい/いいえで答えられる形式にしてください。",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 150,
  });

  const questionText = response.choices[0]?.message?.content?.trim();
  if (!questionText) {
    throw new Error("Failed to generate AI question");
  }

  return {
    id: generateUUID(),
    text: questionText,
    category: categorizeQuestion(questionText),
    priority: 10 + (previousAnswers?.length || 0),
    isSystemQuestion: false,
    questionIndex: (previousAnswers?.length || 0) + 1,
  };
};

// Main service function
export const generateQuestion = async (
  params: GenerateQuestionParams,
): Promise<Question> => {
  const { previousAnswers = [] } = params;

  // まずシステム質問をチェック
  const systemQuestion = getNextSystemQuestion(previousAnswers);
  if (systemQuestion) {
    return systemQuestion;
  }

  // AIによる動的質問生成
  try {
    const aiQuestion = await generateAIQuestion(params);
    return aiQuestion;
  } catch (error) {
    console.error("AI question generation failed:", error);
    // フォールバック: デフォルト質問
    return createFallbackQuestion(previousAnswers.length);
  }
};

// Utility functions
export const getQuestionProgress = (totalAnswers: number): QuestionProgress => {
  const current = Math.min(totalAnswers, MAX_QUESTIONS);

  return {
    current,
    total: MAX_QUESTIONS,
    percentage: Math.round((current / MAX_QUESTIONS) * 100),
  };
};

export const shouldContinueQuestioning = (answerCount: number): boolean => {
  return answerCount < MAX_QUESTIONS && answerCount >= MIN_QUESTIONS;
};

// Service object for convenience (if needed for dependency injection)
export const questionService = {
  generateQuestion,
  getQuestionProgress,
  shouldContinueQuestioning,
  getNextSystemQuestion,
  generateAIQuestion,
  createFallbackQuestion,
} as const;
