// Invite a client to their project dashboard.
// Called by an admin after creating a client. Creates the client's
// auth user, links it to the clients row, and sends a Supabase invite email
// that lands them on /portal via the invitation link.
//
// Deploy: supabase functions deploy invite-client
// Requires secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (set automatically),
// and SITE_URL (e.g. https://hinkrokente.com).

import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify the caller is an admin.
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");
    const { data: caller } = await admin.auth.getUser(jwt);
    if (!caller.user) {
      return new Response(JSON.stringify({ error: "Not signed in" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const { data: callerProfile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", caller.user.id)
      .single();
    if (!callerProfile || !["super_admin", "admin"].includes(callerProfile.role)) {
      return new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 403,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const { client_id } = await req.json();
    const { data: client } = await admin
      .from("clients")
      .select("*")
      .eq("id", client_id)
      .single();
    if (!client?.email) {
      return new Response(JSON.stringify({ error: "Client has no email" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const siteUrl = Deno.env.get("SITE_URL") ?? "https://hinkrokente.com";
    const portalUrl = Deno.env.get("PORTAL_URL") ?? new URL("/portal/", siteUrl).toString();

    // Send the invitation (creates the auth user if needed).
    const { data: invited, error: inviteError } =
      await admin.auth.admin.inviteUserByEmail(client.email, {
        redirectTo: portalUrl,
        data: { full_name: client.name },
      });
    if (inviteError) throw inviteError;

    const userId = invited.user.id;

    // Link profile to the clients row and pin the role.
    const { data: authUser } = await admin.auth.admin.getUserById(userId);
    const acceptedAt = authUser.user?.email_confirmed_at ? new Date().toISOString() : null;

    await admin
      .from("profiles")
      .update({ role: "client", full_name: client.name })
      .eq("id", userId);
    await admin
      .from("clients")
      .update({
        profile_id: userId,
        invited_at: new Date().toISOString(),
        accepted_at: acceptedAt,
      })
      .eq("id", client_id);

    return new Response(JSON.stringify({ ok: true, user_id: userId }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: cors },
    );
  }
});
