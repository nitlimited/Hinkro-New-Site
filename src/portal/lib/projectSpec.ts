/**
 * Weaving-spec, approval, stage-semantics and weaver-performance helpers.
 * Pure functions shared across the assignment form, project detail, and
 * weaver profile.
 */

import type {
  GarmentType,
  Gender,
  ProjectApprovals,
  ProjectRow,
  ProjectSpec,
  ThreadType,
  WeaverPerformance,
  WeaverProfileRow,
} from "./rows";

/* ---------- normalisers (spec/approvals are optional jsonb) ---------- */

export function emptySpec(): ProjectSpec {
  return {
    design_yards: null,
    plain_yards: null,
    gender: null,
    garment_type: null,
    has_border: false,
    has_shimmers: false,
    shimmer_colors: [],
    thread_type: null,
    is_ombre: false,
    ombre_scope: null,
    ombre_colors: [],
    has_embroidery: false,
  };
}

export function yardsToPieces(spec: ProjectSpec): number {
  return Math.round(totalYards(spec) / 2);
}

/**
 * The 3 Pieces garment is the only one with explicit design/plain yardage.
 * Man and Dansikran use standard approximate yardage.
 */
export function needsYardage(spec: ProjectSpec): boolean {
  return spec.gender === "woman" && spec.garment_type === "3_pieces";
}

/** Guidance range for garments that don't take explicit yardage. */
export function yardsGuidance(spec: ProjectSpec): string | null {
  if (spec.gender === "man") return "Approximately 10–12 yards.";
  if (spec.gender === "woman" && spec.garment_type === "dansikran")
    return "Approximately 6–8 yards.";
  return null;
}

export function getSpec(project: Pick<ProjectRow, "spec">): ProjectSpec {
  return { ...emptySpec(), ...(project.spec ?? {}) };
}

export function defaultApprovals(): ProjectApprovals {
  return { thread: "pending", thread_at: null, pattern: "pending", pattern_at: null };
}

export function getApprovals(project: Pick<ProjectRow, "approvals">): ProjectApprovals {
  return { ...defaultApprovals(), ...(project.approvals ?? {}) };
}

export function totalYards(spec: ProjectSpec): number {
  return (spec.design_yards ?? 0) + (spec.plain_yards ?? 0);
}

/* ---------- display labels ---------- */

export const GENDER_LABEL: Record<Gender, string> = {
  man: "Man",
  woman: "Woman",
};

export const OMBRE_SCOPE_LABEL: Record<string, string> = {
  plain: "Plain weave",
  design: "Design weave",
  both: "Plain & design weave",
};

export const GARMENT_LABEL: Record<GarmentType, string> = {
  "3_pieces": "3 Pieces",
  dansikran: "Dansikran",
};

export const THREAD_LABEL: Record<ThreadType, string> = {
  silk: "Silk",
  rayon: "Rayon",
};

/* ---------- stage semantics ----------
   The promised production window runs from Loom Preparation through Quality
   Inspection. Consultation (design + sample creation) precedes it and does not
   count toward the promised start; packaging and delivery follow it. */

export type StageCategory = "consultation" | "production" | "post";

const CONSULTATION_STAGES = [
  "order received",
  "materials prepared",
  "design verification",
  "consultation",
  "design",
  "sample",
];
const POST_STAGES = ["packaging", "ready for delivery", "completed", "delivery"];
const PRODUCTION_START = "loom preparation";
const PRODUCTION_END = "quality inspection";

export function stageCategory(name: string): StageCategory {
  const n = name.toLowerCase();
  if (POST_STAGES.some((s) => n.includes(s))) return "post";
  if (CONSULTATION_STAGES.some((s) => n.includes(s))) return "consultation";
  return "production";
}

export function isProductionStart(name: string): boolean {
  return name.toLowerCase().includes(PRODUCTION_START);
}

export function isProductionEnd(name: string): boolean {
  return name.toLowerCase().includes(PRODUCTION_END);
}

/**
 * Order the stages for a specific project: the global Embroidery stage only
 * appears when the brief calls for embroidery.
 */
export function stagesForProject<T extends { name: string }>(
  stages: T[],
  hasEmbroidery: boolean,
): T[] {
  return stages.filter(
    (s) => hasEmbroidery || !s.name.toLowerCase().includes("embroidery"),
  );
}

/* ---------- weaver performance ----------
   Score rewards finishing on or before the deadline and taking on a healthy
   volume of work in the current year. */

export function computePerformance(projects: ProjectRow[]): WeaverPerformance {
  const year = new Date().getFullYear();
  const completed = projects.filter((p) => p.actual_completion);
  const active = projects.filter((p) => !p.actual_completion);
  const thisYear = projects.filter(
    (p) => new Date(p.created_at).getFullYear() === year,
  ).length;
  const onTime = completed.filter(
    (p) =>
      p.est_completion &&
      p.actual_completion &&
      p.actual_completion <= p.est_completion,
  ).length;

  const onTimeRate = completed.length
    ? Math.round((onTime / completed.length) * 100)
    : 0;
  // 70% weight on punctuality, 30% on volume (capped at 8 projects/year).
  const volumeScore = Math.min(thisYear / 8, 1) * 100;
  const score = completed.length
    ? Math.round(onTimeRate * 0.7 + volumeScore * 0.3)
    : Math.round(volumeScore * 0.3);

  return {
    completed: completed.length,
    active: active.length,
    onTime,
    thisYear,
    onTimeRate,
    score,
  };
}

export function performanceBand(score: number): "excellent" | "good" | "building" {
  return score >= 80 ? "excellent" : score >= 55 ? "good" : "building";
}

export interface WeaverCapacity {
  loomCount: number;
  occupiedLooms: number;
  availableLooms: number;
  activeProjects: number;
  queueLength: number;
  avgHoursPerDay: number;
  avgDaysPerCloth: number | null;
  currentWorkload: number;
  availableCapacity: number;
  nextAvailableDate: string | null;
  unavailableUntil: string | null;
  availabilityLabel: string;
  canTakeNewProject: boolean;
  onTimeDeliveryRate: number;
  reliabilityScore: number;
  qualityScore: number;
}

export function computeWeaverCapacity(
  weaver: WeaverProfileRow,
  projects: ProjectRow[],
): WeaverCapacity {
  const perf = computePerformance(projects);
  const today = new Date().toISOString().slice(0, 10);
  const activeProjects = projects.filter((p) => !p.actual_completion);
  const latestActiveCompletion = activeProjects
    .map((p) => p.est_completion)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1) ?? null;
  const unavailableUntil = weaver.unavailable_until;
  const nextAvailableDate = [latestActiveCompletion, unavailableUntil]
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1) ?? null;
  const loomCount = Math.max(weaver.loom_count ?? 0, 0);
  const occupiedLooms = Math.min(Math.max(weaver.occupied_looms ?? 0, 0), loomCount);
  const availableLooms = Math.max(loomCount - occupiedLooms, 0);
  const queueLength = Math.max(weaver.queue_length ?? 0, 0);
  const avgHoursPerDay = Number(weaver.avg_weaving_hours_per_day ?? 0);
  const activeCount = activeProjects.length;
  const currentWorkload = activeCount + queueLength;
  const unavailableNow = Boolean(unavailableUntil && unavailableUntil >= today);
  const canTakeNewProject =
    !unavailableNow && avgHoursPerDay > 0 && availableLooms > 0 && queueLength === 0;
  const availableCapacity = canTakeNewProject
    ? Math.max(availableLooms * avgHoursPerDay - activeCount * 2, 0)
    : 0;
  const availabilityLabel = canTakeNewProject
    ? "Available now"
    : nextAvailableDate
      ? `Available from ${nextAvailableDate}`
      : "Not available for new work";

  return {
    loomCount,
    occupiedLooms,
    availableLooms,
    activeProjects: activeCount,
    queueLength,
    avgHoursPerDay,
    avgDaysPerCloth: weaver.avg_days_per_cloth,
    currentWorkload,
    availableCapacity,
    nextAvailableDate,
    unavailableUntil,
    availabilityLabel,
    canTakeNewProject,
    onTimeDeliveryRate: perf.onTimeRate,
    reliabilityScore: weaver.reliability_score,
    qualityScore: weaver.quality_score,
  };
}
