import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Award, Calendar, Clock, Gauge, ShieldAlert } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import {
  resolveWeaverSelfId,
  saveWeaverProfile,
  useWeaverProfile,
  useWeaverProjects,
} from "../../lib/data";
import {
  computePerformance,
  computeWeaverCapacity,
  performanceBand,
} from "../../lib/projectSpec";
import { EmptyState, Field, ProgressBar, StagePill, formatDate } from "../../components/ui";

function PerfGauge({ score }: { score: number }) {
  const band = performanceBand(score);
  const color =
    band === "excellent" ? "#2e7d4f" : band === "good" ? "#cd8c23" : "#b3372c";
  const radius = 34;
  const c = 2 * Math.PI * radius;
  return (
    <div className="portal-seo-gauge" role="img" aria-label={`Performance score ${score}`}>
      <svg viewBox="0 0 84 84" width="84" height="84">
        <circle cx="42" cy="42" r={radius} fill="none" stroke="#efe9dd" strokeWidth="7" />
        <circle
          cx="42"
          cy="42"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          transform="rotate(-90 42 42)"
        />
        <text x="42" y="40" textAnchor="middle" fontSize="19" fontWeight="800" fill={color}>
          {score}
        </text>
        <text x="42" y="55" textAnchor="middle" fontSize="9" fill="#70695f">
          score
        </text>
      </svg>
      <span className="portal-seo-rating" style={{ color, textTransform: "capitalize" }}>
        {band}
      </span>
    </div>
  );
}

/**
 * Shared weaver profile view. Used by the weaver on themselves
 * (/portal/weaver/profile) and by an admin (/portal/admin/weavers/:id).
 */
export function WeaverProfilePage({ base = "self" }: { base?: "self" | "admin" }) {
  const { profile } = useAuth();
  const params = useParams();
  const targetId =
    base === "admin" ? params.weaverId : resolveWeaverSelfId(profile?.id);
  const { weaver, loading } = useWeaverProfile(targetId);
  const { projects } = useWeaverProjects(targetId);
  const perf = computePerformance(projects);
  const capacity = weaver ? computeWeaverCapacity(weaver, projects) : null;
  const completed = projects.filter((p) => p.actual_completion);
  const active = projects.filter((p) => !p.actual_completion);
  const projectBase = base === "admin" ? "/portal/admin/projects" : "/portal/weaver/projects";
  const [availabilityForm, setAvailabilityForm] = useState({
    loom_count: "1",
    occupied_looms: "0",
    avg_weaving_hours_per_day: "",
    avg_days_per_cloth: "",
    queue_length: "0",
    unavailable_until: "",
    availability_note: "",
  });
  const [availabilityBusy, setAvailabilityBusy] = useState(false);
  const [availabilityDone, setAvailabilityDone] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");

  useEffect(() => {
    if (!weaver) return;
    setAvailabilityForm({
      loom_count: (weaver.loom_count ?? 1).toString(),
      occupied_looms: (weaver.occupied_looms ?? 0).toString(),
      avg_weaving_hours_per_day: weaver.avg_weaving_hours_per_day?.toString() ?? "",
      avg_days_per_cloth: weaver.avg_days_per_cloth?.toString() ?? "",
      queue_length: (weaver.queue_length ?? 0).toString(),
      unavailable_until: weaver.unavailable_until ?? "",
      availability_note: weaver.availability_note ?? "",
    });
  }, [weaver]);

  const saveAvailability = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!weaver) return;
    setAvailabilityBusy(true);
    setAvailabilityDone("");
    setAvailabilityError("");
    try {
      await saveWeaverProfile({
        ...weaver,
        loom_count: Number(availabilityForm.loom_count || 0),
        occupied_looms: Number(availabilityForm.occupied_looms || 0),
        avg_weaving_hours_per_day: availabilityForm.avg_weaving_hours_per_day
          ? Number(availabilityForm.avg_weaving_hours_per_day)
          : null,
        avg_days_per_cloth: availabilityForm.avg_days_per_cloth
          ? Number(availabilityForm.avg_days_per_cloth)
          : null,
        queue_length: Number(availabilityForm.queue_length || 0),
        unavailable_until: availabilityForm.unavailable_until || null,
        availability_note: availabilityForm.availability_note || null,
      });
      setAvailabilityDone("Availability saved.");
    } catch (err) {
      setAvailabilityError(err instanceof Error ? err.message : "Could not save availability.");
    } finally {
      setAvailabilityBusy(false);
    }
  };

  if (loading) return <div className="portal-loading-inline">Loading…</div>;
  if (!weaver) {
    return (
      <EmptyState
        title="No profile yet"
        body={
          base === "self"
            ? "Your studio profile hasn't been set up yet. Ask an administrator to add your details."
            : "This weaver has no profile."
        }
      />
    );
  }

  return (
    <section>
      {base === "admin" && (
        <Link className="portal-btn-link" to="/portal/admin/weavers">
          ← All weavers
        </Link>
      )}

      <div className="portal-card portal-weaver-profile-hero">
        {weaver.portrait_url ? (
          <img src={weaver.portrait_url} alt={weaver.profile?.full_name ?? "Weaver"} />
        ) : (
          <div className="portal-weaver-portrait-empty portal-weaver-portrait-lg">
            {(weaver.profile?.full_name ?? "?").charAt(0)}
          </div>
        )}
        <div className="portal-weaver-profile-meta">
          <h1 className="portal-page-title">{weaver.profile?.full_name}</h1>
          <p className="portal-muted-text">
            {weaver.years_experience ?? 0} years weaving
            {weaver.hometown ? ` · ${weaver.hometown}` : ""}
          </p>
          <div className="portal-weaver-specialties">
            {weaver.specialties.map((s) => (
              <span key={s} className="portal-stage">{s}</span>
            ))}
          </div>
          {weaver.bio && <p className="portal-detail-note">{weaver.bio}</p>}
        </div>
        <PerfGauge score={perf.score} />
      </div>

      <div className="portal-stat-grid" style={{ marginBottom: 24 }}>
        {[
          ["Completed projects", perf.completed],
          ["Active projects", perf.active],
          ["On-time rate", `${perf.onTimeRate}%`],
          ["Projects this year", perf.thisYear],
          ["Available capacity", `${capacity?.availableCapacity ?? 0} hrs/day`],
          ["Active looms", `${capacity?.occupiedLooms ?? 0}/${capacity?.loomCount ?? 0}`],
          ["Queue length", capacity?.queueLength ?? 0],
          ["Avg days / cloth", capacity?.avgDaysPerCloth ?? "—"],
          ["Reliability score", capacity?.reliabilityScore ?? "—"],
          ["Quality score", capacity?.qualityScore ?? "—"],
        ].map(([label, value]) => (
          <article className="portal-card portal-stat" key={label}>
            <span className="portal-stat-value">{value}</span>
            <span className="portal-stat-label">{label}</span>
          </article>
        ))}
      </div>
      <p className="portal-muted-text" style={{ marginTop: -12, marginBottom: 20 }}>
        <Award size={13} /> Performance blends punctuality (finishing on or before
        the deadline) with the volume of work taken on this year.
      </p>

      {capacity && (
        <div className="portal-card portal-availability-card">
          <div className="portal-split-head">
            <div>
              <h2 className="portal-side-title">
                <Gauge size={16} /> Availability & production capacity
              </h2>
              <p className="portal-muted-text">
                Looms are tracked as resources; available working time is the scheduling capacity.
              </p>
            </div>
            <span className={`portal-capacity-pill ${capacity.canTakeNewProject ? "is-available" : "is-busy"}`}>
              {capacity.availabilityLabel}
            </span>
          </div>

          <dl className="portal-kv portal-kv-row">
            <div><dt>Number of looms</dt><dd>{capacity.loomCount}</dd></div>
            <div><dt>Occupied looms</dt><dd>{capacity.occupiedLooms}</dd></div>
            <div><dt>Open looms</dt><dd>{capacity.availableLooms}</dd></div>
            <div><dt>Average hours/day</dt><dd>{capacity.avgHoursPerDay || "—"}</dd></div>
            <div><dt>Current workload</dt><dd>{capacity.currentWorkload}</dd></div>
            <div><dt>Available from</dt><dd>{capacity.nextAvailableDate ? formatDate(capacity.nextAvailableDate) : "Now"}</dd></div>
          </dl>

          {weaver.availability_note && (
            <p className="portal-detail-note">
              <Clock size={13} /> {weaver.availability_note}
            </p>
          )}

          {active.length > 0 && (
            <div className="portal-capacity-projects">
              <strong>Estimated completion dates</strong>
              {active.map((p) => (
                <span key={p.id}>
                  {p.reference}: {formatDate(p.est_completion)}
                </span>
              ))}
            </div>
          )}

          {base === "self" && (
            <form className="portal-capacity-form" onSubmit={saveAvailability}>
              <h3>Update my availability</h3>
              <p className="portal-muted-text">
                Use this when you are unavailable, have personal customer work, or are ready for a new Hinkro project.
              </p>
              <div className="portal-form-row">
                <Field label="Number of looms">
                  <input
                    type="number"
                    min={0}
                    value={availabilityForm.loom_count}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, loom_count: e.target.value })}
                  />
                </Field>
                <Field label="Occupied looms">
                  <input
                    type="number"
                    min={0}
                    value={availabilityForm.occupied_looms}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, occupied_looms: e.target.value })}
                  />
                </Field>
              </div>
              <div className="portal-form-row">
                <Field label="Average weaving hours/day">
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={availabilityForm.avg_weaving_hours_per_day}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, avg_weaving_hours_per_day: e.target.value })}
                  />
                </Field>
                <Field label="Average days per cloth">
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={availabilityForm.avg_days_per_cloth}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, avg_days_per_cloth: e.target.value })}
                  />
                </Field>
              </div>
              <div className="portal-form-row">
                <Field label="Queue length" hint="Personal work or committed future projects.">
                  <input
                    type="number"
                    min={0}
                    value={availabilityForm.queue_length}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, queue_length: e.target.value })}
                  />
                </Field>
                <Field label="Unavailable until">
                  <input
                    type="date"
                    value={availabilityForm.unavailable_until}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, unavailable_until: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Availability note">
                <textarea
                  rows={2}
                  value={availabilityForm.availability_note}
                  onChange={(e) => setAvailabilityForm({ ...availabilityForm, availability_note: e.target.value })}
                  placeholder="Example: Loom 2 is reserved for a personal customer project."
                />
              </Field>
              {availabilityDone && <div className="portal-success">{availabilityDone}</div>}
              {availabilityError && <div className="portal-error">{availabilityError}</div>}
              <button className="portal-btn-primary portal-btn-sm" type="submit" disabled={availabilityBusy}>
                {availabilityBusy ? "Saving…" : "Save availability"}
              </button>
            </form>
          )}
        </div>
      )}

      {(base === "self" || base === "admin") && (
        <div className="portal-card portal-weaver-private">
          <h2 className="portal-side-title">
            <ShieldAlert size={15} /> Private details {base === "admin" ? "(admin view)" : ""}
          </h2>
          <dl className="portal-kv portal-kv-row">
            <div><dt>Phone</dt><dd>{weaver.profile?.phone ?? "—"}</dd></div>
            <div><dt>Email</dt><dd>{weaver.profile?.email ?? "—"}</dd></div>
            <div><dt>Address</dt><dd>{weaver.address ?? "—"}</dd></div>
            <div><dt>ID number</dt><dd>{weaver.id_number ?? "—"}</dd></div>
            <div><dt>Languages</dt><dd>{weaver.languages.join(", ") || "—"}</dd></div>
            <div><dt>Emergency contact</dt><dd>{weaver.emergency_contact ?? "—"}</dd></div>
          </dl>
        </div>
      )}

      <h2 className="portal-section-title">Active work ({active.length})</h2>
      {active.length === 0 ? (
        <p className="portal-muted-text">No active projects.</p>
      ) : (
        <div className="portal-card portal-table-card">
          <table className="portal-table">
            <thead>
              <tr><th>Reference</th><th>Project</th><th>Stage</th><th>Progress</th><th>Due</th></tr>
            </thead>
            <tbody>
              {active.map((p) => (
                <tr key={p.id}>
                  <td className="portal-td-ref">
                    <Link to={`${projectBase}/${p.id}`}>{p.reference}</Link>
                  </td>
                  <td>{p.title}</td>
                  <td><StagePill name={p.is_paused ? "Paused" : p.stage?.name} /></td>
                  <td className="portal-td-progress"><ProgressBar value={p.progress_pct} /></td>
                  <td>{formatDate(p.est_completion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="portal-section-title">Completed work ({completed.length})</h2>
      {completed.length === 0 ? (
        <p className="portal-muted-text">No completed projects yet.</p>
      ) : (
        <div className="portal-card portal-table-card">
          <table className="portal-table">
            <thead>
              <tr><th>Reference</th><th>Project</th><th>Completed</th><th>On time</th></tr>
            </thead>
            <tbody>
              {completed.map((p) => {
                const onTime =
                  p.est_completion && p.actual_completion
                    ? p.actual_completion <= p.est_completion
                    : null;
                return (
                  <tr key={p.id}>
                    <td className="portal-td-ref">
                      <Link to={`${projectBase}/${p.id}`}>{p.reference}</Link>
                    </td>
                    <td>{p.title}</td>
                    <td><Calendar size={13} /> {formatDate(p.actual_completion)}</td>
                    <td>
                      {onTime === null ? "—" : onTime ? (
                        <span className="portal-approval-done">On time</span>
                      ) : (
                        <span className="portal-worklog-challenge">Late</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
