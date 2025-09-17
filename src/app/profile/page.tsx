"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  RequireAuth,
  useAuth,
} from "../../features/auth/components/auth-provider";
import { LogoutButton } from "../../features/auth/components/login-form";
import type { CuisineGenre, UserProfile } from "../../types/database";

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    preferred_genres: [],
    allergies: [],
    spice_preference: "mild",
    budget_range: "moderate",
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        preferred_genres: userProfile.preferred_genres || [],
        allergies: userProfile.allergies || [],
        spice_preference: userProfile.spice_preference || "mild",
        budget_range: userProfile.budget_range || "moderate",
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (
    field: "preferred_genres" | "allergies",
    value: CuisineGenre | string,
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter((item) => item !== value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateProfile(formData);

      if (result.error) {
        setError("プロファイルの更新に失敗しました。");
      } else {
        setSuccess("プロファイルが正常に更新されました。");
        setIsEditing(false);
        // 3秒後に成功メッセージを非表示
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setError("プロファイルの更新に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        preferred_genres: userProfile.preferred_genres || [],
        allergies: userProfile.allergies || [],
        spice_preference: userProfile.spice_preference || "mild",
        budget_range: userProfile.budget_range || "moderate",
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const genreOptions = [
    { value: "japanese", label: "和食" },
    { value: "chinese", label: "中華" },
    { value: "korean", label: "韓国料理" },
    { value: "italian", label: "イタリアン" },
    { value: "french", label: "フレンチ" },
    { value: "american", label: "アメリカン" },
    { value: "indian", label: "インド料理" },
    { value: "thai", label: "タイ料理" },
    { value: "mexican", label: "メキシカン" },
    { value: "other", label: "その他" },
  ];

  const allergyOptions = [
    { value: "eggs", label: "卵" },
    { value: "milk", label: "乳製品" },
    { value: "wheat", label: "小麦" },
    { value: "soybeans", label: "大豆" },
    { value: "peanuts", label: "ピーナッツ" },
    { value: "tree_nuts", label: "ナッツ類" },
    { value: "fish", label: "魚" },
    { value: "shellfish", label: "甲殻類" },
    { value: "sesame", label: "ごま" },
  ];

  const spiceOptions = [
    { value: "none", label: "辛さなし" },
    { value: "mild", label: "軽く辛い" },
    { value: "medium", label: "普通辛い" },
    { value: "hot", label: "辛い" },
    { value: "very_hot", label: "とても辛い" },
  ];

  const budgetOptions = [
    { value: "budget", label: "〜500円" },
    { value: "moderate", label: "500円〜1000円" },
    { value: "premium", label: "1000円〜2000円" },
    { value: "luxury", label: "2000円以上" },
  ];

  return (
    <RequireAuth>
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ページヘッダー */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  プロファイル
                </h1>
                <p className="text-gray-600 mt-1">
                  あなたの食事の好みや制限を設定してください
                </p>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    編集
                  </button>
                ) : null}
                <LogoutButton
                  variant="secondary"
                  onLogout={() => router.push("/")}
                />
              </div>
            </div>
          </div>

          {/* メッセージ表示 */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* プロファイルフォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                基本情報
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <p className="text-gray-600 py-2">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* 料理の好み */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                料理の好み
              </h2>

              <div className="space-y-6">
                {/* 好きなジャンル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    好きな料理のジャンル（複数選択可）
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {genreOptions.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={(formData.preferred_genres || []).includes(
                              option.value as CuisineGenre,
                            )}
                            onChange={(e) =>
                              handleArrayChange(
                                "preferred_genres",
                                option.value as CuisineGenre,
                                e.target.checked,
                              )
                            }
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(userProfile?.preferred_genres || []).length > 0 ? (
                        (userProfile?.preferred_genres || []).map((genre) => {
                          const option = genreOptions.find(
                            (opt) => opt.value === genre,
                          );
                          return (
                            <span
                              key={genre}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {option?.label || genre}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-gray-500">未設定</span>
                      )}
                    </div>
                  )}
                </div>

                {/* 辛さの好み */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    辛さの好み
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {spiceOptions.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="spice_preference"
                            value={option.value}
                            checked={formData.spice_preference === option.value}
                            onChange={(e) =>
                              handleInputChange(
                                "spice_preference",
                                e.target.value,
                              )
                            }
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-900">
                      {spiceOptions.find(
                        (opt) => opt.value === userProfile?.spice_preference,
                      )?.label || "未設定"}
                    </p>
                  )}
                </div>

                {/* 予算の範囲 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    予算の範囲
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {budgetOptions.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="budget_range"
                            value={option.value}
                            checked={formData.budget_range === option.value}
                            onChange={(e) =>
                              handleInputChange("budget_range", e.target.value)
                            }
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-900">
                      {budgetOptions.find(
                        (opt) => opt.value === userProfile?.budget_range,
                      )?.label || "未設定"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* アレルギー・制限 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                アレルギー・食事制限
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  アレルギー（複数選択可）
                </label>
                {isEditing ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {allergyOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={(formData.allergies || []).includes(
                            option.value,
                          )}
                          onChange={(e) =>
                            handleArrayChange(
                              "allergies",
                              option.value,
                              e.target.checked,
                            )
                          }
                          className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(userProfile?.allergies || []).length > 0 ? (
                      (userProfile?.allergies || []).map((allergy) => {
                        const option = allergyOptions.find(
                          (opt) => opt.value === allergy,
                        );
                        return (
                          <span
                            key={allergy}
                            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                          >
                            {option?.label || allergy}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-500">なし</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* アクションボタン */}
            {isEditing && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "保存中..." : "保存"}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* 統計情報 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              アカウント情報
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">アカウント作成日</p>
                <p className="font-medium">
                  {userProfile?.created_at
                    ? new Date(userProfile.created_at).toLocaleDateString(
                        "ja-JP",
                      )
                    : "不明"}
                </p>
              </div>
              <div>
                <p className="text-gray-600">最終更新日</p>
                <p className="font-medium">
                  {userProfile?.updated_at
                    ? new Date(userProfile.updated_at).toLocaleDateString(
                        "ja-JP",
                      )
                    : "不明"}
                </p>
              </div>
              <div className="text-center">
                <button
                  onClick={() => router.push("/history")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  食事履歴を見る →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
