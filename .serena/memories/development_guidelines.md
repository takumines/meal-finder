# 開発ガイドライン

## アーキテクチャ原則

### 関数型プログラミング
- **純粋関数**: 副作用なし、同じ入力→同じ出力
- **不変性**: データ変更でなく新オブジェクト返却
- **高階関数**: 関数を引数・戻り値として活用
- **関数合成**: 小さな関数を組み合わせて複雑な処理を構築

### レイヤー分離
- **UI層**: React コンポーネント (`src/app/`, `src/features/*/components/`)
- **ビジネスロジック層**: サービス (`src/features/*/services/`)
- **データ層**: API Routes, Prisma, Supabase (`src/app/api/`, `src/lib/`)

### 機能単位設計
- **完結性**: `src/features/`配下で機能完結
- **再利用性**: 共通ロジックは`src/lib/`に配置
- **テスタビリティ**: 各レイヤー独立してテスト可能

## セキュリティ要件
- **認証**: Supabase認証必須
- **認可**: API Routesでセッション検証
- **データ検証**: 入力値検証（フロント・バック両方）
- **機密情報**: 環境変数での管理、ログ出力禁止

## パフォーマンス要件
- **APIレスポンス**: < 2秒
- **初期ページロード**: < 3秒
- **バンドルサイズ**: < 500KB
- **Lighthouse スコア**: 90+ (Performance, Accessibility, Best Practices, SEO)

## 環境変数管理
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

## API設計原則
- **RESTful**: HTTP動詞に応じた処理
- **一貫性**: レスポンス形式統一
- **エラーハンドリング**: 適切なHTTPステータスコード
- **バリデーション**: 入力値検証
- **レート制限**: 過度なリクエスト制御

## UI/UX ガイドライン
- **モバイルファースト**: レスポンシブデザイン
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **ユーザビリティ**: 直感的な操作性
- **パフォーマンス**: 快適な応答性

## データベース設計
- **正規化**: 適切なリレーション設計
- **インデックス**: パフォーマンス最適化
- **制約**: データ整合性確保
- **移行**: Prisma Migrateによるバージョン管理

## ブランチ戦略
- **main**: 本番環境（常にデプロイ可能状態）
- **develop**: 開発環境（統合ブランチ）
- **feature/***: 機能開発ブランチ
- **hotfix/***: 緊急修正ブランチ

## Pull Request ガイドライン
1. **機能単位**: 1つのPRで1つの機能
2. **テスト**: 全テストパス必須
3. **ドキュメント**: 必要に応じて更新
4. **レビュー**: コードレビュー実施
5. **CI/CD**: 自動テスト・デプロイ