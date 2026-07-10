import type { ProjectRow, WeaverProfileRow, NotificationRow } from "./rows";

const DAY = 86_400_000;
const STALE_THRESHOLD_DAYS = 5;

export interface AutoNotification {
  type: "weaver_unavailable" | "weaver_idle" | "weaving_completed" | "stale_project";
  title: string;
  body: string;
  projectId?: string;
  weaverId?: string;
  severity: "warning" | "info" | "success";
}

/**
 * Detect all notification triggers for the admin dashboard.
 * Returns alerts that should be shown as banners + notifications to create.
 */
export function detectNotifications(
  projects: ProjectRow[],
  weavers: WeaverProfileRow[],
  now: Date = new Date(),
): AutoNotification[] {
  const alerts: AutoNotification[] = [];
  const nowMs = now.getTime();

  // 1. Weaver unavailable
  for (const w of weavers) {
    if (w.unavailable_until && new Date(w.unavailable_until).getTime() > nowMs) {
      const daysLeft = Math.ceil(
        (new Date(w.unavailable_until).getTime() - nowMs) / DAY,
      );
      const activeProjects = projects.filter(
        (p) => p.weaver_id === w.profile_id && !p.actual_completion,
      );
      alerts.push({
        type: "weaver_unavailable",
        title: `${w.profile?.full_name ?? "Weaver"} unavailable`,
        body: `Returns in ~${daysLeft} day${daysLeft !== 1 ? "s" : ""}. ${activeProjects.length} active project${activeProjects.length !== 1 ? "s" : ""} affected.`,
        weaverId: w.profile_id,
        severity: "warning",
      });
    }
  }

  // 2. Weaver idle (no active projects, not unavailable)
  for (const w of weavers) {
    if (w.profile?.status !== "active") continue;
    const isUnavailable =
      w.unavailable_until && new Date(w.unavailable_until).getTime() > nowMs;
    if (isUnavailable) continue;

    const activeProjects = projects.filter(
      (p) =>
        p.weaver_id === w.profile_id &&
        !p.actual_completion &&
        !p.is_paused,
    );
    if (activeProjects.length === 0) {
      alerts.push({
        type: "weaver_idle",
        title: `${w.profile?.full_name ?? "Weaver"} is idle`,
        body: `No active projects. Available for new assignments (${w.loom_count - w.occupied_looms} loom(s) free).`,
        weaverId: w.profile_id,
        severity: "info",
      });
    }
  }

  // 3. Weaving completed — ready for QC
  for (const p of projects) {
    if (
      p.progress_pct >= 100 &&
      !p.actual_completion &&
      p.delivery_status === "pending"
    ) {
      alerts.push({
        type: "weaving_completed",
        title: `${p.reference} ready for QC`,
        body: `"${p.title}" has reached 100% progress. Schedule quality control inspection.`,
        projectId: p.id,
        severity: "success",
      });
    }
  }

  // 4. Stale project — no update in 5+ days
  for (const p of projects) {
    if (p.actual_completion || p.is_paused) continue;
    const updatedMs = new Date(p.updated_at).getTime();
    const daysSinceUpdate = Math.floor((nowMs - updatedMs) / DAY);
    if (daysSinceUpdate >= STALE_THRESHOLD_DAYS) {
      alerts.push({
        type: "stale_project",
        title: `${p.reference} stale — ${daysSinceUpdate} days`,
        body: `"${p.title}" hasn't been updated in ${daysSinceUpdate} days. Check with ${p.weaver ?? "the weaver"} for status.`,
        projectId: p.id,
        severity: "warning",
      });
    }
  }

  return alerts;
}

/**
 * Convert an AutoNotification into a NotificationRow for storage.
 */
export function toNotificationRow(
  alert: AutoNotification,
  userId: string,
): NotificationRow {
  return {
    id: `auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    user_id: userId,
    type: alert.type,
    title: alert.title,
    body: alert.body,
    data: {
      project_id: alert.projectId,
    },
    read_at: null,
    created_at: new Date().toISOString(),
  };
}
