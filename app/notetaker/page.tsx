"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard-header";
import { BottomNav, type BottomNavItem } from "@/components/bottom-nav";
import { MonthPicker, selectionToQuery, type PeriodSelection } from "@/components/month-picker";
import { ExpenseStatsRow } from "@/components/expense-stats-row";
import { ExpenseList } from "@/components/expense-list";
import { ExpenseModal } from "@/components/expense-modal";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { currentYearMonth } from "@/lib/period";
import type { Expense, ExpenseKind, Period } from "@/lib/types";

function KindDot({ className }: { className: string }) {
  return <span className={`block h-5 w-5 rounded-full border-[5px] border-current ${className}`} />;
}

/** Prefill for new entries: today when viewing the current month, else the 1st of the viewed month. */
function defaultDateFor(selection: PeriodSelection): string | undefined {
  if (selection.mode !== "month") return undefined;
  const now = currentYearMonth();
  if (selection.year === now.year && selection.month === now.month) return undefined;
  return `${selection.year}-${String(selection.month).padStart(2, "0")}-01`;
}

export default function NotetakerPage() {
  const now = currentYearMonth();
  const [selection, setSelection] = useState<PeriodSelection>({ mode: "month", year: now.year, month: now.month });
  const [period, setPeriod] = useState<Period | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [kindFilter, setKindFilter] = useState<ExpenseKind | null>(null);
  // `null` = closed, "new" = adding, otherwise the entry being edited.
  const [editing, setEditing] = useState<Expense | "new" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/expenses?${selectionToQuery(selection)}`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? `Failed to load entries (${res.status}).`);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setPeriod(data.period);
    setExpenses(data.expenses);
    setError(null);
    setLoading(false);
  }, [selection]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch on mount/period change
    load();
  }, [load]);

  const equipment = expenses.filter((e) => e.kind === "EQUIPMENT");
  const other = expenses.filter((e) => e.kind === "EXPENSE");
  const sum = (list: Expense[]) => list.reduce((total, e) => total + Number(e.amount), 0);
  const equipmentTotal = sum(equipment);
  const expenseTotal = sum(other);

  const visibleExpenses = kindFilter ? expenses.filter((e) => e.kind === kindFilter) : expenses;

  const kindItems: BottomNavItem[] = [
    { id: "EQUIPMENT", label: `Equipment · ${equipment.length}`, icon: <KindDot className="text-brand" /> },
    { id: "EXPENSE", label: `Expenses · ${other.length}`, icon: <KindDot className="text-partial" /> },
  ];

  return (
    <div className="min-h-screen">
      <DashboardHeader scope="notetaker" subtitle="Notetaker spend dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-4 pb-28">
        {error ? (
          <div className="rounded-xl border border-unpaid/40 bg-unpaid-bg p-4 text-sm text-unpaid">
            <p className="font-medium">Couldn&rsquo;t load the notetaker dashboard.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : loading || !period ? (
          <DashboardSkeleton showCategoryChips={false} />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-lg font-semibold text-text">{period.label}</h1>
              <MonthPicker value={selection} onChange={setSelection} />
            </div>

            <div className="mb-6">
              <ExpenseStatsRow
                totalSpent={equipmentTotal + expenseTotal}
                equipmentTotal={equipmentTotal}
                expenseTotal={expenseTotal}
                entryCount={expenses.length}
              />
            </div>

            <ExpenseList expenses={visibleExpenses} onEdit={setEditing} />
          </motion.div>
        )}
      </main>

      <button
        type="button"
        onClick={() => setEditing("new")}
        aria-label="Add spend"
        className="bg-gradient-brand fixed right-4 bottom-20 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[var(--shadow-brand)] transition-transform active:scale-90"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <BottomNav
        items={kindItems}
        selected={kindFilter}
        onSelect={(id) => setKindFilter(id as ExpenseKind | null)}
      />

      {editing && (
        <ExpenseModal
          key={editing === "new" ? "new" : editing.id}
          open
          expense={editing === "new" ? null : editing}
          defaultDate={defaultDateFor(selection)}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}
