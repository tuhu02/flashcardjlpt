"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge, statusColor } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { MetricCard, WeeklyChart } from "@/components/dashboard/stats-cards";

type StatsData = {
  overview: {
    totalKanji: number;
    mastered: number;
    needsReview: number;
    learning: number;
    streak: number;
    totalSessions: number;
  };
  kanjiStats: Array<{
    id: string;
    status: string;
    totalAttempts: number;
    correctAttempts: number;
    lastPracticed: string | null;
    kanji: { kanji: string; meaning: string; reading: string };
  }>;
  recentSessions: Array<{
    id: string;
    correct: number;
    total: number;
    mode: string;
    duration: number;
    createdAt: string;
    collection: { name: string };
  }>;
  weeklyData: Array<{ label: string; count: number }>;
};

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <AppShell>
        <p className="text-stone-500">Memuat statistik...</p>
      </AppShell>
    );
  }

  const weakKanjis = [...data.kanjiStats]
    .filter((s) => s.totalAttempts > 0)
    .sort((a, b) => {
      const aAcc = a.correctAttempts / a.totalAttempts;
      const bAcc = b.correctAttempts / b.totalAttempts;
      return aAcc - bAcc;
    })
    .slice(0, 10);

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Statistik</h1>
      <p className="mt-1 text-stone-600">Progres belajar dan riwayat sesi kuis</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Kanji" value={data.overview.totalKanji} />
        <MetricCard label="Hafal" value={data.overview.mastered} />
        <MetricCard label="Sedang Dipelajari" value={data.overview.learning} />
        <MetricCard label="Perlu Diulang" value={data.overview.needsReview} />
      </div>

      <div className="mt-8">
        <WeeklyChart data={data.weeklyData} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">Kanji Terlemah</CardTitle>
          {weakKanjis.length ? (
            <ul className="space-y-2">
              {weakKanjis.map((stat) => {
                const accuracy =
                  stat.totalAttempts > 0
                    ? Math.round((stat.correctAttempts / stat.totalAttempts) * 100)
                    : 0;
                return (
                  <li
                    key={stat.id}
                    className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2"
                  >
                    <div>
                      <span className="font-jp text-xl font-bold">{stat.kanji.kanji}</span>
                      <p className="text-xs text-stone-500">{stat.kanji.meaning}</p>
                    </div>
                    <div className="text-right">
                      <Badge color={statusColor(stat.status)}>{stat.status}</Badge>
                      <p className="mt-1 text-xs text-stone-500">{accuracy}% akurasi</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-stone-500">Belum ada data latihan.</p>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-4">Riwayat Sesi</CardTitle>
          {data.recentSessions.length ? (
            <ul className="space-y-3">
              {data.recentSessions.map((session) => (
                <li
                  key={session.id}
                  className="rounded-lg border border-stone-100 px-3 py-2 text-sm"
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{session.collection.name}</span>
                    <span>
                      {Math.round((session.correct / session.total) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {new Date(session.createdAt).toLocaleString("id-ID")} ·{" "}
                    {Math.floor(session.duration / 60)}m {session.duration % 60}s
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-500">Belum ada sesi.</p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
