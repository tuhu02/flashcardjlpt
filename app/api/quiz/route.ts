import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuizQuestions } from "@/lib/quiz";
import { calculateKanjiStatus } from "@/lib/quiz";
import {
  badRequest,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/api-utils";
import { quizSetupSchema, quizSubmitSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  try {
    const body = await request.json();

    if (body.action === "submit") {
      const parsed = quizSubmitSchema.safeParse(body);
      if (!parsed.success) {
        return badRequest(parsed.error.issues[0]?.message ?? "Data tidak valid");
      }

      const { collectionId, mode, duration, results } = parsed.data;

      const collection = await prisma.collection.findFirst({
        where: { id: collectionId, userId: session.user.id },
      });

      if (!collection) {
        return notFound("Koleksi tidak ditemukan");
      }

      const correct = results.filter((r) => r.isCorrect && !r.skipped).length;
      const total = results.length;

      const quizSession = await prisma.quizSession.create({
        data: {
          userId: session.user.id,
          collectionId,
          mode,
          total,
          correct,
          duration,
        },
      });

      await prisma.quizResult.createMany({
        data: results.map((r) => ({
          sessionId: quizSession.id,
          kanjiId: r.kanjiId,
          isCorrect: r.isCorrect,
          skipped: r.skipped,
          timeTaken: r.timeTaken,
        })),
      });

      for (const result of results) {
        const stat = await prisma.kanjiStat.findUnique({
          where: {
            userId_kanjiId: {
              userId: session.user.id,
              kanjiId: result.kanjiId,
            },
          },
        });

        const totalAttempts = (stat?.totalAttempts ?? 0) + 1;
        const correctAttempts =
          (stat?.correctAttempts ?? 0) + (result.isCorrect && !result.skipped ? 1 : 0);

        const status = calculateKanjiStatus(totalAttempts, correctAttempts);

        if (stat) {
          await prisma.kanjiStat.update({
            where: { id: stat.id },
            data: {
              totalAttempts,
              correctAttempts,
              lastPracticed: new Date(),
              status,
            },
          });
        } else {
          await prisma.kanjiStat.create({
            data: {
              userId: session.user.id,
              kanjiId: result.kanjiId,
              totalAttempts,
              correctAttempts,
              lastPracticed: new Date(),
              status,
            },
          });
        }
      }

      const wrongKanjiIds = results
        .filter((r) => !r.isCorrect || r.skipped)
        .map((r) => r.kanjiId);

      const wrongKanjis = await prisma.kanji.findMany({
        where: { id: { in: wrongKanjiIds } },
        select: {
          id: true,
          kanji: true,
          reading: true,
          meaning: true,
        },
      });

      return NextResponse.json({
        sessionId: quizSession.id,
        total,
        correct,
        score: total > 0 ? Math.round((correct / total) * 100) : 0,
        duration,
        wrongKanjis,
      });
    }

    const parsed = quizSetupSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Data tidak valid");
    }

    const { collectionId, modes, questionCount, shuffle } = parsed.data;

    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId: session.user.id },
      include: {
        kanjis: {
          select: {
            id: true,
            kanji: true,
            reading: true,
            meaning: true,
            category: true,
            example: true,
          },
        },
      },
    });

    if (!collection) {
      return notFound("Koleksi tidak ditemukan");
    }

    if (collection.kanjis.length < 4) {
      return badRequest("Koleksi minimal harus memiliki 4 kanji untuk kuis");
    }

    const questions = generateQuizQuestions(
      collection.kanjis,
      modes,
      questionCount,
      shuffle,
    );

    return NextResponse.json({
      collectionId,
      collectionName: collection.name,
      questions,
    });
  } catch {
    return serverError();
  }
}
