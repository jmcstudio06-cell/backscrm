import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function b64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function b64url(buf: Uint8Array | ArrayBuffer): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const pubKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const privKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const subject = Deno.env.get("VAPID_SUBJECT")!;

    const pubRaw = b64urlDecode(pubKey);
    const privRaw = b64urlDecode(privKey);

    // Try to build JWK and import
    const jwk = {
      kty: "EC",
      crv: "P-256",
      x: b64url(pubRaw.slice(1, 33)),
      y: b64url(pubRaw.slice(33, 65)),
      d: b64url(privRaw),
    };

    const key = await crypto.subtle.importKey(
      "jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
    );

    // Sign and verify
    const testData = new TextEncoder().encode("test");
    const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, testData);

    // Import public key to verify
    const verifyKey = await crypto.subtle.importKey(
      "raw", pubRaw, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]
    );
    const verified = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" }, verifyKey, sig, testData
    );

    return new Response(JSON.stringify({
      publicKey: pubKey,
      privateKeyLength: privKey.length,
      pubRawLength: pubRaw.length,
      privRawLength: privRaw.length,
      subject,
      keyPairValid: verified,
      jwk_x: jwk.x,
      jwk_y: jwk.y,
      jwk_d_length: jwk.d.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
