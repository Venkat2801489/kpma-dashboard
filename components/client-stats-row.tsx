"use client";

import { motion } from "framer-motion";
import { formatINR } from "@/lib/currency";

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
  const progress = totalExpected > 0 ? Math.min(1, totalCollected / totalExpected) : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-gradient-brand col-span-2 overflow-hidden rounded-2xl p-5 text-white shadow-[var(--shadow-brand)]"
      >
        <div className="text-xs font-medium text-white/70">Collected this period</div>
        <div className="mt-1 text-3xl font-semibold tracking-tight">{formatINR(totalCollected)}</div>
        <div className="mt-1 text-xs text-white/70">of {formatINR(totalExpected)} expected</div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="h-full rounded-full bg-white"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.08 }}
        className="rounded-2xl border border-border bg-surface p-4"
      >
        <div className="text-xs text-text-muted">Pending</div>
        <div className="mt-1 text-xl font-semibold text-unpaid">{formatINR(totalPending)}</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.14 }}
        className="rounded-2xl border border-border bg-surface p-4"
      >
        <div className="text-xs text-text-muted">Total clients</div>
        <div className="mt-1 text-xl font-semibold text-brand">{totalClients}</div>
      </motion.div>
    </div>
  );
}
