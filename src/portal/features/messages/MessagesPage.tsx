import React, { useState } from "react";
import { Megaphone, Send, User } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { sendMessage, useMessages, useTeam, useClients } from "../../lib/data";
import { EmptyState, Field, formatDateTime } from "../../components/ui";
import type { MessageAudience } from "../../lib/rows";

export function MessagesPage() {
  const { profile } = useAuth();
  const isAdmin =
    profile?.role === "super_admin" || profile?.role === "admin";
  const { messages, loading } = useMessages(
    profile?.role ?? "client",
    profile?.id,
  );

  return (
    <section>
      <div className="portal-page-head">
        <div>
          <h1 className="portal-page-title">Messages</h1>
          <p className="portal-page-sub">
            {isAdmin
              ? "Send messages to individuals, groups, or everyone. Recipients are notified instantly."
              : "Messages and announcements from the Hinkro Kente studio."}
          </p>
        </div>
      </div>

      {isAdmin && <ComposeBox />}

      {!loading && messages.length === 0 && (
        <EmptyState
          title="No messages yet"
          body="Messages from the studio will appear here."
        />
      )}

      <div className="portal-notif-list">
        {messages.map((m) => (
          <article className="portal-card portal-message" key={m.id}>
            <span className="portal-notif-dot is-unread">
              {m.audience === "user" ? <User size={14} /> : <Megaphone size={14} />}
            </span>
            <div>
              <strong>
                {m.sender?.full_name ?? "Hinkro Kente"}
                <span className="portal-update-type">
                  {m.audience === "user"
                    ? `to ${m.recipient?.full_name ?? "one person"}`
                    : m.audience === "all"
                      ? "to everyone"
                      : `to all ${m.audience}`}
                </span>
              </strong>
              <p>{m.body}</p>
              <time>{formatDateTime(m.created_at)}</time>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ComposeBox() {
  const { profile } = useAuth();
  const { team } = useTeam();
  const { clients } = useClients();
  const [audience, setAudience] = useState<MessageAudience>("all");
  const [recipientId, setRecipientId] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  const weavers = team.filter((t) => t.role === "weaver");
  const clientProfiles = clients.filter((c) => c.profile_id);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !body.trim()) return;
    if (audience === "user" && !recipientId) {
      setError("Choose a recipient.");
      return;
    }
    setBusy(true);
    setError("");
    setDone("");
    try {
      await sendMessage(
        {
          audience,
          recipient_id: audience === "user" ? recipientId : undefined,
          body,
        },
        { id: profile.id, full_name: profile.full_name, role: profile.role },
      );
      setBody("");
      setDone("Message sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="portal-card portal-composer" onSubmit={submit}>
      <h2>New message</h2>
      <div className="portal-form-row">
        <Field label="Send to">
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as MessageAudience)}
          >
            <option value="all">Everyone</option>
            <option value="clients">All clients</option>
            <option value="weavers">All weavers</option>
            <option value="user">One person…</option>
          </select>
        </Field>
        {audience === "user" && (
          <Field label="Recipient">
            <select
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
            >
              <option value="">Choose…</option>
              <optgroup label="Weavers">
                {weavers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.full_name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Clients (with portal access)">
                {clientProfiles.map((c) => (
                  <option key={c.id} value={c.profile_id!}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </Field>
        )}
      </div>
      <textarea
        rows={3}
        placeholder="Write your message…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      {error && <div className="portal-error">{error}</div>}
      {done && <div className="portal-notice">{done}</div>}
      <button
        className="portal-btn-primary portal-btn-sm"
        type="submit"
        disabled={busy || !body.trim()}
      >
        <Send size={14} /> {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
