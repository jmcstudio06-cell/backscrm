import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get daily counts for the last 30 days from key tables
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const since = thirtyDaysAgo.toISOString();

    const tables = [
      { name: "shows", label: "Shows" },
      { name: "transactions", label: "Transações" },
      { name: "leads", label: "Leads" },
      { name: "booking_requests", label: "Solicitações" },
      { name: "clients", label: "Clientes" },
      { name: "contracts", label: "Contratos" },
      { name: "budgets", label: "Orçamentos" },
    ];

    // Fetch all counts in parallel
    const results = await Promise.all(
      tables.map(async (t) => {
        const { data, error } = await supabase
          .from(t.name)
          .select("created_at")
          .gte("created_at", since);

        if (error) return { table: t.label, dailyCounts: {} };

        const dailyCounts: Record<string, number> = {};
        (data || []).forEach((row: { created_at: string }) => {
          const day = row.created_at.split("T")[0];
          dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        });

        return { table: t.label, dailyCounts };
      })
    );

    // Get active users per day (last_seen)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("last_seen")
      .gte("last_seen", since);

    const activeUsersByDay: Record<string, number> = {};
    (profiles || []).forEach((p: { last_seen: string | null }) => {
      if (p.last_seen) {
        const day = p.last_seen.split("T")[0];
        activeUsersByDay[day] = (activeUsersByDay[day] || 0) + 1;
      }
    });

    // Build unified daily data
    const days: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split("T")[0]);
    }

    const dailyData = days.map((day) => {
      const entry: Record<string, string | number> = { date: day };
      let totalOps = 0;
      results.forEach((r) => {
        const count = r.dailyCounts[day] || 0;
        entry[r.table] = count;
        totalOps += count;
      });
      entry["Usuários Ativos"] = activeUsersByDay[day] || 0;
      entry["Total Operações"] = totalOps;
      return entry;
    });

    // Summary totals
    const totalOps = dailyData.reduce((sum, d) => sum + (d["Total Operações"] as number), 0);
    const avgDaily = Math.round(totalOps / 30);
    const peakDay = dailyData.reduce((max, d) =>
      (d["Total Operações"] as number) > (max["Total Operações"] as number) ? d : max
    , dailyData[0]);

    return new Response(
      JSON.stringify({
        dailyData,
        summary: {
          totalOperations: totalOps,
          avgDailyOperations: avgDaily,
          peakDay: peakDay.date,
          peakOps: peakDay["Total Operações"],
          tables: results.map((r) => ({
            label: r.table,
            total: Object.values(r.dailyCounts).reduce((a, b) => a + b, 0),
          })),
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
