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

/** A real VAPID public key is an uncompressed P-256 point: 65 bytes starting with 0x04. */
function isValidVapidPublicKey(key: string): boolean {
  try {
    const bytes = urlBase64ToUint8Array(key);
    return bytes.length === 65 && bytes[0] === 0x04;
  } catch {
    return false;
  }
}

/**
 * Fetches the server key once per app session. It used to be cached in localStorage forever,
 * so a placeholder or rotated key stayed stuck on the device and push never recovered.
 */
async function getVapidPublicKey(): Promise<string> {
  const SESSION_KEY = "push_vapid_public_key";
  try {
    localStorage.removeItem(SESSION_KEY); // legacy permanent cache
  } catch {
    /* ignore */
  }

  const cached = sessionStorage.getItem(SESSION_KEY);
  if (cached && isValidVapidPublicKey(cached)) return cached;

  console.log("[WebPush] Fetching VAPID key...");
  const { data, error } = await supabase.functions.invoke("get-vapid-key");
  if (error) throw error;

  const publicKey = (data as { publicKey?: string } | null)?.publicKey?.trim();
  if (!publicKey || !isValidVapidPublicKey(publicKey)) {
    throw new Error("VAPID public key is missing or invalid on the server");
  }

  sessionStorage.setItem(SESSION_KEY, publicKey);
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

  // Get current user to include in cache key (prevents cross-user caching)
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || "anonymous";

  // Só evitamos reenvio DENTRO da mesma sessão do app. Um cache persistente
  // impedia reativar a inscrição quando o servidor a desativava (410 no iOS),
  // e o celular deixava de receber push para sempre.
  const CACHE_KEY = `push_last_synced_${userId}`;
  const currentSyncData = JSON.stringify({ endpoint, p256dh, auth });

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }

  if (sessionStorage.getItem(CACHE_KEY) === currentSyncData) {
    console.log("[WebPush] Subscription already synced in this session, skipping.");
    return;
  }

  console.log("[WebPush] Syncing subscription with backend...");
  const { error } = await supabase.functions.invoke("upsert-push-subscription", {
    body: { endpoint, p256dh, auth },
  });

  if (error) throw error;

  sessionStorage.setItem(CACHE_KEY, currentSyncData);
}

export async function subscribeToWebPush(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (!("serviceWorker" in navigator)) return false;

  // Never ask again when the browser already has a final answer. This function
  // is also called by the silent refresher on every new app session.
  const permission = Notification.permission === "default"
    ? await Notification.requestPermission()
    : Notification.permission;
  if (permission !== "granted") return false;

  const reg = await ensurePushServiceWorker();
  const publicKey = await getVapidPublicKey();
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  const existing = await reg.pushManager.getSubscription();

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
