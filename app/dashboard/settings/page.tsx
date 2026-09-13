"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/top-bar";
import { CategoryIcon, ICON_OPTIONS } from "@/components/category-icon";
import type { Category } from "@/lib/types";

export default function SettingsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/categories");
    if (res.ok) setCategories(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch on mount
    load();
  }, []);

  async function addCategory() {
    if (!name.trim()) {
      setError("Enter a category name.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), icon }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not add category.");
      return;
    }
    setName("");
    load();
  }

  async function removeCategory(id: string) {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not remove category.");
      return;
    }
    load();
  }

  return (
    <div className="min-h-screen">
      <TopBar scope="main" subtitle="Manage categories" workerLink={false} />

      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link href="/dashboard" className="mb-4 inline-block text-sm text-text-muted hover:text-text">
          ← Back to dashboard
        </Link>

        <h1 className="mb-4 text-lg font-semibold text-text">Categories</h1>

        <div className="mb-6 space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
              <div className="flex items-center gap-2 text-text">
                <CategoryIcon icon={cat.icon} />
                {cat.name}
              </div>
              <button
                type="button"
                onClick={() => removeCategory(cat.id)}
                className="text-xs text-unpaid hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-medium text-text">Add a category</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Influencer Marketing"
            className="mb-3 w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          />
          <div className="mb-3 flex flex-wrap gap-2">
            {ICON_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setIcon(opt)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                  icon === opt ? "border-brand bg-brand text-brand-fg" : "border-border text-text-muted"
                }`}
              >
                <CategoryIcon icon={opt} />
              </button>
            ))}
          </div>
          {error && <p className="mb-3 text-sm text-unpaid">{error}</p>}
          <button
            type="button"
            onClick={addCategory}
            disabled={saving}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-fg disabled:opacity-60"
          >
            {saving ? "Adding…" : "Add category"}
          </button>
        </div>
      </main>
    </div>
  );
}
