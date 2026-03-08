import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  title: string;
  message: string;
  notification_type: string;
  action_url?: string;
  target_audience: "all" | "by_plan" | "specific_user";
  plan_filter?: string;
  user_id?: string;
  send_push?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify admin
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: userData } = await supabaseAuth.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabaseAuth.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: RequestBody = await req.json();
    const { title, message, notification_type, action_url, target_audience, plan_filter, user_id, send_push } = body;

    if (!title || !message) {
      return new Response(JSON.stringify({ error: "Title and message are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Determine target users
    let targetUserIds: string[] = [];

    if (target_audience === "specific_user" && user_id) {
      targetUserIds = [user_id];
    } else if (target_audience === "by_plan" && plan_filter) {
      const { data: profiles } = await admin.from("profiles").select("user_id").eq("plan", plan_filter);
      targetUserIds = (profiles ?? []).map((p: any) => p.user_id);
    } else {
      // all
      const { data: profiles } = await admin.from("profiles").select("user_id");
      targetUserIds = (profiles ?? []).map((p: any) => p.user_id);
    }

    if (targetUserIds.length === 0) {
      return new Response(JSON.stringify({ success: true, inserted: 0, push_sent: 0 }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert in-app notifications in batches
    const BATCH_SIZE = 500;
    let inserted = 0;
    for (let i = 0; i < targetUserIds.length; i += BATCH_SIZE) {
      const batch = targetUserIds.slice(i, i + BATCH_SIZE).map(uid => ({
        user_id: uid,
        title,
        message,
        notification_type: notification_type || "update",
        action_url: action_url || null,
        sent_by: userData.user.id,
      }));
      const { error } = await admin.from("user_notifications").insert(batch);
      if (error) {
        console.error("Error inserting notifications batch:", error);
      } else {
        inserted += batch.length;
      }
    }

    console.log(`✅ Inserted ${inserted} in-app notifications`);

    // Optionally also send push
    let pushSent = 0;
    if (send_push !== false) {
      try {
        const pushResponse = await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: req.headers.get("Authorization") ?? "",
            apikey: supabaseAnonKey,
          },
          body: JSON.stringify({
            title,
            body: message,
            url: action_url || "/notificacoes",
            user_ids: targetUserIds,
          }),
        });
        const pushData = await pushResponse.json();
        pushSent = pushData?.sent || 0;
        console.log(`📨 Push sent to ${pushSent} users`);
      } catch (pushErr) {
        console.error("Push error (non-blocking):", pushErr);
      }
    }

    return new Response(JSON.stringify({ success: true, inserted, push_sent: pushSent }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-app-notification:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
