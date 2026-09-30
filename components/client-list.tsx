"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogoImage } from "./logo-image";
import { AddServiceModal } from "./add-service-modal";
import { EditClientModal } from "./edit-client-modal";
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
  const [editClientId, setEditClientId] = useState<string | null>(null);
  const [savingClientId, setSavingClientId] = useState<string | null>(null);

  const editClient = editClientId ? (clients.find((c) => c.id === editClientId) ?? null) : null;

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
            const isPaid = totals.status === "PAID";
            return (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`overflow-hidden rounded-xl border border-border bg-surface p-3 pl-2.5 shadow-sm transition-shadow hover:shadow-md ${
                  isPaid ? "border-l-4 border-l-paid" : "border-l-4 border-l-unpaid"
                }`}
              >
                {/* Layer 1: logo + name on the left, amount + edit on the right */}
                <div className="flex items-center gap-2.5">
                  <LogoImage name={client.name} src={client.logoUrl} size={36} />
                  <div className="min-w-0 flex-1 truncate font-medium text-text">{client.name}</div>
                  <div className="flex shrink-0 items-center">
                    <div className="text-base font-bold text-text">{formatINR(totals.expected)}</div>
                    <button
                      type="button"
                      onClick={() => setEditClientId(client.id)}
                      aria-label={`Edit ${client.name}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-faint transition-colors hover:bg-surface-hover hover:text-brand"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Layer 2: services on the left, Paid/Unpaid under the amount */}
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
                    {client.categories.map((cc) => (
                      <span
                        key={cc.id}
                        className="shrink-0 whitespace-nowrap rounded-full border border-border px-2 py-1 text-[11px] leading-none text-text-muted"
                      >
                        {cc.category.name}
                      </span>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAddServiceFor(client)}
                      className="shrink-0 whitespace-nowrap rounded-full border border-dashed border-border px-2 py-1 text-[11px] leading-none text-text-faint hover:bg-surface-hover"
                    >
                      + service
                    </button>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {(["PAID", "UNPAID"] as const).map((s) => {
                      const active = (totals.status === "PAID" ? "PAID" : "UNPAID") === s;
                      const disabled = !singleMonth || client.categories.length === 0 || savingClientId === client.id;
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={disabled}
                          title={!singleMonth ? "Switch to a single month to edit" : undefined}
                          onClick={() => setClientStatus(client, s)}
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

      {editClient && (
        <EditClientModal open onClose={() => setEditClientId(null)} client={editClient} onSaved={onChanged} />
      )}
    </div>
  );
}
