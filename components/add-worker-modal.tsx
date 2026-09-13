"use client";

import { useState } from "react";
import { Modal } from "./modal";

export function AddWorkerModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setRole("");
    setSalary("");
    setError(null);
  }

  async function save() {
    if (!name.trim() || salary === "" || Number(salary) < 0) {
      setError("Enter a name and a monthly salary.");
      return;
    }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/workers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), role: role.trim(), monthlySalary: Number(salary) }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not add worker.");
      return;
    }
    reset();
    onSaved();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add worker"
    >
      <label className="mb-3 block text-sm">
        <span className="mb-1 block text-text-muted">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
        />
      </label>

      <label className="mb-3 block text-sm">
        <span className="mb-1 block text-text-muted">Role (optional)</span>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
          placeholder="Video Editor"
        />
      </label>

      <label className="mb-4 block text-sm">
        <span className="mb-1 block text-text-muted">Monthly salary (₹)</span>
        <input
          type="number"
          min={0}
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-text outline-none focus:border-brand"
        />
      </label>

      {error && <p className="mb-3 text-sm text-unpaid">{error}</p>}

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="w-full rounded-lg bg-brand px-4 py-2 font-medium text-brand-fg transition-opacity disabled:opacity-60"
      >
        {saving ? "Saving…" : "Add worker"}
      </button>
    </Modal>
  );
}
