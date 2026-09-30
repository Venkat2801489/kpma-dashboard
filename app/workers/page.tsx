"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard-header";
import { BottomNav, type BottomNavItem } from "@/components/bottom-nav";
import { MonthPicker, selectionToQuery, type PeriodSelection } from "@/components/month-picker";
import { WorkerStatsRow } from "@/components/worker-stats-row";
import { WorkerList } from "@/components/worker-list";
import { AddWorkerModal } from "@/components/add-worker-modal";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { aggregateWorker, computePayrollStats } from "@/lib/aggregate";
import { currentYearMonth } from "@/lib/period";
import type { Period, PaymentStatus, Worker } from "@/lib/types";

function StatusDot({ className }: { className: string }) {
  return <span className={`block h-5 w-5 rounded-full border-[5px] border-current ${className}`} />;
}

export default function WorkersPage() {
  const router = useRouter();
  const now = currentYearMonth();
  const [selection, setSelection] = useState<PeriodSelection>({ mode: "month", year: now.year, month: now.month });
  const [period, setPeriod] = useState<Period | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/workers?${selectionToQuery(selection)}`);
    if (res.status === 401) {
      router.push("/workers/login");
      return;
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? `Failed to load workers (${res.status}).`);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setPeriod(data.period);
    setWorkers(data.workers);
    setError(null);
    setLoading(false);
  }, [selection, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch on mount/period change
    load();
  }, [load]);

  const stats = period ? computePayrollStats(workers, period) : null;

  const workerLines = period ? workers.map((worker) => ({ worker, line: aggregateWorker(worker, period) })) : [];
  const paidCount = workerLines.filter((w) => w.line.status === "PAID").length;
  const partialCount = workerLines.filter((w) => w.line.status === "PARTIAL").length;
  const unpaidCount = workerLines.filter((w) => w.line.status === "UNPAID").length;

  const visibleWorkers = statusFilter
    ? workerLines.filter((w) => w.line.status === statusFilter).map((w) => w.worker)
    : workers;

  const statusItems: BottomNavItem[] = [
    { id: "PAID", label: `Paid · ${paidCount}`, icon: <StatusDot className="text-paid" /> },
    { id: "PARTIAL", label: `Partial · ${partialCount}`, icon: <StatusDot className="text-partial" /> },
    { id: "UNPAID", label: `Unpaid · ${unpaidCount}`, icon: <StatusDot className="text-unpaid" /> },
  ];

  return (
    <div className="min-h-screen">
      <DashboardHeader scope="worker" subtitle="Worker payroll dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-4 pb-28">
        {error ? (
          <div className="rounded-xl border border-unpaid/40 bg-unpaid-bg p-4 text-sm text-unpaid">
            <p className="font-medium">Couldn&rsquo;t load the payroll dashboard.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : loading || !period || !stats ? (
          <DashboardSkeleton showCategoryChips={false} />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-lg font-semibold text-text">{period.label}</h1>
              <MonthPicker value={selection} onChange={setSelection} />
            </div>

            <div className="mb-6">
              <WorkerStatsRow
                totalExpected={stats.totalExpected}
                totalCollected={stats.totalCollected}
                totalPending={stats.totalPending}
                totalWorkers={workers.length}
              />
            </div>

            <WorkerList workers={visibleWorkers} period={period} onChanged={load} />
          </motion.div>
        )}
      </main>

      <button
        type="button"
        onClick={() => setAddOpen(true)}
        aria-label="Add worker"
        className="bg-gradient-brand fixed right-4 bottom-20 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[var(--shadow-brand)] transition-transform active:scale-90"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <BottomNav
        items={statusItems}
        selected={statusFilter}
        onSelect={(id) => setStatusFilter(id as PaymentStatus | null)}
      />

      <AddWorkerModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={load} />
    </div>
  );
}
