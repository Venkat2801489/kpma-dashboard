"use client";

import { CategoryIcon } from "./category-icon";
import type { Category } from "@/lib/types";

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 11.5L12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 001 1h3v-6h4v6h3a1 1 0 001-1v-9" />
    </svg>
  );
}

export function BottomNav({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <nav
      className="no-scrollbar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 pt-1.5">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`flex min-w-[64px] flex-1 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors ${
            selected === null ? "bg-brand/10 text-brand" : "text-text-muted hover:bg-surface-hover"
          }`}
        >
          <HomeIcon />
          Home
        </button>
        {categories.map((cat) => {
          const active = selected === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(active ? null : cat.id)}
              className={`flex min-w-[64px] flex-1 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors ${
                active ? "bg-brand/10 text-brand" : "text-text-muted hover:bg-surface-hover"
              }`}
            >
              <CategoryIcon icon={cat.icon} />
              <span className="max-w-[76px] truncate">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
