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

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.kanji.findFirst({
      where: { id },
      include: { collection: true },
    });

    if (!existing || existing.collection.userId !== session.user.id) {
      return notFound("Kanji tidak ditemukan");
    }

    const body = await request.json();
    const parsed = kanjiSchema.safeParse({
      ...body,
      collectionId: existing.collectionId,
    });

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Data tidak valid");
    }

    const { kanji, reading, meaning, category, example, collectionId } =
      parsed.data;

    if (collectionId !== existing.collectionId) {
      const target = await prisma.collection.findFirst({
        where: { id: collectionId, userId: session.user.id },
      });
      if (!target) {
        return notFound("Koleksi tujuan tidak ditemukan");
      }
    }

    const duplicate = await prisma.kanji.findFirst({
      where: {
        collectionId,
        kanji,
        NOT: { id },
      },
    });

    if (duplicate) {
      return badRequest("Kanji sudah ada di koleksi ini");
    }

    const updated = await prisma.kanji.update({
      where: { id },
      data: {
        collectionId,
        kanji,
        reading,
        meaning,
        category: category || null,
        example: example || null,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.kanji.findFirst({
      where: { id },
      include: { collection: true },
    });

    if (!existing || existing.collection.userId !== session.user.id) {
      return notFound("Kanji tidak ditemukan");
    }

    await prisma.kanji.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
