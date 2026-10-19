"use client";

import { useState } from "react";
import { Modal } from "./modal";
import type { Expense, ExpenseKind } from "@/lib/types";

const KIND_OPTIONS: { value: ExpenseKind; label: string; hint: string }[] = [
  { value: "EQUIPMENT", label: "Equipment", hint: "Camera, mic, lights…" },
  { value: "EXPENSE", label: "Expense", hint: "Petrol, travel, food…" },
];

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Add or edit a spend entry. Remount with a new `key` to reset the form for a
 * different entry — initial values are read from props only once.
 */
export function ExpenseModal({
  open,
  expense,
  defaultDate,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** Entry being edited, or null to add a new one. */
  expense: Expense | null;
  /** Date to prefill when adding (YYYY-MM-DD); falls back to today. */
  defaultDate?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(expense?.title ?? "");
  const [kind, setKind] = useState<ExpenseKind>(expense?.kind ?? "EQUIPMENT");
  const [amount, setAmount] = useState(expense ? String(Number(expense.amount)) : "");
  const [spentOn, setSpentOn] = useState(expense ? expense.spentOn.slice(0, 10) : (defaultDate ?? todayISO()));
  const [notes, setNotes] = useState(expense?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!title.trim() || amount === "" || Number(amount) <= 0 || !spentOn) {
      setError("Enter what it was, an amount, and a date.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch(expense ? `/api/expenses/${expense.id}` : "/api/expenses", {
      method: expense ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), kind, amount: Number(amount), spentOn, notes: notes.trim() }),
    });
    setSaving(false);
    if (!res.ok) {
      setError(expense ? "Could not save changes." : "Could not add entry.");
      return;
    }
    onSaved();
    onClose();
  }

  async function remove() {
    if (!expense || !confirm(`Delete “${expense.title}”?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/expenses/${expense.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      setError("Could not delete entry.");
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={expense ? "Edit entry" : "Add spend"}>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {KIND_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setKind(opt.value)}
            aria-pressed={kind === opt.value}
            className={`rounded-xl border px-3 py-2 text-left transition-colors ${
              kind === opt.value ? "border-brand bg-surface-hover" : "border-border hover:bg-surface-hover"
            }`}
          >
            <div className="text-sm font-medium text-text">{opt.label}</div>
            <div className="text-[11px] text-text-muted">{opt.hint}</div>
          </button>
        ))}
      </div>

      <label className="mb-3 block text-sm">
        <span className="mb-1 block text-text-muted">What was it?</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={kind === "EQUIPMENT" ? "Camera" : "Petrol"}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
        />
      </label>

      <div className="mb-3 grid grid-cols-2 gap-2">
        <label className="block text-sm">
          <span className="mb-1 block text-text-muted">Amount (₹)</span>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="5000"
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-text-muted">Date</span>
          <input
            type="date"
            value={spentOn}
            onChange={(e) => setSpentOn(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          />
        </label>
      </div>

      <label className="mb-4 block text-sm">
        <span className="mb-1 block text-text-muted">Note (optional)</span>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
        />
      </label>

      {error && <p className="mb-3 text-sm text-unpaid">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={saving || deleting}
        className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg transition-opacity disabled:opacity-60"
      >
        {saving ? "Saving…" : expense ? "Save changes" : "Add entry"}
      </button>

      {expense && (
        <button
          type="button"
          onClick={remove}
          disabled={saving || deleting}
          className="mt-2 w-full rounded-lg border border-border px-4 py-2 text-sm text-unpaid transition-opacity hover:bg-surface-hover disabled:opacity-60"
        >
          {deleting ? "Deleting…" : "Delete entry"}
        </button>
      )}
    </Modal>
  );
}
