"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { MonthPicker, selectionToQuery, type PeriodSelection } from "@/components/month-picker";
import { StatsRow } from "@/components/stats-row";
import { WorkerList } from "@/components/worker-list";
import { AddWorkerModal } from "@/components/add-worker-modal";
import { computePayrollStats } from "@/lib/aggregate";
import { currentYearMonth } from "@/lib/period";
import type { Period, Worker } from "@/lib/types";

export default function WorkersPage() {
  const router = useRouter();
  const now = currentYearMonth();
  const [selection, setSelection] = useState<PeriodSelection>({ mode: "month", year: now.year, month: now.month });
  const [period, setPeriod] = useState<Period | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
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

  return (
    <div className="min-h-screen">
      <TopBar scope="worker" subtitle="Worker payroll dashboard" workerLink={false}>
        <MonthPicker value={selection} onChange={setSelection} />
      </TopBar>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {error ? (
          <div className="rounded-xl border border-unpaid/40 bg-unpaid-bg p-4 text-sm text-unpaid">
            <p className="font-medium">Couldn&rsquo;t load the payroll dashboard.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : loading || !period || !stats ? (
          <p className="text-sm text-text-muted">Loading…</p>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-text">{period.label}</h1>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg"
              >
                + Add worker
              </button>
            </div>

            <div className="mb-6">
              <StatsRow
                totalExpected={stats.totalExpected}
                totalCollected={stats.totalCollected}
                totalPending={stats.totalPending}
                paidCount={stats.paidCount}
                unpaidCount={stats.unpaidCount}
                partialCount={stats.partialCount}
                collectionRate={stats.collectionRate}
              />
            </div>

            <WorkerList workers={workers} period={period} onChanged={load} />
          </>
        )}
      </main>

      <AddWorkerModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={load} />
    </div>
  );
}
