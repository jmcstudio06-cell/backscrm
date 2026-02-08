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

    // Send notification via OneSignal REST API
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notificationPayload),
    });

    const result = await response.json();
    console.log("OneSignal response:", JSON.stringify(result));

    if (!response.ok) {
      console.error("OneSignal error:", result);
      return new Response(
        JSON.stringify({
          error: result.errors?.[0] || "Failed to send notification",
          details: result,
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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
