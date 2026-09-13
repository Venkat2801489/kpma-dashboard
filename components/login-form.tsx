"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({
  scope,
  title,
  subtitle,
  redirectTo,
}: {
  scope: "main" | "worker";
  title: string;
  subtitle: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scope, username, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Invalid username or password.");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0a0a0a] font-bold text-xl text-[#02afef] dark:bg-white/5">
            K
          </div>
          <h1 className="text-lg font-semibold text-text">{title}</h1>
          <p className="text-sm text-text-muted">{subtitle}</p>
        </div>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-text-muted">Username</span>
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
            autoComplete="username"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-text-muted">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
            autoComplete="current-password"
          />
        </label>

        {error && <p className="mb-3 text-sm text-unpaid">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg transition-opacity disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
