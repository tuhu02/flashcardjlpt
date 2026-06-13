import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "";
  
  // Mask password but show host/port
  let maskedUrl = "NOT SET";
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      maskedUrl = `${url.protocol}//${url.username}:***@${url.hostname}:${url.port}${url.pathname}`;
    } catch {
      maskedUrl = `INVALID URL FORMAT: ${dbUrl.substring(0, 30)}...`;
    }
  }

  const info: Record<string, unknown> = {
    nodeVersion: process.version,
    dbUrlMasked: maskedUrl,
    dbUrlLength: dbUrl.length,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(
      (k) => k.includes("DATABASE") || k.includes("NEXT") || k.includes("VERCEL")
    ),
  };

  // Try importing prisma
  try {
    const { prisma } = await import("@/lib/prisma");
    info.prismaImport = "OK";

    const count = await prisma.user.count();
    info.dbConnection = "OK";
    info.userCount = count;
  } catch (error) {
    info.prismaError = String(error);
  }

  return NextResponse.json(info);
}
