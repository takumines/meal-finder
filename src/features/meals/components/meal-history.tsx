"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/features/auth/components/auth-provider";
import type {
  MealHistoryItem,
  MealHistoryResponse,
  MealRecommendation,
} from "@/types/database";

interface MealHistoryViewProps {
  limit?: number;
  showFilters?: boolean;
  onRecommendationClick?: (recommendation: MealRecommendation) => void;
}

export function MealHistoryView({
  limit,
  showFilters = true,
  onRecommendationClick,
}: MealHistoryViewProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<MealHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateRange: "30", // 30日, 7日, allなど
    rating: "all", // all, good, badなど
    cuisineType: "all",
  });

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        userId: user?.id || "",
        ...filters,
      };

      if (limit) {
        params.limit = limit.toString();
      }

      const queryParams = new URLSearchParams(params);

      const response = await fetch(`/api/history?${queryParams}`);

      if (!response.ok) {
        throw new Error("履歴の読み込みに失敗しました");
      }

      const data = await response.json();
      console.log("History load success:", data);
      setHistory(data);
    } catch (error) {
      console.error("History load error:", error);
      setError("履歴の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters, limit]);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, loadHistory]);

  const handleRatingChange = async (historyId: string, rating: number) => {
    try {
      const response = await fetch(`/api/history/${historyId}/rating`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        // 履歴を再読み込み
        await loadHistory();
      }
    } catch (error) {
      console.error("Rating update error:", error);
    }
  };

  const _formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const _getRatingStars = (rating: number | null) => {
    if (!rating) return "未評価";

    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={`star-${i}-${rating || 0}`}
        className={`text-lg ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
      >
        ★
      </span>
    ));
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">ログインが必要です</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">履歴を読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
        <button
          type="button"
          onClick={loadHistory}
          className="ml-4 text-red-600 hover:text-red-800 font-medium"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* フィルター */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">フィルター</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="dateRange"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                期間
              </label>
              <select
                id="dateRange"
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters({ ...filters, dateRange: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">過去7日</option>
                <option value="30">過去30日</option>
                <option value="90">過去3ヶ月</option>
                <option value="all">すべて</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                評価
              </label>
              <select
                id="rating"
                value={filters.rating}
                onChange={(e) =>
                  setFilters({ ...filters, rating: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべて</option>
                <option value="good">良い評価（4★以上）</option>
                <option value="average">普通（3★）</option>
                <option value="bad">低い評価（2★以下）</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="cuisineType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                料理の種類
              </label>
              <select
                id="cuisineType"
                value={filters.cuisineType}
                onChange={(e) =>
                  setFilters({ ...filters, cuisineType: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">すべて</option>
                <option value="JAPANESE">和食</option>
                <option value="WESTERN">洋食</option>
                <option value="CHINESE">中華</option>
                <option value="KOREAN">韓国料理</option>
                <option value="ITALIAN">イタリアン</option>
                <option value="FRENCH">フレンチ</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 履歴一覧 */}
      {!history || history.items.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="履歴なし"
            >
              <title>履歴なし</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <p className="text-lg text-gray-600">履歴がありません</p>
          <p className="text-sm text-gray-500">
            食事の推薦を受けると、ここに履歴が表示されます。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.items.map((item) => (
            <MealHistoryCard
              key={item.id}
              historyItem={item}
              onRatingChange={handleRatingChange}
              onRecommendationClick={onRecommendationClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 個別の履歴カードコンポーネント
interface MealHistoryCardProps {
  historyItem: MealHistoryItem;
  onRatingChange?: (historyId: string, rating: number) => void;
  onRecommendationClick?: (recommendation: MealRecommendation) => void;
}

function MealHistoryCard({
  historyItem,
  onRatingChange,
  onRecommendationClick: _onRecommendationClick,
}: MealHistoryCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [rating, setRating] = useState(historyItem.satisfaction || 0);

  const handleRatingClick = (newRating: number) => {
    setRating(newRating);
    onRatingChange?.(historyItem.id, newRating);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {historyItem.mealName}
          </h3>
          <p className="text-sm text-gray-500">
            {formatDate(historyItem.consumedAt.toString())}
          </p>
        </div>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
          {historyItem.cuisineGenre}
        </span>
      </div>

      {/* 評価 */}
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            あなたの評価:
          </span>
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={`rating-star-${i}-${rating}`}
                type="button"
                onClick={() => handleRatingClick(i + 1)}
                className={`text-lg hover:scale-110 transition-transform ${
                  i < rating
                    ? "text-yellow-400"
                    : "text-gray-300 hover:text-yellow-200"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <span className="text-sm text-gray-600">({rating}/5)</span>
          )}
        </div>
      </div>

      {/* 詳細表示ボタン */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
      >
        <span>詳細を{showDetails ? "隠す" : "表示"}</span>
        <svg
          className={`w-4 h-4 transform transition-transform ${showDetails ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          role="img"
          aria-label="詳細表示切り替え"
        >
          <title>詳細表示切り替え</title>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* 詳細情報 */}
      {showDetails && (
        <div className="space-y-4 border-t border-gray-200 pt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">ソース:</span>
            <span className="text-blue-600 font-medium">
              {historyItem.source}
            </span>
          </div>

          {/* アクションボタン */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={() => {
                /* 再推薦機能 */
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
            >
              似た料理を探す
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 履歴の統計表示コンポーネント
interface MealHistoryStatsProps {
  userId: string;
}

interface StatsData {
  totalMeals: number;
  averageRating: number;
  favoriteCuisine: string;
  thisMonthCount: number;
}

export function MealHistoryStats({ userId }: MealHistoryStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/history/stats?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Stats load error:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) return null;
  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">統計情報</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalMeals}
          </div>
          <div className="text-sm text-gray-600">総食事数</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.averageRating?.toFixed(1) || "---"}
          </div>
          <div className="text-sm text-gray-600">平均評価</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.favoriteCuisine || "---"}
          </div>
          <div className="text-sm text-gray-600">お気に入り</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.thisMonthCount}
          </div>
          <div className="text-sm text-gray-600">今月の食事</div>
        </div>
      </div>
    </div>
  );
}
