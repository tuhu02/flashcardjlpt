"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type Collection = {
  id: string;
  name: string;
  _count: { kanjis: number };
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionId, setCollectionId] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => {
        setCollections(data);
        if (data[0]) setCollectionId(data[0].id);
      });
  }, []);

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !collectionId) return;

    setLoading(true);
    setImportMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("collectionId", collectionId);

    const res = await fetch("/api/kanjis/import", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);
    e.target.value = "";

    if (!res.ok) {
      setImportMessage(data.error ?? "Import gagal");
      return;
    }

    setImportMessage(
      `Berhasil import ${data.imported} kanji (${data.skipped} dilewati karena duplikat).`,
    );
  }

  function handleExport(format: "csv" | "json") {
    if (!collectionId) return;
    window.open(
      `/api/kanjis/export?collectionId=${collectionId}&format=${format}`,
      "_blank",
    );
  }

  return (
    <AppShell>
      <h1 className="text-3xl font-bold">Pengaturan</h1>
      <p className="mt-1 text-stone-600">Profil, import, dan export data kanji</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-4">Profil</CardTitle>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-stone-500">Nama</dt>
              <dd className="font-medium">{session?.user?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-stone-500">Email</dt>
              <dd className="font-medium">{session?.user?.email ?? "—"}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardTitle className="mb-4">Import & Export</CardTitle>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-stone-700">
                Pilih Koleksi
              </label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full rounded-lg border border-stone-200 px-3 py-2"
              >
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-2 text-sm text-stone-600">
                Import CSV (format: kanji, cara_baca, arti, level, kelompok)
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                disabled={loading || !collectionId}
                className="block w-full text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => handleExport("csv")}
                disabled={!collectionId}
              >
                Export CSV
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleExport("json")}
                disabled={!collectionId}
              >
                Export JSON
              </Button>
            </div>

            {importMessage ? (
              <p className="text-sm text-stone-600">{importMessage}</p>
            ) : null}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardTitle className="mb-2">Template CSV</CardTitle>
        <pre className="overflow-x-auto rounded-lg bg-stone-100 p-4 text-xs text-stone-700">
{`kanji,cara_baca,arti,level,kelompok
日,にち / ひ,Matahari / Hari,N5,Waktu
月,つき,Bulan,N5,Waktu
火,ひ,Api,N5,Alam
水,みず,Air,N5,Alam`}
        </pre>
      </Card>
    </AppShell>
  );
}
