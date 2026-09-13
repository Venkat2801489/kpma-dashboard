"use client";

import { CategoryIcon } from "./category-icon";
import type { Category } from "@/lib/types";

export function CategoryChips({
  categories,
  selected,
  onSelect,
}: {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {categories.map((cat) => {
        const active = selected === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(active ? null : cat.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              active
                ? "border-brand bg-brand text-brand-fg"
                : "border-border text-text-muted hover:bg-surface-hover"
            }`}
          >
            <CategoryIcon icon={cat.icon} />
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
