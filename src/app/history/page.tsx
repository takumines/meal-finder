"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  RequireAuth,
  useAuth,
} from "@/features/auth/components/auth-provider";
import {
  MealHistory,
  MealHistoryStats,
} from "@/features/meals/components/meal-history";
import { RecommendationResult } from "@/features/meals/components/recommendation-result";
import type { MealRecommendation } from "@/types/database";

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<MealRecommendation | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleRecommendationClick = (recommendation: MealRecommendation) => {
    setSelectedRecommendation(recommendation);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedRecommendation(null);
    setShowModal(false);
  };

  const handleReaction = async (reaction: "LIKE" | "DISLIKE" | "SAVE") => {
    if (!selectedRecommendation) return;

    try {
      const response = await fetch(
        `/api/recommendations/${selectedRecommendation.id}/reaction`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reaction,
            userId: user!.id,
          }),
        },
      );

      if (response.ok && reaction === "SAVE") {
        alert("お気に入りに再保存しました！");
      }
    } catch (error) {
      console.error("Reaction error:", error);
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ページヘッダー */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    食事履歴
                  </h1>
                  <p className="text-gray-600">
                    これまでにAIが提案した食事の履歴を確認できます
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <button
                    onClick={() => router.push("/questions")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    新しい質問を開始
                  </button>
                  <button
                    onClick={() => router.push("/profile")}
                    className="bg-gray-200 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    プロファイル編集
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          {user && (
            <div className="mb-8">
              <MealHistoryStats userId={user.id} />
            </div>
          )}

          {/* 履歴一覧 */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">履歴一覧</h2>
            </div>
            <div className="p-6">
              <MealHistory
                showFilters={true}
                onRecommendationClick={handleRecommendationClick}
              />
            </div>
          </div>

          {/* ヘルプセクション */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              履歴について
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 text-xs font-bold">📊</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">統計機能</p>
                    <p>あなたの食事パターンや好みの傾向を分析します。</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 text-xs font-bold">★</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">評価機能</p>
                    <p>
                      過去の食事に評価をつけることで、より良い提案が可能になります。
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 text-xs font-bold">
                      🔍
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">フィルター機能</p>
                    <p>
                      期間や評価、料理の種類で履歴を絞り込むことができます。
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-orange-600 text-xs font-bold">
                      🔄
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">再推薦</p>
                    <p>
                      気に入った料理から、似た料理を再度探すことができます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ショートカット */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                まだ履歴がありませんか？
              </h3>
              <p className="text-gray-600 mb-4">
                質問に答えて、あなたにぴったりの食事を見つけましょう
              </p>
              <button
                onClick={() => router.push("/questions")}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
              >
                今すぐ質問を開始
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* レシピ詳細モーダル */}
      {showModal && selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                レシピ詳細
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <RecommendationResult
                recommendation={selectedRecommendation}
                onReaction={handleReaction}
                onClose={handleCloseModal}
                showActions={true}
              />
            </div>
          </div>
        </div>
      )}
    </RequireAuth>
  );
}
