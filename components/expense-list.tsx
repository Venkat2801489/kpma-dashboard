"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatINR } from "@/lib/currency";
import type { Expense } from "@/lib/types";

type SortKey = "date" | "amount";

const borderByKind = {
  EQUIPMENT: "border-l-brand",
  EXPENSE: "border-l-partial",
} as const;

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

export function ExpenseList({ expenses, onEdit }: { expenses: Expense[]; onEdit: (expense: Expense) => void }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = expenses.filter(
      (e) => e.title.toLowerCase().includes(q) || (e.notes ?? "").toLowerCase().includes(q)
    );
    // API already returns newest first; only re-sort for amount.
    if (sortKey === "amount") return [...filtered].sort((a, b) => Number(b.amount) - Number(a.amount));
    return filtered;
  }, [expenses, query, sortKey]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search entries…"
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand sm:max-w-xs"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-brand"
        >
          <option value="date">Sort: Newest</option>
          <option value="amount">Sort: Amount</option>
        </select>
      </div>

      {rows.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-text-muted">
          {query ? (
            <>No entries match &ldquo;{query}&rdquo;.</>
          ) : (
            "Nothing spent yet this period. Tap + to add equipment or an expense."
          )}
        </p>
      )}

      <motion.div layout className="space-y-3">
        <AnimatePresence initial={false}>
          {rows.map((expense) => (
            <motion.button
              key={expense.id}
              type="button"
              layout
              onClick={() => onEdit(expense)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              whileTap={{ scale: 0.99 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-label={`Edit ${expense.title}`}
              className={`flex w-full items-center gap-2.5 overflow-hidden rounded-xl border border-l-4 border-border bg-surface p-3 pl-2.5 text-left shadow-sm transition-shadow hover:shadow-md ${borderByKind[expense.kind]}`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  expense.kind === "EQUIPMENT" ? "bg-brand text-brand-fg" : "bg-partial-bg text-partial"
                }`}
              >
                {expense.kind === "EQUIPMENT" ? <CameraIcon /> : <ReceiptIcon />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-text">{expense.title}</div>
                <div className="truncate text-xs text-text-muted">
                  {dateFormatter.format(new Date(expense.spentOn))} ·{" "}
                  {expense.kind === "EQUIPMENT" ? "Equipment" : "Expense"}
                  {expense.notes ? ` · ${expense.notes}` : ""}
                </div>
              </div>
              <div className="shrink-0 text-base font-bold text-text">{formatINR(expense.amount)}</div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
