// Deliver Web Push for new notifications.
// Wire this up as a Database Webhook in Supabase:
//   table: notifications, event: INSERT, type: HTTP request →
//   POST https://<project>.supabase.co/functions/v1/send-push
//
// Secrets required:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  (npx web-push generate-vapid-keys)
//   VAPID_SUBJECT                        (mailto:hello@hinkrokente.com)

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

Deno.serve(async (req) => {
  try {
    webpush.setVapidDetails(
      Deno.env.get("VAPID_SUBJECT") ?? "mailto:hello@hinkrokente.com",
      Deno.env.get("VAPID_PUBLIC_KEY")!,
      Deno.env.get("VAPID_PRIVATE_KEY")!,
    );

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const payload = await req.json();
    const notification = payload.record; // database webhook shape
    if (!notification?.user_id) {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 });
    }

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("*")
      .eq("user_id", notification.user_id);

    const body = JSON.stringify({
      title: notification.title,
      body: notification.body ?? "",
      data: notification.data ?? {},
    });

    let sent = 0;
    for (const sub of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          body,
        );
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          // subscription expired — clean it up
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
        }
      }
    }

    return new Response(JSON.stringify({ sent }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500 },
    );
  }
});
