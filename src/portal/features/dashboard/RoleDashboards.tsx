import React from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  MessageSquare,
  Package,
} from "lucide-react";
import { useAuth } from "../../auth/useAuth";

/**
 * Phase 0/preview dashboards. In demo mode (and until Phase 1 wires live
 * queries) these render representative sample data so the team can review
 * the look and flow of each role's experience.
 */

/* ---------- shared bits ---------- */

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

function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="portal-progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="portal-progress-fill" style={{ width: `${value}%` }} />
      <span className="portal-progress-label">{value}%</span>
    </div>
  );
}

function PriorityBadge({ level }: { level: "high" | "normal" | "urgent" }) {
  return <span className={`portal-badge portal-badge-${level}`}>{level}</span>;
}

/* ---------- Admin ---------- */

const ADMIN_STATS = [
  ["Active projects", "4"],
  ["Completed projects", "23"],
  ["Delayed projects", "1"],
  ["Total clients", "31"],
  ["Total weavers", "6"],
  ["Total products", "67"],
] as const;

const ADMIN_PROJECTS = [
  {
    ref: "HK-2026-0041",
    client: "Deborah Adjei",
    weaver: "Kwabena Owusu",
    stage: "Weaving in Progress",
    progress: 65,
    due: "24 Jul 2026",
  },
  {
    ref: "HK-2026-0042",
    client: "Jeffery Boateng",
    weaver: "Yaw Asare",
    stage: "Thread Setup",
    progress: 20,
    due: "02 Aug 2026",
  },
  {
    ref: "HK-2026-0043",
    client: "Nana Akoto",
    weaver: "Kwabena Owusu",
    stage: "Quality Inspection",
    progress: 90,
    due: "12 Jul 2026",
  },
] as const;

export function AdminDashboard() {
  return (
    <section>
      <PageHeader
        title="Studio overview"
        sub="Everything happening across the studio at a glance."
      />

      <div className="portal-stat-grid">
        {ADMIN_STATS.map(([label, value]) => (
          <article className="portal-card portal-stat" key={label}>
            <span className="portal-stat-value">{value}</span>
            <span className="portal-stat-label">{label}</span>
          </article>
        ))}
      </div>

      <h2 className="portal-section-title">Projects in production</h2>
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
            {ADMIN_PROJECTS.map((p) => (
              <tr key={p.ref}>
                <td className="portal-td-ref">{p.ref}</td>
                <td>{p.client}</td>
                <td>{p.weaver}</td>
                <td>
                  <span className="portal-stage">{p.stage}</span>
                </td>
                <td className="portal-td-progress">
                  <ProgressBar value={p.progress} />
                </td>
                <td>{p.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ---------- Content ---------- */

const CONTENT_STATS = [
  ["Published products", "63"],
  ["Draft products", "4"],
  ["Accessories", "12"],
  ["Blog posts", "0"],
] as const;

export function ContentDashboard() {
  return (
    <section>
      <PageHeader
        title="Content studio"
        sub="Manage the public website's products, accessories, blog, and media."
      />
      <div className="portal-stat-grid">
        {CONTENT_STATS.map(([label, value]) => (
          <article className="portal-card portal-stat" key={label}>
            <span className="portal-stat-value">{value}</span>
            <span className="portal-stat-label">{label}</span>
          </article>
        ))}
      </div>
      <h2 className="portal-section-title">Coming in Phase 3</h2>
      <p className="portal-page-sub">
        Product, accessory, blog, and media management move here from the
        static files — the public store then updates instantly when you edit.
      </p>
    </section>
  );
}

/* ---------- Weaver ---------- */

const WEAVER_PROJECTS = [
  {
    ref: "HK-2026-0041",
    title: "Wedding Kente — gold & royal blue",
    client: "Deborah Adjei",
    pattern: "Adweneasa",
    threads: ["Gold", "Royal Blue", "Ivory"],
    stage: "Weaving in Progress",
    progress: 65,
    due: "24 Jul 2026",
    priority: "high" as const,
  },
  {
    ref: "HK-2026-0043",
    title: "Graduation stole batch — KTU",
    client: "Nana Akoto",
    pattern: "Custom lettering",
    threads: ["Black", "Gold", "Green"],
    stage: "Quality Inspection",
    progress: 90,
    due: "12 Jul 2026",
    priority: "urgent" as const,
  },
] as const;

export function WeaverDashboard() {
  return (
    <section>
      <PageHeader
        title="My weaving projects"
        sub="Your assigned projects, deadlines, and daily progress."
      />
      <div className="portal-project-grid">
        {WEAVER_PROJECTS.map((p) => (
          <article className="portal-card portal-project-card" key={p.ref}>
            <div className="portal-project-top">
              <span className="portal-td-ref">{p.ref}</span>
              <PriorityBadge level={p.priority} />
            </div>
            <h3>{p.title}</h3>
            <dl className="portal-kv">
              <div>
                <dt>Client</dt>
                <dd>{p.client}</dd>
              </div>
              <div>
                <dt>Pattern</dt>
                <dd>{p.pattern}</dd>
              </div>
              <div>
                <dt>Threads</dt>
                <dd>{p.threads.join(", ")}</dd>
              </div>
              <div>
                <dt>Stage</dt>
                <dd>{p.stage}</dd>
              </div>
            </dl>
            <ProgressBar value={p.progress} />
            <div className="portal-project-footer">
              <span className="portal-due">
                <Calendar size={14} /> Due {p.due}
              </span>
              <button className="portal-btn-primary portal-btn-sm" type="button">
                Post update
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Client ---------- */

const CLIENT_TIMELINE = [
  {
    icon: <ImageIcon size={16} />,
    title: "New photos from the loom",
    body: "Kwabena uploaded 3 photos of your gold and royal blue panels.",
    when: "Today, 09:40",
  },
  {
    icon: <CheckCircle2 size={16} />,
    title: "Milestone: halfway there",
    body: "Weaving passed 50% — the Adweneasa pattern is emerging beautifully.",
    when: "Mon 6 Jul",
  },
  {
    icon: <Clock size={16} />,
    title: "Weaving started",
    body: "Your threads are on the loom. Estimated completion 24 July.",
    when: "Wed 1 Jul",
  },
  {
    icon: <Package size={16} />,
    title: "Project created",
    body: "Welcome! Your bespoke wedding Kente order has been confirmed.",
    when: "Fri 26 Jun",
  },
] as const;

export function ClientDashboard() {
  return (
    <section>
      <PageHeader
        title="My Kente project"
        sub="Follow every step of your bespoke order."
      />

      <div className="portal-card portal-client-hero">
        <div className="portal-client-hero-head">
          <div>
            <h3>Wedding Kente — gold &amp; royal blue</h3>
            <span className="portal-td-ref">HK-2026-0041</span>
          </div>
          <span className="portal-stage">Weaving in Progress</span>
        </div>
        <ProgressBar value={65} />
        <dl className="portal-kv portal-kv-row">
          <div>
            <dt>Weaver</dt>
            <dd>Kwabena Owusu</dd>
          </div>
          <div>
            <dt>Pattern</dt>
            <dd>Adweneasa</dd>
          </div>
          <div>
            <dt>Threads</dt>
            <dd>Gold, Royal Blue, Ivory</dd>
          </div>
          <div>
            <dt>Est. completion</dt>
            <dd>24 Jul 2026</dd>
          </div>
        </dl>
      </div>

      <h2 className="portal-section-title">Progress updates</h2>
      <ol className="portal-timeline">
        {CLIENT_TIMELINE.map((item) => (
          <li key={item.title}>
            <span className="portal-timeline-dot">{item.icon}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
              <time>{item.when}</time>
            </div>
          </li>
        ))}
      </ol>

      <button className="portal-btn-primary portal-btn-sm" type="button">
        <MessageSquare size={15} /> Ask a question
      </button>
    </section>
  );
}
