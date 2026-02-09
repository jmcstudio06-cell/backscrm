import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildPushPayload,
  type PushSubscription,
  type PushMessage,
  type VapidKeys,
} from "https://esm.sh/@block65/webcrypto-web-push@1.0.2";

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

    if (!supabaseUrl) throw new Error("SUPABASE_URL is not configured");
    if (!supabaseAnonKey) throw new Error("SUPABASE_ANON_KEY is not configured");
    if (!supabaseServiceRoleKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");

    if (!VAPID_PUBLIC_KEY) throw new Error("VAPID_PUBLIC_KEY is not configured");
    if (!VAPID_PRIVATE_KEY) throw new Error("VAPID_PRIVATE_KEY is not configured");
    if (!VAPID_SUBJECT) throw new Error("VAPID_SUBJECT is not configured");

    const { title, body, url, target_audience, user_ids } = (await req.json()) as RequestBody;

    if (!title || !body) {
      return new Response(JSON.stringify({ error: "Title and body are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user (must be admin to broadcast)
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") ?? "",
        },
      },
    });

    const { data: userData } = await supabaseAuth.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin, error: adminErr } = await supabaseAuth.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });

    if (adminErr || isAdmin !== true) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Figure out which user_ids should be targeted
    let targetUserIds: string[] | null = null;

    if (Array.isArray(user_ids) && user_ids.length > 0) {
      targetUserIds = user_ids;
    } else if (target_audience && target_audience !== "all") {
      const cutoff = new Date(Date.now() - ACTIVE_DAYS * 24 * 60 * 60 * 1000).toISOString();

      const profilesQuery = supabaseAdmin.from("profiles").select("user_id,last_seen");

      if (target_audience === "active") {
        const { data: activeProfiles } = await profilesQuery.gte("last_seen", cutoff);
        targetUserIds = (activeProfiles ?? []).map((p: any) => p.user_id);
      } else {
        // inactive
        const { data: inactiveProfiles } = await profilesQuery.or(`last_seen.is.null,last_seen.lt.${cutoff}`);
        targetUserIds = (inactiveProfiles ?? []).map((p: any) => p.user_id);
      }
    }

    let subsQuery = supabaseAdmin
      .from("user_push_subscriptions")
      .select("id,user_id,endpoint,p256dh,auth")
      .eq("is_active", true);

    if (targetUserIds && targetUserIds.length > 0) {
      subsQuery = subsQuery.in("user_id", targetUserIds);
    }

    const { data: subs, error: subsError } = await subsQuery;
    if (subsError) throw subsError;

    const vapid: VapidKeys = {
      subject: VAPID_SUBJECT,
      publicKey: VAPID_PUBLIC_KEY,
      privateKey: VAPID_PRIVATE_KEY,
    };

    const message: PushMessage = {
      data: JSON.stringify({
        title,
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        url: url || "/dashboard",
      }),
      options: {
        ttl: 60 * 60, // 1 hour
      },
    };

    const results = await Promise.allSettled(
      (subs ?? []).map(async (s: any) => {
        const subscription: PushSubscription = {
          endpoint: s.endpoint,
          expirationTime: null,
          keys: {
            p256dh: s.p256dh,
            auth: s.auth,
          },
        };

        const payload = await buildPushPayload(message, subscription, vapid);
        const res = await fetch(s.endpoint, payload as RequestInit);

        // 404/410 typically means subscription is gone
        if (res.status === 404 || res.status === 410) {
          await supabaseAdmin.from("user_push_subscriptions").update({ is_active: false }).eq("id", s.id);
        }

        return res.ok;
      })
    );

    const sent = results.reduce((acc, r) => acc + (r.status === "fulfilled" && r.value ? 1 : 0), 0);

    // Log to history
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
        notification_id: "",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
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
      }
    );
  }
});
