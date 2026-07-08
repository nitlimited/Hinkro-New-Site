import React, { useState } from "react";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import {
  saveStage,
  swapStagePositions,
  useAuditLogs,
  useStages,
} from "../../lib/data";
import { Field, formatDateTime } from "../../components/ui";

export function SettingsPage() {
  return (
    <section>
      <h1 className="portal-page-title">Settings</h1>
      <p className="portal-page-sub">
        Configure the production workflow and review account activity.
      </p>
      <StagesEditor />
      <AuditLog />
    </section>
  );
}

function StagesEditor() {
  const stages = useStages({ includeInactive: true });
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);

  const ordered = stages.slice().sort((a, b) => a.position - b.position);

  const addStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    await saveStage({ name: newName.trim() });
    setNewName("");
    setBusy(false);
  };

  const rename = async (id: string) => {
    if (!editName.trim()) return;
    setBusy(true);
    await saveStage({ id, name: editName.trim() });
    setEditingId(null);
    setBusy(false);
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = ordered[index + direction];
    if (!target) return;
    setBusy(true);
    await swapStagePositions(ordered[index], target);
    setBusy(false);
  };

  const toggle = async (id: string, isActive: boolean, name: string) => {
    setBusy(true);
    await saveStage({ id, name, is_active: !isActive });
    setBusy(false);
  };

  return (
    <>
      <h2 className="portal-section-title">Production workflow stages</h2>
      <p className="portal-muted-text" style={{ marginBottom: 12 }}>
        Projects move through these stages in order. Disable a stage to hide
        it from weavers without losing project history.
      </p>

      <div className="portal-card portal-table-card">
        <table className="portal-table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Order</th>
              <th>Stage</th>
              <th>Status</th>
              <th style={{ width: 200 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((stage, index) => (
              <tr key={stage.id} style={{ opacity: stage.is_active ? 1 : 0.55 }}>
                <td className="portal-td-strong">{index + 1}</td>
                <td>
                  {editingId === stage.id ? (
                    <input
                      className="portal-inline-input"
                      value={editName}
                      autoFocus
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void rename(stage.id);
                        }
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                  ) : (
                    <span className="portal-td-strong">{stage.name}</span>
                  )}
                </td>
                <td>{stage.is_active ? <span className="portal-stage">Active</span> : "Disabled"}</td>
                <td>
                  <div className="portal-row-actions">
                    <button
                      className="portal-icon-btn"
                      type="button"
                      aria-label="Move up"
                      title="Move up"
                      disabled={busy || index === 0}
                      onClick={() => void move(index, -1)}
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      className="portal-icon-btn"
                      type="button"
                      aria-label="Move down"
                      title="Move down"
                      disabled={busy || index === ordered.length - 1}
                      onClick={() => void move(index, 1)}
                    >
                      <ArrowDown size={15} />
                    </button>
                    {editingId === stage.id ? (
                      <button
                        className="portal-btn-secondary"
                        type="button"
                        disabled={busy}
                        onClick={() => void rename(stage.id)}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        className="portal-btn-secondary"
                        type="button"
                        onClick={() => {
                          setEditingId(stage.id);
                          setEditName(stage.name);
                        }}
                      >
                        Rename
                      </button>
                    )}
                    <button
                      className="portal-btn-secondary"
                      type="button"
                      disabled={busy}
                      onClick={() => void toggle(stage.id, stage.is_active, stage.name)}
                    >
                      {stage.is_active ? "Disable" : "Enable"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form className="portal-card portal-inline-form" onSubmit={addStage}>
        <Field label="New stage name">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Client Approval"
          />
        </Field>
        <button className="portal-btn-primary portal-btn-sm" type="submit" disabled={busy || !newName.trim()}>
          <Plus size={15} /> Add stage
        </button>
      </form>
    </>
  );
}

function AuditLog() {
  const { logs, loading } = useAuditLogs();

  return (
    <>
      <h2 className="portal-section-title">Audit log</h2>
      <p className="portal-muted-text" style={{ marginBottom: 12 }}>
        Every change to projects, products, and user accounts is recorded
        automatically.
      </p>
      <div className="portal-card portal-table-card">
        <table className="portal-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>Action</th>
              <th>Record</th>
            </tr>
          </thead>
          <tbody>
            {!loading && logs.length === 0 && (
              <tr><td colSpan={4} className="portal-muted-text">No activity recorded yet.</td></tr>
            )}
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{formatDateTime(log.created_at)}</td>
                <td className="portal-td-strong">{log.actor?.full_name ?? "System"}</td>
                <td><span className="portal-stage">{log.action}</span></td>
                <td>
                  {log.entity_type}
                  {log.entity_id ? ` · ${log.entity_id.slice(0, 8)}` : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
