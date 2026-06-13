"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard, WeeklyChart } from "@/components/dashboard/stats-cards";
import { Badge, statusColor } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type StatsData = {
  overview: {
    totalKanji: number;
    mastered: number;
    needsReview: number;
    learning: number;
    streak: number;
    totalSessions: number;
  };
  recommendations: Array<{
    id: string;
    status: string;
    kanji: { kanji: string; meaning: string; reading: string };
  }>;
  recentSessions: Array<{
    id: string;
    correct: number;
    total: number;
    createdAt: string;
    collection: { name: string };
  }>;
  weeklyData: Array<{ label: string; count: number }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AppShell>
        <p className="text-stone-500">Memuat dashboard...</p>
      </AppShell>
    );
  }

  const overview = data?.overview;

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="mt-1 text-stone-600">
          Ringkasan progres belajar kanji Anda hari ini
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Kanji" value={overview?.totalKanji ?? 0} />
        <MetricCard label="Sudah Hafal" value={overview?.mastered ?? 0} />
        <MetricCard label="Perlu Diulang" value={overview?.needsReview ?? 0} />
        <MetricCard
          label="Streak"
          value={`${overview?.streak ?? 0} hari`}
          hint={`${overview?.totalSessions ?? 0} sesi total`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <WeeklyChart data={data?.weeklyData ?? []} />

        <Card>
          <CardTitle className="mb-4">Rekomendasi Ulang Hari Ini</CardTitle>
          {data?.recommendations.length ? (
            <ul className="space-y-3">
              {data.recommendations.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-stone-100 px-3 py-2"
                >
                  <div>
                    <span className="font-jp text-2xl font-bold">{item.kanji.kanji}</span>
                    <p className="text-sm text-stone-500">{item.kanji.meaning}</p>
                  </div>
                  <Badge color={statusColor(item.status)}>{item.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-500">
              Belum ada rekomendasi. Tambah kanji dan mulai kuis!
            </p>
          )}
          <Link href="/quiz/setup" className="mt-4 inline-block">
            <Button>Mulai Kuis</Button>
          </Link>
        </Card>
      </div>

      <Card className="mt-8">
        <CardTitle className="mb-4">Sesi Terakhir</CardTitle>
        {data?.recentSessions.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-stone-500">
                  <th className="pb-2 pr-4">Koleksi</th>
                  <th className="pb-2 pr-4">Skor</th>
                  <th className="pb-2">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSessions.map((session) => (
                  <tr key={session.id} className="border-b border-stone-50">
                    <td className="py-3 pr-4">{session.collection.name}</td>
                    <td className="py-3 pr-4">
                      {session.correct}/{session.total} (
                      {Math.round((session.correct / session.total) * 100)}%)
                    </td>
                    <td className="py-3">
                      {new Date(session.createdAt).toLocaleDateString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-stone-500">Belum ada sesi kuis.</p>
        )}
      </Card>
    </AppShell>
  );
}
