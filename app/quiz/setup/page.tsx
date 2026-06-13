"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { getModeLabel } from "@/lib/quiz";
import { QUIZ_MODES, type QuizMode } from "@/lib/validations";

type Collection = {
  id: string;
  name: string;
  _count: { kanjis: number };
};

export default function QuizSetupPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionId, setCollectionId] = useState("");
  const [modes, setModes] = useState<QuizMode[]>(["kanji-to-meaning"]);
  const [questionCount, setQuestionCount] = useState<10 | 20 | "all">(10);
  const [shuffle, setShuffle] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => {
        setCollections(data);
        if (data[0]) setCollectionId(data[0].id);
      });
  }, []);

  function toggleMode(mode: QuizMode) {
    setModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode],
    );
  }

  async function handleStart() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionId, modes, questionCount, shuffle }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Gagal memulai kuis");
      return;
    }

    sessionStorage.setItem("quizSession", JSON.stringify(data));
    router.push("/quiz/session");
  }

  const selectedCollection = collections.find((c) => c.id === collectionId);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Setup Kuis</h1>
        <p className="mt-1 text-stone-600">Pilih koleksi, mode, dan jumlah soal</p>

        <Card className="mt-8 space-y-6">
          <div>
            <CardTitle className="mb-3">Koleksi</CardTitle>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2"
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c._count.kanjis} kanji)
                </option>
              ))}
            </select>
            {selectedCollection && selectedCollection._count.kanjis < 4 ? (
              <p className="mt-2 text-sm text-amber-700">
                Koleksi ini perlu minimal 4 kanji untuk kuis.
              </p>
            ) : null}
          </div>

          <div>
            <CardTitle className="mb-3">Mode Kuis</CardTitle>
            <div className="space-y-2">
              {QUIZ_MODES.map((mode) => (
                <label
                  key={mode}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-stone-200 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    checked={modes.includes(mode)}
                    onChange={() => toggleMode(mode)}
                  />
                  <span>{getModeLabel(mode)}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <CardTitle className="mb-3">Jumlah Soal</CardTitle>
            <div className="flex flex-wrap gap-2">
              {([10, 20, "all"] as const).map((count) => (
                <button
                  key={String(count)}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                    questionCount === count
                      ? "border-red-600 bg-red-50 text-red-700"
                      : "border-stone-200 text-stone-600"
                  }`}
                >
                  {count === "all" ? "Semua" : count}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={shuffle}
              onChange={(e) => setShuffle(e.target.checked)}
            />
            <span>Acak urutan soal</span>
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            className="w-full"
            size="lg"
            onClick={handleStart}
            disabled={loading || !collectionId || modes.length === 0}
          >
            {loading ? "Menyiapkan..." : "Mulai Kuis"}
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
