"use client";

import { useEffect, useState } from "react";
import type {
  Answer,
  Question,
  QuestionSession,
} from "../../../types/database";
import { useAuth } from "../../auth/components/auth-provider";

interface Location {
  latitude: number;
  longitude: number;
  prefecture?: string;
  city?: string;
}

interface QuestionFlowProps {
  sessionId?: string;
  onComplete?: (sessionId: string) => void;
  onError?: (error: string) => void;
}

export function QuestionFlow({
  sessionId,
  onComplete,
  onError,
}: QuestionFlowProps) {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<QuestionSession | null>(
    null,
  );
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 10 });

  // 位置情報の取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("位置情報の取得に失敗しました:", error);
        },
      );
    }
  }, []);

  // セッションの初期化または読み込み
  useEffect(() => {
    if (!user) return;

    if (sessionId) {
      loadExistingSession(sessionId);
    } else {
      createNewSession();
    }
  }, [user, sessionId]);

  // 新しいセッションの作成
  const createNewSession = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          time_of_day: getTimeOfDay(),
          location: location,
        }),
      });

      if (!response.ok) {
        throw new Error("セッションの作成に失敗しました");
      }

      const result = await response.json();
      const session = result.data;
      setCurrentSession(session);
      await loadNextQuestion(session.id);
    } catch (error) {
      console.error("セッション作成エラー:", error);
      onError?.("セッションの作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 既存セッションの読み込み
  const loadExistingSession = async (sessionId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("セッションの読み込みに失敗しました");
      }

      const result = await response.json();
      const session = result.data;
      setCurrentSession(session);
      setAnswers(session.answers || []);
      setProgress({
        current: session.answers?.length || 0,
        total: 10,
      });

      // セッションが完了している場合
      if (session.status !== "in_progress") {
        onComplete?.(sessionId);
        return;
      }

      await loadNextQuestion(sessionId);
    } catch (error) {
      console.error("セッション読み込みエラー:", error);
      onError?.("セッションの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // 次の質問の読み込み
  const loadNextQuestion = async (sessionId: string) => {
    try {
      const response = await fetch(
        `/api/sessions/${sessionId}/questions/next`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          // 質問が終了した場合
          await completeSession(sessionId);
          return;
        }
        if (response.status === 400) {
          // 最大質問数に達した場合の処理
          try {
            const errorData = await response.json();
            if (errorData.shouldGenerateRecommendation) {
              await completeSession(sessionId);
              return;
            }
          } catch (e) {
            // JSON解析に失敗した場合は通常エラーとして処理
          }
        }
        throw new Error("質問の読み込みに失敗しました");
      }

      const result = await response.json();
      const question = result.data.question;
      setCurrentQuestion(question);
    } catch (error) {
      console.error("質問読み込みエラー:", error);
      onError?.("質問の読み込みに失敗しました");
    }
  };

  // 回答の送信
  const submitAnswer = async (response: boolean, notes?: string) => {
    if (!currentSession || !currentQuestion) return;

    setSubmittingAnswer(true);
    try {
      const res = await fetch(`/api/sessions/${currentSession.id}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          question_id: currentQuestion.id,
          response,
          response_time: 0, // 実際の回答時間を追加可能
        }),
      });

      if (!res.ok) {
        throw new Error("回答の送信に失敗しました");
      }

      const answer = await res.json();
      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);
      setProgress({
        current: newAnswers.length,
        total: 10,
      });

      // 次の質問を読み込み
      await loadNextQuestion(currentSession.id);
    } catch (error) {
      console.error("回答送信エラー:", error);
      onError?.("回答の送信に失敗しました");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // セッションの完了
  const completeSession = async (sessionId: string) => {
    try {
      // セッションの状態を完了に更新
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: "completed",
          completed_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // レコメンデーション生成API呼び出し
        try {
          const recResponse = await fetch("/api/ai/generate-recommendation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              sessionId: sessionId,
            }),
          });

          if (recResponse.ok) {
            console.log("レコメンデーション生成完了");
          } else {
            console.warn(
              "レコメンデーション生成に失敗しましたが、セッションは完了しました",
            );
          }
        } catch (recError) {
          console.error("レコメンデーション生成エラー:", recError);
        }

        onComplete?.(sessionId);
      }
    } catch (error) {
      console.error("セッション完了エラー:", error);
    }
  };

  // 時間帯の判定
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "breakfast";
    if (hour < 17) return "lunch";
    return "dinner";
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">ログインが必要です</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">質問を読み込めませんでした</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">進行状況</span>
          <span className="text-sm text-gray-500">
            {progress.current} / {progress.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 質問カード */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            質問 {currentQuestion.questionIndex}
          </span>
          {currentQuestion.category && (
            <span className="ml-2 inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              {getCategoryLabel(currentQuestion.category)}
            </span>
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {currentQuestion.text}
        </h2>

        {/* 回答ボタン */}
        <div className="flex space-x-4">
          <button
            onClick={() => submitAnswer(true)}
            disabled={submittingAnswer}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submittingAnswer ? "送信中..." : "はい"}
          </button>

          <button
            onClick={() => submitAnswer(false)}
            disabled={submittingAnswer}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submittingAnswer ? "送信中..." : "いいえ"}
          </button>
        </div>
      </div>

      {/* 回答履歴（簡易表示） */}
      {answers.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">回答履歴</h3>
          <div className="flex flex-wrap gap-2">
            {answers.slice(-5).map((answer, index) => (
              <div
                key={answer.id}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  answer.response
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                Q{answers.length - 4 + index}:{" "}
                {answer.response ? "はい" : "いいえ"}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// カテゴリラベルの取得
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    MOOD: "気分",
    PREFERENCE: "好み",
    DIETARY: "食事制限",
    LOCATION: "場所",
    TIME: "時間",
    BUDGET: "予算",
  };
  return labels[category] || category;
}
