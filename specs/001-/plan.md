# Implementation Plan: 食事決定アプリ (MealFinder)

**Branch**: `001-` | **Date**: 2025-09-13 | **Spec**: `/Users/takumines/dev/React/nantaberu/specs/001-/spec.md`
**Input**: Feature specification from `/Users/takumines/dev/React/nantaberu/specs/001-/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary（初期フェーズMVP重視）

**主要要件**: アキネーター形式のYes/No質問で食べたいものを効率的に見つける食事決定アプリ。ユーザー登録必須、最大10問の質問でユーザーの好みを特定し、具体的な料理を推薦。Tinder風UIで直感的な操作を提供。

**技術アプローチ（Supabase統合）**: 
- **認証・DB**: Supabase (Auth + PostgreSQL + Realtime)
- **フロントエンド**: React 19.1.1 + Waku (RSC) + TypeScript + Tailwind CSS
- **状態管理**: Zustand + Supabase Realtime（リアルタイム同期）
- **外部API統合**: OpenAI GPT-4o mini（質問生成・推薦）+ Supabase Edge Functions
- **アーキテクチャ**: ライブラリファーストアプローチ（supabase-client, meal-finder-core, meal-history）
- **セキュリティ**: Row Level Security (RLS) + Supabase JWT
- **テスト**: TDD（Contract → Integration → E2E → Unit順序）
- **パフォーマンス**: 2秒以内レスポンス、80%以上の10問内解決率、リアルタイム同期

**将来フェーズ**:
- アクションオプション（レストラン検索・レシピ・デリバリー）
- 学習機能（履歴分析・質問精度向上）
- ソーシャルログイン・2FA認証

## Technical Context
**Language/Version**: TypeScript 5.9.2, React 19.1.1, Node.js ESNext  
**Primary Dependencies**: Waku 0.26.0 (React SSR/SSG), Tailwind CSS 4.1.12, React Server Components  
**Storage**: LocalStorage (ユーザー設定・履歴), 外部API (AI質問生成・レストラン情報・認証)  
**Testing**: Vitest (推定), React Testing Library (推定), E2Eテスト (Playwright推定)  
**Target Platform**: モバイルWeb (iOS/Android Safari, Chrome), PWA対応  
**Project Type**: web - フロントエンドのみ (外部API連携)  
**Performance Goals**: 質問表示から回答完了まで2秒以内レスポンス、10問以内80%解決率  
**Constraints**: オフライン時基本機能提供、モバイル最適化UI/UX、5回No制限  
**Scale/Scope**: 個人ユーザー向け、10問質問システム、3アクションオプション

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (フロントエンドWebアプリのみ) ✅
- Using framework directly? (React/Waku直接利用、wrapper classes不要) ✅
- Single data model? (統一されたユーザー・質問・料理・履歴モデル) ✅
- Avoiding patterns? (Repository/UoW不要、単純なState管理) ✅

**Architecture**:
- EVERY feature as library? (質問生成・料理推薦・履歴管理をライブラリ化) ✅
- Libraries listed: [meal-finder-core (質問ロジック), meal-history (履歴管理), meal-recommendation (推薦エンジン)]
- CLI per library: [dev用のcliコマンド --help/--version/--format対応] ✅
- Library docs: llms.txt format planned? ✅

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? (テスト先行開発必須) ✅
- Git commits show tests before implementation? ✅
- Order: Contract→Integration→E2E→Unit strictly followed? ✅
- Real dependencies used? (LocalStorage、実際の外部API) ✅
- Integration tests for: 外部API連携、質問フロー、履歴保存 ✅
- FORBIDDEN: Implementation before test, skipping RED phase ✅

**Observability**:
- Structured logging included? (ユーザーアクション・エラー・パフォーマンス) ✅
- Frontend logs → backend? (外部ログサービス連携予定) ⚠️
- Error context sufficient? (エラー原因・ユーザーコンテキスト記録) ✅

**Versioning**:
- Version number assigned? (0.1.0から開始、MAJOR.MINOR.BUILD) ✅
- BUILD increments on every change? ✅
- Breaking changes handled? (API変更時のmigration plan) ✅

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: [DEFAULT to Option 1 unless Technical Context indicates web/mobile app]

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/bash/update-agent-context.sh claude` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy** (初期フェーズMVP重視):
0. **Infrastructure & Security Foundation** (P0 - Critical Missing Items):
   - GitHub Actions CI/CD パイプライン構築 [P]
   - Sentry エラー監視統合 [P] 
   - 環境変数・API Key 保護実装 [P]
   - Rate Limiting クライアント実装 [P]
   - LocalStorage暗号化ライブラリ [P]
   - XSS/CSRFプロテクション実装 [P]

1. **Supabase Integration Tests** (認証・DB・リアルタイム):
   - Supabase Auth integration (signUp, signIn, signOut) [P]
   - RLS policies validation (user_profiles, question_sessions, meal_history) [P]
   - Supabase Realtime subscription tests [P]
   - Database migration + seed data setup [P]

2. **Contract Tests** (from `/contracts/api-spec.yaml` - カスタムAPIのみ):
   - `/api/ai/generate-question` → AI質問生成 test [P]
   - `/api/ai/generate-recommendation` → AI推薦生成 test [P]
   
3. **Supabase Client Operations Tests**:
   - user_profiles CRUD operations with RLS [P]
   - question_sessions CRUD operations with RLS [P]
   - answers CRUD operations with RLS [P]
   - meal_recommendations CRUD operations with RLS [P]
   - meal_history CRUD operations with RLS [P]

4. **Integration Tests** (Supabase統合フロー):
   - Supabase Auth → プロファイル作成 → 初回質問フロー
   - 質問セッション → リアルタイム同期 → 回答記録フロー
   - 推薦生成 → 履歴保存 → リアルタイム更新フロー
   - オフライン → オンライン復旧 → データ同期フロー
   - 複数デバイス → リアルタイム同期フロー

5. **Library Implementation Tasks** (Supabase統合):
   - `supabase-client` library (認証・DB・Realtime wrapper)
   - `meal-finder-core` library (AI質問生成・推薦ロジック)
   - `meal-history` library (Supabase履歴管理・同期)
   - `offline-sync` library (オフライン対応・競合解決)

6. **UI Component Implementation** (Supabase統合):
   - AuthProvider component (Supabase Auth Context)
   - RealtimeProvider component (Supabase Realtime Context)
   - UserProfile component (Supabase CRUD操作)
   - QuestionFlow component (Supabase session管理)
   - RecommendationResult component (Supabase履歴連携)
   - HistoryList component (Supabaseリアルタイム更新)

**Ordering Strategy** (Supabase統合対応):
- **Phase A**: Infrastructure & Security Foundation (P0 Critical Items)
- **Phase B**: Supabase Setup → Database Migration → RLS Policies (基盤)
- **Phase C**: Supabase Client Library → Core Business Logic (TDD Red phase)
- **Phase D**: AI API Integration → Custom Endpoints (TDD Green phase)
- **Phase E**: UI Components → Realtime Integration (TDD Refactor phase)
- **Phase F**: E2E tests → Performance optimization → Release preparation
- [P] marker for parallel execution within phases

**Dependency Chain** (Supabase統合):
```
Infrastructure → Supabase Setup → RLS Policies → Supabase Client → AI APIs → UI Components → E2E → Operations
       ↓            ↓               ↓              ↓            ↓         ↓            ↓      ↓
    CI/CD      DB Migration    Auth Tests    Client Tests  API Tests  Component Tests  Tests  Monitoring
```

**Supabase特有の追加フェーズ**:
- Database Schema Migration
- Row Level Security Policy設定
- Supabase Realtime Subscription設定
- Edge Functions デプロイ（AI API用）

**Critical Addition - Operations & Monitoring Tasks**:
6. **Operations & Monitoring** (P1 - High Priority):
   - Lighthouse CI パフォーマンス監視 [P]
   - Google Analytics 4 統合 [P]
   - API使用量監視ダッシュボード [P]
   - オフライン同期競合解決ロジック
   - データマイグレーション手順書
   - アクセシビリティテスト自動化

7. **Release Preparation** (P2 - Medium Priority):
   - 本番環境構築・テスト
   - 運用手順書・緊急対応訓練
   - ユーザーサポート体制準備
   - 多言語対応（i18n）実装
   - パフォーマンス回帰テスト

**Estimated Output**: 45-55 numbered, ordered tasks in tasks.md (increased due to operations tasks)

**Task Template Pattern**:
```
## Task N: [Component] - [Action]
**Type**: [Contract|Model|Library|UI|Integration|E2E]
**Priority**: [P] or sequential
**Dependencies**: Task M, Task K
**Acceptance Criteria**: 
- [ ] Test written and failing (RED)
- [ ] Implementation passes test (GREEN)  
- [ ] Code refactored for quality (REFACTOR)
**Files Modified**: 
- tests/[...].test.ts
- src/[...].ts
```

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (none required)

**Artifacts Generated**:
- [x] `/specs/001-/plan.md` - このファイル
- [x] `/specs/001-/research.md` - 技術調査・意思決定
- [x] `/specs/001-/data-model.md` - エンティティ・リレーション定義
- [x] `/specs/001-/contracts/api-spec.yaml` - API仕様（OpenAPI）
- [x] `/specs/001-/quickstart.md` - 開発環境セットアップ

**Ready for Next Command**: `/tasks` (タスク生成フェーズ)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*