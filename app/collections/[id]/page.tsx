"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

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
        <h1 className="mt-2 text-3xl font-bold">{collection.name}</h1>
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
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-100 bg-stone-50">
              <tr>
                <th className="p-3">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length}
                    onChange={(e) =>
                      setSelected(e.target.checked ? filtered.map((k) => k.id) : [])
                    }
                  />
                </th>
                <th className="p-3">Kanji</th>
                <th className="p-3">Cara Baca</th>
                <th className="p-3">Arti</th>
                <th className="p-3">Kelompok</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((kanji) => (
                <tr key={kanji.id} className="border-b border-stone-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(kanji.id)}
                      onChange={() => toggleSelect(kanji.id)}
                    />
                  </td>
                  <td className="p-3 font-jp text-2xl font-bold">{kanji.kanji}</td>
                  <td className="p-3">{kanji.reading}</td>
                  <td className="p-3">{kanji.meaning}</td>
                  <td className="p-3 text-stone-500">{kanji.category ?? "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(kanji)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(kanji.id)}>
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <Input
            label="Cara Baca"
            value={form.reading}
            onChange={(e) => setForm({ ...form, reading: e.target.value })}
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
    </AppShell>
  );
}
