import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Plus } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { useClients, useProjects, useTeam } from "../../lib/data";
import {
  EmptyState,
  PriorityBadge,
  ProgressBar,
  StagePill,
  formatDate,
} from "../../components/ui";

function PageHeader({ title, sub }: { title: string; sub: string }) {
  const { profile } = useAuth();
  return (
    <>
      <h1 className="portal-page-title">{title}</h1>
      <p className="portal-page-sub">
        Signed in as {profile?.full_name || profile?.email}. {sub}
      </p>
    </>
  );
}

/* ---------- Admin ---------- */

export function AdminDashboard() {
  const navigate = useNavigate();
  const { projects } = useProjects({ role: "admin" });
  const { clients } = useClients();
  const { team } = useTeam();

  const active = projects.filter((p) => !p.actual_completion && !p.is_paused);
  const completed = projects.filter((p) => p.actual_completion);
  const today = new Date().toISOString().slice(0, 10);
  const delayed = active.filter(
    (p) => p.est_completion && p.est_completion < today,
  );
  const weavers = team.filter((t) => t.role === "weaver");

  const stats: [string, number][] = [
    ["Active projects", active.length],
    ["Completed projects", completed.length],
    ["Delayed projects", delayed.length],
    ["Total clients", clients.length],
    ["Total weavers", weavers.length],
  ];

  return (
    <section>
      <div className="portal-page-head">
        <div>
          <PageHeader
            title="Studio overview"
            sub="Everything happening across the studio at a glance."
          />
        </div>
        <Link
          className="portal-btn-primary portal-btn-sm"
          to="/portal/admin/projects/new"
        >
          <Plus size={15} /> New project
        </Link>
      </div>

      <div className="portal-stat-grid">
        {stats.map(([label, value]) => (
          <article className="portal-card portal-stat" key={label}>
            <span className="portal-stat-value">{value}</span>
            <span className="portal-stat-label">{label}</span>
          </article>
        ))}
      </div>

      <h2 className="portal-section-title">Projects in production</h2>
      {active.length === 0 ? (
        <EmptyState
          title="No active projects"
          body="Create a project to get the studio weaving."
        />
      ) : (
        <div className="portal-card portal-table-card">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Client</th>
                <th>Weaver</th>
                <th>Stage</th>
                <th>Progress</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {active.map((p) => (
                <tr
                  key={p.id}
                  className="portal-row-link"
                  onClick={() => navigate(`/portal/admin/projects/${p.id}`)}
                >
                  <td className="portal-td-ref">{p.reference}</td>
                  <td>{p.client?.name ?? "—"}</td>
                  <td>{p.weaver?.full_name ?? "Unassigned"}</td>
                  <td>
                    <StagePill name={p.stage?.name} />
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

/* ---------- Content ---------- */

export function ContentDashboard() {
  return (
    <section>
      <PageHeader
        title="Content studio"
        sub="Manage the public website's products, accessories, blog, and media."
      />
      <EmptyState
        title="Coming in Phase 3"
        body="Product, accessory, blog, and media management move here — the public store then updates instantly when you edit."
      />
    </section>
  );
}

/* ---------- Weaver ---------- */

export function WeaverDashboard() {
  const { profile } = useAuth();
  const { projects, loading } = useProjects({ role: "weaver" });
  const open = projects.filter((p) => !p.actual_completion);

  return (
    <section>
      <PageHeader
        title="My weaving projects"
        sub="Your assigned projects, deadlines, and daily progress."
      />
      {!loading && open.length === 0 && (
        <EmptyState
          title="No assigned projects"
          body="When the studio assigns you a project, it appears here instantly."
        />
      )}
      <div className="portal-project-grid">
        {open.map((p) => (
          <Link
            className="portal-card portal-project-card"
            key={p.id}
            to={`/portal/weaver/projects/${p.id}`}
          >
            <div className="portal-project-top">
              <span className="portal-td-ref">{p.reference}</span>
              <PriorityBadge level={p.priority} />
            </div>
            <h3>{p.title}</h3>
            <dl className="portal-kv">
              <div>
                <dt>Client</dt>
                <dd>{p.client?.name ?? "—"}</dd>
              </div>
              <div>
                <dt>Pattern</dt>
                <dd>{p.pattern ?? "—"}</dd>
              </div>
              <div>
                <dt>Threads</dt>
                <dd>{p.thread_colors.join(", ") || "—"}</dd>
              </div>
              <div>
                <dt>Stage</dt>
                <dd>{p.is_paused ? "Paused" : p.stage?.name ?? "—"}</dd>
              </div>
            </dl>
            <ProgressBar value={p.progress_pct} />
            <div className="portal-project-footer">
              <span className="portal-due">
                <Calendar size={14} /> Due {formatDate(p.est_completion)}
              </span>
              <span className="portal-btn-primary portal-btn-sm">Open</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- Client ---------- */

export function ClientDashboard() {
  const { projects, loading } = useProjects({ role: "client" });

  return (
    <section>
      <PageHeader
        title="My Kente projects"
        sub="Follow every step of your bespoke order."
      />
      {!loading && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          body="When Hinkro Kente starts your order, it will appear here."
        />
      )}
      <div className="portal-project-grid">
        {projects.map((p) => (
          <Link
            className="portal-card portal-project-card"
            key={p.id}
            to={`/portal/client/projects/${p.id}`}
          >
            <div className="portal-project-top">
              <span className="portal-td-ref">{p.reference}</span>
              <StagePill name={p.is_paused ? "Paused" : p.stage?.name} />
            </div>
            <h3>{p.title}</h3>
            <ProgressBar value={p.progress_pct} />
            <dl className="portal-kv" style={{ marginTop: 14 }}>
              <div>
                <dt>Weaver</dt>
                <dd>{p.weaver?.full_name ?? "Being assigned"}</dd>
              </div>
              <div>
                <dt>Est. completion</dt>
                <dd>{formatDate(p.est_completion)}</dd>
              </div>
            </dl>
            <span className="portal-btn-primary portal-btn-sm">
              View progress
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
