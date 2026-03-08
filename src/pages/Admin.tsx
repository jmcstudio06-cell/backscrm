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
  Upload,
  Image,
  Loader2,
  TrendingUp,
  Trophy,
  PartyPopper,
  Bell,
  Sparkles,
  BookOpen,
  Lightbulb,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";
import { ReferralsAdminPanel } from "@/components/admin/ReferralsAdminPanel";
import { ImprovementsPanel } from "@/components/admin/ImprovementsPanel";
import { GuideLeadsPanel } from "@/components/admin/GuideLeadsPanel";
import { NotificationsAdminPanel } from "@/components/admin/NotificationsAdminPanel";

import type { Json } from "@/integrations/supabase/types";
import { PLAN_MODULES } from "@/hooks/useFeatureBlocks";

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
  feature_blocks?: Json | null;
}

const parseFeatureBlocks = (blocks: Json | null | undefined): Record<string, boolean> => {
  if (!blocks || typeof blocks !== 'object' || Array.isArray(blocks)) return {};
  return blocks as Record<string, boolean>;
};

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
  { key: "crm", label: "Radar de Shows" },
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
  { key: "avancos", label: "Avanços" },
  { key: "tutoriais", label: "Tutoriais" },
  { key: "configuracoes", label: "Configurações" },
];

const PLAN_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "free", label: "Free" },
  { value: "trial", label: "Trial" },
  { value: "base", label: "Mensal" },
  { value: "mensal", label: "Mensal (leg.)" },
  { value: "essencial", label: "Profissional" },
  { value: "completo", label: "Completo" },
  { value: "anual", label: "Anual" },
  { value: "expirado", label: "Expirados" },
];

const PLAN_DURATIONS: Record<string, number> = {
  free: 99999, trial: 3, base: 30, mensal: 30,
  essencial: 90, completo: 180, anual: 365,
};

const TRIAL_BLOCKED_FEATURES = ["mapeamento-palco", "contratos", "orcamentos"];

const USERS_PER_PAGE = 10;

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  free:      { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20", icon: <Sparkles className="h-5 w-5" /> },
  trial:     { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20", icon: <Calendar className="h-5 w-5" /> },
  base:      { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/20", icon: <Shield className="h-5 w-5" /> },
  mensal:    { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20", icon: <Zap className="h-5 w-5" /> },
  essencial: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/20", icon: <UsersIcon className="h-5 w-5" /> },
  completo:  { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20", icon: <Heart className="h-5 w-5" /> },
  anual:     { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20", icon: <Trophy className="h-5 w-5" /> },
  expirado:  { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20", icon: <AlertCircle className="h-5 w-5" /> },
};

export default function Admin() {
  const { user, loading: authLoading } = useRequireAuth();
  const { settings, refreshSettings } = useAppSettings();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userGoals, setUserGoals] = useState<UserGoal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [appName, setAppName] = useState("Backstage Pro");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const dataLoaded = useRef(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [planStats, setPlanStats] = useState<Record<string, number>>({
    free: 0, trial: 0, base: 0, mensal: 0,
    essencial: 0, completo: 0, anual: 0, expirado: 0,
  });

  // Check admin
  useEffect(() => {
    async function checkAdmin() {
      if (!user) return;
      const { data, error } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      setIsAdmin(!error && data === true);
      setLoading(false);
    }
    if (!authLoading) checkAdmin();
  }, [user, authLoading]);

  // Fetch users with pagination
  const fetchUsers = async (page: number, filter: string, search: string) => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    const from = (page - 1) * USERS_PER_PAGE;
    const to = from + USERS_PER_PAGE - 1;
    
    let query = supabase
      .from("profiles")
      .select("*, feature_blocks", { count: "exact" })
      .order("created_at", { ascending: false });
    
    if (filter !== "all") query = query.eq("plan", filter);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    query = query.range(from, to);
    
    const { data, error, count } = await query;
    if (error) {
      toast.error("Erro ao carregar usuários");
    } else {
      setUsers(data || []);
      setTotalUsers(count || 0);
    }
    setLoadingUsers(false);
  };

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      if (!isAdmin || dataLoaded.current) return;
      
      const [goalsResult, planResult] = await Promise.all([
        supabase.from("user_goals").select("*")
          .eq("month", new Date().getMonth() + 1)
          .eq("year", new Date().getFullYear()),
        supabase.from("profiles").select("plan"),
      ]);

      if (goalsResult.data) setUserGoals(goalsResult.data);
      
      if (planResult.data) {
        const stats: Record<string, number> = { free: 0, trial: 0, base: 0, mensal: 0, essencial: 0, completo: 0, anual: 0, expirado: 0 };
        planResult.data.forEach(p => {
          const plan = p.plan || 'trial';
          if (stats.hasOwnProperty(plan)) stats[plan]++;
        });
        setPlanStats(stats);
      }
      
      fetchUsers(1, planFilter, searchTerm);
      dataLoaded.current = true;
    }
    fetchInitialData();
  }, [isAdmin]);

  // Search/filter debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, planFilter, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [planFilter, searchTerm, isAdmin]);

  useEffect(() => {
    if (currentPage > 1) fetchUsers(currentPage, planFilter, searchTerm);
  }, [currentPage]);

  useEffect(() => {
    setAppName(settings.app_name);
    setLogoPreview(settings.logo_url);
  }, [settings]);

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
  const totalRegistered = Object.values(planStats).reduce((a, b) => a + b, 0);

  // Feature block helpers
  const getFeatureBlocked = (userId: string, featureKey: string): boolean => {
    const u = users.find(u => u.user_id === userId);
    return parseFeatureBlocks(u?.feature_blocks)[featureKey] === true;
  };

  const toggleFeatureBlock = async (userId: string, featureKey: string) => {
    const u = users.find(u => u.user_id === userId);
    if (!u) return;
    const currentBlocks = parseFeatureBlocks(u.feature_blocks);
    const newBlocks = { ...currentBlocks, [featureKey]: !currentBlocks[featureKey] };
    const { error } = await supabase.from("profiles").update({ feature_blocks: newBlocks }).eq("user_id", userId);
    if (error) { toast.error("Erro ao atualizar bloqueio"); return; }
    setUsers(prev => prev.map(p => p.user_id === userId ? { ...p, feature_blocks: newBlocks } : p));
    toast.success(newBlocks[featureKey] ? "Bloqueado" : "Desbloqueado");
  };

  const updateUserPlan = async (userId: string, plan: string) => {
    const normalizedPlan = plan === "inicial" ? "mensal" : plan;
    const updates: { plan: string; trial_start?: string; trial_days?: number; feature_blocks?: Record<string, boolean> } = { plan: normalizedPlan };
    
    if (normalizedPlan !== "expirado") {
      updates.trial_start = new Date().toISOString();
      updates.trial_days = PLAN_DURATIONS[normalizedPlan] || 3;
    }

    const newFeatureBlocks: Record<string, boolean> = {};
    FEATURES.forEach(f => {
      if (plan === "expirado") newFeatureBlocks[f.key] = true;
      else if (plan === "trial") newFeatureBlocks[f.key] = TRIAL_BLOCKED_FEATURES.includes(f.key);
      else newFeatureBlocks[f.key] = false;
    });
    updates.feature_blocks = newFeatureBlocks;

    const { error } = await supabase.from("profiles").update(updates).eq("user_id", userId);
    if (error) { toast.error("Erro ao atualizar plano"); return; }

    setUsers(prev => prev.map(u => 
      u.user_id === userId 
        ? { ...u, plan, trial_start: updates.trial_start || u.trial_start, trial_days: updates.trial_days || u.trial_days, feature_blocks: newFeatureBlocks }
        : u
    ));
    toast.success(`Plano atualizado para ${plan.toUpperCase()}`);
  };

  const updateUserGoal = async (userId: string, goalType: string, targetValue: number) => {
    const m = new Date().getMonth() + 1, y = new Date().getFullYear();
    const { data, error } = await supabase
      .from("user_goals")
      .upsert({ user_id: userId, goal_type: goalType, target_value: targetValue, month: m, year: y }, { onConflict: 'user_id,goal_type,month,year' })
      .select().single();
    if (error) { toast.error("Erro ao atualizar meta"); return; }
    setUserGoals(prev => {
      const exists = prev.find(g => g.user_id === userId && g.goal_type === goalType && g.month === m && g.year === y);
      return exists ? prev.map(g => (g.user_id === userId && g.goal_type === goalType && g.month === m && g.year === y) ? data : g) : [...prev, data];
    });
    toast.success("Meta atualizada!");
  };

  const getUserGoal = (userId: string, goalType: string): number => {
    const m = new Date().getMonth() + 1, y = new Date().getFullYear();
    return userGoals.find(g => g.user_id === userId && g.goal_type === goalType && g.month === m && g.year === y)?.target_value || 0;
  };

  // Logo & app name
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setLogoFile(file); const r = new FileReader(); r.onloadend = () => setLogoPreview(r.result as string); r.readAsDataURL(file); }
  };

  const uploadLogo = async () => {
    if (!logoFile) return;
    setUploadingLogo(true);
    try {
      const ext = logoFile.name.split('.').pop();
      await supabase.storage.from("app-assets").upload(`app-logo.${ext}`, logoFile, { upsert: true });
      const { data: urlData } = supabase.storage.from("app-assets").getPublicUrl(`app-logo.${ext}`);
      await supabase.from("app_settings").upsert({ setting_key: "logo_url", setting_value: `${urlData.publicUrl}?t=${Date.now()}` }, { onConflict: 'setting_key' });
      toast.success("Logo atualizada!"); refreshSettings();
    } catch { toast.error("Erro ao fazer upload"); }
    finally { setUploadingLogo(false); }
  };

  const saveAppName = async () => {
    const { error } = await supabase.from("app_settings").upsert({ setting_key: "app_name", setting_value: appName }, { onConflict: 'setting_key' });
    if (error) toast.error("Erro ao salvar"); else { toast.success("Nome atualizado!"); refreshSettings(); }
  };

  // Loading / access denied states
  if (authLoading || loading) {
    return (
      <Layout title="Admin" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout title="Acesso Negado">
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="flex flex-col items-center p-8">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">Esta área é restrita a administradores.</p>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  const getRelativeTime = (dateStr: string | null) => {
    if (!dateStr) return "Nunca";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    return "Agora";
  };

  const getPlanBadge = (plan: string | null) => {
    const p = plan || "trial";
    const labels: Record<string, string> = { free: "Free", trial: "Trial", base: "Mensal", mensal: "Mensal (leg.)", essencial: "Profissional", completo: "Completo", anual: "Anual", expirado: "Expirado" };
    const colors = PLAN_COLORS[p] || PLAN_COLORS.trial;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
        {labels[p] || p}
      </span>
    );
  };

  return (
    <Layout title="Painel Admin" subtitle="Controle total da plataforma">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 mb-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Painel Admin</h1>
              <p className="text-white/80 text-sm mt-0.5">Gerencie usuários, planos e configurações</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 text-center">
              <p className="text-3xl font-black text-white">{totalRegistered}</p>
              <p className="text-xs text-white/80 font-medium">cadastros</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Stats Grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6">
        {Object.entries(PLAN_COLORS).map(([key, colors]) => (
          <button
            key={key}
            onClick={() => setPlanFilter(planFilter === key ? "all" : key)}
            className={`relative rounded-xl p-3 text-center transition-all border ${colors.bg} ${colors.border} ${
              planFilter === key ? "ring-2 ring-primary shadow-lg scale-105" : "hover:scale-102"
            }`}
          >
            <div className={`mx-auto mb-1 ${colors.text}`}>{colors.icon}</div>
            <p className={`text-xl md:text-2xl font-black ${colors.text}`}>{planStats[key] || 0}</p>
            <p className={`text-[10px] font-semibold ${colors.text} opacity-80 truncate`}>
              {key === "essencial" ? "Prof." : key === "expirado" ? "Expir." : key.charAt(0).toUpperCase() + key.slice(1)}
            </p>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="w-full overflow-x-auto flex whitespace-nowrap bg-muted/50 backdrop-blur rounded-xl p-1 h-auto">
          <TabsTrigger value="users" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg">
            <UsersIcon className="h-3.5 w-3.5" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="referrals" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg">
            <Megaphone className="h-3.5 w-3.5" /> Indicações
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg">
            <Bell className="h-3.5 w-3.5" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="guide-leads" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg">
            <BookOpen className="h-3.5 w-3.5" /> Guia
          </TabsTrigger>
          <TabsTrigger value="personalization" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg">
            <Image className="h-3.5 w-3.5" /> Visual
          </TabsTrigger>
          <TabsTrigger value="improvements" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg">
            <Lightbulb className="h-3.5 w-3.5" /> Melhorias
          </TabsTrigger>
          <TabsTrigger value="marco" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg">
            <PartyPopper className="h-3.5 w-3.5" /> Marco
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-1.5">
            {PLAN_FILTERS.map(f => (
              <Button key={f.value} variant={planFilter === f.value ? "default" : "outline"} size="sm" className="text-xs h-8" onClick={() => setPlanFilter(f.value)}>
                {f.label}
              </Button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground text-sm">Carregando...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(userProfile => (
                <Card key={userProfile.id} className={`overflow-hidden transition-all duration-200 ${expandedUser === userProfile.user_id ? "ring-2 ring-primary/30 shadow-lg" : "hover:shadow-md"}`}>
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    onClick={() => setExpandedUser(expandedUser === userProfile.user_id ? null : userProfile.user_id)}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{(userProfile.name || "?").charAt(0).toUpperCase()}</span>
                    </div>

                    {/* Name + email */}
                    <div className="min-w-0 w-36 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm truncate">{userProfile.name || "Sem nome"}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{userProfile.email}</p>
                    </div>

                    {/* Plan badge */}
                    <div className="shrink-0">{getPlanBadge(userProfile.plan)}</div>

                    {/* Inline info - visible on sm+ */}
                    <div className="hidden sm:flex items-center gap-4 flex-1 min-w-0 text-[11px]">
                      <div className="min-w-0">
                        <span className="text-muted-foreground">📱 </span>
                        <span className="font-medium">{userProfile.phone || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Visto: </span>
                        <span className="font-medium">{getRelativeTime(userProfile.last_seen)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Desde: </span>
                        <span className="font-medium">{new Date(userProfile.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Plano: </span>
                        <span className="font-medium">{userProfile.trial_start ? new Date(userProfile.trial_start).toLocaleDateString("pt-BR") : "—"}</span>
                      </div>
                    </div>

                    <Eye className={`h-4 w-4 shrink-0 ml-auto transition-transform ${expandedUser === userProfile.user_id ? "text-primary rotate-180" : "text-muted-foreground"}`} />
                  </div>

                  {expandedUser === userProfile.user_id && (
                    <CardContent className="border-t bg-muted/20 pt-4 space-y-6">

                      {/* Plan Selection */}
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Alterar Plano</Label>
                        <select
                          value={userProfile.plan || "trial"}
                          onChange={e => updateUserPlan(userProfile.user_id, e.target.value)}
                          className="w-full mt-1.5 px-3 py-2.5 border rounded-lg bg-background text-sm font-medium"
                        >
                          <option value="free">Free (Gratuito)</option>
                          <option value="trial">Trial (3 dias)</option>
                          <option value="base">Assinatura Mensal</option>
                          <option value="mensal">Mensal (legado)</option>
                          <option value="essencial">Profissional</option>
                          <option value="completo">Completo</option>
                          <option value="anual">Anual</option>
                          <option value="expirado">Expirado</option>
                        </select>
                      </div>

                      {/* Module Management */}
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground mb-3 block">Módulos do Plano</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {Object.entries(PLAN_MODULES).map(([moduleId, mod]) => {
                            const blocks = parseFeatureBlocks(userProfile.feature_blocks);
                            const allUnlocked = mod.features.every(f => blocks[f] === false);
                            return (
                              <div key={moduleId} className={`p-4 border rounded-xl transition-all ${allUnlocked ? "bg-emerald-500/5 border-emerald-500/30" : "bg-red-500/5 border-red-500/30"}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <p className="font-bold text-sm">{mod.name}</p>
                                    <p className="text-xs text-muted-foreground">{mod.price}</p>
                                  </div>
                                  <Switch
                                    checked={allUnlocked}
                                    onCheckedChange={async (checked) => {
                                      const currentBlocks = parseFeatureBlocks(userProfile.feature_blocks);
                                      const newBlocks = { ...currentBlocks };
                                      mod.features.forEach(f => { newBlocks[f] = !checked; });
                                      const { error } = await supabase.from("profiles").update({ feature_blocks: newBlocks }).eq("user_id", userProfile.user_id);
                                      if (error) { toast.error("Erro ao atualizar módulo"); return; }
                                      setUsers(prev => prev.map(u => u.user_id === userProfile.user_id ? { ...u, feature_blocks: newBlocks } : u));
                                      toast.success(checked ? `${mod.name} desbloqueado!` : `${mod.name} bloqueado!`);
                                    }}
                                  />
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {mod.features.map(f => (
                                    <span key={f} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${blocks[f] === false ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                      {FEATURES.find(fe => fe.key === f)?.label || f}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Individual Feature Blocks */}
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground mb-3 block">Bloqueios Individuais</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {FEATURES.map(feature => (
                            <div key={feature.key} className={`flex items-center justify-between p-2.5 border rounded-lg text-xs transition-colors ${getFeatureBlocked(userProfile.user_id, feature.key) ? "bg-red-500/5 border-red-500/20" : "bg-background"}`}>
                              <span className={`font-medium ${getFeatureBlocked(userProfile.user_id, feature.key) ? "text-red-600" : ""}`}>
                                {feature.label}
                              </span>
                              <Switch checked={getFeatureBlocked(userProfile.user_id, feature.key)} onCheckedChange={() => toggleFeatureBlock(userProfile.user_id, feature.key)} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}

              {users.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <UsersIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>Nenhum usuário encontrado</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                {((currentPage - 1) * USERS_PER_PAGE) + 1}–{Math.min(currentPage * USERS_PER_PAGE, totalUsers)} de {totalUsers}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1 || loadingUsers} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs px-2 font-medium">{currentPage}/{totalPages}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages || loadingUsers} onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Referrals Tab */}
        <TabsContent value="referrals"><ReferralsAdminPanel /></TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications"><NotificationsAdminPanel /></TabsContent>

        {/* Guide Leads Tab */}
        <TabsContent value="guide-leads"><GuideLeadsPanel /></TabsContent>

        {/* Personalization Tab */}
        <TabsContent value="personalization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" /> Personalização</CardTitle>
              <CardDescription>Aparência do aplicativo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-semibold">Logo do App</Label>
                <p className="text-xs text-muted-foreground mb-3">Aparecerá no menu de navegação</p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center overflow-hidden bg-muted/30">
                    {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-muted-foreground/40" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input type="file" accept="image/*" onChange={handleLogoChange} className="cursor-pointer" />
                    <Button onClick={uploadLogo} disabled={!logoFile || uploadingLogo} size="sm" className="w-full">
                      {uploadingLogo ? "Enviando..." : "Salvar Logo"}
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">Nome do App</Label>
                <p className="text-xs text-muted-foreground mb-3">Nome exibido no menu</p>
                <div className="flex gap-2">
                  <Input value={appName} onChange={e => setAppName(e.target.value)} placeholder="Nome do aplicativo" />
                  <Button onClick={saveAppName}>Salvar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Improvements Tab */}
        <TabsContent value="improvements"><ImprovementsPanel /></TabsContent>

        {/* Marco Tab */}
        <TabsContent value="marco">
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="bg-gradient-to-br from-primary via-blue-600 to-purple-600 p-8 md:p-12 text-white text-center relative overflow-hidden">
              <div className="absolute top-4 left-4 animate-bounce"><PartyPopper className="w-8 h-8 text-yellow-300" /></div>
              <div className="absolute top-4 right-4 animate-bounce delay-100"><Trophy className="w-8 h-8 text-yellow-300" /></div>
              <div className="absolute bottom-4 left-8 animate-pulse"><span className="text-4xl">🎉</span></div>
              <div className="absolute bottom-4 right-8 animate-pulse delay-200"><span className="text-4xl">🚀</span></div>
              <div className="relative z-10">
                <h2 className="text-xl font-medium mb-2 opacity-90">🎊 Chegamos a</h2>
                <div className="text-7xl md:text-9xl font-black mb-4 drop-shadow-lg">{totalRegistered}</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6">cadastros no aplicativo! 🎯</h3>
                <div className="bg-white/20 backdrop-blur rounded-xl p-4 max-w-md mx-auto">
                  <p className="text-lg font-medium">Parabéns à toda equipe <span className="font-bold">Backstage Pro</span>! 👏</p>
                  <p className="text-sm opacity-90 mt-2">Cada cadastro representa um artista que confia em nós.</p>
                </div>
              </div>
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-1/4 w-32 h-32 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-yellow-300 rounded-full blur-3xl" />
              </div>
            </div>
            <CardContent className="p-6 bg-gradient-to-b from-primary/5 to-transparent">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <TrendingUp className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm text-emerald-600 font-medium">Crescimento</p>
                  <p className="text-xl font-bold text-emerald-700">Constante</p>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <UsersIcon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-xl font-bold text-blue-700">{totalRegistered}</p>
                </div>
                <div className="text-center p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                  <Heart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-purple-600 font-medium">Confiança</p>
                  <p className="text-xl font-bold text-purple-700">100%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
