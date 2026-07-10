import type { WeaverProfileRow, ProjectRow } from "./rows";

export interface WeaverRecommendation {
  weaver: WeaverProfileRow;
  score: number;
  reasons: string[];
}

/**
 * Score weavers for a new project based on quality, availability,
 * reliability, workload, and specialty match.
 */
export function rankWeavers(
  weavers: WeaverProfileRow[],
  projects: ProjectRow[],
  pattern?: string | null,
): WeaverRecommendation[] {
  const now = Date.now();
  const DAY = 86_400_000;

  return weavers
    .map((w) => {
      const reasons: string[] = [];
      let score = 0;

      // ---- Quality (0-30 pts) ----
      const quality = w.quality_score ?? 0;
      score += (quality / 100) * 30;
      if (quality >= 90) reasons.push(`Quality ${quality}% — top tier`);
      else if (quality >= 75) reasons.push(`Quality ${quality}%`);
      else reasons.push(`Quality ${quality}% — needs review`);

      // ---- Reliability / on-time delivery (0-20 pts) ----
      const reliability = w.reliability_score ?? 0;
      score += (reliability / 100) * 20;
      if (reliability >= 85) reasons.push(`${reliability}% delivery rate`);

      // ---- Availability (0-25 pts) ----
      const hasFreeLoom = w.occupied_looms < w.loom_count;
      const isUnavailable =
        w.unavailable_until && new Date(w.unavailable_until).getTime() > now;
      const daysUnavailable = isUnavailable
        ? Math.ceil(
            (new Date(w.unavailable_until!).getTime() - now) / DAY,
          )
        : 0;

      if (!isUnavailable && hasFreeLoom) {
        score += 25;
        reasons.push(`${w.loom_count - w.occupied_looms} loom(s) free`);
      } else if (!isUnavailable && w.occupied_looms < w.loom_count + 2) {
        score += 15;
        reasons.push("Available — may need loom scheduling");
      } else if (isUnavailable) {
        score += 0;
        reasons.push(`Unavailable for ~${daysUnavailable} days`);
      } else {
        score += 5;
        reasons.push("All looms occupied");
      }

      // ---- Workload / queue (0-15 pts, inverted) ----
      const queue = w.queue_length ?? 0;
      if (queue === 0) {
        score += 15;
        reasons.push("No pending projects in queue");
      } else if (queue <= 2) {
        score += 10;
        reasons.push(`${queue} project(s) in queue`);
      } else {
        score += 5;
        reasons.push(`${queue} project(s) in queue — heavy workload`);
      }

      // ---- Specialty match (0-10 pts) ----
      if (pattern && w.specialties.length > 0) {
        const patternLower = pattern.toLowerCase();
        const match = w.specialties.some(
          (s) =>
            s.toLowerCase().includes(patternLower) ||
            patternLower.includes(s.toLowerCase()),
        );
        if (match) {
          score += 10;
          reasons.push(`Specialist in "${pattern}"`);
        } else {
          score += 3;
          reasons.push("No direct specialty match");
        }
      } else {
        score += 5;
        reasons.push("Generalist — no pattern filter applied");
      }

      // ---- Idle bonus (0-5 pts) ----
      const activeProjects = projects.filter(
        (p) =>
          p.weaver_id === w.profile_id &&
          !p.actual_completion &&
          !p.is_paused,
      );
      if (activeProjects.length === 0 && !isUnavailable) {
        score += 5;
        reasons.push("Currently idle — ready for assignment");
      }

      return { weaver: w, score: Math.round(score), reasons };
    })
    .sort((a, b) => b.score - a.score);
}
