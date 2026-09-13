import { formatINR } from "@/lib/currency";

export function StatsRow({
  totalExpected,
  totalCollected,
  totalPending,
  paidCount,
  unpaidCount,
  partialCount,
  collectionRate,
}: {
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  paidCount: number;
  unpaidCount: number;
  partialCount: number;
  collectionRate: number;
}) {
  const cards = [
    { label: "Expected", value: formatINR(totalExpected), accent: "text-text" },
    { label: "Collected", value: formatINR(totalCollected), accent: "text-paid" },
    { label: "Pending", value: formatINR(totalPending), accent: "text-unpaid" },
    { label: "Collection rate", value: `${collectionRate.toFixed(0)}%`, accent: "text-brand" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-border bg-surface p-4">
          <div className="text-xs text-text-muted">{c.label}</div>
          <div className={`mt-1 text-xl font-semibold ${c.accent}`}>{c.value}</div>
        </div>
      ))}
      <div className="col-span-2 flex items-center gap-4 rounded-xl border border-border bg-surface p-4 sm:col-span-4">
        <StatusCount label="Paid" count={paidCount} className="text-paid" />
        <StatusCount label="Partial" count={partialCount} className="text-partial" />
        <StatusCount label="Unpaid" count={unpaidCount} className="text-unpaid" />
      </div>
    </div>
  );
}

function StatusCount({ label, count, className }: { label: string; count: number; className: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`h-2.5 w-2.5 rounded-full ${className.replace("text-", "bg-")}`} />
      <span className="text-text-muted">{label}</span>
      <span className={`font-semibold ${className}`}>{count}</span>
    </div>
  );
}
