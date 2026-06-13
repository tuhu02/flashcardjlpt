import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { badRequest, serverError, unauthorized } from "@/lib/api-utils";
import { collectionSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return unauthorized();
  }

  try {
    const collections = await prisma.collection.findMany({
      where: { userId: session.user.id },
      include: { _count: { select: { kanjis: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(collections);
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
    const parsed = collectionSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Data tidak valid");
    }

    const { name, description, jlptLevel } = parsed.data;

    const collection = await prisma.collection.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        jlptLevel: jlptLevel || null,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch {
    return serverError();
  }
}
