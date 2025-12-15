import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { TrialCountdownCard } from "@/components/dashboard/TrialCountdownCard";
import { Users, TrendingUp, DollarSign, Target, Clock } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLeads } from "@/hooks/useLeads";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useShows } from "@/contexts/ShowsContext";
import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const { leads, loading: leadsLoading } = useLeads();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { goals, loading: goalsLoading } = useGoals();
  const { shows, loading: showsLoading } = useShows();

  const isLoading = leadsLoading || transactionsLoading || goalsLoading || showsLoading;

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const getGoalProgress = (current: number, target: number) =>
    target === 0 ? 0 : Math.min(Math.round((current / target) * 100), 100);

  if (isLoading) {
    return (
      <Layout title="Dashboard" subtitle="Visão geral da sua carreira">
        <div className="flex items-center justify-center h-full py-20">
          <p className="text-lg font-medium animate-pulse">Carregando...</p>
        </div>
      </Layout>
    );
  }

  const leadsInCRM = leads.filter((l) => ["new", "proposal", "closed", "not_closed"].includes(l.status)).length;
  const closedSales = leads.filter((l) => l.status === "closed").length;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const monthlyRevenue = transactions
    .filter((t) => t.type === "income" && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const conversionRate = (() => {
    const proposalLeads = leads.filter((l) => l.status === "proposal").length;
    const closedLeads = leads.filter((l) => l.status === "closed").length;
    const notClosedLeads = leads.filter((l) => l.status === "not_closed").length;
    const total = proposalLeads + closedLeads + notClosedLeads;
    return total === 0 ? 0 : Math.round((closedLeads / total) * 100);
  })();

  const revenueData = Array.from({ length: 7 }).map((_, i) => {
    const monthDate = subMonths(now, 6 - i);
    const monthRevenue = transactions
      .filter(
        (t) =>
          t.type === "income" &&
          new Date(t.date) >= startOfMonth(monthDate) &&
          new Date(t.date) <= endOfMonth(monthDate),
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const monthName = format(monthDate, "MMM", { locale: ptBR });
    return { name: monthName.charAt(0).toUpperCase() + monthName.slice(1), value: monthRevenue };
  });

  const leadsData = (() => {
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
    leads
      .filter((l) => ["new", "proposal", "closed", "not_closed"].includes(l.status))
      .forEach((l) => weekdayCounts[getDay(new Date(l.created_at))]++);
    return [
      { name: "Seg", value: weekdayCounts[1] },
      { name: "Ter", value: weekdayCounts[2] },
      { name: "Qua", value: weekdayCounts[3] },
      { name: "Qui", value: weekdayCounts[4] },
      { name: "Sex", value: weekdayCounts[5] },
      { name: "Sáb", value: weekdayCounts[6] },
      { name: "Dom", value: weekdayCounts[0] },
    ];
  })();

  const currentMonthGoals = goals.filter((g) => g.month === now.getMonth() + 1 && g.year === now.getFullYear());
  const revenueGoal = currentMonthGoals.find((g) => g.type === "revenue");
  const showsGoal = currentMonthGoals.find((g) => g.type === "shows");
  const leadsGoal = currentMonthGoals.find((g) => g.type === "leads");

  const showsThisMonth = shows.filter(
    (s) => s.status === "completed" && new Date(s.date) >= monthStart && new Date(s.date) <= monthEnd,
  ).length;
  const upcomingShows = shows
    .filter((s) => new Date(s.date) >= now && s.status !== "cancelled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map((s) => ({
      date: format(new Date(s.date), "dd MMM", { locale: ptBR }),
      title: s.title,
      location: s.venue || "Local a definir",
      value: `R$ ${Number(s.cachet).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    }));

  return (
    <Layout title="Dashboard" subtitle="Visão geral da sua carreira">
      <div className="space-y-6">
        <TrialCountdownCard />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Olá, Artista! 👋</h1>
            <p className="text-muted-foreground mt-1">Aqui está o resumo da sua carreira este mês</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" /> Atualizado há 5 minutos
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Leads no CRM" value={String(leadsInCRM)} icon={Users} gradient="purple" />
          <StatCard title="Vendas Fechadas" value={String(closedSales)} icon={TrendingUp} gradient="success" />
          <StatCard
            title="Receita Mensal"
            value={`R$ ${formatCurrency(monthlyRevenue)}`}
            icon={DollarSign}
            gradient="primary"
          />
          <StatCard title="Taxa de Conversão" value={`${conversionRate}%`} icon={Target} gradient="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Receita Mensal" subtitle="Últimos 7 meses">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [`R$ ${formatCurrency(value)}`, "Receita"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Leads por Mês" subtitle="Por dia da semana (mês atual)">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={leadsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                <Tooltip
                  formatter={(value: number) => [value, "Leads"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Metas do Mês</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <ProgressRing
                  progress={getGoalProgress(monthlyRevenue, revenueGoal?.target_value || 0)}
                  size={60}
                  strokeWidth={6}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">Receita</p>
                  <p className="text-sm text-muted-foreground truncate">
                    R$ {formatCurrency(monthlyRevenue)} / R$ {formatCurrency(revenueGoal?.target_value || 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ProgressRing
                  progress={getGoalProgress(showsThisMonth, showsGoal?.target_value || 0)}
                  size={60}
                  strokeWidth={6}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">Shows</p>
                  <p className="text-sm text-muted-foreground">
                    {showsThisMonth} / {showsGoal?.target_value || 0} shows
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ProgressRing
                  progress={getGoalProgress(leadsInCRM, leadsGoal?.target_value || 0)}
                  size={60}
                  strokeWidth={6}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">Leads</p>
                  <p className="text-sm text-muted-foreground">
                    {leadsInCRM} / {leadsGoal?.target_value || 0} leads
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Shows</h3>
            <div className="space-y-4">
              {upcomingShows.length > 0 ? (
                upcomingShows.map((show, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="text-center min-w-[50px]">
                      <p className="text-xs text-muted-foreground">{show.date.split(" ")[1]}</p>
                      <p className="text-xl font-bold text-primary">{show.date.split(" ")[0]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{show.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{show.location}</p>
                    </div>
                    <p className="text-sm font-semibold text-green-500">{show.value}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum show agendado</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
