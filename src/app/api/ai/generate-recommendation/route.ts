import { type NextRequest, NextResponse } from "next/server";
import { generateRecommendation } from "../../../../features/meals/services/recommendation-service";
import { prisma } from "../../../../lib/prisma/client";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディを取得
    const body = await request.json();
    const { sessionId } = body;

    // 必須パラメータの検証
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing required parameter: sessionId" },
        { status: 400 },
      );
    }

    // セッションデータを取得
    const session = await prisma.questionSession.findFirst({
      where: {
        id: sessionId,
        user_id: user.id,
      },
      include: {
        answers: {
          orderBy: { answered_at: "asc" },
        },
        user_profile: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!session.user_profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    // 回答数の検証（最低3問は必要）
    if (session.answers.length < 3) {
      return NextResponse.json(
        { error: "Insufficient answers for recommendation generation" },
        { status: 400 },
      );
    }

    // 推薦生成サービスを呼び出し
    const generatedRecommendation = await generateRecommendation({
      userProfile: {
        id: session.user_profile.id,
        preferred_genres: session.user_profile.preferred_genres as any,
        allergies: session.user_profile.allergies as string[],
        spice_preference: session.user_profile.spice_preference as any,
        budget_range: session.user_profile.budget_range as any,
        created_at: session.user_profile.created_at,
        updated_at: session.user_profile.updated_at,
      },
      answers: session.answers.map((answer) => ({
        id: answer.id,
        session_id: answer.session_id,
        question_id: answer.question_id,
        response: answer.response,
        response_time: answer.response_time,
        question_index: answer.question_index,
        answered_at: answer.answered_at,
      })),
      timeOfDay: session.time_of_day as any,
      location: session.location
        ? JSON.parse(session.location as string)
        : undefined,
      sessionId,
    });

    // upsert を使用して既存の推薦を更新または新規作成
    const savedRecommendation = await prisma.mealRecommendation.upsert({
      where: { session_id: sessionId },
      update: {
        meal_name: generatedRecommendation.name,
        description: generatedRecommendation.description,
        cuisine_genre: generatedRecommendation.cuisine_genre,
        confidence: generatedRecommendation.confidence_score,
        reasoning_steps: [generatedRecommendation.reasoning],
      },
      create: {
        session_id: sessionId,
        meal_name: generatedRecommendation.name,
        description: generatedRecommendation.description,
        cuisine_genre: generatedRecommendation.cuisine_genre,
        confidence: generatedRecommendation.confidence_score,
        reasoning_steps: [generatedRecommendation.reasoning],
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: savedRecommendation.id,
        sessionId: savedRecommendation.session_id,
        mealName: savedRecommendation.meal_name,
        description: savedRecommendation.description,
        cuisineGenre: savedRecommendation.cuisine_genre,
        confidence: savedRecommendation.confidence,
        reasoningSteps: savedRecommendation.reasoning_steps,
        generatedRecommendation, // 追加のメタデータ
        createdAt: savedRecommendation.created_at,
      },
    });
  } catch (error) {
    console.error("Error in generate-recommendation API:", error);

    // エラーの種類に応じて適切なステータスコードを返す
    if (error instanceof Error) {
      if (error.message.includes("Failed to generate AI recommendation")) {
        return NextResponse.json(
          { error: "AI service temporarily unavailable" },
          { status: 503 },
        );
      }

      if (error.message.includes("Invalid")) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// メソッドが許可されていない場合のハンドリング
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
