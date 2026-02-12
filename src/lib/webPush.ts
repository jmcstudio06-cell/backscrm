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
  if (key instanceof Uint8Array) return key;
  // ArrayBuffer
  return new Uint8Array(key as ArrayBuffer);
}

function uint8ArraysEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
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

  // Se já existir registro, pega ele
  let registration = await navigator.serviceWorker.getRegistration("/");

  if (!registration) {
    registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } else {
    // Garante que está apontando pro SW certo e atualiza
    // (mesmo se o browser estiver segurando SW antigo)
    try {
      await registration.update();
    } catch {
      // ignorar falha de update (alguns browsers/estados)
    }
  }

  // Espera o SW ficar ready e tenta atualizar de novo (reduz casos de SW preso)
  await navigator.serviceWorker.ready;
  try {
    await registration.update();
  } catch {
    // ignore
  }

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

  // Importante: em iOS e alguns Androids precisa gesto do usuário mesmo
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  const reg = await ensurePushServiceWorker();

  // Algumas vezes o SW não controla a página ainda; isso ajuda a estabilizar
  // (não é obrigatório, mas evita estados estranhos após updates)
  try {
    await navigator.serviceWorker.ready;
  } catch {
    // ignore
  }

  const publicKey = await getVapidPublicKey();
  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  // Se existir subscription, valida se a chave VAPID bate.
  const existing = await reg.pushManager.getSubscription();

  if (existing) {
    const existingKey = existing.options?.applicationServerKey;

    // existingKey pode vir em formatos diferentes dependendo do browser
    const keysMatch = existingKey ? uint8ArraysEqual(toUint8Array(existingKey), applicationServerKey) : false;

    if (keysMatch) {
      // Re-sincroniza no backend (se o backend perdeu/limpou o registro)
      try {
        await upsertSubscriptionOnBackend(existing);
        return true;
      } catch (e) {
        // Se falhar aqui, pode ser que o backend esteja rejeitando endpoint antigo.
        // Tenta recriar a subscription do zero.
        try {
          await existing.unsubscribe();
        } catch {
          // ignore
        }
      }
    } else {
      // VAPID trocou ou subscription antiga -> recriar
      try {
        await existing.unsubscribe();
      } catch {
        // ignore
      }
    }
  }

  // Cria subscription nova
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  // Salva no backend
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

  // Marca como inativo no backend (best-effort)
  if (json.endpoint) {
    try {
      await supabase.functions.invoke("upsert-push-subscription", {
        body: { endpoint: json.endpoint, is_active: false },
      });
    } catch {
      // ignore
    }
  }
}
