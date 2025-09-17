import { type NextRequest, NextResponse } from "next/server";
import type { GenerateQuestionParams } from "../../../../features/questions/services/question-service";
import { generateQuestion } from "../../../../features/questions/services/question-service";
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
    const {
      userProfile,
      previousAnswers = [],
      timeOfDay,
      location,
      sessionId,
    }: GenerateQuestionParams = body;

    // 必須パラメータの検証
    if (!userProfile || !timeOfDay || !sessionId) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: userProfile, timeOfDay, sessionId",
        },
        { status: 400 },
      );
    }

    // ユーザーIDの検証
    if (userProfile.id !== user.id) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    // 質問生成サービスを呼び出し
    const question = await generateQuestion({
      userProfile,
      previousAnswers,
      timeOfDay,
      location,
      sessionId,
    });

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Error in generate-question API:", error);

    // エラーの種類に応じて適切なステータスコードを返す
    if (error instanceof Error) {
      if (error.message.includes("Failed to generate AI question")) {
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
