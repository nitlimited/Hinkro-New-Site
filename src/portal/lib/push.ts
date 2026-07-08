/**
 * Web Push subscription management.
 * Real mode: subscribes via the service worker with the VAPID public key and
 * stores the subscription in Supabase; the send-push edge function delivers.
 * Demo mode: requests permission and shows a local sample notification.
 */

import { supabase, isSupabaseConfigured } from "./supabaseClient";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as
  | string
  | undefined;

export function pushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function enablePush(userId: string): Promise<
  { ok: true; demo?: boolean } | { ok: false; reason: string }
> {
  if (!("Notification" in window)) {
    return { ok: false, reason: "This browser does not support notifications." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "Notification permission was not granted." };
  }

  if (!isSupabaseConfigured) {
    // Demo: show what a push will look like.
    new Notification("Hinkro Kente Studio", {
      body: "Notifications are working! You'll be alerted like this when your project has news.",
      icon: "/icons/icon-192.png",
    });
    return { ok: true, demo: true };
  }

  if (!pushSupported()) {
    return { ok: false, reason: "This browser does not support push." };
  }
  if (!VAPID_PUBLIC_KEY) {
    return {
      ok: false,
      reason:
        "Push keys are not configured (VITE_VAPID_PUBLIC_KEY). In-app notifications still work.",
    };
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
  });

  const json = subscription.toJSON();
  const { error } = await supabase!
    .from("push_subscriptions")
    .upsert(
      { user_id: userId, endpoint: json.endpoint!, keys: json.keys ?? {} },
      { onConflict: "endpoint" },
    );
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

export async function disablePush(): Promise<void> {
  if (!pushSupported()) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  if (isSupabaseConfigured && supabase) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", subscription.endpoint);
  }
  await subscription.unsubscribe();
}
