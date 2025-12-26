import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { TrialCountdownCard } from "@/components/dashboard/TrialCountdownCard";
import { MonthlyGoalsCard } from "@/components/dashboard/MonthlyGoalsCard";
import { UpcomingShowsCard } from "@/components/dashboard/UpcomingShowsCard";
import { AchievementsCard } from "@/components/dashboard/AchievementsCard";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { Users, TrendingUp, DollarSign, Target, Clock } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useLeads } from "@/hooks/useLeads";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useShows } from "@/contexts/ShowsContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState, useEffect } from "react";
import { format, subMonths, startOfMonth, endOfMonth, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const { leads } = useLeads();
  const { transactions } = useTransactions();
  const { goals } = useGoals();
  const { shows } = useShows();
  const { profile } = useProfile();
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if user should see onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (profileData && !profileData.onboarding_completed) {
          setShowWelcome(true);
        }
      }
    };
    checkOnboarding();
  }, []);

  // Calculate leads in CRM (only new, proposal, closed, not_closed - NOT repeat or never)
  const leadsInCRM = useMemo(() => {
    const crmStatuses = ["new", "proposal", "closed", "not_closed"];
    return leads.filter((lead) => crmStatuses.includes(lead.status)).length;
  }, [leads]);

  // Calculate closed sales (only closed status)
  const closedSales = useMemo(() => {
    return leads.filter((lead) => lead.status === "closed").length;
  }, [leads]);

  // Calculate monthly revenue from transactions
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return t.type === "income" && transactionDate >= monthStart && transactionDate <= monthEnd;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  // Calculate conversion rate: closed / (proposal + closed + not_closed) * 100
  const conversionRate = useMemo(() => {
    const proposalLeads = leads.filter((lead) => lead.status === "proposal").length;
    const closedLeads = leads.filter((lead) => lead.status === "closed").length;
    const notClosedLeads = leads.filter((lead) => lead.status === "not_closed").length;

    const totalEligible = proposalLeads + closedLeads + notClosedLeads;
    if (totalEligible === 0) return 0;

    return Math.round((closedLeads / totalEligible) * 100);
  }, [leads]);

  // Revenue chart data - current month and last 6 months
  const revenueData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthRevenue = transactions
        .filter((t) => {
          const transactionDate = new Date(t.date);
          return t.type === "income" && transactionDate >= monthStart && transactionDate <= monthEnd;
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);

      months.push({
        name:
          format(monthDate, "MMM", { locale: ptBR }).charAt(0).toUpperCase() +
          format(monthDate, "MMM", { locale: ptBR }).slice(1),
        value: monthRevenue,
      });
    }

    return months;
  }, [transactions]);

  // Leads by weekday for current month
  const leadsData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const crmStatuses = ["new", "proposal", "closed", "not_closed"];

    // Initialize weekday counts (0 = Sunday, 1 = Monday, etc.)
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];

    leads
      .filter((lead) => {
        const createdDate = new Date(lead.created_at);
        return crmStatuses.includes(lead.status) && createdDate >= monthStart && createdDate <= monthEnd;
      })
      .forEach((lead) => {
        const dayOfWeek = getDay(new Date(lead.created_at));
        weekdayCounts[dayOfWeek]++;
      });

    // Reorder to start with Monday (Seg)
    return [
      { name: "Seg", value: weekdayCounts[1] },
      { name: "Ter", value: weekdayCounts[2] },
      { name: "Qua", value: weekdayCounts[3] },
      { name: "Qui", value: weekdayCounts[4] },
      { name: "Sex", value: weekdayCounts[5] },
      { name: "Sáb", value: weekdayCounts[6] },
      { name: "Dom", value: weekdayCounts[0] },
    ];
  }, [leads]);

  // Goals for current month
  const currentMonthGoals = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return goals.filter((g) => g.month === currentMonth && g.year === currentYear);
  }, [goals]);

  const revenueGoal = currentMonthGoals.find((g) => g.type === "revenue");
  const showsGoal = currentMonthGoals.find((g) => g.type === "shows");
  const leadsGoal = currentMonthGoals.find((g) => g.type === "leads");

  // Calculate shows this month
  const showsThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    return shows.filter((show) => {
      const showDate = new Date(show.date);
      return show.status === "completed" && showDate >= monthStart && showDate <= monthEnd;
    }).length;
  }, [shows]);

  // Total shows for achievements
  const totalShows = useMemo(() => {
    return shows.filter((show) => show.status === "completed").length;
  }, [shows]);

  // Total revenue for achievements
  const totalRevenue = useMemo(() => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  // Upcoming shows
  const upcomingShows = useMemo(() => {
    const now = new Date();
    return shows
      .filter((show) => new Date(show.date) >= now && show.status !== "cancelled")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
      .map((show) => ({
        date: format(new Date(show.date), "dd MMM", { locale: ptBR }),
        title: show.title,
        location: show.venue || "Local a definir",
        value: `R$ ${Number(show.cachet).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      }));
  }, [shows]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };


  return (
    <Layout title="Dashboard" subtitle="Visão geral da sua carreira">
      {/* Welcome/Onboarding Modal */}
      <WelcomeModal 
        open={showWelcome} 
        onClose={() => setShowWelcome(false)}
        userName={profile?.name || undefined}
      />

      <div className="space-y-6">
        {/* Trial Countdown Card */}
        <TrialCountdownCard />

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Olá, Artista! 👋</h1>
            <p className="text-muted-foreground mt-1">Aqui está o resumo da sua carreira este mês</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Atualizado há 5 minutos
          </div>
        </div>

        {/* Stats Grid */}
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

        {/* Charts Row */}
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

        {/* Goals, Upcoming Shows & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MonthlyGoalsCard
            showsThisMonth={showsThisMonth}
            showsTarget={showsGoal?.target_value || 0}
            revenueThisMonth={monthlyRevenue}
            revenueTarget={revenueGoal?.target_value || 0}
            leadsThisMonth={closedSales}
            leadsTarget={leadsGoal?.target_value || 0}
          />
          <UpcomingShowsCard shows={upcomingShows} />
          <AchievementsCard
            showsTotal={totalShows}
            leadsTotal={closedSales}
            revenueTotal={totalRevenue}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
