"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import type { ReactNode } from "react";

export function TopBar({
  scope,
  subtitle,
  workerLink = true,
  children,
}: {
  scope: "main" | "worker";
  subtitle: string;
  workerLink?: boolean;
  children?: ReactNode;
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope }),
    });
    router.push(scope === "main" ? "/login" : "/workers/login");
    router.refresh();
  }

  return (
    <header className="bg-grid border-b border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={scope === "main" ? "/dashboard" : "/workers"} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a0a0a] font-bold text-[#02afef] dark:bg-white/5">
              K
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight text-text">KPMA</div>
              <div className="text-xs text-text-muted">{subtitle}</div>
            </div>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {children}
          {scope === "main" && workerLink && (
            <Link
              href="/workers"
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:bg-surface-hover"
            >
              Worker Dashboard →
            </Link>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-muted hover:bg-surface-hover"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
