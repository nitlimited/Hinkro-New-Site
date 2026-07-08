/**
 * Data layer for the portal. Every hook/mutation works in two modes:
 *  - real: Supabase queries guarded by RLS (when env vars are configured)
 *  - demo: in-memory sample store, so preview mode is fully interactive
 */

import { useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "./supabaseClient";
import type { UserRole } from "../types";
import type {
  ClientRow,
  MediaRow,
  MessageAudience,
  MessageRow,
  NotificationRow,
  ProfileRow,
  ProjectRow,
  StageRow,
  UpdateRow,
  UpdateType,
  WorkLogRow,
  Priority,
} from "./rows";
import {
  demoClients,
  demoId,
  demoIdentity,
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

export function useStages(): StageRow[] {
  const [rows, setRows] = useState<StageRow[]>(demoStages);
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase
      .from("workflow_stages")
      .select("*")
      .eq("is_active", true)
      .order("position")
      .then(({ data }) => data && setRows(data as StageRow[]));
  }, []);
  return rows;
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
    (input.files ?? []).forEach((file) => {
      const url = URL.createObjectURL(file);
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
    });
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
