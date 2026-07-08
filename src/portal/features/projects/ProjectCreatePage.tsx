import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import {
  createClient,
  createProject,
  useClients,
  useTeam,
} from "../../lib/data";
import { Field } from "../../components/ui";
import type { Priority } from "../../lib/rows";

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
    quantity: 1,
    priority: "normal" as Priority,
    est_start: "",
    est_completion: "",
    design_notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
    setError("");
    try {
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
          quantity: form.quantity,
          priority: form.priority,
          est_start: form.est_start || null,
          est_completion: form.est_completion || null,
          design_notes: form.design_notes,
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
        A reference number is generated automatically. Once created, the
        assigned weaver sees it instantly and the client can be invited to
        follow along.
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
        <div className="portal-form-row">
          <Field label="Pattern">
            <input
              placeholder="e.g. Adweneasa"
              value={form.pattern}
              onChange={(e) => setForm({ ...form, pattern: e.target.value })}
            />
          </Field>
          <Field label="Quantity">
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: Number(e.target.value) || 1 })
              }
            />
          </Field>
        </div>
        <Field label="Thread colours" hint="Separate with commas.">
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
            placeholder="e.g. 12 yards, standard adult width"
            value={form.measurements_note}
            onChange={(e) =>
              setForm({ ...form, measurements_note: e.target.value })
            }
          />
        </Field>

        <h2 className="portal-form-section">Timeline</h2>
        <div className="portal-form-row">
          <Field label="Estimated start">
            <input
              type="date"
              value={form.est_start}
              onChange={(e) => setForm({ ...form, est_start: e.target.value })}
            />
          </Field>
          <Field label="Estimated completion">
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
