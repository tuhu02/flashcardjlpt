"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { JapaneseInput } from "@/components/ui/japanese-input";
import { JapaneseTextarea } from "@/components/ui/japanese-textarea";
import { RichTextarea } from "@/components/ui/rich-textarea";
import { renderMarkdown } from "@/lib/markdown";
import { NOTE_CATEGORIES } from "@/lib/validations";

type Note = {
  id: string;
  title: string;
  content: string;
  explanation: string;
  category: string;
};

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    explanation: "",
    category: "Umum" as string,
  });

  useEffect(() => {
    async function loadNote() {
      try {
        const res = await fetch(`/api/notes/${noteId}`);
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data: Note = await res.json();
        setForm({
          title: data.title,
          content: data.content,
          explanation: data.explanation,
          category: data.category,
        });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadNote();
  }, [noteId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan catatan");
        setSaving(false);
        return;
      }

      router.push("/notes");
    } catch {
      setError("Terjadi kesalahan jaringan");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-stone-500">Memuat catatan...</p>
        </div>
      </AppShell>
    );
  }

  if (notFound) {
    return (
      <AppShell>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-bold text-stone-700">
            Catatan tidak ditemukan
          </h2>
          <Button onClick={() => router.push("/notes")}>
            Kembali ke Catatan
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.push("/notes")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition-colors hover:text-stone-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kembali ke Catatan
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Edit Catatan</h1>
            <p className="mt-1 text-stone-600">Perbarui catatan belajar kamu.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              showPreview
                ? "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showPreview ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
            {showPreview ? "Tutup Preview" : "Lihat Preview"}
          </button>
        </div>
      </div>

      <div className={`grid gap-8 ${showPreview ? "lg:grid-cols-5" : "grid-cols-1"}`}>
        {/* Form — expands to full width when preview is closed */}
        <Card className={showPreview ? "lg:col-span-3" : "mx-auto w-full max-w-4xl"}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">
                Kategori
              </label>
              <div className="flex flex-wrap gap-2">
                {NOTE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                      form.category === cat
                        ? "bg-red-700 text-white shadow-sm"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <JapaneseInput
              label="Judul"
              value={form.title}
              onChange={(val) => setForm({ ...form, title: val })}
              placeholder="Misal: Partikel は, 今日は天気がいい..."
              defaultMode="romaji"
              required
            />

            {/* Content */}
            <JapaneseTextarea
              label="Konten"
              value={form.content}
              onChange={(val) => setForm({ ...form, content: val })}
              placeholder="Tulis kalimat, partikel, atau kanji yang ingin dicatat..."
              rows={showPreview ? 5 : 8}
              defaultMode="romaji"
              required
            />

            {/* Explanation */}
            <RichTextarea
              label="Penjelasan"
              value={form.explanation}
              onChange={(val) => setForm({ ...form, explanation: val })}
              placeholder="Tulis penjelasan... (gunakan **bold**, *italic*, - list, # heading)"
              rows={showPreview ? 10 : 20}
              required
            />

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
              <Button type="submit" disabled={saving} size="lg">
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/notes")}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>

        {/* Live Preview sidebar — only shown when toggled on */}
        {showPreview && (
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">
                  Preview
                </h2>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
                  title="Tutup Preview"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <Card className="max-h-[calc(100vh-8rem)] space-y-4 overflow-y-auto">
                <span className="inline-block rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                  {form.category}
                </span>

                {form.title ? (
                  <h3 className="font-jp text-xl font-bold text-stone-900">
                    {form.title}
                  </h3>
                ) : (
                  <p className="text-stone-300 italic">Judul...</p>
                )}

                {form.content ? (
                  <div className="font-jp whitespace-pre-wrap text-lg text-stone-800">
                    {form.content}
                  </div>
                ) : (
                  <p className="text-stone-300 italic">Konten...</p>
                )}

                {form.explanation ? (
                  <div className="border-t border-stone-100 pt-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Penjelasan
                    </p>
                    <div
                      className="prose-sm text-stone-700"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(form.explanation),
                      }}
                    />
                  </div>
                ) : (
                  <p className="text-stone-300 italic">Penjelasan...</p>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
