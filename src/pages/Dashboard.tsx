import { Layout } from "@/components/layout/Layout";
import { CareerStatusCard } from "@/components/dashboard/CareerStatusCard";
import { RecommendedActionCard } from "@/components/dashboard/RecommendedActionCard";
import { PendingCachetCard } from "@/components/dashboard/PendingCachetCard";
import { ArtistJourneyCard } from "@/components/dashboard/ArtistJourneyCard";
import { TrialCountdownCard } from "@/components/dashboard/TrialCountdownCard";
import { UpcomingShowsCard } from "@/components/dashboard/UpcomingShowsCard";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useLeads } from "@/hooks/useLeads";
import { useTransactions } from "@/hooks/useTransactions";
import { useGoals } from "@/hooks/useGoals";
import { useShows } from "@/contexts/ShowsContext";
import { useProfile } from "@/hooks/useProfile";
import { useContracts } from "@/hooks/useContracts";
import { useClients } from "@/hooks/useClients";
import { useStageMappings } from "@/hooks/useStageMappings";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState, useEffect } from "react";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { leads, loading: leadsLoading } = useLeads();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { goals, loading: goalsLoading } = useGoals();
  const { shows, loading: showsLoading } = useShows();
  const { profile, loading: profileLoading } = useProfile();
  const { contracts, loading: contractsLoading } = useContracts();
  const { clients, loading: clientsLoading } = useClients();
  const { mappings: stageMappings, loading: stageMappingsLoading } = useStageMappings();
  const [showWelcome, setShowWelcome] = useState(false);
  const [checklistsUsed, setChecklistsUsed] = useState(false);

  // Unified loading state - only show content when main data is ready
  const isLoading = leadsLoading || transactionsLoading || showsLoading || profileLoading || contractsLoading || clientsLoading;

  // Check if user should see onboarding and if user has used checklists
  useEffect(() => {
    const checkData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check onboarding
        const { data: profileData } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (profileData && !profileData.onboarding_completed) {
          setShowWelcome(true);
        }

        // Check if user has used checklists
        const { count } = await supabase
          .from("show_checklist")
          .select("*", { count: "exact", head: true });
        
        setChecklistsUsed((count || 0) > 0);
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

  // Calculate shows this month vs last month (all statuses except cancelled)
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

  // Calculate closed sales
  const closedSales = useMemo(() => {
    return leads.filter((lead) => lead.status === "closed").length;
  }, [leads]);

  // Calculate pending cachets (shows confirmed but not completed)
  const pendingCachetData = useMemo(() => {
    const pendingShows = shows
      .filter((show) => {
        const showDate = parseISO(show.date);
        return show.status === "confirmed" && showDate >= now;
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
    
    // Total received this month
    const totalReceived = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return t.type === "income" && 
               t.category === "Shows" &&
               transactionDate >= currentMonthStart && 
               transactionDate <= currentMonthEnd;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return { pendingShows, totalPending, totalReceived };
  }, [shows, transactions, now, currentMonthStart, currentMonthEnd]);

  // Upcoming shows with enhanced data
  const upcomingShows = useMemo(() => {
    return shows
      .filter((show) => parseISO(show.date) >= now && show.status !== "cancelled")
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 3)
      .map((show) => {
        // Find client phone
        const client = clients.find(c => c.id === show.client_id);
        // Check if has contract
        const hasContract = contracts.some(c => c.show_id === show.id);
        
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
  }, [shows, clients, contracts, now]);

  // Check if user has data for recommended actions
  const hasLeads = leads.length > 0;
  const hasShows = shows.length > 0;
  const hasContracts = contracts.length > 0;
  const hasGoals = goals.length > 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Layout title="Dashboard" subtitle="Visão geral da sua carreira">
        <div className="space-y-6">
          {/* Trial Card skeleton */}
          <Skeleton className="h-16 w-full rounded-xl" />
          
          {/* Welcome Section skeleton */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>

          {/* Main Status Cards Row skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>

          {/* Financial & Shows Row skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>

          {/* Artist Journey skeleton */}
          <Skeleton className="h-48 w-full rounded-xl" />
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

      <div className="space-y-6">
        {/* Trial Countdown Card */}
        <TrialCountdownCard />

        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Olá, {profile?.name || 'Artista'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(now, "'Hoje é' EEEE, dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Main Status Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CareerStatusCard
            leadsThisMonth={leadsThisMonth}
            leadsLastMonth={leadsLastMonth}
            showsThisMonth={showsThisMonth}
            showsLastMonth={showsLastMonth}
            revenueThisMonth={revenueThisMonth}
            revenueLastMonth={revenueLastMonth}
          />
          <RecommendedActionCard
            hasLeads={hasLeads}
            hasShows={hasShows}
            hasContracts={hasContracts}
            hasGoals={hasGoals}
            pendingCachet={pendingCachetData.totalPending}
            upcomingShowsCount={upcomingShows.length}
          />
        </div>

        {/* Financial & Shows Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PendingCachetCard
            pendingShows={pendingCachetData.pendingShows}
            totalPending={pendingCachetData.totalPending}
            totalReceived={pendingCachetData.totalReceived}
          />
          <UpcomingShowsCard shows={upcomingShows} />
        </div>

        {/* Artist Journey Timeline */}
        <ArtistJourneyCard
          trialStart={profile?.trial_start || null}
          showsCount={shows.length}
          totalRevenue={transactions.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0)}
          contractsCount={contracts.length}
          checklistsUsed={checklistsUsed}
          stageMappingsCount={stageMappings.length}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;
