import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  try {
    const result = await prisma.$queryRaw<{ ok: number }[]>`SELECT 1 as ok`;
    console.log("✅ Koneksi Supabase + Prisma berhasil");
    console.log("   Query test:", result[0]);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("❌ Koneksi gagal:", error);
  process.exit(1);
});
