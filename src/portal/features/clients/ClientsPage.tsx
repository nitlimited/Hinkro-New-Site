import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { createClient, inviteClient, useClients } from "../../lib/data";
import { EmptyState, Field, Modal, formatDate } from "../../components/ui";

export function ClientsPage() {
  const { clients, loading, refresh } = useClients();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pageError, setPageError] = useState("");
  const [invitingId, setInvitingId] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    setPageError("");
    try {
      const client = await createClient(form);
      try {
        await inviteClient(client.id);
        setNotice(`${client.name} was added and the portal invitation was sent.`);
      } catch (inviteError) {
        setPageError(
          `${client.name} was added, but the invitation could not be sent: ${
            inviteError instanceof Error ? inviteError.message : "Please try again."
          }`,
        );
      }
      setShowCreate(false);
      setForm({ name: "", email: "", phone: "", country: "", notes: "" });
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const resendInvitation = async (clientId: string, name: string) => {
    setInvitingId(clientId);
    setNotice("");
    setPageError("");
    try {
      await inviteClient(clientId);
      setNotice(`A new portal invitation was sent to ${name}.`);
      refresh();
    } catch (inviteError) {
      setPageError(
        inviteError instanceof Error ? inviteError.message : "The invitation could not be sent.",
      );
    } finally {
      setInvitingId("");
    }
  };

  return (
    <section>
      <div className="portal-page-head">
        <div>
          <h1 className="portal-page-title">Clients</h1>
          <p className="portal-page-sub">
            Everyone you weave for. Clients gain portal access when their
            first project is created.
          </p>
        </div>
        <button
          className="portal-btn-primary portal-btn-sm"
          type="button"
          onClick={() => setShowCreate(true)}
        >
          <UserPlus size={15} /> New client
        </button>
      </div>

      {notice && <div className="portal-notice portal-client-feedback">{notice}</div>}
      {pageError && <div className="portal-error portal-client-feedback">{pageError}</div>}

      {!loading && clients.length === 0 && (
        <EmptyState
          title="No clients yet"
          body="Create your first client to start a project for them."
        />
      )}

      {clients.length > 0 && (
        <div className="portal-card portal-table-card">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Country</th>
                <th>Portal access</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td className="portal-td-strong">{c.name}</td>
                  <td>{c.email ?? "—"}</td>
                  <td>{c.phone ?? "—"}</td>
                  <td>{c.country ?? "—"}</td>
                  <td>
                    {c.accepted_at ? (
                      <span className="portal-invite-status is-active">Portal active</span>
                    ) : c.invited_at ? (
                      <span className="portal-invite-status is-pending">Invitation pending</span>
                    ) : (
                      <button
                        className="portal-btn-link portal-resend-invite"
                        type="button"
                        disabled={invitingId === c.id}
                        onClick={() => void resendInvitation(c.id, c.name)}
                      >
                        {invitingId === c.id ? "Sending…" : "Send invitation"}
                      </button>
                    )}
                  </td>
                  <td>{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <Modal title="New client" onClose={() => setShowCreate(false)}>
          <form onSubmit={submit} className="portal-form">
            <Field label="Full name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field
              label="Email"
              hint="Used to invite them to their project dashboard."
            >
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <div className="portal-form-row">
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="Country">
                <input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Notes">
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Field>
            {error && <div className="portal-error">{error}</div>}
            <button className="portal-btn-primary" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Create client"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
