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

**詳細なディレクトリ構造については以下を参照してください：**
→ [ディレクトリ構造詳細](./directory-structure.md)

主要な原則：
1. **ルーティングファイルの責務**: 画面ルーティング (`page.tsx`) とAPIルーティング (`route.ts`) はビジネスロジックを含まない
2. **機能単位管理**: `src/features` でビジネスロジック・UIコンポーネントを機能単位に分離
3. **共通コンポーネント**: `src/components` で再利用可能なコンポーネントを管理
4. **ライブラリラッパー**: `src/lib` でサードパーティライブラリをラップして使用
5. **関数型アプローチ**: classベースではなく純粋関数による実装

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
    
    // 関数型サービス層に委譲
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

### 2. ビジネスロジック層 (Services) - 関数型アプローチ

```typescript
// src/features/questions/services/question-service.ts
import { pipe } from '@/src/lib/utils/functional'
import { generateQuestion } from '@/src/lib/openai/client'
import { getUserAnswerHistory, saveQuestion } from '@/src/lib/prisma/client'
import { QuestionGenerationRequest, QuestionResponse } from '../types/questions.types'

// 純粋関数としてのサービス層実装
export const questionService = {
  generateNextQuestion: async (
    userId: string, 
    request: QuestionGenerationRequest
  ): Promise<QuestionResponse> => {
    // 関数型パイプラインで処理を構成
    return pipe(
      () => getUserAnswerHistory(userId),
      async (userHistory) => {
        const question = await generateQuestion({
          answers: request.answers,
          history: userHistory,
          preferences: request.preferences
        })
        
        await saveQuestion(userId, question)
        
        return {
          question: question.text,
          questionIndex: request.currentQuestionIndex + 1,
          questionId: question.id
        }
      }
    )()
  }
}

// 別解: 高階関数を活用した実装
export const createQuestionService = (dependencies: {
  getUserAnswerHistory: typeof getUserAnswerHistory
  generateQuestion: typeof generateQuestion
  saveQuestion: typeof saveQuestion
}) => ({
  generateNextQuestion: async (userId: string, request: QuestionGenerationRequest) => {
    const userHistory = await dependencies.getUserAnswerHistory(userId)
    
    const question = await dependencies.generateQuestion({
      answers: request.answers,
      history: userHistory,
      preferences: request.preferences
    })
    
    await dependencies.saveQuestion(userId, question)
    
    return {
      question: question.text,
      questionIndex: request.currentQuestionIndex + 1,
      questionId: question.id
    }
  }
})
```

### 3. ライブラリラッパー

```typescript
// src/lib/openai/client.ts
import OpenAI from 'openai'
import { QuestionPrompts } from './prompts'
import { OpenAIQuestionRequest, GeneratedQuestion } from './types'

// OpenAIクライアントインスタンスを作成する関数
const createOpenAIClient = (): OpenAI => {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// 遅延初期化によるクライアント取得
let client: OpenAI | null = null
const getClient = (): OpenAI => {
  if (!client) {
    client = createOpenAIClient()
  }
  return client
}

// 純粋関数としてのAI質問生成
export const generateQuestion = async (request: OpenAIQuestionRequest): Promise<GeneratedQuestion> => {
  const client = getClient()
  const prompt = QuestionPrompts.buildQuestionPrompt(request)
  
  const response = await client.chat.completions.create({
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

// 高階関数としてのAI関数ファクトリー
export const createAIService = (apiKey: string) => {
  const client = new OpenAI({ apiKey })
  
  return {
    generateQuestion: async (request: OpenAIQuestionRequest): Promise<GeneratedQuestion> => {
      const prompt = QuestionPrompts.buildQuestionPrompt(request)
      
      const response = await client.chat.completions.create({
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
}
```

```typescript
// src/lib/prisma/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// 純粋関数としてのデータベース操作
export const saveQuestion = async (userId: string, question: any) => {
  return await prisma.question.create({
    data: {
      userId,
      questionText: question.text,
      questionType: question.type,
    }
  })
}

export const getUserAnswerHistory = async (userId: string) => {
  return await prisma.userSession.findMany({
    where: { userId },
    select: { answers: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
}

export const createUserProfile = async (userId: string, data: any) => {
  return await prisma.userProfile.upsert({
    where: { id: userId },
    update: data,
    create: { id: userId, ...data }
  })
}

export const saveMealSuggestion = async (userId: string, mealData: any) => {
  return await prisma.meal.create({
    data: mealData
  })
}

// 高階関数としてのデータベースサービスファクトリー
export const createDatabaseService = (prismaInstance: PrismaClient) => ({
  saveQuestion: (userId: string, question: any) =>
    prismaInstance.question.create({
      data: {
        userId,
        questionText: question.text,
        questionType: question.type,
      }
    }),
    
  getUserAnswerHistory: (userId: string) =>
    prismaInstance.userSession.findMany({
      where: { userId },
      select: { answers: true },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
  createUserProfile: (userId: string, data: any) =>
    prismaInstance.userProfile.upsert({
      where: { id: userId },
      update: data,
      create: { id: userId, ...data }
    }),
    
  saveMealSuggestion: (userId: string, mealData: any) =>
    prismaInstance.meal.create({
      data: mealData
    })
})
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

### 6. カスタムフック (関数型アプローチによる状態管理)

```typescript
// src/features/questions/hooks/use-questions.ts
import { useState, useCallback, useReducer } from 'react'
import { questionService } from '../services/question-service'
import { Answer } from '../types/questions.types'

// 状態管理をReducerパターンで関数型に
type QuestionState = {
  currentQuestion: string
  answers: Answer[]
  questionIndex: number
  isLoading: boolean
  isComplete: boolean
}

type QuestionAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_ANSWER'; payload: Answer }
  | { type: 'SET_QUESTION'; payload: { question: string; index: number } }
  | { type: 'COMPLETE' }

const questionReducer = (state: QuestionState, action: QuestionAction): QuestionState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'ADD_ANSWER':
      return { 
        ...state, 
        answers: [...state.answers, action.payload]
      }
    case 'SET_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload.question,
        questionIndex: action.payload.index,
        isComplete: action.payload.index >= 10
      }
    case 'COMPLETE':
      return { ...state, isComplete: true }
    default:
      return state
  }
}

// 初期状態
const initialState: QuestionState = {
  currentQuestion: '',
  answers: [],
  questionIndex: 0,
  isLoading: false,
  isComplete: false
}

export function useQuestions() {
  const [state, dispatch] = useReducer(questionReducer, initialState)

  const handleAnswer = useCallback(async (answer: Answer) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'ADD_ANSWER', payload: answer })
    
    try {
      const newAnswers = [...state.answers, answer]
      
      // 関数型サービス層への呼び出し
      const response = await questionService.generateNextQuestion(
        'user-id', // 実際の実装では認証から取得
        {
          answers: newAnswers,
          currentQuestionIndex: state.questionIndex
        }
      )
      
      dispatch({ 
        type: 'SET_QUESTION', 
        payload: { 
          question: response.question, 
          index: response.questionIndex 
        }
      })
      
    } catch (error) {
      console.error('Failed to get next question:', error)
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.answers, state.questionIndex])

  return {
    ...state,
    handleAnswer
  }
}

// 高階関数としてのカスタムフック
export const createQuestionHook = (deps: {
  questionService: typeof questionService
  getUserId: () => string
}) => {
  return function useQuestions() {
    const [state, dispatch] = useReducer(questionReducer, initialState)

    const handleAnswer = useCallback(async (answer: Answer) => {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'ADD_ANSWER', payload: answer })
      
      try {
        const newAnswers = [...state.answers, answer]
        const userId = deps.getUserId()
        
        const response = await deps.questionService.generateNextQuestion(userId, {
          answers: newAnswers,
          currentQuestionIndex: state.questionIndex
        })
        
        dispatch({ 
          type: 'SET_QUESTION', 
          payload: { 
            question: response.question, 
            index: response.questionIndex 
          }
        })
        
      } catch (error) {
        console.error('Failed to get next question:', error)
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }, [state.answers, state.questionIndex])

    return {
      ...state,
      handleAnswer
    }
  }
}
```


## アーキテクチャのメリット

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
- **テスト容易性**: 入力に対して常に同じ出力を保証

### 3. テスタビリティの向上
- 純粋関数により単体テストが容易
- 依存性注入による外部依存関係の分離
- モック不要な関数単位テスト
- 状態管理のReducerパターンによる予測可能性

### 4. 保守性・拡張性
- 機能追加時の影響範囲の最小化
- 関数の組み合わせによる柔軟な実装
- 外部ライブラリ変更時の影響局所化
- 不変データによるバグの削減

### 5. チーム開発効率
- 機能単位での開発分担可能
- 関数型アプローチによる理解しやすいコード
- 新規メンバーの理解促進
- デバッグの容易性

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

// 純粋関数としてのデータベース操作
export const createUserProfile = async (data: Prisma.UserProfileCreateInput) => {
  return await prisma.userProfile.create({ data })
}

export const getUserProfile = async (id: string) => {
  return await prisma.userProfile.findUnique({
    where: { id },
    include: { sessions: true }
  })
}

// 関数型トランザクション例
export const completeQuestionSession = async (
  sessionId: string, 
  mealId: string, 
  answers: any
) => {
  return await prisma.$transaction(async (tx) => {
    const updatedSession = await tx.userSession.update({
      where: { id: sessionId },
      data: { completed: true, answers, suggestedMealId: mealId }
    })
    
    const mealHistory = await tx.mealHistory.create({
      data: { userId: '', mealId, notes: `Session ${sessionId}` }
    })
    
    return { updatedSession, mealHistory }
  })
}

// 高階関数版: トランザクション処理を抽象化
export const withTransaction = <T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>
) => {
  return prisma.$transaction(operation)
}

// 使用例: withTransactionによる合成可能なトランザクション
export const completeQuestionSessionComposed = (
  sessionId: string, 
  mealId: string, 
  answers: any
) => {
  return withTransaction(async (tx) => {
    const updateSession = (tx: Prisma.TransactionClient) =>
      tx.userSession.update({
        where: { id: sessionId },
        data: { completed: true, answers, suggestedMealId: mealId }
      })
    
    const createHistory = (tx: Prisma.TransactionClient) =>
      tx.mealHistory.create({
        data: { userId: '', mealId, notes: `Session ${sessionId}` }
      })
    
    const [updatedSession, mealHistory] = await Promise.all([
      updateSession(tx),
      createHistory(tx)
    ])
    
    return { updatedSession, mealHistory }
  })
}
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

## 関数型プログラミングユーティリティ

```typescript
// src/lib/utils/functional.ts
// パイプライン関数: 複数の関数を順次実行
export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduce((acc, fn) => fn(acc), value)

// 非同期パイプライン
export const pipeAsync = <T>(...fns: Array<(arg: T) => Promise<T>>) => 
  async (value: T): Promise<T> => {
    let result = value
    for (const fn of fns) {
      result = await fn(result)
    }
    return result
  }

// コンポーズ関数: パイプの逆順
export const compose = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduceRight((acc, fn) => fn(acc), value)

// カリー化関数
export const curry = <A, B, C>(fn: (a: A, b: B) => C) => 
  (a: A) => (b: B) => fn(a, b)

// Maybe型による安全な値の処理
export type Maybe<T> = T | null | undefined

export const mapMaybe = <T, U>(fn: (value: T) => U) => 
  (maybe: Maybe<T>): Maybe<U> => 
    maybe != null ? fn(maybe) : maybe

export const flatMapMaybe = <T, U>(fn: (value: T) => Maybe<U>) => 
  (maybe: Maybe<T>): Maybe<U> => 
    maybe != null ? fn(maybe) : maybe

// Result型によるエラーハンドリング
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

export const success = <T>(data: T): Result<T> => ({ success: true, data })
export const failure = <E>(error: E): Result<never, E> => ({ success: false, error })

export const mapResult = <T, U, E>(fn: (value: T) => U) => 
  (result: Result<T, E>): Result<U, E> =>
    result.success ? success(fn(result.data)) : result

// 使用例
export const safeParseInt = (str: string): Result<number, string> => {
  const num = parseInt(str, 10)
  return isNaN(num) ? failure('Invalid number') : success(num)
}
```

### 関数型アプローチの使用例

```typescript
// src/features/questions/services/question-service-functional.ts
import { pipe, pipeAsync, mapResult, Result } from '@/src/lib/utils/functional'
import { getUserAnswerHistory, saveQuestion } from '@/src/lib/prisma/client'
import { generateQuestion } from '@/src/lib/openai/client'

// 関数型パイプラインによる質問生成
export const generateNextQuestionFunctional = async (
  userId: string,
  request: QuestionGenerationRequest
): Promise<Result<QuestionResponse, string>> => {
  
  const fetchHistory = async () => {
    try {
      const history = await getUserAnswerHistory(userId)
      return success(history)
    } catch (error) {
      return failure(`Failed to fetch history: ${error.message}`)
    }
  }
  
  const createQuestion = (history: any[]) => async () => {
    try {
      const question = await generateQuestion({
        answers: request.answers,
        history,
        preferences: request.preferences
      })
      return success(question)
    } catch (error) {
      return failure(`Failed to generate question: ${error.message}`)
    }
  }
  
  const persistQuestion = (question: any) => async () => {
    try {
      await saveQuestion(userId, question)
      return success({
        question: question.text,
        questionIndex: request.currentQuestionIndex + 1,
        questionId: question.id
      })
    } catch (error) {
      return failure(`Failed to save question: ${error.message}`)
    }
  }
  
  // パイプラインによる処理フロー
  const historyResult = await fetchHistory()
  if (!historyResult.success) return historyResult
  
  const questionResult = await createQuestion(historyResult.data)()
  if (!questionResult.success) return questionResult
  
  return await persistQuestion(questionResult.data)()
}
```

## セキュリティ対策

1. **APIキー保護**: OpenAI APIキーは環境変数でサーバーサイドのみ
2. **認証チェック**: 全APIルートでSupabase認証確認
3. **Prisma RLS**: Row Level Securityポリシーとの連携
4. **CSRF対策**: Next.jsのCSRF保護を活用
5. **入力検証**: Prismaスキーマレベルでの制約とTypeScript型チェック
6. **SQL Injection対策**: Prismaの自動エスケープ機能
7. **関数型エラーハンドリング**: Result型による安全なエラー処理

## デプロイメント

- **推奨**: Vercel (Next.js最適化)
- **代替**: Netlify, Railway
- **環境変数**: 本番環境で適切に設定