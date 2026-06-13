import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  badRequest,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/api-utils";
import { collectionSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

async function getOwnedCollection(id: string, userId: string) {
  return prisma.collection.findFirst({
    where: { id, userId },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const { id } = await context.params;

  try {
    const collection = await prisma.collection.findFirst({
      where: { id, userId: session.user.id },
      include: {
        kanjis: { orderBy: { createdAt: "desc" } },
        _count: { select: { kanjis: true } },
      },
    });

    if (!collection) {
      return notFound("Koleksi tidak ditemukan");
    }

    return NextResponse.json(collection);
  } catch {
    return serverError();
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const { id } = await context.params;

  try {
    const existing = await getOwnedCollection(id, session.user.id);
    if (!existing) {
      return notFound("Koleksi tidak ditemukan");
    }

    const body = await request.json();
    const parsed = collectionSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Data tidak valid");
    }

    const { name, description, jlptLevel } = parsed.data;

    const collection = await prisma.collection.update({
      where: { id },
      data: {
        name,
        description: description || null,
        jlptLevel: jlptLevel || null,
      },
    });

    return NextResponse.json(collection);
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
    const existing = await getOwnedCollection(id, session.user.id);
    if (!existing) {
      return notFound("Koleksi tidak ditemukan");
    }

    await prisma.collection.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
