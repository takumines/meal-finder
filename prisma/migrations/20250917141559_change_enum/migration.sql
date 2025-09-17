/*
  Warnings:

  - The values [budget,moderate,premium,luxury] on the enum `BudgetRange` will be removed. If these variants are still used in the database, this will fail.
  - The values [japanese,chinese,korean,italian,french,american,indian,thai,mexican,other] on the enum `CuisineGenre` will be removed. If these variants are still used in the database, this will fail.
  - The values [recommendation,manual_entry] on the enum `MealSource` will be removed. If these variants are still used in the database, this will fail.
  - The values [mood,genre,cooking,situation,time,preference] on the enum `QuestionCategory` will be removed. If these variants are still used in the database, this will fail.
  - The values [in_progress,completed,abandoned] on the enum `SessionStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [none,mild,medium,hot,very_hot] on the enum `SpiceLevel` will be removed. If these variants are still used in the database, this will fail.
  - The values [BREAKFAST,LUNCH,DINNER,SNACK] on the enum `TimeSlot` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."BudgetRange_new" AS ENUM ('BUDGET', 'MODERATE', 'PREMIUM', 'LUXURY');
ALTER TABLE "public"."user_profiles" ALTER COLUMN "budget_range" TYPE "public"."BudgetRange_new" USING ("budget_range"::text::"public"."BudgetRange_new");
ALTER TYPE "public"."BudgetRange" RENAME TO "BudgetRange_old";
ALTER TYPE "public"."BudgetRange_new" RENAME TO "BudgetRange";
DROP TYPE "public"."BudgetRange_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."CuisineGenre_new" AS ENUM ('JAPANESE', 'CHINESE', 'KOREAN', 'ITALIAN', 'FRENCH', 'AMERICAN', 'INDIAN', 'THAI', 'MEXICAN', 'OTHER');
ALTER TABLE "public"."user_profiles" ALTER COLUMN "preferred_genres" TYPE "public"."CuisineGenre_new"[] USING ("preferred_genres"::text::"public"."CuisineGenre_new"[]);
ALTER TABLE "public"."meal_recommendations" ALTER COLUMN "cuisine_genre" TYPE "public"."CuisineGenre_new" USING ("cuisine_genre"::text::"public"."CuisineGenre_new");
ALTER TABLE "public"."meal_history" ALTER COLUMN "cuisine_genre" TYPE "public"."CuisineGenre_new" USING ("cuisine_genre"::text::"public"."CuisineGenre_new");
ALTER TYPE "public"."CuisineGenre" RENAME TO "CuisineGenre_old";
ALTER TYPE "public"."CuisineGenre_new" RENAME TO "CuisineGenre";
DROP TYPE "public"."CuisineGenre_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."MealSource_new" AS ENUM ('RECOMMENDATION', 'MANUAL_ENTRY');
ALTER TABLE "public"."meal_history" ALTER COLUMN "source" DROP DEFAULT;
ALTER TABLE "public"."meal_history" ALTER COLUMN "source" TYPE "public"."MealSource_new" USING ("source"::text::"public"."MealSource_new");
ALTER TYPE "public"."MealSource" RENAME TO "MealSource_old";
ALTER TYPE "public"."MealSource_new" RENAME TO "MealSource";
DROP TYPE "public"."MealSource_old";
ALTER TABLE "public"."meal_history" ALTER COLUMN "source" SET DEFAULT 'RECOMMENDATION';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."QuestionCategory_new" AS ENUM ('MOOD', 'GENRE', 'COOKING', 'SITUATION', 'TIME', 'PREFERENCE');
ALTER TYPE "public"."QuestionCategory" RENAME TO "QuestionCategory_old";
ALTER TYPE "public"."QuestionCategory_new" RENAME TO "QuestionCategory";
DROP TYPE "public"."QuestionCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."SessionStatus_new" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');
ALTER TABLE "public"."question_sessions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."question_sessions" ALTER COLUMN "status" TYPE "public"."SessionStatus_new" USING ("status"::text::"public"."SessionStatus_new");
ALTER TYPE "public"."SessionStatus" RENAME TO "SessionStatus_old";
ALTER TYPE "public"."SessionStatus_new" RENAME TO "SessionStatus";
DROP TYPE "public"."SessionStatus_old";
ALTER TABLE "public"."question_sessions" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."SpiceLevel_new" AS ENUM ('NONE', 'MILD', 'MEDIUM', 'HOT', 'VERY_HOT');
ALTER TABLE "public"."user_profiles" ALTER COLUMN "spice_preference" TYPE "public"."SpiceLevel_new" USING ("spice_preference"::text::"public"."SpiceLevel_new");
ALTER TYPE "public"."SpiceLevel" RENAME TO "SpiceLevel_old";
ALTER TYPE "public"."SpiceLevel_new" RENAME TO "SpiceLevel";
DROP TYPE "public"."SpiceLevel_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."TimeSlot_new" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');
ALTER TABLE "public"."question_sessions" ALTER COLUMN "time_of_day" TYPE "public"."TimeSlot_new" USING ("time_of_day"::text::"public"."TimeSlot_new");
ALTER TYPE "public"."TimeSlot" RENAME TO "TimeSlot_old";
ALTER TYPE "public"."TimeSlot_new" RENAME TO "TimeSlot";
DROP TYPE "public"."TimeSlot_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."meal_history" ALTER COLUMN "source" SET DEFAULT 'RECOMMENDATION';

-- AlterTable
ALTER TABLE "public"."question_sessions" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
