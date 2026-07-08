// Create a staff user (weaver, editor, content manager, admin).
// Only super_admins may create admins; admins may create the rest.
//
// Deploy: supabase functions deploy admin-create-user
// Requires secret SITE_URL in addition to the auto-provided service role.

import { createClient } from "npm:@supabase/supabase-js@2";

const CREATABLE = ["weaver", "editor", "content_manager", "admin"] as const;

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: caller } = await admin.auth.getUser(jwt);
    if (!caller.user) {
      return new Response(JSON.stringify({ error: "Not signed in" }), {
        status: 401,
        headers: cors,
      });
    }
    const { data: callerProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", caller.user.id)
      .single();

    const { email, full_name, role } = await req.json();
    if (!CREATABLE.includes(role)) {
      return new Response(JSON.stringify({ error: "Invalid role" }), {
        status: 400,
        headers: cors,
      });
    }
    const callerRole = callerProfile?.role;
    const allowed =
      callerRole === "super_admin" ||
      (callerRole === "admin" && role !== "admin");
    if (!allowed) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: cors,
      });
    }

    const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:5173";
    const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(
      email,
      { redirectTo: `${siteUrl}/portal`, data: { full_name } },
    );
    if (error) throw error;

    await admin
      .from("profiles")
      .update({ role, full_name })
      .eq("id", invited.user.id);

    return new Response(JSON.stringify({ ok: true, user_id: invited.user.id }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: cors },
    );
  }
});
