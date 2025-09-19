# nantaberu (何食べる？)

## 概要

nantaberu は、ユーザーの好みと状況に基づいて AI が最適な食事を推薦する Next.js 15 アプリケーションです。インタラクティブな質問システムを通じて、あなたにぴったりの食事を提案します。

## 主要機能

- 🤖 **AI 駆動の質問生成**: OpenAI GPT-4 を使用したインタラクティブ質問システム
- 🍽️ **パーソナライズされた食事推薦**: ユーザーの好み、アレルギー、予算に基づく推薦
- 📱 **レスポンシブ UI**: モバイルファーストデザイン（Tailwind CSS 4）
- 🔐 **認証システム**: Supabase 認証統合
- 📊 **食事履歴管理**: 過去の推薦と評価の追跡・統計表示
- 👤 **プロフィール管理**: 食事の好み、アレルギー情報の管理
- ⚡ **高パフォーマンス**: 最適化された API レスポンス

## 技術スタック

### フロントエンド

- **Next.js 15.5.3** (App Router)
- **React 19.1.0** with TypeScript
- **Tailwind CSS 4** (スタイリング)

### バックエンド

- **Next.js API Routes** (App Router)
- **Supabase** (PostgreSQL Database + 認証)
- **Prisma ORM 6.16.1** (データベースアクセス)
- **OpenAI API** (GPT-4 for AI 機能)

### 開発・テスト

- **TypeScript** (厳密な型安全性)
- **Vitest 3.2.4** (テストフレームワーク)
- **React Testing Library** (コンポーネントテスト)
- **Biome** (linting & formatting)

## アーキテクチャ

### ディレクトリ構成

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API route handlers
│   │   ├── sessions/     # セッション管理
│   │   ├── history/      # 食事履歴API
│   │   ├── ai/          # AI機能API
│   │   └── users/       # ユーザー管理
│   ├── questions/        # 質問ページ
│   ├── history/         # 履歴ページ
│   ├── profile/         # プロフィールページ
│   ├── page.tsx         # ホームページ
│   └── layout.tsx       # レイアウト
├── features/              # 機能別ビジネスロジック
│   ├── auth/             # 認証機能
│   ├── questions/        # 質問生成・管理
│   └── meals/            # 食事推薦・履歴
├── lib/                  # ライブラリラッパー
│   ├── supabase/        # Supabase設定
│   ├── openai/          # OpenAI設定
│   └── prisma/          # Prisma設定
├── types/               # TypeScript型定義
└── __tests__/          # テストファイル
    ├── unit/           # ユニットテスト
    ├── contract/       # 契約テスト
    └── helpers/        # テストヘルパー
```

### 関数型アーキテクチャ

- **純粋関数**: 副作用のない関数型プログラミング
- **機能単位分離**: `src/features/`配下で完結
- **レイヤー分離**: UI 層、ビジネスロジック層、データ層の明確な分離

## セットアップ

### 前提条件

- **Node.js 18+** または **Bun** (推奨)
- **Supabase アカウント** (PostgreSQL + 認証)
- **OpenAI API キー** (GPT-4 access)

### インストール

1. **リポジトリクローン**

```bash
git clone [repository-url]
cd meal-finder
```

2. **依存関係インストール**

```bash
# Bunを使用（推奨）
bun install

# またはnpm
npm install
```

3. **環境変数設定**

```bash
cp .env.example .env
```

以下の環境変数を設定:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/meal_finder"
DIRECT_URL="postgresql://username:password@localhost:5432/meal_finder"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

# OpenAI
OPENAI_API_KEY="your_openai_api_key"
```

4. **データベースセットアップ**

```bash
# Prisma migration
bun prisma migrate dev
bun prisma generate

# またはnpm
npx prisma migrate dev
npx prisma generate
```

### 開発サーバー起動

```bash
# Bunを使用（推奨）
bun dev

# またはnpm
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認してください。

## テスト実行

### 全テスト実行

```bash
# 全テスト実行
bun test

# ウォッチモード
bun run test:watch

# ユニットテストのみ
bun run test:unit
```

### テスト種別

- **ユニットテスト**: `src/__tests__/unit/` - ビジネスロジック
- **契約テスト**: `src/__tests__/contract/` - API 仕様検証
- **E2E テスト**: `tests/e2e/` - エンドツーエンド
- **パフォーマンステスト**: `tests/performance/` - 性能検証

### Biome（Linting & Formatting）

```bash
# チェック実行
bun run lint

# フォーマット
bun run format
```

## API 仕様

### 主要エンドポイント

#### 質問生成

```
POST /api/ai/generate-question
Content-Type: application/json

{
  "sessionId": "uuid",
  "userProfile": { ... },
  "previousAnswers": [...],
  "timeOfDay": "MORNING|NOON|EVENING"
}
```

#### 食事推薦生成

```
POST /api/ai/generate-recommendation
Content-Type: application/json

{
  "sessionId": "uuid",
  "userProfile": { ... },
  "answers": [...],
  "timeOfDay": "MORNING|NOON|EVENING"
}
```

#### セッション管理

```
POST /api/sessions                              # セッション作成
GET /api/sessions/{sessionId}                   # セッション取得
GET /api/sessions/{sessionId}/questions/next    # 次の質問取得
POST /api/sessions/{sessionId}/answers          # 回答送信
```

#### 食事履歴

```
GET /api/history                                # 履歴一覧取得
GET /api/history/stats                          # 統計情報取得
PUT /api/history/{historyId}/rating             # 評価更新
```

#### ユーザー管理

```
GET /api/users/{userId}/profile                 # プロフィール取得
PUT /api/users/{userId}/profile                 # プロフィール更新
```

詳細な API 仕様は `specs/001-/contracts/api-spec.yaml` を参照してください。

## データベーススキーマ

### 主要エンティティ

- **UserProfile**: ユーザー情報（好み、アレルギー、予算等）
- **QuestionSession**: 質問セッション管理
- **Answer**: ユーザーの回答データ
- **MealRecommendation**: AI 生成の食事推薦
- **MealHistory**: 食事履歴と評価

完全なスキーマは `prisma/schema.prisma` を参照してください。

## パフォーマンス要件

- **API レスポンス**: 最適化済み（2 秒以内目標）
- **フロントエンド**: Next.js 15 + Turbopack で高速化
- **バンドルサイズ**: 最適化済み
- **同時接続**: Supabase + Vercel で高可用性

## 開発ガイドライン

### コーディング規約

- **関数型プログラミング**: class ベースでなく純粋関数を使用
- **TypeScript strict**: 厳密な型チェック
- **ESLint/Prettier**: コード品質保持

### テスト駆動開発 (TDD)

1. 契約テスト作成（API インターフェース）
2. ユニットテスト作成（ビジネスロジック）
3. 実装
4. 統合テスト
5. E2E テスト

### Git ワークフロー

- **main**: 本番環境
- **develop**: 開発環境
- **feature/\***: 機能ブランチ

## デプロイ

### Vercel (推奨)

```bash
npm run build
vercel --prod
```

### 環境変数設定

本番環境でも同様の環境変数設定が必要です。

## 貢献

1. Issue 作成（バグ報告・機能要求）
2. Fork & ブランチ作成
3. 変更実装（TDD 実践）
4. テスト実行・合格確認
5. Pull Request 作成

## ライセンス

MIT License

## サポート

- **ドキュメント**: `specs/001-/` ディレクトリ
- **Issue 報告**: GitHub Issues
- **技術仕様**: `specs/001-/data-model.md`, `contracts/api-spec.yaml`

---
