"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard-header";
import { BottomNav } from "@/components/bottom-nav";
import { MonthPicker, selectionToQuery, type PeriodSelection } from "@/components/month-picker";
import { ClientStatsRow } from "@/components/client-stats-row";
import { ClientList } from "@/components/client-list";
import { AddClientModal } from "@/components/add-client-modal";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { computeStats } from "@/lib/aggregate";
import { currentYearMonth } from "@/lib/period";
import type { Category, Client, Period } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const now = currentYearMonth();
  const [selection, setSelection] = useState<PeriodSelection>({ mode: "month", year: now.year, month: now.month });
  const [period, setPeriod] = useState<Period | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = useCallback(async () => {
    const res = await fetch(`/api/clients?${selectionToQuery(selection)}`);
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? `Failed to load clients (${res.status}).`);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setPeriod(data.period);
    setClients(data.clients);
    setError(null);
    setLoading(false);
  }, [selection, router]);

  const loadCategories = useCallback(async () => {
    const res = await fetch("/api/categories");
    if (res.ok) setCategories(await res.json());
  }, []);

  useEffect(() => {
    // Intentional data fetch on mount / period change — no cache layer in this app.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadClients();
  }, [loadClients]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch on mount
    loadCategories();
  }, [loadCategories]);

  const categoryFiltered = selectedCategory
    ? clients.filter((c) => c.categories.some((cc) => cc.categoryId === selectedCategory))
    : clients;

  const stats = period ? computeStats(categoryFiltered, period) : null;

  const visibleClients = categoryFiltered;

  function handleChanged() {
    loadClients();
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader subtitle="Client & payment dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-4 pb-28">
        {error ? (
          <div className="rounded-xl border border-unpaid/40 bg-unpaid-bg p-4 text-sm text-unpaid">
            <p className="font-medium">Couldn&rsquo;t load the dashboard.</p>
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
              <ClientStatsRow
                totalExpected={stats.totalExpected}
                totalCollected={stats.totalCollected}
                totalPending={stats.totalPending}
                totalClients={categoryFiltered.length}
              />
            </div>

            <ClientList clients={visibleClients} categories={categories} period={period} onChanged={handleChanged} />
          </motion.div>
        )}
      </main>

      <button
        type="button"
        onClick={() => setAddOpen(true)}
        aria-label="Add client"
        className="fixed right-4 bottom-20 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-fg shadow-lg transition-transform active:scale-95"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <BottomNav categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

      <AddClientModal open={addOpen} onClose={() => setAddOpen(false)} categories={categories} onSaved={handleChanged} />
    </div>
  );
}
