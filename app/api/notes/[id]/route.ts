import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { badRequest, notFound, serverError, unauthorized } from "@/lib/api-utils";
import { noteSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = noteSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Data tidak valid");
    }

    // Verify ownership
    const existing = await prisma.note.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return notFound("Catatan tidak ditemukan");
    }

    const { title, content, explanation, category } = parsed.data;

    const note = await prisma.note.update({
      where: { id },
      data: { title, content, explanation, category },
    });

    return NextResponse.json(note);
  } catch {
    return serverError();
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  try {
    const { id } = await params;

    // Verify ownership
    const existing = await prisma.note.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return notFound("Catatan tidak ditemukan");
    }

    await prisma.note.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return serverError();
  }
}
