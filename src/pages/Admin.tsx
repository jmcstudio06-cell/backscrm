import { useState, useEffect } from "react";
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
  Key,
  Trash2,
  Info,
  Upload,
  Image
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  plan: string | null;
  trial_start: string | null;
  trial_days: number | null;
  created_at: string;
}

interface FeatureBlock {
  user_id: string;
  feature_key: string;
  blocked: boolean;
}

const FEATURES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "agenda", label: "Agenda" },
  { key: "crm", label: "Funil de Vendas" },
  { key: "clientes", label: "Clientes" },
  { key: "financeiro", label: "Financeiro" },
  { key: "historico", label: "Histórico" },
  { key: "checklist", label: "Checklist" },
  { key: "equipe", label: "Equipe" },
  { key: "metas", label: "Metas" },
  { key: "aulas", label: "Aulas" },
  { key: "configuracoes", label: "Configurações" },
  { key: "orcamentos", label: "Orçamentos" },
  { key: "contratos", label: "Contratos" },
];

const PLAN_FILTERS = [
  { value: "all", label: "TODOS" },
  { value: "trial", label: "TRIAL" },
  { value: "inicial", label: "INICIAL" },
  { value: "essencial", label: "ESSENCIAL" },
  { value: "completo", label: "COMPLETO" },
  { value: "expirado", label: "EXPIRADOS" },
];

// Plan durations in days
const PLAN_DURATIONS: Record<string, number> = {
  trial: 3,
  inicial: 30,
  essencial: 180,
  completo: 365,
};

export default function Admin() {
  const { user, loading: authLoading } = useRequireAuth();
  const { settings, refreshSettings } = useAppSettings();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [featureBlocks, setFeatureBlocks] = useState<FeatureBlock[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [trialDays, setTrialDays] = useState("3");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [appName, setAppName] = useState("Backstage Pro");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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

  // Fetch users and feature blocks
  useEffect(() => {
    async function fetchData() {
      if (!isAdmin) return;

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast.error("Erro ao carregar usuários");
      } else {
        setUsers(profilesData || []);
      }

      // Fetch all feature blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from("user_feature_blocks")
        .select("*");

      if (blocksError) {
        console.error("Error fetching feature blocks:", blocksError);
      } else {
        setFeatureBlocks(blocksData || []);
      }

      // Fetch trial duration setting
      const { data: settingsData } = await supabase
        .from("app_settings")
        .select("*")
        .eq("setting_key", "trial_duration_days")
        .single();

      if (settingsData) {
        setTrialDays(settingsData.setting_value || "3");
      }
    }

    fetchData();
  }, [isAdmin]);

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
    } else {
      setUsers(prev => prev.map(u => 
        u.user_id === userId 
          ? { ...u, plan, trial_start: updates.trial_start || u.trial_start, trial_days: updates.trial_days || u.trial_days } 
          : u
      ));
      const planDuration = PLAN_DURATIONS[plan];
      toast.success(`Plano atualizado para ${plan.toUpperCase()} (${planDuration} dias)`);
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

  const getPlanStats = () => {
    const stats = {
      trial: users.filter(u => u.plan === "trial").length,
      inicial: users.filter(u => u.plan === "inicial").length,
      essencial: users.filter(u => u.plan === "essencial").length,
      completo: users.filter(u => u.plan === "completo").length,
      expirado: users.filter(u => u.plan === "expirado").length,
    };
    return stats;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    if (planFilter === "all") return matchesSearch;
    return matchesSearch && user.plan === planFilter;
  });

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Usuários</TabsTrigger>
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
          <div className="space-y-4">
            {filteredUsers.map(userProfile => (
              <Card key={userProfile.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{userProfile.name || "Sem nome"}</CardTitle>
                      <CardDescription>{userProfile.email}</CardDescription>
                      <p className="text-xs text-muted-foreground mt-1">
                        Criado em: {new Date(userProfile.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setExpandedUser(expandedUser === userProfile.user_id ? null : userProfile.user_id)}
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
                  </CardContent>
                )}
              </Card>
            ))}

            {filteredUsers.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Nenhum usuário encontrado
                </CardContent>
              </Card>
            )}
          </div>
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
