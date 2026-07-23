// Create a staff user (weaver, editor, content manager, admin).
// Only super_admins may create admins; admins may create the rest.
//
// Deploy: supabase functions deploy admin-create-user
// Requires secret SITE_URL in addition to the auto-provided service role.

import { createClient } from "npm:@supabase/supabase-js@2";

const CREATABLE = ["weaver", "editor", "content_manager", "admin"] as const;
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: caller } = await admin.auth.getUser(jwt);
    if (!caller.user) {
      return json({ error: "Not signed in" }, 401);
    }
    const { data: callerProfile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", caller.user.id)
      .single();
    if (profileError) throw profileError;

    const { email, full_name, role } = await req.json();
    if (!email?.trim() || !full_name?.trim()) {
      return json({ error: "Full name and email are required" }, 400);
    }
    if (!CREATABLE.includes(role)) {
      return json({ error: "Invalid role" }, 400);
    }
    const callerRole = callerProfile?.role;
    const allowed =
      callerRole === "super_admin" ||
      (callerRole === "admin" && role !== "admin");
    if (!allowed) {
      return json({ error: "Not authorized" }, 403);
    }

    const siteUrl = Deno.env.get("SITE_URL") ?? "https://hinkrokente.com";
    const portalUrl =
      Deno.env.get("PORTAL_URL") ?? new URL("/portal/", siteUrl).toString();
    const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(
      email.trim().toLowerCase(),
      { redirectTo: portalUrl, data: { full_name: full_name.trim() } },
    );
    if (error) throw error;

    const { error: updateError } = await admin
      .from("profiles")
      .update({ role, full_name: full_name.trim() })
      .eq("id", invited.user.id);
    if (updateError) throw updateError;

    return json({ ok: true, user_id: invited.user.id });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : String(err) },
      500,
    );
  }
});
