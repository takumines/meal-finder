# 技術実装仕様書: 食事決定アプリ (MealFinder)

**機能ブランチ**: `001-`  
**作成日**: 2025-09-13  
**ステータス**: 実装準備中  

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **UI**: React 19
- **認証**: Supabase Auth (フロントエンド)

### バックエンド
- **API**: Next.js 15 Route Handlers (app/api)
- **データベース**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **認証**: Supabase Auth (サーバーサイド)
- **AI**: OpenAI API (質問生成・料理提案)

### セキュリティ原則
- フロントエンドは一切APIキーを保持しない
- OpenAI、Supabaseとの通信は全てサーバーサイドで実行
- 環境変数によるキー管理

## アーキテクチャ設計原則

### ディレクトリ構造とビジネスロジック分離

1. **ルーティングファイルの責務**: 画面ルーティング (`page.tsx`) とAPIルーティング (`route.ts`) はビジネスロジックを含まない
2. **機能単位管理**: `src/features` でビジネスロジック・UIコンポーネントを機能単位に分離
3. **共通コンポーネント**: `src/components` で再利用可能なコンポーネントを管理
4. **ライブラリラッパー**: `src/lib` でサードパーティライブラリをラップして使用

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
│   │   │   ├── services/        # 認証ビジネスロジック
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
│   │   │   ├── services/        # 質問ビジネスロジック
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
│   │   │   ├── services/
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
│   │       ├── services/
│   │       │   └── profile-service.ts
│   │       └── types/
│   │           └── profile.types.ts
│   ├── lib/                     # サードパーティライブラリラッパー
│   │   ├── prisma/
│   │   │   ├── client.ts        # Prismaクライアント設定
│   │   │   ├── schema.prisma    # Prismaスキーマ定義
│   │   │   └── seed.ts          # 初期データシード
│   │   ├── supabase/
│   │   │   ├── client.ts        # Supabaseクライアントラッパー
│   │   │   ├── server.ts        # Supabaseサーバークライアント
│   │   │   └── auth.ts          # 認証ヘルパー
│   │   ├── openai/
│   │   │   ├── client.ts        # OpenAIクライアントラッパー
│   │   │   ├── prompts.ts       # プロンプトテンプレート
│   │   │   └── types.ts         # OpenAI関連型定義
│   │   ├── utils/               # 汎用ユーティリティ
│   │   │   ├── validation.ts    # バリデーション関数
│   │   │   ├── api.ts          # API呼び出しヘルパー
│   │   │   ├── format.ts       # フォーマット関数
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

## 実装例

### 1. Route Handler (ビジネスロジック無し)

```typescript
// app/api/ai/questions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { authGuard } from '@/src/lib/utils/auth-guard'
import { questionService } from '@/src/features/questions/services/question-service'

export async function POST(request: NextRequest) {
  try {
    // 認証チェック (ビジネスロジックは分離)
    const user = await authGuard(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // リクエストボディ取得
    const body = await request.json()
    
    // ビジネスロジックをサービス層に委譲
    const result = await questionService.generateNextQuestion(user.id, body)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in questions API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 2. ビジネスロジック層 (Services)

```typescript
// src/features/questions/services/question-service.ts
import { openaiClient } from '@/src/lib/openai/client'
import { databaseService } from '@/src/lib/prisma/client'
import { QuestionGenerationRequest, QuestionResponse } from '../types/questions.types'

class QuestionService {
  async generateNextQuestion(
    userId: string, 
    request: QuestionGenerationRequest
  ): Promise<QuestionResponse> {
    // ユーザーの過去の回答を取得
    const userHistory = await this.getUserAnswerHistory(userId)
    
    // AI質問生成 (OpenAIクライアントラッパー使用)
    const question = await openaiClient.generateQuestion({
      answers: request.answers,
      history: userHistory,
      preferences: request.preferences
    })
    
    // データベースに保存 (Prisma使用)
    await databaseService.saveQuestion(userId, question)
    
    return {
      question: question.text,
      questionIndex: request.currentQuestionIndex + 1,
      questionId: question.id
    }
  }

  private async getUserAnswerHistory(userId: string) {
    return await databaseService.getUserAnswerHistory(userId)
  }
}

export const questionService = new QuestionService()
```

### 3. ライブラリラッパー

```typescript
// src/lib/openai/client.ts
import OpenAI from 'openai'
import { QuestionPrompts } from './prompts'
import { OpenAIQuestionRequest, GeneratedQuestion } from './types'

class OpenAIClient {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async generateQuestion(request: OpenAIQuestionRequest): Promise<GeneratedQuestion> {
    const prompt = QuestionPrompts.buildQuestionPrompt(request)
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: prompt,
      temperature: 0.7
    })

    return {
      id: crypto.randomUUID(),
      text: response.choices[0].message.content || '',
      type: 'yes_no',
      metadata: request
    }
  }
}

export const openaiClient = new OpenAIClient()
```

```typescript
// src/lib/prisma/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database service layer
class DatabaseService {
  async saveQuestion(userId: string, question: any) {
    return await prisma.question.create({
      data: {
        userId,
        questionText: question.text,
        questionType: question.type,
      }
    })
  }

  async getUserAnswerHistory(userId: string) {
    return await prisma.userSession.findMany({
      where: { userId },
      select: { answers: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  }

  async createUserProfile(userId: string, data: any) {
    return await prisma.userProfile.upsert({
      where: { id: userId },
      update: data,
      create: { id: userId, ...data }
    })
  }

  async saveMealSuggestion(userId: string, mealData: any) {
    return await prisma.meal.create({
      data: mealData
    })
  }
}

export const databaseService = new DatabaseService()
```

### 4. Page コンポーネント (UIレンダリングのみ)

```typescript
// app/questions/page.tsx
import { QuestionFlow } from '@/src/features/questions/components/question-flow'
import { AuthGuard } from '@/src/features/auth/components/auth-guard'

export default function QuestionsPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">質問に答えて食事を見つけよう</h1>
        <QuestionFlow />
      </div>
    </AuthGuard>
  )
}
```

### 5. Feature コンポーネント (ビジネスロジック含む)

```typescript
// src/features/questions/components/question-flow.tsx
'use client'

import { useState } from 'react'
import { useQuestions } from '../hooks/use-questions'
import { QuestionCard } from './question-card'
import { AnswerButtons } from './answer-buttons'
import { ProgressBar } from './progress-bar'

export function QuestionFlow() {
  const {
    currentQuestion,
    answers,
    questionIndex,
    isLoading,
    handleAnswer,
    isComplete
  } = useQuestions()

  if (isComplete) {
    return <div>質問完了！結果を表示中...</div>
  }

  return (
    <div className="max-w-lg mx-auto">
      <ProgressBar current={questionIndex} total={10} />
      
      {isLoading ? (
        <div>次の質問を生成中...</div>
      ) : (
        <>
          <QuestionCard question={currentQuestion} />
          <AnswerButtons onAnswer={handleAnswer} />
        </>
      )}
    </div>
  )
}
```

### 6. カスタムフック (状態管理・ビジネスロジック)

```typescript
// src/features/questions/hooks/use-questions.ts
import { useState, useCallback } from 'react'
import { questionService } from '../services/question-service'
import { Answer } from '../types/questions.types'

export function useQuestions() {
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleAnswer = useCallback(async (answer: Answer) => {
    setIsLoading(true)
    
    try {
      const newAnswers = [...answers, answer]
      setAnswers(newAnswers)
      
      // API呼び出し (サービス層経由)
      const response = await questionService.getNextQuestion({
        answers: newAnswers,
        currentQuestionIndex: questionIndex
      })
      
      setCurrentQuestion(response.question)
      setQuestionIndex(response.questionIndex)
      
    } catch (error) {
      console.error('Failed to get next question:', error)
    } finally {
      setIsLoading(false)
    }
  }, [answers, questionIndex])

  return {
    currentQuestion,
    answers,
    questionIndex,
    isLoading,
    handleAnswer,
    isComplete: questionIndex >= 10
  }
}
```


## アーキテクチャのメリット

### 1. 責務の明確な分離
- **Routeファイル**: リクエスト・レスポンス処理のみ
- **Serviceレイヤー**: ビジネスロジックの実装
- **Libレイヤー**: 外部ライブラリの抽象化
- **Featureディレクトリ**: 機能単位の凝集性

### 2. テスタビリティの向上
- ビジネスロジックが独立してテスト可能
- モックによる外部依存関係の分離
- 単体テスト・統合テストの容易性

### 3. 保守性・拡張性
- 機能追加時の影響範囲の最小化
- コードの再利用性向上
- 外部ライブラリ変更時の影響局所化

### 4. チーム開発効率
- 機能単位での開発分担可能
- コードレビューの効率化
- 新規メンバーの理解促進

## Prisma設定とデータベース設計

### Prismaセットアップ

```bash
# Prismaの初期化
npx prisma init

# マイグレーション実行
npx prisma migrate dev --name init

# Prisma Client生成
npx prisma generate

# データベースシード
npx prisma db seed
```

### Prismaスキーマ定義

```prisma
// src/lib/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/client"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ユーザープロファイル (Supabase Authとの連携)
model UserProfile {
  id          String   @id // Supabase Auth user_id
  email       String   @unique
  name        String?
  preferences Json?
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // リレーション
  sessions    UserSession[]
  questions   Question[]

  @@map("user_profiles")
}

// AI生成質問
model Question {
  id           String      @id @default(cuid())
  userId       String      @map("user_id")
  questionText String      @map("question_text")
  questionType String      @map("question_type")
  metadata     Json?       
  createdAt    DateTime    @default(now()) @map("created_at")

  // リレーション
  user         UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
  sessions     UserSession[]

  @@map("questions")
}

// 料理データ
model Meal {
  id              String   @id @default(cuid())
  name            String
  description     String?
  genre           String?
  characteristics Json?
  imageUrl        String?  @map("image_url")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  // リレーション
  sessions        UserSession[]
  favorites       UserFavorite[]

  @@map("meals")
}

// ユーザーセッション（質問回答履歴）
model UserSession {
  id              String   @id @default(cuid())
  userId          String   @map("user_id")
  answers         Json
  suggestedMealId String?  @map("suggested_meal_id")
  completed       Boolean  @default(false)
  sessionType     String   @default("question_flow") @map("session_type")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  // リレーション
  user            UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
  suggestedMeal   Meal?       @relation(fields: [suggestedMealId], references: [id])
  questions       Question[]

  @@map("user_sessions")
}

// ユーザーお気に入り
model UserFavorite {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  mealId    String   @map("meal_id")
  createdAt DateTime @default(now()) @map("created_at")

  // リレーション
  user      UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
  meal      Meal        @relation(fields: [mealId], references: [id], onDelete: Cascade)

  @@unique([userId, mealId])
  @@map("user_favorites")
}

// 料理履歴
model MealHistory {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  mealId    String   @map("meal_id")
  rating    Int?     // 1-5の評価
  notes     String?
  eatenAt   DateTime @default(now()) @map("eaten_at")
  createdAt DateTime @default(now()) @map("created_at")

  // リレーション
  user      UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
  meal      Meal        @relation(fields: [mealId], references: [id], onDelete: Cascade)

  @@map("meal_history")
}
```

### Prisma設定ファイル

```typescript
// src/lib/prisma/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})
```

### データベースシード

```typescript
// src/lib/prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // サンプル料理データの追加
  const meals = [
    {
      name: 'ハンバーガー',
      description: 'ジューシーなパティとフレッシュな野菜',
      genre: 'ファストフード',
      characteristics: {
        spiciness: 'mild',
        cookingTime: 'quick',
        temperature: 'hot'
      }
    },
    {
      name: 'ラーメン',
      description: '濃厚なスープと手打ち麺',
      genre: '和食',
      characteristics: {
        spiciness: 'medium',
        cookingTime: 'medium',
        temperature: 'hot'
      }
    },
    {
      name: 'サラダ',
      description: '新鮮な野菜とドレッシング',
      genre: 'ヘルシー',
      characteristics: {
        spiciness: 'none',
        cookingTime: 'quick',
        temperature: 'cold'
      }
    }
  ]

  for (const meal of meals) {
    await prisma.meal.upsert({
      where: { name: meal.name },
      update: {},
      create: meal
    })
  }

  console.log('Seed data inserted successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 必要な依存関係

```json
{
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/supabase-js": "^2.38.5",
    "next": "15.0.0",
    "openai": "^4.20.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "prisma": "^5.7.0",
    "tsx": "^4.19.4",
    "@types/node": "^20",
    "typescript": "^5"
  }
}
```

### 基本的なPrisma操作例

```typescript
// src/lib/prisma/database-service.ts
import { prisma } from './client'
import { Prisma } from '@prisma/client'

export class DatabaseService {
  // 基本CRUD操作例
  async createUserProfile(data: Prisma.UserProfileCreateInput) {
    return await prisma.userProfile.create({ data })
  }

  async getUserProfile(id: string) {
    return await prisma.userProfile.findUnique({
      where: { id },
      include: { sessions: true }
    })
  }

  // トランザクション例
  async completeQuestionSession(sessionId: string, mealId: string, answers: any) {
    return await prisma.$transaction(async (tx) => {
      await tx.userSession.update({
        where: { id: sessionId },
        data: { completed: true, answers, suggestedMealId: mealId }
      })
      
      return tx.mealHistory.create({
        data: { userId: '', mealId, notes: `Session ${sessionId}` }
      })
    })
  }
}

export const databaseService = new DatabaseService()
```

## 環境変数設定

```env
# .env.local
# Prisma Database
DATABASE_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NODE_ENV=development
```

## Prisma開発ワークフロー

### 初期セットアップ
```bash
# 1. Prismaセットアップ
npm install prisma @prisma/client
npx prisma init

# 2. スキーマ定義後マイグレーション
npx prisma migrate dev --name init

# 3. Prisma Client生成
npx prisma generate

# 4. 初期データ投入
npx prisma db seed
```

### 開発時のワークフロー
```bash
# スキーマ変更後
npx prisma migrate dev --name add-user-favorites

# Prisma Studio でデータ確認
npx prisma studio

# 本番環境デプロイ時
npx prisma migrate deploy
```

### Prismaの利点

1. **型安全性**: TypeScript完全対応、コンパイル時エラー検出
2. **優れたDX**: Auto-completion、IntelliSense対応
3. **マイグレーション管理**: スキーマ変更の自動管理
4. **関係性の自動解決**: JOINクエリの自動生成
5. **パフォーマンス**: 効率的なクエリ生成
6. **データベース抽象化**: PostgreSQL、MySQL、SQLite対応

## セキュリティ対策

1. **APIキー保護**: OpenAI APIキーは環境変数でサーバーサイドのみ
2. **認証チェック**: 全APIルートでSupabase認証確認
3. **Prisma RLS**: Row Level Securityポリシーとの連携
4. **CSRF対策**: Next.jsのCSRF保護を活用
5. **入力検証**: Prismaスキーマレベルでの制約とTypeScript型チェック
6. **SQL Injection対策**: Prismaの自動エスケープ機能

## デプロイメント

- **推奨**: Vercel (Next.js最適化)
- **代替**: Netlify, Railway
- **環境変数**: 本番環境で適切に設定