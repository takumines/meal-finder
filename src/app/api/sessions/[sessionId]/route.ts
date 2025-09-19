import type { SessionStatus } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
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

    // セッションを取得（回答、推薦結果も含む）
    const session = await prisma.questionSession.findFirst({
      where: {
        id: sessionId,
        user_id: user.id, // セキュリティ: 自分のセッションのみアクセス可能
      },
      include: {
        answers: {
          orderBy: { answered_at: "asc" },
          select: {
            id: true,
            question_id: true,
            response: true,
            response_time: true,
            answered_at: true,
          },
        },
        meal_recommendation: {
          select: {
            id: true,
            meal_name: true,
            description: true,
            cuisine_genre: true,
            confidence: true,
            reasoning_steps: true,
            user_reaction: true,
            created_at: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...session,
        location: session.location
          ? JSON.parse(session.location as string)
          : null,
        progress: {
          answeredQuestions: session.answers.length,
          totalQuestions: 10, // 最大質問数
          percentage: Math.round((session.answers.length / 10) * 100),
        },
      },
    });
  } catch (error) {
    console.error("Error in session GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/sessions/[sessionId] - セッション更新
export async function PUT(
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
    const body = await request.json();
    const { completed_at, status } = body;

    // セッションIDの検証
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // セッションが存在し、ユーザーが所有者であることを確認
    const existingSession = await prisma.questionSession.findFirst({
      where: {
        id: sessionId,
        user_id: user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // セッションを更新
    const updateData: {
      status?: SessionStatus;
      completed_at?: Date;
    } = {};

    if (status) {
      updateData.status = status as SessionStatus;
    }

    if (completed_at) {
      updateData.completed_at = new Date(completed_at);
    }

    const updatedSession = await prisma.questionSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedSession,
        location: updatedSession.location
          ? JSON.parse(updatedSession.location as string)
          : null,
      },
    });
  } catch (error) {
    console.error("Error in session PUT API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/sessions/[sessionId] - セッション削除
export async function DELETE(
  _request: NextRequest,
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

    // セッションが存在し、ユーザーが所有者であることを確認
    const existingSession = await prisma.questionSession.findFirst({
      where: {
        id: sessionId,
        user_id: user.id,
      },
    });

    if (!existingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // トランザクションでセッションと関連データを削除
    await prisma.$transaction(async (tx) => {
      // 関連する回答を削除
      await tx.answer.deleteMany({
        where: { session_id: sessionId },
      });

      // 関連する推薦を削除
      await tx.mealRecommendation.deleteMany({
        where: { session_id: sessionId },
      });

      // セッション自体を削除
      await tx.questionSession.delete({
        where: { id: sessionId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Error in session DELETE API:", error);
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
