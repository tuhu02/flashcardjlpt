import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { kanjisToCsv, kanjisToJson } from "@/lib/csv";
import { notFound, serverError, unauthorized } from "@/lib/api-utils";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("collectionId");
  const format = searchParams.get("format") ?? "csv";

  if (!collectionId) {
    return NextResponse.json(
      { error: "collectionId wajib diisi" },
      { status: 400 },
    );
  }

  try {
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId: session.user.id },
      include: {
        kanjis: {
          orderBy: { createdAt: "asc" },
          select: {
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

    const filename = `${collection.name.replace(/\s+/g, "-").toLowerCase()}.${format === "json" ? "json" : "csv"}`;

    if (format === "json") {
      const body = kanjisToJson(collection.kanjis);
      return new NextResponse(body, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    const body = kanjisToCsv(collection.kanjis);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return serverError();
  }
}
