"use client";

import { useState } from "react";
import type { MealRecommendation } from "../../../types/database";

interface RecommendationResultProps {
  recommendation: MealRecommendation;
  onReaction?: (reaction: "LIKE" | "DISLIKE" | "SAVE") => void;
  onRetry?: () => void;
  onClose?: () => void;
  showActions?: boolean;
}

export function RecommendationResult({
  recommendation,
  onReaction,
  onRetry,
  onClose,
  showActions = true,
}: RecommendationResultProps) {
  const [reactionLoading, setReactionLoading] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleReaction = async (reaction: "LIKE" | "DISLIKE" | "SAVE") => {
    if (!onReaction) return;

    setReactionLoading(reaction);
    try {
      await onReaction(reaction);
    } catch (error) {
      console.error("Reaction error:", error);
    } finally {
      setReactionLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getConfidenceColor = (confidence: number) => {
    const validConfidence = Math.round((confidence || 0) * 100);
    if (validConfidence >= 80) return "text-green-600 bg-green-100";
    if (validConfidence >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const formatConfidence = (confidence: number) => {
    return Math.round((confidence || 0) * 100);
  };

  const formatDate = (dateInput: string | Date) => {
    try {
      const date = new Date(dateInput);
      return isNaN(date.getTime()) ? "不明" : date.toLocaleString("ja-JP");
    } catch (error) {
      return "不明";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            おすすめの食事が見つかりました！
          </h2>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                recommendation.confidence,
              )}`}
            >
              信頼度: {formatConfidence(recommendation.confidence)}%
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {recommendation.cuisine_genre}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
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
        )}
      </div>

      {/* メイン情報 */}
      <div className="space-y-4 mb-6">
        {/* 料理名と説明 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {recommendation.meal_name}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {recommendation.description}
          </p>
        </div>

        {/* 推薦理由 */}
        {recommendation.reasoning_steps && (
          <div>
            <span className="text-sm font-medium text-gray-700">推薦理由:</span>
            <ul className="mt-1 space-y-1">
              {recommendation.reasoning_steps.map((step, index) => (
                <li key={index} className="text-gray-600 text-sm">
                  • {step}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 詳細情報 */}
      <div className="mb-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <span>詳細情報を{showDetails ? "隠す" : "表示"}</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${showDetails ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showDetails && (
          <div className="mt-4 space-y-4">
            {/* ユーザーの反応 */}
            {recommendation.user_reaction && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  ユーザーの反応
                </h4>
                <p className="text-gray-600">{recommendation.user_reaction}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* アクションボタン */}
      {showActions && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleReaction("LIKE")}
            disabled={reactionLoading === "LIKE"}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {reactionLoading === "LIKE" ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
            )}
            <span>いいね</span>
          </button>

          <button
            onClick={() => handleReaction("SAVE")}
            disabled={reactionLoading === "SAVE"}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {reactionLoading === "SAVE" ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            )}
            <span>保存</span>
          </button>

          <button
            onClick={() => handleReaction("DISLIKE")}
            disabled={reactionLoading === "DISLIKE"}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {reactionLoading === "DISLIKE" ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                />
              </svg>
            )}
            <span>いまいち</span>
          </button>

          {onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>他の提案</span>
            </button>
          )}
        </div>
      )}

      {/* 作成日時 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          作成日時: {formatDate(recommendation.created_at)}
        </p>
      </div>
    </div>
  );
}

// 複数の推薦結果を表示するコンポーネント
interface RecommendationListProps {
  recommendations: MealRecommendation[];
  onReaction?: (
    recommendationId: string,
    reaction: "LIKE" | "DISLIKE" | "SAVE",
  ) => void;
  onRetry?: () => void;
}

export function RecommendationList({
  recommendations,
  onReaction,
  onRetry,
}: RecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <p className="text-lg text-gray-600 mb-4">まだ推薦結果がありません</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            推薦を取得する
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {recommendations.map((recommendation) => (
        <RecommendationResult
          key={recommendation.id}
          recommendation={recommendation}
          onReaction={(reaction) => onReaction?.(recommendation.id, reaction)}
        />
      ))}
    </div>
  );
}
