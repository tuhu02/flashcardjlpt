import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/components/providers/session-provider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "KanjiQuiz — Belajar Kanji JLPT",
  description:
    "Platform kuis interaktif untuk belajar kanji JLPT dengan pelacakan progres.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geist.variable} ${notoSansJp.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
