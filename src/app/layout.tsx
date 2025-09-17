import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/components/auth-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MealFinder - あなたにぴったりの食事を見つけよう",
  description:
    "AIが質問を通してあなたの好みを学習し、最適な食事を提案するアプリです。",
  keywords: ["食事", "レシピ", "AI", "推薦", "料理"],
  authors: [{ name: "MealFinder Team" }],
  openGraph: {
    title: "MealFinder",
    description:
      "AIが質問を通してあなたの好みを学習し、最適な食事を提案するアプリです。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "MealFinder",
    description:
      "AIが質問を通してあなたの好みを学習し、最適な食事を提案するアプリです。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {/* ナビゲーションヘッダー */}
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-blue-600">
                      MealFinder
                    </h1>
                  </div>
                  <nav className="hidden md:flex space-x-8">
                    <a
                      href="/"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      ホーム
                    </a>
                    <a
                      href="/questions"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      質問を開始
                    </a>
                    <a
                      href="/history"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      履歴
                    </a>
                    <a
                      href="/profile"
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      プロファイル
                    </a>
                  </nav>
                </div>
              </div>
            </header>

            {/* メインコンテンツ */}
            <main className="flex-1">{children}</main>

            {/* フッター */}
            <footer className="bg-gray-800 text-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">MealFinder</h3>
                    <p className="text-gray-300 text-sm">
                      AIがあなたの好みを学習し、最適な食事を提案します。
                    </p>
                  </div>
                  <div>
                    <h4 className="text-md font-medium mb-4">リンク</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="/" className="text-gray-300 hover:text-white">
                          ホーム
                        </a>
                      </li>
                      <li>
                        <a
                          href="/questions"
                          className="text-gray-300 hover:text-white"
                        >
                          質問を開始
                        </a>
                      </li>
                      <li>
                        <a
                          href="/history"
                          className="text-gray-300 hover:text-white"
                        >
                          履歴
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-md font-medium mb-4">サポート</h4>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a
                          href="/help"
                          className="text-gray-300 hover:text-white"
                        >
                          ヘルプ
                        </a>
                      </li>
                      <li>
                        <a
                          href="/privacy"
                          className="text-gray-300 hover:text-white"
                        >
                          プライバシーポリシー
                        </a>
                      </li>
                      <li>
                        <a
                          href="/terms"
                          className="text-gray-300 hover:text-white"
                        >
                          利用規約
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
                  <p>&copy; 2025 MealFinder. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
