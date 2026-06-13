import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/quiz";
import { serverError, unauthorized } from "@/lib/api-utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  try {
    const userId = session.user.id;

    const [totalKanji, stats, sessions, collections] = await Promise.all([
      prisma.kanji.count({
        where: { collection: { userId } },
      }),
      prisma.kanjiStat.findMany({
        where: { userId },
        include: {
          kanji: {
            select: { kanji: true, meaning: true, reading: true },
          },
        },
      }),
      prisma.quizSession.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { collection: { select: { name: true } } },
      }),
      prisma.collection.findMany({
        where: { userId },
        include: { _count: { select: { kanjis: true } } },
      }),
    ]);

    const mastered = stats.filter((s) => s.status === "Hafal").length;
    const needsReview = stats.filter((s) => s.status === "Perlu Diulang").length;
    const learning = stats.filter((s) => s.status === "Sedang Dipelajari").length;

    const allSessions = await prisma.quizSession.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const streak = calculateStreak(allSessions.map((s) => s.createdAt));

    const recommendations = stats
      .filter((s) => s.status === "Perlu Diulang" || s.status === "Baru")
      .sort((a, b) => {
        const aAcc =
          a.totalAttempts > 0 ? a.correctAttempts / a.totalAttempts : 0;
        const bAcc =
          b.totalAttempts > 0 ? b.correctAttempts / b.totalAttempts : 0;
        return aAcc - bAcc;
      })
      .slice(0, 5);

    const weeklyData = buildWeeklyData(allSessions.map((s) => s.createdAt));

    return NextResponse.json({
      overview: {
        totalKanji,
        mastered,
        needsReview,
        learning,
        streak,
        totalSessions: allSessions.length,
      },
      recommendations,
      recentSessions: sessions,
      collections,
      weeklyData,
      kanjiStats: stats,
    });
  } catch {
    return serverError();
  }
}

function buildWeeklyData(dates: Date[]) {
  const days: { label: string; count: number }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const next = new Date(date);
    next.setDate(next.getDate() + 1);

    const count = dates.filter((d) => {
      const sessionDate = new Date(d);
      return sessionDate >= date && sessionDate < next;
    }).length;

    days.push({
      label: date.toLocaleDateString("id-ID", { weekday: "short" }),
      count,
    });
  }

  return days;
}
