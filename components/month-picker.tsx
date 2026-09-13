"use client";

import { useState } from "react";
import { MONTH_NAMES } from "@/lib/period";

export type PeriodSelection =
  | { mode: "month"; year: number; month: number }
  | { mode: "range"; start: string; end: string };

export function selectionToQuery(sel: PeriodSelection): string {
  if (sel.mode === "month") return `year=${sel.year}&month=${sel.month}`;
  return `start=${sel.start}&end=${sel.end}`;
}

export function MonthPicker({
  value,
  onChange,
}: {
  value: PeriodSelection;
  onChange: (sel: PeriodSelection) => void;
}) {
  const [customOpen, setCustomOpen] = useState(value.mode === "range");
  const now = new Date();
  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 4 + i);

  const monthValue = value.mode === "month" ? value : { year: now.getFullYear(), month: now.getMonth() + 1 };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!customOpen && (
        <>
          <select
            value={monthValue.month}
            onChange={(e) => onChange({ mode: "month", year: monthValue.year, month: Number(e.target.value) })}
            className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text outline-none focus:border-brand"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={monthValue.year}
            onChange={(e) => onChange({ mode: "month", year: Number(e.target.value), month: monthValue.month })}
            className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text outline-none focus:border-brand"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </>
      )}

      {customOpen && (
        <>
          <input
            type="month"
            value={value.mode === "range" ? value.start : ""}
            onChange={(e) => {
              const start = e.target.value;
              const end = value.mode === "range" ? value.end : start;
              onChange({ mode: "range", start, end });
            }}
            className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text outline-none focus:border-brand"
          />
          <span className="text-text-muted">to</span>
          <input
            type="month"
            value={value.mode === "range" ? value.end : ""}
            onChange={(e) => {
              const end = e.target.value;
              const start = value.mode === "range" ? value.start : end;
              onChange({ mode: "range", start, end });
            }}
            className="rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text outline-none focus:border-brand"
          />
        </>
      )}

      <button
        type="button"
        onClick={() => {
          if (customOpen) {
            setCustomOpen(false);
            onChange({ mode: "month", year: now.getFullYear(), month: now.getMonth() + 1 });
          } else {
            setCustomOpen(true);
            const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
            onChange({ mode: "range", start: ym, end: ym });
          }
        }}
        className="rounded-lg border border-border px-2 py-1.5 text-xs text-text-muted hover:bg-surface-hover"
      >
        {customOpen ? "Use single month" : "Custom range"}
      </button>
    </div>
  );
}
