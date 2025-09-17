# ディレクトリ構造 - 食事決定アプリ (MealFinder)

**機能ブランチ**: `001-`  
**作成日**: 2025-09-13  
**関数型プログラミング**: 適用済み

## アーキテクチャ設計原則

### ディレクトリ構造とビジネスロジック分離

1. **ルーティングファイルの責務**: 画面ルーティング (`page.tsx`) とAPIルーティング (`route.ts`) はビジネスロジックを含まない
2. **機能単位管理**: `src/features` でビジネスロジック・UIコンポーネントを機能単位に分離
3. **共通コンポーネント**: `src/components` で再利用可能なコンポーネントを管理
4. **ライブラリラッパー**: `src/lib` でサードパーティライブラリをラップして使用
5. **関数型アプローチ**: classベースではなく純粋関数による実装

## プロジェクト構造

```
project/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # ルートレイアウト (ビジネスロジック無し)
│   ├── page.tsx                 # ホーム画面 (UIレンダリングのみ)
│   ├── login/
│   │   └── page.tsx             # ログイン画面 (UIレンダリングのみ)
│   ├── register/
│   │   └── page.tsx             # 登録画面 (UIレンダリングのみ)
│   ├── profile/
│   │   └── page.tsx             # プロファイル画面 (UIレンダリングのみ)
│   ├── questions/
│   │   └── page.tsx             # 質問画面 (UIレンダリングのみ)
│   ├── results/
│   │   └── page.tsx             # 結果画面 (UIレンダリングのみ)
│   └── api/                     # Route Handlers (ビジネスロジック無し)
│       ├── auth/
│       ├── user/
│       ├── ai/
│       └── meals/
├── src/
│   ├── components/              # 共通UIコンポーネント
│   │   ├── ui/                  # 基本UIコンポーネント
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── modal.tsx
│   │   │   └── loading.tsx
│   │   ├── layout/              # レイアウトコンポーネント
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── sidebar.tsx
│   │   └── forms/               # 共通フォームコンポーネント
│   │       ├── auth-form.tsx
│   │       └── preference-form.tsx
│   ├── features/                # 機能単位のビジネスロジック・UI
│   │   ├── auth/
│   │   │   ├── components/      # 認証関連コンポーネント
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   └── auth-guard.tsx
│   │   │   ├── hooks/           # 認証関連カスタムフック
│   │   │   │   ├── use-auth.ts
│   │   │   │   └── use-login.ts
│   │   │   ├── services/        # 認証ビジネスロジック (関数型)
│   │   │   │   ├── auth-service.ts
│   │   │   │   └── validation.ts
│   │   │   └── types/           # 認証関連型定義
│   │   │       └── auth.types.ts
│   │   ├── questions/
│   │   │   ├── components/      # 質問関連コンポーネント
│   │   │   │   ├── question-card.tsx
│   │   │   │   ├── answer-buttons.tsx
│   │   │   │   └── progress-bar.tsx
│   │   │   ├── hooks/           # 質問関連カスタムフック
│   │   │   │   ├── use-questions.ts
│   │   │   │   └── use-answers.ts
│   │   │   ├── services/        # 質問ビジネスロジック (関数型)
│   │   │   │   ├── question-service.ts
│   │   │   │   ├── answer-logic.ts
│   │   │   │   └── ai-question-generator.ts
│   │   │   └── types/
│   │   │       └── questions.types.ts
│   │   ├── meals/
│   │   │   ├── components/
│   │   │   │   ├── meal-card.tsx
│   │   │   │   ├── meal-suggestions.tsx
│   │   │   │   └── meal-history.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── use-meals.ts
│   │   │   │   └── use-meal-history.ts
│   │   │   ├── services/        # 食事ビジネスロジック (関数型)
│   │   │   │   ├── meal-service.ts
│   │   │   │   └── suggestion-engine.ts
│   │   │   └── types/
│   │   │       └── meals.types.ts
│   │   └── user-profile/
│   │       ├── components/
│   │       │   ├── profile-form.tsx
│   │       │   └── preferences-form.tsx
│   │       ├── hooks/
│   │       │   └── use-profile.ts
│   │       ├── services/        # プロファイルビジネスロジック (関数型)
│   │       │   └── profile-service.ts
│   │       └── types/
│   │           └── profile.types.ts
│   ├── lib/                     # サードパーティライブラリラッパー (関数型)
│   │   ├── prisma/
│   │   │   ├── client.ts        # Prismaクライアント設定
│   │   │   ├── schema.prisma    # Prismaスキーマ定義
│   │   │   └── seed.ts          # 初期データシード
│   │   ├── supabase/
│   │   │   ├── client.ts        # Supabaseクライアントラッパー
│   │   │   ├── server.ts        # Supabaseサーバークライアント
│   │   │   └── auth.ts          # 認証ヘルパー
│   │   ├── openai/
│   │   │   ├── client.ts        # OpenAIクライアントラッパー (関数型)
│   │   │   ├── prompts.ts       # プロンプトテンプレート
│   │   │   └── types.ts         # OpenAI関連型定義
│   │   ├── utils/               # 汎用ユーティリティ
│   │   │   ├── validation.ts    # バリデーション関数
│   │   │   ├── api.ts          # API呼び出しヘルパー
│   │   │   ├── format.ts       # フォーマット関数
│   │   │   ├── functional.ts   # 関数型プログラミングユーティリティ
│   │   │   └── constants.ts    # 定数定義
│   │   └── types/              # グローバル型定義
│   │       ├── api.types.ts
│   │       └── common.types.ts
│   └── styles/                 # スタイル関連
│       ├── globals.css
│       └── components.css
└── public/                     # 静的ファイル
    ├── images/
    └── icons/
```

## ルーティング設計

### 画面ルーティング (App Router)

```
app/
├── layout.tsx                    # ルートレイアウト
├── page.tsx                      # ホームページ
├── login/
│   └── page.tsx                  # ログインページ
├── register/
│   └── page.tsx                  # 登録ページ
├── profile/
│   └── page.tsx                  # プロファイル設定
├── questions/
│   └── page.tsx                  # 質問フロー画面
└── results/
    └── page.tsx                  # 結果表示画面
```

### APIルーティング (Route Handlers)

```
app/api/
├── auth/
│   ├── login/
│   │   └── route.ts              # POST /api/auth/login
│   ├── register/
│   │   └── route.ts              # POST /api/auth/register
│   └── logout/
│       └── route.ts              # POST /api/auth/logout
├── user/
│   ├── profile/
│   │   └── route.ts              # GET/PUT /api/user/profile
│   └── preferences/
│       └── route.ts              # GET/PUT /api/user/preferences
├── ai/
│   ├── questions/
│   │   └── route.ts              # POST /api/ai/questions
│   └── suggestions/
│       └── route.ts              # POST /api/ai/suggestions
└── meals/
    ├── history/
    │   └── route.ts              # GET/POST /api/meals/history
    └── favorites/
        └── route.ts              # GET/POST/DELETE /api/meals/favorites
```

## ディレクトリ設計のメリット

### 1. 責務の明確な分離
- **Routeファイル**: リクエスト・レスポンス処理のみ
- **Serviceレイヤー**: 純粋関数によるビジネスロジック実装
- **Libレイヤー**: 外部ライブラリの関数型ラッパー
- **Featureディレクトリ**: 機能単位の凝集性

### 2. 関数型プログラミングの利点
- **純粋関数**: 副作用のない予測可能な関数
- **不変性**: データの変更ではなく新しいデータ生成
- **高階関数**: 関数を引数や戻り値とする柔軟な設計
- **合成性**: 小さな関数を組み合わせた複雑な処理

### 3. 保守性・拡張性
- 機能追加時の影響範囲の最小化
- 関数の組み合わせによる柔軟な実装
- 外部ライブラリ変更時の影響局所化
- 不変データによるバグの削減

### 4. テスタビリティの向上
- 純粋関数により単体テストが容易
- 依存性注入による外部依存関係の分離
- モック不要な関数単位テスト
- 状態管理のReducerパターンによる予測可能性

### 5. チーム開発効率
- 機能単位での開発分担可能
- 関数型アプローチによる理解しやすいコード
- 新規メンバーの理解促進
- デバッグの容易性