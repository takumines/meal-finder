import type { AuthError, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export class AuthManager {
  async signUp(
    data: SignUpData,
  ): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { email, password, firstName, lastName } = data;

      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        return { user: null, error };
      }

      // ユーザープロファイルを作成
      if (authData.user) {
        await this.createUserProfile(authData.user.id, {
          firstName,
          lastName,
        });
      }

      return { user: authData.user, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        user: null,
        error: error as AuthError,
      };
    }
  }

  async signIn(
    data: SignInData,
  ): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { email, password } = data;

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error };
      }

      return { user: authData.user, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        user: null,
        error: error as AuthError,
      };
    }
  }

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error: error as AuthError };
    }
  }

  async resetPassword(
    data: ResetPasswordData,
  ): Promise<{ error: AuthError | null }> {
    try {
      const { email } = data;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      return { error };
    } catch (error) {
      console.error("Reset password error:", error);
      return { error: error as AuthError };
    }
  }

  async updatePassword(
    newPassword: string,
  ): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { error };
    } catch (error) {
      console.error("Update password error:", error);
      return { error: error as AuthError };
    }
  }

  async updateProfile(
    data: UpdateProfileData,
  ): Promise<{ error: AuthError | null }> {
    try {
      const { firstName, lastName, avatarUrl } = data;

      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
        },
      });

      return { error };
    } catch (error) {
      console.error("Update profile error:", error);
      return { error: error as AuthError };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Get current user error:", error);
        return null;
      }

      return user;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Get current session error:", error);
        return null;
      }

      return session;
    } catch (error) {
      console.error("Get current session error:", error);
      return null;
    }
  }

  async refreshSession(): Promise<{
    session: Session | null;
    error: AuthError | null;
  }> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        return { session: null, error };
      }

      return { session: data.session, error: null };
    } catch (error) {
      console.error("Refresh session error:", error);
      return {
        session: null,
        error: error as AuthError,
      };
    }
  }

  onAuthStateChange(
    callback: (user: User | null, session: Session | null) => void,
  ) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null, session);
    });

    return subscription;
  }

  async signInWithOAuth(
    provider: "google" | "github" | "apple",
  ): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error };
    } catch (error) {
      console.error(`OAuth sign in error (${provider}):`, error);
      return { error: error as AuthError };
    }
  }

  async verifyEmail(
    token: string,
    type: "signup" | "recovery" = "signup",
  ): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type === "signup" ? "email" : "recovery",
      });

      return { error };
    } catch (error) {
      console.error("Verify email error:", error);
      return { error: error as AuthError };
    }
  }

  async resendVerification(
    email: string,
  ): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      return { error };
    } catch (error) {
      console.error("Resend verification error:", error);
      return { error: error as AuthError };
    }
  }

  private async createUserProfile(
    userId: string,
    _data: { firstName?: string; lastName?: string },
  ) {
    try {
      const { error } = await supabase.from("user_profiles").insert({
        id: userId,
        preferred_genres: [],
        allergies: [],
        spice_preference: "MILD",
        budget_range: "MODERATE",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Create user profile error:", error);
      }
    } catch (error) {
      console.error("Create user profile error:", error);
    }
  }

  // セキュリティ関連のユーティリティ
  async checkPasswordStrength(password: string): Promise<{
    score: number;
    feedback: string[];
    isValid: boolean;
  }> {
    let score = 0;
    const feedback: string[] = [];

    // 長さをチェック
    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push("パスワードは8文字以上にしてください");
    }

    // 大文字をチェック
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push("大文字を含めてください");
    }

    // 小文字をチェック
    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push("小文字を含めてください");
    }

    // 数字をチェック
    if (/\d/.test(password)) {
      score += 20;
    } else {
      feedback.push("数字を含めてください");
    }

    // 特殊文字をチェック
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 20;
    } else {
      feedback.push("特殊文字を含めてください");
    }

    return {
      score,
      feedback,
      isValid: score >= 80,
    };
  }

  async getUserRole(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Get user role error:", error);
        return null;
      }

      return data?.role || "user";
    } catch (error) {
      console.error("Get user role error:", error);
      return null;
    }
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const role = await this.getUserRole(userId);

      // 基本的な権限チェック（実際の実装ではより詳細な権限システムを構築）
      const permissions = {
        admin: ["read", "write", "delete", "manage_users"],
        moderator: ["read", "write", "moderate"],
        user: ["read", "write_own"],
      };

      const userPermissions =
        permissions[role as keyof typeof permissions] || [];
      return userPermissions.includes(permission);
    } catch (error) {
      console.error("Permission check error:", error);
      return false;
    }
  }

  // セッション管理
  async extendSession(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Extend session error:", error);
        return false;
      }

      return !!data.session;
    } catch (error) {
      console.error("Extend session error:", error);
      return false;
    }
  }

  async isSessionExpired(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();

      if (!session) {
        return true;
      }

      if (!session.expires_at) {
        return true; // expires_atがない場合は期限切れとみなす
      }

      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();

      return expiresAt <= now;
    } catch (error) {
      console.error("Session expiry check error:", error);
      return true;
    }
  }

  // アカウント管理
  async deleteAccount(userId: string): Promise<{ error: AuthError | null }> {
    try {
      // まずユーザープロファイルと関連データを削除
      await this.deleteUserData(userId);

      // 認証アカウントを削除（管理者権限が必要）
      // 実際の実装では、バックエンドAPIを通じて削除処理を行う
      const { error } = await supabase.auth.admin.deleteUser(userId);

      return { error };
    } catch (error) {
      console.error("Delete account error:", error);
      return { error: error as AuthError };
    }
  }

  private async deleteUserData(userId: string): Promise<void> {
    try {
      // 関連データを順次削除
      await supabase.from("meal_history").delete().eq("user_id", userId);
      await supabase.from("question_sessions").delete().eq("user_id", userId);
      await supabase.from("user_profiles").delete().eq("id", userId);
    } catch (error) {
      console.error("Delete user data error:", error);
      throw error;
    }
  }
}

export const authManager = new AuthManager();
