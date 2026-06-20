"use client";

import { useEffect, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Modal } from "./modal";

type ConfirmDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  confirmText: string;
  confirmButtonLabel?: string;
  loading?: boolean;
  error?: string;
};

export function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  confirmButtonLabel = "Hapus",
  loading = false,
  error,
}: ConfirmDeleteModalProps) {
  const [input, setInput] = useState("");
  const canConfirm = input === confirmText && !loading;

  useEffect(() => {
    if (open) {
      setInput("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canConfirm) return;
    await onConfirm();
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-sm text-stone-600">{description}</div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Tindakan ini tidak dapat dibatalkan. Semua kanji di dalamnya akan ikut
          terhapus.
        </div>

        <Input
          label={`Ketik "${confirmText}" untuk konfirmasi`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={confirmText}
          autoComplete="off"
          disabled={loading}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="danger"
            className="flex-1"
            disabled={!canConfirm}
          >
            {loading ? "Menghapus..." : confirmButtonLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
