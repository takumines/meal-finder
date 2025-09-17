import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@/lib/supabase";

interface CreateAnswerRequest {
  question_id: string;
  response: boolean;
  response_time?: number;
  question_index?: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    // 認証チェック
    const supabase = await createServerClient();
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

    // リクエストボディを取得
    const body = await request.json();
    const {
      question_id,
      response,
      response_time,
      question_index,
    }: CreateAnswerRequest = body;

    // 必須パラメータの検証
    if (!question_id || typeof response !== "boolean") {
      return NextResponse.json(
        { error: "Missing required parameters: question_id, response" },
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
        answers: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // セッションが非アクティブまたは完了している場合
    if (session.status !== "ACTIVE" || session.completed_at) {
      return NextResponse.json(
        { error: "Session is not active or already completed" },
        { status: 400 },
      );
    }

    // 最大回答数チェック
    const maxAnswers = 10;
    if (session.answers.length >= maxAnswers) {
      return NextResponse.json(
        { error: "Maximum number of answers reached" },
        { status: 400 },
      );
    }

    // 同じ質問に対する重複回答チェック
    const existingAnswer = session.answers.find(
      (answer) => answer.question_id === question_id,
    );

    if (existingAnswer) {
      return NextResponse.json(
        { error: "Answer for this question already exists" },
        { status: 409 },
      );
    }

    // 回答を作成
    const answer = await prisma.answer.create({
      data: {
        session_id: sessionId,
        question_id,
        response,
        response_time: response_time || 0,
        question_index: question_index || session.current_question_index + 1,
      },
    });

    // セッションの最終更新時刻を更新（@updatedAtにより自動更新）
    await prisma.questionSession.update({
      where: { id: sessionId },
      data: { current_question_index: session.current_question_index + 1 },
    });

    // 進捗情報を計算
    const newAnswerCount = session.answers.length + 1;
    const progress = {
      current: newAnswerCount,
      total: maxAnswers,
      percentage: Math.round((newAnswerCount / maxAnswers) * 100),
    };

    // 質問継続可能性の判定
    const canContinue = newAnswerCount < maxAnswers;
    const shouldGenerateRecommendation = newAnswerCount >= 3; // 最低3問で推薦可能
    const isComplete = newAnswerCount >= maxAnswers;

    return NextResponse.json({
      success: true,
      data: {
        answer: {
          id: answer.id,
          session_id: answer.session_id,
          question_id: answer.question_id,
          response: answer.response,
          response_time: answer.response_time,
          question_index: answer.question_index,
          answered_at: answer.answered_at,
        },
        progress,
        session: {
          id: sessionId,
          answeredQuestions: newAnswerCount,
          canContinue,
          shouldGenerateRecommendation,
          isComplete,
        },
      },
    });
  } catch (error) {
    console.error("Error in answers POST API:", error);

    // Prismaエラーのハンドリング
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Invalid session or question ID" },
          { status: 400 },
        );
      }

      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Duplicate answer for this question" },
          { status: 409 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET /api/sessions/[sessionId]/answers - セッションの回答一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    // 認証チェック
    const supabase = await createServerClient();
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
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 回答一覧を取得
    const answers = await prisma.answer.findMany({
      where: { session_id: sessionId },
      orderBy: { answered_at: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        answers,
        session: {
          id: sessionId,
          answeredQuestions: answers.length,
          progress: {
            current: answers.length,
            total: 10,
            percentage: Math.round((answers.length / 10) * 100),
          },
        },
      },
    });
  } catch (error) {
    console.error("Error in answers GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// メソッドが許可されていない場合のハンドリング
export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
