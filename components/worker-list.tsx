"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { initials } from "@/lib/drive-logo";
import { StatusPill } from "./status-pill";
import { PaymentEditor } from "./payment-editor";
import { aggregateWorker } from "@/lib/aggregate";
import { formatINR } from "@/lib/currency";
import type { Period, SalaryPayment, Worker } from "@/lib/types";

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
  const [editing, setEditing] = useState<{
    workerId: string;
    label: string;
    monthlySalary: number;
    payment?: SalaryPayment;
  } | null>(null);

  const singleMonth = period.months.length === 1;

  const rows = useMemo(
    () => workers.filter((w) => w.name.toLowerCase().includes(query.trim().toLowerCase())),
    [workers, query]
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search workers…"
        className="mb-4 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand sm:max-w-xs"
      />

      {rows.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">
          No workers match &ldquo;{query}&rdquo;.
        </p>
      )}

      <motion.div layout className="space-y-3">
        <AnimatePresence initial={false}>
          {rows.map((worker) => {
            const line = aggregateWorker(worker, period);
            const payment = worker.payments.find(
              (p) => p.year === period.months[0].year && p.month === period.months[0].month
            );
            return (
              <motion.div
                key={worker.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand font-semibold text-brand-fg">
                    {initials(worker.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-text">{worker.name}</div>
                    <div className="truncate text-xs text-text-muted">
                      {worker.role ? `${worker.role} · ` : ""}
                      {formatINR(Number(worker.monthlySalary))}/mo
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:justify-end">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-text">{formatINR(line.collected)}</div>
                    <div className="text-xs text-text-muted">of {formatINR(line.expected)}</div>
                  </div>
                  <StatusPill
                    status={line.status}
                    disabled={!singleMonth}
                    title={singleMonth ? undefined : "Switch to a single month to edit"}
                    onClick={
                      singleMonth
                        ? () =>
                            setEditing({
                              workerId: worker.id,
                              label: worker.name,
                              monthlySalary: Number(worker.monthlySalary),
                              payment,
                            })
                        : undefined
                    }
                  />
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
