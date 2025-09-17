-- CreateEnum
CREATE TYPE "public"."CuisineGenre" AS ENUM ('japanese', 'chinese', 'korean', 'italian', 'french', 'american', 'indian', 'thai', 'mexican', 'other');

-- CreateEnum
CREATE TYPE "public"."SpiceLevel" AS ENUM ('none', 'mild', 'medium', 'hot', 'very_hot');

-- CreateEnum
CREATE TYPE "public"."BudgetRange" AS ENUM ('budget', 'moderate', 'premium', 'luxury');

-- CreateEnum
CREATE TYPE "public"."TimeSlot" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('in_progress', 'completed', 'abandoned');

-- CreateEnum
CREATE TYPE "public"."QuestionCategory" AS ENUM ('mood', 'genre', 'cooking', 'situation', 'time', 'preference');

-- CreateEnum
CREATE TYPE "public"."MealSource" AS ENUM ('recommendation', 'manual_entry');

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" UUID NOT NULL,
    "preferred_genres" "public"."CuisineGenre"[],
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "spice_preference" "public"."SpiceLevel" NOT NULL,
    "budget_range" "public"."BudgetRange" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "status" "public"."SessionStatus" NOT NULL DEFAULT 'in_progress',
    "time_of_day" "public"."TimeSlot" NOT NULL,
    "location" JSONB,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "no_answer_count" INTEGER NOT NULL DEFAULT 0,
    "current_question_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."answers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "response" BOOLEAN NOT NULL,
    "response_time" INTEGER NOT NULL,
    "question_index" INTEGER NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."meal_recommendations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "meal_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cuisine_genre" "public"."CuisineGenre" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "reasoning_steps" TEXT[],
    "user_reaction" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."meal_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "meal_name" TEXT NOT NULL,
    "cuisine_genre" "public"."CuisineGenre" NOT NULL,
    "consumed_at" TIMESTAMP(3) NOT NULL,
    "session_id" UUID,
    "source" "public"."MealSource" NOT NULL DEFAULT 'recommendation',
    "satisfaction" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "question_sessions_user_id_status_started_at_idx" ON "public"."question_sessions"("user_id", "status", "started_at");

-- CreateIndex
CREATE INDEX "answers_session_id_idx" ON "public"."answers"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "answers_session_id_question_index_key" ON "public"."answers"("session_id", "question_index");

-- CreateIndex
CREATE UNIQUE INDEX "meal_recommendations_session_id_key" ON "public"."meal_recommendations"("session_id");

-- CreateIndex
CREATE INDEX "meal_history_user_id_consumed_at_idx" ON "public"."meal_history"("user_id", "consumed_at");

-- CreateIndex
CREATE INDEX "meal_history_cuisine_genre_idx" ON "public"."meal_history"("cuisine_genre");

-- CreateIndex
CREATE INDEX "meal_history_session_id_idx" ON "public"."meal_history"("session_id");

-- AddForeignKey
ALTER TABLE "public"."question_sessions" ADD CONSTRAINT "question_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answers" ADD CONSTRAINT "answers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."question_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meal_recommendations" ADD CONSTRAINT "meal_recommendations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."question_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meal_history" ADD CONSTRAINT "meal_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
