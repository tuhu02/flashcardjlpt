"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ConfirmDeleteModal } from "@/components/ui/confirm-delete-modal";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { JLPT_LEVELS } from "@/lib/validations";

type Collection = {
  id: string;
  name: string;
  description: string | null;
  jlptLevel: string | null;
  _count: { kanjis: number };
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [jlptLevel, setJlptLevel] = useState("");
  const [error, setError] = useState("");

  const [deleting, setDeleting] = useState<Collection | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function loadCollections() {
    const res = await fetch("/api/collections");
    const data = await res.json();
    setCollections(data);
    setLoading(false);
  }

  useEffect(() => {
    loadCollections();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/collections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, jlptLevel }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Gagal membuat koleksi");
      return;
    }

    setModalOpen(false);
    setName("");
    setDescription("");
    setJlptLevel("");
    loadCollections();
  }

  async function handleDeleteCollection() {
    if (!deleting) return;

    setDeleteLoading(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/collections/${deleting.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error ?? "Gagal menghapus koleksi");
        return;
      }

      setDeleting(null);
      loadCollections();
    } catch {
      setDeleteError("Terjadi kesalahan saat menghapus koleksi");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Koleksi Kanji</h1>
          <p className="mt-1 text-stone-600">Kelola kumpulan kanji per topik atau level</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Koleksi Baru</Button>
      </div>

      {loading ? (
        <p className="text-stone-500">Memuat koleksi...</p>
      ) : collections.length === 0 ? (
        <Card className="text-center">
          <CardTitle>Belum ada koleksi</CardTitle>
          <p className="mt-2 text-stone-500">
            Buat koleksi pertama untuk mulai menambah kanji.
          </p>
          <Button className="mt-4" onClick={() => setModalOpen(true)}>
            Buat Koleksi
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Card key={collection.id} className="flex h-full flex-col transition-shadow hover:shadow-md">
              <Link href={`/collections/${collection.id}`} className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{collection.name}</CardTitle>
                  {collection.jlptLevel ? (
                    <Badge color="info">{collection.jlptLevel}</Badge>
                  ) : null}
                </div>
                {collection.description ? (
                  <p className="mt-2 text-sm text-stone-500 line-clamp-2">
                    {collection.description}
                  </p>
                ) : null}
                <p className="mt-4 text-sm font-medium text-stone-700">
                  {collection._count.kanjis} kanji
                </p>
              </Link>
              <div className="mt-4 border-t border-stone-100 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => {
                    setDeleteError("");
                    setDeleting(collection);
                  }}
                >
                  Hapus Koleksi
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title="Koleksi Baru" onClose={() => setModalOpen(false)}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nama Koleksi" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            label="Deskripsi (opsional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">Level JLPT</label>
            <select
              value={jlptLevel}
              onChange={(e) => setJlptLevel(e.target.value)}
              className="w-full rounded-lg border border-stone-200 px-3 py-2"
            >
              <option value="">— Pilih level —</option>
              {JLPT_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" className="w-full">
            Simpan
          </Button>
        </form>
      </Modal>

      <ConfirmDeleteModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDeleteCollection}
        title="Hapus Koleksi"
        description={
          deleting ? (
            <>
              Anda akan menghapus koleksi{" "}
              <span className="font-semibold text-stone-900">{deleting.name}</span>{" "}
              beserta {deleting._count.kanjis} kanji di dalamnya.
            </>
          ) : null
        }
        confirmText={deleting?.name ?? ""}
        confirmButtonLabel="Hapus Koleksi"
        loading={deleteLoading}
        error={deleteError}
      />
    </AppShell>
  );
}
