"use client";

import { useCallback, useRef, useState } from "react";
import { clsx } from "@/lib/clsx";
import { romajiToKana } from "@/lib/romaji";

type KanaMode = "hiragana" | "katakana" | "romaji";

type JapaneseInputProps = {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
};

/**
 * A Japanese text input with romaji → kana auto-conversion.
 *
 * Approach: we keep the raw romaji internally and convert on-the-fly.
 * The parent receives the converted kana value.
 *
 * Features:
 * - Toggle between hiragana, katakana, and raw romaji modes
 * - Real-time conversion as the user types
 * - Visual indicator showing which mode is active
 */
export function JapaneseInput({
  label,
  error,
  value,
  onChange,
  placeholder,
  className,
  required,
  id,
}: JapaneseInputProps) {
  const [mode, setMode] = useState<KanaMode>("hiragana");
  // We store the raw romaji input so we can convert it properly.
  // When mode is romaji, rawInput is not used.
  const [rawInput, setRawInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newRaw = e.target.value;

      if (mode === "romaji") {
        onChange(newRaw);
        return;
      }

      // Store the raw romaji
      setRawInput(newRaw);

      // Convert the entire raw input to kana
      const converted = romajiToKana(newRaw, mode);
      onChange(converted);
    },
    [mode, onChange],
  );

  const handleModeChange = useCallback(
    (newMode: KanaMode) => {
      if (newMode === mode) return;

      if (mode !== "romaji" && newMode !== "romaji") {
        // Switching between hiragana ↔ katakana: reconvert the raw input
        const converted = romajiToKana(rawInput, newMode);
        onChange(converted);
      } else if (mode === "romaji" && newMode !== "romaji") {
        // Switching from romaji to kana: convert current value as romaji
        setRawInput(value);
        const converted = romajiToKana(value, newMode);
        onChange(converted);
      } else if (newMode === "romaji") {
        // Switching to romaji: give user the raw romaji
        onChange(rawInput);
      }

      setMode(newMode);
      inputRef.current?.focus();
    },
    [mode, rawInput, value, onChange],
  );

  // What the user sees in the input:
  // - In romaji mode: the raw value from parent
  // - In kana mode: the raw romaji (so they can see what they're typing)
  //   BUT we show the converted value, with any trailing unconverted chars
  //
  // Actually the simplest UX: show the CONVERTED kana in the input.
  // But the user needs to type romaji... so we show romaji in the input
  // and display the kana conversion elsewhere? No — the best approach is:
  //
  // Show the raw romaji in the input field for typing, and show the
  // converted kana as a live preview below or beside.
  //
  // HOWEVER, many IME-style inputs just show the converted result.
  // Let's do: the input field shows raw romaji, and we show the kana preview.
  //
  // Actually, the cleanest approach for this use case:
  // The input field contains the romaji. The converted value is stored
  // in the parent. We show a preview of the conversion.

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

      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
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
          className={clsx(
            "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 pr-20 text-stone-900 placeholder:text-stone-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100",
            error && "border-red-400 focus:border-red-500 focus:ring-red-100",
            className,
          )}
          autoComplete="off"
          spellCheck={false}
        />

        {/* Active mode indicator pill */}
        <span
          className={clsx(
            "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            mode === "hiragana"
              ? "bg-red-50 text-red-500"
              : mode === "katakana"
                ? "bg-blue-50 text-blue-500"
                : "bg-stone-100 text-stone-400",
          )}
        >
          {mode === "hiragana"
            ? "ひらがな"
            : mode === "katakana"
              ? "カタカナ"
              : "ABC"}
        </span>
      </div>

      {/* Live kana preview */}
      {previewValue ? (
        <div className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            Hasil
          </span>
          <span className="font-jp text-lg font-medium text-stone-800">
            {previewValue}
          </span>
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
