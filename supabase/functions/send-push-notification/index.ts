import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
    const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");

    if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
      console.error("OneSignal credentials not configured");
      return new Response(
        JSON.stringify({ error: "OneSignal not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { title, body, url, target_audience, user_ids } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "Title and body are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Sending notification:", { title, body, url, target_audience, user_ids });

    // Build OneSignal notification payload
    const notificationPayload: Record<string, unknown> = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: body },
      url: url ? `https://backstagepro.lovable.app${url}` : "https://backstagepro.lovable.app/dashboard",
    };

    // Target specific users or all subscribed users
    if (user_ids && user_ids.length > 0) {
      // Send to specific external user IDs
      notificationPayload.include_aliases = {
        external_id: user_ids,
      };
      notificationPayload.target_channel = "push";
    } else {
      // Send to all subscribed users
      notificationPayload.included_segments = ["Subscribed Users"];
    }

    console.log("OneSignal payload:", JSON.stringify(notificationPayload));

    // Send notification via OneSignal API
    // OneSignal has two auth schemes in the wild:
    // - New endpoint: https://api.onesignal.com/notifications with `Authorization: Key <RICH_API_KEY>`
    // - Legacy endpoint: https://onesignal.com/api/v1/notifications with `Authorization: Basic <REST_API_KEY>`
    // We'll try the new endpoint first and fallback to legacy on 401/403.

    const rawKey = String(ONESIGNAL_REST_API_KEY).trim();
    const normalizedKey = rawKey.replace(/^(Basic|Key|Bearer)\s+/i, "");

    const trySend = async (endpoint: string, authScheme: "Key" | "Basic") => {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `${authScheme} ${normalizedKey}`,
        },
        body: JSON.stringify(notificationPayload),
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (_e) {
        json = { raw: text };
      }

      return { res, json };
    };

    console.log("OneSignal auth key present:", Boolean(normalizedKey), "len:", normalizedKey.length);

    let response = await trySend("https://api.onesignal.com/notifications", "Key");

    // Fallback to legacy scheme/endpoint if access denied
    if (!response.res.ok && (response.res.status === 401 || response.res.status === 403)) {
      console.log("OneSignal new endpoint auth failed; falling back to legacy endpoint");
      response = await trySend("https://onesignal.com/api/v1/notifications", "Basic");
    }

    console.log("OneSignal response status:", response.res.status);
    console.log("OneSignal response:", JSON.stringify(response.json));

    if (!response.res.ok) {
      console.error("OneSignal error:", response.json);
      return new Response(
        JSON.stringify({
          error: response.json?.errors?.[0] || response.json?.error || "Failed to send notification",
          details: response.json,
        }),
        {
          status: response.res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = response.json;

    // Log notification to history
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("notification_history").insert({
      title,
      message: body,
      action_url: url || "/dashboard",
      notification_type: "manual",
      target_audience: target_audience || "all",
      users_reached: result.recipients || 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        sent: result.recipients || 0,
        notification_id: result.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
