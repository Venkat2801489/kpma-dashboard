"use client";

import { useEffect, useState } from "react";
import { Modal } from "./modal";
import { LogoImage } from "./logo-image";
import { resolveLogoUrl } from "@/lib/drive-logo";
import { formatINR } from "@/lib/currency";
import type { Client } from "@/lib/types";

export function EditClientModal({
  open,
  onClose,
  client,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  client: Client;
  onSaved: () => void;
}) {
  const [name, setName] = useState(client.name);
  const [logoLink, setLogoLink] = useState(client.logoDriveLink ?? "");
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the form when the modal (re)opens for a client
    setName(client.name);
    setLogoLink(client.logoDriveLink ?? "");
    setAmounts(Object.fromEntries(client.categories.map((cc) => [cc.id, cc.monthlyAmount])));
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the modal (re)opens for a client, not on every prop refresh from a background refetch
  }, [open, client.id]);

  async function removeService(ccId: string) {
    if (!window.confirm("Remove this service from the client? This can't be undone.")) return;
    setRemovingId(ccId);
    const res = await fetch(`/api/client-categories/${ccId}`, { method: "DELETE" });
    setRemovingId(null);
    if (!res.ok) {
      setError("Could not remove that service.");
      return;
    }
    onSaved();
  }

  async function save() {
    if (!name.trim()) {
      setError("Client name is required.");
      return;
    }
    if (Object.values(amounts).some((v) => v === "" || Number(v) < 0)) {
      setError("Enter a valid monthly amount for every service.");
      return;
    }

    setSaving(true);
    setError(null);

    const clientRes = await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), logoDriveLink: logoLink.trim() }),
    });

    const changedAmounts = client.categories.filter((cc) => amounts[cc.id] !== cc.monthlyAmount);
    const amountResults = await Promise.all(
      changedAmounts.map((cc) =>
        fetch(`/api/client-categories/${cc.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ monthlyAmount: Number(amounts[cc.id]) }),
        })
      )
    );

    setSaving(false);

    if (!clientRes.ok || amountResults.some((r) => !r.ok)) {
      setError("Some changes couldn't be saved — try again.");
      onSaved();
      return;
    }

    onSaved();
    onClose();
  }

  const preview = resolveLogoUrl(logoLink);

  return (
    <Modal open={open} onClose={onClose} title="Edit client">
      <label className="mb-3 block text-sm">
        <span className="mb-1 block text-text-muted">Client name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          placeholder="Acme Foods"
        />
      </label>

      <label className="mb-4 block text-sm">
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
        {client.categories.length === 0 ? (
          <p className="text-sm text-text-faint">No services yet — add one from the client card.</p>
        ) : (
          <div className="space-y-2">
            {client.categories.map((cc) => (
              <div key={cc.id} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-text">{cc.category.name}</span>
                <input
                  type="number"
                  min={0}
                  value={amounts[cc.id] ?? ""}
                  onChange={(e) => setAmounts((prev) => ({ ...prev, [cc.id]: e.target.value }))}
                  className="w-28 rounded-lg border border-border bg-bg px-2 py-1.5 text-sm text-text outline-none focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => removeService(cc.id)}
                  disabled={removingId === cc.id}
                  aria-label={`Remove ${cc.category.name}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-faint transition-colors hover:bg-unpaid-bg hover:text-unpaid disabled:opacity-60"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m2 0-1 13a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-text-faint">
          Currently billed {formatINR(client.categories.reduce((sum, cc) => sum + Number(cc.monthlyAmount), 0))}/month total.
        </p>
      </div>

      {error && <p className="mb-3 text-sm text-unpaid">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="bg-gradient-brand w-full rounded-lg px-4 py-2 font-medium text-white transition-opacity disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </Modal>
  );
}
