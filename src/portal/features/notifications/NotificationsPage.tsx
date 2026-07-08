import React from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { useAuth } from "../../auth/useAuth";
import { useNotifications } from "../../lib/data";
import { EmptyState, formatDateTime } from "../../components/ui";

export function NotificationsPage({ projectBase }: { projectBase: string }) {
  const { profile } = useAuth();
  const { notifications, unread, markRead, markAllRead } = useNotifications(
    profile?.id,
  );

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
