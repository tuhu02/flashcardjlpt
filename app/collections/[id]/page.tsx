"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JapaneseInput } from "@/components/ui/japanese-input";
import { Modal } from "@/components/ui/modal";
import { KanjiFlipCard } from "@/components/collections/kanji-flip-card";

type Kanji = {
  id: string;
  kanji: string;
  reading: string;
  meaning: string;
  category: string | null;
  example: string | null;
  collectionId: string;
};

type CollectionDetail = {
  id: string;
  name: string;
  description: string | null;
  jlptLevel: string | null;
  kanjis: Kanji[];
};

export default function CollectionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Kanji | null>(null);
  const [form, setForm] = useState({
    kanji: "",
    reading: "",
    meaning: "",
    category: "",
    example: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Import CSV state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // State for editing collection name
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  async function loadCollection() {
    const res = await fetch(`/api/collections/${params.id}`);
    if (!res.ok) {
      router.push("/collections");
      return;
    }
    const data = await res.json();
    setCollection(data);
    setLoading(false);
  }

  useEffect(() => {
    loadCollection();
  }, [params.id]);

  const filtered = useMemo(() => {
    if (!collection) return [];
    const q = search.toLowerCase();
    return collection.kanjis.filter(
      (k) =>
        k.kanji.includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.reading.toLowerCase().includes(q),
    );
  }, [collection, search]);

  function openCreate() {
    setEditing(null);
    setForm({ kanji: "", reading: "", meaning: "", category: "", example: "" });
    setError("");
    setModalOpen(true);
  }

  function openEdit(kanji: Kanji) {
    setEditing(kanji);
    setForm({
      kanji: kanji.kanji,
      reading: kanji.reading,
      meaning: kanji.meaning,
      category: kanji.category ?? "",
      example: kanji.example ?? "",
    });
    setError("");
    setModalOpen(true);
  }

  function startEditingName() {
    if (!collection) return;
    setNameValue(collection.name);
    setEditingName(true);
  }

  function cancelEditingName() {
    setEditingName(false);
    setNameValue("");
  }

  async function saveCollectionName() {
    if (!collection || !nameValue.trim()) return;
    setNameSaving(true);

    try {
      const res = await fetch(`/api/collections/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameValue.trim(),
          description: collection.description ?? "",
          jlptLevel: collection.jlptLevel ?? "",
        }),
      });

      if (res.ok) {
        setEditingName(false);
        loadCollection();
      }
    } finally {
      setNameSaving(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const payload = {
      ...form,
      collectionId: params.id,
    };

    const res = editing
      ? await fetch(`/api/kanjis/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/kanjis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Gagal menyimpan kanji");
      return;
    }

    setModalOpen(false);
    loadCollection();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kanji ini?")) return;
    await fetch(`/api/kanjis/${id}`, { method: "DELETE" });
    loadCollection();
  }

  async function handleBulkDelete() {
    if (!selected.length || !confirm(`Hapus ${selected.length} kanji?`)) return;
    await fetch("/api/kanjis", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: selected }),
    });
    setSelected([]);
    loadCollection();
  }

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleImportCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("collectionId", params.id);

    try {
      const res = await fetch("/api/kanjis/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      e.target.value = "";

      if (!res.ok) {
        setImportMessage({ type: "error", text: data.error ?? "Import gagal" });
        return;
      }

      setImportMessage({
        type: "success",
        text: `Berhasil import ${data.imported} kanji (${data.skipped} dilewati karena duplikat).`,
      });
      loadCollection();
    } catch {
      setImportMessage({ type: "error", text: "Terjadi kesalahan saat import" });
    } finally {
      setImportLoading(false);
    }
  }

  if (loading || !collection) {
    return (
      <AppShell>
        <p className="text-stone-500">Memuat koleksi...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/collections" className="text-sm text-red-700 hover:underline">
          ← Kembali ke koleksi
        </Link>
        {editingName ? (
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveCollectionName();
                if (e.key === "Escape") cancelEditingName();
              }}
              autoFocus
              className="w-full max-w-md rounded-lg border border-stone-300 px-3 py-1.5 text-2xl font-bold text-stone-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
            />
            <Button size="sm" onClick={saveCollectionName} disabled={nameSaving}>
              {nameSaving ? "..." : "Simpan"}
            </Button>
            <Button variant="ghost" size="sm" onClick={cancelEditingName}>
              Batal
            </Button>
          </div>
        ) : (
          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-3xl font-bold">{collection.name}</h1>
            <button
              type="button"
              onClick={startEditingName}
              className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              title="Edit nama koleksi"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </button>
          </div>
        )}
        {collection.description ? (
          <p className="mt-1 text-stone-600">{collection.description}</p>
        ) : null}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Cari kanji, arti, atau cara baca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {selected.length > 0 ? (
            <Button variant="danger" size="sm" onClick={handleBulkDelete}>
              Hapus ({selected.length})
            </Button>
          ) : null}
          <Button
            variant="secondary"
            onClick={() => {
              setImportMessage(null);
              setImportModalOpen(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Import CSV
          </Button>
          <Button onClick={openCreate}>+ Tambah Kanji</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardTitle>Belum ada kanji</CardTitle>
          <p className="mt-2 text-sm text-stone-500">
            Tambah kanji manual atau import dari halaman Pengaturan.
          </p>
        </Card>
      ) : (
        <div>
          <label className="mb-4 flex items-center gap-2 text-sm text-stone-500">
            <input
              type="checkbox"
              checked={selected.length === filtered.length && filtered.length > 0}
              onChange={(e) =>
                setSelected(e.target.checked ? filtered.map((k) => k.id) : [])
              }
              className="h-4 w-4 accent-red-700"
            />
            Pilih semua ({filtered.length} kanji)
          </label>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((kanji) => (
              <KanjiFlipCard
                key={kanji.id}
                kanji={kanji.kanji}
                reading={kanji.reading}
                meaning={kanji.meaning}
                selected={selected.includes(kanji.id)}
                onToggleSelect={() => toggleSelect(kanji.id)}
                onEdit={() => openEdit(kanji)}
                onDelete={() => handleDelete(kanji.id)}
              />
            ))}
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? "Edit Kanji" : "Tambah Kanji"}
        onClose={() => setModalOpen(false)}
      >
        {form.kanji ? (
          <div className="mb-4 rounded-xl bg-stone-50 py-4 text-center">
            <p className="text-xs text-stone-500">Preview</p>
            <p className="font-jp text-6xl font-bold">{form.kanji}</p>
          </div>
        ) : null}
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Kanji"
            value={form.kanji}
            onChange={(e) => setForm({ ...form, kanji: e.target.value })}
            required
          />
          <JapaneseInput
            label="Cara Baca"
            value={form.reading}
            onChange={(val) => setForm({ ...form, reading: val })}
            required
          />
          <Input
            label="Arti"
            value={form.meaning}
            onChange={(e) => setForm({ ...form, meaning: e.target.value })}
            required
          />
          <Input
            label="Kelompok (opsional)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            label="Contoh Kalimat (opsional)"
            value={form.example}
            onChange={(e) => setForm({ ...form, example: e.target.value })}
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full">
            Simpan
          </Button>
        </form>
      </Modal>

      {/* Import CSV Modal */}
      <Modal
        open={importModalOpen}
        title="Import Kanji dari CSV"
        onClose={() => setImportModalOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Upload file CSV dengan format:{" "}
            <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-mono">
              kanji, cara_baca, arti, level, kelompok
            </code>
          </p>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="mb-2 text-xs font-medium text-stone-500">Contoh Template CSV:</p>
            <pre className="overflow-x-auto text-xs text-stone-700">
{`kanji,cara_baca,arti,level,kelompok
日,にち / ひ,Matahari / Hari,N5,Waktu
月,つき,Bulan,N5,Waktu
火,ひ,Api,N5,Alam
水,みず,Air,N5,Alam`}
            </pre>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 p-6 transition-colors hover:border-red-300 hover:bg-red-50/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            <label className="cursor-pointer">
              <span className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-800">
                {importLoading ? "Mengimport..." : "Pilih File CSV"}
              </span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCsv}
                disabled={importLoading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-stone-400">Hanya file .csv yang didukung</p>
          </div>

          {importMessage ? (
            <div
              className={`rounded-lg p-3 text-sm ${
                importMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {importMessage.text}
            </div>
          ) : null}
        </div>
      </Modal>
    </AppShell>
  );
}
