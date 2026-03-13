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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const since = thirtyDaysAgo.toISOString();

    const tables = [
      { name: "shows", label: "Shows", userCol: "user_id" },
      { name: "transactions", label: "Transações", userCol: "user_id" },
      { name: "leads", label: "Leads", userCol: "user_id" },
      { name: "booking_requests", label: "Solicitações", userCol: "artist_id" },
      { name: "clients", label: "Clientes", userCol: "user_id" },
      { name: "contracts", label: "Contratos", userCol: "user_id" },
      { name: "budgets", label: "Orçamentos", userCol: "user_id" },
    ];

    // Fetch all data with user_id in parallel
    const results = await Promise.all(
      tables.map(async (t) => {
        const { data, error } = await supabase
          .from(t.name)
          .select(`created_at, ${t.userCol}`)
          .gte("created_at", since);

        if (error) return { table: t.label, dailyCounts: {}, userCounts: {} };

        const dailyCounts: Record<string, number> = {};
        const userCounts: Record<string, number> = {};

        (data || []).forEach((row: Record<string, string>) => {
          const day = row.created_at.split("T")[0];
          dailyCounts[day] = (dailyCounts[day] || 0) + 1;

          const uid = row[t.userCol];
          if (uid) {
            userCounts[uid] = (userCounts[uid] || 0) + 1;
          }
        });

        return { table: t.label, dailyCounts, userCounts };
      })
    );

    // Get active users per day (last_seen)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, last_seen, name, artist_name, email")
      .gte("last_seen", since);

    const activeUsersByDay: Record<string, number> = {};
    const profileMap: Record<string, { name: string; artist_name: string | null; email: string | null }> = {};

    (profiles || []).forEach((p: { user_id: string; last_seen: string | null; name: string | null; artist_name: string | null; email: string | null }) => {
      profileMap[p.user_id] = {
        name: p.name || "Sem nome",
        artist_name: p.artist_name,
        email: p.email,
      };
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

    // Per-user aggregation
    const userTotals: Record<string, { total: number; breakdown: Record<string, number> }> = {};

    results.forEach((r) => {
      Object.entries(r.userCounts).forEach(([uid, count]) => {
        if (!userTotals[uid]) {
          userTotals[uid] = { total: 0, breakdown: {} };
        }
        userTotals[uid].total += count;
        userTotals[uid].breakdown[r.table] = (userTotals[uid].breakdown[r.table] || 0) + count;
      });
    });

    // Top 15 users by operations
    const topUsers = Object.entries(userTotals)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, 15)
      .map(([uid, data]) => {
        const profile = profileMap[uid];
        return {
          user_id: uid,
          name: profile?.artist_name || profile?.name || "Desconhecido",
          email: profile?.email || null,
          total: data.total,
          breakdown: data.breakdown,
        };
      });

    // Summary totals
    const totalOps = dailyData.reduce((sum, d) => sum + (d["Total Operações"] as number), 0);
    const avgDaily = Math.round(totalOps / 30);
    const peakDay = dailyData.reduce((max, d) =>
      (d["Total Operações"] as number) > (max["Total Operações"] as number) ? d : max
    , dailyData[0]);

    // Estimated daily cost (rough proxy based on operations)
    // Supabase free tier: 500MB DB, 2GB bandwidth, 50k auth requests
    // Rough cost model: ~$0.000015 per DB operation as estimate
    const costPerOp = 0.000015;
    const dailyCostEstimate = dailyData.map((d) => ({
      date: d.date,
      ops: d["Total Operações"] as number,
      cost: Number(((d["Total Operações"] as number) * costPerOp).toFixed(4)),
    }));

    const totalEstimatedCost = Number((totalOps * costPerOp).toFixed(4));

    return new Response(
      JSON.stringify({
        dailyData,
        dailyCostEstimate,
        topUsers,
        summary: {
          totalOperations: totalOps,
          avgDailyOperations: avgDaily,
          peakDay: peakDay.date,
          peakOps: peakDay["Total Operações"],
          totalEstimatedCost,
          avgDailyCost: Number((totalEstimatedCost / 30).toFixed(4)),
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
