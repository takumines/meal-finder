"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";

interface LoginFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: "signin" | "signup";
}

export function LoginForm({
  onSuccess,
  onCancel,
  mode: initialMode = "signin",
}: LoginFormProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください。");
      return;
    }

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("パスワードが一致しません。");
        return;
      }
      if (password.length < 6) {
        setError("パスワードは6文字以上で入力してください。");
        return;
      }
    }

    setLoading(true);

    try {
      let result;

      if (mode === "signup") {
        result = await signUp(email, password);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        if (result.error.message.includes("Invalid login credentials")) {
          setError("メールアドレスまたはパスワードが正しくありません。");
        } else if (result.error.message.includes("User already registered")) {
          setError("このメールアドレスは既に登録されています。");
        } else {
          setError(result.error.message);
        }
      } else {
        // 成功
        if (mode === "signup") {
          setError(null);
          // サインアップ成功のメッセージ
          alert("アカウントが作成されました。確認メールをご確認ください。");
        }
        onSuccess?.();
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("認証エラーが発生しました。しばらく後にお試しください。");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
    setConfirmPassword("");
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        {mode === "signin" ? "ログイン" : "アカウント作成"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="example@email.com"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="パスワードを入力"
            required
          />
        </div>

        {mode === "signup" && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              パスワード（確認）
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="パスワードを再入力"
              required
            />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              処理中...
            </div>
          ) : mode === "signin" ? (
            "ログイン"
          ) : (
            "アカウント作成"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={toggleMode}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          {mode === "signin"
            ? "アカウントをお持ちでない場合はこちら"
            : "既にアカウントをお持ちの場合はこちら"}
        </button>
      </div>

      {onCancel && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  );
}

// より簡単なログインボタンコンポーネント
interface LoginButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export function LoginButton({
  variant = "primary",
  size = "md",
  onClick,
}: LoginButtonProps) {
  const baseClasses =
    "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      ログイン
    </button>
  );
}

// ログアウトボタンコンポーネント
interface LogoutButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  onLogout?: () => void;
}

export function LogoutButton({
  variant = "secondary",
  size = "md",
  onLogout,
}: LogoutButtonProps) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      onLogout?.();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  const baseClasses =
    "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";

  const variantClasses = {
    primary: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {loading ? "処理中..." : "ログアウト"}
    </button>
  );
}
