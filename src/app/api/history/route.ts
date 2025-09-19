import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@/lib/supabase";

// GET /api/history - ユーザーの食事履歴を取得
export async function GET(request: NextRequest) {
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

    // クエリパラメータを取得
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "20", 10),
      100,
    ); // 最大100件
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0); // 負の値は0に
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("userId") || user.id;

    // パラメータバリデーション
    if (limit > 100) {
      return NextResponse.json(
        { error: "Limit cannot exceed 100" },
        { status: 400 },
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: "Offset cannot be negative" },
        { status: 400 },
      );
    }

    // 権限チェック: 他のユーザーの履歴は取得できない（管理者以外）
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Access denied to other user's history" },
        { status: 403 },
      );
    }

    // WHERE条件を構築
    const whereCondition: {
      user_id: string;
      consumed_at?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      user_id: userId,
    };

    // 日付範囲フィルター
    if (startDate || endDate) {
      whereCondition.consumed_at = {};
      if (startDate) {
        whereCondition.consumed_at.gte = new Date(startDate);
      }
      if (endDate) {
        whereCondition.consumed_at.lte = new Date(endDate);
      }
    }

    // 履歴を取得
    const history = await prisma.mealHistory.findMany({
      where: whereCondition,
      orderBy: { consumed_at: "desc" },
      take: limit,
      skip: offset,
    });

    // 総数を取得
    const totalCount = await prisma.mealHistory.count({
      where: whereCondition,
    });

    // レスポンス形式をテストの期待値に合わせる
    return NextResponse.json({
      items: history.map((item) => ({
        id: item.id,
        userId: item.user_id,
        mealName: item.meal_name,
        cuisineGenre: item.cuisine_genre.toLowerCase(),
        consumedAt: item.consumed_at,
        source: item.source.toLowerCase().replace("_", "_"),
        satisfaction: item.satisfaction,
        createdAt: item.created_at,
      })),
      total: totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error("Error in history GET API:", error);

    if (error instanceof Error && error.message.includes("Invalid date")) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 },
      );
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
