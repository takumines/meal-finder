# プロジェクト概要

## プロジェクト名
**何食べる？ (nantaberu)** - AI駆動の食事推薦アプリケーション

## 目的
ユーザーの好みと状況に基づいてAIが最適な食事を推薦するNext.js 15アプリケーション。質問ベースのインタラクティブな体験を通じて、パーソナライズされた食事提案を提供する。

## 主要機能
- 🤖 AI駆動の質問生成（OpenAI GPT-4使用）
- 🍽️ パーソナライズされた食事推薦
- 📱 レスポンシブUI（モバイルファースト）
- 🔐 認証システム（Supabase）
- 📊 食事履歴管理
- ⚡ 高パフォーマンス（2秒以内のAPIレスポンス）

## 技術スタック

### フロントエンド
- **Next.js 15** (App Router)
- **React 19** with TypeScript
- **Tailwind CSS** (スタイリング)
- **関数型プログラミング** (純粋関数アーキテクチャ)

### バックエンド
- **Next.js API Routes** (App Router)
- **Supabase** (PostgreSQL Database)
- **Prisma ORM** (データベースアクセス)
- **OpenAI API** (GPT-4 for AI機能)

### 開発・テスト
- **TypeScript** (型安全性、strict mode)
- **Vitest** (テストフレームワーク)
- **React Testing Library** (コンポーネントテスト)
- **Biome** (リンティング・フォーマッティング)

## アーキテクチャパターン
- **関数型プログラミング**: classベースでなく純粋関数を使用
- **機能単位分離**: `src/features/`配下で完結
- **レイヤー分離**: UI層、ビジネスロジック層、データ層の明確な分離