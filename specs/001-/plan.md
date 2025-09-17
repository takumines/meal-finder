# Implementation Plan: 食事決定アプリ (MealFinder)

**Branch**: `001-` | **Date**: 2025-09-13 | **Spec**: /Users/takumines/dev/React/nantaberu/specs/001-/spec.md
**Input**: Feature specification from /Users/takumines/dev/React/nantaberu/specs/001-/spec.md

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

## Summary

**主要要件**: アキネーター形式のYes/No質問で食べたいものを効率的に見つける食事決定アプリ。ユーザー登録必須、最大10問の質問でユーザーの好みを特定し、具体的な料理を推薦。Tinder風UIで直感的な操作を提供。

**技術アプローチ**: 
- **フレームワーク**: Next.js 15 (App Router) + TypeScript
- **認証・DB**: Supabase (Auth + PostgreSQL) + Prisma ORM
- **AI**: OpenAI GPT-4 (質問生成・料理推薦)
- **UI**: React 19 + Tailwind CSS (モバイル最適化)
- **アーキテクチャ**: フルスタック、サーバーサイドAPI処理
- **パフォーマンス**: 2秒以内レスポンス、80%以上の10問内解決率

## Technical Context
**Language/Version**: TypeScript 5.x, Node.js 18+, React 19, Next.js 15  
**Primary Dependencies**: Next.js 15, Supabase, Prisma, OpenAI SDK, Tailwind CSS  
**Storage**: Supabase PostgreSQL, Prisma ORM  
**Testing**: Vitest, React Testing Library, Playwright (E2E)  
**Target Platform**: Web (モバイル最適化), PWA対応
**Project Type**: web - フロントエンド + バックエンドAPI  
**Performance Goals**: <2秒質問レスポンス, 80%解決率, Lighthouse 90+  
**Constraints**: モバイル最適化必須, オフライン基本機能対応, 5回No制限  
**Scale/Scope**: 個人ユーザー向け, 10問質問システム, 3アクションオプション

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (Next.js フルスタックアプリのみ) ✅
- Using framework directly? (Next.js/React直接利用、wrapper無し) ✅
- Single data model? (Prismaスキーマ統一、DTO不要) ✅
- Avoiding patterns? (Repository/UoW無し、Prisma直接利用) ✅

**Architecture**:
- EVERY feature as library? (質問生成、料理推薦、履歴管理をライブラリ化) ✅
- Libraries listed: [meal-finder-core (質問ロジック), meal-recommendation (推薦エンジン), meal-history (履歴管理)]
- CLI per library: [dev用のcliコマンド --help/--version/--format対応] ✅
- Library docs: llms.txt format planned? ✅

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? (テスト先行開発必須) ✅
- Git commits show tests before implementation? ✅
- Order: Contract→Integration→E2E→Unit strictly followed? ✅
- Real dependencies used? (実際のSupabase、OpenAI API) ✅
- Integration tests for: API統合、認証フロー、質問セッション ✅
- FORBIDDEN: Implementation before test, skipping RED phase ✅

**Observability**:
- Structured logging included? (ユーザーアクション・エラー・パフォーマンス) ✅
- Frontend logs → backend? (Next.js API経由でログ統合) ✅
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

**Task Generation Strategy**:
- Next.js 15アプリケーション基盤構築
- Supabase + Prisma統合
- OpenAI API統合
- TDD原則: Contract → Integration → E2E → Unit順序

**主要タスクカテゴリ**:
1. **基盤構築** (P0 Critical)
   - Next.js 15 + TypeScript + Tailwind CSS セットアップ
   - Supabase プロジェクト作成・設定
   - Prisma スキーマ定義・マイグレーション
   - 環境変数・セキュリティ設定

2. **Contract Tests** (各API endpoint → 1テストタスク)
   - `/api/auth/profile` contract test [P]
   - `/api/sessions` contract test [P]
   - `/api/ai/questions` contract test [P]
   - `/api/ai/recommendations` contract test [P]
   - `/api/meals/history` contract test [P]

3. **Integration Tests** (Supabase/OpenAI統合)
   - Supabase認証統合テスト
   - Prisma データベース操作テスト  
   - OpenAI API統合テスト
   - リアルタイム機能テスト

4. **Core Implementation** (ビジネスロジック)
   - ユーザープロファイル管理 (src/features/auth/)
   - 質問セッション管理 (src/features/questions/)
   - AI推薦エンジン (src/features/recommendations/)
   - 食事履歴管理 (src/features/history/)

5. **UI Components** (モバイル最適化)
   - 認証フォーム (AuthProvider, LoginForm)
   - 質問フロー (QuestionFlow, AnswerButtons)
   - 推薦結果 (RecommendationResult)
   - 履歴表示 (MealHistory)

**Ordering Strategy**:
- Phase A: 基盤構築 (Next.js, Supabase, Prisma)
- Phase B: Contract Tests (全API endpoint)
- Phase C: Integration Tests (外部API統合)
- Phase D: Core Implementation (ビジネスロジック)
- Phase E: UI Components (フロントエンド)
- Phase F: E2E Tests (ユーザーフロー検証)

**Dependency Chain**:
```
Supabase Setup → Prisma Schema → Contract Tests → Integration Tests → Core Logic → UI Components → E2E Tests
```

**Constitutional Compliance**:
- EVERY implementation task has corresponding failing test FIRST
- Libraries: meal-finder-core, meal-recommendation, meal-history
- CLI commands per library: --help, --version, --format
- RED-GREEN-Refactor cycle strictly enforced

**Estimated Output**: 35-40 numbered, ordered tasks in tasks.md

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
- [x] Phase 0: Research complete (/plan command) - research.md exists
- [x] Phase 1: Design complete (/plan command) - data-model.md, contracts/, quickstart.md exist
- [x] Phase 2: Task planning complete (/plan command - describe approach only) - Strategy documented
- [x] Phase 3: Tasks generated (/tasks command) - tasks.md created with functional programming approach
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS - All principles verified
- [x] Post-Design Constitution Check: PASS - Design maintains constitutional compliance
- [x] All NEEDS CLARIFICATION resolved - research.md addresses all unknowns
- [x] Complexity deviations documented - No violations requiring justification

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*