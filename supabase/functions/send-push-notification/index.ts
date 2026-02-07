import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  target_audience?: "all" | "active" | "inactive";
  user_ids?: string[];
}

// Base64url encoding/decoding
function base64UrlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

// Convert DER ECDSA signature to raw format (r || s)
function derToRaw(signature: ArrayBuffer): Uint8Array {
  const der = new Uint8Array(signature);
  // DER format: 0x30 [total-length] 0x02 [r-length] [r] 0x02 [s-length] [s]
  let offset = 2;
  
  // Read r
  const rLen = der[offset + 1];
  offset += 2;
  let r = der.slice(offset, offset + rLen);
  offset += rLen;
  
  // Read s  
  const sLen = der[offset + 1];
  offset += 2;
  let s = der.slice(offset, offset + sLen);
  
  // Remove leading zero padding
  if (r.length === 33 && r[0] === 0) r = r.slice(1);
  if (s.length === 33 && s[0] === 0) s = s.slice(1);
  
  // Pad to 32 bytes each
  const result = new Uint8Array(64);
  result.set(r, 32 - r.length);
  result.set(s, 64 - s.length);
  
  return result;
}

// Get x,y coordinates from uncompressed public key (65 bytes: 0x04 || x || y)
function getPublicKeyCoordinates(publicKeyBase64: string): { x: string; y: string } {
  const publicKeyRaw = base64UrlDecode(publicKeyBase64);
  if (publicKeyRaw.length !== 65 || publicKeyRaw[0] !== 0x04) {
    throw new Error(`Invalid public key format: length=${publicKeyRaw.length}, first=${publicKeyRaw[0]}`);
  }
  const x = base64UrlEncode(publicKeyRaw.slice(1, 33));
  const y = base64UrlEncode(publicKeyRaw.slice(33, 65));
  return { x, y };
}

// Create VAPID JWT using JWK format for key import
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyBase64: string,
  publicKeyBase64: string
): Promise<string> {
  const encoder = new TextEncoder();
  
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    aud: audience,
    exp: now + 12 * 60 * 60,
    sub: subject,
  };
  
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const claimsB64 = base64UrlEncode(encoder.encode(JSON.stringify(claims)));
  const unsignedToken = `${headerB64}.${claimsB64}`;
  
  // Decode private key (32 bytes raw)
  const privateKeyRaw = base64UrlDecode(privateKeyBase64);
  console.log(`Private key raw length: ${privateKeyRaw.length}`);
  
  // Get public key coordinates for JWK
  const { x, y } = getPublicKeyCoordinates(publicKeyBase64);
  
  // Create JWK for the private key
  const jwk = {
    kty: "EC",
    crv: "P-256",
    x: x,
    y: y,
    d: privateKeyBase64, // Already base64url encoded
  };
  
  console.log("JWK created, importing key...");
  
  // Import as JWK
  const privateKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  
  console.log("Key imported, signing...");
  
  // Sign the token
  const signatureBuffer = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    encoder.encode(unsignedToken)
  );
  
  // Convert DER signature to raw format
  const signatureRaw = derToRaw(signatureBuffer);
  const signatureB64 = base64UrlEncode(signatureRaw);
  
  return `${unsignedToken}.${signatureB64}`;
}

// HKDF implementation
async function hkdf(
  ikm: Uint8Array,
  salt: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const extractKey = await crypto.subtle.importKey(
    "raw",
    salt.length > 0 ? salt : new Uint8Array(32),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const prk = new Uint8Array(await crypto.subtle.sign("HMAC", extractKey, ikm));
  
  const expandKey = await crypto.subtle.importKey(
    "raw",
    prk,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const expandInfo = new Uint8Array(info.length + 1);
  expandInfo.set(info, 0);
  expandInfo[info.length] = 1;
  
  const okm = new Uint8Array(await crypto.subtle.sign("HMAC", expandKey, expandInfo));
  return okm.slice(0, length);
}

// Encrypt payload for Web Push
async function encryptPayload(
  payload: string,
  p256dhBase64: string,
  authBase64: string
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  
  const clientPublicKey = base64UrlDecode(p256dhBase64);
  const authSecret = base64UrlDecode(authBase64);
  
  // Generate local ephemeral key pair
  const localKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );
  
  // Export local public key
  const localPublicKeyJwk = await crypto.subtle.exportKey("jwk", localKeyPair.publicKey);
  const xBytes = base64UrlDecode(localPublicKeyJwk.x!);
  const yBytes = base64UrlDecode(localPublicKeyJwk.y!);
  const localPublicKey = new Uint8Array(65);
  localPublicKey[0] = 0x04;
  localPublicKey.set(xBytes, 1);
  localPublicKey.set(yBytes, 33);
  
  // Import client public key
  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );
  
  // ECDH key agreement
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientKey },
      localKeyPair.privateKey,
      256
    )
  );
  
  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Derive IKM
  const authInfo = encoder.encode("Content-Encoding: auth\0");
  const ikm = await hkdf(sharedSecret, authSecret, authInfo, 32);
  
  // Derive CEK and nonce
  const cekInfo = encoder.encode("Content-Encoding: aes128gcm\0");
  const cek = await hkdf(ikm, salt, cekInfo, 16);
  
  const nonceInfo = encoder.encode("Content-Encoding: nonce\0");
  const nonce = await hkdf(ikm, salt, nonceInfo, 12);
  
  // Import CEK
  const aesKey = await crypto.subtle.importKey(
    "raw",
    cek,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  
  // Pad payload
  const payloadBytes = encoder.encode(payload);
  const paddedPayload = new Uint8Array(payloadBytes.length + 1);
  paddedPayload.set(payloadBytes, 0);
  paddedPayload[payloadBytes.length] = 0x02;
  
  // Encrypt
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: nonce, tagLength: 128 },
      aesKey,
      paddedPayload
    )
  );
  
  // Build body: salt(16) || rs(4) || idlen(1) || keyid(65) || ciphertext
  const recordSize = 4096;
  const body = new Uint8Array(86 + ciphertext.length);
  body.set(salt, 0);
  body[16] = (recordSize >> 24) & 0xff;
  body[17] = (recordSize >> 16) & 0xff;
  body[18] = (recordSize >> 8) & 0xff;
  body[19] = recordSize & 0xff;
  body[20] = 65;
  body.set(localPublicKey, 21);
  body.set(ciphertext, 86);
  
  return body;
}

// Send push notification
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string },
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; error?: string; status?: number }> {
  try {
    if (!subscription.endpoint || subscription.endpoint.startsWith("browser-")) {
      return { success: false, error: "Invalid endpoint" };
    }
    
    if (!subscription.p256dh || subscription.p256dh === "placeholder" ||
        !subscription.auth || subscription.auth === "placeholder") {
      return { success: false, error: "Placeholder subscription" };
    }
    
    const audience = new URL(subscription.endpoint).origin;
    
    // Create VAPID JWT
    const jwt = await createVapidJwt(audience, vapidSubject, vapidPrivateKey, vapidPublicKey);
    
    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: { url: payload.url || "/dashboard" },
    });
    
    // Encrypt the payload
    const encryptedBody = await encryptPayload(
      notificationPayload,
      subscription.p256dh,
      subscription.auth
    );
    
    // Send the push
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "TTL": "86400",
        "Authorization": `vapid t=${jwt}, k=${vapidPublicKey}`,
        "Urgency": "normal",
      },
      body: encryptedBody,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Push failed [${response.status}]: ${errorText}`);
      
      if (response.status === 410 || response.status === 404) {
        return { success: false, error: "Subscription expired", status: response.status };
      }
      
      return { success: false, error: `HTTP ${response.status}`, status: response.status };
    }
    
    console.log(`Push OK: ${subscription.endpoint.substring(0, 60)}...`);
    return { success: true };
  } catch (error) {
    console.error("Push error:", error);
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.user.id;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload: PushPayload = await req.json();
    console.log("Push request:", { title: payload.title, audience: payload.target_audience });

    if (!payload.title || !payload.body) {
      return new Response(JSON.stringify({ error: "Title and body required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT");

    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
      return new Response(JSON.stringify({ error: "VAPID not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("VAPID config:", { pubLen: vapidPublicKey.length, privLen: vapidPrivateKey.length, subject: vapidSubject });

    let subscriptionsQuery = supabase
      .from("user_push_subscriptions")
      .select("endpoint, p256dh, auth, user_id")
      .eq("is_active", true);

    if (payload.user_ids && payload.user_ids.length > 0) {
      subscriptionsQuery = subscriptionsQuery.in("user_id", payload.user_ids);
    } else if (payload.target_audience && payload.target_audience !== "all") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let profilesQuery = supabase.from("profiles").select("user_id");

      if (payload.target_audience === "active") {
        profilesQuery = profilesQuery.gte("last_seen", sevenDaysAgo.toISOString());
      } else {
        profilesQuery = profilesQuery.or(`last_seen.lt.${sevenDaysAgo.toISOString()},last_seen.is.null`);
      }

      const { data: profiles } = await profilesQuery;
      const userIds = profiles?.map((p) => p.user_id) || [];
      if (userIds.length > 0) {
        subscriptionsQuery = subscriptionsQuery.in("user_id", userIds);
      }
    }

    const { data: subscriptions, error: subError } = await subscriptionsQuery;

    if (subError) {
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Total subscriptions: ${subscriptions?.length || 0}`);

    const validSubscriptions = (subscriptions || []).filter(
      (sub) =>
        sub.endpoint &&
        !sub.endpoint.startsWith("browser-") &&
        sub.p256dh &&
        sub.p256dh !== "placeholder" &&
        sub.auth &&
        sub.auth !== "placeholder"
    );

    console.log(`Valid subscriptions: ${validSubscriptions.length}`);

    let successCount = 0;
    let failCount = 0;
    const expiredEndpoints: string[] = [];
    const errors: string[] = [];

    for (const sub of validSubscriptions) {
      const result = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        { title: payload.title, body: payload.body, url: payload.url },
        vapidPublicKey,
        vapidPrivateKey,
        vapidSubject
      );

      if (result.success) {
        successCount++;
      } else {
        failCount++;
        if (result.status === 410 || result.status === 404) {
          expiredEndpoints.push(sub.endpoint);
        }
        if (errors.length < 5 && result.error) {
          errors.push(result.error);
        }
      }
    }

    if (expiredEndpoints.length > 0) {
      await supabase
        .from("user_push_subscriptions")
        .update({ is_active: false })
        .in("endpoint", expiredEndpoints);
    }

    await supabase.from("notification_history").insert({
      title: payload.title,
      message: payload.body,
      action_url: payload.url || null,
      notification_type: "manual",
      target_audience: payload.target_audience || "all",
      users_reached: successCount,
      sent_by: userId,
    });

    console.log(`Complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failCount,
        total_valid: validSubscriptions.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
