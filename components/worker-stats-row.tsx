"use client";

import { motion } from "framer-motion";
import { formatINR } from "@/lib/currency";
import type { PaymentStatus } from "@/lib/types";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

export function WorkerStatsRow({
  totalExpected,
  totalCollected,
  totalPending,
  totalWorkers,
  paidCount,
  unpaidCount,
  partialCount,
  statusFilter,
  onStatusFilterChange,
}: {
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  totalWorkers: number;
  paidCount: number;
  unpaidCount: number;
  partialCount: number;
  statusFilter: PaymentStatus | null;
  onStatusFilterChange: (status: PaymentStatus | null) => void;
}) {
  const cards = [
    { label: "Expected", value: formatINR(totalExpected), accent: "text-text" },
    { label: "Paid out", value: formatINR(totalCollected), accent: "text-paid" },
    { label: "Pending", value: formatINR(totalPending), accent: "text-unpaid" },
    { label: "Total workers", value: String(totalWorkers), accent: "text-brand" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <motion.div
          key={c.label}
          variants={item}
          className="rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-sm"
        >
          <div className="text-xs text-text-muted">{c.label}</div>
          <div className={`mt-1 text-xl font-semibold ${c.accent}`}>{c.value}</div>
        </motion.div>
      ))}

      <motion.div variants={item} className="col-span-2 grid grid-cols-3 gap-3 sm:col-span-4">
        <StatusFilterCard
          label="Paid"
          count={paidCount}
          status="PAID"
          active={statusFilter === "PAID"}
          onClick={() => onStatusFilterChange(statusFilter === "PAID" ? null : "PAID")}
        />
        <StatusFilterCard
          label="Partial"
          count={partialCount}
          status="PARTIAL"
          active={statusFilter === "PARTIAL"}
          onClick={() => onStatusFilterChange(statusFilter === "PARTIAL" ? null : "PARTIAL")}
        />
        <StatusFilterCard
          label="Unpaid"
          count={unpaidCount}
          status="UNPAID"
          active={statusFilter === "UNPAID"}
          onClick={() => onStatusFilterChange(statusFilter === "UNPAID" ? null : "UNPAID")}
        />
      </motion.div>
    </motion.div>
  );
}

const statusStyles: Record<PaymentStatus, { text: string; bg: string; ring: string; dot: string }> = {
  PAID: { text: "text-paid", bg: "bg-paid-bg", ring: "ring-paid", dot: "bg-paid" },
  PARTIAL: { text: "text-partial", bg: "bg-partial-bg", ring: "ring-partial", dot: "bg-partial" },
  UNPAID: { text: "text-unpaid", bg: "bg-unpaid-bg", ring: "ring-unpaid", dot: "bg-unpaid" },
};

function StatusFilterCard({
  label,
  count,
  status,
  active,
  onClick,
}: {
  label: string;
  count: number;
  status: PaymentStatus;
  active: boolean;
  onClick: () => void;
}) {
  const s = statusStyles[status];
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      aria-pressed={active}
      title={active ? `Clear ${label.toLowerCase()} filter` : `Show ${label.toLowerCase()} workers`}
      className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
        active ? `${s.bg} border-transparent ring-2 ${s.ring}` : "border-border bg-surface hover:bg-surface-hover"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
        <span className="text-sm text-text-muted">{label}</span>
      </div>
      <span className={`text-lg font-semibold ${s.text}`}>{count}</span>
    </motion.button>
  );
}
