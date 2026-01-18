import { Layout } from "@/components/layout/Layout";
import { CareerStatusCard } from "@/components/dashboard/CareerStatusCard";
import { RecommendedActionCard } from "@/components/dashboard/RecommendedActionCard";
import { FinancialSummaryCard } from "@/components/dashboard/FinancialSummaryCard";
import { Last30DaysCard } from "@/components/dashboard/Last30DaysCard";
import { JourneyChecklistCard } from "@/components/dashboard/JourneyChecklistCard";
import { BonusCard } from "@/components/dashboard/BonusCard";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { GiftClaimCard } from "@/components/gifts/GiftClaimCard";
import { useLeads } from "@/hooks/useLeads";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useAnnualGoals } from "@/hooks/useAnnualGoals";
import { useShows } from "@/contexts/ShowsContext";
import { useProfile } from "@/hooks/useProfile";
import { useContracts } from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState, useEffect } from "react";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { leads, loading: leadsLoading } = useLeads();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { goals, loading: goalsLoading } = useGoals();
  const { goals: annualGoals, loading: annualGoalsLoading } = useAnnualGoals();
  const { shows, loading: showsLoading } = useShows();
  const { profile, loading: profileLoading } = useProfile();
  const { contracts, loading: contractsLoading } = useContracts();
  const { clients, loading: clientsLoading } = useClients();
  const [showWelcome, setShowWelcome] = useState(false);

  // Unified loading state
  const isLoading = leadsLoading || transactionsLoading || showsLoading || profileLoading || contractsLoading || clientsLoading || goalsLoading;

  // Check if user should see onboarding
  useEffect(() => {
    const checkData = async () => {
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
    checkData();
  }, []);

  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

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

  // Calculate shows this month vs last month
  const showsThisMonth = useMemo(() => {
    return shows.filter((show) => {
      const showDate = new Date(show.date);
      return show.status !== "cancelled" && 
             showDate >= currentMonthStart && 
             showDate <= currentMonthEnd;
    }).length;
  }, [shows, currentMonthStart, currentMonthEnd]);

  const showsLastMonth = useMemo(() => {
    return shows.filter((show) => {
      const showDate = new Date(show.date);
      return show.status !== "cancelled" && 
             showDate >= lastMonthStart && 
             showDate <= lastMonthEnd;
    }).length;
  }, [shows, lastMonthStart, lastMonthEnd]);

  // Calculate revenue this month vs last month
  const revenueThisMonth = useMemo(() => {
    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return t.type === "income" && 
               transactionDate >= currentMonthStart && 
               transactionDate <= currentMonthEnd;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions, currentMonthStart, currentMonthEnd]);

  const revenueLastMonth = useMemo(() => {
    return transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return t.type === "income" && 
               transactionDate >= lastMonthStart && 
               transactionDate <= lastMonthEnd;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions, lastMonthStart, lastMonthEnd]);

  // Calculate pending cachets
  const pendingCachetData = useMemo(() => {
    const validStatuses = ["confirmed", "scheduled", "pending", "negotiation"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pendingShows = shows
      .filter((show) => {
        const showDate = parseISO(show.date);
        return validStatuses.includes(show.status) && showDate >= today;
      });

    const totalPending = pendingShows.reduce((sum, show) => sum + Number(show.cachet), 0);
    
    const totalReceived = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return t.type === "income" && 
               t.show_id !== null &&
               transactionDate >= currentMonthStart && 
               transactionDate <= currentMonthEnd;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { totalPending, totalReceived };
  }, [shows, transactions, currentMonthStart, currentMonthEnd]);

  // Upcoming shows count
  const upcomingShowsCount = useMemo(() => {
    return shows.filter((show) => parseISO(show.date) >= now && show.status !== "cancelled").length;
  }, [shows, now]);

  // Check if user has data for recommended actions
  const hasLeads = leads.length > 0;
  const hasShows = shows.length > 0;
  const hasContracts = contracts.length > 0;
  const hasGoals = goals.length > 0;
  const hasMonthlyGoal = goals.length > 0;
  const hasAnnualGoal = annualGoals.length > 0;

  // Total revenue for journey card
  const totalRevenue = useMemo(() => {
    return transactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  // Loading skeleton
  if (isLoading) {
    return (
      <Layout title="Dashboard" subtitle="Visão geral da sua carreira">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4 sm:space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
            <div className="space-y-4 sm:space-y-6">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-56 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" subtitle="Visão geral da sua carreira">
      {/* Welcome/Onboarding Modal */}
      <WelcomeModal 
        open={showWelcome} 
        onClose={() => setShowWelcome(false)}
        userName={profile?.name || undefined}
      />

      <div className="space-y-4 sm:space-y-6">
        {/* Gift Claim Card */}
        <GiftClaimCard />

        {/* Welcome Section */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Olá, {profile?.name || profile?.artist_name || 'Artista'}!
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(now, "'Hoje é' EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Career Status Card */}
            <CareerStatusCard
              leadsThisMonth={leadsThisMonth}
              leadsLastMonth={leadsLastMonth}
              showsThisMonth={showsThisMonth}
              showsLastMonth={showsLastMonth}
              revenueThisMonth={revenueThisMonth}
              revenueLastMonth={revenueLastMonth}
            />

            {/* Financial Summary Card */}
            <FinancialSummaryCard
              totalPending={pendingCachetData.totalPending}
              totalReceived={pendingCachetData.totalReceived}
              hasContracts={hasContracts}
            />

            {/* Last 30 Days Card */}
            <Last30DaysCard
              leadsThisMonth={leadsThisMonth}
              leadsLastMonth={leadsLastMonth}
              showsThisMonth={showsThisMonth}
              showsLastMonth={showsLastMonth}
              revenueThisMonth={revenueThisMonth}
              revenueLastMonth={revenueLastMonth}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Recommended Action Card */}
            <RecommendedActionCard
              hasLeads={hasLeads}
              hasShows={hasShows}
              hasContracts={hasContracts}
              hasGoals={hasGoals}
              pendingCachet={pendingCachetData.totalPending}
              upcomingShowsCount={upcomingShowsCount}
            />

            {/* Journey Checklist Card */}
            <JourneyChecklistCard
              trialStart={profile?.trial_start || null}
              showsCount={shows.length}
              totalRevenue={totalRevenue}
              contractsCount={contracts.length}
              hasMonthlyGoal={hasMonthlyGoal}
              hasAnnualGoal={hasAnnualGoal}
            />

            {/* Bonus Card */}
            <BonusCard />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
