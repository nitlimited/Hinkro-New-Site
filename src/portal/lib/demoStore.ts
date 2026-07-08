/**
 * In-memory sample database powering preview/demo mode. Mutations work, so
 * the whole core loop can be exercised before the real backend is connected.
 * State resets on page reload — by design.
 */

import type {
  ClientRow,
  MediaRow,
  NotificationRow,
  ProfileRow,
  ProjectRow,
  StageRow,
  UpdateRow,
  WorkLogRow,
} from "./rows";

const now = Date.now();
const daysAgo = (d: number, h = 10) =>
  new Date(now - d * 86400000 - h * 3600000).toISOString();
const daysAhead = (d: number) =>
  new Date(now + d * 86400000).toISOString().slice(0, 10);

let seq = 100;
export const demoId = (prefix: string) => `${prefix}-${++seq}`;

/* ---------- fixtures ---------- */

export const demoStages: StageRow[] = [
  "Order Received",
  "Materials Prepared",
  "Loom Preparation",
  "Thread Setup",
  "Weaving Started",
  "Weaving in Progress",
  "Design Verification",
  "Quality Inspection",
  "Finishing",
  "Packaging",
  "Ready for Delivery",
  "Completed",
].map((name, i) => ({
  id: `stage-${i + 1}`,
  name,
  position: i + 1,
  is_active: true,
}));

const stageId = (name: string) =>
  demoStages.find((s) => s.name === name)!.id;

export const demoProfiles: ProfileRow[] = [
  {
    id: "demo-user",
    full_name: "Demo User",
    email: "demo@hinkrokente.com",
    phone: null,
    role: "admin",
    status: "active",
    created_at: daysAgo(60),
  },
  {
    id: "weaver-1",
    full_name: "Kwabena Owusu",
    email: "kwabena@hinkrokente.com",
    phone: "+233 20 111 2222",
    role: "weaver",
    status: "active",
    created_at: daysAgo(50),
  },
  {
    id: "weaver-2",
    full_name: "Yaw Asare",
    email: "yaw@hinkrokente.com",
    phone: "+233 24 333 4444",
    role: "weaver",
    status: "active",
    created_at: daysAgo(48),
  },
  {
    id: "client-1",
    full_name: "Deborah Adjei",
    email: "deborah@example.com",
    phone: "+233 55 555 6666",
    role: "client",
    status: "active",
    created_at: daysAgo(12),
  },
];

export const demoClients: ClientRow[] = [
  {
    id: "cl-1",
    profile_id: "client-1",
    name: "Deborah Adjei",
    email: "deborah@example.com",
    phone: "+233 55 555 6666",
    country: "Ghana",
    notes: "Wedding in late July — colours must match the invitation suite.",
    created_at: daysAgo(12),
  },
  {
    id: "cl-2",
    profile_id: null,
    name: "Jeffery Boateng",
    email: "jeffery@example.com",
    phone: null,
    country: "United Kingdom",
    notes: null,
    created_at: daysAgo(9),
  },
  {
    id: "cl-3",
    profile_id: null,
    name: "Nana Akoto",
    email: "nana@example.com",
    phone: "+233 27 777 8888",
    country: "Ghana",
    notes: "Koforidua Technical University — batch order contact.",
    created_at: daysAgo(20),
  },
];

export const demoProjects: ProjectRow[] = [
  {
    id: "pr-1",
    reference: "HK-2026-0041",
    title: "Wedding Kente — gold & royal blue",
    client_id: "cl-1",
    weaver_id: "weaver-1",
    pattern: "Adweneasa",
    measurements: { note: "12 yards, standard adult width" },
    thread_colors: ["Gold", "Royal Blue", "Ivory"],
    accessories: ["Bridal hand fan", "Garment bag"],
    quantity: 1,
    priority: "high",
    current_stage_id: stageId("Weaving in Progress"),
    progress_pct: 65,
    est_start: daysAgo(7).slice(0, 10),
    est_completion: daysAhead(16),
    actual_completion: null,
    design_notes:
      "Client wants the Adweneasa motif dense at the borders, lighter toward the centre panels.",
    delivery_status: "pending",
    payment_status: "partial",
    is_paused: false,
    created_at: daysAgo(12),
    updated_at: daysAgo(0, 2),
  },
  {
    id: "pr-2",
    reference: "HK-2026-0042",
    title: "Engagement Kente — emerald & silver",
    client_id: "cl-2",
    weaver_id: "weaver-2",
    pattern: "Sika Futuro",
    measurements: { note: "8 yards" },
    thread_colors: ["Emerald", "Silver", "White"],
    accessories: [],
    quantity: 1,
    priority: "normal",
    current_stage_id: stageId("Thread Setup"),
    progress_pct: 20,
    est_start: daysAgo(4).slice(0, 10),
    est_completion: daysAhead(25),
    actual_completion: null,
    design_notes: null,
    delivery_status: "pending",
    payment_status: "unpaid",
    is_paused: false,
    created_at: daysAgo(9),
    updated_at: daysAgo(1),
  },
  {
    id: "pr-3",
    reference: "HK-2026-0043",
    title: "Graduation stole batch — KTU",
    client_id: "cl-3",
    weaver_id: "weaver-1",
    pattern: "Custom lettering",
    measurements: { note: "72in x 5in, 25 pieces" },
    thread_colors: ["Black", "Gold", "Green"],
    accessories: [],
    quantity: 25,
    priority: "urgent",
    current_stage_id: stageId("Quality Inspection"),
    progress_pct: 90,
    est_start: daysAgo(18).slice(0, 10),
    est_completion: daysAhead(4),
    actual_completion: null,
    design_notes: "Each stole carries the graduate's embroidered name.",
    delivery_status: "pending",
    payment_status: "paid",
    is_paused: false,
    created_at: daysAgo(20),
    updated_at: daysAgo(0, 5),
  },
];

export const demoMedia: MediaRow[] = [
  {
    id: "md-1",
    project_id: "pr-1",
    update_id: "up-4",
    work_log_id: null,
    storage_path: "/images/inspiring-tradition-carousel-craftmanship.jpg",
    kind: "image",
    caption: "Border motif taking shape",
    uploaded_by: "weaver-1",
    created_at: daysAgo(0, 3),
    url: "/images/inspiring-tradition-carousel-craftmanship.jpg",
  },
  {
    id: "md-2",
    project_id: "pr-1",
    update_id: "up-4",
    work_log_id: null,
    storage_path: "/images/bespoke-kente-weaving-services-hinkro-kente-loom.jpg",
    kind: "image",
    caption: "Panels on the loom",
    uploaded_by: "weaver-1",
    created_at: daysAgo(0, 3),
    url: "/images/bespoke-kente-weaving-services-hinkro-kente-loom.jpg",
  },
  {
    id: "md-3",
    project_id: "pr-1",
    update_id: "up-2",
    work_log_id: null,
    storage_path: "/images/hinkro-kente-design-process-sketch.png",
    kind: "image",
    caption: "Approved design sketch",
    uploaded_by: "demo-user",
    created_at: daysAgo(11),
    url: "/images/hinkro-kente-design-process-sketch.png",
  },
];

export const demoUpdates: UpdateRow[] = [
  {
    id: "up-1",
    project_id: "pr-1",
    author_id: "demo-user",
    type: "note",
    stage_id: stageId("Order Received"),
    progress_pct: 0,
    body: "Project created. Welcome, Deborah! Your bespoke wedding Kente order is confirmed.",
    new_est_completion: null,
    parent_update_id: null,
    created_at: daysAgo(12),
    author: { full_name: "Ama Serwaa", role: "admin" },
  },
  {
    id: "up-2",
    project_id: "pr-1",
    author_id: "demo-user",
    type: "media",
    stage_id: null,
    progress_pct: null,
    body: "Design sketch approved by the studio.",
    new_est_completion: null,
    parent_update_id: null,
    created_at: daysAgo(11),
    author: { full_name: "Ama Serwaa", role: "admin" },
  },
  {
    id: "up-3",
    project_id: "pr-1",
    author_id: "weaver-1",
    type: "status_change",
    stage_id: stageId("Weaving Started"),
    progress_pct: 35,
    body: "Threads are on the loom — weaving has begun.",
    new_est_completion: null,
    parent_update_id: null,
    created_at: daysAgo(7),
    author: { full_name: "Kwabena Owusu", role: "weaver" },
  },
  {
    id: "up-4",
    project_id: "pr-1",
    author_id: "weaver-1",
    type: "progress",
    stage_id: stageId("Weaving in Progress"),
    progress_pct: 65,
    body: "Past the halfway mark. The Adweneasa border is coming out beautifully — see the photos.",
    new_est_completion: null,
    parent_update_id: null,
    created_at: daysAgo(0, 3),
    author: { full_name: "Kwabena Owusu", role: "weaver" },
  },
  {
    id: "up-5",
    project_id: "pr-3",
    author_id: "weaver-1",
    type: "progress",
    stage_id: stageId("Quality Inspection"),
    progress_pct: 90,
    body: "All 25 stoles woven; checking embroidered names against the graduate list.",
    new_est_completion: null,
    parent_update_id: null,
    created_at: daysAgo(0, 5),
    author: { full_name: "Kwabena Owusu", role: "weaver" },
  },
];

export const demoWorkLogs: WorkLogRow[] = [
  {
    id: "wl-1",
    project_id: "pr-1",
    weaver_id: "weaver-1",
    log_date: daysAgo(1).slice(0, 10),
    hours_worked: 6.5,
    progress_made: "Completed second border panel",
    materials_used: "Gold and royal blue silk-blend thread",
    challenges: "Humidity affecting thread tension in the afternoon",
    notes: null,
    created_at: daysAgo(1),
  },
  {
    id: "wl-2",
    project_id: "pr-1",
    weaver_id: "weaver-1",
    log_date: daysAgo(0).slice(0, 10),
    hours_worked: 5,
    progress_made: "Centre panel underway, 65% overall",
    materials_used: "Ivory accent thread",
    challenges: null,
    notes: "Photos uploaded for the client.",
    created_at: daysAgo(0, 3),
  },
];

export const demoNotifications: NotificationRow[] = [
  {
    id: "nt-1",
    user_id: "demo-user",
    type: "progress",
    title: "Update on HK-2026-0041",
    body: "Past the halfway mark. The Adweneasa border is coming out beautifully.",
    data: { project_id: "pr-1", update_id: "up-4" },
    read_at: null,
    created_at: daysAgo(0, 3),
  },
  {
    id: "nt-2",
    user_id: "demo-user",
    type: "progress",
    title: "Update on HK-2026-0043",
    body: "All 25 stoles woven; names being checked.",
    data: { project_id: "pr-3", update_id: "up-5" },
    read_at: daysAgo(0, 4),
    created_at: daysAgo(0, 5),
  },
];

/* ---------- tiny reactive store ---------- */

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeDemo(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitDemo() {
  persistDemo();
  listeners.forEach((fn) => fn());
}

/* ---------- session persistence ----------
   Keeps demo mutations alive across role switches (which reload the page),
   so the admin → weaver → client loop can be experienced end to end.
   Cleared when the browser tab closes. */

const PERSIST_KEY = "hinkro-demo-db";

function persistDemo() {
  try {
    sessionStorage.setItem(
      PERSIST_KEY,
      JSON.stringify({
        clients: demoClients,
        projects: demoProjects,
        updates: demoUpdates,
        workLogs: demoWorkLogs,
        media: demoMedia.filter((m) => !m.storage_path.startsWith("blob:")),
        notifications: demoNotifications,
        seq,
      }),
    );
  } catch {
    /* storage full or unavailable — demo simply won't persist */
  }
}

function hydrateDemo() {
  try {
    const raw = sessionStorage.getItem(PERSIST_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    demoClients.splice(0, demoClients.length, ...saved.clients);
    demoProjects.splice(0, demoProjects.length, ...saved.projects);
    demoUpdates.splice(0, demoUpdates.length, ...saved.updates);
    demoWorkLogs.splice(0, demoWorkLogs.length, ...saved.workLogs);
    demoMedia.splice(0, demoMedia.length, ...saved.media);
    demoNotifications.splice(0, demoNotifications.length, ...saved.notifications);
    if (typeof saved.seq === "number") seq = saved.seq;
  } catch {
    /* corrupted snapshot — fall back to fixtures */
  }
}

hydrateDemo();

/** Map the active demo role to the fixture identities used in queries. */
export function demoIdentity(role: string): {
  profileId: string;
  clientId: string | null;
} {
  if (role === "weaver") return { profileId: "weaver-1", clientId: null };
  if (role === "client") return { profileId: "client-1", clientId: "cl-1" };
  return { profileId: "demo-user", clientId: null };
}
