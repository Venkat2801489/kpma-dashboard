"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { initials } from "@/lib/drive-logo";
import { PaymentEditor } from "./payment-editor";
import { aggregateWorker } from "@/lib/aggregate";
import { formatINR } from "@/lib/currency";
import type { Period, SalaryPayment, Worker } from "@/lib/types";

type SortKey = "name" | "amount" | "status";

const borderByStatus = {
  PAID: "border-l-paid",
  PARTIAL: "border-l-partial",
  UNPAID: "border-l-unpaid",
} as const;

export function WorkerList({
  workers,
  period,
  onChanged,
}: {
  workers: Worker[];
  period: Period;
  onChanged: () => void;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [savingWorkerId, setSavingWorkerId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    workerId: string;
    label: string;
    monthlySalary: number;
    payment?: SalaryPayment;
  } | null>(null);

  const singleMonth = period.months.length === 1;

  function paymentFor(worker: Worker) {
    return worker.payments.find((p) => p.year === period.months[0].year && p.month === period.months[0].month);
  }

  async function setWorkerStatus(worker: Worker, status: "PAID" | "UNPAID") {
    if (!singleMonth) return;
    setSavingWorkerId(worker.id);
    const { year, month } = period.months[0];
    const existing = paymentFor(worker);
    await fetch("/api/salary-payments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workerId: worker.id,
        year,
        month,
        status,
        amountPaid: status === "PAID" ? Number(worker.monthlySalary) : 0,
        paidDate: status === "PAID" ? (existing?.paidDate ?? new Date().toISOString()) : null,
        notes: existing?.notes ?? null,
      }),
    });
    setSavingWorkerId(null);
    onChanged();
  }

  const rows = useMemo(() => {
    const filtered = workers.filter((w) => w.name.toLowerCase().includes(query.trim().toLowerCase()));
    const withLines = filtered.map((worker) => ({ worker, line: aggregateWorker(worker, period) }));

    withLines.sort((a, b) => {
      if (sortKey === "name") return a.worker.name.localeCompare(b.worker.name);
      if (sortKey === "amount") return b.line.expected - a.line.expected;
      // status: unpaid first, then partial, paid last
      const rank = { UNPAID: 0, PARTIAL: 1, PAID: 2 } as const;
      return rank[a.line.status] - rank[b.line.status];
    });

    return withLines;
  }, [workers, query, sortKey, period]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search workers…"
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand sm:max-w-xs"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
        >
          <option value="name">Sort: Name</option>
          <option value="amount">Sort: Amount</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      {rows.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">
          {query ? <>No workers match &ldquo;{query}&rdquo;.</> : "No workers to show."}
        </p>
      )}

      <motion.div layout className="space-y-3">
        <AnimatePresence initial={false}>
          {rows.map(({ worker, line }) => {
            const payment = paymentFor(worker);
            const disabled = !singleMonth || savingWorkerId === worker.id;
            return (
              <motion.div
                key={worker.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`overflow-hidden rounded-xl border border-l-4 border-border bg-surface p-3 pl-2.5 shadow-sm transition-shadow hover:shadow-md ${borderByStatus[line.status]}`}
              >
                {/* Layer 1: avatar + name on the left, salary + edit on the right */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-fg">
                    {initials(worker.name)}
                  </div>
                  <div className="min-w-0 flex-1 truncate font-medium text-text">{worker.name}</div>
                  <div className="flex shrink-0 items-center">
                    <div className="text-base font-bold text-text">{formatINR(line.expected)}</div>
                    <button
                      type="button"
                      disabled={!singleMonth}
                      title={singleMonth ? "Edit payment details" : "Switch to a single month to edit"}
                      aria-label={`Edit payment for ${worker.name}`}
                      onClick={() =>
                        setEditing({
                          workerId: worker.id,
                          label: worker.name,
                          monthlySalary: Number(worker.monthlySalary),
                          payment,
                        })
                      }
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-faint transition-colors hover:bg-surface-hover hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Layer 2: partial info / role on the left, Paid/Unpaid under the amount */}
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
                    {line.status === "PARTIAL" && (
                      <span className="shrink-0 whitespace-nowrap rounded-full border border-partial/30 bg-partial-bg px-2 py-1 text-[11px] leading-none font-medium text-partial">
                        Partial · {formatINR(line.collected)}
                      </span>
                    )}
                    {worker.role && (
                      <span className="shrink-0 whitespace-nowrap rounded-full border border-border px-2 py-1 text-[11px] leading-none text-text-muted">
                        {worker.role}
                      </span>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {(["PAID", "UNPAID"] as const).map((s) => {
                      const active = line.status === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={disabled}
                          title={!singleMonth ? "Switch to a single month to edit" : undefined}
                          onClick={() => setWorkerStatus(worker, s)}
                          className={`rounded-full border px-2.5 py-1 text-[11px] leading-none font-medium transition-all active:scale-95 ${
                            active
                              ? s === "PAID"
                                ? "border-paid/30 bg-paid-bg text-paid"
                                : "border-unpaid/30 bg-unpaid-bg text-unpaid"
                              : "border-border text-text-muted hover:bg-surface-hover"
                          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                          {s === "PAID" ? "Paid" : "Unpaid"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {editing && (
        <PaymentEditor
          open
          onClose={() => setEditing(null)}
          scope="worker"
          targetId={editing.workerId}
          targetLabel={editing.label}
          monthlyAmount={editing.monthlySalary}
          year={period.months[0].year}
          month={period.months[0].month}
          monthLabel={period.label}
          initialPayment={editing.payment}
          onSaved={onChanged}
        />
      )}
    </div>
  );
}
