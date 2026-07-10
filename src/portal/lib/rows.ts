/** Database row shapes (mirrors supabase/migrations/0001_init.sql). */

import type { UserRole, UserStatus } from "../types";

export type Priority = "low" | "normal" | "high" | "urgent";
export type DeliveryStatus = "pending" | "in_transit" | "delivered";
export type PaymentStatus = "unpaid" | "partial" | "paid";
export type UpdateType =
  | "status_change"
  | "progress"
  | "note"
  | "media"
  | "milestone"
  | "pause"
  | "resume"
  | "completed"
  | "question"
  | "reply"
  | "approval_request"
  | "approval_granted";
export type MediaKind = "image" | "video" | "doc";
export type PublishStatus = "draft" | "scheduled" | "published";
export type CategoryKind = "product" | "accessory" | "blog";

/* ---- weaving specification ---- */
export type Gender = "man" | "woman";
export type GarmentType = "3_pieces" | "dansikran";
export type ThreadType = "silk" | "rayon";
export type OmbreScope = "plain" | "design" | "both";
export type MediaPurpose = "progress" | "inspiration" | "embroidery_symbol";
export type ApprovalStatus = "pending" | "approved";

export interface OmbreColor {
  color: string;
  percentage: number;
}

/** Detailed weaving brief captured when a project is assigned. */
export interface ProjectSpec {
  design_yards: number | null;
  plain_yards: number | null;
  gender: Gender | null;
  garment_type: GarmentType | null; // women only
  has_border: boolean;
  has_shimmers: boolean;
  shimmer_colors: string[]; // e.g. Gold, Silver, Green
  thread_type: ThreadType | null;
  is_ombre: boolean;
  ombre_scope: OmbreScope | null; // which weave transitions
  ombre_colors: OmbreColor[];
  has_embroidery: boolean;
}

/** Client sign-off gates. Weaving cannot proceed until both are approved. */
export interface ProjectApprovals {
  thread: ApprovalStatus;
  thread_at: string | null;
  pattern: ApprovalStatus;
  pattern_at: string | null;
}

export interface ClientRow {
  id: string;
  profile_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  notes: string | null;
  created_at: string;
}

export interface StageRow {
  id: string;
  name: string;
  position: number;
  is_active: boolean;
}

export interface ProjectRow {
  id: string;
  reference: string;
  title: string;
  client_id: string;
  weaver_id: string | null;
  pattern: string | null;
  measurements: Record<string, unknown>;
  thread_colors: string[];
  accessories: unknown[];
  quantity: number;
  priority: Priority;
  current_stage_id: string | null;
  progress_pct: number;
  est_start: string | null;
  est_completion: string | null;
  actual_completion: string | null;
  design_notes: string | null;
  delivery_status: DeliveryStatus;
  payment_status: PaymentStatus;
  is_paused: boolean;
  /** detailed weaving brief (optional; normalise with getSpec) */
  spec?: ProjectSpec | null;
  /** client sign-off gates (optional; normalise with getApprovals) */
  approvals?: ProjectApprovals | null;
  created_at: string;
  updated_at: string;
  /* joined */
  client?: { name: string; email: string | null };
  weaver?: { full_name: string };
  stage?: { name: string };
}

export interface UpdateRow {
  id: string;
  project_id: string;
  author_id: string;
  type: UpdateType;
  stage_id: string | null;
  progress_pct: number | null;
  body: string | null;
  new_est_completion: string | null;
  parent_update_id: string | null;
  created_at: string;
  /* joined */
  author?: { full_name: string; role: UserRole };
  media?: MediaRow[];
}

export interface WorkLogRow {
  id: string;
  project_id: string;
  weaver_id: string;
  log_date: string;
  hours_worked: number | null;
  progress_made: string | null;
  materials_used: string | null;
  challenges: string | null;
  notes: string | null;
  created_at: string;
}

export interface MediaRow {
  id: string;
  project_id: string;
  update_id: string | null;
  work_log_id: string | null;
  storage_path: string;
  kind: MediaKind;
  caption: string | null;
  uploaded_by: string | null;
  /** what the attachment is for — progress photos vs assignment references */
  purpose?: MediaPurpose;
  created_at: string;
  /** resolved display URL (signed URL in real mode, direct path in demo) */
  url?: string;
}

export interface ProductImageRow {
  id: string;
  product_id: number;
  src: string;
  alt: string | null;
  position: number;
  role?: "primary" | "gallery" | "hover";
}

export interface ProductVariationRow {
  id: string;
  product_id: number;
  attributes: Record<string, unknown>;
  prices: Record<string, unknown>;
}

export interface ProductRow {
  id: number;
  slug: string;
  name: string;
  type: string;
  categories: string[];
  tags: string[];
  colors: string[];
  is_accessory: boolean;
  is_featured: boolean;
  stock_text: string;
  prices: Record<string, unknown>;
  short_description: string | null;
  description: string | null;
  seo: Record<string, unknown>;
  status: PublishStatus;
  sort: number;
  created_at?: string;
  updated_at?: string;
  images?: ProductImageRow[];
  variations?: ProductVariationRow[];
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  kind: CategoryKind;
  position: number;
  image_url?: string | null;
}

export interface BlogPostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  status: PublishStatus;
  publish_at: string | null;
  seo: Record<string, unknown>;
  author_id: string | null;
  created_at: string;
  updated_at?: string;
}

export interface LibraryAssetRow {
  id: string;
  storage_path: string;
  kind: MediaKind;
  title: string | null;
  alt: string | null;
  caption?: string | null;
  description?: string | null;
  folder: string;
  size_bytes: number | null;
  uploaded_by: string | null;
  created_at: string;
  exclude_from_sitemap?: boolean;
  url?: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: { project_id?: string; update_id?: string };
  read_at: string | null;
  created_at: string;
}

export type MessageAudience = "user" | "clients" | "weavers" | "all";

export interface MessageRow {
  id: string;
  project_id: string | null;
  sender_id: string;
  recipient_id: string | null;
  audience: MessageAudience;
  body: string;
  created_at: string;
  /* joined */
  sender?: { full_name: string; role: UserRole };
  recipient?: { full_name: string } | null;
}

export interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

/**
 * Weaver onboarding profile. Client-visible fields: full_name (from profile),
 * years_experience, specialties, bio, portrait_url. The rest (address,
 * phone, id_number, emergency_contact) are admin-only.
 */
export interface WeaverProfileRow {
  profile_id: string;
  years_experience: number | null;
  specialties: string[]; // types of weaving mastered
  bio: string | null;
  portrait_url: string | null;
  hometown: string | null;
  languages: string[];
  loom_count: number;
  occupied_looms: number;
  avg_weaving_hours_per_day: number | null;
  avg_days_per_cloth: number | null;
  queue_length: number;
  unavailable_until: string | null;
  availability_note: string | null;
  reliability_score: number;
  quality_score: number;
  // admin-only:
  address: string | null;
  id_number: string | null;
  emergency_contact: string | null;
  /* joined */
  profile?: { full_name: string; email: string; phone: string | null; status: UserStatus };
}

/** Computed weaver performance snapshot (not stored — derived from projects). */
export interface WeaverPerformance {
  completed: number;
  active: number;
  onTime: number;
  thisYear: number;
  score: number; // 0–100
  onTimeRate: number; // 0–100
}
