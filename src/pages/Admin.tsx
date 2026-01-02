import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAppSettings } from "@/hooks/useAppSettings";
import { 
  Shield, 
  Calendar, 
  Zap, 
  Users as UsersIcon, 
  Heart, 
  AlertCircle,
  Search,
  Eye,
  Info,
  Upload,
  Image,
  Target,
  DollarSign,
  Mic2,
  Key,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { AdminInsights } from "@/components/admin/AdminInsights";
import { Progress } from "@/components/ui/progress";

interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  plan: string | null;
  trial_start: string | null;
  trial_days: number | null;
  created_at: string;
  last_seen: string | null;
}

interface FeatureBlock {
  user_id: string;
  feature_key: string;
  blocked: boolean;
}

interface UserGoal {
  id: string;
  user_id: string;
  goal_type: string;
  target_value: number;
  month: number;
  year: number;
}

const FEATURES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "agenda", label: "Agenda" },
  { key: "crm", label: "Funil de Vendas" },
  { key: "clientes", label: "Clientes" },
  { key: "orcamentos", label: "Orçamentos" },
  { key: "contratos", label: "Contratos" },
  { key: "financeiro", label: "Financeiro" },
  { key: "historico", label: "Histórico" },
  { key: "precificacao", label: "Precificação" },
  { key: "checklist", label: "Checklist" },
  { key: "mapeamento-palco", label: "Mapeamento de Palco" },
  { key: "equipe", label: "Equipe" },
  { key: "metas", label: "Metas" },
  { key: "repertorio", label: "Repertório" },
  { key: "aulas", label: "Aulas" },
  { key: "tutoriais", label: "Tutoriais" },
  { key: "configuracoes", label: "Configurações" },
];

const PLAN_FILTERS = [
  { value: "all", label: "TODOS" },
  { value: "trial", label: "TRIAL" },
  { value: "mensal", label: "PLANO MENSAL" },
  { value: "essencial", label: "PLANO PROFISSIONAL 3 MESES" },
  { value: "completo", label: "PLANO PROFISSIONAL 6 MESES" },
  { value: "expirado", label: "EXPIRADOS" },
];

// Plan durations in days
const PLAN_DURATIONS: Record<string, number> = {
  trial: 3,
  mensal: 30,
  essencial: 90,
  completo: 180,
};

// Features blocked for trial users
const TRIAL_BLOCKED_FEATURES = [
  "orcamentos",
  "contratos", 
  "precificacao",
  "checklist",
  "mapeamento-palco",
];

// Cache para evitar refetch ao navegar entre abas
const adminDataCache = {
  users: null as UserProfile[] | null,
  totalUsers: 0,
  featureBlocks: null as FeatureBlock[] | null,
  userGoals: null as UserGoal[] | null,
  trialDays: null as string | null,
  lastFetch: 0,
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
};

const USERS_PER_PAGE = 10;

export default function Admin() {
  const { user, loading: authLoading } = useRequireAuth();
  const { settings, refreshSettings } = useAppSettings();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [featureBlocks, setFeatureBlocks] = useState<FeatureBlock[]>([]);
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [userStats, setUserStats] = useState<Record<string, { leads: number; revenue: number; shows: number }>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [trialDays, setTrialDays] = useState("3");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [appName, setAppName] = useState("Backstage Pro");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [userNewPasswords, setUserNewPasswords] = useState<Record<string, string>>({});
  const [changingPasswords, setChangingPasswords] = useState<Record<string, boolean>>({});
  const dataLoaded = useRef(false);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (!user) return;
      
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      
      if (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }
      setLoading(false);
    }
    
    if (!authLoading) {
      checkAdmin();
    }
  }, [user, authLoading]);

  // Fetch users with pagination
  const fetchUsers = async (page: number, filter: string, search: string) => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    
    const from = (page - 1) * USERS_PER_PAGE;
    const to = from + USERS_PER_PAGE - 1;
    
    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    
    // Apply plan filter
    if (filter !== "all") {
      query = query.eq("plan", filter);
    }
    
    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Apply pagination
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Erro ao carregar usuários");
    } else {
      setUsers(data || []);
      setTotalUsers(count || 0);
    }
    setLoadingUsers(false);
  };

  // Fetch initial data and other configs (feature blocks, goals, settings)
  useEffect(() => {
    async function fetchInitialData() {
      if (!isAdmin) return;
      
      const now = Date.now();
      const cacheValid = adminDataCache.lastFetch > 0 && 
                         (now - adminDataCache.lastFetch) < adminDataCache.cacheTimeout;
      
      // Se cache válido, usa cache para dados secundários
      if (cacheValid && adminDataCache.featureBlocks && !dataLoaded.current) {
        setFeatureBlocks(adminDataCache.featureBlocks || []);
        setUserGoals(adminDataCache.userGoals || []);
        setTrialDays(adminDataCache.trialDays || "3");
        dataLoaded.current = true;
      } else {
        // Fetch all feature blocks
        const { data: blocksData, error: blocksError } = await supabase
          .from("user_feature_blocks")
          .select("*");

        if (blocksError) {
          console.error("Error fetching feature blocks:", blocksError);
        } else {
          setFeatureBlocks(blocksData || []);
          adminDataCache.featureBlocks = blocksData || [];
        }

        // Fetch trial duration setting
        const { data: settingsData } = await supabase
          .from("app_settings")
          .select("*")
          .eq("setting_key", "trial_duration_days")
          .single();

        if (settingsData) {
          setTrialDays(settingsData.setting_value || "3");
          adminDataCache.trialDays = settingsData.setting_value || "3";
        }

        // Fetch user goals
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const { data: goalsData } = await supabase
          .from("user_goals")
          .select("*")
          .eq("month", currentMonth)
          .eq("year", currentYear);

        if (goalsData) {
          setUserGoals(goalsData);
          adminDataCache.userGoals = goalsData;
        }
        
        adminDataCache.lastFetch = now;
        dataLoaded.current = true;
      }
      
      // Sempre busca usuários com paginação
      fetchUsers(1, planFilter, searchTerm);
    }

    fetchInitialData();
  }, [isAdmin]);

  // Buscar stats de um usuário específico sob demanda (quando expandir)
  const fetchUserStatsOnDemand = async (userId: string) => {
    if (userStats[userId]) return; // Já carregado, não refaz

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const endDate = currentMonth === 12 
      ? `${currentYear + 1}-01-01` 
      : `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;

    // Fazer as 3 queries em paralelo
    const [leadsResult, showsResult, transactionsResult] = await Promise.all([
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startDate)
        .lt("created_at", endDate),
      supabase
        .from("shows")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .neq("status", "cancelled")
        .gte("date", startDate)
        .lt("date", endDate),
      supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", userId)
        .eq("type", "income")
        .gte("date", startDate)
        .lt("date", endDate),
    ]);

    const revenue = transactionsResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    setUserStats(prev => ({
      ...prev,
      [userId]: {
        leads: leadsResult.count || 0,
        shows: showsResult.count || 0,
        revenue,
      },
    }));
  };

  // Quando expandir um usuário, carregar suas stats
  const handleExpandUser = (userId: string) => {
    const newExpandedUser = expandedUser === userId ? null : userId;
    setExpandedUser(newExpandedUser);
    if (newExpandedUser) {
      fetchUserStatsOnDemand(newExpandedUser);
    }
  };

  // Initialize app settings from context
  useEffect(() => {
    setAppName(settings.app_name);
    setLogoPreview(settings.logo_url);
  }, [settings]);

  const getFeatureBlocked = (userId: string, featureKey: string): boolean => {
    const block = featureBlocks.find(
      b => b.user_id === userId && b.feature_key === featureKey
    );
    return block?.blocked || false;
  };

  const toggleFeatureBlock = async (userId: string, featureKey: string) => {
    const currentBlocked = getFeatureBlocked(userId, featureKey);
    const newBlocked = !currentBlocked;

    // Upsert the feature block
    const { error } = await supabase
      .from("user_feature_blocks")
      .upsert({
        user_id: userId,
        feature_key: featureKey,
        blocked: newBlocked
      }, { onConflict: 'user_id,feature_key' });

    if (error) {
      console.error("Error updating feature block:", error);
      toast.error("Erro ao atualizar bloqueio");
    } else {
      // Update local state
      setFeatureBlocks(prev => {
        const existing = prev.find(b => b.user_id === userId && b.feature_key === featureKey);
        if (existing) {
          return prev.map(b => 
            b.user_id === userId && b.feature_key === featureKey 
              ? { ...b, blocked: newBlocked } 
              : b
          );
        } else {
          return [...prev, { user_id: userId, feature_key: featureKey, blocked: newBlocked }];
        }
      });
      toast.success(newBlocked ? "Página bloqueada para o usuário" : "Página desbloqueada para o usuário");
    }
  };

  const updateUserPlan = async (userId: string, plan: string) => {
    // When changing plan, also set trial_start to now for tracking
    const updates: { plan: string; trial_start?: string; trial_days?: number } = { plan };
    
    if (plan !== "expirado") {
      updates.trial_start = new Date().toISOString();
      updates.trial_days = PLAN_DURATIONS[plan] || 3;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating plan:", error);
      toast.error("Erro ao atualizar plano");
      return;
    }

    // Define feature blocks based on plan
    // trial: block specific features (orcamentos, contratos, precificacao, checklist, mapeamento-palco)
    // mensal/essencial/completo: unblock everything
    // expirado: block everything
    
    const featureUpdates = FEATURES.map(feature => {
      let blocked = false;
      
      if (plan === "expirado") {
        // Block all features when expired
        blocked = true;
      } else if (plan === "trial") {
        // Block specific features for trial
        blocked = TRIAL_BLOCKED_FEATURES.includes(feature.key);
      } else if (plan === "mensal" || plan === "essencial" || plan === "completo") {
        // Unblock all features for paid plans
        blocked = false;
      }
      
      return {
        user_id: userId,
        feature_key: feature.key,
        blocked
      };
    });

    // Upsert all feature blocks
    for (const featureUpdate of featureUpdates) {
      await supabase
        .from("user_feature_blocks")
        .upsert(featureUpdate, { onConflict: 'user_id,feature_key' });
    }

    // Update local state for feature blocks
    setFeatureBlocks(prev => {
      const otherBlocks = prev.filter(b => b.user_id !== userId);
      return [...otherBlocks, ...featureUpdates];
    });

    setUsers(prev => prev.map(u => 
      u.user_id === userId 
        ? { ...u, plan, trial_start: updates.trial_start || u.trial_start, trial_days: updates.trial_days || u.trial_days } 
        : u
    ));
    const planDuration = PLAN_DURATIONS[plan];
    toast.success(`Plano atualizado para ${plan.toUpperCase()} (${planDuration} dias)`);
  };

  // User goals management
  const getUserGoal = (userId: string, goalType: string): number => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const goal = userGoals.find(
      g => g.user_id === userId && g.goal_type === goalType && g.month === currentMonth && g.year === currentYear
    );
    return goal?.target_value || 0;
  };

  const updateUserGoal = async (userId: string, goalType: string, targetValue: number) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { data, error } = await supabase
      .from("user_goals")
      .upsert({
        user_id: userId,
        goal_type: goalType,
        target_value: targetValue,
        month: currentMonth,
        year: currentYear,
      }, { onConflict: 'user_id,goal_type,month,year' })
      .select()
      .single();

    if (error) {
      console.error("Error updating user goal:", error);
      toast.error("Erro ao atualizar meta");
    } else {
      setUserGoals(prev => {
        const existing = prev.find(
          g => g.user_id === userId && g.goal_type === goalType && g.month === currentMonth && g.year === currentYear
        );
        if (existing) {
          return prev.map(g => 
            g.user_id === userId && g.goal_type === goalType && g.month === currentMonth && g.year === currentYear
              ? data
              : g
          );
        } else {
          return [...prev, data];
        }
      });
      toast.success("Meta atualizada!");
    }
  };

  const saveTrialDays = async () => {
    const { error } = await supabase
      .from("app_settings")
      .upsert({
        setting_key: "trial_duration_days",
        setting_value: trialDays
      }, { onConflict: 'setting_key' });

    if (error) {
      console.error("Error saving trial days:", error);
      toast.error("Erro ao salvar configuração");
    } else {
      toast.success("Configuração salva");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    
    setUploadingLogo(true);
    
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `app-logo.${fileExt}`;
      
      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("app-assets")
        .upload(fileName, logoFile, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("app-assets")
        .getPublicUrl(fileName);

      const logoUrl = urlData.publicUrl;

      // Save URL to app_settings
      const { error: settingsError } = await supabase
        .from("app_settings")
        .upsert({
          setting_key: "logo_url",
          setting_value: logoUrl
        }, { onConflict: 'setting_key' });

      if (settingsError) {
        throw settingsError;
      }

      toast.success("Logo atualizada com sucesso!");
      refreshSettings();
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Erro ao fazer upload da logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const saveAppName = async () => {
    const { error } = await supabase
      .from("app_settings")
      .upsert({
        setting_key: "app_name",
        setting_value: appName
      }, { onConflict: 'setting_key' });

    if (error) {
      console.error("Error saving app name:", error);
      toast.error("Erro ao salvar nome do app");
    } else {
      toast.success("Nome do app atualizado!");
      refreshSettings();
    }
  };

  const handleChangeUserPassword = async (userId: string, userEmail: string) => {
    const newPassword = userNewPasswords[userId];
    if (!newPassword || newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setChangingPasswords(prev => ({ ...prev, [userId]: true }));
    
    try {
      // Update password via Supabase Auth Admin API
      // Note: This requires service role access through edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({ userId, newPassword }),
      });

      if (!response.ok) {
        throw new Error('Erro ao alterar senha');
      }

      toast.success(`Senha do usuário ${userEmail} alterada com sucesso!`);
      setUserNewPasswords(prev => ({ ...prev, [userId]: "" }));
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error("Para alterar senhas de usuários, entre em contato via WhatsApp: (12) 99154-5726");
    } finally {
      setChangingPasswords(prev => ({ ...prev, [userId]: false }));
    }
  };

  const getPlanStats = () => {
    // Stats são baseados no total, não na página atual
    // Para evitar queries extras, mostramos com base nos usuários da página
    // ou podemos manter um estado separado para stats gerais
    return {
      trial: 0,
      inicial: 0,
      essencial: 0,
      completo: 0,
      expirado: 0,
    };
  };

  // Refazer busca quando mudar filtro ou busca (com debounce para busca)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, planFilter, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [planFilter, searchTerm, isAdmin]);

  // Refazer busca quando mudar página
  useEffect(() => {
    if (currentPage > 1) {
      fetchUsers(currentPage, planFilter, searchTerm);
    }
  }, [currentPage]);

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  const stats = getPlanStats();

  if (authLoading || loading) {
    return (
      <Layout title="Admin" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout title="Acesso Negado" subtitle="Você não tem permissão para acessar esta página">
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="flex flex-col items-center p-8">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Esta área é restrita a administradores.
            </p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="Painel Administrativo" subtitle="Gerencie usuários e personalização">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 mb-6 text-primary-foreground">
        <div className="flex items-center gap-3">
          <Shield className="h-10 w-10" />
          <div>
            <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            <p className="opacity-90">Gerencie usuários e personalização</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-sm text-orange-600">Trial (3 dias)</p>
            <p className="text-2xl font-bold text-orange-700">{stats.trial}</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <Zap className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-blue-600">Inicial (1 mês)</p>
            <p className="text-2xl font-bold text-blue-700">{stats.inicial}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <UsersIcon className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-green-600">Essencial (6 meses)</p>
            <p className="text-2xl font-bold text-green-700">{stats.essencial}</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 text-center">
            <Heart className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-purple-600">Completo (1 ano)</p>
            <p className="text-2xl font-bold text-purple-700">{stats.completo}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">Expirados</p>
            <p className="text-2xl font-bold text-red-700">{stats.expirado}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="personalization">Personalização</TabsTrigger>
          <TabsTrigger value="trial">Config. Trial</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Plan Filters */}
          <div className="flex flex-wrap gap-2">
            {PLAN_FILTERS.map(filter => (
              <Button
                key={filter.value}
                variant={planFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPlanFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Users List */}
          {loadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando usuários...</span>
            </div>
          ) : (
          <div className="space-y-4">
            {users.map(userProfile => (
              <Card key={userProfile.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{userProfile.name || "Sem nome"}</CardTitle>
                      <CardDescription>{userProfile.email}</CardDescription>
                      {userProfile.phone && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          📱 {userProfile.phone}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Criado em: {new Date(userProfile.created_at).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Último acesso: {userProfile.last_seen 
                          ? (() => {
                              const lastSeen = new Date(userProfile.last_seen);
                              const now = new Date();
                              const diffMs = now.getTime() - lastSeen.getTime();
                              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                              if (diffDays > 0) return `${diffDays} dia(s) atrás`;
                              if (diffHours > 0) return `${diffHours} hora(s) atrás`;
                              return "Agora";
                            })()
                          : "Nunca"
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleExpandUser(userProfile.user_id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedUser === userProfile.user_id && (
                  <CardContent className="border-t bg-muted/30 pt-4">
                    {/* Plan Selection */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Plano Ativo</Label>
                        <select
                          value={userProfile.plan || "trial"}
                          onChange={(e) => updateUserPlan(userProfile.user_id, e.target.value)}
                          className="w-full mt-1 px-3 py-2 border rounded-md bg-yellow-50 border-yellow-200"
                        >
                          <option value="trial">Trial (3 dias)</option>
                          <option value="inicial">Inicial (1 mês)</option>
                          <option value="essencial">Essencial (6 meses)</option>
                          <option value="completo">Completo (1 ano)</option>
                          <option value="expirado">Expirado</option>
                        </select>
                      </div>
                      <div>
                        <Label>Início do Plano</Label>
                        <p className="mt-1 px-3 py-2 border rounded-md bg-background text-sm">
                          {userProfile.trial_start 
                            ? new Date(userProfile.trial_start).toLocaleString("pt-BR")
                            : "N/A"
                          }
                        </p>
                      </div>
                    </div>

                    {/* Feature Blocks */}
                    <div>
                      <Label className="mb-2 block">Bloqueios de Páginas</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Ative para bloquear o acesso à página para este usuário.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {FEATURES.map(feature => (
                          <div 
                            key={feature.key}
                            className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
                              getFeatureBlocked(userProfile.user_id, feature.key) 
                                ? "bg-red-50 border-red-200" 
                                : "bg-background"
                            }`}
                          >
                            <span className={`text-sm font-medium ${
                              getFeatureBlocked(userProfile.user_id, feature.key) 
                                ? "text-red-700" 
                                : ""
                            }`}>
                              {feature.label}
                            </span>
                            <Switch
                              checked={getFeatureBlocked(userProfile.user_id, feature.key)}
                              onCheckedChange={() => toggleFeatureBlock(userProfile.user_id, feature.key)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* User Goals */}
                    <div className="mt-6">
                      <Label className="mb-2 block flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Metas do Mês para este Usuário
                      </Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Defina as metas mensais e veja o progresso do usuário
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Leads Goal */}
                        <div className="p-4 border rounded-lg bg-blue-50/50">
                          <div className="flex items-center gap-2 mb-2">
                            <UsersIcon className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">Meta de Leads</span>
                          </div>
                          <Input
                            type="number"
                            placeholder="Meta"
                            value={getUserGoal(userProfile.user_id, "leads") || ""}
                            onChange={(e) => updateUserGoal(userProfile.user_id, "leads", Number(e.target.value))}
                            className="mb-2"
                          />
                          <div className="text-xs text-muted-foreground mb-1">
                            Atual: {userStats[userProfile.user_id]?.leads || 0} / {getUserGoal(userProfile.user_id, "leads") || 0}
                          </div>
                          <Progress 
                            value={getUserGoal(userProfile.user_id, "leads") > 0 
                              ? Math.min(((userStats[userProfile.user_id]?.leads || 0) / getUserGoal(userProfile.user_id, "leads")) * 100, 100) 
                              : 0
                            } 
                            className="h-2" 
                          />
                        </div>

                        {/* Revenue Goal */}
                        <div className="p-4 border rounded-lg bg-green-50/50">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">Meta de Receita</span>
                          </div>
                          <Input
                            type="number"
                            placeholder="Meta (R$)"
                            value={getUserGoal(userProfile.user_id, "revenue") || ""}
                            onChange={(e) => updateUserGoal(userProfile.user_id, "revenue", Number(e.target.value))}
                            className="mb-2"
                          />
                          <div className="text-xs text-muted-foreground mb-1">
                            Atual: R$ {(userStats[userProfile.user_id]?.revenue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / R$ {(getUserGoal(userProfile.user_id, "revenue") || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </div>
                          <Progress 
                            value={getUserGoal(userProfile.user_id, "revenue") > 0 
                              ? Math.min(((userStats[userProfile.user_id]?.revenue || 0) / getUserGoal(userProfile.user_id, "revenue")) * 100, 100) 
                              : 0
                            } 
                            className="h-2" 
                          />
                        </div>

                        {/* Shows Goal */}
                        <div className="p-4 border rounded-lg bg-purple-50/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Mic2 className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-sm">Meta de Shows</span>
                          </div>
                          <Input
                            type="number"
                            placeholder="Meta"
                            value={getUserGoal(userProfile.user_id, "shows") || ""}
                            onChange={(e) => updateUserGoal(userProfile.user_id, "shows", Number(e.target.value))}
                            className="mb-2"
                          />
                          <div className="text-xs text-muted-foreground mb-1">
                            Atual: {userStats[userProfile.user_id]?.shows || 0} / {getUserGoal(userProfile.user_id, "shows") || 0}
                          </div>
                          <Progress 
                            value={getUserGoal(userProfile.user_id, "shows") > 0 
                              ? Math.min(((userStats[userProfile.user_id]?.shows || 0) / getUserGoal(userProfile.user_id, "shows")) * 100, 100) 
                              : 0
                            } 
                            className="h-2" 
                          />
                                    </div>
                                      </div>
                                    </div>

                                    {/* Password Change */}
                                    <div className="mt-6 pt-4 border-t border-border">
                                      <Label className="mb-2 block flex items-center gap-2">
                                        <Key className="h-4 w-4" />
                                        Alterar Senha do Usuário
                                      </Label>
                                      <p className="text-xs text-muted-foreground mb-3">
                                        Defina uma nova senha para este usuário
                                      </p>
                                      <div className="flex gap-2">
                                        <Input
                                          type="password"
                                          placeholder="Nova senha (mín. 6 caracteres)"
                                          value={userNewPasswords[userProfile.user_id] || ""}
                                          onChange={(e) => setUserNewPasswords(prev => ({
                                            ...prev,
                                            [userProfile.user_id]: e.target.value
                                          }))}
                                          className="flex-1"
                                        />
                                        <Button
                                          onClick={() => handleChangeUserPassword(userProfile.user_id, userProfile.email || "")}
                                          disabled={changingPasswords[userProfile.user_id] || !userNewPasswords[userProfile.user_id]}
                                        >
                                          {changingPasswords[userProfile.user_id] ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            "Alterar"
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                )}
              </Card>
            ))}

            {users.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Nenhum usuário encontrado
                </CardContent>
              </Card>
            )}
          </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * USERS_PER_PAGE) + 1} - {Math.min(currentPage * USERS_PER_PAGE, totalUsers)} de {totalUsers} usuários
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1 || loadingUsers}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || loadingUsers}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Insights da Landing Page
              </CardTitle>
              <CardDescription>
                Métricas de conversão da página /landing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminInsights />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personalization Tab */}
        <TabsContent value="personalization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Personalização do App
              </CardTitle>
              <CardDescription>
                Personalize a aparência do aplicativo em todas as páginas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div>
                <Label className="text-base font-semibold">Logo do App</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Esta logo aparecerá no menu de navegação e em todas as páginas
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden bg-muted/50">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      className="cursor-pointer"
                    />
                    <Button 
                      onClick={uploadLogo} 
                      disabled={!logoFile || uploadingLogo}
                      className="w-full"
                    >
                      {uploadingLogo ? "Enviando..." : "Salvar Logo"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* App Name */}
              <div>
                <Label className="text-base font-semibold">Nome do App</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Nome que aparecerá no menu de navegação
                </p>
                <div className="flex gap-2">
                  <Input 
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="Nome do aplicativo"
                  />
                  <Button onClick={saveAppName}>Salvar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trial Config Tab */}
        <TabsContent value="trial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Configuração do Período Trial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Duração do Trial (em dias)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Defina quantos dias os usuários terão de acesso gratuito ao trial
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={trialDays}
                    onChange={(e) => setTrialDays(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button onClick={saveTrialDays}>Salvar</Button>
                </div>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Como funciona:</p>
                      <ul className="text-sm text-blue-800 list-disc list-inside mt-1 space-y-1">
                        <li><strong>TRIAL:</strong> Dura {trialDays} dias, depois expira automaticamente</li>
                        <li><strong>INICIAL:</strong> Dura 1 mês (30 dias)</li>
                        <li><strong>ESSENCIAL:</strong> Dura 6 meses (180 dias)</li>
                        <li><strong>COMPLETO:</strong> Dura 1 ano (365 dias)</li>
                        <li>Após expirar, o usuário precisa renovar o plano</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
