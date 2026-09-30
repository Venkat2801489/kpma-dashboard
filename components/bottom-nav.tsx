"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export type BottomNavItem = { id: string; label: string; icon: ReactNode };

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
  items,
  selected,
  onSelect,
}: {
  items: BottomNavItem[];
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
          className={`relative flex min-w-[64px] flex-1 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors ${
            selected === null ? "text-brand-fg" : "text-text-muted hover:bg-surface-hover"
          }`}
        >
          {selected === null && (
            <motion.span
              layoutId="bottom-nav-active"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="bg-gradient-brand absolute inset-0 rounded-xl"
            />
          )}
          <span className="relative flex flex-col items-center gap-0.5">
            <HomeIcon />
            Home
          </span>
        </button>
        {items.map((item) => {
          const active = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(active ? null : item.id)}
              className={`relative flex min-w-[64px] flex-1 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-medium transition-colors ${
                active ? "text-brand-fg" : "text-text-muted hover:bg-surface-hover"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="bg-gradient-brand absolute inset-0 rounded-xl"
                />
              )}
              <span className="relative flex flex-col items-center gap-0.5">
                {item.icon}
                <span className="max-w-[76px] truncate">{item.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
