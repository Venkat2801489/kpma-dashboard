"use client";

import { useState } from "react";
import { Modal } from "./modal";
import type { Category } from "@/lib/types";

export function AddServiceModal({
  open,
  onClose,
  clientId,
  clientName,
  availableCategories,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  availableCategories: Category[];
  onSaved: () => void;
}) {
  const [categoryId, setCategoryId] = useState(availableCategories[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!categoryId || amount === "" || Number(amount) < 0) {
      setError("Pick a category and enter a monthly amount.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/clients/${clientId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, monthlyAmount: Number(amount) }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not add that service.");
      return;
    }
    setAmount("");
    onSaved();
    onClose();
  }

  if (availableCategories.length === 0) {
    return (
      <Modal open={open} onClose={onClose} title={`Add a service — ${clientName}`}>
        <p className="text-sm text-text-muted">{clientName} is already billed under every category.</p>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={`Add a service — ${clientName}`}>
      <label className="mb-3 block text-sm">
        <span className="mb-1 block text-text-muted">Category</span>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
        >
          {availableCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="mb-4 block text-sm">
        <span className="mb-1 block text-text-muted">Monthly amount (₹)</span>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
        />
      </label>

      {error && <p className="mb-3 text-sm text-unpaid">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg transition-opacity disabled:opacity-60"
      >
        {saving ? "Saving…" : "Add service"}
      </button>
    </Modal>
  );
}
