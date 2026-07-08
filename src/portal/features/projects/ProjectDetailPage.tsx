import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  Camera,
  CircleDot,
  Image as ImageIcon,
  MessageSquare,
  Milestone,
  Pause,
  Play,
  StickyNote,
} from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import {
  addWorkLog,
  postUpdate,
  updateProjectFields,
  useProject,
  useStages,
  useTeam,
} from "../../lib/data";
import type { UpdateRow, UpdateType } from "../../lib/rows";
import {
  EmptyState,
  Field,
  PriorityBadge,
  ProgressBar,
  StagePill,
  formatDate,
  formatDateTime,
} from "../../components/ui";

const UPDATE_ICONS: Partial<Record<UpdateType, React.ReactNode>> = {
  progress: <CircleDot size={15} />,
  status_change: <Milestone size={15} />,
  note: <StickyNote size={15} />,
  media: <ImageIcon size={15} />,
  milestone: <CheckCircle2 size={15} />,
  pause: <Pause size={15} />,
  resume: <Play size={15} />,
  completed: <CheckCircle2 size={15} />,
  question: <MessageSquare size={15} />,
  reply: <MessageSquare size={15} />,
};

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const { profile } = useAuth();
  const { project, updates, workLogs, media, loading, refresh } =
    useProject(projectId);

  if (loading) return <div className="portal-loading-inline">Loading…</div>;
  if (!project || !profile) {
    return (
      <EmptyState
        title="Project not found"
        body="It may have been removed, or you may not have access to it."
      />
    );
  }

  const isAdmin = profile.role === "super_admin" || profile.role === "admin";
  const isWeaver = profile.role === "weaver";
  const isClient = profile.role === "client";

  return (
    <section>
      <div className="portal-page-head">
        <div>
          <span className="portal-td-ref">{project.reference}</span>
          <h1 className="portal-page-title">{project.title}</h1>
          <div className="portal-detail-badges">
            <StagePill name={project.is_paused ? "Paused" : project.stage?.name} />
            <PriorityBadge level={project.priority} />
            {project.actual_completion && (
              <span className="portal-stage">Completed {formatDate(project.actual_completion)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="portal-detail-grid">
        <div className="portal-detail-main">
          <div className="portal-card">
            <ProgressBar value={project.progress_pct} />
            <dl className="portal-kv portal-kv-row">
              <div>
                <dt>Client</dt>
                <dd>{project.client?.name ?? "—"}</dd>
              </div>
              <div>
                <dt>Weaver</dt>
                <dd>{project.weaver?.full_name ?? "Unassigned"}</dd>
              </div>
              <div>
                <dt>Pattern</dt>
                <dd>{project.pattern ?? "—"}</dd>
              </div>
              <div>
                <dt>Quantity</dt>
                <dd>{project.quantity}</dd>
              </div>
              <div>
                <dt>Threads</dt>
                <dd>{project.thread_colors.join(", ") || "—"}</dd>
              </div>
              <div>
                <dt>Accessories</dt>
                <dd>{(project.accessories as string[]).join(", ") || "None"}</dd>
              </div>
              <div>
                <dt>Est. start</dt>
                <dd>{formatDate(project.est_start)}</dd>
              </div>
              <div>
                <dt>Est. completion</dt>
                <dd>{formatDate(project.est_completion)}</dd>
              </div>
            </dl>
            {(project.measurements as { note?: string })?.note && (
              <p className="portal-detail-note">
                <strong>Measurements:</strong>{" "}
                {(project.measurements as { note?: string }).note}
              </p>
            )}
            {project.design_notes && (
              <p className="portal-detail-note">
                <strong>Design notes:</strong> {project.design_notes}
              </p>
            )}
          </div>

          {isWeaver && !project.actual_completion && (
            <UpdateComposer projectId={project.id} onPosted={refresh} isPaused={project.is_paused} />
          )}
          {isClient && (
            <QuestionBox projectId={project.id} onPosted={refresh} />
          )}
          {isAdmin && (
            <AdminNoteBox projectId={project.id} onPosted={refresh} />
          )}

          <h2 className="portal-section-title">Timeline</h2>
          {updates.length === 0 ? (
            <EmptyState title="No updates yet" body="Updates will appear here as work begins." />
          ) : (
            <ol className="portal-timeline">
              {updates.map((u) => (
                <TimelineItem key={u.id} update={u} />
              ))}
            </ol>
          )}
        </div>

        <aside className="portal-detail-side">
          {isAdmin && <AdminControls project={project} onChanged={refresh} />}

          {media.length > 0 && (
            <>
              <h2 className="portal-section-title">Gallery</h2>
              <div className="portal-gallery">
                {media
                  .filter((m) => m.kind === "image" && m.url)
                  .map((m) => (
                    <a key={m.id} href={m.url} target="_blank" rel="noreferrer">
                      <img src={m.url} alt={m.caption ?? "Project photo"} loading="lazy" />
                    </a>
                  ))}
              </div>
            </>
          )}

          {(isWeaver || isAdmin) && (
            <WorkLogSection
              projectId={project.id}
              weaverId={profile.id}
              canAdd={isWeaver}
              workLogs={workLogs}
              onAdded={refresh}
            />
          )}
        </aside>
      </div>
    </section>
  );
}

/* ---------- timeline ---------- */

function TimelineItem({ update }: { update: UpdateRow }) {
  return (
    <li>
      <span className="portal-timeline-dot">
        {UPDATE_ICONS[update.type] ?? <StickyNote size={15} />}
      </span>
      <div>
        <strong>
          {update.author?.full_name ?? "Team"}
          <span className={`portal-update-type portal-update-${update.type}`}>
            {update.type.replace("_", " ")}
          </span>
        </strong>
        {update.body && <p>{update.body}</p>}
        {typeof update.progress_pct === "number" && update.type === "progress" && (
          <div className="portal-timeline-progress">
            <ProgressBar value={update.progress_pct} />
          </div>
        )}
        {update.media && update.media.length > 0 && (
          <div className="portal-timeline-media">
            {update.media
              .filter((m) => m.url)
              .map((m) => (
                <a key={m.id} href={m.url} target="_blank" rel="noreferrer">
                  <img src={m.url} alt={m.caption ?? "Update photo"} loading="lazy" />
                </a>
              ))}
          </div>
        )}
        <time>{formatDateTime(update.created_at)}</time>
      </div>
    </li>
  );
}

/* ---------- weaver composer ---------- */

function UpdateComposer({
  projectId,
  onPosted,
  isPaused,
}: {
  projectId: string;
  onPosted: () => void;
  isPaused: boolean;
}) {
  const { profile } = useAuth();
  const stages = useStages();
  const [body, setBody] = useState("");
  const [progress, setProgress] = useState<number | "">("");
  const [stageId, setStageId] = useState("");
  const [newDate, setNewDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const post = async (type: UpdateType, overrideBody?: string) => {
    if (!profile) return;
    setBusy(true);
    setError("");
    setDone("");
    try {
      await postUpdate(
        {
          project_id: projectId,
          type,
          body: overrideBody ?? body,
          progress_pct: progress === "" ? undefined : Number(progress),
          stage_id: stageId || undefined,
          new_est_completion: newDate || undefined,
          files,
        },
        { id: profile.id, full_name: profile.full_name, role: profile.role },
      );
      setBody("");
      setProgress("");
      setStageId("");
      setNewDate("");
      setFiles([]);
      setDone("Update posted — the client and studio have been notified.");
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="portal-card portal-composer">
      <h2>Post an update</h2>
      <textarea
        rows={3}
        placeholder="What happened today? The client sees this."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="portal-form-row portal-composer-row">
        <Field label="Progress %">
          <input
            type="number"
            min={0}
            max={100}
            placeholder="e.g. 70"
            value={progress}
            onChange={(e) =>
              setProgress(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </Field>
        <Field label="Stage">
          <select value={stageId} onChange={(e) => setStageId(e.target.value)}>
            <option value="">No change</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="New est. completion">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
        </Field>
      </div>
      <label className="portal-file-label">
        <Camera size={16} />
        {files.length > 0
          ? `${files.length} file${files.length > 1 ? "s" : ""} attached`
          : "Attach photos or videos"}
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
      </label>

      {error && <div className="portal-error">{error}</div>}
      {done && <div className="portal-notice">{done}</div>}

      <div className="portal-composer-actions">
        <button
          className="portal-btn-primary portal-btn-sm"
          type="button"
          disabled={busy || (!body && progress === "" && !stageId && files.length === 0)}
          onClick={() => void post("progress")}
        >
          {busy ? "Posting…" : "Post update"}
        </button>
        {isPaused ? (
          <button
            className="portal-btn-secondary"
            type="button"
            disabled={busy}
            onClick={() => void post("resume", "Work has resumed on this project.")}
          >
            <Play size={14} /> Resume project
          </button>
        ) : (
          <button
            className="portal-btn-secondary"
            type="button"
            disabled={busy}
            onClick={() => void post("pause", body || "Work is paused on this project.")}
          >
            <Pause size={14} /> Pause
          </button>
        )}
        <button
          className="portal-btn-secondary"
          type="button"
          disabled={busy}
          onClick={() => {
            if (window.confirm("Mark this project as complete?")) {
              void post("completed", body || "The project is complete!");
            }
          }}
        >
          <CheckCircle2 size={14} /> Mark complete
        </button>
      </div>
    </div>
  );
}

/* ---------- client question box ---------- */

function QuestionBox({
  projectId,
  onPosted,
}: {
  projectId: string;
  onPosted: () => void;
}) {
  const { profile } = useAuth();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !body.trim()) return;
    setBusy(true);
    await postUpdate(
      { project_id: projectId, type: "question", body },
      { id: profile.id, full_name: profile.full_name, role: profile.role },
    );
    setBody("");
    setDone("Sent! The studio and your weaver have been notified.");
    setBusy(false);
    onPosted();
  };

  return (
    <form className="portal-card portal-composer" onSubmit={send}>
      <h2>Ask a question or send feedback</h2>
      <textarea
        rows={2}
        placeholder="e.g. Could the gold be slightly deeper in tone?"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      {done && <div className="portal-notice">{done}</div>}
      <button
        className="portal-btn-primary portal-btn-sm"
        type="submit"
        disabled={busy || !body.trim()}
      >
        <MessageSquare size={14} /> {busy ? "Sending…" : "Send"}
      </button>
    </form>
  );
}

/* ---------- admin note + controls ---------- */

function AdminNoteBox({
  projectId,
  onPosted,
}: {
  projectId: string;
  onPosted: () => void;
}) {
  const { profile } = useAuth();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !body.trim()) return;
    setBusy(true);
    await postUpdate(
      { project_id: projectId, type: "note", body },
      { id: profile.id, full_name: profile.full_name, role: profile.role },
    );
    setBody("");
    setBusy(false);
    onPosted();
  };

  return (
    <form className="portal-card portal-composer" onSubmit={send}>
      <h2>Post a note</h2>
      <textarea
        rows={2}
        placeholder="Visible to the client and weaver."
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button
        className="portal-btn-primary portal-btn-sm"
        type="submit"
        disabled={busy || !body.trim()}
      >
        {busy ? "Posting…" : "Post note"}
      </button>
    </form>
  );
}

function AdminControls({
  project,
  onChanged,
}: {
  project: { id: string; weaver_id: string | null; est_completion: string | null };
  onChanged: () => void;
}) {
  const { team } = useTeam();
  const weavers = team.filter((t) => t.role === "weaver");
  const [busy, setBusy] = useState(false);

  const change = async (patch: Parameters<typeof updateProjectFields>[1]) => {
    setBusy(true);
    await updateProjectFields(project.id, patch);
    setBusy(false);
    onChanged();
  };

  return (
    <div className="portal-card">
      <h2 className="portal-side-title">Manage</h2>
      <Field label="Assigned weaver">
        <select
          disabled={busy}
          value={project.weaver_id ?? ""}
          onChange={(e) => void change({ weaver_id: e.target.value || null })}
        >
          <option value="">Unassigned</option>
          {weavers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.full_name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Estimated completion">
        <input
          type="date"
          disabled={busy}
          value={project.est_completion ?? ""}
          onChange={(e) => void change({ est_completion: e.target.value || null })}
        />
      </Field>
    </div>
  );
}

/* ---------- work log ---------- */

function WorkLogSection({
  projectId,
  weaverId,
  canAdd,
  workLogs,
  onAdded,
}: {
  projectId: string;
  weaverId: string;
  canAdd: boolean;
  workLogs: import("../../lib/rows").WorkLogRow[];
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    log_date: new Date().toISOString().slice(0, 10),
    hours_worked: "",
    progress_made: "",
    materials_used: "",
    challenges: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await addWorkLog(
      {
        project_id: projectId,
        log_date: form.log_date,
        hours_worked: form.hours_worked === "" ? null : Number(form.hours_worked),
        progress_made: form.progress_made,
        materials_used: form.materials_used,
        challenges: form.challenges,
        notes: form.notes,
      },
      weaverId,
    );
    setBusy(false);
    setOpen(false);
    setForm({ ...form, hours_worked: "", progress_made: "", materials_used: "", challenges: "", notes: "" });
    onAdded();
  };

  return (
    <>
      <div className="portal-side-head">
        <h2 className="portal-side-title">Daily work log</h2>
        {canAdd && (
          <button
            className="portal-btn-secondary"
            type="button"
            onClick={() => setOpen(!open)}
          >
            {open ? "Cancel" : "Add entry"}
          </button>
        )}
      </div>

      {open && (
        <form className="portal-card portal-form" onSubmit={submit}>
          <div className="portal-form-row">
            <Field label="Date">
              <input
                type="date"
                value={form.log_date}
                onChange={(e) => setForm({ ...form, log_date: e.target.value })}
              />
            </Field>
            <Field label="Hours">
              <input
                type="number"
                step="0.5"
                min={0}
                value={form.hours_worked}
                onChange={(e) => setForm({ ...form, hours_worked: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Progress made">
            <input
              value={form.progress_made}
              onChange={(e) => setForm({ ...form, progress_made: e.target.value })}
            />
          </Field>
          <Field label="Materials used">
            <input
              value={form.materials_used}
              onChange={(e) => setForm({ ...form, materials_used: e.target.value })}
            />
          </Field>
          <Field label="Challenges or delays">
            <input
              value={form.challenges}
              onChange={(e) => setForm({ ...form, challenges: e.target.value })}
            />
          </Field>
          <button className="portal-btn-primary portal-btn-sm" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save entry"}
          </button>
        </form>
      )}

      {workLogs.length === 0 && !open && (
        <p className="portal-muted-text">No entries yet.</p>
      )}
      {workLogs.map((log) => (
        <div className="portal-card portal-worklog" key={log.id}>
          <div className="portal-worklog-head">
            <span className="portal-td-strong">
              <Calendar size={13} /> {formatDate(log.log_date)}
            </span>
            {log.hours_worked != null && <span>{log.hours_worked}h</span>}
          </div>
          {log.progress_made && <p>{log.progress_made}</p>}
          {log.materials_used && (
            <p className="portal-muted-text">Materials: {log.materials_used}</p>
          )}
          {log.challenges && (
            <p className="portal-worklog-challenge">⚠ {log.challenges}</p>
          )}
        </div>
      ))}
    </>
  );
}
