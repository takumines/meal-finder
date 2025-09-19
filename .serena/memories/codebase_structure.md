# コードベース構造

## ディレクトリ構成

```
src/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API route handlers
│   │   ├── ai/           # AI関連API (質問生成、推薦生成)
│   │   ├── sessions/     # セッション管理API
│   │   └── users/        # ユーザー管理API
│   ├── questions/        # 質問ページ
│   ├── history/          # 履歴ページ
│   ├── profile/          # プロフィールページ
│   ├── page.tsx          # ホームページ
│   └── layout.tsx        # レイアウトコンポーネント
├── features/              # 機能別ビジネスロジック
│   ├── auth/             # 認証機能
│   │   └── components/   # 認証コンポーネント
│   ├── questions/        # 質問生成・管理
│   │   ├── components/   # 質問関連コンポーネント
│   │   └── services/     # 質問サービスロジック
│   └── meals/            # 食事推薦・履歴
│       ├── components/   # 食事関連コンポーネント
│       └── services/     # 推薦・履歴サービスロジック
├── lib/                  # ライブラリラッパー
│   ├── supabase/        # Supabase設定・認証
│   ├── openai/          # OpenAI設定
│   └── prisma/          # Prisma設定
├── types/               # TypeScript型定義
│   ├── index.ts         # 共通型定義
│   └── database.ts      # データベース型定義
└── __tests__/          # テストファイル
    ├── unit/           # ユニットテスト
    ├── contract/       # 契約テスト (API)
    ├── helpers/        # テストヘルパー
    └── setup.ts        # テストセットアップ
```

## 主要ファイル・設定
- `package.json`: プロジェクト設定とスクリプト
- `tsconfig.json`: TypeScript設定（strict mode有効）
- `biome.json`: リンティング・フォーマッティング設定
- `vite.config.ts`: Vitestテスト設定
- `next.config.ts`: Next.js設定
- `prisma/schema.prisma`: データベーススキーマ
- `.env.local`: 環境変数（開発用）

## パス設定
TypeScriptパスエイリアス:
- `@/*`: `./src/*`
- `@/features/*`: `./src/features/*`
- `@/lib/*`: `./src/lib/*`
- `@/components/*`: `./src/components/*`
- `@/types/*`: `./src/types/*`