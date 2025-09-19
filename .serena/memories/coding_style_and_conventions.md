# コーディングスタイルと規約

## 基本原則
- **関数型プログラミング**: classベースでなく純粋関数を使用
- **TypeScript strict**: 厳密な型チェック有効
- **2秒以内のAPIレスポンス**: パフォーマンス重視

## フォーマッティング設定 (Biome)
- **インデント**: スペース2つ
- **改行**: LF
- **セミコロン**: 必須
- **クォート**: ダブルクォート推奨
- **行幅**: 100文字（JSON）
- **import整理**: 自動整理有効

## TypeScript設定
- **strict mode**: 有効
- **target**: ES2017
- **module**: esnext
- **jsx**: preserve (Next.js用)
- **isolatedModules**: true
- **noEmit**: true

## 命名規約
- **ファイル名**: kebab-case (`recommendation-service.ts`)
- **関数・変数**: camelCase (`generateRecommendation`)
- **型・インターフェース**: PascalCase (`RecommendationRequest`)
- **定数**: UPPER_SNAKE_CASE (`BASE_CALORIES`)
- **コンポーネント**: PascalCase (`QuestionFlow`)

## ディレクトリ・ファイル構造
- **機能単位分離**: `src/features/`配下で完結
- **コンポーネント**: `components/`サブディレクトリ
- **サービス**: `services/`サブディレクトリ
- **API Routes**: Next.js App Router形式

## 関数型プログラミング原則
- **純粋関数**: 副作用なし、同じ入力に対して同じ出力
- **不変性**: データの変更ではなく新しいオブジェクトを返す
- **高階関数**: 関数を引数や戻り値として使用
- **関数合成**: 小さな関数を組み合わせて複雑な処理を構築

## エラーハンドリング
- **型安全**: TypeScriptの型システムを活用
- **明示的**: エラーケースを明示的に処理
- **一貫性**: アプリケーション全体で一貫したエラー処理

## パフォーマンス
- **レスポンス時間**: APIレスポンス < 2秒
- **バンドルサイズ**: < 500KB
- **Lighthouse スコア**: 90+
- **同時接続**: 100ユーザー対応