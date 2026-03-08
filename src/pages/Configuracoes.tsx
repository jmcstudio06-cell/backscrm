import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { User, Camera, Shield, LogOut, Save, Loader2, Crown, Music, FileText, ExternalLink, CalendarDays, ArrowUpCircle, Palette, RotateCcw, Check, Circle, Square, Type, Monitor, Smartphone, LayoutTemplate } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { processImage, formatFileSize } from "@/lib/imageUtils";
import { useCustomization, COLOR_PRESETS } from "@/hooks/useCustomization";
import { BudgetTemplatePreview } from "@/components/orcamentos/BudgetTemplatePreview";

const planLabels: Record<string, string> = {
  trial: "Teste Rápido (1 hora)",
  starter: "Plano Starter",
  mensal: "Plano Mensal",
  inicial: "Plano Mensal",
  essencial: "Plano Profissional",
  completo: "Plano Completo",
  anual: "Plano Anual",
  expirado: "Expirado",
};

const planColors: Record<string, string> = {
  trial: "bg-orange-500",
  starter: "bg-blue-500",
  mensal: "bg-blue-500",
  inicial: "bg-blue-500",
  essencial: "bg-green-500",
  completo: "bg-purple-500",
  anual: "bg-emerald-600",
  expirado: "bg-destructive",
};

const PLAN_DURATIONS: Record<string, number> = {
  trial: 0,
  starter: 30,
  mensal: 30,
  inicial: 30,
  essencial: 90,
  completo: 180,
  anual: 365,
};

const COLOR_LABELS: Record<string, string> = {
  "220": "Azul",
  "160": "Verde",
  "280": "Roxo",
  "340": "Rosa",
  "30": "Laranja",
  "0": "Vermelho",
  "190": "Ciano",
};

export default function Configuracoes() {
  const { profile, loading, updateProfile } = useProfile();
  const { plan, daysRemaining, trialStart } = useTrialStatus();
  const { settings: customization, updateSettings, resetSettings } = useCustomization();
  const navigate = useNavigate();
  
  // Dados Pessoais
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  // Perfil Artístico
  const [artistName, setArtistName] = useState("");
  const [projectType, setProjectType] = useState("solo");
  const [musicStyle, setMusicStyle] = useState("");
  const [baseCity, setBaseCity] = useState("");
  const [actionRadius, setActionRadius] = useState("100");
  const [savingArtist, setSavingArtist] = useState(false);

  // Avatar
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setCity(profile.city || "");
      setArtistName(profile.artist_name || "");
      setProjectType(profile.project_type || "solo");
      setMusicStyle(profile.music_style || "");
      setBaseCity(profile.base_city || "");
      setActionRadius(String(profile.action_radius || 100));
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({ name, email, phone, city });
    setSaving(false);
  };

  const handleSaveArtist = async () => {
    setSavingArtist(true);
    await updateProfile({
      artist_name: artistName,
      project_type: projectType,
      music_style: musicStyle,
      base_city: baseCity,
      action_radius: parseInt(actionRadius) || 100,
    });
    setSavingArtist(false);
  };

  const handleLogoutAll = async () => {
    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success("Todas as sessões encerradas");
      window.location.href = "/auth";
    } catch (error) {
      toast.error("Erro ao encerrar sessões");
    }
  };

  const handleSelectFile = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);

    try {
      const result = await processImage(file);
      
      if (!result.valid || !result.file) {
        toast.error(result.error || "Erro ao processar imagem");
        setUploading(false);
        return;
      }

      const processedFile = result.file;
      const originalSize = formatFileSize(file.size);
      const newSize = formatFileSize(processedFile.size);

      const extension = processedFile.type === 'image/webp' ? 'webp' : 'jpg';
      const fileName = `${profile.id}_${Date.now()}.${extension}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, processedFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      if (!data.publicUrl) throw new Error("Não foi possível gerar a URL da imagem");

      await updateProfile({ avatar_url: data.publicUrl });
      
      if (file.size !== processedFile.size) {
        toast.success(`Foto otimizada: ${originalSize} → ${newSize}`);
      } else {
        toast.success("Foto atualizada com sucesso!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar foto");
    } finally {
      setUploading(false);
    }
  };

  const handleResetCustomization = () => {
    resetSettings();
    toast.success("Personalização restaurada ao padrão!");
  };

  return (
    <Layout title="Configurações" subtitle="Gerencie suas preferências e personalize seu app">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary flex-wrap h-auto gap-1 p-1 w-full">
          <TabsTrigger value="profile" className="gap-1.5 flex-1 min-w-fit">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Meu Perfil</span>
            <span className="sm:hidden">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="artist" className="gap-1.5 flex-1 min-w-fit">
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">Perfil Artístico</span>
            <span className="sm:hidden">Artístico</span>
          </TabsTrigger>
          <TabsTrigger value="customization" className="gap-1.5 flex-1 min-w-fit">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Personalização</span>
            <span className="sm:hidden">Visual</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 flex-1 min-w-fit">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Segurança</span>
            <span className="sm:hidden">Segurança</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6">
          <ChartCard title="Seu Plano" subtitle="Status da sua assinatura">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${planColors[plan] || "bg-muted"} flex items-center justify-center`}>
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-foreground">{planLabels[plan] || "Trial"}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan === "expirado" 
                      ? "Plano expirado — renove para continuar usando" 
                      : plan === "trial"
                        ? "Teste gratuito de 1 hora"
                        : `${daysRemaining} dias restantes`
                    }
                  </p>
                </div>
              </div>

              {plan !== "trial" && plan !== "expirado" && trialStart && (
                <div className="bg-secondary rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      Início do plano
                    </span>
                    <span className="font-medium text-foreground">
                      {(() => {
                        const [y, m, d] = (trialStart.split("T")[0] || "").split("-");
                        return d && m && y ? `${d}/${m}/${y}` : trialStart;
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duração do plano</span>
                    <span className="font-medium text-foreground">
                      {PLAN_DURATIONS[plan] ? `${PLAN_DURATIONS[plan]} dias` : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dias restantes</span>
                    <span className={`font-bold ${daysRemaining <= 7 ? "text-destructive" : "text-primary"}`}>
                      {daysRemaining} dias
                    </span>
                  </div>
                  {PLAN_DURATIONS[plan] > 0 && (
                    <Progress 
                      value={Math.max(0, (daysRemaining / PLAN_DURATIONS[plan]) * 100)} 
                      className="h-2"
                    />
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                {plan !== "anual" && plan !== "expirado" && (
                  <Button 
                    variant="gradient"
                    className="flex-1"
                    onClick={() => navigate("/planos")}
                  >
                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                    {plan === "trial" ? "Escolher um Plano" : "Fazer Upgrade para Anual"}
                  </Button>
                )}
                {plan === "expirado" && (
                  <Button 
                    variant="gradient"
                    className="flex-1"
                    onClick={() => navigate("/planos")}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Renovar Plano
                  </Button>
                )}
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Informações Pessoais" subtitle="Seus dados de conta">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-primary-foreground" />
                  )}
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                <Button variant="outline" size="sm" onClick={handleSelectFile} disabled={uploading}>
                  <Camera className="w-4 h-4 mr-2" />
                  {uploading ? "Enviando..." : "Alterar Foto"}
                </Button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Nome</Label>
                  <Input className="mt-1 bg-secondary" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input className="mt-1 bg-secondary" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input className="mt-1 bg-secondary" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Cidade</Label>
                  <Input className="mt-1 bg-secondary" value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="gradient" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Alterações
              </Button>
            </div>
          </ChartCard>
        </TabsContent>

        {/* Perfil Artístico */}
        <TabsContent value="artist" className="space-y-6">
          <ChartCard 
            title="Perfil Artístico" 
            subtitle="Defina sua identidade profissional — será usado em orçamentos e contratos"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label>Nome Artístico</Label>
                <Input 
                  className="mt-1 bg-secondary" 
                  value={artistName} 
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Como você quer ser chamado"
                />
              </div>
              
              <div>
                <Label>Tipo de Projeto</Label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger className="mt-1 bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo</SelectItem>
                    <SelectItem value="dupla">Dupla</SelectItem>
                    <SelectItem value="trio">Trio</SelectItem>
                    <SelectItem value="banda">Banda</SelectItem>
                    <SelectItem value="orquestra">Orquestra/Grupo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estilo Musical Principal</Label>
                <Input 
                  className="mt-1 bg-secondary" 
                  value={musicStyle} 
                  onChange={(e) => setMusicStyle(e.target.value)}
                  placeholder="Ex: MPB, Sertanejo, Jazz"
                />
              </div>

              <div>
                <Label>Cidade Base</Label>
                <Input 
                  className="mt-1 bg-secondary" 
                  value={baseCity} 
                  onChange={(e) => setBaseCity(e.target.value)}
                  placeholder="Cidade onde você atua"
                />
              </div>

              <div>
                <Label>Raio de Atuação (km)</Label>
                <Input 
                  className="mt-1 bg-secondary" 
                  type="number"
                  value={actionRadius} 
                  onChange={(e) => setActionRadius(e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="gradient" onClick={handleSaveArtist} disabled={savingArtist}>
                {savingArtist ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Perfil Artístico
              </Button>
            </div>
          </ChartCard>
        </TabsContent>

        {/* Personalização */}
        <TabsContent value="customization" className="space-y-6">
          {/* Cor Principal */}
          <ChartCard 
            title="Cor Principal" 
            subtitle="Escolha a cor que combina com a sua identidade — tudo se adapta automaticamente"
          >
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {Object.entries(COLOR_LABELS).map(([hue, label]) => {
                const isSelected = customization.primaryColor === hue;
                return (
                  <button
                    key={hue}
                    onClick={() => updateSettings({ primaryColor: hue })}
                    className={`group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                      isSelected 
                        ? "border-foreground shadow-elevated scale-105" 
                        : "border-transparent hover:border-border hover:scale-102"
                    }`}
                  >
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-md flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: `hsl(${hue}, 90%, 56%)` }}
                    >
                      {isSelected && <Check className="w-5 h-5 text-white" />}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 rounded-xl bg-secondary space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pré-visualização</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="gradient" size="sm">Botão Primário</Button>
                <Button variant="outline" size="sm">Botão Secundário</Button>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-primary font-semibold">Texto destaque</span>
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Estilo de Ícones */}
          <ChartCard 
            title="Estilo dos Ícones" 
            subtitle="Escolha como os ícones aparecem no seu app"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => updateSettings({ iconStyle: "outline" })}
                className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                  customization.iconStyle === "outline" 
                    ? "border-primary bg-primary/5 shadow-glow" 
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                  <Circle className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Vazado (Outline)</p>
                  <p className="text-sm text-muted-foreground">Ícones com contorno, leve e moderno</p>
                </div>
                {customization.iconStyle === "outline" && <Check className="w-5 h-5 text-primary ml-auto" />}
              </button>

              <button
                onClick={() => updateSettings({ iconStyle: "filled" })}
                className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all ${
                  customization.iconStyle === "filled" 
                    ? "border-primary bg-primary/5 shadow-glow" 
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                  <Square className="w-7 h-7 text-primary fill-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Preenchido (Filled)</p>
                  <p className="text-sm text-muted-foreground">Ícones sólidos, forte e impactante</p>
                </div>
                {customization.iconStyle === "filled" && <Check className="w-5 h-5 text-primary ml-auto" />}
              </button>
            </div>
          </ChartCard>

          {/* Tamanho da Fonte */}
          <ChartCard 
            title="Tamanho do Texto" 
            subtitle="Ajuste o tamanho da fonte para o seu conforto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([
                { value: "small" as const, label: "Pequeno", desc: "Compacto, mais informação visível", icon: Smartphone },
                { value: "medium" as const, label: "Médio", desc: "Equilíbrio entre conforto e espaço", icon: Monitor },
                { value: "large" as const, label: "Grande", desc: "Maior legibilidade e conforto", icon: Type },
              ]).map(({ value, label, desc, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateSettings({ fontSize: value })}
                  className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                    customization.fontSize === value 
                      ? "border-primary bg-primary/5 shadow-glow" 
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <Icon className={`text-primary ${value === "small" ? "w-5 h-5" : value === "medium" ? "w-7 h-7" : "w-9 h-9"}`} />
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  {customization.fontSize === value && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))}
            </div>
          </ChartCard>


          {/* Modo Compacto */}
          <ChartCard 
            title="Preferências de Layout" 
            subtitle="Ajuste como o conteúdo é exibido"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                <div>
                  <Label className="text-base font-semibold">Modo Compacto</Label>
                  <p className="text-sm text-muted-foreground">Reduz espaçamento para ver mais conteúdo na tela</p>
                </div>
                <Switch 
                  checked={customization.compactMode} 
                  onCheckedChange={(checked) => updateSettings({ compactMode: checked })} 
                />
              </div>
            </div>
          </ChartCard>

          {/* Reset */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleResetCustomization} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Restaurar Padrão
            </Button>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <ChartCard title="Segurança da Conta" subtitle="Gerencie a segurança da sua conta">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <LogOut className="w-5 h-5" />
                  Sessões Ativas
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Encerre todas as sessões ativas em outros dispositivos.
                </p>
                <Button variant="destructive" className="mt-4" onClick={handleLogoutAll}>
                  Encerrar Todas as Sessões
                </Button>
              </div>

              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentos Legais
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Consulte nossa política de privacidade e termos de uso.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button variant="outline" asChild>
                    <Link to="/privacidade">
                      <FileText className="w-4 h-4 mr-2" />
                      Política de Privacidade
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/termos">
                      <FileText className="w-4 h-4 mr-2" />
                      Termos de Uso
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
