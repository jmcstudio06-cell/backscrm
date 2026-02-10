import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importJWK } from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type RequestBody = {
  title: string;
  body: string;
  url?: string;
  target_audience?: "all" | "active" | "inactive";
  user_ids?: string[];
};

const ACTIVE_DAYS = 7;
const encoder = new TextEncoder();

// ---- Base64url helpers ----
function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

// ---- VAPID JWT using jose library (Apple-compatible) ----
async function createVapidAuth(
  endpoint: string,
  subject: string,
  publicKeyB64: string,
  privateKeyB64: string,
): Promise<string> {
  const url = new URL(endpoint);
  const aud = url.origin;

  // Clean subject: remove angle brackets and extra spaces
  const cleanSubject = subject.replace(/[<>]/g, "").trim();

  console.log(`[VAPID] aud=${aud} sub=${cleanSubject}`);

  // Build JWK from raw VAPID keys
  const pubRaw = b64urlDecode(publicKeyB64);
  const privRaw = b64urlDecode(privateKeyB64);

  const jwk = {
    kty: "EC" as const,
    crv: "P-256" as const,
    x: b64url(pubRaw.slice(1, 33)),
    y: b64url(pubRaw.slice(33, 65)),
    d: b64url(privRaw),
  };

  const key = await importJWK(jwk, "ES256");

  const jwt = await new SignJWT({ aud, sub: cleanSubject })
    .setProtectedHeader({ alg: "ES256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);

  return `vapid t=${jwt}, k=${publicKeyB64}`;
}

// ---- aes128gcm payload encryption (RFC 8291 + RFC 8188) ----
async function encryptPayload(
  payload: string,
  p256dhB64: string,
  authB64: string,
): Promise<Uint8Array> {
  const plaintext = encoder.encode(payload);

  // Client's public key & auth secret
  const clientPubRaw = b64urlDecode(p256dhB64);
  const authSecret = b64urlDecode(authB64);

  // Import client public key
  const clientPubKey = await crypto.subtle.importKey(
    "raw",
    clientPubRaw,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  // Generate ephemeral ECDH key pair
  const localKeys = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  );
  const localPubRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", localKeys.publicKey),
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientPubKey },
      localKeys.privateKey,
      256,
    ),
  );

  // Salt (16 random bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // --- RFC 8291 key derivation ---

  // Step 1: IKM = HKDF-Extract(auth_secret, ecdh_secret)
  // then HKDF-Expand with info = "WebPush: info\0" || client_pub || server_pub, length=32
  const ikm = await hkdf(
    authSecret,
    sharedSecret,
    concat(encoder.encode("WebPush: info\0"), clientPubRaw, localPubRaw),
    32,
  );

  // Step 2: PRK = HKDF-Extract(salt, IKM)
  // CEK = HKDF-Expand(PRK, "Content-Encoding: aes128gcm\0", 16)
  const cek = await hkdf(
    salt,
    ikm,
    encoder.encode("Content-Encoding: aes128gcm\0"),
    16,
  );

  // Nonce = HKDF-Expand(PRK, "Content-Encoding: nonce\0", 12)
  const nonce = await hkdf(
    salt,
    ikm,
    encoder.encode("Content-Encoding: nonce\0"),
    12,
  );

  // Pad payload: payload || 0x02 (delimiter, no padding)
  const padded = new Uint8Array([...plaintext, 2]);

  // Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey(
    "raw",
    cek,
    { name: "AES-GCM", length: 128 },
    false,
    ["encrypt"],
  );

  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce },
      aesKey,
      padded,
    ),
  );

  // Build aes128gcm body: salt(16) || rs(4, big-endian) || idlen(1) || keyid(65) || ciphertext
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);
  const idlen = new Uint8Array([localPubRaw.length]);

  return concat(salt, rs, idlen, localPubRaw, ciphertext);
}

// HKDF: Extract then Expand
async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number,
): Promise<Uint8Array> {
  // Extract: PRK = HMAC-SHA-256(salt, ikm)
  const prkKey = await crypto.subtle.importKey(
    "raw",
    salt,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", prkKey, ikm));

  // Expand: OKM = HMAC-SHA-256(PRK, info || 0x01)
  const expandKey = await crypto.subtle.importKey(
    "raw",
    prk,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expanded = new Uint8Array(
    await crypto.subtle.sign("HMAC", expandKey, new Uint8Array([...info, 1])),
  );

  return expanded.slice(0, length);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    result.set(a, offset);
    offset += a.length;
  }
  return result;
}

// ---- Send push to a single subscription ----
async function sendPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string,
): Promise<{ status: number; body: string }> {
  const authorization = await createVapidAuth(
    endpoint,
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey,
  );

  const body = await encryptPayload(payload, p256dh, auth);

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      "Content-Length": body.byteLength.toString(),
      TTL: "3600",
    },
    body,
  });

  const resBody = await res.text();
  return { status: res.status, body: resBody };
}

// ---- Main handler ----
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey)
      throw new Error("Supabase env vars not configured");
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT)
      throw new Error("VAPID env vars not configured");

    const { title, body, url, target_audience, user_ids } =
      (await req.json()) as RequestBody;

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "Title and body are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Verify admin
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    });

    const { data: userData } = await supabaseAuth.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: adminErr } = await supabaseAuth.rpc(
      "has_role",
      { _user_id: userData.user.id, _role: "admin" },
    );
    if (adminErr || isAdmin !== true) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Determine target user IDs
    let targetUserIds: string[] | null = null;
    if (Array.isArray(user_ids) && user_ids.length > 0) {
      targetUserIds = user_ids;
    } else if (target_audience && target_audience !== "all") {
      const cutoff = new Date(
        Date.now() - ACTIVE_DAYS * 24 * 60 * 60 * 1000,
      ).toISOString();
      const pq = supabaseAdmin.from("profiles").select("user_id,last_seen");

      if (target_audience === "active") {
        const { data } = await pq.gte("last_seen", cutoff);
        targetUserIds = (data ?? []).map((p: any) => p.user_id);
      } else {
        const { data } = await pq.or(
          `last_seen.is.null,last_seen.lt.${cutoff}`,
        );
        targetUserIds = (data ?? []).map((p: any) => p.user_id);
      }
    }

    // Fetch active subs, newest first
    let subsQuery = supabaseAdmin
      .from("user_push_subscriptions")
      .select("id,user_id,endpoint,p256dh,auth,created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (targetUserIds && targetUserIds.length > 0) {
      subsQuery = subsQuery.in("user_id", targetUserIds);
    }

    const { data: allSubs, error: subsError } = await subsQuery;
    if (subsError) throw subsError;

    // Keep only newest subscription per user
    const seen = new Set<string>();
    const subs = (allSubs ?? []).filter((s: any) => {
      if (seen.has(s.user_id)) return false;
      seen.add(s.user_id);
      return true;
    });

    const payload = JSON.stringify({
      title,
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      url: url || "/dashboard",
    });

    console.log(
      `Sending push to ${subs.length} subs (deduped from ${allSubs?.length ?? 0})`,
    );

    const results = await Promise.allSettled(
      subs.map(async (s: any) => {
        if (!s.endpoint.startsWith("http")) {
          console.log(`Skip invalid endpoint: ${s.endpoint.substring(0, 30)}`);
          await supabaseAdmin
            .from("user_push_subscriptions")
            .update({ is_active: false })
            .eq("id", s.id);
          return false;
        }

        try {
          const result = await sendPush(
            s.endpoint,
            s.p256dh,
            s.auth,
            payload,
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY,
            VAPID_SUBJECT,
          );

          console.log(
            `Push ${s.id}: status=${result.status} body=${result.body.substring(0, 200)}`,
          );

          if (result.status === 404 || result.status === 410) {
            await supabaseAdmin
              .from("user_push_subscriptions")
              .update({ is_active: false })
              .eq("id", s.id);
            return false;
          }

          return result.status >= 200 && result.status < 300;
        } catch (err) {
          console.error(`Error push ${s.id}:`, err);
          return false;
        }
      }),
    );

    const sent = results.reduce(
      (acc, r) => acc + (r.status === "fulfilled" && r.value ? 1 : 0),
      0,
    );

    await supabaseAdmin.from("notification_history").insert({
      title,
      message: body,
      action_url: url || "/dashboard",
      notification_type: "manual",
      target_audience: target_audience || "all",
      users_reached: sent,
    });

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        total: subs.length,
        notification_id: "",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
