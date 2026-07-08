import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { useProjects } from "../../lib/data";
import {
  EmptyState,
  PriorityBadge,
  ProgressBar,
  StagePill,
  formatDate,
} from "../../components/ui";

/** Admin project list (weavers and clients get card views instead). */
export function ProjectsListPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { projects, loading } = useProjects({ role: profile?.role ?? "admin" });
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "paused">(
    "all",
  );

  const filtered = projects.filter((p) => {
    if (filter === "active") return !p.actual_completion && !p.is_paused;
    if (filter === "completed") return Boolean(p.actual_completion);
    if (filter === "paused") return p.is_paused;
    return true;
  });

  return (
    <section>
      <div className="portal-page-head">
        <div>
          <h1 className="portal-page-title">Projects</h1>
          <p className="portal-page-sub">
            Every bespoke order, from loom to delivery.
          </p>
        </div>
        <Link className="portal-btn-primary portal-btn-sm" to="/portal/admin/projects/new">
          <Plus size={15} /> New project
        </Link>
      </div>

      <div className="portal-filters" role="tablist">
        {(["all", "active", "paused", "completed"] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={filter === f ? "is-active" : ""}
            onClick={() => setFilter(f)}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <EmptyState
          title="No projects here"
          body="Create a project to kick off the loop: assign a weaver, invite the client, and updates flow automatically."
        />
      )}

      {filtered.length > 0 && (
        <div className="portal-card portal-table-card">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Project</th>
                <th>Client</th>
                <th>Weaver</th>
                <th>Stage</th>
                <th>Priority</th>
                <th>Progress</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="portal-row-link"
                  onClick={() => navigate(`/portal/admin/projects/${p.id}`)}
                >
                  <td className="portal-td-ref">{p.reference}</td>
                  <td className="portal-td-strong">{p.title}</td>
                  <td>{p.client?.name ?? "—"}</td>
                  <td>{p.weaver?.full_name ?? "Unassigned"}</td>
                  <td>
                    <StagePill name={p.is_paused ? "Paused" : p.stage?.name} />
                  </td>
                  <td>
                    <PriorityBadge level={p.priority} />
                  </td>
                  <td className="portal-td-progress">
                    <ProgressBar value={p.progress_pct} />
                  </td>
                  <td>{formatDate(p.est_completion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
