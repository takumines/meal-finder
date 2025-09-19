import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@/lib/supabase";

// GET /api/history/stats - ユーザーの食事履歴統計を取得
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
    const userId = searchParams.get("userId") || user.id;

    // 権限チェック: 他のユーザーの統計は取得できない（管理者以外）
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Access denied to other user's statistics" },
        { status: 403 },
      );
    }

    // 現在の日付
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const _lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 基本統計を並行して取得
    const [totalMeals, avgRatingResult, favoriteCuisineResult, thisMonthCount] =
      await Promise.all([
        // 総食事数
        prisma.mealHistory.count({
          where: { user_id: userId },
        }),

        // 平均評価
        prisma.mealHistory.aggregate({
          where: {
            user_id: userId,
            satisfaction: { not: null },
          },
          _avg: { satisfaction: true },
        }),

        // お気に入りジャンル（最も多い）
        prisma.mealHistory.groupBy({
          by: ["cuisine_genre"],
          where: { user_id: userId },
          _count: { cuisine_genre: true },
          orderBy: { _count: { cuisine_genre: "desc" } },
          take: 1,
        }),

        // 今月の食事数
        prisma.mealHistory.count({
          where: {
            user_id: userId,
            consumed_at: { gte: thisMonthStart },
          },
        }),
      ]);

    // お気に入りジャンルを取得（データがない場合は"---"）
    const favoriteCuisine =
      favoriteCuisineResult.length > 0
        ? favoriteCuisineResult[0].cuisine_genre.toLowerCase()
        : "---";

    // 平均評価を取得（データがない場合はnull）
    const averageRating = avgRatingResult._avg.satisfaction || null;

    // レスポンス形式をMealHistoryStatsコンポーネントの期待値に合わせる
    return NextResponse.json({
      totalMeals,
      averageRating,
      favoriteCuisine,
      thisMonthCount,
    });
  } catch (error) {
    console.error("Error in history stats GET API:", error);

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
