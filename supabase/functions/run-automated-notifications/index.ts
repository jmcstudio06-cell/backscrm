import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importJWK } from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const encoder = new TextEncoder();

// ---- Base64url helpers ----
function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Public key: 65-byte uncompressed P-256 point. Private key: 32 bytes. */
function hasValidVapidKeys(publicKeyB64: string, privateKeyB64: string): boolean {
  try {
    const pub = b64urlDecode(publicKeyB64.trim());
    const priv = b64urlDecode(privateKeyB64.trim());
    return pub.length === 65 && pub[0] === 0x04 && priv.length === 32;
  } catch {
    return false;
  }
}

function b64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function createVapidAuth(
  endpoint: string, subject: string, publicKeyB64: string, privateKeyB64: string,
): Promise<string> {
  const url = new URL(endpoint);
  const aud = url.origin;
  let sub = subject.replace(/[<>]/g, "").trim().replace(/\s+/g, "");
  if (!sub.startsWith("mailto:") && !sub.startsWith("http")) sub = `mailto:${sub}`;
  const pubRaw = b64urlDecode(publicKeyB64);
  const privRaw = b64urlDecode(privateKeyB64);
  const jwk = { kty: "EC" as const, crv: "P-256" as const, x: b64url(pubRaw.slice(1, 33)), y: b64url(pubRaw.slice(33, 65)), d: b64url(privRaw) };
  const key = await importJWK(jwk, "ES256");
  const jwt = await new SignJWT({}).setProtectedHeader({ alg: "ES256", typ: "JWT" }).setAudience(aud).setSubject(sub).setIssuedAt().setExpirationTime("1h").sign(key);
  return `vapid t=${jwt}, k=${publicKeyB64}`;
}

async function encryptPayload(payload: string, p256dhB64: string, authB64: string): Promise<Uint8Array> {
  const plaintext = encoder.encode(payload);
  const clientPubRaw = b64urlDecode(p256dhB64);
  const authSecret = b64urlDecode(authB64);
  const clientPubKey = await crypto.subtle.importKey("raw", clientPubRaw, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const localKeys = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const localPubRaw = new Uint8Array(await crypto.subtle.exportKey("raw", localKeys.publicKey));
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: clientPubKey }, localKeys.privateKey, 256));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const ikm = await hkdf(authSecret, sharedSecret, concat(encoder.encode("WebPush: info\0"), clientPubRaw, localPubRaw), 32);
  const cek = await hkdf(salt, ikm, encoder.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, encoder.encode("Content-Encoding: nonce\0"), 12);
  const padded = new Uint8Array([...plaintext, 2]);
  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM", length: 128 }, false, ["encrypt"]);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded));
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);
  const idlen = new Uint8Array([localPubRaw.length]);
  return concat(salt, rs, idlen, localPubRaw, ciphertext);
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const prkKey = await crypto.subtle.importKey("raw", salt, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", prkKey, ikm));
  const expandKey = await crypto.subtle.importKey("raw", prk, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expanded = new Uint8Array(await crypto.subtle.sign("HMAC", expandKey, new Uint8Array([...info, 1])));
  return expanded.slice(0, length);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { result.set(a, offset); offset += a.length; }
  return result;
}

async function sendPush(
  endpoint: string, p256dh: string, auth: string, payload: string,
  vapidPublicKey: string, vapidPrivateKey: string, vapidSubject: string,
): Promise<{ status: number; body: string }> {
  const authorization = await createVapidAuth(endpoint, vapidSubject, vapidPublicKey, vapidPrivateKey);
  const body = await encryptPayload(payload, p256dh, auth);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Crypto-Key": `p256ecdsa=${vapidPublicKey}`,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "3600",
    },
    body,
  });
  const resBody = await res.text();
  return { status: res.status, body: resBody };
}


/* =====================================================================================
 * ACCURACY RULES (every automated push)
 * 1. Each push goes ONLY to the user who owns the data, built from that user's own rows.
 * 2. Business rules mirror the screens the artist sees (Cobranças, Metas, Agenda), so the
 *    numbers in the push are the same numbers inside the app.
 * 3. Dates use the Brasília calendar. Show times combine date + start_time in São Paulo.
 * 4. A custom admin text is used only if every {placeholder} resolves for that user and it
 *    does not contradict the real data (e.g. "amanhã" when the show is today). Otherwise the
 *    built-in message, generated from the real data, is used.
 * 5. Each event is sent at most once per user (logged in user_notifications), so hourly runs,
 *    retries and "Testar Agora" never duplicate.
 * 6. When data is missing or inconsistent, the user is skipped. Silent is better than wrong.
 * ===================================================================================== */

import { AUTOMATIONS, deliver, type AutomationResult, type Ctx } from "./automations.ts";
import { brNow, DAY_MS } from "./rules.ts";

// ---- Main handler ----
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "";
    const supabase = createClient(supabaseUrl, serviceKey);

    // Only the scheduler (service key) or a signed-in admin may run automations.
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
    let authorized = token !== "" && token === serviceKey;
    if (!authorized && token) {
      const { data: userData } = await supabase.auth.getUser(token);
      if (userData?.user) {
        const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
        authorized = isAdmin === true;
      }
    }
    if (!authorized) return json({ error: "Unauthorized" }, 401);

    let automationKey: string | null = null;
    let dryRun = false;
    try {
      const body = await req.json();
      automationKey = typeof body?.automation_key === "string" ? body.automation_key : null;
      dryRun = body?.dry_run === true;
    } catch {
      // no body: scheduled run of all automations
    }

    if (!dryRun) {
      if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) throw new Error("VAPID env vars not configured");
      if (!hasValidVapidKeys(VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)) {
        throw new Error("VAPID keys are invalid (placeholder?). Set real VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY secrets.");
      }
      await supabase.rpc("cleanup_old_notifications");
    }

    let query = supabase.from("notification_settings").select("*");
    if (automationKey) query = query.eq("setting_key", automationKey);
    // Previews may be run for disabled automations, real sends never.
    if (!dryRun) query = query.eq("is_enabled", true);
    const { data: settings, error: settingsError } = await query;
    if (settingsError) throw settingsError;
    if (!settings || settings.length === 0) return json({ message: "No enabled automations", sent: 0, results: [] });

    const br = brNow();
    const due = automationKey
      ? settings // manual run from the admin panel
      : settings.filter((s: any) => {
          const config = s.config && typeof s.config === "object" ? s.config : {};
          if (config.scheduled_time) {
            const [h] = String(config.scheduled_time).split(":");
            if (Number(h) !== br.hour) return false;
          }
          const repeatDays = Number(config.repeat_every_days) || 0;
          if (repeatDays > 0 && config.last_sent_at) {
            const since = (br.nowMs - new Date(config.last_sent_at).getTime()) / DAY_MS;
            if (since < repeatDays - 1 / 24) return false;
          }
          return true;
        });

    const ctx: Ctx = {
      supabase, br, dryRun,
      sendPush: (endpoint, p256dh, auth, payload) => sendPush(endpoint, p256dh, auth, payload, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT),
    };
    const results: (AutomationResult & { error?: string })[] = [];

    for (const setting of due) {
      const run = AUTOMATIONS[setting.setting_key];
      if (!run) {
        console.log(`[Automations] Unknown key: ${setting.setting_key}`);
        continue;
      }
      const config = setting.config && typeof setting.config === "object" ? setting.config : {};
      try {
        const candidates = await run(ctx, config, setting.notification_text || "");
        const result = await deliver(ctx, setting.setting_key, candidates);
        results.push(result);
        console.log(`[Automations] ${setting.setting_key}: eligible=${result.eligible} alreadySent=${result.alreadySent} sent=${result.sent} dryRun=${dryRun}`);
        if (!dryRun) {
          await supabase.from("notification_settings")
            .update({ config: { ...config, last_sent_at: new Date(br.nowMs).toISOString() } })
            .eq("id", setting.id);
        }
      } catch (err) {
        console.error(`[Automations] Error in ${setting.setting_key}:`, err);
        results.push({ key: setting.setting_key, eligible: 0, alreadySent: 0, sent: 0, previews: [], error: err instanceof Error ? err.message : String(err) });
      }
    }

    const sent = results.reduce((s, r) => s + r.sent, 0);
    const eligible = results.reduce((s, r) => s + r.eligible, 0);
    return json({ message: dryRun ? "Preview" : "Automations executed", dry_run: dryRun, sent, eligible, results });
  } catch (error: unknown) {
    console.error("[Automations] Fatal error:", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
