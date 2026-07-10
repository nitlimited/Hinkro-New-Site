import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Award, Plus, ShieldAlert, UserPlus } from "lucide-react";
import {
  addWeaver,
  saveWeaverProfile,
  useWeaverProfiles,
  useWeaverProjects,
} from "../../lib/data";
import { isSupabaseConfigured } from "../../lib/supabaseClient";
import {
  computePerformance,
  computeWeaverCapacity,
  performanceBand,
} from "../../lib/projectSpec";
import { EmptyState, Field, Modal, formatDate } from "../../components/ui";
import type { WeaverProfileRow } from "../../lib/rows";

/* ---------- admin: weaver directory ---------- */

export function WeaversPage() {
  const { weavers, loading } = useWeaverProfiles();
  const [editing, setEditing] = useState<WeaverProfileRow | "new" | null>(null);

  return (
    <section>
      <div className="portal-page-head">
        <div>
          <h1 className="portal-page-title">Weavers</h1>
          <p className="portal-page-sub">
            Onboard weavers and manage their profiles. Address, phone and ID are
            visible to administrators only — clients see name, experience,
            specialties and portrait.
          </p>
        </div>
        <button
          className="portal-btn-primary portal-btn-sm"
          type="button"
          onClick={() => setEditing("new")}
        >
          <UserPlus size={15} /> Add weaver
        </button>
      </div>

      {!isSupabaseConfigured && (
        <div className="portal-alert" style={{ marginBottom: 16 }}>
          Preview mode: added weavers live in memory. With the backend connected,
          adding a weaver sends an email invite via the admin-create-user
          function and stores the profile.
        </div>
      )}

      {!loading && weavers.length === 0 && (
        <EmptyState title="No weavers yet" body="Add your first weaver to assign projects." />
      )}

      <div className="portal-weaver-grid">
        {weavers.map((w) => (
          <WeaverAdminCard key={w.profile_id} weaver={w} onEdit={() => setEditing(w)} />
        ))}
      </div>

      {editing && (
        <WeaverEditor
          weaver={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  );
}

function WeaverAdminCard({
  weaver,
  onEdit,
}: {
  weaver: WeaverProfileRow;
  onEdit: () => void;
}) {
  const { projects } = useWeaverProjects(weaver.profile_id);
  const perf = computePerformance(projects);
  const capacity = computeWeaverCapacity(weaver, projects);
  const band = performanceBand(perf.score);

  return (
    <article className="portal-card portal-weaver-card">
      <div className="portal-weaver-head">
        {weaver.portrait_url ? (
          <img src={weaver.portrait_url} alt={weaver.profile?.full_name ?? "Weaver"} />
        ) : (
          <div className="portal-weaver-portrait-empty">
            {(weaver.profile?.full_name ?? "?").charAt(0)}
          </div>
        )}
        <div>
          <h3>{weaver.profile?.full_name ?? "Weaver"}</h3>
          <span className="portal-muted-text">
            {weaver.years_experience ?? 0} yrs experience
          </span>
        </div>
        <span className={`portal-perf-badge is-${band}`}>
          <Award size={13} /> {perf.score}
        </span>
      </div>

      <div className="portal-weaver-specialties">
        {weaver.specialties.map((s) => (
          <span key={s} className="portal-stage">{s}</span>
        ))}
      </div>

      <dl className="portal-kv portal-kv-row">
        <div>
          <dt>Completed</dt>
          <dd>{perf.completed}</dd>
        </div>
        <div>
          <dt>Active</dt>
          <dd>{perf.active}</dd>
        </div>
        <div>
          <dt>On-time</dt>
          <dd>{perf.onTimeRate}%</dd>
        </div>
      </dl>

      <div className={`portal-capacity-strip ${capacity.canTakeNewProject ? "is-available" : "is-busy"}`}>
        <strong>{capacity.availabilityLabel}</strong>
        <span>{capacity.availableLooms}/{capacity.loomCount} looms open</span>
        <span>{capacity.availableCapacity} hrs/day capacity</span>
      </div>

      <dl className="portal-kv portal-kv-row">
        <div>
          <dt>Workload</dt>
          <dd>{capacity.currentWorkload}</dd>
        </div>
        <div>
          <dt>Queue</dt>
          <dd>{capacity.queueLength}</dd>
        </div>
        <div>
          <dt>Avg cloth</dt>
          <dd>{capacity.avgDaysPerCloth ? `${capacity.avgDaysPerCloth} days` : "—"}</dd>
        </div>
      </dl>

      <div className="portal-weaver-admin-only">
        <ShieldAlert size={13} /> Admin only
        <span>{weaver.profile?.phone ?? "—"}</span>
        <span>{weaver.address ?? "—"}</span>
        <span>ID: {weaver.id_number ?? "—"}</span>
      </div>

      <div className="portal-card-actions">
        <button className="portal-btn-secondary" type="button" onClick={onEdit}>
          Edit profile
        </button>
        <Link className="portal-btn-secondary" to={`/portal/admin/weavers/${weaver.profile_id}`}>
          View work
        </Link>
      </div>
    </article>
  );
}

function WeaverEditor({
  weaver,
  onClose,
}: {
  weaver?: WeaverProfileRow;
  onClose: () => void;
}) {
  const isNew = !weaver;
  const [form, setForm] = useState({
    full_name: weaver?.profile?.full_name ?? "",
    email: weaver?.profile?.email ?? "",
    phone: weaver?.profile?.phone ?? "",
    years_experience: weaver?.years_experience?.toString() ?? "",
    specialties: (weaver?.specialties ?? []).join(", "),
    bio: weaver?.bio ?? "",
    portrait_url: weaver?.portrait_url ?? "",
    hometown: weaver?.hometown ?? "",
    languages: (weaver?.languages ?? []).join(", "),
    address: weaver?.address ?? "",
    id_number: weaver?.id_number ?? "",
    emergency_contact: weaver?.emergency_contact ?? "",
    loom_count: (weaver?.loom_count ?? 1).toString(),
    occupied_looms: (weaver?.occupied_looms ?? 0).toString(),
    avg_weaving_hours_per_day: weaver?.avg_weaving_hours_per_day?.toString() ?? "",
    avg_days_per_cloth: weaver?.avg_days_per_cloth?.toString() ?? "",
    queue_length: (weaver?.queue_length ?? 0).toString(),
    unavailable_until: weaver?.unavailable_until ?? "",
    availability_note: weaver?.availability_note ?? "",
    reliability_score: (weaver?.reliability_score ?? 70).toString(),
    quality_score: (weaver?.quality_score ?? 70).toString(),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const common = {
      years_experience: form.years_experience ? Number(form.years_experience) : null,
      specialties: form.specialties.split(",").map((s) => s.trim()).filter(Boolean),
      bio: form.bio,
      portrait_url: form.portrait_url,
      hometown: form.hometown,
      languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      address: form.address,
      id_number: form.id_number,
      emergency_contact: form.emergency_contact,
      loom_count: Number(form.loom_count || 0),
      occupied_looms: Number(form.occupied_looms || 0),
      avg_weaving_hours_per_day: form.avg_weaving_hours_per_day
        ? Number(form.avg_weaving_hours_per_day)
        : null,
      avg_days_per_cloth: form.avg_days_per_cloth
        ? Number(form.avg_days_per_cloth)
        : null,
      queue_length: Number(form.queue_length || 0),
      unavailable_until: form.unavailable_until || null,
      availability_note: form.availability_note,
      reliability_score: Number(form.reliability_score || 0),
      quality_score: Number(form.quality_score || 0),
    };
    try {
      if (isNew) {
        await addWeaver({ full_name: form.full_name, email: form.email, phone: form.phone, ...common });
      } else {
        await saveWeaverProfile({ profile_id: weaver!.profile_id, ...common });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={isNew ? "Add weaver" : "Edit weaver profile"} onClose={onClose}>
      <form className="portal-form" onSubmit={submit}>
        <h4 className="portal-form-subhead">Client-visible</h4>
        <div className="portal-form-row">
          <Field label="Full name">
            <input
              required
              disabled={!isNew}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </Field>
          <Field label="Years of experience">
            <input
              type="number"
              min={0}
              value={form.years_experience}
              onChange={(e) => setForm({ ...form, years_experience: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Weaving mastered" hint="Comma separated — e.g. Adweneasa, Bridal Kente">
          <input
            value={form.specialties}
            onChange={(e) => setForm({ ...form, specialties: e.target.value })}
          />
        </Field>
        <Field label="Portrait image URL" hint="Shown to clients.">
          <input
            value={form.portrait_url}
            onChange={(e) => setForm({ ...form, portrait_url: e.target.value })}
            placeholder="/images/…"
          />
        </Field>
        <Field label="Short bio">
          <textarea
            rows={2}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </Field>

        <h4 className="portal-form-subhead">
          <ShieldAlert size={13} /> Admin only — never shown to clients
        </h4>
        {isNew && (
          <div className="portal-form-row">
            <Field label="Email" hint="Used for their invite / login.">
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
          </div>
        )}
        <div className="portal-form-row">
          <Field label="Address">
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>
          <Field label="ID number">
            <input
              value={form.id_number}
              onChange={(e) => setForm({ ...form, id_number: e.target.value })}
            />
          </Field>
        </div>
        <div className="portal-form-row">
          <Field label="Hometown">
            <input
              value={form.hometown}
              onChange={(e) => setForm({ ...form, hometown: e.target.value })}
            />
          </Field>
          <Field label="Languages" hint="Comma separated">
            <input
              value={form.languages}
              onChange={(e) => setForm({ ...form, languages: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Emergency contact">
          <input
            value={form.emergency_contact}
            onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
          />
        </Field>

        <h4 className="portal-form-subhead">Production capacity & availability</h4>
        <div className="portal-form-row">
          <Field label="Number of looms">
            <input
              type="number"
              min={0}
              value={form.loom_count}
              onChange={(e) => setForm({ ...form, loom_count: e.target.value })}
            />
          </Field>
          <Field label="Occupied looms" hint="Include personal customer work.">
            <input
              type="number"
              min={0}
              value={form.occupied_looms}
              onChange={(e) => setForm({ ...form, occupied_looms: e.target.value })}
            />
          </Field>
        </div>
        <div className="portal-form-row">
          <Field label="Average weaving hours/day">
            <input
              type="number"
              min={0}
              step="0.5"
              value={form.avg_weaving_hours_per_day}
              onChange={(e) => setForm({ ...form, avg_weaving_hours_per_day: e.target.value })}
            />
          </Field>
          <Field label="Average days per cloth">
            <input
              type="number"
              min={0}
              step="0.5"
              value={form.avg_days_per_cloth}
              onChange={(e) => setForm({ ...form, avg_days_per_cloth: e.target.value })}
            />
          </Field>
        </div>
        <div className="portal-form-row">
          <Field label="Queue length" hint="Committed non-Hinkro or future work.">
            <input
              type="number"
              min={0}
              value={form.queue_length}
              onChange={(e) => setForm({ ...form, queue_length: e.target.value })}
            />
          </Field>
          <Field label="Unavailable until">
            <input
              type="date"
              value={form.unavailable_until}
              onChange={(e) => setForm({ ...form, unavailable_until: e.target.value })}
            />
          </Field>
        </div>
        <Field label="Availability note" hint="Example: Loom 2 is reserved for a personal customer project.">
          <textarea
            rows={2}
            value={form.availability_note}
            onChange={(e) => setForm({ ...form, availability_note: e.target.value })}
          />
        </Field>
        <div className="portal-form-row">
          <Field label="Reliability score">
            <input
              type="number"
              min={0}
              max={100}
              value={form.reliability_score}
              onChange={(e) => setForm({ ...form, reliability_score: e.target.value })}
            />
          </Field>
          <Field label="Quality score">
            <input
              type="number"
              min={0}
              max={100}
              value={form.quality_score}
              onChange={(e) => setForm({ ...form, quality_score: e.target.value })}
            />
          </Field>
        </div>
        {form.unavailable_until && (
          <div className="portal-alert">
            This weaver is marked unavailable until {formatDate(form.unavailable_until)}.
          </div>
        )}

        {error && <div className="portal-error">{error}</div>}
        <div className="portal-actions">
          <button className="portal-btn-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="portal-btn-primary portal-btn-sm" type="submit" disabled={busy}>
            {busy ? "Saving…" : isNew ? "Add weaver" : "Save profile"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
