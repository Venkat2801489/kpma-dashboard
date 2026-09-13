"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { formatINR } from "@/lib/currency";
import type { PaymentLike, PaymentStatus } from "@/lib/types";

type Props = {
  open: boolean;
  onClose: () => void;
  scope: "main" | "worker";
  targetId: string; // clientCategoryId or workerId
  targetLabel: string;
  monthlyAmount: number;
  year: number;
  month: number;
  monthLabel: string;
  initialPayment?: PaymentLike;
  onSaved: () => void;
};

export function PaymentEditor({
  open,
  onClose,
  scope,
  targetId,
  targetLabel,
  monthlyAmount,
  year,
  month,
  monthLabel,
  initialPayment,
  onSaved,
}: Props) {
  const [status, setStatus] = useState<PaymentStatus>(initialPayment?.status ?? "UNPAID");
  const [amount, setAmount] = useState<string>(initialPayment?.amountPaid ?? "0");
  const [paidDate, setPaidDate] = useState<string>(
    initialPayment?.paidDate ? initialPayment.paidDate.slice(0, 10) : ""
  );
  const [notes, setNotes] = useState(initialPayment?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(next: PaymentStatus) {
    setStatus(next);
    if (next === "PAID") setAmount(String(monthlyAmount));
    if (next === "UNPAID") setAmount("0");
  }

  async function save() {
    setSaving(true);
    setError(null);
    const endpoint = scope === "main" ? "/api/payments" : "/api/salary-payments";
    const idKey = scope === "main" ? "clientCategoryId" : "workerId";
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [idKey]: targetId,
        year,
        month,
        status,
        amountPaid: Number(amount) || 0,
        paidDate: paidDate ? new Date(paidDate).toISOString() : null,
        notes: notes || null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not save — try again.");
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={`${targetLabel} — ${monthLabel}`}>
      <p className="mb-3 text-sm text-text-muted">Monthly amount: {formatINR(monthlyAmount)}</p>

      <div className="mb-4 flex gap-2">
        {(["PAID", "PARTIAL", "UNPAID"] as PaymentStatus[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => pick(s)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              status === s
                ? s === "PAID"
                  ? "border-paid bg-paid-bg text-paid"
                  : s === "PARTIAL"
                    ? "border-partial bg-partial-bg text-partial"
                    : "border-unpaid bg-unpaid-bg text-unpaid"
                : "border-border text-text-muted hover:bg-surface-hover"
            }`}
          >
            {s === "PAID" ? "Paid" : s === "PARTIAL" ? "Partial" : "Unpaid"}
          </button>
        ))}
      </div>

      <label className="mb-3 block text-sm">
        <span className="mb-1 block text-text-muted">Amount paid (₹)</span>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
        />
      </label>

      <label className="mb-3 block text-sm">
        <span className="mb-1 block text-text-muted">Paid date (optional)</span>
        <input
          type="date"
          value={paidDate}
          onChange={(e) => setPaidDate(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
        />
      </label>

      <label className="mb-4 block text-sm">
        <span className="mb-1 block text-text-muted">Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
        />
      </label>

      {error && <p className="mb-3 text-sm text-unpaid">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg transition-opacity disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </Modal>
  );
}
