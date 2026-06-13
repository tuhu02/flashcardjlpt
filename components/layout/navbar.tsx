"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { clsx } from "@/lib/clsx";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/collections", label: "Koleksi" },
  { href: "/quiz/setup", label: "Kuis" },
  { href: "/stats", label: "Statistik" },
  { href: "/settings", label: "Pengaturan" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-jp text-2xl font-bold text-red-700">漢</span>
          <span className="font-semibold text-stone-900">KanjiQuiz</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-red-50 text-red-700"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-stone-500 sm:inline">
            {session?.user?.name ?? session?.user?.email}
          </span>
          <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
            Keluar
          </Button>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-stone-100 px-4 py-2 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium",
              pathname.startsWith(link.href)
                ? "bg-red-50 text-red-700"
                : "text-stone-600",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
