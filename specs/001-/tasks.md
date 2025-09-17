# Tasks: 食事決定アプリ (MealFinder)

**Input**: Design documents from `/specs/001-/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/api-spec.yaml, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: Next.js 15, Supabase + Prisma, OpenAI integration
2. Load design documents:
   → data-model.md: 7 entities (UserProfile, QuestionSession, Answer, etc.)
   → contracts/api-spec.yaml: 8 API endpoints for AI + CRUD operations  
   → research.md: Supabase + Next.js 15 + OpenAI technical decisions
3. Generate tasks by category:
   → Setup: Next.js project, Supabase, Prisma, dependencies
   → Tests: contract tests, integration tests (TDD enforced)
   → Core: models, services, API routes, UI components
   → Integration: Supabase connection, OpenAI API, authentication
   → Polish: unit tests, performance validation, documentation
4. Apply task rules:
   → Different files = mark [P] for parallel execution
   → Same file = sequential (no [P])
   → Tests before implementation (TDD constitutional requirement)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Ready for execution: 35 tasks with clear Next.js 15 file paths
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Paths use Next.js 15 App Router conventions: `app/`, `src/lib/`, `src/components/`

## Path Conventions (Next.js 15 + Supabase + 関数型プログラミング)
- **App Router**: `app/` (pages, layouts, API routes)
- **Features**: `src/features/` (機能単位のビジネスロジック・UI) 
- **Shared Components**: `src/components/` (共通UIコンポーネント)
- **Libraries**: `src/lib/` (サードパーティライブラリラッパー、純粋関数)
- **Tests**: `tests/` (contract, integration, unit, e2e)

### 実装方針
- **関数型プログラミング**: classベースではなく純粋関数による実装
- **機能単位分離**: 各機能は`src/features/`配下で完結
- **ビジネスロジック分離**: ルーティング層とビジネスロジック層の明確な分離

## Phase 3.1: Setup & Infrastructure

- [x] T001 Initialize Next.js 15 project with TypeScript and Tailwind CSS in repository root
- [x] T002 [P] Install and configure Supabase client in src/lib/supabase/client.ts
- [x] T003 [P] Install and configure Prisma ORM with schema in prisma/schema.prisma
- [x] T004 [P] Setup OpenAI SDK integration in src/lib/openai/client.ts
- [x] T005 Configure environment variables in .env.example and .env.local
- [x] T006 [P] Setup ESLint and Prettier configuration files
- [x] T007 [P] Setup Vitest and React Testing Library in tests/setup.ts

## Phase 3.2: Contract Tests (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [x] T008 [P] Contract test POST /api/ai/generate-question in tests/contract/ai-generate-question.test.ts
- [x] T009 [P] Contract test POST /api/ai/generate-recommendation in tests/contract/ai-generate-recommendation.test.ts
- [x] T010 [P] Contract test POST /api/sessions in tests/contract/sessions-post.test.ts
- [x] T011 [P] Contract test GET /api/sessions/{sessionId} in tests/contract/sessions-get.test.ts
- [x] T012 [P] Contract test GET /api/sessions/{sessionId}/questions/next in tests/contract/questions-next.test.ts
- [x] T013 [P] Contract test POST /api/sessions/{sessionId}/answers in tests/contract/answers-post.test.ts
- [x] T014 [P] Contract test POST /api/recommendations/{id}/reaction in tests/contract/recommendation-reaction.test.ts
- [x] T015 [P] Contract test GET /api/history in tests/contract/history-get.test.ts

## Phase 3.3: Database Models & Schema (ONLY after contract tests are failing)

- [x] T016 [P] Create Prisma schema for UserProfile in prisma/schema.prisma
- [x] T017 [P] Create Prisma schema for QuestionSession in prisma/schema.prisma  
- [x] T018 [P] Create Prisma schema for Answer in prisma/schema.prisma
- [x] T019 [P] Create Prisma schema for MealRecommendation in prisma/schema.prisma
- [x] T020 [P] Create Prisma schema for MealHistory in prisma/schema.prisma
- [x] T021 Run Prisma migration and generate client
- [x] T022 [P] Create TypeScript types in src/types/database.ts based on Prisma schema

## Phase 3.4: Core Business Logic (関数型実装)

- [x] T023 [P] **[UPDATED]** Implement question service functions in src/features/questions/services/question-service.ts
- [x] T024 [P] **[UPDATED]** Implement meal recommendation functions in src/features/meals/services/recommendation-service.ts  
- [x] T025 [P] **[UPDATED]** Implement meal history functions in src/features/meals/services/history-service.ts
- [x] T026 [P] Create Supabase auth helpers in src/lib/supabase/auth.ts
- [x] T027 [P] Create Supabase database helpers in src/lib/supabase/database.ts

## Phase 3.5: Next.js API Routes (App Router)

- [x] T028 Create POST /api/ai/generate-question route handler in app/api/ai/generate-question/route.ts
- [x] T029 Create POST /api/ai/generate-recommendation route handler in app/api/ai/generate-recommendation/route.ts
- [x] T030 Create POST /api/sessions route handler in app/api/sessions/route.ts
- [x] T031 Create GET /api/sessions/[sessionId] route handler in app/api/sessions/[sessionId]/route.ts
- [x] T032 Create GET /api/sessions/[sessionId]/questions/next route handler in app/api/sessions/[sessionId]/questions/next/route.ts
- [x] T033 Create POST /api/sessions/[sessionId]/answers route handler in app/api/sessions/[sessionId]/answers/route.ts

## Phase 3.6: Integration Tests

- [x] T034 [P] Integration test for Supabase authentication flow in tests/integration/supabase-auth.test.ts
- [x] T035 [P] Integration test for OpenAI API question generation in tests/integration/openai-question.test.ts
- [x] T036 [P] Integration test for complete question session flow in tests/integration/question-session.test.ts
- [x] T037 [P] Integration test for meal recommendation generation in tests/integration/meal-recommendation.test.ts

## Phase 3.7: React Components & UI (機能単位構成)

- [x] T038 [P] **[UPDATED]** Create AuthProvider component in src/features/auth/components/auth-provider.tsx
- [x] T039 [P] **[UPDATED]** Create LoginForm component in src/features/auth/components/login-form.tsx
- [x] T040 [P] **[UPDATED]** Create QuestionFlow component in src/features/questions/components/question-flow.tsx
- [x] T041 [P] **[UPDATED]** Create AnswerButtons component in src/features/questions/components/answer-buttons.tsx
- [x] T042 [P] **[UPDATED]** Create RecommendationResult component in src/features/meals/components/recommendation-result.tsx
- [x] T043 [P] **[UPDATED]** Create MealHistory component in src/features/meals/components/meal-history.tsx

## Phase 3.8: Next.js App Pages & Layout

- [x] T044 Create root layout in src/app/layout.tsx with Supabase provider
- [x] T045 Create home page in src/app/page.tsx
- [x] T046 Create question session page in src/app/questions/page.tsx
- [x] T047 Create user profile page in src/app/profile/page.tsx
- [x] T048 Create meal history page in src/app/history/page.tsx

## Phase 3.9: Polish & Unit Tests (関数型対応)

- [x] T049 [P] **[UPDATED]** Unit tests for question service functions in src/__tests__/unit/question-service.test.ts
- [x] T050 [P] **[UPDATED]** Unit tests for recommendation service functions in src/__tests__/unit/recommendation-service.test.ts
- [x] T051 [P] **[UPDATED]** Unit tests for history service functions in src/__tests__/unit/history-service.test.ts
- [x] T052 [P] **[UPDATED]** Unit tests for React components in src/__tests__/unit/components.test.tsx
- [x] T053 [P] E2E tests for complete user flow in tests/e2e/user-flow.test.ts
- [x] T054 Performance validation (< 2s response time) in tests/performance/api-response.test.ts
- [x] T055 [P] Update README.md with setup and usage instructions

## Dependencies

**Critical Dependencies (TDD Requirements)**:
- Contract tests (T008-T015) MUST complete before any implementation
- Database schema (T016-T022) before business logic (T023-T027)
- Business logic (T023-T027) before API routes (T028-T033)
- API routes before integration tests (T034-T037)
- Core functionality before UI components (T038-T043)

**File-Level Dependencies**:
- T016-T020 all modify prisma/schema.prisma (sequential)
- T028-T033 create separate API route files (parallel possible)
- T038-T043 create separate component files (parallel possible)

## Parallel Execution Examples

### Contract Tests (Phase 3.2)
```bash
# Launch T008-T015 together (different test files):
Task: "Contract test POST /api/ai/generate-question in tests/contract/ai-generate-question.test.ts"
Task: "Contract test POST /api/ai/generate-recommendation in tests/contract/ai-generate-recommendation.test.ts"
Task: "Contract test POST /api/sessions in tests/contract/sessions-post.test.ts"
Task: "Contract test GET /api/sessions/{sessionId} in tests/contract/sessions-get.test.ts"
```

### Business Logic Services (Phase 3.4) - 関数型実装
```bash
# Launch T023-T027 together (separate feature service files):
Task: "Implement question service functions in src/features/questions/services/question-service.ts"
Task: "Implement meal recommendation functions in src/features/meals/services/recommendation-service.ts"
Task: "Implement meal history functions in src/features/meals/services/history-service.ts" 
Task: "Create Supabase auth helpers in src/lib/supabase/auth.ts"
```

### React Components (Phase 3.7) - 機能単位構成
```bash
# Launch T038-T043 together (separate feature component files):
Task: "Create AuthProvider component in src/features/auth/components/auth-provider.tsx"
Task: "Create LoginForm component in src/features/auth/components/login-form.tsx"  
Task: "Create QuestionFlow component in src/features/questions/components/question-flow.tsx"
Task: "Create AnswerButtons component in src/features/questions/components/answer-buttons.tsx"
```

## Validation Checklist
*GATE: Must be verified before task execution*

- [x] All contracts have corresponding contract tests (T008-T015)
- [x] All entities have Prisma schema tasks (T016-T020)
- [x] All API endpoints have route handler tasks (T028-T033)
- [x] All tests come before implementation (TDD enforced)
- [x] Parallel tasks use different files (no conflicts)
- [x] Each task specifies exact Next.js 15 file path
- [x] Constitutional requirements satisfied (RED-GREEN-Refactor, library-first)

## Notes

- **TDD Enforcement**: All contract tests (T008-T015) must be written first and FAIL
- **Next.js 15 App Router**: Use `app/` directory for pages and API routes
- **Supabase Integration**: Database operations use Prisma ORM with Supabase PostgreSQL
- **関数型アーキテクチャ**: ビジネスロジックは純粋関数で`src/features/`に配置
- **機能単位分離**: 各機能は`src/features/`配下で完結（components, services, hooks, types）
- **Parallel Execution**: Tasks marked [P] can run simultaneously
- **Constitutional Compliance**: RED-GREEN-Refactor cycle enforced, 関数型アーキテクチャ
- **Performance Targets**: API responses < 2s, Lighthouse score 90+, Bundle size < 500KB

## Constitutional Verification

✅ **Functions-First**: 関数型プログラミング、純粋関数による実装  
✅ **Feature-Based**: 機能単位でsrc/features/配下に集約
✅ **Test-First**: Contract tests before implementation (T008-T015 → T016+)
✅ **Integration Testing**: Supabase, OpenAI, complete session flow tests
✅ **Observability**: Structured logging planned in route handlers
✅ **Versioning**: 0.1.0 version number assigned
✅ **Simplicity**: Single Next.js project, direct framework usage, unified Prisma schema