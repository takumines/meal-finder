import type { SessionStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@/lib/supabase";
import type { TimeSlot } from "@/types";

interface CreateSessionRequest {
  time_of_day: TimeSlot;
  location?: {
    latitude: number;
    longitude: number;
    prefecture?: string;
    city?: string;
  };
}

export async function POST(request: NextRequest) {
  console.log("hogehogehoge");
  try {
    // 認証チェック
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // デバッグログ
    console.log("Auth check result:", { user: !!user, authError: !!authError });

    if (authError || !user) {
      console.log("Authentication failed:", authError?.message || "No user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // リクエストボディを取得
    const body = await request.json();
    const { time_of_day, location }: CreateSessionRequest = body;

    // 必須パラメータの検証
    if (!time_of_day) {
      return NextResponse.json(
        { error: "Missing required parameter: time_of_day" },
        { status: 400 },
      );
    }

    // time_of_dayの値を検証
    const validTimeSlots: TimeSlot[] = [
      "BREAKFAST",
      "LUNCH",
      "DINNER",
      "SNACK",
    ];
    if (!validTimeSlots.includes(time_of_day)) {
      return NextResponse.json(
        {
          error:
            "Invalid time_of_day. Must be one of: BREAKFAST, LUNCH, DINNER, SNACK",
        },
        { status: 400 },
      );
    }

    // Prismaを使用してセッションを作成
    const questionSession = await prisma.questionSession.create({
      data: {
        user_id: user.id,
        time_of_day,
        location: location ? JSON.stringify(location) : Prisma.JsonNull,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: questionSession.id,
        user_id: questionSession.user_id,
        time_of_day: questionSession.time_of_day,
        location: questionSession.location
          ? JSON.parse(questionSession.location as string)
          : null,
        status: questionSession.status,
        created_at: questionSession.created_at,
        updated_at: questionSession.updated_at,
      },
    });
  } catch (error) {
    console.error("Error in sessions POST API:", error);

    // Prismaエラーのハンドリング
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "User profile not found" },
          { status: 404 },
        );
      }

      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Duplicate session" },
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

// GET /api/sessions - ユーザーのセッション一覧を取得
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
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const status = searchParams.get("status");

    // セッション一覧を取得
    const whereCondition: { user_id: string; status?: SessionStatus } = {
      user_id: user.id,
    };
    if (status) {
      whereCondition.status = status as SessionStatus;
    }

    const sessions = await prisma.questionSession.findMany({
      where: whereCondition,
      orderBy: { created_at: "desc" },
      take: limit,
      skip: offset,
      include: {
        answers: {
          select: {
            id: true,
            question_id: true,
            response: true,
            answered_at: true,
          },
        },
      },
    });

    // 総数を取得
    const totalCount = await prisma.questionSession.count({
      where: whereCondition,
    });

    return NextResponse.json({
      success: true,
      data: {
        sessions: sessions.map((session) => ({
          ...session,
          location: session.location
            ? JSON.parse(session.location as string)
            : null,
        })),
        total: totalCount,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error in sessions GET API:", error);
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
