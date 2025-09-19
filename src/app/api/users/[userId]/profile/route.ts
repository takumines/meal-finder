import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@/lib/supabase";
import type { UserProfile, UserProfileUpdate } from "@/types";

interface RouteContext {
  params: Promise<{
    userId: string;
  }>;
}

// GET /api/users/[userId]/profile - ユーザープロファイルを取得
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;

    // 認証チェック
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ユーザーIDの検証（自分のプロファイルのみアクセス可能）
    if (user.id !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // プロファイルを取得
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: params.userId },
    });

    if (!userProfile) {
      // プロファイルが存在しない場合、デフォルトプロファイルを作成
      const newProfile = await prisma.userProfile.create({
        data: {
          id: params.userId,
          preferred_genres: [],
          allergies: [],
          spice_preference: "MEDIUM",
          budget_range: "MODERATE",
        },
      });

      return NextResponse.json(newProfile);
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error in profile GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT /api/users/[userId]/profile - ユーザープロファイルを更新
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;

    // 認証チェック
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ユーザーIDの検証（自分のプロファイルのみ更新可能）
    if (user.id !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // リクエストボディを取得
    const body: UserProfileUpdate = await request.json();
    console.log(body);

    // 既存のプロファイルを確認
    const existingProfile = await prisma.userProfile.findUnique({
      where: { id: params.userId },
    });

    let updatedProfile: UserProfile;

    if (existingProfile) {
      // プロファイルが存在する場合は更新
      updatedProfile = await prisma.userProfile.update({
        where: { id: params.userId },
        data: {
          ...body,
        },
      });
    } else {
      // プロファイルが存在しない場合は作成
      updatedProfile = await prisma.userProfile.create({
        data: {
          id: params.userId,
          preferred_genres: body.preferred_genres || [],
          allergies: body.allergies || [],
          spice_preference: body.spice_preference || "MEDIUM",
          budget_range: body.budget_range || "MODERATE",
        },
      });
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Error in profile PUT API:", error);

    // Prismaエラーのハンドリング
    if (error instanceof Error) {
      if (error.message.includes("Invalid enum value")) {
        return NextResponse.json(
          { error: "Invalid field value" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/users/[userId]/profile - ユーザープロファイルを削除
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const params = await context.params;

    // 認証チェック
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ユーザーIDの検証（自分のプロファイルのみ削除可能）
    if (user.id !== params.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // プロファイルを削除
    await prisma.userProfile.delete({
      where: { id: params.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in profile DELETE API:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
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
