"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JapaneseInput } from "@/components/ui/japanese-input";
import { JapaneseTextarea } from "@/components/ui/japanese-textarea";
import { RichTextarea } from "@/components/ui/rich-textarea";
import { Modal } from "@/components/ui/modal";
import { renderMarkdown } from "@/lib/markdown";
import { NOTE_CATEGORIES } from "@/lib/validations";

type Note = {
  id: string;
  title: string;
  content: string;
  explanation: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

const CATEGORY_COLORS: Record<string, "info" | "success" | "warning" | "danger"> = {
  Kalimat: "info",
  Partikel: "warning",
  Kanji: "danger",
  "Tata Bahasa": "success",
  Umum: "info",
};

const CATEGORY_STYLES: Record<string, string> = {
  Kalimat: "border-l-blue-400 bg-blue-50/30",
  Partikel: "border-l-purple-400 bg-purple-50/30",
  Kanji: "border-l-red-400 bg-red-50/30",
  "Tata Bahasa": "border-l-emerald-400 bg-emerald-50/30",
  Umum: "border-l-stone-300 bg-stone-50/30",
};

const ALL_FILTERS = ["Semua", ...NOTE_CATEGORIES] as const;

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    explanation: "",
    category: "Umum" as string,
  });
  const [error, setError] = useState("");

  async function loadNotes() {
    const url =
      activeFilter === "Semua"
        ? "/api/notes"
        : `/api/notes?category=${encodeURIComponent(activeFilter)}`;
    const res = await fetch(url);
    const data = await res.json();
    setNotes(data);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    loadNotes();
  }, [activeFilter]);

  const filtered = useMemo(() => {
    if (!search) return notes;
    const q = search.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.explanation.toLowerCase().includes(q),
    );
  }, [notes, search]);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", content: "", explanation: "", category: "Umum" });
    setError("");
    setModalOpen(true);
  }

  function openEdit(note: Note) {
    setEditing(note);
    setForm({
      title: note.title,
      content: note.content,
      explanation: note.explanation,
      category: note.category,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = editing
      ? await fetch(`/api/notes/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        })
      : await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Gagal menyimpan catatan");
      return;
    }

    setModalOpen(false);
    loadNotes();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan ini?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    loadNotes();
  }

  async function handleBulkDelete() {
    if (!selected.length || !confirm(`Hapus ${selected.length} catatan?`))
      return;
    await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected }),
    });
    setSelected([]);
    loadNotes();
  }

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleExpand(id: string) {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Catatan</h1>
          <p className="mt-1 text-stone-600">
            Catat kalimat, partikel, tata bahasa, dan lainnya
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selected.length > 0 ? (
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              Hapus ({selected.length})
            </Button>
          ) : null}
          <Button onClick={openCreate}>+ Catatan Baru</Button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {ALL_FILTERS.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              setActiveFilter(cat);
              setSelected([]);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeFilter === cat
                ? "bg-red-700 text-white shadow-sm"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Cari catatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
      </div>

      {/* Notes list */}
      {loading ? (
        <p className="text-stone-500">Memuat catatan...</p>
      ) : filtered.length === 0 ? (
        <Card className="text-center">
          <CardTitle>Belum ada catatan</CardTitle>
          <p className="mt-2 text-stone-500">
            Mulai catat kalimat, partikel, atau tata bahasa yang kamu pelajari.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            Buat Catatan
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((note) => {
            const isExpanded = expanded.includes(note.id);
            const isSelected = selected.includes(note.id);
            const categoryStyle = CATEGORY_STYLES[note.category] ?? CATEGORY_STYLES.Umum;

            return (
              <div
                key={note.id}
                className={`rounded-2xl border border-stone-200 border-l-4 bg-white shadow-sm transition-all hover:shadow-md ${categoryStyle} ${
                  isSelected ? "ring-2 ring-red-200" : ""
                }`}
              >
                <div className="p-5">
                  {/* Top row: checkbox + category badge + actions */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(note.id)}
                        className="mt-0.5"
                      />
                      <Badge color={CATEGORY_COLORS[note.category] ?? "info"}>
                        {note.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(note)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(note.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-jp mb-2 text-xl font-bold text-stone-900">
                    {note.title}
                  </h3>

                  {/* Content (main japanese text) */}
                  <div className="font-jp mb-3 whitespace-pre-wrap text-lg text-stone-800">
                    {note.content}
                  </div>

                  {/* Explanation — expandable */}
                  <div className="border-t border-stone-100 pt-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(note.id)}
                      className="flex w-full items-center gap-2 text-left text-sm font-medium text-stone-500 transition-colors hover:text-stone-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                      Penjelasan
                    </button>

                    {isExpanded ? (
                      <div
                        className="prose-sm mt-2 text-stone-700"
                        dangerouslySetInnerHTML={{
                          __html: renderMarkdown(note.explanation),
                        }}
                      />
                    ) : null}
                  </div>

                  {/* Timestamp */}
                  <p className="mt-3 text-xs text-stone-400">
                    {new Date(note.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        title={editing ? "Edit Catatan" : "Catatan Baru"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">
              Kategori
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-lg border border-stone-200 px-3 py-2"
            >
              {NOTE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Title — with Japanese input */}
          <JapaneseInput
            label="Judul"
            value={form.title}
            onChange={(val) => setForm({ ...form, title: val })}
            placeholder="Misal: Partikel は, 今日は天気がいい..."
            required
          />

          {/* Content — Japanese textarea */}
          <JapaneseTextarea
            label="Konten"
            value={form.content}
            onChange={(val) => setForm({ ...form, content: val })}
            placeholder="Tulis kalimat, partikel, atau kanji yang ingin dicatat..."
            rows={3}
            required
          />

          {/* Explanation — Rich textarea with formatting */}
          <RichTextarea
            label="Penjelasan"
            value={form.explanation}
            onChange={(val) => setForm({ ...form, explanation: val })}
            placeholder="Tulis penjelasan... (gunakan **bold**, *italic*, - list, # heading)"
            rows={6}
            required
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full">
            Simpan
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
