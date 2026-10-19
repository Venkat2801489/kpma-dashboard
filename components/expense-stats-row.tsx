"use client";

import { motion } from "framer-motion";
import { formatINR } from "@/lib/currency";

export function ExpenseStatsRow({
  totalSpent,
  equipmentTotal,
  expenseTotal,
  entryCount,
}: {
  totalSpent: number;
  equipmentTotal: number;
  expenseTotal: number;
  entryCount: number;
}) {
  const equipmentShare = totalSpent > 0 ? equipmentTotal / totalSpent : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-gradient-brand col-span-2 overflow-hidden rounded-2xl p-5 text-white shadow-[var(--shadow-brand)]"
      >
        <div className="text-xs font-medium text-white/70">Spent this period</div>
        <div className="mt-1 text-3xl font-semibold tracking-tight">{formatINR(totalSpent)}</div>
        <div className="mt-1 text-xs text-white/70">
          {entryCount} {entryCount === 1 ? "entry" : "entries"}
        </div>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${equipmentShare * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
            className="h-full rounded-full bg-white"
          />
        </div>
        <div className="mt-1.5 text-[11px] text-white/70">
          {Math.round(equipmentShare * 100)}% on equipment
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.08 }}
        className="rounded-2xl border border-border bg-surface p-4"
      >
        <div className="text-xs text-text-muted">Equipment</div>
        <div className="mt-1 text-xl font-semibold text-brand">{formatINR(equipmentTotal)}</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.14 }}
        className="rounded-2xl border border-border bg-surface p-4"
      >
        <div className="text-xs text-text-muted">Other expenses</div>
        <div className="mt-1 text-xl font-semibold text-partial">{formatINR(expenseTotal)}</div>
      </motion.div>
    </div>
  );
}
