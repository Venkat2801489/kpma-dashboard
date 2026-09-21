"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoImage } from "./logo-image";
import { AddServiceModal } from "./add-service-modal";
import { aggregateClient } from "@/lib/aggregate";
import { formatINR } from "@/lib/currency";
import type { Category, Client } from "@/lib/types";
import type { Period } from "@/lib/types";

type SortKey = "name" | "amount" | "status";

export function ClientList({
  clients,
  categories,
  period,
  onChanged,
}: {
  clients: Client[];
  categories: Category[];
  period: Period;
  onChanged: () => void;
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [addServiceFor, setAddServiceFor] = useState<Client | null>(null);
  const [savingClientId, setSavingClientId] = useState<string | null>(null);

  const singleMonth = period.months.length === 1;

  async function setClientStatus(client: Client, status: "PAID" | "UNPAID") {
    if (!singleMonth || client.categories.length === 0) return;
    setSavingClientId(client.id);
    const { year, month } = period.months[0];
    await Promise.all(
      client.categories.map((cc) =>
        fetch("/api/payments", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientCategoryId: cc.id,
            year,
            month,
            status,
            amountPaid: status === "PAID" ? Number(cc.monthlyAmount) : 0,
          }),
        })
      )
    );
    setSavingClientId(null);
    onChanged();
  }

  const rows = useMemo(() => {
    const filtered = clients.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
    const withTotals = filtered.map((client) => ({ client, totals: aggregateClient(client, period) }));

    withTotals.sort((a, b) => {
      if (sortKey === "name") return a.client.name.localeCompare(b.client.name);
      if (sortKey === "amount") return b.totals.expected - a.totals.expected;
      // status: unpaid/partial first, paid last
      const rank = (t: typeof a.totals) => (t.pending <= 0 ? 2 : t.collected > 0 ? 1 : 0);
      return rank(a.totals) - rank(b.totals);
    });

    return withTotals;
  }, [clients, query, sortKey, period]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients…"
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
          No clients match &ldquo;{query}&rdquo;.
        </p>
      )}

      <motion.div layout className="space-y-3">
        <AnimatePresence initial={false}>
          {rows.map(({ client, totals }) => {
            return (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <LogoImage name={client.name} src={client.logoUrl} />
                    <div className="min-w-0 truncate font-medium text-text">{client.name}</div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <div className="text-lg font-bold text-text">{formatINR(totals.expected)}</div>
                    <div className="flex gap-1.5">
                      {(["PAID", "UNPAID"] as const).map((s) => {
                        const active = (totals.status === "PAID" ? "PAID" : "UNPAID") === s;
                        const disabled =
                          !singleMonth || client.categories.length === 0 || savingClientId === client.id;
                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={disabled}
                            title={!singleMonth ? "Switch to a single month to edit" : undefined}
                            onClick={() => setClientStatus(client, s)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                              active
                                ? s === "PAID"
                                  ? "bg-paid-bg text-paid"
                                  : "bg-unpaid-bg text-unpaid"
                                : "border border-border text-text-muted hover:bg-surface-hover"
                            } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                          >
                            {s === "PAID" ? "Paid" : "Unpaid"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                  {client.categories.map((cc) => (
                    <span
                      key={cc.id}
                      className="rounded-full border border-border px-2.5 py-1.5 text-xs text-text-muted"
                    >
                      {cc.category.name}
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAddServiceFor(client)}
                    className="rounded-full border border-dashed border-border px-2.5 py-1.5 text-xs text-text-faint hover:bg-surface-hover"
                  >
                    + service
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {addServiceFor && (
        <AddServiceModal
          open
          onClose={() => setAddServiceFor(null)}
          clientId={addServiceFor.id}
          clientName={addServiceFor.name}
          availableCategories={categories.filter(
            (c) => !addServiceFor.categories.some((cc) => cc.categoryId === c.id)
          )}
          onSaved={onChanged}
        />
      )}
    </div>
  );
}
