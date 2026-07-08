import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BellRing, CheckCheck } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { useNotifications } from "../../lib/data";
import { enablePush } from "../../lib/push";
import { EmptyState, formatDateTime } from "../../components/ui";

export function NotificationsPage({ projectBase }: { projectBase: string }) {
  const { profile } = useAuth();
  const { notifications, unread, markRead, markAllRead } = useNotifications(
    profile?.id,
  );
  const [pushState, setPushState] = useState<string>("");

  const onEnablePush = async () => {
    if (!profile) return;
    setPushState("working");
    const result = await enablePush(profile.id);
    setPushState(result.ok ? "enabled" : result.reason);
  };

  return (
    <section>
      <div className="portal-page-head">
        <div>
          <h1 className="portal-page-title">Notifications</h1>
          <p className="portal-page-sub">
            {unread > 0 ? `${unread} unread.` : "You're all caught up."}
          </p>
        </div>
        {unread > 0 && (
          <button
            className="portal-btn-secondary"
            type="button"
            onClick={markAllRead}
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="portal-card portal-push-card">
        <div>
          <strong>
            <BellRing size={15} /> Device notifications
          </strong>
          <p className="portal-muted-text">
            Get an alert on this device the moment your projects have news —
            even when the site is closed. On iPhone, first add this site to
            your Home Screen.
          </p>
        </div>
        {pushState === "enabled" ? (
          <span className="portal-stage">Enabled ✓</span>
        ) : (
          <button
            className="portal-btn-primary portal-btn-sm"
            type="button"
            disabled={pushState === "working"}
            onClick={() => void onEnablePush()}
          >
            {pushState === "working" ? "Enabling…" : "Enable"}
          </button>
        )}
      </div>
      {pushState && pushState !== "enabled" && pushState !== "working" && (
        <div className="portal-alert" style={{ marginBottom: 14 }}>
          {pushState}
        </div>
      )}

      {notifications.length === 0 && (
        <EmptyState
          title="Nothing yet"
          body="You'll be notified here when there's activity on your projects."
        />
      )}

      <div className="portal-notif-list">
        {notifications.map((n) => {
          const inner = (
            <>
              <span
                className={`portal-notif-dot ${n.read_at ? "" : "is-unread"}`}
              >
                <Bell size={14} />
              </span>
              <div>
                <strong>{n.title}</strong>
                {n.body && <p>{n.body}</p>}
                <time>{formatDateTime(n.created_at)}</time>
              </div>
            </>
          );
          return n.data.project_id ? (
            <Link
              key={n.id}
              className={`portal-card portal-notif ${n.read_at ? "is-read" : ""}`}
              to={`${projectBase}/${n.data.project_id}`}
              onClick={() => markRead(n.id)}
            >
              {inner}
            </Link>
          ) : (
            <button
              key={n.id}
              type="button"
              className={`portal-card portal-notif ${n.read_at ? "is-read" : ""}`}
              onClick={() => markRead(n.id)}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </section>
  );
}
