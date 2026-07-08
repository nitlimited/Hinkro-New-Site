import React, { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { useProjects, useTeam } from "../../lib/data";
import type { ProjectRow } from "../../lib/rows";
import { Field, ProgressBar, formatDate } from "../../components/ui";

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function projectState(p: ProjectRow, today: string): string {
  if (p.actual_completion) return "Completed";
  if (p.is_paused) return "Paused";
  if (p.est_completion && p.est_completion < today) return "Delayed";
  return "In production";
}

export function ReportsPage() {
  const { projects } = useProjects({ role: "admin" });
  const { team } = useTeam();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const created = p.created_at.slice(0, 10);
        if (from && created < from) return false;
        if (to && created > to) return false;
        return true;
      }),
    [projects, from, to],
  );

  const weavers = team.filter((t) => t.role === "weaver");
  const weaverRows = weavers.map((w) => {
    const assigned = filtered.filter((p) => p.weaver_id === w.id);
    const active = assigned.filter((p) => !p.actual_completion && !p.is_paused);
    const completed = assigned.filter((p) => p.actual_completion);
    const delayed = active.filter((p) => p.est_completion && p.est_completion < today);
    const avgProgress = active.length
      ? Math.round(active.reduce((sum, p) => sum + p.progress_pct, 0) / active.length)
      : 0;
    return { w, assigned, active, completed, delayed, avgProgress };
  });

  const exportProjects = () =>
    downloadCsv(
      `hinkro-projects-${today}.csv`,
      ["Reference", "Title", "Client", "Weaver", "Stage", "State", "Priority", "Progress %", "Created", "Est. completion", "Completed"],
      filtered.map((p) => [
        p.reference,
        p.title,
        p.client?.name ?? "",
        p.weaver?.full_name ?? "Unassigned",
        p.stage?.name ?? "",
        projectState(p, today),
        p.priority,
        p.progress_pct,
        p.created_at.slice(0, 10),
        p.est_completion ?? "",
        p.actual_completion ?? "",
      ]),
    );

  const exportWeavers = () =>
    downloadCsv(
      `hinkro-weavers-${today}.csv`,
      ["Weaver", "Assigned", "Active", "Completed", "Delayed", "Avg progress %"],
      weaverRows.map(({ w, assigned, active, completed, delayed, avgProgress }) => [
        w.full_name,
        assigned.length,
        active.length,
        completed.length,
        delayed.length,
        avgProgress,
      ]),
    );

  return (
    <section>
      <div className="portal-page-head">
        <div>
          <h1 className="portal-page-title">Reports</h1>
          <p className="portal-page-sub">
            Production performance across projects and weavers. Filter by
            creation date and export to CSV for records or accounting.
          </p>
        </div>
      </div>

      <div className="portal-card portal-inline-form">
        <Field label="From">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="To">
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
        <button className="portal-btn-secondary" type="button" onClick={exportProjects}>
          <Download size={15} /> Projects CSV
        </button>
        <button className="portal-btn-secondary" type="button" onClick={exportWeavers}>
          <Download size={15} /> Weavers CSV
        </button>
      </div>

      <h2 className="portal-section-title">Weaver performance</h2>
      <div className="portal-card portal-table-card">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Weaver</th>
              <th>Assigned</th>
              <th>Active</th>
              <th>Completed</th>
              <th>Delayed</th>
              <th>Avg progress</th>
            </tr>
          </thead>
          <tbody>
            {weaverRows.map(({ w, assigned, active, completed, delayed, avgProgress }) => (
              <tr key={w.id}>
                <td className="portal-td-strong">{w.full_name}</td>
                <td>{assigned.length}</td>
                <td>{active.length}</td>
                <td>{completed.length}</td>
                <td style={{ color: delayed.length ? "#b3372c" : undefined }}>
                  {delayed.length}
                </td>
                <td className="portal-td-progress">
                  <ProgressBar value={avgProgress} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="portal-section-title">
        Projects ({filtered.length})
      </h2>
      <div className="portal-card portal-table-card">
        <table className="portal-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Client</th>
              <th>Weaver</th>
              <th>State</th>
              <th>Progress</th>
              <th>Created</th>
              <th>Due</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="portal-td-ref">{p.reference}</td>
                <td>{p.client?.name ?? "—"}</td>
                <td>{p.weaver?.full_name ?? "Unassigned"}</td>
                <td>
                  <span className="portal-stage">{projectState(p, today)}</span>
                </td>
                <td className="portal-td-progress">
                  <ProgressBar value={p.progress_pct} />
                </td>
                <td>{formatDate(p.created_at)}</td>
                <td>{formatDate(p.est_completion)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
