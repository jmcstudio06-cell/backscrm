import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Missing authorization header" }, 401);
    const token = authHeader.replace("Bearer ", "");

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser(token);
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (roleError || !isAdmin) return json({ error: "Forbidden: Admin access required" }, 403);

    const body = await req.json().catch(() => ({}));
    const userId = typeof body?.userId === "string" ? body.userId : null;
    if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) return json({ error: "Missing or invalid userId" }, 400);

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const [profileRes, showsRes, txRes] = await Promise.all([
      admin
        .from("profiles")
        .select("user_id, name, artist_name, email, phone, plan, created_at")
        .eq("user_id", userId)
        .maybeSingle(),
      admin
        .from("shows")
        .select("date, start_time, title, event_type, venue, address, status, cachet, advance_amount, notes")
        .eq("user_id", userId)
        .order("date", { ascending: true })
        .limit(5000),
      admin
        .from("transactions")
        .select("date, type, category, description, amount, is_advance_payment")
        .eq("user_id", userId)
        .order("date", { ascending: true })
        .limit(10000),
    ]);

    if (profileRes.error) throw profileRes.error;
    if (showsRes.error) throw showsRes.error;
    if (txRes.error) throw txRes.error;

    return json({
      profile: profileRes.data ?? null,
      shows: showsRes.data ?? [],
      transactions: txRes.data ?? [],
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("admin-export-user-data error:", error);
    return json({ error: "Internal server error" }, 500);
  }
});
