/**
 * Data layer for the portal. Every hook/mutation works in two modes:
 *  - real: Supabase queries guarded by RLS (when env vars are configured)
 *  - demo: in-memory sample store, so preview mode is fully interactive
 */

import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import type { UserRole } from "../types";
import type {
  BlogPostRow,
  CategoryKind,
  CategoryRow,
  ClientRow,
  LibraryAssetRow,
  MediaKind,
  MediaRow,
  MessageAudience,
  MessageRow,
  NotificationRow,
  ProfileRow,
  ProductImageRow,
  ProductRow,
  ProductVariationRow,
  ProjectRow,
  StageRow,
  UpdateRow,
  UpdateType,
  WorkLogRow,
  Priority,
} from "./rows";
import {
  demoClients,
  demoBlogPosts,
  demoCatalogProducts,
  demoCategories,
  demoId,
  demoIdentity,
  demoLibraryAssets,
  demoMedia,
  demoMessages,
  demoNotifications,
  demoProfiles,
  demoProjects,
  demoStages,
  demoUpdates,
  demoWorkLogs,
  emitDemo,
  subscribeDemo,
} from "./demoStore";

const PROJECT_SELECT = `*,
  client:clients(name,email),
  weaver:profiles!projects_weaver_id_fkey(full_name),
  stage:workflow_stages!projects_current_stage_id_fkey(name)`;

function decorateDemoProject(p: ProjectRow): ProjectRow {
  const client = demoClients.find((c) => c.id === p.client_id);
  const weaver = demoProfiles.find((w) => w.id === p.weaver_id);
  const stage = demoStages.find((s) => s.id === p.current_stage_id);
  return {
    ...p,
    client: client ? { name: client.name, email: client.email } : undefined,
    weaver: weaver ? { full_name: weaver.full_name } : undefined,
    stage: stage ? { name: stage.name } : undefined,
  };
}

/** Re-render helper: returns a counter that bumps on demo-store mutations. */
function useDemoVersion(active: boolean) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active) return;
    return subscribeDemo(() => setV((x) => x + 1));
  }, [active]);
  return v;
}

/* ================= queries ================= */

export function useStages(opts?: { includeInactive?: boolean }): StageRow[] {
  const demo = !isSupabaseConfigured;
  const demoV = useDemoVersion(demo);
  const [rows, setRows] = useState<StageRow[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (demo) {
      setRows(
        demoStages
          .filter((s) => opts?.includeInactive || s.is_active)
          .slice()
          .sort((a, b) => a.position - b.position),
      );
      return;
    }
    if (!supabase) return;
    let query = supabase.from("workflow_stages").select("*").order("position");
    if (!opts?.includeInactive) query = query.eq("is_active", true);
    query.then(({ data }) => data && setRows(data as StageRow[]));
    return subscribeStageRefresh(() => setRefreshKey((k) => k + 1));
  }, [demo, demoV, opts?.includeInactive, refreshKey]);

  return rows;
}

/* stage mutations notify all useStages instances in real mode */
const stageListeners = new Set<() => void>();
function subscribeStageRefresh(fn: () => void) {
  stageListeners.add(fn);
  return () => {
    stageListeners.delete(fn);
  };
}

export async function saveStage(
  input: Partial<StageRow> & { name: string },
): Promise<void> {
  if (!isSupabaseConfigured) {
    if (input.id) {
      const s = demoStages.find((x) => x.id === input.id);
      if (s) Object.assign(s, input);
    } else {
      demoStages.push({
        id: demoId("stage"),
        name: input.name,
        position: demoStages.length + 1,
        is_active: true,
      });
    }
    emitDemo();
    return;
  }
  if (input.id) {
    const { error } = await supabase!
      .from("workflow_stages")
      .update({
        name: input.name,
        ...(input.position != null ? { position: input.position } : {}),
        ...(input.is_active != null ? { is_active: input.is_active } : {}),
      })
      .eq("id", input.id);
    if (error) throw error;
  } else {
    const { data: last } = await supabase!
      .from("workflow_stages")
      .select("position")
      .order("position", { ascending: false })
      .limit(1)
      .single();
    const { error } = await supabase!.from("workflow_stages").insert({
      name: input.name,
      position: (last?.position ?? 0) + 1,
    });
    if (error) throw error;
  }
  stageListeners.forEach((fn) => fn());
}

export async function swapStagePositions(a: StageRow, b: StageRow): Promise<void> {
  if (!isSupabaseConfigured) {
    const sa = demoStages.find((x) => x.id === a.id);
    const sb = demoStages.find((x) => x.id === b.id);
    if (sa && sb) [sa.position, sb.position] = [sb.position, sa.position];
    emitDemo();
    return;
  }
  await supabase!.from("workflow_stages").update({ position: b.position }).eq("id", a.id);
  await supabase!.from("workflow_stages").update({ position: a.position }).eq("id", b.id);
  stageListeners.forEach((fn) => fn());
}

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
  actor?: { full_name: string } | null;
}

const demoAuditLogs: AuditLogRow[] = [
  { id: "au-1", actor_id: "demo-user", action: "update", entity_type: "projects", entity_id: "pr-1", created_at: new Date(Date.now() - 3 * 3600000).toISOString(), actor: { full_name: "Ama Serwaa (Demo)" } },
  { id: "au-2", actor_id: "weaver-1", action: "insert", entity_type: "project_updates", entity_id: "up-4", created_at: new Date(Date.now() - 4 * 3600000).toISOString(), actor: { full_name: "Kwabena Owusu" } },
  { id: "au-3", actor_id: "demo-user", action: "insert", entity_type: "products", entity_id: "4299", created_at: new Date(Date.now() - 26 * 3600000).toISOString(), actor: { full_name: "Ama Serwaa (Demo)" } },
  { id: "au-4", actor_id: "demo-user", action: "update", entity_type: "profiles", entity_id: "weaver-2", created_at: new Date(Date.now() - 50 * 3600000).toISOString(), actor: { full_name: "Ama Serwaa (Demo)" } },
];

export function useAuditLogs(): { logs: AuditLogRow[]; loading: boolean } {
  const demo = !isSupabaseConfigured;
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demo) {
      setLogs(demoAuditLogs);
      setLoading(false);
      return;
    }
    if (!supabase) return;
    supabase
      .from("audit_logs")
      .select("*, actor:profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setLogs((data as unknown as AuditLogRow[]) ?? []);
        setLoading(false);
      });
  }, [demo]);

  return { logs, loading };
}

export async function updateProfileFields(
  profileId: string,
  patch: { status?: "active" | "suspended"; role?: UserRole },
): Promise<void> {
  if (!isSupabaseConfigured) {
    const p = demoProfiles.find((x) => x.id === profileId);
    if (p) Object.assign(p, patch);
    emitDemo();
    return;
  }
  const { error } = await supabase!
    .from("profiles")
    .update(patch)
    .eq("id", profileId);
  if (error) throw error;
}

export function useProjects(opts: {
  role: UserRole;
  refreshKey?: number;
}): { projects: ProjectRow[]; loading: boolean } {
  const demo = !isSupabaseConfigured;
  const demoV = useDemoVersion(demo);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demo) {
      const { profileId, clientId } = demoIdentity(opts.role);
      let rows = demoProjects;
      if (opts.role === "weaver") {
        rows = rows.filter((p) => p.weaver_id === profileId);
      } else if (opts.role === "client") {
        rows = rows.filter((p) => p.client_id === clientId);
      }
      setProjects(rows.map(decorateDemoProject));
      setLoading(false);
      return;
    }
    if (!supabase) return;
    setLoading(true);
    // RLS already scopes rows per role; no client-side filter needed.
    supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProjects((data as unknown as ProjectRow[]) ?? []);
        setLoading(false);
      });
  }, [demo, demoV, opts.role, opts.refreshKey]);

  return { projects, loading };
}

export function useProject(projectId: string | undefined): {
  project: ProjectRow | null;
  updates: UpdateRow[];
  workLogs: WorkLogRow[];
  media: MediaRow[];
  loading: boolean;
  refresh: () => void;
} {
  const demo = !isSupabaseConfigured;
  const demoV = useDemoVersion(demo);
  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState<{
    project: ProjectRow | null;
    updates: UpdateRow[];
    workLogs: WorkLogRow[];
    media: MediaRow[];
    loading: boolean;
  }>({ project: null, updates: [], workLogs: [], media: [], loading: true });

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!projectId) return;

    if (demo) {
      const p = demoProjects.find((x) => x.id === projectId) ?? null;
      setState({
        project: p ? decorateDemoProject(p) : null,
        updates: demoUpdates
          .filter((u) => u.project_id === projectId)
          .map((u) => ({
            ...u,
            media: demoMedia.filter((m) => m.update_id === u.id),
          }))
          .sort((a, b) => b.created_at.localeCompare(a.created_at)),
        workLogs: demoWorkLogs
          .filter((w) => w.project_id === projectId)
          .sort((a, b) => b.log_date.localeCompare(a.log_date)),
        media: demoMedia.filter((m) => m.project_id === projectId),
        loading: false,
      });
      return;
    }

    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const [proj, ups, logs, med] = await Promise.all([
        supabase!.from("projects").select(PROJECT_SELECT).eq("id", projectId).single(),
        supabase!
          .from("project_updates")
          .select("*, author:profiles(full_name,role)")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
        supabase!
          .from("work_logs")
          .select("*")
          .eq("project_id", projectId)
          .order("log_date", { ascending: false }),
        supabase!
          .from("project_media")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;

      const mediaRows = ((med.data as MediaRow[]) ?? []).map((m) => ({ ...m }));
      // Resolve signed URLs for the private bucket.
      await Promise.all(
        mediaRows.map(async (m) => {
          const { data } = await supabase!.storage
            .from("project-media")
            .createSignedUrl(m.storage_path, 3600);
          m.url = data?.signedUrl;
        }),
      );

      const updates = ((ups.data as unknown as UpdateRow[]) ?? []).map((u) => ({
        ...u,
        media: mediaRows.filter((m) => m.update_id === u.id),
      }));

      setState({
        project: (proj.data as unknown as ProjectRow) ?? null,
        updates,
        workLogs: (logs.data as WorkLogRow[]) ?? [],
        media: mediaRows,
        loading: false,
      });
    })();

    // Realtime: refresh when new updates land on this project.
    const channel = supabase
      .channel(`project-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_updates",
          filter: `project_id=eq.${projectId}`,
        },
        () => setRefreshKey((k) => k + 1),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase?.removeChannel(channel);
    };
  }, [projectId, demo, demoV, refreshKey]);

  return { ...state, refresh };
}

export function useClients(): { clients: ClientRow[]; loading: boolean } {
  const demo = !isSupabaseConfigured;
  const demoV = useDemoVersion(demo);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demo) {
      setClients([...demoClients]);
      setLoading(false);
      return;
    }
    if (!supabase) return;
    supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setClients((data as ClientRow[]) ?? []);
        setLoading(false);
      });
  }, [demo, demoV]);

  return { clients, loading };
}

export function useTeam(): { team: ProfileRow[]; loading: boolean } {
  const demo = !isSupabaseConfigured;
  const demoV = useDemoVersion(demo);
  const [team, setTeam] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demo) {
      setTeam(demoProfiles.filter((p) => p.id !== "client-1"));
      setLoading(false);
      return;
    }
    if (!supabase) return;
    supabase
      .from("profiles")
      .select("*")
      .neq("role", "client")
      .order("created_at")
      .then(({ data }) => {
        setTeam((data as ProfileRow[]) ?? []);
        setLoading(false);
      });
  }, [demo, demoV]);

  return { team, loading };
}

export function useCatalogProducts(opts: {
  accessories?: boolean;
  refreshKey?: number;
} = {}): { products: ProductRow[]; loading: boolean } {
  const demo = !isSupabaseConfigured;
  const demoV = useDemoVersion(demo);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demo) {
      setProducts(
        demoCatalogProducts
          .filter((p) =>
            typeof opts.accessories === "boolean"
              ? p.is_accessory === opts.accessories
              : true,
          )
          .sort((a, b) => a.sort - b.sort),
      );
      setLoading(false);
      return;
    }
    if (!supabase) return;
    let query = supabase
      .from("products")
      .select("*, images:product_images(*), variations:product_variations(*)")
      .order("sort");
    if (typeof opts.accessories === "boolean") {
      query = query.eq("is_accessory", opts.accessories);
    }
    query.then(({ data }) => {
      setProducts((data as unknown as ProductRow[]) ?? []);
      setLoading(false);
    });
  }, [demo, demoV, opts.accessories, opts.refreshKey]);

  return { products, loading };
}

export function useCategories(kind?: CategoryKind): {
  categories: CategoryRow[];
  loading: boolean;
} {
  const demo = !isSupabaseConfigured;
  const demoV = useDemoVersion(demo);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demo) {
      setCategories(
        demoCategories
          .filter((c) => (kind ? c.kind === kind : true))
          .sort((a, b) => a.position - b.position),
      );
      setLoading(false);
      return;
    }
    if (!supabase) return;
    let query = supabase.from("categories").select("*").order("position");
    if (kind) query = query.eq("kind", kind);
    query.then(({ data }) => {
      setCategories((data as CategoryRow[]) ?? []);
      setLoading(false);
    });
  }, [demo, demoV, kind]);

  return { categories, loading };
}

export function useBlogPosts(): { posts: BlogPostRow[]; loading: boolean } {
  const demo = !isSupabaseConfigured;
  const demoV = useDemoVersion(demo);
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demo) {
      setPosts([...demoBlogPosts].sort((a, b) => b.created_at.localeCompare(a.created_at)));
      setLoading(false);
      return;
    }
    if (!supabase) return;
    supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data as BlogPostRow[]) ?? []);
        setLoading(false);
      });
  }, [demo, demoV]);

  return { posts, loading };
}

export function useLibraryAssets(): {
  assets: LibraryAssetRow[];
  loading: boolean;
} {
  const demo = !isSupabaseConfigured;
  const demoV = useDemoVersion(demo);
  const [assets, setAssets] = useState<LibraryAssetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demo) {
      setAssets([...demoLibraryAssets].sort((a, b) => b.created_at.localeCompare(a.created_at)));
      setLoading(false);
      return;
    }
    if (!supabase) return;
    supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = ((data as LibraryAssetRow[]) ?? []).map((asset) => ({
          ...asset,
          url: supabase!.storage.from("media-library").getPublicUrl(asset.storage_path).data.publicUrl,
        }));
        setAssets(rows);
        setLoading(false);
      });
  }, [demo, demoV]);

  return { assets, loading };
}

export function useNotifications(userId: string | undefined): {
  notifications: NotificationRow[];
  unread: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
} {
  const demo = !isSupabaseConfigured;
  const demoV = useDemoVersion(demo);
  const [rows, setRows] = useState<NotificationRow[]>([]);

  useEffect(() => {
    if (!userId) return;
    if (demo) {
      setRows(
        demoNotifications
          .slice()
          .sort((a, b) => b.created_at.localeCompare(a.created_at)),
      );
      return;
    }
    if (!supabase) return;

    const load = () =>
      supabase!
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50)
        .then(({ data }) => setRows((data as NotificationRow[]) ?? []));

    load();
    const channel = supabase
      .channel(`notif-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [userId, demo, demoV]);

  const markRead = useCallback(
    (id: string) => {
      if (demo) {
        const n = demoNotifications.find((x) => x.id === id);
        if (n && !n.read_at) {
          n.read_at = new Date().toISOString();
          emitDemo();
        }
        return;
      }
      supabase
        ?.from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id)
        .then(() =>
          setRows((prev) =>
            prev.map((n) =>
              n.id === id ? { ...n, read_at: new Date().toISOString() } : n,
            ),
          ),
        );
    },
    [demo],
  );

  const markAllRead = useCallback(() => {
    if (demo) {
      demoNotifications.forEach((n) => {
        if (!n.read_at) n.read_at = new Date().toISOString();
      });
      emitDemo();
      return;
    }
    supabase
      ?.from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null)
      .then(() =>
        setRows((prev) =>
          prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })),
        ),
      );
  }, [demo]);

  return {
    notifications: rows,
    unread: rows.filter((n) => !n.read_at).length,
    markRead,
    markAllRead,
  };
}

export function useMessages(role: UserRole, userId: string | undefined): {
  messages: MessageRow[];
  loading: boolean;
} {
  const demo = !isSupabaseConfigured;
  const demoV = useDemoVersion(demo);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    if (demo) {
      const { profileId } = demoIdentity(role);
      const isAdminRole = role === "super_admin" || role === "admin";
      setMessages(
        demoMessages
          .filter((m) => {
            if (isAdminRole) return true; // admins see everything they sent
            if (m.recipient_id === profileId) return true;
            if (m.audience === "all") return true;
            if (m.audience === "clients" && role === "client") return true;
            if (m.audience === "weavers" && role === "weaver") return true;
            return false;
          })
          .sort((a, b) => b.created_at.localeCompare(a.created_at)),
      );
      setLoading(false);
      return;
    }
    if (!supabase) return;

    const load = () =>
      supabase!
        .from("messages")
        .select(
          "*, sender:profiles!messages_sender_id_fkey(full_name,role), recipient:profiles!messages_recipient_id_fkey(full_name)",
        )
        .order("created_at", { ascending: false })
        .limit(100)
        .then(({ data }) => {
          setMessages((data as unknown as MessageRow[]) ?? []);
          setLoading(false);
        });

    load();
    const channel = supabase
      .channel(`messages-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [demo, demoV, role, userId]);

  return { messages, loading };
}

export interface SendMessageInput {
  audience: MessageAudience;
  recipient_id?: string;
  body: string;
  project_id?: string;
}

export async function sendMessage(
  input: SendMessageInput,
  sender: { id: string; full_name: string; role: UserRole },
): Promise<void> {
  if (!isSupabaseConfigured) {
    const recipient =
      input.recipient_id != null
        ? demoProfiles.find((p) => p.id === input.recipient_id)
        : null;
    demoMessages.unshift({
      id: demoId("ms"),
      project_id: input.project_id ?? null,
      sender_id: sender.id,
      recipient_id: input.recipient_id ?? null,
      audience: input.audience,
      body: input.body,
      created_at: new Date().toISOString(),
      sender: { full_name: sender.full_name, role: sender.role },
      recipient: recipient ? { full_name: recipient.full_name } : null,
    });
    // simulate the notification fan-out for the demo user's own feed
    demoNotifications.unshift({
      id: demoId("nt"),
      user_id: "demo-user",
      type: "message",
      title:
        input.audience === "user"
          ? "New message from Hinkro Kente"
          : "Announcement from Hinkro Kente",
      body: input.body.slice(0, 180),
      data: {},
      read_at: null,
      created_at: new Date().toISOString(),
    });
    emitDemo();
    return;
  }
  const { error } = await supabase!.from("messages").insert({
    audience: input.audience,
    recipient_id: input.recipient_id ?? null,
    body: input.body,
    project_id: input.project_id ?? null,
    sender_id: sender.id,
  });
  if (error) throw error;
}

/* ================= mutations ================= */

export interface CreateClientInput {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  notes?: string;
}

export async function createClient(input: CreateClientInput): Promise<ClientRow> {
  if (!isSupabaseConfigured) {
    const row: ClientRow = {
      id: demoId("cl"),
      profile_id: null,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      country: input.country || null,
      notes: input.notes || null,
      created_at: new Date().toISOString(),
    };
    demoClients.unshift(row);
    emitDemo();
    return row;
  }
  const { data, error } = await supabase!
    .from("clients")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as ClientRow;
}

export interface CreateProjectInput {
  title: string;
  client_id: string;
  weaver_id: string | null;
  pattern: string;
  measurements_note: string;
  thread_colors: string[];
  accessories: string[];
  quantity: number;
  priority: Priority;
  est_start: string | null;
  est_completion: string | null;
  design_notes: string;
}

export async function createProject(
  input: CreateProjectInput,
  authorId: string,
): Promise<ProjectRow> {
  const payload = {
    title: input.title,
    client_id: input.client_id,
    weaver_id: input.weaver_id,
    pattern: input.pattern || null,
    measurements: { note: input.measurements_note },
    thread_colors: input.thread_colors,
    accessories: input.accessories,
    quantity: input.quantity,
    priority: input.priority,
    est_start: input.est_start,
    est_completion: input.est_completion,
    design_notes: input.design_notes || null,
  };

  if (!isSupabaseConfigured) {
    const year = new Date().getFullYear();
    const nextNum = 44 + demoProjects.length - 2;
    const row: ProjectRow = {
      id: demoId("pr"),
      reference: `HK-${year}-${String(nextNum).padStart(4, "0")}`,
      ...payload,
      measurements: payload.measurements,
      current_stage_id: demoStages[0].id,
      progress_pct: 0,
      actual_completion: null,
      delivery_status: "pending",
      payment_status: "unpaid",
      is_paused: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoProjects.unshift(row);
    demoUpdates.push({
      id: demoId("up"),
      project_id: row.id,
      author_id: authorId,
      type: "note",
      stage_id: demoStages[0].id,
      progress_pct: 0,
      body: "Project created.",
      new_est_completion: null,
      parent_update_id: null,
      created_at: new Date().toISOString(),
      author: { full_name: "Ama Serwaa (Demo)", role: "admin" },
    });
    emitDemo();
    return decorateDemoProject(row);
  }

  const stage = await supabase!
    .from("workflow_stages")
    .select("id")
    .order("position")
    .limit(1)
    .single();

  const { data, error } = await supabase!
    .from("projects")
    .insert({ ...payload, current_stage_id: stage.data?.id, created_by: authorId })
    .select(PROJECT_SELECT)
    .single();
  if (error) throw error;

  await supabase!.from("project_updates").insert({
    project_id: (data as { id: string }).id,
    author_id: authorId,
    type: "note",
    stage_id: stage.data?.id,
    progress_pct: 0,
    body: "Project created.",
  });

  return data as unknown as ProjectRow;
}

export interface PostUpdateInput {
  project_id: string;
  type: UpdateType;
  body: string;
  progress_pct?: number;
  stage_id?: string;
  new_est_completion?: string;
  files?: File[];
  parent_update_id?: string;
}

export async function postUpdate(
  input: PostUpdateInput,
  author: { id: string; full_name: string; role: UserRole },
): Promise<void> {
  if (!isSupabaseConfigured) {
    const updateId = demoId("up");
    demoUpdates.push({
      id: updateId,
      project_id: input.project_id,
      author_id: author.id,
      type: input.type,
      stage_id: input.stage_id ?? null,
      progress_pct: input.progress_pct ?? null,
      body: input.body || null,
      new_est_completion: input.new_est_completion ?? null,
      parent_update_id: input.parent_update_id ?? null,
      created_at: new Date().toISOString(),
      author: { full_name: author.full_name, role: author.role },
    });
    for (const file of input.files ?? []) {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file for preview"));
        reader.readAsDataURL(file);
      });
      demoMedia.unshift({
        id: demoId("md"),
        project_id: input.project_id,
        update_id: updateId,
        work_log_id: null,
        storage_path: url,
        kind: file.type.startsWith("video") ? "video" : "image",
        caption: file.name,
        uploaded_by: author.id,
        created_at: new Date().toISOString(),
        url,
      });
    }
    const p = demoProjects.find((x) => x.id === input.project_id);
    if (p) {
      if (typeof input.progress_pct === "number") p.progress_pct = input.progress_pct;
      if (input.stage_id) p.current_stage_id = input.stage_id;
      if (input.type === "pause") p.is_paused = true;
      if (input.type === "resume") p.is_paused = false;
      if (input.type === "completed") {
        p.progress_pct = 100;
        p.actual_completion = new Date().toISOString().slice(0, 10);
      }
      if (input.new_est_completion) p.est_completion = input.new_est_completion;
      p.updated_at = new Date().toISOString();
    }
    // simulate the notification fan-out
    demoNotifications.unshift({
      id: demoId("nt"),
      user_id: "demo-user",
      type: input.type,
      title: `Update on ${p?.reference ?? "project"}`,
      body: input.body || null,
      data: { project_id: input.project_id, update_id: updateId },
      read_at: null,
      created_at: new Date().toISOString(),
    });
    emitDemo();
    return;
  }

  const { data: upd, error } = await supabase!
    .from("project_updates")
    .insert({
      project_id: input.project_id,
      author_id: author.id,
      type: input.type,
      stage_id: input.stage_id ?? null,
      progress_pct: input.progress_pct ?? null,
      body: input.body || null,
      new_est_completion: input.new_est_completion ?? null,
      parent_update_id: input.parent_update_id ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;

  for (const file of input.files ?? []) {
    const path = `${input.project_id}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
    const { error: upErr } = await supabase!.storage
      .from("project-media")
      .upload(path, file);
    if (upErr) throw upErr;
    await supabase!.from("project_media").insert({
      project_id: input.project_id,
      update_id: (upd as { id: string }).id,
      storage_path: path,
      kind: file.type.startsWith("video") ? "video" : "image",
      caption: file.name,
      uploaded_by: author.id,
    });
  }

  const projectPatch: Record<string, unknown> = {};
  if (typeof input.progress_pct === "number") projectPatch.progress_pct = input.progress_pct;
  if (input.stage_id) projectPatch.current_stage_id = input.stage_id;
  if (input.type === "pause") projectPatch.is_paused = true;
  if (input.type === "resume") projectPatch.is_paused = false;
  if (input.type === "completed") {
    projectPatch.progress_pct = 100;
    projectPatch.actual_completion = new Date().toISOString().slice(0, 10);
  }
  if (input.new_est_completion) projectPatch.est_completion = input.new_est_completion;
  if (Object.keys(projectPatch).length) {
    await supabase!.from("projects").update(projectPatch).eq("id", input.project_id);
  }
}

export interface WorkLogInput {
  project_id: string;
  log_date: string;
  hours_worked: number | null;
  progress_made: string;
  materials_used: string;
  challenges: string;
  notes: string;
}

export async function addWorkLog(
  input: WorkLogInput,
  weaverId: string,
): Promise<void> {
  if (!isSupabaseConfigured) {
    demoWorkLogs.unshift({
      id: demoId("wl"),
      project_id: input.project_id,
      weaver_id: weaverId,
      log_date: input.log_date,
      hours_worked: input.hours_worked,
      progress_made: input.progress_made || null,
      materials_used: input.materials_used || null,
      challenges: input.challenges || null,
      notes: input.notes || null,
      created_at: new Date().toISOString(),
    });
    emitDemo();
    return;
  }
  const { error } = await supabase!.from("work_logs").insert({
    ...input,
    progress_made: input.progress_made || null,
    materials_used: input.materials_used || null,
    challenges: input.challenges || null,
    notes: input.notes || null,
    weaver_id: weaverId,
  });
  if (error) throw error;
}

export async function updateProjectFields(
  projectId: string,
  patch: Partial<Pick<ProjectRow, "weaver_id" | "est_completion" | "priority" | "delivery_status">>,
): Promise<void> {
  if (!isSupabaseConfigured) {
    const p = demoProjects.find((x) => x.id === projectId);
    if (p) Object.assign(p, patch, { updated_at: new Date().toISOString() });
    emitDemo();
    return;
  }
  const { error } = await supabase!.from("projects").update(patch).eq("id", projectId);
  if (error) throw error;
}

export type ProductSaveInput = Partial<ProductRow> & {
  name: string;
  slug: string;
  is_accessory: boolean;
  images?: ProductImageRow[];
  variations?: ProductVariationRow[];
};

export async function saveProduct(input: ProductSaveInput): Promise<ProductRow> {
  const payload = {
    slug: input.slug,
    name: input.name,
    type: input.type ?? "simple",
    categories: input.categories ?? [],
    tags: input.tags ?? [],
    colors: input.colors ?? [],
    is_accessory: input.is_accessory,
    is_featured: input.is_featured ?? false,
    stock_text: input.stock_text ?? "In stock",
    prices: input.prices ?? {},
    short_description: input.short_description || null,
    description: input.description || null,
    seo: input.seo ?? {},
    status: input.status ?? "draft",
    sort: input.sort ?? 0,
  };

  if (!isSupabaseConfigured) {
    const existing = typeof input.id === "number"
      ? demoCatalogProducts.find((p) => p.id === input.id)
      : null;
    if (existing) {
      Object.assign(existing, payload, {
        images: input.images ?? existing.images ?? [],
        variations: input.variations ?? existing.variations ?? [],
        updated_at: new Date().toISOString(),
      });
      emitDemo();
      return existing;
    }
    const row: ProductRow = {
      id: Math.max(...demoCatalogProducts.map((p) => p.id), 0) + 1,
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: input.images ?? [],
      variations: input.variations ?? [],
    };
    demoCatalogProducts.unshift(row);
    emitDemo();
    return row;
  }

  const query = typeof input.id === "number"
    ? supabase!.from("products").update(payload).eq("id", input.id)
    : supabase!.from("products").insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw error;
  const row = data as ProductRow;
  if (input.images) {
    await supabase!.from("product_images").delete().eq("product_id", row.id);
    if (input.images.length > 0) {
      const { error: imageError } = await supabase!.from("product_images").insert(
        input.images.map((image, index) => ({
          product_id: row.id,
          src: image.src,
          alt: image.alt || input.name,
          position: index,
          role: image.role ?? (index === 0 ? "primary" : "gallery"),
        })),
      );
      if (imageError) throw imageError;
    }
  }
  if (input.variations) {
    await supabase!.from("product_variations").delete().eq("product_id", row.id);
    if (input.variations.length > 0) {
      const { error: variationError } = await supabase!.from("product_variations").insert(
        input.variations.map((variation) => ({
          product_id: row.id,
          attributes: variation.attributes ?? {},
          prices: variation.prices ?? {},
        })),
      );
      if (variationError) throw variationError;
    }
  }
  return row;
}

export async function deleteProduct(productId: number): Promise<void> {
  if (!isSupabaseConfigured) {
    const index = demoCatalogProducts.findIndex((p) => p.id === productId);
    if (index >= 0) demoCatalogProducts.splice(index, 1);
    emitDemo();
    return;
  }
  const { error } = await supabase!.from("products").delete().eq("id", productId);
  if (error) throw error;
}

export type BlogPostSaveInput = Partial<BlogPostRow> & {
  title: string;
  slug: string;
};

export async function saveBlogPost(
  input: BlogPostSaveInput,
  authorId: string,
): Promise<BlogPostRow> {
  const payload = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt || null,
    content: input.content || null,
    featured_image: input.featured_image || null,
    status: input.status ?? "draft",
    publish_at: input.publish_at || null,
    seo: input.seo ?? {},
    author_id: input.author_id ?? authorId,
  };

  if (!isSupabaseConfigured) {
    const existing = input.id ? demoBlogPosts.find((p) => p.id === input.id) : null;
    if (existing) {
      Object.assign(existing, payload, { updated_at: new Date().toISOString() });
      emitDemo();
      return existing;
    }
    const row: BlogPostRow = {
      id: demoId("bp"),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    demoBlogPosts.unshift(row);
    emitDemo();
    return row;
  }

  const query = input.id
    ? supabase!.from("blog_posts").update(payload).eq("id", input.id)
    : supabase!.from("blog_posts").insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data as BlogPostRow;
}

export async function deleteBlogPost(postId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const index = demoBlogPosts.findIndex((p) => p.id === postId);
    if (index >= 0) demoBlogPosts.splice(index, 1);
    emitDemo();
    return;
  }
  const { error } = await supabase!.from("blog_posts").delete().eq("id", postId);
  if (error) throw error;
}

export async function saveCategory(input: Partial<CategoryRow> & {
  name: string;
  slug: string;
  kind: CategoryKind;
}): Promise<CategoryRow> {
  const payload = {
    name: input.name,
    slug: input.slug,
    kind: input.kind,
    position: input.position ?? 0,
    image_url: input.image_url ?? null,
  };

  if (!isSupabaseConfigured) {
    const existing = input.id ? demoCategories.find((c) => c.id === input.id) : null;
    if (existing) {
      Object.assign(existing, payload);
      emitDemo();
      return existing;
    }
    const row: CategoryRow = { id: demoId("cat"), ...payload };
    demoCategories.push(row);
    emitDemo();
    return row;
  }

  const query = input.id
    ? supabase!.from("categories").update(payload).eq("id", input.id)
    : supabase!.from("categories").insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data as CategoryRow;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const index = demoCategories.findIndex((c) => c.id === categoryId);
    if (index >= 0) demoCategories.splice(index, 1);
    emitDemo();
    return;
  }
  const { error } = await supabase!.from("categories").delete().eq("id", categoryId);
  if (error) throw error;
}

export async function addLibraryAsset(input: {
  title: string;
  alt: string;
  caption?: string;
  description?: string;
  folder: string;
  kind: MediaKind;
  exclude_from_sitemap?: boolean;
  file?: File;
  storage_path?: string;
  uploaded_by?: string;
}): Promise<LibraryAssetRow> {
  if (!isSupabaseConfigured) {
    const url = input.file ? URL.createObjectURL(input.file) : input.storage_path || "";
    const row: LibraryAssetRow = {
      id: demoId("lib"),
      storage_path: url,
      kind: input.kind,
      title: input.title || input.file?.name || null,
      alt: input.alt || null,
      caption: input.caption || null,
      description: input.description || null,
      folder: input.folder || "",
      size_bytes: input.file?.size ?? null,
      exclude_from_sitemap: input.exclude_from_sitemap ?? false,
      uploaded_by: input.uploaded_by ?? null,
      created_at: new Date().toISOString(),
      url,
    };
    demoLibraryAssets.unshift(row);
    emitDemo();
    return row;
  }

  if (!input.file) {
    throw new Error("Choose a file to upload.");
  }
  const safeName = input.file.name.replace(/[^\w.\-]/g, "_");
  const path = `${input.folder || "uploads"}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase!.storage
    .from("media-library")
    .upload(path, input.file);
  if (uploadError) throw uploadError;
  const { data, error } = await supabase!
    .from("media_library")
    .insert({
      storage_path: path,
      kind: input.kind,
      title: input.title || input.file.name,
      alt: input.alt || null,
      caption: input.caption || null,
      description: input.description || null,
      folder: input.folder || "",
      size_bytes: input.file.size,
      exclude_from_sitemap: input.exclude_from_sitemap ?? false,
      uploaded_by: input.uploaded_by ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as LibraryAssetRow;
}

export async function updateLibraryAsset(
  id: string,
  patch: Partial<Pick<
    LibraryAssetRow,
    "title" | "alt" | "caption" | "description" | "folder" | "exclude_from_sitemap"
  >>,
): Promise<void> {
  if (!isSupabaseConfigured) {
    const asset = demoLibraryAssets.find((item) => item.id === id);
    if (asset) Object.assign(asset, patch);
    emitDemo();
    return;
  }
  const { error } = await supabase!.from("media_library").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteLibraryAsset(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const index = demoLibraryAssets.findIndex((item) => item.id === id);
    if (index >= 0) demoLibraryAssets.splice(index, 1);
    emitDemo();
    return;
  }
  const { error } = await supabase!.from("media_library").delete().eq("id", id);
  if (error) throw error;
}
