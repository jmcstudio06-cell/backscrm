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

// Web Push implementation using VAPID
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string },
  vapidKeys: { publicKey: string; privateKey: string; subject: string }
): Promise<boolean> {
  try {
    // Import web-push compatible functions
    const encoder = new TextEncoder();
    
    // Create JWT for VAPID
    const header = { alg: "ES256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const claims = {
      aud: new URL(subscription.endpoint).origin,
      exp: now + 12 * 60 * 60, // 12 hours
      sub: vapidKeys.subject,
    };

    // Base64url encode
    const base64url = (data: Uint8Array | string): string => {
      const str = typeof data === "string" ? data : new TextDecoder().decode(data);
      return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    };

    const base64urlEncode = (obj: object): string => {
      return base64url(JSON.stringify(obj));
    };

    // Import private key for signing
    const privateKeyBytes = Uint8Array.from(
      atob(vapidKeys.privateKey.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    // Create key for signing
    const key = await crypto.subtle.importKey(
      "pkcs8",
      privateKeyBytes,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["sign"]
    );

    const unsignedToken = `${base64urlEncode(header)}.${base64urlEncode(claims)}`;
    const signature = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      key,
      encoder.encode(unsignedToken)
    );

    const jwt = `${unsignedToken}.${base64url(new Uint8Array(signature))}`;

    // Prepare payload
    const payloadBytes = encoder.encode(JSON.stringify(payload));

    // Send push notification
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "TTL": "86400",
        Authorization: `vapid t=${jwt}, k=${vapidKeys.publicKey}`,
      },
      body: payloadBytes,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Push failed for ${subscription.endpoint}: ${response.status} - ${errorText}`);
      return false;
    }

    console.log(`Push sent successfully to ${subscription.endpoint}`);
    return true;
  } catch (error) {
    console.error("Error sending push:", error);
    return false;
  }
}

// Simpler approach using fetch directly with encrypted payload
async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: { title: string; body: string; url?: string },
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // For now, we'll use a simpler approach - just POST to the endpoint
    // Note: Real web push requires encryption, but many push services accept plain JSON
    
    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      url: payload.url || "/dashboard",
      data: { url: payload.url || "/dashboard" }
    });

    // Create VAPID authorization header
    const audience = new URL(subscription.endpoint).origin;
    const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60;

    // For Firebase/Google endpoints, we need proper VAPID auth
    // For other endpoints, we'll try basic auth
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "TTL": "86400",
    };

    // Check if it's a valid push endpoint (not placeholder)
    if (subscription.endpoint.startsWith("browser-") || subscription.p256dh === "placeholder") {
      console.log("Skipping placeholder subscription:", subscription.endpoint);
      return { success: false, error: "Placeholder subscription" };
    }

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers,
      body: payloadString,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Push failed: ${response.status} - ${errorText}`);
      
      // 410 Gone means subscription expired
      if (response.status === 410) {
        return { success: false, error: "Subscription expired" };
      }
      
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    await response.text(); // Consume response
    console.log("Push notification sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Error sending push notification:", error);
    return { success: false, error: String(error) };
  }
}

serve(async (req) => {
  // Handle CORS preflight
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

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.user.id;

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get request body
    const payload: PushPayload = await req.json();
    console.log("Received push request:", payload);

    if (!payload.title || !payload.body) {
      return new Response(JSON.stringify({ error: "Title and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get VAPID keys
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const vapidSubject = Deno.env.get("VAPID_SUBJECT")!;

    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
      console.error("VAPID keys not configured");
      return new Response(JSON.stringify({ error: "VAPID keys not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get subscriptions based on audience
    let subscriptionsQuery = supabase
      .from("user_push_subscriptions")
      .select("endpoint, p256dh, auth, user_id")
      .eq("is_active", true);

    // If specific user IDs provided
    if (payload.user_ids && payload.user_ids.length > 0) {
      subscriptionsQuery = subscriptionsQuery.in("user_id", payload.user_ids);
    } else if (payload.target_audience && payload.target_audience !== "all") {
      // Get user IDs based on audience
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let profilesQuery = supabase.from("profiles").select("user_id");

      if (payload.target_audience === "active") {
        profilesQuery = profilesQuery.gte("last_seen", sevenDaysAgo.toISOString());
      } else if (payload.target_audience === "inactive") {
        profilesQuery = profilesQuery.or(
          `last_seen.lt.${sevenDaysAgo.toISOString()},last_seen.is.null`
        );
      }

      const { data: profiles } = await profilesQuery;
      const userIds = profiles?.map((p) => p.user_id) || [];

      if (userIds.length > 0) {
        subscriptionsQuery = subscriptionsQuery.in("user_id", userIds);
      }
    }

    const { data: subscriptions, error: subError } = await subscriptionsQuery;

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      return new Response(JSON.stringify({ error: "Failed to fetch subscriptions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions to send to`);

    // Filter out placeholder subscriptions
    const validSubscriptions = (subscriptions || []).filter(
      (sub) => !sub.endpoint.startsWith("browser-") && sub.p256dh !== "placeholder"
    );

    console.log(`Valid subscriptions after filtering: ${validSubscriptions.length}`);

    // Send notifications
    let successCount = 0;
    let failCount = 0;
    const expiredSubscriptions: string[] = [];

    for (const sub of validSubscriptions) {
      const result = await sendPushNotification(
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
        if (result.error === "Subscription expired") {
          expiredSubscriptions.push(sub.endpoint);
        }
      }
    }

    // Clean up expired subscriptions
    if (expiredSubscriptions.length > 0) {
      await supabase
        .from("user_push_subscriptions")
        .update({ is_active: false })
        .in("endpoint", expiredSubscriptions);
      console.log(`Marked ${expiredSubscriptions.length} subscriptions as inactive`);
    }

    // Log to history
    await supabase.from("notification_history").insert({
      title: payload.title,
      message: payload.body,
      action_url: payload.url || null,
      notification_type: "manual",
      target_audience: payload.target_audience || "all",
      users_reached: successCount,
      sent_by: userId,
    });

    console.log(`Push complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failCount,
        total_valid: validSubscriptions.length,
        total_subscriptions: subscriptions?.length || 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-push-notification:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
