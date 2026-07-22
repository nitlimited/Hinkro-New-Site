import React, { useState } from "react";
import { Check, Lock, ShieldCheck, Sparkles } from "lucide-react";
import type { MediaRow, ProjectRow, StageRow } from "../../lib/rows";
import type { UserRole } from "../../types";
import {
  GARMENT_LABEL,
  GENDER_LABEL,
  OMBRE_SCOPE_LABEL,
  THREAD_LABEL,
  getApprovals,
  getSpec,
  stageCategory,
  stagesForProject,
  totalYards,
  yardsToPieces,
} from "../../lib/projectSpec";
import { grantApproval, useWeaverPublicProfile } from "../../lib/data";
import { formatDate } from "../../components/ui";

/* ---------- weaving specification card (all roles) ---------- */

export function SpecCard({ project }: { project: ProjectRow }) {
  const spec = getSpec(project);
  const hasAny =
    spec.design_yards != null ||
    spec.plain_yards != null ||
    spec.gender ||
    spec.thread_type ||
    spec.has_border ||
    spec.has_shimmers ||
    spec.is_ombre ||
    spec.has_embroidery;
  if (!hasAny) return null;

  const features = [
    ["Border design", spec.has_border],
    ["Shimmers", spec.has_shimmers],
    ["Ombre / transition", spec.is_ombre],
    ["Embroidered symbols", spec.has_embroidery],
  ] as const;

  return (
    <div className="portal-card portal-spec-card">
      <h2 className="portal-side-title">Weaving specification</h2>
      <dl className="portal-kv portal-kv-row">
        <div>
          <dt>Made for</dt>
          <dd>
            {spec.gender ? GENDER_LABEL[spec.gender] : "—"}
            {spec.gender === "woman" && spec.garment_type
              ? ` · ${GARMENT_LABEL[spec.garment_type]}`
              : ""}
          </dd>
        </div>
        <div>
          <dt>Yards</dt>
          <dd>
            {spec.design_yards ?? 0} design + {spec.plain_yards ?? 0} plain
            {" = "}
            <strong>{totalYards(spec)} yd</strong> ({yardsToPieces(spec)} pieces)
          </dd>
        </div>
        <div>
          <dt>Thread type</dt>
          <dd>{spec.thread_type ? THREAD_LABEL[spec.thread_type] : "—"}</dd>
        </div>
        {spec.has_shimmers && spec.shimmer_colors.length > 0 && (
          <div>
            <dt>Shimmer colours</dt>
            <dd>{spec.shimmer_colors.join(", ")}</dd>
          </div>
        )}
      </dl>

      <div className="portal-spec-features">
        {features.map(([label, on]) => (
          <span
            key={label}
            className={`portal-spec-chip ${on ? "is-on" : "is-off"}`}
          >
            {on ? <Check size={13} /> : null} {label}
          </span>
        ))}
      </div>

      {spec.is_ombre && spec.ombre_colors.length > 0 && (
        <div className="portal-ombre-view">
          <span className="portal-ombre-view-label">
            Colour transition
            {spec.ombre_scope
              ? ` · ${OMBRE_SCOPE_LABEL[spec.ombre_scope] ?? spec.ombre_scope}`
              : ""}
          </span>
          <div className="portal-ombre-bar">
            {spec.ombre_colors.map((c, i) => (
              <span
                key={i}
                style={{
                  width: `${c.percentage}%`,
                  background: /^#/.test(c.color) ? c.color : undefined,
                }}
                className={/^#/.test(c.color) ? "" : `portal-ombre-seg-${i % 5}`}
                title={`${c.color} ${c.percentage}%`}
              />
            ))}
          </div>
          <div className="portal-ombre-legend">
            {spec.ombre_colors.map((c, i) => (
              <span key={i}>
                <i
                  style={{ background: /^#/.test(c.color) ? c.color : undefined }}
                  className={/^#/.test(c.color) ? "" : `portal-ombre-seg-${i % 5}`}
                />
                {c.color} {c.percentage}%
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- attachment gallery (inspiration / embroidery symbols) ---------- */

export function AttachmentGallery({
  title,
  hint,
  items,
}: {
  title: string;
  hint?: string;
  items: MediaRow[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="portal-card portal-attach-card">
      <h2 className="portal-side-title">{title}</h2>
      {hint && <p className="portal-muted-text">{hint}</p>}
      <div className="portal-gallery">
        {items
          .filter((m) => m.url)
          .map((m) => (
            <a key={m.id} href={m.url} target="_blank" rel="noreferrer" title={m.caption ?? ""}>
              <img src={m.url} alt={m.caption ?? title} loading="lazy" />
            </a>
          ))}
      </div>
    </div>
  );
}

/* ---------- client approval gates ---------- */

const APPROVAL_META = {
  thread: {
    label: "Thread colours",
    detail: "Confirm the thread colours and thread type before acquisition.",
  },
  pattern: {
    label: "Pattern & design",
    detail: "Confirm the pattern, colours, shimmers and border design.",
  },
} as const;

export function ApprovalPanel({
  project,
  role,
  currentUser,
  onChanged,
}: {
  project: ProjectRow;
  role: UserRole;
  currentUser: { id: string; full_name: string; role: UserRole };
  onChanged: () => void;
}) {
  const approvals = getApprovals(project);
  const isClient = role === "client";
  const isAdmin = role === "super_admin" || role === "admin";
  const [busy, setBusy] = useState("");
  const [approvedNow, setApprovedNow] = useState<Array<"thread" | "pattern">>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const approvalStatus = (kind: "thread" | "pattern") =>
    approvedNow.includes(kind) ? "approved" : approvals[kind];
  const bothApproved =
    approvalStatus("thread") === "approved" &&
    approvalStatus("pattern") === "approved";

  const approve = async (kind: "thread" | "pattern") => {
    setBusy(kind);
    setError("");
    setNotice("");
    try {
      await grantApproval(project.id, kind, currentUser);
      setApprovedNow((current) =>
        current.includes(kind) ? current : [...current, kind],
      );
      setNotice(
        kind === "thread"
          ? "Thread colours approved."
          : "Pattern and design approved.",
      );
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval could not be saved.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="portal-card portal-approval-card">
      <h2 className="portal-side-title">
        <ShieldCheck size={16} /> Client approvals
      </h2>
      {isClient && !bothApproved && (
        <p className="portal-muted-text">
          Weaving begins once you approve both items below. Approving promptly
          keeps your project on schedule.
        </p>
      )}
      {isAdmin && !bothApproved && (
        <p className="portal-muted-text">
          Only the assigned client can approve this project brief.
        </p>
      )}
      {notice && <div className="portal-notice">{notice}</div>}
      {error && <div className="portal-error">{error}</div>}
      {(["thread", "pattern"] as const).map((kind) => {
        const status = approvalStatus(kind);
        const at = approvedNow.includes(kind)
          ? new Date().toISOString()
          : approvals[`${kind}_at`];
        const canApprove = isClient && status === "pending";
        return (
          <div className="portal-approval-row" key={kind}>
            <div>
              <strong>{APPROVAL_META[kind].label}</strong>
              <span className="portal-muted-text">{APPROVAL_META[kind].detail}</span>
            </div>
            {status === "approved" ? (
              <span className="portal-approval-done">
                <Check size={14} /> Approved{at ? ` · ${formatDate(at)}` : ""}
              </span>
            ) : canApprove ? (
              <button
                className="portal-btn-primary portal-btn-sm"
                type="button"
                disabled={busy === kind}
                onClick={() => void approve(kind)}
              >
                {busy === kind
                  ? "Approving…"
                  : "Approve"}
              </button>
            ) : (
              <span className="portal-approval-pending">Awaiting client</span>
            )}
          </div>
        );
      })}
      {bothApproved && (
        <p className="portal-approval-ok">
          <Check size={14} /> All approvals in — weaving can proceed.
        </p>
      )}
    </div>
  );
}

/** Banner shown to the weaver when an approval is blocking progress. */
export function WeaverGateBanner({ project }: { project: ProjectRow }) {
  const approvals = getApprovals(project);
  if (approvals.thread !== "approved") {
    return (
      <div className="portal-gate-banner">
        <Lock size={16} />
        <span>
          Waiting for the client to approve <strong>thread colours</strong>.
          You can prepare, but don&rsquo;t proceed past thread acquisition until
          it&rsquo;s confirmed.
        </span>
      </div>
    );
  }
  if (approvals.pattern !== "approved") {
    return (
      <div className="portal-gate-banner">
        <Lock size={16} />
        <span>
          Thread colours approved. Waiting for the client to approve the{" "}
          <strong>pattern &amp; design</strong> before weaving in progress.
        </span>
      </div>
    );
  }
  return (
    <div className="portal-gate-banner is-clear">
      <Sparkles size={16} />
      <span>All client approvals in — weave away. Just keep the client updated.</span>
    </div>
  );
}

/* ---------- client-facing weaver card (name, experience, portrait only) ---------- */

export function ClientWeaverCard({ weaverId }: { weaverId: string | null }) {
  const { weaver } = useWeaverPublicProfile(weaverId);
  if (!weaver) return null;
  return (
    <div className="portal-card portal-client-weaver">
      <h2 className="portal-side-title">Your weaver</h2>
      <div className="portal-weaver-head">
        {weaver.portrait_url ? (
          <img src={weaver.portrait_url} alt={weaver.full_name} />
        ) : (
          <div className="portal-weaver-portrait-empty">
            {weaver.full_name.charAt(0)}
          </div>
        )}
        <div>
          <h3>{weaver.full_name}</h3>
          <span className="portal-muted-text">
            {weaver.years_experience ?? 0} years weaving
          </span>
        </div>
      </div>
      {weaver.specialties.length > 0 && (
        <div className="portal-weaver-specialties">
          {weaver.specialties.map((s) => (
            <span key={s} className="portal-stage">{s}</span>
          ))}
        </div>
      )}
      {weaver.bio && <p className="portal-detail-note">{weaver.bio}</p>}
    </div>
  );
}

/* ---------- stage tracker with promised production window ---------- */

export function StageTracker({
  stages,
  project,
}: {
  stages: StageRow[];
  project: ProjectRow;
}) {
  const spec = getSpec(project);
  const ordered = stagesForProject(
    stages.slice().sort((a, b) => a.position - b.position),
    spec.has_embroidery,
  );
  if (ordered.length === 0) return null;
  const currentIndex = ordered.findIndex((s) => s.id === project.current_stage_id);

  return (
    <div className="portal-card portal-stage-tracker">
      <h2 className="portal-side-title">Production stages</h2>
      <p className="portal-muted-text">
        Promised timeline covers the production window (loom preparation →
        quality inspection). Consultation and delivery sit outside it.
      </p>
      <ol className="portal-stage-list">
        {ordered.map((s, i) => {
          const cat = stageCategory(s.name);
          const state =
            i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
          return (
            <li key={s.id} className={`portal-stage-item is-${state} cat-${cat}`}>
              <span className="portal-stage-dot" />
              <span className="portal-stage-name">{s.name}</span>
              <span className={`portal-stage-cat cat-${cat}`}>
                {cat === "production" ? "promised window" : cat}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
