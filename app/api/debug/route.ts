import { NextResponse } from "next/server";

export async function GET() {
  const info: Record<string, unknown> = {
    nodeVersion: process.version,
    hasDbUrl: !!process.env.DATABASE_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
  };

  // Try importing prisma
  try {
    const { prisma } = await import("@/lib/prisma");
    info.prismaImport = "OK";

    // Try a simple query
    const count = await prisma.user.count();
    info.dbConnection = "OK";
    info.userCount = count;
  } catch (error) {
    info.prismaError = String(error);
    info.errorStack =
      error instanceof Error ? error.stack?.split("\n").slice(0, 5) : undefined;
  }

  return NextResponse.json(info);
}
