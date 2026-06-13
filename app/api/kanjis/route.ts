import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  badRequest,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/api-utils";
import { kanjiSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const parsed = kanjiSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Data tidak valid");
    }

    const { collectionId, kanji, reading, meaning, category, example } =
      parsed.data;

    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId: session.user.id },
    });

    if (!collection) {
      return notFound("Koleksi tidak ditemukan");
    }

    const duplicate = await prisma.kanji.findFirst({
      where: { collectionId, kanji },
    });

    if (duplicate) {
      return badRequest("Kanji sudah ada di koleksi ini");
    }

    const created = await prisma.kanji.create({
      data: {
        collectionId,
        kanji,
        reading,
        meaning,
        category: category || null,
        example: example || null,
      },
    });

    await prisma.kanjiStat.create({
      data: {
        userId: session.user.id,
        kanjiId: created.id,
        status: "Baru",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return serverError();
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return badRequest("Pilih minimal satu kanji");
    }

    const kanjis = await prisma.kanji.findMany({
      where: { id: { in: ids } },
      include: { collection: true },
    });

    const allOwned = kanjis.every(
      (k) => k.collection.userId === session.user!.id,
    );

    if (!allOwned) {
      return unauthorized();
    }

    await prisma.kanji.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch {
    return serverError();
  }
}
