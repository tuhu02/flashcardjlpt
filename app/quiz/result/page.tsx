"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type QuizResultData = {
  sessionId: string;
  total: number;
  correct: number;
  score: number;
  duration: number;
  wrongKanjis: Array<{
    id: string;
    kanji: string;
    reading: string;
    meaning: string;
  }>;
};

export default function QuizResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResultData | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("quizResult");
    if (!raw) {
      router.replace("/quiz/setup");
      return;
    }
    setResult(JSON.parse(raw));
  }, [router]);

  if (!result) {
    return (
      <AppShell>
        <p className="text-stone-500">Memuat hasil...</p>
      </AppShell>
    );
  }

  const minutes = Math.floor(result.duration / 60);
  const seconds = result.duration % 60;

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold">Hasil Kuis</h1>
        <p className="mt-2 text-stone-600">Bagus! Lihat performa Anda di bawah.</p>

        <Card className="mt-8">
          <p className="text-6xl font-bold text-red-700">{result.score}%</p>
          <p className="mt-2 text-stone-600">
            {result.correct} benar dari {result.total} soal
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Durasi: {minutes}m {seconds}s
          </p>
        </Card>

        {result.wrongKanjis.length > 0 ? (
          <Card className="mt-6 text-left">
            <CardTitle className="mb-4">Kanji yang Perlu Diulang</CardTitle>
            <ul className="space-y-3">
              {result.wrongKanjis.map((kanji) => (
                <li
                  key={kanji.id}
                  className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2"
                >
                  <span className="font-jp text-3xl font-bold">{kanji.kanji}</span>
                  <div className="text-right text-sm">
                    <p>{kanji.reading}</p>
                    <p className="text-stone-500">{kanji.meaning}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <Card className="mt-6">
            <p className="font-medium text-emerald-700">Sempurna! Semua jawaban benar.</p>
          </Card>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/quiz/setup">
            <Button size="lg">Kuis Baru</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary">
              Ke Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
