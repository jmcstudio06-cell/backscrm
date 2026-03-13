import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Activity, TrendingUp, Zap, Calendar, DollarSign, Users, Crown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface DailyEntry {
  date: string;
  "Total Operações": number;
  "Usuários Ativos": number;
  [key: string]: string | number;
}

interface DailyCost {
  date: string;
  ops: number;
  cost: number;
}

interface TopUser {
  user_id: string;
  name: string;
  email: string | null;
  total: number;
  breakdown: Record<string, number>;
}

interface Summary {
  totalOperations: number;
  avgDailyOperations: number;
  peakDay: string;
  peakOps: number;
  totalEstimatedCost: number;
  avgDailyCost: number;
  tables: { label: string; total: number }[];
}

export function CloudUsagePanel() {
  const [dailyData, setDailyData] = useState<DailyEntry[]>([]);
  const [dailyCost, setDailyCost] = useState<DailyCost[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase.functions.invoke("cloud-usage-stats", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (error) throw error;
        setDailyData(data.dailyData || []);
        setDailyCost(data.dailyCostEstimate || []);
        setTopUsers(data.topUsers || []);
        setSummary(data.summary || null);
      } catch (err) {
        console.error("Error fetching cloud usage:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const formatCurrency = (val: number) => `R$ ${val.toFixed(4)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalUserOps = topUsers.reduce((s, u) => s + u.total, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <Activity className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-black text-foreground">{summary?.totalOperations || 0}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Operações (30d)</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-black text-foreground">{summary?.avgDailyOperations || 0}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Média/dia</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-black text-foreground">{summary?.peakOps || 0}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Pico (dia)</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-black text-foreground">
              {summary?.peakDay ? formatDate(summary.peakDay) : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">Dia de pico</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-black text-green-600">{formatCurrency(summary?.totalEstimatedCost || 0)}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Custo est. (30d)</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-black text-green-600">{formatCurrency(summary?.avgDailyCost || 0)}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Custo médio/dia</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Cost Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            Custo Diário Estimado (30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyCost}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  labelFormatter={(val) => formatDate(val as string)}
                  formatter={(value: number) => [`R$ ${value.toFixed(4)}`, "Custo"]}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="cost" stroke="#22c55e" fill="url(#colorCost)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Users - Who costs the most */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            Top Usuários por Consumo (30 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topUsers.map((u, idx) => {
              const pct = totalUserOps > 0 ? (u.total / totalUserOps) * 100 : 0;
              const estCost = (u.total * 0.000015).toFixed(4);
              const topResource = Object.entries(u.breakdown).sort(([, a], [, b]) => b - a)[0];

              return (
                <div key={u.user_id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-black text-primary">{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground truncate">{u.name}</p>
                      {idx === 0 && <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{u.email || "—"}</p>
                    {/* Breakdown pills */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(u.breakdown)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 4)
                        .map(([resource, count]) => (
                          <span key={resource} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {resource}: {count}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-black text-foreground">{u.total} ops</p>
                    <p className="text-[10px] text-green-600 font-bold">R$ {estCost}</p>
                    <p className="text-[10px] text-muted-foreground">{pct.toFixed(1)}%</p>
                  </div>
                  {/* Usage bar */}
                  <div className="w-16 flex-shrink-0">
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
            {topUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">Sem dados de usuários no período.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Operations Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">Operações Diárias (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorOps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  labelFormatter={(val) => formatDate(val as string)}
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="Total Operações" stroke="hsl(var(--primary))" fill="url(#colorOps)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Active Users + Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Usuários Ativos/Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={6} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    labelFormatter={(val) => formatDate(val as string)}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="Usuários Ativos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Uso por Recurso (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {summary?.tables.map((t) => (
                <div key={t.label} className="p-2.5 rounded-xl bg-secondary/50 border border-border/30 text-center">
                  <p className="text-lg font-bold text-foreground">{t.total}</p>
                  <p className="text-[10px] text-muted-foreground">{t.label}</p>
                  <p className="text-[9px] text-green-600 font-medium">R$ {(t.total * 0.000015).toFixed(4)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
