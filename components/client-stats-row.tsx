"use client";

import { motion } from "framer-motion";
import { formatINR } from "@/lib/currency";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

export function ClientStatsRow({
  totalExpected,
  totalCollected,
  totalPending,
  totalClients,
}: {
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  totalClients: number;
}) {
  const cards = [
    { label: "Expected", value: formatINR(totalExpected), accent: "text-text" },
    { label: "Collected", value: formatINR(totalCollected), accent: "text-paid" },
    { label: "Pending", value: formatINR(totalPending), accent: "text-unpaid" },
    { label: "Total clients", value: String(totalClients), accent: "text-brand" },
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
    </motion.div>
  );
}
