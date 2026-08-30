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
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReferralsAdminPanel } from "@/components/admin/ReferralsAdminPanel";
import { ImprovementsPanel } from "@/components/admin/ImprovementsPanel";
import { GuideLeadsPanel } from "@/components/admin/GuideLeadsPanel";
import { NotificationsAdminPanel } from "@/components/admin/NotificationsAdminPanel";
import { AppNotificationsAdminPanel } from "@/components/admin/AppNotificationsAdminPanel";
import { DashboardAdsPanel } from "@/components/admin/DashboardAdsPanel";

import { MonthlyShowRankingPanel } from "@/components/admin/MonthlyShowRankingPanel";

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

const FEATURES: { key: string; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "agenda", label: "Agenda de Shows" },
  { key: "checklist", label: "Ideias de Post" },
  { key: "checklist", label: "Checklist de Show" },
  { key: "checklist", label: "Avanços" },
  { key: "precificacao", label: "Precificação" },
  { key: "crm", label: "CRM do Artista" },
  { key: "servicos", label: "Serviços e Produtos" },
  { key: "orcamentos", label: "Orçamento Automático" },
  { key: "contratos", label: "Contrato Automático" },
  { key: "clientes", label: "Clientes" },
  { key: "financeiro", label: "Resumo Mensal" },
  { key: "historico", label: "Histórico Completo" },
  { key: "repertorio", label: "Repertório" },
  { key: "equipe", label: "Banda & Músicos" },
  { key: "mapeamento-palco", label: "Mapeamento de Palco" },
  { key: "metas", label: "Metas Comerciais" },
  { key: "metas", label: "Meta Anual 2026" },
  { key: "aulas", label: "Bônus" },
  { key: "link-agenda", label: "Link Agendamento Online" },
  { key: "configuracoes", label: "Configurações" },
];

const PLAN_FILTERS = [
  { value: "all", label: "Todos" },
  { value: "trial", label: "Trial (1h)" },
  { value: "parceiros", label: "Parceiros" },
  { value: "mensal_starter", label: "Mensal Starter" },
  { value: "mensal_profissional", label: "Mensal Prof." },
  { value: "mensal_completo", label: "Mensal Completo" },
  { value: "anual_starter", label: "Anual Starter" },
  { value: "anual_profissional", label: "Anual Prof." },
  { value: "anual_completo", label: "Anual Completo" },
  { value: "expirado", label: "Expirados" },
  { value: "comprou_expirado", label: "Comprou Expirado" },
];

const PLAN_DURATIONS: Record<string, number> = {
  trial: 3,
  mensal_starter: 30, mensal_profissional: 30, mensal_completo: 30,
  anual_starter: 365, anual_profissional: 365, anual_completo: 365,
  // Legacy support
  base: 30, mensal: 30, essencial: 90, completo: 180, anual: 365,
};

const ALL_FEATURE_KEYS = [
  "dashboard", "agenda", "crm", "clientes", "orcamentos", "servicos",
  "contratos", "financeiro", "historico", "precificacao", "checklist",
  "mapeamento-palco", "equipe", "metas", "repertorio", "aulas",
  "avancos", "tutoriais", "configuracoes", "link-agenda",
];

const TRIAL_BLOCKED_FEATURES = ["mapeamento-palco", "contratos", "orcamentos", "servicos", "link-agenda"];

const USERS_PER_PAGE = 10;

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  trial:                 { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20", icon: <Calendar className="h-5 w-5" /> },
  parceiros:             { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20", icon: <Heart className="h-5 w-5" /> },
  mensal_starter:        { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/20", icon: <Shield className="h-5 w-5" /> },
  mensal_profissional:   { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20", icon: <Zap className="h-5 w-5" /> },
  mensal_completo:       { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20", icon: <Heart className="h-5 w-5" /> },
  anual_starter:         { bg: "bg-teal-500/10", text: "text-teal-600", border: "border-teal-500/20", icon: <Shield className="h-5 w-5" /> },
  anual_profissional:    { bg: "bg-indigo-500/10", text: "text-indigo-600", border: "border-indigo-500/20", icon: <Zap className="h-5 w-5" /> },
  anual_completo:        { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20", icon: <Trophy className="h-5 w-5" /> },
  // Legacy
  base:      { bg: "bg-cyan-500/10", text: "text-cyan-600", border: "border-cyan-500/20", icon: <Shield className="h-5 w-5" /> },
  mensal:    { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20", icon: <Zap className="h-5 w-5" /> },
  essencial: { bg: "bg-green-500/10", text: "text-green-600", border: "border-green-500/20", icon: <UsersIcon className="h-5 w-5" /> },
  completo:  { bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20", icon: <Heart className="h-5 w-5" /> },
  anual:     { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20", icon: <Trophy className="h-5 w-5" /> },
  expirado:  { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/20", icon: <AlertCircle className="h-5 w-5" /> },
  comprou_expirado: { bg: "bg-rose-500/10", text: "text-rose-600", border: "border-rose-500/20", icon: <Crown className="h-5 w-5" /> },
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
    trial: 0, parceiros: 0, mensal_starter: 0, mensal_profissional: 0, mensal_completo: 0,
    anual_starter: 0, anual_profissional: 0, anual_completo: 0, expirado: 0, comprou_expirado: 0,
  });
  const [userPlanDates, setUserPlanDates] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<
    { id: string; owner_id: string; member_user_id: string; email: string; role_label: string | null; permission_level: string; is_active: boolean }[]
  >([]);

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

    // Team members belong to their owner's panel — never list them as separate accounts.
    const { data: memberRows } = await supabase
      .from("workspace_members")
      .select("id, owner_id, member_user_id, email, role_label, permission_level, is_active");
    const members = memberRows ?? [];
    setTeamMembers(members as typeof teamMembers);
    const memberIds = members.map((m) => m.member_user_id);

    let query = supabase
      .from("profiles")
      .select("*, feature_blocks", { count: "exact" })
      .order("created_at", { ascending: false });

    if (memberIds.length > 0) query = query.not("user_id", "in", `(${memberIds.join(",")})`);
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
      
      const [goalsResult, planResult, memberResult] = await Promise.all([
        supabase.from("user_goals").select("*")
          .eq("month", new Date().getMonth() + 1)
          .eq("year", new Date().getFullYear()),
        supabase.from("profiles").select("plan, user_id"),
        supabase.from("workspace_members").select("member_user_id"),
      ]);

      if (goalsResult.data) setUserGoals(goalsResult.data);

      if (planResult.data) {
        const memberIds = new Set((memberResult.data ?? []).map(m => m.member_user_id));
        const stats: Record<string, number> = {
          trial: 0, parceiros: 0, mensal_starter: 0, mensal_profissional: 0, mensal_completo: 0,
           anual_starter: 0, anual_profissional: 0, anual_completo: 0, expirado: 0, comprou_expirado: 0,
        };
        planResult.data.filter(p => !memberIds.has(p.user_id)).forEach(p => {
          const plan = p.plan || 'trial';
          if (stats.hasOwnProperty(plan)) {
            stats[plan]++;
          } else if (plan === 'expirado' || plan === 'expired') {
            stats.expirado++;
          } else if (plan === 'comprou_expirado') {
            stats.comprou_expirado++;
          } else {
            // Legacy plans count as trial
            stats.trial++;
          }
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

  // Map plan to its tier for feature blocking
  const getPlanTier = (plan: string): string => {
    if (plan.includes("starter")) return "starter";
    if (plan.includes("profissional")) return "profissional";
    if (plan.includes("completo")) return "completo";
    // Legacy mapping
    if (plan === "base" || plan === "mensal") return "starter";
    if (plan === "essencial") return "profissional";
    if (plan === "anual") return "completo";
    return plan;
  };

  const updateUserPlan = async (userId: string, plan: string, customStartDate?: string) => {
    const updates: { plan: string; trial_start?: string; trial_days?: number; feature_blocks?: Record<string, boolean> } = { plan };
    
    if (plan !== "expirado" && plan !== "comprou_expirado") {
      // Parceiros é ativado por token e não expira
      if (plan === "parceiros") {
        updates.trial_start = null;
        updates.trial_days = null;
      } else if (plan === "trial") {
        // Para trial: sempre usar agora (now) para reiniciar a contagem de 1h.
        updates.trial_start = new Date().toISOString();
        updates.trial_days = PLAN_DURATIONS[plan] || 3;
      } else {
        // Para planos pagos: respeitar data customizada ou hoje.
        const startDate = customStartDate || new Date().toISOString().split("T")[0];
        updates.trial_start = new Date(startDate + "T00:00:00").toISOString();
        updates.trial_days = PLAN_DURATIONS[plan] || 3;
      }
    }

    const newFeatureBlocks: Record<string, boolean> = {};
    const tier = getPlanTier(plan);
    const tierModule = PLAN_MODULES[tier as keyof typeof PLAN_MODULES];
    
    ALL_FEATURE_KEYS.forEach(key => {
      if (plan === "expirado" || plan === "comprou_expirado") newFeatureBlocks[key] = true;
      else if (plan === "trial") newFeatureBlocks[key] = TRIAL_BLOCKED_FEATURES.includes(key);
      else if (tierModule) newFeatureBlocks[key] = !tierModule.features.includes(key);
      else newFeatureBlocks[key] = false;
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

  const deleteUser = async (userId: string, userName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { userId },
      });
      if (error || data?.error) {
        toast.error(data?.error || "Erro ao excluir conta");
        return;
      }
      setUsers(prev => prev.filter(u => u.user_id !== userId));
      toast.success(`Conta de ${userName || "usuário"} excluída`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir conta");
    }
  };

  const updatePlanStartDate = async (userId: string, dateStr: string) => {
    setUserPlanDates(prev => ({ ...prev, [userId]: dateStr }));
    const userProfile = users.find(u => u.user_id === userId);
    if (!userProfile || !userProfile.plan || userProfile.plan === "expirado" || userProfile.plan === "comprou_expirado") return;
    
    const startDate = new Date(dateStr + "T00:00:00").toISOString();
    const { error } = await supabase.from("profiles").update({ trial_start: startDate }).eq("user_id", userId);
    if (error) { toast.error("Erro ao atualizar data"); return; }
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, trial_start: startDate } : u));
    toast.success("Data de início atualizada!");
  };

  const getRemainingDays = (userProfile: UserProfile): number => {
    const plan = userProfile.plan || "trial";
    const duration = PLAN_DURATIONS[plan];
    if (!duration || !userProfile.trial_start) return 0;
    const start = new Date(userProfile.trial_start);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, duration - diffDays);
  };

  const getPlanEndDate = (userProfile: UserProfile): string => {
    const plan = userProfile.plan || "trial";
    const duration = PLAN_DURATIONS[plan];
    if (!duration || !userProfile.trial_start) return "—";
    const start = new Date(userProfile.trial_start);
    const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
    return end.toLocaleDateString("pt-BR");
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
    const labels: Record<string, string> = { trial: "Trial (1h)", parceiros: "Parceiros", mensal_starter: "Mensal Starter", mensal_profissional: "Mensal Prof.", mensal_completo: "Mensal Completo", anual_starter: "Anual Starter", anual_profissional: "Anual Prof.", anual_completo: "Anual Completo", base: "Mensal (leg.)", mensal: "Mensal (leg.)", essencial: "Prof. (leg.)", completo: "Completo (leg.)", anual: "Anual (leg.)", expirado: "Expirado", comprou_expirado: "Comprou Expirado" };
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
      <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5 mb-6">
        {Object.entries(PLAN_FILTERS).filter(([_, f]) => f.value !== "all").map(([_, filter]) => {
          const colors = PLAN_COLORS[filter.value] || PLAN_COLORS.trial;
          return (
          <button
            key={filter.value}
            onClick={() => setPlanFilter(planFilter === filter.value ? "all" : filter.value)}
            className={`relative rounded-lg p-2 text-center transition-all border aspect-square flex flex-col items-center justify-center ${colors.bg} ${colors.border} ${
              planFilter === filter.value ? "ring-2 ring-primary shadow-lg scale-105" : "hover:scale-102"
            }`}
          >
            <div className={`mb-0.5 ${colors.text}`}>{colors.icon}</div>
            <p className={`text-lg font-black leading-tight ${colors.text}`}>{planStats[filter.value] || 0}</p>
            <p className={`text-[8px] md:text-[9px] font-semibold ${colors.text} opacity-80 truncate w-full`}>
              {filter.label}
            </p>
          </button>
          );
        })}
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
            <Bell className="h-3.5 w-3.5" /> Push
          </TabsTrigger>
          <TabsTrigger value="app-notifications" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg">
            <Bell className="h-3.5 w-3.5" /> In-App
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
          <TabsTrigger value="ranking" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg">
            <Trophy className="h-3.5 w-3.5" /> Ranking
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center gap-1.5 text-xs sm:text-sm rounded-lg">
            <Megaphone className="h-3.5 w-3.5" /> Anúncios
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
                    <div className="hidden sm:flex items-center gap-5 flex-1 min-w-0 text-sm">
                      <div className="min-w-0">
                        <span className="text-muted-foreground">📱 </span>
                        <span className="font-bold">{userProfile.phone || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">Visto: </span>
                        <span className="font-bold">{getRelativeTime(userProfile.last_seen)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">Desde: </span>
                        <span className="font-bold">{new Date(userProfile.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground font-medium">Plano: </span>
                        <span className="font-bold">{userProfile.trial_start ? new Date(userProfile.trial_start).toLocaleDateString("pt-BR") : "—"}</span>
                      </div>
                    </div>

                    <Eye className={`h-4 w-4 shrink-0 ml-auto transition-transform ${expandedUser === userProfile.user_id ? "text-primary rotate-180" : "text-muted-foreground"}`} />
                  </div>

                  {expandedUser === userProfile.user_id && (
                    <CardContent className="border-t bg-muted/20 pt-4 space-y-6">

                      {/* Plan Start Date */}
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Dia de Início do Plano</Label>
                        <Input
                          type="date"
                          value={userPlanDates[userProfile.user_id] || (userProfile.trial_start ? userProfile.trial_start.split("T")[0] : "")}
                          onChange={e => updatePlanStartDate(userProfile.user_id, e.target.value)}
                          className="mt-1.5"
                        />
                      </div>

                      {/* Plan Selection */}
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Selecionar Plano</Label>
                        <select
                          value={userProfile.plan || "trial"}
                          onChange={e => {
                            const selectedPlan = e.target.value;
                            const today = new Date().toISOString().split("T")[0];
                            updateUserPlan(userProfile.user_id, selectedPlan, today);
                            setUserPlanDates(prev => ({ ...prev, [userProfile.user_id]: today }));
                          }}
                          className="w-full mt-1.5 px-3 py-2.5 border rounded-lg bg-background text-sm font-medium"
                        >
                          <option value="trial">Trial (3 horas)</option>
                          <option value="parceiros">Parceiros (token)</option>
                          <optgroup label="Mensal (30 dias)">
                            <option value="mensal_starter">Mensal Starter</option>
                            <option value="mensal_profissional">Mensal Profissional</option>
                            <option value="mensal_completo">Mensal Completo</option>
                          </optgroup>
                          <optgroup label="Anual (365 dias)">
                            <option value="anual_starter">Anual Starter</option>
                            <option value="anual_profissional">Anual Profissional</option>
                            <option value="anual_completo">Anual Completo</option>
                          </optgroup>
                          <option value="expirado">Expirado</option>
                          <option value="comprou_expirado">Comprou Expirado</option>
                        </select>
                      </div>

                      {/* Plan Summary */}
                      {userProfile.plan && userProfile.plan !== "expirado" && userProfile.plan !== "comprou_expirado" && userProfile.plan !== "trial" && userProfile.trial_start && (
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Início</p>
                            <p className="text-sm font-bold text-foreground">
                              {new Date(userProfile.trial_start).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Vencimento</p>
                            <p className="text-sm font-bold text-foreground">{getPlanEndDate(userProfile)}</p>
                          </div>
                          <div className={`rounded-xl p-3 text-center border ${getRemainingDays(userProfile) <= 7 ? "bg-destructive/10 border-destructive/30" : "bg-emerald-500/10 border-emerald-500/30"}`}>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Restantes</p>
                            <p className={`text-sm font-bold ${getRemainingDays(userProfile) <= 7 ? "text-destructive" : "text-emerald-600"}`}>
                              {getRemainingDays(userProfile)} dias
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Billing Cycle Restriction */}
                      <div className={`p-4 border rounded-xl flex items-center justify-between ${parseFeatureBlocks(userProfile.feature_blocks)["block_monthly_billing"] === true ? "bg-amber-500/5 border-amber-500/30" : "bg-background"}`}>
                        <div>
                          <p className="font-bold text-sm">Bloquear Plano Mensal</p>
                          <p className="text-xs text-muted-foreground">Quando ativo, o usuário só verá e poderá assinar planos anuais.</p>
                        </div>
                        <Switch
                          checked={parseFeatureBlocks(userProfile.feature_blocks)["block_monthly_billing"] === true}
                          onCheckedChange={async (checked) => {
                            const currentBlocks = parseFeatureBlocks(userProfile.feature_blocks);
                            const newBlocks = { ...currentBlocks, block_monthly_billing: checked };
                            const { error } = await supabase.from("profiles").update({ feature_blocks: newBlocks }).eq("user_id", userProfile.user_id);
                            if (error) { toast.error("Erro ao atualizar"); return; }
                            setUsers(prev => prev.map(u => u.user_id === userProfile.user_id ? { ...u, feature_blocks: newBlocks } : u));
                            toast.success(checked ? "Plano mensal bloqueado" : "Plano mensal liberado");
                          }}
                        />
                      </div>

                      {/* Module Management */}
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground mb-3 block">Módulos do Plano</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {Object.entries(PLAN_MODULES).filter(([id]) => id !== "completo").map(([moduleId, mod]) => {
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

                      {/* Team users created by this buyer */}
                      <div>
                        <Label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">
                          Usuários da equipe (mesmo plano)
                        </Label>
                        {teamMembers.filter(m => m.owner_id === userProfile.user_id).length === 0 ? (
                          <p className="text-xs text-muted-foreground">Nenhum usuário cadastrado por este comprador.</p>
                        ) : (
                          <div className="space-y-2">
                            {teamMembers
                              .filter(m => m.owner_id === userProfile.user_id)
                              .map(m => (
                                <div key={m.id} className="flex flex-wrap items-center gap-2 p-2.5 border rounded-lg bg-background text-xs">
                                  <span className="font-semibold">{m.role_label || "Usuário"}</span>
                                  <span className="text-muted-foreground truncate">{m.email}</span>
                                  <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                    {m.permission_level === "manager" ? "Gerente" : m.permission_level === "editor" ? "Editor" : "Visualizador"}
                                  </span>
                                  <span className={`ml-auto px-1.5 py-0.5 rounded-full font-medium ${m.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                                    {m.is_active ? "Ativo" : "Inativo"}
                                  </span>
                                </div>
                              ))}
                            <p className="text-[11px] text-muted-foreground">
                              Estes acessos seguem o plano do comprador: se o plano dele parar, o acesso deles para também.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Danger Zone - Delete Account */}
                      <div className="border-t border-red-500/20 pt-4 mt-2">
                        <Label className="text-xs font-bold uppercase text-red-600 mb-2 block">Zona de Perigo</Label>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="w-full sm:w-auto">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir conta deste usuário
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Isso vai apagar a conta de <strong>{userProfile.name || userProfile.email}</strong> e todos os dados associados. Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => deleteUser(userProfile.user_id, userProfile.name || userProfile.email || "")}
                              >
                                Sim, excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

        {/* Push Notifications Tab */}
        <TabsContent value="notifications"><NotificationsAdminPanel /></TabsContent>

        {/* In-App Notifications Tab */}
        <TabsContent value="app-notifications"><AppNotificationsAdminPanel /></TabsContent>

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
        <TabsContent value="ranking"><MonthlyShowRankingPanel /></TabsContent>

        {/* Dashboard Ads Tab */}
        <TabsContent value="ads"><DashboardAdsPanel /></TabsContent>


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
