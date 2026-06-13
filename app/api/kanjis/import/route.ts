import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseCsv } from "@/lib/csv";
import {
  badRequest,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/api-utils";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const collectionId = formData.get("collectionId");

    if (!(file instanceof File) || typeof collectionId !== "string") {
      return badRequest("File dan collectionId wajib diisi");
    }

    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId: session.user.id },
    });

    if (!collection) {
      return notFound("Koleksi tidak ditemukan");
    }

    const text = await file.text();
    const rows = parseCsv(text);

    if (rows.length === 0) {
      return badRequest("File CSV kosong atau format tidak valid");
    }

    const existing = await prisma.kanji.findMany({
      where: { collectionId },
      select: { kanji: true },
    });
    const existingSet = new Set(existing.map((k) => k.kanji));

    const toCreate = rows.filter((row) => !existingSet.has(row.kanji));
    let imported = 0;

    for (const row of toCreate) {
      const created = await prisma.kanji.create({
        data: {
          collectionId,
          kanji: row.kanji,
          reading: row.reading,
          meaning: row.meaning,
          category: row.category || null,
        },
      });

      await prisma.kanjiStat.create({
        data: {
          userId: session.user.id,
          kanjiId: created.id,
          status: "Baru",
        },
      });

      imported++;
    }

    return NextResponse.json({
      imported,
      skipped: rows.length - imported,
      total: rows.length,
    });
  } catch {
    return serverError();
  }
}
