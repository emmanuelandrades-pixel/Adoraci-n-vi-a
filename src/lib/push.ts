import { supabase } from "./supabase";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
}

export async function registrarSW(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  return navigator.serviceWorker.register("/sw.js");
}

export async function suscribirPush(): Promise<boolean> {
  try {
    const reg = await registrarSW();
    if (!reg) return false;

    await navigator.serviceWorker.ready;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY),
    });

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert({ subscription: sub.toJSON() }, { onConflict: "subscription" });

    if (error) console.error("Error guardando suscripción:", error);
    return !error;
  } catch (err) {
    console.error("Error suscribiendo push:", err);
    return false;
  }
}

export async function desuscribirPush(): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!reg) return;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  const json = JSON.stringify(sub.toJSON());
  await supabase.from("push_subscriptions").delete().eq("subscription->>endpoint", sub.endpoint);
  await sub.unsubscribe();
}

export async function estadoPermiso(): Promise<NotificationPermission | "unsupported"> {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}
