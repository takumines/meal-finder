"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../features/auth/components/auth-provider";
import { LoginForm } from "../features/auth/components/login-form";

export default function Home() {
  const { user, loading, signIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  // 開発環境用のテストログイン機能
  const handleTestLogin = async () => {
    try {
      const result = await signIn("test@example.com", "password123");
      if (result.error) {
        console.log("Test user not found, need to create one");
      }
    } catch (error) {
      console.error("Test login failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              あなたにぴったりの
              <span className="text-blue-600 block">食事を見つけよう</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AIが質問を通してあなたの好みを学習し、その時の気分や状況にあわせて最適な食事を提案します。
              新しい味の発見から、いつもの安心できる料理まで。
            </p>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/questions"
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  今すぐ質問を開始
                </Link>
                <Link
                  href="/history"
                  className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  履歴を見る
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  今すぐ始める
                </button>
                <button
                  onClick={handleTestLogin}
                  className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
                >
                  テストログイン
                </button>
                <Link
                  href="#how-it-works"
                  className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-blue-50 transition-colors"
                >
                  使い方を見る
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-16 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              MealFinderの特徴
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AIと対話しながら、あなただけの食事体験を作りましょう
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI による個人化
              </h3>
              <p className="text-gray-600">
                あなたの回答を学習し、好みや制限を考慮した最適な提案を行います
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                簡単な質問形式
              </h3>
              <p className="text-gray-600">
                はい・いいえで答えるだけ。複雑な入力は必要ありません
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                履歴とパターン分析
              </h3>
              <p className="text-gray-600">
                過去の選択を記録し、より精度の高い提案を可能にします
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="py-16 bg-gray-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              使い方はとても簡単
            </h2>
            <p className="text-lg text-gray-600">
              3つのステップで理想の食事が見つかります
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    質問に答える
                  </h3>
                  <p className="text-gray-600">
                    AIからの簡単な質問に「はい」「いいえ」で答えるだけ。あなたの好みや今の気分を教えてください。
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    AIが分析
                  </h3>
                  <p className="text-gray-600">
                    あなたの回答をもとに、AIが最適な食事を分析・選択します。過去の履歴も考慮されます。
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    おすすめを受け取る
                  </h3>
                  <p className="text-gray-600">
                    料理名、材料、作り方、おすすめレストランなど、詳細な情報と共に提案をお届けします。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            今日の食事を決めませんか？
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            たった数分で、あなたにぴったりの食事が見つかります。
          </p>

          {user ? (
            <Link
              href="/questions"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors inline-block"
            >
              質問を開始する
            </Link>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors"
            >
              無料で始める
            </button>
          )}
        </div>
      </section>

      {/* ログインモーダル */}
      {showLogin && !user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <LoginForm
              onSuccess={() => setShowLogin(false)}
              onCancel={() => setShowLogin(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
