# Research: 食事決定アプリ (MealFinder)

**作成日**: 2025-09-13  
**フェーズ**: Phase 0 - 技術調査・意思決定  
**関連文書**: plan.md, spec.md

## 調査の概要

食事決定アプリの実装にあたり、以下の技術的不明点を調査・解決する：

1. AI質問生成サービスの選択と統合方法
2. レストラン情報サービスAPI
3. ユーザー認証サービス
4. Waku + React Server Componentsでの状態管理パターン
5. PWA対応とオフライン機能実装
6. モバイル最適化UI/UXライブラリ

## 技術選択と根拠

### 1. AI質問生成サービス

**決定**: OpenAI GPT-4o mini API + 構造化出力
**根拠**: 
- 構造化されたJSON出力に対応
- 日本語の質問生成に優れた精度
- コスト効率が良い（質問生成は1日数回の使用想定）
- 食事・料理ドメインでの豊富な学習データ

**代替案検討**:
- Anthropic Claude API: 高精度だがコストが高い
- Google Gemini API: 日本語対応は良いが構造化出力の安定性が劣る
- ローカルLLM: レスポンス速度・品質の課題

**統合方法**:
```typescript
interface QuestionRequest {
  userContext: UserProfile;
  previousAnswers: Answer[];
  timeOfDay: TimeSlot;
  location?: Location;
}

interface QuestionResponse {
  question: string;
  category: 'mood' | 'genre' | 'cooking' | 'situation' | 'time';
  options: ['はい', 'いいえ'];
  followUpLogic: ConditionalLogic;
}
```

### 2. レストラン情報サービス

**決定**: ぐるなびAPI + Google Places API（フォールバック）
**根拠**:
- ぐるなび: 日本国内の詳細な店舗情報、営業時間、予約リンク
- Google Places: 世界対応、レビュー情報豊富
- 2段階フォールバック戦略でサービス可用性向上

**代替案検討**:
- 食べログAPI: 利用制限が厳しい
- Yahoo!ローカル: データ量が限定的
- Foursquare: 日本の詳細情報が不足

### 3. ユーザー認証・データベースシステム

**決定**: Supabase (Auth + PostgreSQL)
**根拠**:
- 認証とデータベースが統合されたフルスタックソリューション
- PostgreSQL（高性能・機能豊富）+ Row Level Security（RLS）
- メール認証・ソーシャルログイン標準対応
- リアルタイムサブスクリプション機能
- 無料枠: 50,000 MAU、500MB DB、2GB帯域

**実装方式**:
- 認証: Supabase Auth（メール・パスワード + 将来的にソーシャル）
- データベース: Supabase PostgreSQL（RLS有効）
- フロントエンド: @supabase/supabase-js + React Hook Form
- セキュリティ: RLS + JWT（Supabase管理）+ Rate Limiting
- リアルタイム: Supabase Realtime（質問・履歴の即座同期）

**Supabase機能活用**:
- Auth: メール認証、パスワードリセット、セッション管理
- Database: PostgreSQL with RLS、リアルタイムサブスクリプション
- Storage: ファイルアップロード（将来の画像機能用）
- Edge Functions: サーバーサイドロジック（AI API呼び出し）

**代替案検討**:
- Firebase: 優秀だがNoSQL、コスト高
- PlanetScale: MySQL、リアルタイム機能なし
- 自前実装: 開発コスト・運用負荷大

### 4. 状態管理パターン（Supabase統合）

**決定**: React Server Components + Zustand + Supabase Realtime
**根拠**:
- RSC: サーバーサイドでの初期データフェッチ（Supabaseから）
- Zustand: 軽量、TypeScript親和性、Supabase State同期
- Supabase Realtime: リアルタイムデータ同期（複数デバイス対応）
- オフライン対応: Supabase + LocalStorage ハイブリッド

**データフロー**:
```typescript
// Supabase統合状態管理
interface AppState {
  user: User | null;              // Supabase Auth User
  profile: UserProfile | null;    // Supabase DB
  currentSession: QuestionSession | null; // Supabase DB (リアルタイム)
  history: MealHistory[];         // Supabase DB (リアルタイム)
  offline: boolean;               // オンライン状態
}

// Supabase Realtime Subscription
const useRealtimeSync = () => {
  // 履歴・セッションのリアルタイム同期
  // オフライン時はLocalStorageフォールバック
};
```

**代替案検討**:
- Redux Toolkit: Supabase統合の複雑さ
- TanStack Query: Supabaseクライアントで十分
- SWR: リアルタイム対応が限定的

### 5. PWA対応とオフライン機能（Supabase統合）

**決定**: Workbox + Service Worker + Supabase Offline-first
**根拠**:
- Supabase Local Storage: オフライン時のデータ永続化
- 基本質問セット（20問）のローカルキャッシュ
- Supabase Realtime: ネットワーク復旧時の自動同期
- 競合解決: Supabaseのコンフリクト解決機能活用

**オフライン機能範囲**:
- 基本的な質問フロー（事前キャッシュされた質問セット）
- 過去の履歴参照（Supabaseローカルキャッシュ）
- ユーザー設定変更（同期キューに追加）
- **制限**: AI質問生成は不可（基本質問のみ）

**同期戦略**:
```typescript
// Supabase Offline-first パターン
const useOfflineSync = () => {
  // 1. ローカル操作は即座にUI反映
  // 2. Supabaseに非同期送信（キュー管理）
  // 3. ネットワーク復旧時に一括同期
  // 4. Conflict解決はSupabaseのupsert機能
};
```

### 6. モバイル最適化UI/UX

**決定**: Tailwind CSS + Headless UI + Framer Motion
**根拠**:
- Tailwind: 高度なレスポンシブ対応
- Headless UI: アクセシビリティ標準準拠
- Framer Motion: Tinder風スワイプ・アニメーション

**Tinder風UI実装**:
- スワイプジェスチャー: Yes/No回答
- カードスタック: 質問の視覚的表現
- プログレスインジケーター: 残り質問数

## 外部API統合計画

### API Rate Limiting対策
- OpenAI: リクエストキューイング（1req/sec）
- ぐるなび: バッチ処理（地域別事前キャッシュ）
- Google Places: フォールバック戦略

### エラーハンドリング戦略
1. **Circuit Breaker**: 連続失敗時の自動フォールバック
2. **Retry Logic**: 指数バックオフ
3. **Graceful Degradation**: オフライン機能への切り替え

### セキュリティ対策
- API Key管理: 環境変数 + サーバーサイドプロキシ
- CORS設定: 適切なOrigin制限
- Rate Limiting: クライアント側制限実装

## パフォーマンス最適化

### 目標指標
- **LCP**: < 2.5s（初回読み込み）
- **FID**: < 100ms（インタラクション応答）
- **CLS**: < 0.1（レイアウトシフト）
- **質問応答時間**: < 2s（要件準拠）

### 最適化手法
1. **Code Splitting**: 質問フロー毎の動的import
2. **Image Optimization**: Waku内蔵最適化
3. **Preloading**: 次の質問の事前フェッチ
4. **Caching**: SWR（stale-while-revalidate）パターン

## 開発・テスト環境

### テストフレームワーク
- **Unit**: Vitest + React Testing Library
- **Integration**: Playwright + MSW（API mocking）
- **E2E**: Playwright（実際のブラウザ）

### CI/CD Pipeline
- **Linting**: ESLint + Prettier + TypeScript
- **Testing**: 並列実行（Unit + Integration）
- **Build**: Waku production build
- **Deploy**: Vercel（推定）

## リスク分析と軽減策

### 技術リスク
1. **外部API依存**: 複数プロバイダー + フォールバック
2. **AI応答品質**: プロンプトエンジニアリング + A/Bテスト
3. **モバイル互換性**: デバイステスト自動化

### 事業リスク
1. **API利用コスト**: 使用量監視 + アラート設定
2. **ユーザープライバシー**: GDPR準拠設計
3. **スケーラビリティ**: 段階的機能リリース

## 運用・監視技術選定（監査結果による追加）

### 7. CI/CD・デプロイメント

**決定**: GitHub Actions + Vercel
**根拠**:
- GitHub Actions: リポジトリ統合、無料枠充実
- Vercel: Waku最適化、自動Preview環境
- 段階的デプロイ: development → staging → production

**CI/CDパイプライン構成**:
```yaml
# .github/workflows/ci.yml
- Lint/TypeScript チェック
- 単体・統合テスト実行
- Bundle分析・パフォーマンステスト
- Security scan (Snyk)
- 自動デプロイ（branch別環境）
```

### 8. エラー監視・ログ収集

**決定**: Sentry（エラー監視）+ Vercel Analytics（パフォーマンス）
**根拠**:
- Sentry: React統合優秀、ソースマップ対応、無料枠10k errors/月
- Vercel Analytics: Core Web Vitals自動収集、Vercel統合
- 構造化ログ: 開発環境console、本番環境Sentry

**監視指標**:
- エラー率 < 1%
- API レスポンス時間 < 2秒
- Bundle サイズ < 500KB
- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)

### 9. セキュリティ保護

**決定**: 自前実装 + Snyk（脆弱性スキャン）
**根拠**:
- API Key管理: 環境変数 + Vercel Environment Variables
- Rate Limiting: React Query + custom throttling
- 暗号化: Web Crypto API（ブラウザ標準）
- CSRFプロテクション: SameSite Cookies + CSRF token

**実装詳細**:
```typescript
// セキュリティライブラリ構成
src/lib/security/
├── api-key-manager.ts     // API Key ローテーション
├── rate-limiter.ts        // クライアント制限
├── encryption.ts          // LocalStorage暗号化
└── sanitizer.ts          // 入力値サニタイズ
```

### 10. データバックアップ・同期

**決定**: IndexedDB + 差分同期アルゴリズム
**根拠**:
- オフライン対応: IndexedDB（大容量対応）
- 同期競合: Vector Clock + Last-Write-Wins
- バックアップ: Vercel KV（Redis）定期エクスポート

**同期戦略**:
```typescript
interface SyncRecord {
  id: string;
  version: number;
  lastModified: Date;
  deviceId: string;
  data: any;
}
```

## 運用手順書（新規追加項目）

### A. デプロイメント手順
1. **Feature branch → Development**: 自動デプロイ
2. **Development → Staging**: PR approval必須
3. **Staging → Production**: Manual approval + 負荷テスト
4. **Rollback**: Vercel instant rollback + データ復旧

### B. 障害対応手順
1. **監視アラート**: Sentry Slack通知
2. **初期対応**: エラー率・パフォーマンス確認
3. **緊急対応**: API制限・機能無効化
4. **事後対応**: Root cause分析・再発防止

### C. 定期メンテナンス
- **週次**: 依存関係更新・セキュリティスキャン
- **月次**: パフォーマンス分析・最適化
- **四半期**: ユーザーフィードバック分析・機能改善

## 次のフェーズへの引き継ぎ

**Phase 1準備完了項目**:
- ✅ 全ての技術スタック決定完了
- ✅ 外部API仕様とレート制限確認済み
- ✅ パフォーマンス目標設定済み
- ✅ セキュリティ要件整理済み
- ✅ 運用・監視戦略決定済み（新規追加）

**Phase 1で作成するアーティファクト**:
1. `data-model.md`: エンティティとリレーション定義
2. `contracts/`: API仕様（OpenAPI）
3. `quickstart.md`: 開発環境セットアップ手順
4. `deployment.md`: 運用・デプロイ手順書（新規追加）
5. `security.md`: セキュリティ実装詳細（新規追加）

**残存する技術的判断**:
- なし（全てのNEEDS CLARIFICATIONが解決済み）

## 初期フェーズ重視の技術判断（仕様変更対応）

### MVP最優先項目
1. **メールアドレス・パスワード認証システム**（自前実装）
2. **基本的な質問フロー**（固定ロジック、学習なし）  
3. **単一料理推薦**（アクションオプションは将来実装）
4. **基本履歴記録**（分析・優先度調整は将来実装）

### 段階的実装計画
- **Phase 1 (MVP)**: 認証・質問・推薦・基本履歴
- **Phase 2 (機能拡張)**: アクションオプション（レストラン検索・レシピ・デリバリー）
- **Phase 3 (AI強化)**: 学習機能（履歴分析・質問精度向上）
- **Phase 4 (認証強化)**: ソーシャルログイン・2FA

### 技術選定の簡略化（Supabase統合）
- 外部レストラン情報API → **将来実装**
- 認証システム → **Supabase Auth（初期から強力）**
- データベース → **Supabase PostgreSQL（初期から本格的）**
- 複雑な学習アルゴリズム → **固定ロジック（初期）**
- マルチアクション → **単一推薦（初期）**
- リアルタイム同期 → **Supabase Realtime（初期から対応）**