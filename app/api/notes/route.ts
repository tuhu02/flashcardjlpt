import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { badRequest, serverError, unauthorized } from "@/lib/api-utils";
import { noteSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: { userId: string; category?: string } = {
      userId: session.user.id,
    };

    if (category && category !== "Semua") {
      where.category = category;
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(notes);
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Data tidak valid");
    }

    const { title, content, explanation, category } = parsed.data;

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title,
        content,
        explanation,
        category,
      },
    });

    return NextResponse.json(note, { status: 201 });
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
    const body = await request.json();
    const ids = body.ids as string[];

    if (!Array.isArray(ids) || ids.length === 0) {
      return badRequest("IDs wajib diisi");
    }

    await prisma.note.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
