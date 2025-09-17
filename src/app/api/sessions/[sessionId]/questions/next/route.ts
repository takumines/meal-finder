import { type NextRequest, NextResponse } from "next/server";
import { generateQuestion } from "../../../../../../features/questions/services/question-service";
import { prisma } from "../../../../../../lib/prisma/client";
import { createClient } from "../../../../../../lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
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

    const { sessionId } = await params;

    // セッションIDの検証
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // セッションの存在確認とユーザー所有権チェック
    const session = await prisma.questionSession.findFirst({
      where: {
        id: sessionId,
        user_id: user.id,
      },
      include: {
        answers: {
          orderBy: { answered_at: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // セッションが非アクティブまたは完了している場合
    if (session.status !== "in_progress" || session.completed_at) {
      return NextResponse.json(
        { error: "Session is not active or already completed" },
        { status: 400 },
      );
    }

    // 最大質問数に達している場合
    const maxQuestions = 10;
    if (session.answers.length >= maxQuestions) {
      return NextResponse.json(
        {
          error: "Maximum number of questions reached",
          shouldGenerateRecommendation: true,
        },
        { status: 400 },
      );
    }

    // ユーザープロファイルを取得
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: user.id },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 },
      );
    }

    // 次の質問を生成
    const question = await generateQuestion({
      userProfile: {
        id: userProfile.id,
        preferred_genres: userProfile.preferred_genres as any,
        allergies: userProfile.allergies as string[],
        spice_preference: userProfile.spice_preference as any,
        budget_range: userProfile.budget_range as any,
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at,
      },
      previousAnswers: session.answers.map((answer) => ({
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

    // 進捗情報を計算
    const progress = {
      current: session.answers.length + 1,
      total: maxQuestions,
      percentage: Math.round(
        ((session.answers.length + 1) / maxQuestions) * 100,
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        question,
        progress,
        session: {
          id: session.id,
          answeredQuestions: session.answers.length,
          canContinue: session.answers.length + 1 < maxQuestions,
          shouldGenerateRecommendation: session.answers.length + 1 >= 3, // 最低3問で推薦可能
        },
      },
    });
  } catch (error) {
    console.error("Error in next question API:", error);

    // エラーの種類に応じて適切なステータスコードを返す
    if (error instanceof Error) {
      if (error.message.includes("Failed to generate AI question")) {
        return NextResponse.json(
          {
            error:
              "AI service temporarily unavailable. Please try again later.",
          },
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
export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
