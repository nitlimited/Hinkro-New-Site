import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Plus, X } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import {
  createClient,
  createProject,
  useClients,
  useTeam,
} from "../../lib/data";
import { Field } from "../../components/ui";
import {
  SHIMMER_COLOR_OPTIONS,
  emptySpec,
  totalYards,
  yardsGuidance,
  yardsToPieces,
} from "../../lib/projectSpec";
import type {
  GarmentType,
  Gender,
  OmbreColor,
  Priority,
  ProjectSpec,
  ThreadType,
} from "../../lib/rows";

export function ProjectCreatePage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { clients } = useClients();
  const { team } = useTeam();
  const weavers = team.filter((t) => t.role === "weaver");

  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [newClient, setNewClient] = useState({ name: "", email: "" });
  const [form, setForm] = useState({
    title: "",
    client_id: "",
    weaver_id: "",
    pattern: "",
    measurements_note: "",
    thread_colors: "",
    accessories: "",
    priority: "normal" as Priority,
    est_start: "",
    est_completion: "",
    design_notes: "",
  });
  const [spec, setSpec] = useState<ProjectSpec>(emptySpec());
  const [inspirationFiles, setInspirationFiles] = useState<File[]>([]);
  const [symbolFiles, setSymbolFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const patchSpec = (patch: Partial<ProjectSpec>) =>
    setSpec((s) => ({ ...s, ...patch }));

  const setOmbre = (index: number, patch: Partial<OmbreColor>) =>
    setSpec((s) => ({
      ...s,
      ombre_colors: s.ombre_colors.map((c, i) =>
        i === index ? { ...c, ...patch } : c,
      ),
    }));

  const addOmbre = () =>
    setSpec((s) => ({
      ...s,
      ombre_colors: [...s.ombre_colors, { color: "", percentage: 0 }],
    }));

  const removeOmbre = (index: number) =>
    setSpec((s) => ({
      ...s,
      ombre_colors: s.ombre_colors.filter((_, i) => i !== index),
    }));

  const ombreTotal = spec.ombre_colors.reduce((sum, c) => sum + (c.percentage || 0), 0);

  const toggleShimmer = (color: string) =>
    setSpec((s) => ({
      ...s,
      shimmer_colors: s.shimmer_colors.includes(color)
        ? s.shimmer_colors.filter((c) => c !== color)
        : [...s.shimmer_colors, color],
    }));

  const isOdd = (n: number | null) => n != null && n % 2 !== 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
    setError("");
    try {
      if (isOdd(spec.design_yards) || isOdd(spec.plain_yards)) {
        setError("Kente is woven in even yards only (2, 4, 6, 8).");
        setBusy(false);
        return;
      }
      if (spec.is_ombre && ombreTotal !== 100 && spec.ombre_colors.length > 0) {
        setError("Ombre colour percentages should add up to 100%.");
        setBusy(false);
        return;
      }
      let clientId = form.client_id;
      if (clientMode === "new") {
        const created = await createClient(newClient);
        clientId = created.id;
      }
      if (!clientId) {
        setError("Please choose or create a client.");
        setBusy(false);
        return;
      }
      const project = await createProject(
        {
          title: form.title,
          client_id: clientId,
          weaver_id: form.weaver_id || null,
          pattern: form.pattern,
          measurements_note: form.measurements_note,
          thread_colors: form.thread_colors
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          accessories: form.accessories
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          quantity: Math.max(1, yardsToPieces(spec)),
          priority: form.priority,
          est_start: form.est_start || null,
          est_completion: form.est_completion || null,
          design_notes: form.design_notes,
          spec,
          inspirationFiles,
          embroiderySymbolFiles: spec.has_embroidery ? symbolFiles : [],
        },
        profile.id,
      );
      navigate(`/portal/admin/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="portal-narrow">
      <h1 className="portal-page-title">New project</h1>
      <p className="portal-page-sub">
        A reference number is generated automatically. The assigned weaver sees
        the full brief instantly, and the client confirms thread colours and
        pattern before weaving begins.
      </p>

      <form onSubmit={submit} className="portal-form portal-card portal-form-card">
        <h2 className="portal-form-section">Order</h2>
        <Field label="Project title">
          <input
            required
            placeholder="e.g. Wedding Kente — gold & royal blue"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </Field>

        <h2 className="portal-form-section">Client</h2>
        <div className="portal-filters">
          <button
            type="button"
            className={clientMode === "existing" ? "is-active" : ""}
            onClick={() => setClientMode("existing")}
          >
            Existing client
          </button>
          <button
            type="button"
            className={clientMode === "new" ? "is-active" : ""}
            onClick={() => setClientMode("new")}
          >
            New client
          </button>
        </div>
        {clientMode === "existing" ? (
          <Field label="Client">
            <select
              required
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.email ? `(${c.email})` : ""}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <div className="portal-form-row">
            <Field label="Client name">
              <input
                required
                value={newClient.name}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
              />
            </Field>
            <Field label="Client email">
              <input
                type="email"
                required
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
              />
            </Field>
          </div>
        )}

        <h2 className="portal-form-section">Production</h2>
        <div className="portal-form-row">
          <Field label="Assigned weaver">
            <select
              value={form.weaver_id}
              onChange={(e) => setForm({ ...form, weaver_id: e.target.value })}
            >
              <option value="">Assign later</option>
              {weavers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.full_name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value as Priority })
              }
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </Field>
        </div>
        <Field label="Pattern">
          <input
            placeholder="e.g. Adweneasa"
            value={form.pattern}
            onChange={(e) => setForm({ ...form, pattern: e.target.value })}
          />
        </Field>

        <h2 className="portal-form-section">Weaving specification</h2>
        <p className="portal-muted-text">
          The client approves this brief before any work begins. Fields appear
          in the order they&rsquo;re decided.
        </p>

        {/* 1 — Made for (determines garment & yardage) */}
        <div className="portal-form-row">
          <Field label="Made for" hint="Decided first — sets the garment and yardage.">
            <select
              value={spec.gender ?? ""}
              onChange={(e) =>
                patchSpec({
                  gender: (e.target.value || null) as Gender | null,
                  garment_type: e.target.value === "woman" ? spec.garment_type : null,
                })
              }
            >
              <option value="">Select…</option>
              <option value="man">Man</option>
              <option value="woman">Woman</option>
            </select>
          </Field>
          {spec.gender === "woman" && (
            <Field label="Garment style">
              <select
                value={spec.garment_type ?? ""}
                onChange={(e) =>
                  patchSpec({ garment_type: (e.target.value || null) as GarmentType | null })
                }
              >
                <option value="">Select…</option>
                <option value="3_pieces">3 Pieces</option>
                <option value="dansikran">Dansikran</option>
              </select>
            </Field>
          )}
        </div>
        {yardsGuidance(spec) && (
          <p className="portal-spec-guidance">{yardsGuidance(spec)}</p>
        )}

        {/* 2 — Thread type */}
        <Field label="Thread type">
          <select
            value={spec.thread_type ?? ""}
            onChange={(e) =>
              patchSpec({ thread_type: (e.target.value || null) as ThreadType | null })
            }
          >
            <option value="">Select…</option>
            <option value="silk">Silk</option>
            <option value="rayon">Rayon</option>
          </select>
        </Field>

        {/* 3 — Shimmers + colours */}
        <label className="portal-check">
          <input
            type="checkbox"
            checked={spec.has_shimmers}
            onChange={(e) =>
              patchSpec({
                has_shimmers: e.target.checked,
                shimmer_colors: e.target.checked ? spec.shimmer_colors : [],
              })
            }
          />
          Shimmers
        </label>
        {spec.has_shimmers && (
          <div className="portal-subpanel">
            <div className="portal-subpanel-head">
              <h4>Shimmer colours</h4>
            </div>
            <div className="portal-check-row">
              {SHIMMER_COLOR_OPTIONS.map((c) => (
                <label className="portal-check" key={c}>
                  <input
                    type="checkbox"
                    checked={spec.shimmer_colors.includes(c)}
                    onChange={() => toggleShimmer(c)}
                  />
                  {c}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 4 — Border */}
        <label className="portal-check">
          <input
            type="checkbox"
            checked={spec.has_border}
            onChange={(e) => patchSpec({ has_border: e.target.checked })}
          />
          Border design
        </label>

        {/* 5 — Weave style (regular / ombre), decided before yards */}
        <Field
          label="Weave style"
          hint="Patterned & plain weave can transition. Decide before setting yards."
        >
          <select
            value={spec.is_ombre ? "ombre" : "regular"}
            onChange={(e) => patchSpec({ is_ombre: e.target.value === "ombre" })}
          >
            <option value="regular">Regular</option>
            <option value="ombre">Ombre / transition</option>
          </select>
        </Field>
        {spec.is_ombre && (
          <div className="portal-subpanel">
            <div className="portal-subpanel-head">
              <h4>Colour transition</h4>
              <span
                className={`portal-ombre-total ${ombreTotal === 100 ? "is-ok" : "is-warn"}`}
              >
                {ombreTotal}%
              </span>
            </div>
            {spec.ombre_colors.map((c, i) => (
              <div className="portal-ombre-row" key={i}>
                <input
                  className="portal-ombre-swatch"
                  type="color"
                  value={/^#/.test(c.color) ? c.color : "#cd8c23"}
                  onChange={(e) => setOmbre(i, { color: e.target.value })}
                  aria-label="Colour swatch"
                />
                <input
                  placeholder="Colour name (e.g. Emerald)"
                  value={c.color}
                  onChange={(e) => setOmbre(i, { color: e.target.value })}
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={c.percentage || ""}
                  onChange={(e) => setOmbre(i, { percentage: Number(e.target.value) || 0 })}
                  aria-label="Percentage"
                />
                <span className="portal-ombre-pct">%</span>
                <button
                  className="portal-icon-btn"
                  type="button"
                  aria-label="Remove colour"
                  onClick={() => removeOmbre(i)}
                >
                  <X size={15} />
                </button>
              </div>
            ))}
            <button className="portal-btn-secondary" type="button" onClick={addOmbre}>
              <Plus size={15} /> Add colour
            </button>
          </div>
        )}

        {/* 6 — Yards (even numbers only; 2 yards = 1 piece) */}
        <div className="portal-form-row portal-yards-row">
          <Field label="Design yards" hint="Patterned — even only">
            <input
              type="number"
              min={0}
              step={2}
              value={spec.design_yards ?? ""}
              onChange={(e) =>
                patchSpec({
                  design_yards: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </Field>
          <Field label="Plain yards" hint="Plain — even only">
            <input
              type="number"
              min={0}
              step={2}
              value={spec.plain_yards ?? ""}
              onChange={(e) =>
                patchSpec({
                  plain_yards: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </Field>
          <div className="portal-yards-total">
            <span className="portal-yards-total-label">Total</span>
            <span className="portal-yards-total-value">{totalYards(spec)} yd</span>
            <span className="portal-yards-total-label">{yardsToPieces(spec)} pieces</span>
          </div>
        </div>

        {/* 7 — Embroidery */}
        <label className="portal-check">
          <input
            type="checkbox"
            checked={spec.has_embroidery}
            onChange={(e) => patchSpec({ has_embroidery: e.target.checked })}
          />
          Embroidered symbols
        </label>
        {spec.has_embroidery && (
          <div className="portal-subpanel">
            <div className="portal-subpanel-head">
              <h4>Embroidery symbols</h4>
            </div>
            <p className="portal-muted-text">
              Attach the symbols to be embroidered. The client and weaver both
              see these.
            </p>
            <label className="portal-file-label">
              <Camera size={16} />
              {symbolFiles.length > 0
                ? `${symbolFiles.length} symbol${symbolFiles.length > 1 ? "s" : ""} attached`
                : "Attach symbol images"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setSymbolFiles(Array.from(e.target.files ?? []))}
              />
            </label>
          </div>
        )}

        <Field label="Thread colours" hint="Separate with commas. The client confirms these before weaving.">
          <input
            placeholder="Gold, Royal Blue, Ivory"
            value={form.thread_colors}
            onChange={(e) => setForm({ ...form, thread_colors: e.target.value })}
          />
        </Field>
        <Field label="Accessories" hint="Separate with commas. Leave empty if none.">
          <input
            placeholder="Bridal hand fan, Garment bag"
            value={form.accessories}
            onChange={(e) => setForm({ ...form, accessories: e.target.value })}
          />
        </Field>
        <Field label="Measurements">
          <textarea
            rows={2}
            placeholder="e.g. standard adult width"
            value={form.measurements_note}
            onChange={(e) =>
              setForm({ ...form, measurements_note: e.target.value })
            }
          />
        </Field>

        <h2 className="portal-form-section">Inspiration &amp; guidance</h2>
        <p className="portal-muted-text">
          Attach reference images to guide the weaver — colour ways, motifs,
          finished looks. The weaver sees these on the project.
        </p>
        <label className="portal-file-label">
          <Camera size={16} />
          {inspirationFiles.length > 0
            ? `${inspirationFiles.length} image${inspirationFiles.length > 1 ? "s" : ""} attached`
            : "Attach inspiration images"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setInspirationFiles(Array.from(e.target.files ?? []))}
          />
        </label>

        <h2 className="portal-form-section">Timeline</h2>
        <p className="portal-muted-text">
          The promised window covers loom preparation through quality inspection.
          Consultation, packaging and delivery sit outside it.
        </p>
        <div className="portal-form-row">
          <Field label="Estimated start" hint="Loom preparation begins">
            <input
              type="date"
              value={form.est_start}
              onChange={(e) => setForm({ ...form, est_start: e.target.value })}
            />
          </Field>
          <Field label="Estimated completion" hint="Quality inspection done">
            <input
              type="date"
              value={form.est_completion}
              onChange={(e) =>
                setForm({ ...form, est_completion: e.target.value })
              }
            />
          </Field>
        </div>
        <Field label="Design notes">
          <textarea
            rows={3}
            value={form.design_notes}
            onChange={(e) => setForm({ ...form, design_notes: e.target.value })}
          />
        </Field>

        {error && <div className="portal-error">{error}</div>}
        <button className="portal-btn-primary" type="submit" disabled={busy}>
          {busy ? "Creating…" : "Create project"}
        </button>
      </form>
    </section>
  );
}
