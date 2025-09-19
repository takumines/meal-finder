import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@/lib/supabase";

interface RatingUpdateRequest {
  rating: number;
}

// PUT /api/history/[historyId]/rating - 食事履歴の評価を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ historyId: string }> },
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

    // パラメータ取得
    const { historyId } = await params;

    // リクエストボディを取得
    const body = await request.json();
    const { rating }: RatingUpdateRequest = body;

    // バリデーション
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 },
      );
    }

    // 履歴が存在し、かつユーザーの所有であることを確認
    const existingHistory = await prisma.mealHistory.findUnique({
      where: { id: historyId },
    });

    if (!existingHistory) {
      return NextResponse.json({ error: "History not found" }, { status: 404 });
    }

    if (existingHistory.user_id !== user.id) {
      return NextResponse.json(
        { error: "Access denied to update other user's history" },
        { status: 403 },
      );
    }

    // 評価を更新
    const updatedHistory = await prisma.mealHistory.update({
      where: { id: historyId },
      data: {
        satisfaction: rating,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedHistory.id,
        satisfaction: updatedHistory.satisfaction,
        updated_at: new Date(),
      },
    });
  } catch (error) {
    console.error("Error in rating PUT API:", error);

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

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
