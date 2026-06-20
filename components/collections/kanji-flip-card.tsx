"use client";

import { clsx } from "@/lib/clsx";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type KanjiFlipCardProps = {
  kanji: string;
  reading: string;
  meaning: string;
  selected?: boolean;
  onToggleSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function KanjiFlipCard({
  kanji,
  reading,
  meaning,
  selected = false,
  onToggleSelect,
  onEdit,
  onDelete,
}: KanjiFlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  function handleFlip() {
    setFlipped((prev) => !prev);
  }

  return (
    <div className="flip-card group">
      <div
        className={clsx("flip-card-inner h-48 w-full cursor-pointer", flipped && "flipped")}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFlip();
          }
        }}
        aria-pressed={flipped}
        aria-label={`Kartu kanji ${kanji}`}
      >
        <div className="flip-card-face flip-card-front flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition-shadow group-hover:shadow-md">
          {onToggleSelect ? (
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect();
              }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-3 top-3 h-4 w-4 accent-red-700"
              aria-label={`Pilih ${kanji}`}
            />
          ) : null}
          <p className="font-jp text-4xl font-bold text-stone-900 sm:text-5xl">{kanji}</p>
          <p className="mt-3 text-xs text-stone-400">Ketuk untuk membalik</p>
        </div>

        <div className="flip-card-face flip-card-back flex flex-col items-center justify-between rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-4 shadow-sm">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">Cara Baca</p>
            <p className="font-jp mt-1 text-2xl font-semibold text-stone-900">{reading}</p>
            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-stone-500">Arti</p>
            <p className="mt-1 line-clamp-2 text-base font-medium text-stone-800">{meaning}</p>
          </div>
          {onEdit || onDelete ? (
            <div
              className="mt-3 flex w-full gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {onEdit ? (
                <Button variant="ghost" size="sm" className="flex-1" onClick={onEdit}>
                  Edit
                </Button>
              ) : null}
              {onDelete ? (
                <Button variant="ghost" size="sm" className="flex-1 text-red-700" onClick={onDelete}>
                  Hapus
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
