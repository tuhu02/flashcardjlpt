"use client";

import { useCallback, useRef, useState } from "react";
import { clsx } from "@/lib/clsx";
import { romajiToKana } from "@/lib/romaji";

type KanaMode = "hiragana" | "katakana" | "romaji";

type JapaneseTextareaProps = {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
  rows?: number;
  defaultMode?: KanaMode;
};

/**
 * Multi-line Japanese text input with romaji → kana auto-conversion.
 * Textarea version of JapaneseInput — same toggle for hiragana/katakana/romaji.
 */
export function JapaneseTextarea({
  label,
  error,
  value,
  onChange,
  placeholder,
  className,
  required,
  id,
  rows = 3,
  defaultMode = "hiragana",
}: JapaneseTextareaProps) {
  const [mode, setMode] = useState<KanaMode>(defaultMode);
  const [rawInput, setRawInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newRaw = e.target.value;

      if (mode === "romaji") {
        onChange(newRaw);
        return;
      }

      setRawInput(newRaw);
      const converted = romajiToKana(newRaw, mode);
      onChange(converted);
    },
    [mode, onChange],
  );

  const handleModeChange = useCallback(
    (newMode: KanaMode) => {
      if (newMode === mode) return;

      if (mode !== "romaji" && newMode !== "romaji") {
        const converted = romajiToKana(rawInput, newMode);
        onChange(converted);
      } else if (mode === "romaji" && newMode !== "romaji") {
        setRawInput(value);
        const converted = romajiToKana(value, newMode);
        onChange(converted);
      } else if (newMode === "romaji") {
        onChange(rawInput);
      }

      setMode(newMode);
      textareaRef.current?.focus();
    },
    [mode, rawInput, value, onChange],
  );

  const displayValue = mode === "romaji" ? value : rawInput;
  const previewValue = mode === "romaji" ? null : value;

  const modeConfig: { key: KanaMode; label: string; title: string }[] = [
    { key: "hiragana", label: "あ", title: "Hiragana" },
    { key: "katakana", label: "ア", title: "Katakana" },
    { key: "romaji", label: "A", title: "Romaji" },
  ];

  return (
    <div className="space-y-1.5">
      {label ? (
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-stone-700"
          >
            {label}
          </label>
          <div className="flex items-center gap-0.5 rounded-lg bg-stone-100 p-0.5">
            {modeConfig.map((m) => (
              <button
                key={m.key}
                type="button"
                title={m.title}
                onClick={() => handleModeChange(m.key)}
                className={clsx(
                  "rounded-md px-2.5 py-1 text-xs font-bold transition-all duration-200",
                  mode === m.key
                    ? "bg-white text-red-600 shadow-sm ring-1 ring-stone-200"
                    : "text-stone-400 hover:text-stone-600",
                  m.key !== "romaji" && "font-jp",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <textarea
        ref={textareaRef}
        id={inputId}
        value={displayValue}
        onChange={handleChange}
        placeholder={
          placeholder ??
          (mode === "hiragana"
            ? 'Ketik romaji (misal: "shi" → し)'
            : mode === "katakana"
              ? 'Ketik romaji (misal: "shi" → シ)'
              : "Ketik langsung...")
        }
        required={required}
        rows={rows}
        className={clsx(
          "w-full resize-y rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className,
        )}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Live kana preview */}
      {previewValue ? (
        <div className="rounded-lg bg-stone-50 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            Hasil
          </span>
          <p className="font-jp mt-1 whitespace-pre-wrap text-base font-medium text-stone-800">
            {previewValue}
          </p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {mode !== "romaji" ? (
        <p className="text-[11px] text-stone-400">
          Ketik romaji lalu otomatis berubah ke{" "}
          {mode === "hiragana" ? "hiragana" : "katakana"}.{" "}
          <span className="text-stone-300">
            Contoh: shi→{mode === "hiragana" ? "し" : "シ"}, ka→
            {mode === "hiragana" ? "か" : "カ"}, nn→
            {mode === "hiragana" ? "ん" : "ン"}
          </span>
        </p>
      ) : null}
    </div>
  );
}
