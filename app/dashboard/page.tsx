"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TopBar } from "@/components/top-bar";
import { MonthPicker, selectionToQuery, type PeriodSelection } from "@/components/month-picker";
import { ClientStatsRow } from "@/components/client-stats-row";
import { CategoryChips } from "@/components/category-chips";
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
      <TopBar scope="main" subtitle="Client & payment dashboard">
        <MonthPicker value={selection} onChange={setSelection} />
      </TopBar>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error ? (
          <div className="rounded-xl border border-unpaid/40 bg-unpaid-bg p-4 text-sm text-unpaid">
            <p className="font-medium">Couldn&rsquo;t load the dashboard.</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : loading || !period || !stats ? (
          <DashboardSkeleton />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="mb-2 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-text">{period.label}</h1>
              <div className="flex gap-2">
                <Link
                  href="/dashboard/settings"
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:bg-surface-hover"
                >
                  Manage categories
                </Link>
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-fg"
                >
                  + Add client
                </button>
              </div>
            </div>

            <div className="mb-6">
              <ClientStatsRow
                totalExpected={stats.totalExpected}
                totalCollected={stats.totalCollected}
                totalPending={stats.totalPending}
                totalClients={categoryFiltered.length}
              />
            </div>

            <div className="mb-4">
              <CategoryChips categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />
            </div>

            <ClientList clients={visibleClients} categories={categories} period={period} onChanged={handleChanged} />
          </motion.div>
        )}
      </main>

      <AddClientModal open={addOpen} onClose={() => setAddOpen(false)} categories={categories} onSaved={handleChanged} />
    </div>
  );
}
