# MealFinder (食事決定アプリ)

## 概要

MealFinderは、ユーザーの好みと状況に基づいてAIが最適な食事を推薦するNext.js 15アプリケーションです。質問ベースのインタラクティブな体験を通じて、パーソナライズされた食事提案を提供します。

## 主要機能

- 🤖 **AI駆動の質問生成**: OpenAI GPT-4を使用した動的質問システム
- 🍽️ **パーソナライズされた食事推薦**: ユーザーの好み、アレルギー、予算に基づく推薦
- 📱 **レスポンシブUI**: モバイルファーストデザイン（Tailwind CSS）
- 🔐 **認証システム**: Supabase認証統合
- 📊 **食事履歴管理**: 過去の推薦と評価の追跡
- ⚡ **高パフォーマンス**: 2秒以内のAPIレスポンス

## 技術スタック

### フロントエンド
- **Next.js 15** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** (スタイリング)
- **関数型プログラミング** (純粋関数アーキテクチャ)

### バックエンド
- **Next.js API Routes** (App Router)
- **Supabase** (PostgreSQL Database)
- **Prisma ORM** (データベースアクセス)
- **OpenAI API** (GPT-4 for AI機能)

### 開発・テスト
- **TypeScript** (型安全性)
- **Vitest** (テストフレームワーク)
- **React Testing Library** (コンポーネントテスト)
- **ESLint & Prettier** (コード品質)

## アーキテクチャ

### ディレクトリ構成

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API route handlers
│   ├── page.tsx           # Pages
│   └── layout.tsx         # Layout components
├── features/              # 機能別ビジネスロジック
│   ├── auth/             # 認証機能
│   ├── questions/        # 質問生成・管理
│   └── meals/            # 食事推薦・履歴
├── components/           # 共通UIコンポーネント
├── lib/                  # ライブラリラッパー
│   ├── supabase/        # Supabase設定
│   ├── openai/          # OpenAI設定
│   └── prisma/          # Prisma設定
├── types/               # TypeScript型定義
└── __tests__/          # テストファイル
    ├── unit/           # ユニットテスト
    ├── contract/       # 契約テスト
    └── e2e/           # E2Eテスト
```

### 関数型アーキテクチャ

- **純粋関数**: 副作用のない関数型プログラミング
- **機能単位分離**: `src/features/`配下で完結
- **レイヤー分離**: UI層、ビジネスロジック層、データ層の明確な分離

## セットアップ

### 前提条件

- Node.js 18+ または Bun
- PostgreSQL (Supabaseアカウント推奨)
- OpenAI APIキー

### インストール

1. **リポジトリクローン**
```bash
git clone [repository-url]
cd meal-finder
```

2. **依存関係インストール**
```bash
npm install
# または
bun install
```

3. **環境変数設定**
```bash
cp .env.example .env.local
```

以下の環境変数を設定:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Database
DATABASE_URL=your_postgresql_connection_string
```

4. **データベースセットアップ**
```bash
npx prisma migrate dev
npx prisma generate
```

### 開発サーバー起動

```bash
npm run dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認してください。

## テスト実行

### 全テスト実行
```bash
npm test
# または
bun test
```

### テスト種別
- **ユニットテスト**: `src/__tests__/unit/`
- **契約テスト**: `src/__tests__/contract/`
- **E2Eテスト**: `tests/e2e/`
- **パフォーマンステスト**: `tests/performance/`

### テストカバレッジ確認
```bash
npm run test:coverage
```

## API仕様

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
POST /api/sessions
GET /api/sessions/{sessionId}
GET /api/sessions/{sessionId}/questions/next
POST /api/sessions/{sessionId}/answers
```

詳細なAPI仕様は `specs/001-/contracts/api-spec.yaml` を参照してください。

## データベーススキーマ

### 主要エンティティ

- **UserProfile**: ユーザー情報（好み、アレルギー、予算等）
- **QuestionSession**: 質問セッション管理
- **Answer**: ユーザーの回答データ
- **MealRecommendation**: AI生成の食事推薦
- **MealHistory**: 食事履歴と評価

完全なスキーマは `prisma/schema.prisma` を参照してください。

## パフォーマンス要件

- **APIレスポンス**: < 2秒
- **Lighthouse スコア**: 90+
- **バンドルサイズ**: < 500KB
- **同時接続**: 100ユーザー対応

## 開発ガイドライン

### コーディング規約
- **関数型プログラミング**: classベースでなく純粋関数を使用
- **TypeScript strict**: 厳密な型チェック
- **ESLint/Prettier**: コード品質保持

### テスト駆動開発 (TDD)
1. 契約テスト作成（APIインターフェース）
2. ユニットテスト作成（ビジネスロジック）
3. 実装
4. 統合テスト
5. E2Eテスト

### Git ワークフロー
- **main**: 本番環境
- **develop**: 開発環境
- **feature/***: 機能ブランチ

## デプロイ

### Vercel (推奨)
```bash
npm run build
vercel --prod
```

### 環境変数設定
本番環境でも同様の環境変数設定が必要です。

## 貢献

1. Issue作成（バグ報告・機能要求）
2. Fork & ブランチ作成
3. 変更実装（TDD実践）
4. テスト実行・合格確認
5. Pull Request作成

## ライセンス

MIT License

## サポート

- **ドキュメント**: `specs/001-/` ディレクトリ
- **Issue報告**: GitHub Issues
- **技術仕様**: `specs/001-/data-model.md`, `contracts/api-spec.yaml`

---

## 開発ステータス

✅ **Phase 3.1-3.3**: セットアップ・Contract Tests・データベーススキーマ  
✅ **Phase 3.4-3.5**: ビジネスロジック・API Routes  
✅ **Phase 3.6-3.7**: 統合テスト・React Components  
✅ **Phase 3.8**: Next.js Pages & Layout  
✅ **Phase 3.9**: ユニットテスト・E2E・パフォーマンステスト

**現在**: すべての基本機能実装完了、本格運用準備完了