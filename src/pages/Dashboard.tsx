import { Layout } from "@/components/layout/Layout";

import { RecommendedActionCard } from "@/components/dashboard/RecommendedActionCard";
import { PendingCachetCard } from "@/components/dashboard/PendingCachetCard";
import { CompactCareerHero } from "@/components/dashboard/CompactCareerHero";
import { CareerThermometerCard } from "@/components/dashboard/CareerThermometerCard";
import { PendingCachetBanner } from "@/components/dashboard/PendingCachetBanner";

import { DashboardAchievementsCard } from "@/components/dashboard/DashboardAchievementsCard";
import { EventTypeBreakdownCard } from "@/components/dashboard/EventTypeBreakdownCard";
import { HeaderTrialPill } from "@/components/dashboard/HeaderTrialPill";
import { UpcomingShowsCard } from "@/components/dashboard/UpcomingShowsCard";
import { MonthlyShowGoalModal } from "@/components/dashboard/MonthlyShowGoalModal";
import { MonthlyShowGoalProgress } from "@/components/dashboard/MonthlyShowGoalProgress";

import { RankingTeaser } from "@/components/dashboard/RankingTeaser";
import { RenewSoonBanner } from "@/components/dashboard/RenewSoonBanner";
import { PartnerAdBanner } from "@/components/dashboard/PartnerAdBanner";


import { useLeads } from "@/hooks/useLeads";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useShows } from "@/contexts/shows/ShowsContext";
import { useProfile } from "@/hooks/useProfile";
import { useClients } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { parseLocalDate } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { leads, loading: leadsLoading } = useLeads();
  const { transactions, loading: transactionsLoading } = useTransactions({ fullHistory: true });
  const { goals, loading: goalsLoading, addGoal } = useGoals();
  const { shows, loading: showsLoading } = useShows();
  const { profile, loading: profileLoading } = useProfile();
  const { clients, loading: clientsLoading } = useClients();
  // O onboarding obrigatório (vídeo + 4 etapas) agora vive no OnboardingGate (App).
  // Aqui só suprimimos o modal de meta enquanto ele não foi concluído.
  const onboardingActive = !profile?.onboarding_completed;
  const [checklistsUsed, setChecklistsUsed] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  // Lightweight counts instead of full data hooks
  const [contractsCount, setContractsCount] = useState(0);
  const [contractShowIds, setContractShowIds] = useState<string[]>([]);
  const [stageMappingsCount, setStageMappingsCount] = useState(0);

  // Unified loading state - only show content when main data is ready
  const isLoading = leadsLoading || transactionsLoading || showsLoading || profileLoading || clientsLoading || goalsLoading;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentMonthName = format(now, "MMMM", { locale: ptBR });
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // Find current month's show goal
  const currentShowGoal = useMemo(() => {
    return goals.find(
      (g) => g.type === "shows" && g.month === currentMonth && g.year === currentYear
    );
  }, [goals, currentMonth, currentYear]);

  // Count confirmed + completed + partial shows this month (all except cancelled)
  const completedShowsThisMonth = useMemo(() => {
    return shows.filter((show) => {
      const showDate = new Date(show.date + "T12:00:00");
      return (
        (show.status === "completed" || show.status === "confirmed" || show.status === "partial") &&
        showDate >= currentMonthStart &&
        showDate <= currentMonthEnd
      );
    }).length;
  }, [shows, currentMonthStart, currentMonthEnd]);

  // Contadores leves (o onboarding é tratado no OnboardingGate)
  useEffect(() => {
    if (profileLoading || !profile) return;


    // Batch lightweight count queries (checklist agora é 100% local — sem query)
    const fetchCounts = async () => {
      const [contractsResult, mappingsResult] = await Promise.all([
        supabase.from("contracts").select("id, show_id").order("created_at", { ascending: false }).limit(5),
        supabase.from("stage_mappings").select("*", { count: "exact", head: true }),
      ]);

      // Checklist marcado como "usado" se há qualquer marcação local salva
      let anyLocalChecklist = false;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("checklist_local_")) {
            anyLocalChecklist = true;
            break;
          }
        }
      } catch { /* ignore */ }

      setChecklistsUsed(anyLocalChecklist);
      setContractsCount(contractsResult.data?.length || 0);
      setContractShowIds((contractsResult.data || []).map(c => c.show_id).filter(Boolean) as string[]);
      setStageMappingsCount(mappingsResult.count || 0);
    };
    fetchCounts();
  }, [profile, profileLoading]);

  // Show monthly goal modal if no goal set for this month (after loading)
  // Skip during onboarding AND for users who haven't completed onboarding yet —
  // the onboarding flow itself handles install, notifications and goal setup.
  useEffect(() => {
    if (
      !isLoading &&
      !onboardingActive &&
      profile?.onboarding_completed &&
      !currentShowGoal
    ) {
      setShowGoalModal(true);
    }
  }, [isLoading, onboardingActive, currentShowGoal, profile?.onboarding_completed]);

  // Refresh profile after returning from external checkout (?checkout=success).
  // The InfinitePay webhook activates the plan; we just re-fetch a few times to pick it up.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 8;

    const poll = async () => {
      while (!cancelled && attempts < maxAttempts) {
        attempts++;
        queryClient.invalidateQueries({ queryKey: ["profile"] });
        await new Promise((r) => setTimeout(r, 2500));
      }
      if (!cancelled) {
        window.history.replaceState({}, "", "/dashboard");
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [queryClient]);

  const handleGoalSet = async (target: number) => {
    await addGoal({
      title: `Meta de Shows - ${format(now, "MMMM yyyy", { locale: ptBR })}`,
      type: "shows",
      target_value: target,
      current_value: 0,
      month: currentMonth,
      year: currentYear,
    });
    setShowGoalModal(false);
  };

  // Calculate leads this month vs last month
  const leadsThisMonth = useMemo(() => {
    const crmStatuses = ["new", "proposal", "closed", "not_closed"];
    return leads.filter((lead) => {
      const createdDate = new Date(lead.created_at);
      return crmStatuses.includes(lead.status) && 
             createdDate >= currentMonthStart && 
             createdDate <= currentMonthEnd;
    }).length;
  }, [leads, currentMonthStart, currentMonthEnd]);

  const leadsLastMonth = useMemo(() => {
    const crmStatuses = ["new", "proposal", "closed", "not_closed"];
    return leads.filter((lead) => {
      const createdDate = new Date(lead.created_at);
      return crmStatuses.includes(lead.status) && 
             createdDate >= lastMonthStart && 
             createdDate <= lastMonthEnd;
    }).length;
  }, [leads, lastMonthStart, lastMonthEnd]);

  // Calculate shows this month vs last month (all statuses except cancelled)
  const showsThisMonth = useMemo(() => {
    return shows.filter((show) => {
      const showDate = parseLocalDate(show.date);
      return show.status !== "cancelled" && 
             showDate >= currentMonthStart && 
             showDate <= currentMonthEnd;
    }).length;
  }, [shows, currentMonthStart, currentMonthEnd]);

  const showsLastMonth = useMemo(() => {
    return shows.filter((show) => {
      const showDate = parseLocalDate(show.date);
      return show.status !== "cancelled" && 
             showDate >= lastMonthStart && 
             showDate <= lastMonthEnd;
    }).length;
  }, [shows, lastMonthStart, lastMonthEnd]);

  // Calculate revenue this month vs last month
  const revenueThisMonth = useMemo(() => {
    return transactions
      .filter((t) => {
      const transactionDate = parseLocalDate(t.date);
        return t.type === "income" && 
               transactionDate >= currentMonthStart && 
               transactionDate <= currentMonthEnd;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions, currentMonthStart, currentMonthEnd]);

  const revenueLastMonth = useMemo(() => {
    return transactions
      .filter((t) => {
        const transactionDate = parseLocalDate(t.date);
        return t.type === "income" && 
               transactionDate >= lastMonthStart && 
               transactionDate <= lastMonthEnd;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions, lastMonthStart, lastMonthEnd]);

  // Calculate closed sales
  const closedSales = useMemo(() => {
    return leads.filter((lead) => lead.status === "closed").length;
  }, [leads]);

  // Calculate pending cachets (shows confirmed/scheduled but not completed)
  const pendingCachetData = useMemo(() => {
    const validStatuses = ["confirmed", "scheduled", "pending", "negotiation"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pendingShows = shows
      .filter((show) => {
        const showDate = parseISO(show.date);
        return validStatuses.includes(show.status) && showDate >= today;
      })
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .map((show) => ({
        id: show.id,
        title: show.title,
        date: format(parseISO(show.date), "dd MMM", { locale: ptBR }),
        cachet: Number(show.cachet),
        status: show.status,
      }));

    const totalPending = pendingShows.reduce((sum, show) => sum + show.cachet, 0);
    
    const totalReceived = transactions
      .filter((t) => {
        const transactionDate = parseLocalDate(t.date);
        return t.type === "income" && 
               t.show_id !== null &&
               transactionDate >= currentMonthStart && 
               transactionDate <= currentMonthEnd;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { pendingShows, totalPending, totalReceived };
  }, [shows, transactions, now, currentMonthStart, currentMonthEnd]);

  // Upcoming shows with enhanced data
  const upcomingShows = useMemo(() => {
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return shows
      .filter((show) => {
        const d = parseLocalDate(show.date);
        if (!d) return false;
        return d >= todayStart && show.status !== "cancelled";
      })
      .sort((a, b) => (parseLocalDate(a.date)?.getTime() ?? 0) - (parseLocalDate(b.date)?.getTime() ?? 0))
      .slice(0, 3)
      .map((show) => {
        const client = clients.find(c => c.id === show.client_id);
        const hasContract = contractShowIds.includes(show.id);
        const localDate = parseLocalDate(show.date) ?? new Date(show.date);
        return {
          id: show.id,
          date: format(localDate, "dd MMM", { locale: ptBR }),
          title: show.title,
          location: show.venue || "Local a definir",
          value: `R$ ${Number(show.cachet).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          status: show.status as any,
          clientPhone: client?.phone || undefined,
          hasContract,
        };
      });
  }, [shows, clients, contractShowIds, now]);


  // Total revenue hero calculations
  const totalAllTimeRevenue = useMemo(() => {
    return transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const completedShowsAllTime = useMemo(() => {
    return shows.filter(s => s.status === "finalizado" || s.status === "completed" || s.status === "partial").length;
  }, [shows]);

  const revenueGrowth = useMemo(() => {
    if (revenueLastMonth === 0) return revenueThisMonth > 0 ? 100 : 0;
    return ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
  }, [revenueThisMonth, revenueLastMonth]);

  // Best fee ever received (highest cachet from completed shows)
  const bestFeeShow = useMemo(() => {
    const completed = shows.filter(s => s.status === "finalizado" || s.status === "completed" || s.status === "partial");
    if (completed.length === 0) return null;
    const best = completed.reduce((max, s) => Number(s.cachet) > Number(max.cachet) ? s : max, completed[0]);
    return { value: Number(best.cachet), showTitle: best.title };
  }, [shows]);

  // Annual projection: média de shows/mês × 12 × cachê médio
  const annualProjection = useMemo(() => {
    // Shows completados neste ano
    const completedThisYear = shows.filter(s => 
      (s.status === "completed" || s.status === "partial") && s.date.startsWith(String(currentYear))
    );
    if (completedThisYear.length === 0) return 0;

    // Quantos meses já se passaram no ano (mínimo 1)
    const currentMonth = now.getMonth() + 1; // 1-12
    const monthsElapsed = Math.max(currentMonth, 1);

    // Média de shows por mês
    const avgShowsPerMonth = completedThisYear.length / monthsElapsed;

    // Cachê médio dos shows completados neste ano
    const totalCachet = completedThisYear.reduce((sum, s) => sum + Number(s.cachet || 0), 0);
    const avgCachet = totalCachet / completedThisYear.length;

    // Projeção: média mensal × 12 × cachê médio
    return Math.round(avgShowsPerMonth * 12 * avgCachet * 100) / 100;
  }, [shows, currentYear, now]);

  // Best month ever (by income transactions)
  const bestMonth = useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.type === "income");
    if (incomeTransactions.length === 0) return null;
    
    const byMonth: Record<string, number> = {};
    incomeTransactions.forEach(t => {
      const key = t.date.substring(0, 7); // YYYY-MM
      byMonth[key] = (byMonth[key] || 0) + Number(t.amount);
    });

    const bestKey = Object.entries(byMonth).reduce((best, [key, val]) => 
      val > best[1] ? [key, val] : best, ["", 0]);
    
    if (!bestKey[0]) return null;
    const [year, month] = (bestKey[0] as string).split("-");
    const monthName = format(new Date(Number(year), Number(month) - 1), "MMMM", { locale: ptBR });
    return { month: monthName, value: bestKey[1] as number };
  }, [transactions]);

  // Check if user has data for recommended actions
  const hasLeads = leads.length > 0;
  const hasShows = shows.length > 0;
  const hasContracts = contractsCount > 0;
  const hasGoals = goals.length > 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Layout title="Dashboard" subtitle="Visão geral da sua carreira">
        <div className="space-y-6">
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </Layout>
    );
  }

  const greetingTitle = `Olá, ${profile?.name || 'Artista'}!`;
  const greetingSubtitle = format(now, "'Hoje é' EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <Layout title={greetingTitle} subtitle={greetingSubtitle} headerRightSlot={<HeaderTrialPill />}>
      {/* Monthly Show Goal Modal */}
      <MonthlyShowGoalModal
        open={showGoalModal}
        onClose={handleGoalSet}
        monthName={currentMonthName}
      />



      <div className="space-y-4 sm:space-y-6">


        {/* Ranking Teaser - removido temporariamente */}
        {false && <RankingTeaser />}

        {/* Aviso de renovação (mensal próximo do vencimento) */}
        <RenewSoonBanner />

        {/* Backs Radar - App parceiro */}
        <PartnerAdBanner />


        {/* Próxima consultoria / apresentação — temporariamente desativado */}
        {/* <NextConsultoriaCard /> */}

        {/* #1 Hero compacto: nome, nível, 4 stats inline, meta mensal */}
        <CompactCareerHero
          artistName={profile?.name || "Artista"}
          avatarUrl={profile?.avatar_url || null}
          totalRevenue={totalAllTimeRevenue}
          completedShowsCount={completedShowsAllTime}
          bestFee={bestFeeShow}
          monthlyGoalProgress={
            currentShowGoal && currentShowGoal.target_value > 0
              ? (completedShowsThisMonth / currentShowGoal.target_value) * 100
              : 0
          }
          monthlyGoalTarget={currentShowGoal?.target_value || 0}
          monthlyGoalAchieved={completedShowsThisMonth}
          annualProjection={annualProjection}
        />

        {/* Cachês a receber + Termômetro da carreira lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <PendingCachetBanner
            totalPending={pendingCachetData.totalPending}
            pendingCount={pendingCachetData.pendingShows.length}
          />
          <CareerThermometerCard
            showsThisMonth={showsThisMonth}
            showsLastMonth={showsLastMonth}
            monthlyGoal={currentShowGoal?.target_value || 0}
            monthlyGoalProgress={
              currentShowGoal && currentShowGoal.target_value > 0
                ? (completedShowsThisMonth / currentShowGoal.target_value) * 100
                : 0
            }
            revenueThisMonth={revenueThisMonth}
            revenueLastMonth={revenueLastMonth}
          />
        </div>

        {/* Conquistas */}
        <DashboardAchievementsCard />

        {/* Onde você mais toca — distribuição por tipo de evento */}
        <EventTypeBreakdownCard shows={shows} />

        {/* Ação recomendada */}
        <RecommendedActionCard
          hasLeads={hasLeads}
          hasShows={hasShows}
          hasContracts={hasContracts}
          hasGoals={hasGoals}
          pendingCachet={pendingCachetData.totalPending}
          upcomingShowsCount={upcomingShows.length}
        />


        {/* Financial & Shows Row - #6 próximos shows com resumo do mês */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <PendingCachetCard
            pendingShows={pendingCachetData.pendingShows}
            totalPending={pendingCachetData.totalPending}
            totalReceived={pendingCachetData.totalReceived}
          />
          <UpcomingShowsCard
            shows={upcomingShows}
            monthlySummary={{
              monthName: `${currentMonthName} ${currentYear}`,
              showsCount: showsThisMonth,
              totalValue: pendingCachetData.pendingShows
                .filter((s) => {
                  // pending shows that fall in current month
                  const showRaw = shows.find((sh) => sh.id === s.id);
                  if (!showRaw) return false;
                  const d = parseLocalDate(showRaw.date);
                  return d >= currentMonthStart && d <= currentMonthEnd;
                })
                .reduce((sum, s) => sum + s.cachet, 0),
            }}
          />
        </div>

        {/* Monthly Show Goal Progress - at the end */}
        {currentShowGoal && (
          <div className="animate-fade-in">
            <MonthlyShowGoalProgress
              current={completedShowsThisMonth}
              target={currentShowGoal.target_value}
              monthName={currentMonthName}
            />
          </div>
        )}

      </div>
    </Layout>
  );
};

export default Dashboard;
