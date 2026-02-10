import { supabase } from "@/integrations/supabase/client";

type PushSubscriptionJson = {
  endpoint: string;
  expirationTime: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getVapidPublicKey(): Promise<string> {
  const { data, error } = await supabase.functions.invoke("get-vapid-key");
  if (error) throw error;
  const publicKey = (data as { publicKey?: string } | null)?.publicKey;
  if (!publicKey) throw new Error("VAPID public key not available");
  return publicKey;
}

export async function ensurePushServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker not supported");
  }

  // Register/update the SW that handles Push events
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  return registration;
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

export async function isWebPushSubscribed(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;
  const sub = await getExistingPushSubscription();
  return Boolean(sub);
}

async function upsertSubscriptionOnBackend(sub: PushSubscription) {
  const json = sub.toJSON() as PushSubscriptionJson;
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    throw new Error("Invalid push subscription keys");
  }

  const { error } = await supabase.functions.invoke("upsert-push-subscription", {
    body: { endpoint, p256dh, auth },
  });

  if (error) throw error;
}

export async function subscribeToWebPush(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (!("serviceWorker" in navigator)) return false;

  // Must run from a user gesture on iOS.
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const reg = await ensurePushServiceWorker();
  const publicKey = await getVapidPublicKey();
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  // If there's an existing subscription, check if it matches the current VAPID key.
  // If not, unsubscribe and create a fresh one.
  const existing = await reg.pushManager.getSubscription();
  if (existing) {
    const existingKey = existing.options?.applicationServerKey;
    let keysMatch = false;
    if (existingKey) {
      const existingArr = new Uint8Array(existingKey);
      keysMatch =
        existingArr.length === applicationServerKey.length &&
        existingArr.every((v, i) => v === applicationServerKey[i]);
    }
    if (keysMatch) {
      await upsertSubscriptionOnBackend(existing);
      return true;
    }
    // Key mismatch — unsubscribe old and create new
    console.log("VAPID key mismatch, re-subscribing...");
    await existing.unsubscribe();
  }

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  await upsertSubscriptionOnBackend(sub);
  return true;
}

export async function unsubscribeFromWebPush(): Promise<void> {
  const sub = await getExistingPushSubscription();
  if (!sub) return;
  await sub.unsubscribe();

  // Mark as inactive on backend (best-effort)
  const json = sub.toJSON() as PushSubscriptionJson;
  if (json.endpoint) {
    await supabase.functions.invoke("upsert-push-subscription", {
      body: { endpoint: json.endpoint, is_active: false },
    });
  }
}
