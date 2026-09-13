"use client";

import { useMemo, useState } from "react";
import { LogoImage } from "./logo-image";
import { StatusPill } from "./status-pill";
import { PaymentEditor } from "./payment-editor";
import { AddServiceModal } from "./add-service-modal";
import { aggregateClient, aggregateClientCategory } from "@/lib/aggregate";
import { formatINR } from "@/lib/currency";
import type { Category, Client, Payment } from "@/lib/types";
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
  const [editing, setEditing] = useState<{
    clientCategoryId: string;
    label: string;
    monthlyAmount: number;
    payment?: Payment;
  } | null>(null);

  const singleMonth = period.months.length === 1;

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

      <div className="space-y-3">
        {rows.map(({ client, totals }) => {
          return (
            <div key={client.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <LogoImage name={client.name} src={client.logoUrl} />
                  <div>
                    <div className="font-medium text-text">{client.name}</div>
                    <div className="text-xs text-text-muted">
                      {formatINR(totals.collected)} of {formatINR(totals.expected)} collected
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {client.categories.map((cc) => {
                    const line = aggregateClientCategory(cc, period);
                    const payment = cc.payments.find(
                      (p) => p.year === period.months[0].year && p.month === period.months[0].month
                    );
                    return (
                      <div key={cc.id} className="flex items-center gap-1.5">
                        <span className="text-xs text-text-muted">{cc.category.name}</span>
                        <StatusPill
                          status={line.status}
                          disabled={!singleMonth}
                          title={singleMonth ? undefined : "Switch to a single month to edit"}
                          onClick={
                            singleMonth
                              ? () =>
                                  setEditing({
                                    clientCategoryId: cc.id,
                                    label: `${client.name} · ${cc.category.name}`,
                                    monthlyAmount: Number(cc.monthlyAmount),
                                    payment,
                                  })
                              : undefined
                          }
                        />
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setAddServiceFor(client)}
                    className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-text-faint hover:bg-surface-hover"
                  >
                    + service
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && (
        <PaymentEditor
          open
          onClose={() => setEditing(null)}
          scope="main"
          targetId={editing.clientCategoryId}
          targetLabel={editing.label}
          monthlyAmount={editing.monthlyAmount}
          year={period.months[0].year}
          month={period.months[0].month}
          monthLabel={period.label}
          initialPayment={editing.payment}
          onSaved={onChanged}
        />
      )}

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
