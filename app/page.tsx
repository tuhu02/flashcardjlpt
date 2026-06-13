import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="font-jp text-3xl font-bold text-red-700">漢</span>
            <span className="text-lg font-semibold">KanjiQuiz</span>
          </div>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button>Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-wider text-red-700">
            Belajar Kanji JLPT
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">
            Kuasai kanji dengan kuis interaktif dan pelacakan progres
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600">
            Kelola koleksi kanji sendiri, latihan dengan tiga mode kuis, dan
            lihat statistik belajar — dari JLPT N5 hingga N1.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg">Mulai Belajar</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Sudah punya akun
              </Button>
            </Link>
          </div>
          <p className="font-jp mt-16 text-8xl text-stone-200 sm:text-9xl">
            日本語
          </p>
        </section>

        <section className="border-t border-stone-200 bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
            {[
              {
                title: "Kelola Koleksi",
                desc: "Input kanji manual atau import CSV. Organisasi per level JLPT.",
              },
              {
                title: "3 Mode Kuis",
                desc: "Kanji→Arti, Kanji→Baca, Arti→Kanji dengan feedback langsung.",
              },
              {
                title: "Lacak Progres",
                desc: "Statistik per kanji, streak harian, dan rekomendasi ulang.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-stone-200 p-6"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-stone-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
