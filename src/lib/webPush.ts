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
  const { data, error } = await supabase.functions.invoke("get-vapid-key");
  if (error) throw error;

  const publicKey = (data as { publicKey?: string } | null)?.publicKey;
  if (!publicKey) throw new Error("VAPID public key not available");
  return publicKey;
}

export async function ensurePushServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    t
