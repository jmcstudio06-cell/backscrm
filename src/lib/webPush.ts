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

function toUint8Array(key: BufferSource): Uint8Array {
  return key instanceof Uint8Array ? key : new Uint8Array(key as ArrayBuffer);
}

function uint8ArraysEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

async function getVapidPublicKey(): Promise<string> {
  const CACHE_KEY = "push_vapid_public_key";
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) return cached;

  console.log("[WebPush] Fetching new VAPID key...");
  const { data, error } = await supabase.functions.invoke("get-vapid-key");
  if (error) throw error;

  const publicKey = (data as { publicKey?: string } | null)?.publicKey;
  if (!publicKey) throw new Error("VAPID public key not available");

  localStorage.setItem(CACHE_KEY, publicKey);
  return publicKey;
}

export async function ensurePushServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker not supported");
  }

  const registration = await navigator.serviceWorker.register("/sw.js?v=6", { scope: "/" });

  // Força buscar versão nova do SW (evita SW “preso”)
  try {
    await registration.update();
  } catch {
    // ignore
  }

  await navigator.serviceWorker.ready;
  return registration;
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  return (reg as any).pushManager.getSubscription();
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

  // Get current user to include in cache key (prevents cross-user caching)
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "anonymous";

  const CACHE_KEY = `push_last_synced_${userId}`;
  const currentSyncData = JSON.stringify({ endpoint, p256dh, auth });
  const lastSyncedData = localStorage.getItem(CACHE_KEY);

  if (lastSyncedData === currentSyncData) {
    console.log("[WebPush] Subscription already synced for this user, skipping.");
    return;
  }

  console.log("[WebPush] Syncing subscription with backend...");
  const { error } = await supabase.functions.invoke("upsert-push-subscription", {
    body: { endpoint, p256dh, auth },
  });

  if (error) throw error;

  localStorage.setItem(CACHE_KEY, currentSyncData);
}

export async function subscribeToWebPush(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (!("serviceWorker" in navigator)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const reg = await ensurePushServiceWorker();
  const publicKey = await getVapidPublicKey();
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  const existing = await (reg as any).pushManager.getSubscription();

  if (existing) {
    const existingKey = existing.options?.applicationServerKey;
    const keysMatch = existingKey ? uint8ArraysEqual(toUint8Array(existingKey), applicationServerKey) : false;

    if (keysMatch) {
      await upsertSubscriptionOnBackend(existing);
      return true;
    }

    console.log("VAPID key mismatch, re-subscribing...");
    try {
      await existing.unsubscribe();
    } catch {
      // ignore
    }
  }

  const sub = await (reg as any).pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  await upsertSubscriptionOnBackend(sub);
  return true;
}

export async function unsubscribeFromWebPush(): Promise<void> {
  const sub = await getExistingPushSubscription();
  if (!sub) return;

  const json = sub.toJSON() as PushSubscriptionJson;

  try {
    await sub.unsubscribe();
  } catch {
    // ignore
  }

  // Mark as inactive on backend (best-effort)
  if (json.endpoint) {
    await supabase.functions.invoke("upsert-push-subscription", {
      body: { endpoint: json.endpoint, is_active: false },
    });
  }
}
