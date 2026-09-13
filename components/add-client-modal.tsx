"use client";

import { useState } from "react";
import { Modal } from "./modal";
import { LogoImage } from "./logo-image";
import { resolveLogoUrl } from "@/lib/drive-logo";
import type { Category } from "@/lib/types";

export function AddClientModal({
  open,
  onClose,
  categories,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [logoLink, setLogoLink] = useState("");
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleCategory(id: string) {
    setAmounts((prev) => {
      const next = { ...prev };
      if (id in next) delete next[id];
      else next[id] = "";
      return next;
    });
  }

  function reset() {
    setName("");
    setLogoLink("");
    setAmounts({});
    setError(null);
  }

  async function save() {
    const selected = Object.entries(amounts);
    if (!name.trim()) {
      setError("Client name is required.");
      return;
    }
    if (selected.length === 0) {
      setError("Pick at least one category.");
      return;
    }
    if (selected.some(([, v]) => v === "" || Number(v) < 0)) {
      setError("Enter a monthly amount for every selected category.");
      return;
    }

    setSaving(true);
    setError(null);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        logoDriveLink: logoLink.trim() || undefined,
        categories: selected.map(([categoryId, amount]) => ({ categoryId, monthlyAmount: Number(amount) })),
      }),
    });
    setSaving(false);

    if (!res.ok) {
      setError("Could not save client — check the details and try again.");
      return;
    }
    reset();
    onSaved();
    onClose();
  }

  const preview = resolveLogoUrl(logoLink);

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add client"
    >
      <label className="mb-3 block text-sm">
        <span className="mb-1 block text-text-muted">Client name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          placeholder="Acme Foods"
        />
      </label>

      <label className="mb-2 block text-sm">
        <span className="mb-1 block text-text-muted">Logo — paste a Google Drive share link</span>
        <div className="flex items-center gap-3">
          <LogoImage name={name || "?"} src={preview} size={40} />
          <input
            value={logoLink}
            onChange={(e) => setLogoLink(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
            placeholder="https://drive.google.com/file/d/..."
          />
        </div>
        <p className="mt-1 text-xs text-text-faint">
          Make sure the file is shared as &ldquo;Anyone with the link&rdquo; so it can load here.
        </p>
      </label>

      <div className="mb-4">
        <span className="mb-2 block text-sm text-text-muted">Services &amp; monthly amount</span>
        <div className="space-y-2">
          {categories.map((cat) => {
            const checked = cat.id in amounts;
            return (
              <div key={cat.id} className="flex items-center gap-2">
                <label className="flex flex-1 items-center gap-2 text-sm">
                  <input type="checkbox" checked={checked} onChange={() => toggleCategory(cat.id)} className="accent-brand" />
                  {cat.name}
                </label>
                {checked && (
                  <input
                    type="number"
                    min={0}
                    placeholder="₹/month"
                    value={amounts[cat.id]}
                    onChange={(e) => setAmounts((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                    className="w-28 rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text outline-none focus:border-brand"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="mb-3 text-sm text-unpaid">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg transition-opacity disabled:opacity-60"
      >
        {saving ? "Saving…" : "Add client"}
      </button>
    </Modal>
  );
}
