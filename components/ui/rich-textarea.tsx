"use client";

import { useCallback, useRef, useState } from "react";
import { clsx } from "@/lib/clsx";
import { romajiToKana } from "@/lib/romaji";
import { renderMarkdown } from "@/lib/markdown";

type KanaMode = "hiragana" | "katakana" | "romaji";

type RichTextareaProps = {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  id?: string;
  rows?: number;
};

/**
 * Rich textarea with:
 * - Formatting toolbar (bold, italic, list, heading)
 * - Kana mode toggle (hiragana/katakana/romaji)
 * - Preview mode to see rendered markdown
 */
export function RichTextarea({
  label,
  error,
  value,
  onChange,
  placeholder,
  className,
  required,
  id,
  rows = 6,
}: RichTextareaProps) {
  const [mode, setMode] = useState<KanaMode>("romaji");
  const [rawInput, setRawInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
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

  // Insert markdown syntax at cursor position
  const insertFormatting = useCallback(
    (prefix: string, suffix: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = mode === "romaji" ? value : rawInput;
      const selectedText = currentValue.slice(start, end);
      const newText =
        currentValue.slice(0, start) +
        prefix +
        (selectedText || "teks") +
        suffix +
        currentValue.slice(end);

      if (mode === "romaji") {
        onChange(newText);
      } else {
        setRawInput(newText);
        onChange(romajiToKana(newText, mode));
      }

      // Restore cursor position after the inserted text
      requestAnimationFrame(() => {
        textarea.focus();
        const cursorPos = start + prefix.length + (selectedText || "teks").length;
        textarea.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [mode, value, rawInput, onChange],
  );

  const displayValue = mode === "romaji" ? value : rawInput;

  const kanaConfig: { key: KanaMode; label: string; title: string }[] = [
    { key: "hiragana", label: "あ", title: "Hiragana" },
    { key: "katakana", label: "ア", title: "Katakana" },
    { key: "romaji", label: "A", title: "Romaji" },
  ];

  const formatButtons = [
    {
      label: "B",
      title: "Bold (**teks**)",
      className: "font-bold",
      action: () => insertFormatting("**", "**"),
    },
    {
      label: "I",
      title: "Italic (*teks*)",
      className: "italic",
      action: () => insertFormatting("*", "*"),
    },
    {
      label: "H",
      title: "Heading (# judul)",
      className: "font-bold",
      action: () => insertFormatting("# ", ""),
    },
    {
      label: "•",
      title: "List (- item)",
      className: "font-bold text-base",
      action: () => insertFormatting("- ", ""),
    },
    {
      label: "<>",
      title: "Code (`kode`)",
      className: "font-mono text-xs",
      action: () => insertFormatting("`", "`"),
    },
  ];

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-stone-700"
        >
          {label}
        </label>
      ) : null}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-stone-200 bg-stone-50 px-2 py-1.5">
        {/* Format buttons */}
        <div className="flex items-center gap-0.5 border-r border-stone-200 pr-2">
          {formatButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              title={btn.title}
              onClick={btn.action}
              className={clsx(
                "rounded px-2 py-1 text-xs text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900",
                btn.className,
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Kana mode toggle */}
        <div className="flex items-center gap-0.5 border-r border-stone-200 pr-2">
          {kanaConfig.map((m) => (
            <button
              key={m.key}
              type="button"
              title={m.title}
              onClick={() => handleModeChange(m.key)}
              className={clsx(
                "rounded-md px-2 py-1 text-xs font-bold transition-all duration-200",
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

        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={clsx(
            "ml-auto rounded px-2 py-1 text-xs font-medium transition-colors",
            showPreview
              ? "bg-red-50 text-red-700"
              : "text-stone-500 hover:bg-stone-200 hover:text-stone-700",
          )}
        >
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* Editor / Preview */}
      {showPreview ? (
        <div
          className={clsx(
            "prose-sm min-h-[120px] rounded-b-lg border border-stone-200 bg-white px-3 py-2 text-stone-800",
            className,
          )}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          id={inputId}
          value={displayValue}
          onChange={handleChange}
          placeholder={
            placeholder ??
            "Tulis penjelasan... (gunakan **bold**, *italic*, - list, # heading)"
          }
          required={required}
          rows={rows}
          className={clsx(
            "w-full resize-y rounded-b-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100",
            error && "border-red-400 focus:border-red-500 focus:ring-red-100",
            className,
          )}
          autoComplete="off"
          spellCheck={false}
        />
      )}

      {/* Kana preview (only in non-romaji editing mode) */}
      {!showPreview && mode !== "romaji" && value ? (
        <div className="rounded-lg bg-stone-50 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            Hasil Konversi
          </span>
          <p className="font-jp mt-1 whitespace-pre-wrap text-sm text-stone-800">
            {value}
          </p>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
