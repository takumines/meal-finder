"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  RequireAuth,
  useAuth,
} from "../../features/auth/components/auth-provider";
import { RecommendationResult } from "../../features/meals/components/recommendation-result";
import { QuestionFlow } from "../../features/questions/components/question-flow";
import type { MealRecommendation } from "../../types/database";

// SearchParamsを使用するコンポーネントを分離
function QuestionsPageContent({
  onSessionIdChange,
}: {
  onSessionIdChange: (sessionId: string | null) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // URLからセッションIDを取得
    const sessionParam = searchParams.get("session");
    onSessionIdChange(sessionParam);
  }, [searchParams, onSessionIdChange]);

  return null; // このコンポーネントはロジックのみ
}

export default function QuestionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recommendation, setRecommendation] =
    useState<MealRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 質問セッション完了時の処理
  const handleQuestionComplete = async (completedSessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      // 推薦を生成
      const response = await fetch("/api/ai/generate-recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          sessionId: completedSessionId,
          userId: user!.id,
        }),
      });

      if (!response.ok) {
        throw new Error("推薦の生成に失敗しました");
      }

      const result = await response.json();
      if (result.success && result.data) {
        // APIレスポンスからMealRecommendation形式に変換
        const recommendation: MealRecommendation = {
          id: result.data.id,
          session_id: result.data.sessionId,
          meal_name: result.data.mealName,
          description: result.data.description,
          cuisine_genre: result.data.cuisineGenre,
          confidence: result.data.confidence,
          reasoning_steps: result.data.reasoningSteps,
          user_reaction: null,
          created_at: result.data.createdAt,
        };
        setRecommendation(recommendation);
      } else {
        throw new Error("推薦データの形式が正しくありません");
      }
    } catch (error) {
      console.error("Recommendation generation error:", error);
      setError("推薦の生成に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  // エラー処理
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // 推薦に対するリアクション
  const handleReaction = async (reaction: "LIKE" | "DISLIKE" | "SAVE") => {
    if (!recommendation) return;

    try {
      const response = await fetch(
        `/api/recommendations/${recommendation.id}/reaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            reaction,
            userId: user!.id,
          }),
        },
      );

      if (response.ok) {
        // リアクション成功時の処理
        if (reaction === "SAVE") {
          // 履歴に保存されたことを通知
          alert("お気に入りに保存しました！");
        }
      }
    } catch (error) {
      console.error("Reaction error:", error);
    }
  };

  // 新しい推薦を試す
  const handleRetry = () => {
    setRecommendation(null);
    setSessionId(null);
    setError(null);
    router.push("/questions");
  };

  // 新しいセッションを開始
  const handleNewSession = () => {
    setRecommendation(null);
    setSessionId(null);
    setError(null);
  };

  return (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">読み込み中...</p>
            </div>
          </div>
        }
      >
        <QuestionsPageContent onSessionIdChange={setSessionId} />
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* ページヘッダー */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                食事の質問セッション
              </h1>
              <p className="text-lg text-gray-600">
                いくつかの質問にお答えいただき、あなたにぴったりの食事を見つけましょう
              </p>
            </div>

            {/* エラー表示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p>{error}</p>
                    <button
                      onClick={handleNewSession}
                      className="mt-2 text-red-600 hover:text-red-800 font-medium"
                    >
                      新しいセッションを開始
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* メインコンテンツ */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">
                    あなたの回答を分析して、最適な食事を提案しています...
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    これには少し時間がかかる場合があります
                  </p>
                </div>
              </div>
            ) : recommendation ? (
              <div className="space-y-6">
                <RecommendationResult
                  recommendation={recommendation}
                  onReaction={handleReaction}
                  onRetry={handleRetry}
                />

                {/* アクションボタン */}
                <div className="bg-white rounded-lg p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    次はどうしますか？
                  </h3>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={handleNewSession}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      別の提案を受ける
                    </button>
                    <button
                      onClick={() => router.push("/history")}
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      履歴を見る
                    </button>
                    <button
                      onClick={() => router.push("/profile")}
                      className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      プロファイルを編集
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <QuestionFlow
                sessionId={sessionId || undefined}
                onComplete={handleQuestionComplete}
                onError={handleError}
              />
            )}

            {/* ヘルプセクション */}
            {!recommendation && !loading && (
              <div className="mt-12 bg-white rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  質問について
                </h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-xs font-bold">?</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        質問に正解はありません
                      </p>
                      <p>
                        直感的に感じたことを答えてください。間違いを恐れる必要はありません。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-green-600 text-xs font-bold">
                        ✓
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">短時間で完了</p>
                      <p>
                        通常3-5分程度で完了します。途中で中断しても、後から続きを再開できます。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 text-xs font-bold">
                        ★
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">学習機能</p>
                      <p>
                        質問を重ねるほど、AIがあなたの好みを学習し、より良い提案ができるようになります。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Suspense>
    </RequireAuth>
  );
}
