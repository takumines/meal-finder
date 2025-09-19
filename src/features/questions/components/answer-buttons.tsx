"use client";

import { useState } from "react";

interface AnswerButtonsProps {
  onAnswer: (response: boolean, notes?: string) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "default" | "compact" | "detailed";
  showNotes?: boolean;
}

export function AnswerButtons({
  onAnswer,
  disabled = false,
  loading = false,
  variant = "default",
  showNotes = false,
}: AnswerButtonsProps) {
  const [notes, setNotes] = useState("");
  const [showNotesInput, setShowNotesInput] = useState(false);

  const handleAnswer = (response: boolean) => {
    if (showNotes && notes.trim()) {
      onAnswer(response, notes.trim());
    } else {
      onAnswer(response);
    }

    // リセット
    setNotes("");
    setShowNotesInput(false);
  };

  const handleAddNotes = () => {
    setShowNotesInput(true);
  };

  // デフォルトバリアント
  if (variant === "default") {
    return (
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => handleAnswer(true)}
            disabled={disabled || loading}
            className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                送信中...
              </div>
            ) : (
              "はい"
            )}
          </button>

          <button
            type="button"
            onClick={() => handleAnswer(false)}
            disabled={disabled || loading}
            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                送信中...
              </div>
            ) : (
              "いいえ"
            )}
          </button>
        </div>

        {/* メモ入力エリア */}
        {showNotes && (
          <div>
            {!showNotesInput ? (
              <button
                type="button"
                onClick={handleAddNotes}
                disabled={disabled || loading}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + 補足を追加
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="補足があれば入力してください（任意）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotesInput(false);
                      setNotes("");
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // コンパクトバリアント
  if (variant === "compact") {
    return (
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => handleAnswer(true)}
          disabled={disabled || loading}
          className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          はい
        </button>

        <button
          type="button"
          onClick={() => handleAnswer(false)}
          disabled={disabled || loading}
          className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          いいえ
        </button>
      </div>
    );
  }

  // 詳細バリアント
  if (variant === "detailed") {
    return (
      <div className="space-y-6">
        {/* メモ入力エリア（常時表示） */}
        <div>
          <label
            htmlFor="detailed-notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            補足・メモ（任意）
          </label>
          <textarea
            id="detailed-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="この質問について何か補足があれば入力してください"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>

        {/* 回答ボタン */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleAnswer(true)}
            disabled={disabled || loading}
            className="bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <div className="flex flex-col items-center">
              <span className="text-lg">✓</span>
              <span>はい</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleAnswer(false)}
            disabled={disabled || loading}
            className="bg-red-600 text-white py-4 px-6 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            <div className="flex flex-col items-center">
              <span className="text-lg">✗</span>
              <span>いいえ</span>
            </div>
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">回答を送信中...</span>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// 評価用のスケールボタン
interface ScaleButtonsProps {
  onAnswer: (value: number, notes?: string) => void;
  disabled?: boolean;
  loading?: boolean;
  min?: number;
  max?: number;
  labels?: { [key: number]: string };
  showNotes?: boolean;
}

export function ScaleButtons({
  onAnswer,
  disabled = false,
  loading = false,
  min = 1,
  max = 5,
  labels = { 1: "全く思わない", 5: "強く思う" },
  showNotes = false,
}: ScaleButtonsProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (selectedValue !== null) {
      onAnswer(selectedValue, notes.trim() || undefined);
      setSelectedValue(null);
      setNotes("");
    }
  };

  const scale = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-4">
      {/* スケール選択 */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{labels[min]}</span>
          <span>{labels[max]}</span>
        </div>

        <div className="flex justify-between">
          {scale.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedValue(value)}
              disabled={disabled || loading}
              className={`w-12 h-12 rounded-full border-2 font-medium transition-colors ${
                selectedValue === value
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* メモ入力 */}
      {showNotes && (
        <div>
          <label
            htmlFor="scale-notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            理由やコメント（任意）
          </label>
          <textarea
            id="scale-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="選択した理由があれば入力してください"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || loading || selectedValue === null}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? "送信中..." : "回答を送信"}
      </button>
    </div>
  );
}

// 選択肢型の回答ボタン
interface ChoiceButtonsProps {
  choices: { value: string; label: string; description?: string }[];
  onAnswer: (value: string, notes?: string) => void;
  disabled?: boolean;
  loading?: boolean;
  showNotes?: boolean;
  multiSelect?: boolean;
}

export function ChoiceButtons({
  choices,
  onAnswer,
  disabled = false,
  loading = false,
  showNotes = false,
  multiSelect = false,
}: ChoiceButtonsProps) {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const handleChoiceClick = (value: string) => {
    if (multiSelect) {
      setSelectedChoices((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value],
      );
    } else {
      setSelectedChoices([value]);
    }
  };

  const handleSubmit = () => {
    if (selectedChoices.length > 0) {
      const value = multiSelect
        ? selectedChoices.join(",")
        : selectedChoices[0];
      onAnswer(value, notes.trim() || undefined);
      setSelectedChoices([]);
      setNotes("");
    }
  };

  return (
    <div className="space-y-4">
      {/* 選択肢 */}
      <div className="space-y-2">
        {choices.map((choice) => (
          <button
            key={choice.value}
            type="button"
            onClick={() => handleChoiceClick(choice.value)}
            disabled={disabled || loading}
            className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
              selectedChoices.includes(choice.value)
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-start">
              <div
                className={`w-4 h-4 rounded ${multiSelect ? "" : "rounded-full"} border-2 mt-1 mr-3 flex-shrink-0 ${
                  selectedChoices.includes(choice.value)
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}
              >
                {selectedChoices.includes(choice.value) && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <div>
                <div className="font-medium text-gray-900">{choice.label}</div>
                {choice.description && (
                  <div className="text-sm text-gray-600 mt-1">
                    {choice.description}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* メモ入力 */}
      {showNotes && (
        <div>
          <label
            htmlFor="choice-notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            補足・コメント（任意）
          </label>
          <textarea
            id="choice-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="選択した理由や補足があれば入力してください"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
          />
        </div>
      )}

      {/* 送信ボタン */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || loading || selectedChoices.length === 0}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? "送信中..." : `選択した${selectedChoices.length}件を送信`}
      </button>
    </div>
  );
}
