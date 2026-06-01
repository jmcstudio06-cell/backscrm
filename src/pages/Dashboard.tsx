import { Layout } from "@/components/layout/Layout";
import { CareerVideogameHeader } from "@/components/dashboard/CareerVideogameHeader";
import { PendingCachetHighlight } from "@/components/dashboard/PendingCachetHighlight";
import { MonthlyEvolutionChart } from "@/components/dashboard/MonthlyEvolutionChart";
import { RankingDashboardCard } from "@/components/dashboard/RankingDashboardCard";
import { RecommendedActionCard } from "@/components/dashboard/RecommendedActionCard";
import { UpcomingShowsCard } from "@/components/dashboard/UpcomingShowsCard";
import { MonthlyShowGoalModal } from "@/components/dashboard/MonthlyShowGoalModal";
import { MonthlyShowGoalProgress } from "@/components/dashboard/MonthlyShowGoalProgress";
import { TrialCountdownCard } from "@/components/dashboard/TrialCountdownCard";

import { RenewSoonBanner } from "@/components/dashboard/RenewSoonBanner";
import { NextConsultoriaCard } from "@/components/dashboard/NextConsultoriaCard";
import { WelcomeVideoModal } from "@/components/onboarding/WelcomeVideoModal";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

import { GiftClaimCard } from "@/components/gifts/GiftClaimCard";
import { useLeads } from "@/hooks/useLeads";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useShows } from "@/contexts/shows/ShowsContext";
import { useProfile } from "@/hooks/useProfile";
import { useClients } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { parseLocalDate } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Lightbulb, ChevronRight } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { leads, loading: leadsLoading } = useLeads();
  const { transactions, loading: transactionsLoading } = useTransactions({ fullHistory: true });
  const { goals, loading: goalsLoading, addGoal } = useGoals();
  const { shows, loading: showsLoading } = useShows();
  const { profile, loading: profileLoading } = useProfile();
  const { clients, loading: clientsLoading } = useClients();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showWelcomeVideo, setShowWelcomeVideo] = useState(false);
  
  // Onboarding flow handles its own goal step — suppress legacy goal modal during onboarding
  const onboardingActive = showWelcomeVideo || showWelcome;
  const [checklistsUsed, setChecklistsUsed] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  // Lightweight counts instead of full data hooks
  const [contractsCount, setContractsCount] = useState(0);
  const [contractShowIds, setContractShowIds] = useState<string[]>([]);
  const [stageMappingsCount, setStageMappingsCount] = useState(0);
  const [rankingPosition, setRankingPosition] = useState<number | null>(null);
  const [myBadges, setMyBadges] = useState<{ badge_type: string; month: number; year: number }[]>([]);

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

  // Check if user should see onboarding, checklists, and fetch lightweight counts
  useEffect(() => {
    if (profileLoading || !profile) return;

    // Check onboarding using already-loaded profile (no auth.getUser call)
    if (!profile.onboarding_completed) {
      // Show the mandatory welcome video ONLY on first signup (once per user)
      const videoSeenKey = `welcome_video_seen_${profile.user_id}`;
      const videoSeen = localStorage.getItem(videoSeenKey);
      if (!videoSeen) {
        setShowWelcomeVideo(true);
      } else {
        setShowWelcome(true);
      }
    }
    // Onboarding handles install/notifications/goal in one flow.
    // Do NOT show extra install/notification prompts afterwards.

    // Batch lightweight count queries (checklist agora é 100% local — sem query)
    const fetchCounts = async () => {
      const [contractsResult, mappingsResult, rankingResult] = await Promise.all([
        supabase.from("contracts").select("id, show_id").order("created_at", { ascending: false }).limit(5),
        supabase.from("stage_mappings").select("*", { count: "exact", head: true }),
        supabase.rpc("get_monthly_show_ranking_for_month", {
          target_month: currentMonth,
          target_year: currentYear,
        }),
      ]);

      // Process ranking
      if (rankingResult.data) {
        const typedRanking = rankingResult.data as any[];
        const position = typedRanking.findIndex((r) => r.user_id === profile.user_id);
        setRankingPosition(position !== -1 ? position + 1 : null);
      }

      // Fetch badges (simplified version for dashboard)
      const { data: badgesData } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", profile.user_id)
        .order("created_at", { ascending: false })
        .limit(3);
      
      setMyBadges(badgesData || []);

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
  }, [profile, profileLoading, currentMonth, currentYear]);

  // Find current month's show goal
  const currentShowGoal = useMemo(() => {
    return goals.find(
      (g) => g.type === "shows" && g.month === currentMonth && g.year === currentYear
    );
  }, [goals, currentMonth, currentYear]);

  // Count confirmed + completed shows this month (all except cancelled)
  const completedShowsThisMonth = useMemo(() => {
    return shows.filter((show) => {
      const showDate = parseLocalDate(show.date);
      return (
        (show.status === "completed" || show.status === "confirmed") &&
        showDate >= currentMonthStart &&
        showDate <= currentMonthEnd
      );
    }).length;
  }, [shows, currentMonthStart, currentMonthEnd]);

  // Monthly evolution data (last 4 months)
  const monthlyEvolution = useMemo(() => {
    const months = [];
    for (let i = 3; i >= 0; i--) {
      const date = subMonths(now, i);
      const mStart = startOfMonth(date);
      const mEnd = endOfMonth(date);
      const mName = format(date, "MMMM", { locale: ptBR });
      
      const count = shows.filter(s => {
        const sDate = parseLocalDate(s.date);
        return s.status !== "cancelled" && sDate >= mStart && sDate <= mEnd;
      }).length;
      
      const revenue = transactions
        .filter(t => {
          const tDate = parseLocalDate(t.date);
          return t.type === "income" && tDate >= mStart && tDate <= mEnd;
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      months.push({ name: mName, count, revenue });
    }
    return months;
  }, [shows, transactions, now]);

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
  }, [shows, transactions, currentMonthStart, currentMonthEnd]);

  // Upcoming shows with enhanced data
  const upcomingShows = useMemo(() => {
    const showsData = shows
      .filter((show) => parseISO(show.date) >= now && show.status !== "cancelled")
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 3)
      .map((show) => {
        const client = clients.find(c => c.id === show.client_id);
        const hasContract = contractShowIds.includes(show.id);
        
        return {
          id: show.id,
          date: format(parseISO(show.date), "dd MMM", { locale: ptBR }),
          title: show.title,
          location: show.venue || "Local a definir",
          value: `R$ ${Number(show.cachet).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
          status: show.status as "confirmed" | "pending" | "completed",
          clientPhone: client?.phone || undefined,
          hasContract,
        };
      });

    // Calculate current month totals for upcoming section
    const monthlyShows = shows.filter(s => {
      const sDate = parseLocalDate(s.date);
      return s.status !== "cancelled" && sDate >= currentMonthStart && sDate <= currentMonthEnd;
    });
    const monthlyRevenue = monthlyShows.reduce((sum, s) => sum + Number(s.cachet || 0), 0);

    return {
      shows: showsData,
      monthTotal: monthlyRevenue,
      monthCount: monthlyShows.length,
      monthName: currentMonthName
    };
  }, [shows, clients, contractShowIds, now, currentMonthStart, currentMonthEnd, currentMonthName]);

  // Total revenue hero calculations
  const totalAllTimeRevenue = useMemo(() => {
    return transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const completedShowsAllTime = useMemo(() => {
    return shows.filter(s => s.status === "finalizado" || s.status === "completed").length;
  }, [shows]);

  const revenueGrowth = useMemo(() => {
    if (revenueLastMonth === 0) return revenueThisMonth > 0 ? 100 : 0;
    return ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
  }, [revenueThisMonth, revenueLastMonth]);

  // Best fee ever received (highest cachet from completed shows)
  const bestFeeShow = useMemo(() => {
    const completed = shows.filter(s => s.status === "finalizado" || s.status === "completed");
    if (completed.length === 0) return null;
    const best = completed.reduce((max, s) => Number(s.cachet) > Number(max.cachet) ? s : max, completed[0]);
    return { value: Number(best.cachet), showTitle: best.title };
  }, [shows]);

  const hasLeads = leads.length > 0;
  const hasShows = shows.length > 0;
  const hasContracts = contractsCount > 0;
  const hasGoals = goals.length > 0;

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

  return (
    <Layout title="Dashboard" subtitle="Visão geral da sua carreira">
      {/* Monthly Show Goal Modal */}
      <MonthlyShowGoalModal
        open={showGoalModal}
        onClose={handleGoalSet}
        monthName={currentMonthName}
      />

      {/* Mandatory welcome video — only on FIRST signup, cannot be skipped */}
      <WelcomeVideoModal
        open={showWelcomeVideo}
        userName={profile?.name || undefined}
        onFinished={() => {
          if (profile?.user_id) {
            localStorage.setItem(`welcome_video_seen_${profile.user_id}`, "1");
          }
          setShowWelcomeVideo(false);
          setShowWelcome(true);
        }}
      />

      {/* Unified onboarding flow (4 steps): Install → Notifications → Goal → Ready */}
      <OnboardingFlow
        open={showWelcome}
        userName={profile?.name || undefined}
        monthName={currentMonthName}
        onFinish={async (goalTarget) => {
          if (goalTarget) {
            try {
              await handleGoalSet(goalTarget);
            } catch (e) {
              console.error("Error saving goal from onboarding:", e);
            }
          }
          setShowWelcome(false);
          queryClient.invalidateQueries({ queryKey: ["profile"] });
        }}
      />


      <div className="space-y-6 sm:space-y-8 pb-10">
        {/* Gift & Trial Banners */}
        <div className="space-y-4">
          <GiftClaimCard />
          <TrialCountdownCard />
          <RenewSoonBanner />
        </div>

        {/* Videogame Header Section */}
        <CareerVideogameHeader
          completedShowsThisMonth={completedShowsThisMonth}
          currentShowGoalTarget={currentShowGoal?.target_value || 0}
          totalAllTimeRevenue={totalAllTimeRevenue}
          completedShowsAllTime={completedShowsAllTime}
          revenueGrowth={revenueGrowth}
          rankingPosition={rankingPosition}
          myBadgesCount={myBadges.length}
        />

        {/* Pending Cachet Highlight (Very Top Visibility) */}
        <PendingCachetHighlight totalPending={pendingCachetData.totalPending} />

        {/* Main Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyEvolutionChart data={monthlyEvolution} />
          <RankingDashboardCard position={rankingPosition} badges={myBadges} />
        </div>

        {/* Secondary Rows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingShowsCard 
            shows={upcomingShows.shows} 
            monthTotal={upcomingShows.monthTotal}
            monthCount={upcomingShows.monthCount}
            monthName={upcomingShows.monthName}
          />
          <RecommendedActionCard
            hasLeads={hasLeads}
            hasShows={hasShows}
            hasContracts={hasContracts}
            hasGoals={hasGoals}
            pendingCachet={pendingCachetData.totalPending}
            upcomingShowsCount={upcomingShows.shows.length}
          />
        </div>

        {/* Admin content / Consultoria */}
        <NextConsultoriaCard />

        {/* Monthly Show Goal Progress - optional at bottom if they want more detail */}
        {currentShowGoal && (
          <div className="animate-fade-in opacity-50 hover:opacity-100 transition-opacity">
            <MonthlyShowGoalProgress
              current={completedShowsThisMonth}
              target={currentShowGoal.target_value}
              monthName={currentMonthName}
            />
          </div>
        )}

        {/* Tutorials link */}
        <div className="flex justify-center">
          <button
            onClick={() => navigate("/tutoriais")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/5 border border-primary/15 hover:bg-primary/10 transition-all group"
          >
            <Lightbulb className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold text-foreground">Dicas para evoluir sua carreira</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default Dashboard;
