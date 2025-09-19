# クイックスタート: 食事決定アプリ (何食べる？)

**作成日**: 2025-09-13  
**フェーズ**: Phase 1 - 開発環境セットアップ  
**前提条件**: macOS, Node.js 18+, Git

## 概要

このドキュメントは、何食べる？ アプリの開発環境を10分以内でセットアップし、基本的な開発フローを理解するためのガイドです。

## 🚀 5分間セットアップ

### 1. リポジトリクローンと依存関係インストール

```bash
# リポジトリクローン（既存の場合はスキップ）
git clone <repository-url>
cd nantaberu

# 依存関係インストール（Bunを使用）
bun install

# 開発サーバー起動
bun dev
```

### 2. 環境変数設定

```bash
# 環境変数ファイル作成
cp .env.example .env.local

# 必要なAPI Keyを設定（開発用のダミー値も利用可能）
# .env.local を編集:
OPENAI_API_KEY=sk-xxx  # OpenAI API Key
AUTH0_DOMAIN=xxx.auth0.com
AUTH0_CLIENT_ID=xxx
AUTH0_CLIENT_SECRET=xxx
GURUNAVI_API_KEY=xxx
GOOGLE_PLACES_API_KEY=xxx
```

### 3. 開発環境確認

```bash
# ブラウザで http://localhost:3000 を開く
# 以下が表示されることを確認:
# - 何食べる？ ホームページ
# - "新しい質問を開始" ボタン
# - ユーザープロファイル設定リンク
```

## 🧪 テスト実行

### 単体テスト
```bash
# 全テスト実行
bun test

# ウォッチモード（開発中推奨）
bun test --watch

# 特定のテストファイル
bun test src/lib/meal-finder-core.test.ts
```

### 統合テスト
```bash
# API統合テスト
bun test:integration

# E2Eテスト（Playwright）
bun test:e2e

# E2Eテスト（ヘッドレスモード）
bun test:e2e:headless
```

### テストカバレッジ
```bash
# カバレッジレポート生成
bun test:coverage

# カバレッジ結果をブラウザで表示
open coverage/index.html
```

## 🏗️ プロジェクト構造

```
nantaberu/
├── src/
│   ├── components/          # Reactコンポーネント
│   │   ├── ui/             # 基本UIコンポーネント
│   │   ├── questions/      # 質問関連コンポーネント
│   │   └── recommendations/ # 推薦結果コンポーネント
│   ├── lib/                # ビジネスロジックライブラリ
│   │   ├── meal-finder-core/   # 質問ロジック
│   │   ├── meal-history/       # 履歴管理
│   │   └── meal-recommendation/ # 推薦エンジン
│   ├── pages/              # Wakuページ
│   ├── hooks/              # カスタムReactフック
│   ├── stores/             # Zustand状態管理
│   ├── types/              # TypeScript型定義
│   └── utils/              # ユーティリティ関数
├── tests/
│   ├── unit/               # 単体テスト
│   ├── integration/        # 統合テスト
│   └── e2e/               # E2Eテスト
├── specs/                  # 機能仕様・設計文書
└── public/                # 静的ファイル
```

## 🔄 開発フロー

### 1. 機能開発の基本サイクル

```bash
# 1. フィーチャーブランチ作成
git checkout -b feature/question-flow

# 2. テスト先行開発（TDD）
# tests/unit/question-flow.test.ts を作成
bun test --watch

# 3. テストが失敗することを確認（RED）
# 4. 最小限の実装でテストを通す（GREEN）
# 5. リファクタリング（REFACTOR）

# 6. 統合テスト実行
bun test:integration

# 7. E2Eテスト実行
bun test:e2e

# 8. コミット
git add .
git commit -m "feat: Add question flow logic"
```

### 2. ライブラリ開発パターン

```bash
# 新しいライブラリ作成例
mkdir src/lib/my-feature
cd src/lib/my-feature

# ライブラリの基本構造
touch index.ts           # エクスポート
touch my-feature.ts      # メイン実装
touch my-feature.test.ts # テスト
touch cli.ts            # CLI インターフェース
touch README.md         # ドキュメント

# CLI対応確認
bun build src/lib/my-feature/cli.ts --outdir dist
node dist/cli.js --help
```

## 🎯 主要な開発タスク

### A. 質問生成システム

```typescript
// src/lib/meal-finder-core/question-generator.ts
export class QuestionGenerator {
  async generateNext(context: QuestionContext): Promise<Question> {
    // OpenAI API呼び出し
    // 質問ロジック実装
  }
}

// 対応するテスト
// tests/unit/question-generator.test.ts
describe('QuestionGenerator', () => {
  it('should generate contextual questions', async () => {
    // テスト実装
  });
});
```

### B. 推薦エンジン

```typescript
// src/lib/meal-recommendation/recommendation-engine.ts
export class RecommendationEngine {
  recommend(answers: Answer[]): MealRecommendation {
    // 推薦ロジック実装
  }
}
```

### C. 履歴管理

```typescript
// src/lib/meal-history/history-manager.ts
export class HistoryManager {
  async saveHistory(meal: MealHistory): Promise<void> {
    // LocalStorage + IndexedDB操作
  }
}
```

## 🔧 便利なコマンド

### 開発ツール
```bash
# TypeScript型チェック
bun type-check

# Linting
bun lint
bun lint:fix

# フォーマット
bun format

# Bundle分析
bun analyze

# パフォーマンス計測
bun perf
```

### デバッグ
```bash
# デバッグモードで起動
DEBUG=* bun dev

# 特定のモジュールのみデバッグ
DEBUG=meal-finder:* bun dev

# React Developer Tools使用
# Chrome拡張機能をインストール後、開発サーバーでデバッグ可能
```

## 🚧 よくある問題と解決法

### 1. 依存関係の問題
```bash
# node_modules とlock fileクリア
rm -rf node_modules bun.lockb
bun install
```

### 2. TypeScript型エラー
```bash
# 型定義再生成
bun type-check --noEmit
# src/types/ の型定義を確認・修正
```

### 3. テスト失敗
```bash
# キャッシュクリア
bun test --clearCache

# テストファイルを単体実行
bun test src/lib/meal-finder-core.test.ts --verbose
```

### 4. API Key設定
```bash
# 環境変数確認
echo $OPENAI_API_KEY

# .env.local ファイルの存在確認
ls -la .env*

# 開発用ダミー値を使用（外部API呼び出しをmock）
cp .env.development .env.local
```

## 📖 次のステップ

### 学習リソース
1. **Waku フレームワーク**: [Waku Documentation](https://waku.gg/)
2. **React Server Components**: [React 19 RSC Guide](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
3. **Zustand状態管理**: [Zustand GitHub](https://github.com/pmndrs/zustand)
4. **Tailwind CSS**: [Tailwind Documentation](https://tailwindcss.com/)

### 開発の優先順位
1. **Phase 1**: ユーザープロファイル設定UI
2. **Phase 2**: 基本的な質問フロー実装
3. **Phase 3**: AI質問生成統合
4. **Phase 4**: 料理推薦・アクションオプション
5. **Phase 5**: 履歴管理・学習機能

### チーム連携
- **コードレビュー**: PR作成時は必ずテスト通過確認
- **設計相談**: 重要な技術判断は `specs/` に文書化
- **進捗共有**: 毎日の進捗を GitHub Issues で管理

## ⚡ パフォーマンス目標

開発中は以下の指標を継続的に監視：

- **開発サーバー起動**: < 3秒
- **テスト実行時間**: < 30秒（全テストスイート）
- **TypeScript型チェック**: < 10秒
- **Bundle サイズ**: < 500KB（gzip）
- **ページ読み込み**: < 2秒（LCP）

```bash
# パフォーマンス計測
bun run lighthouse
bun run bundle-analyzer
```

これで何食べる？アプリの開発をスムーズに開始できます！ 🎉