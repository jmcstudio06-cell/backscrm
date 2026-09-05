import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  User, Camera, Shield, LogOut, Save, Loader2, Crown, Music, FileText, 
  ExternalLink, CalendarDays, ArrowUpCircle, Palette, RotateCcw, Check, 
  Circle, Square, Type, Monitor, Smartphone, MapPin, Radio, Disc3, 
  Guitar, Zap, Lock, Eye, Sparkles, KeyRound, Trash2, Link2
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { InstallAppSection } from "@/components/configuracoes/InstallAppSection";


import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { processImage, formatFileSize } from "@/lib/imageUtils";
import { useCustomization, COLOR_PRESETS } from "@/hooks/useCustomization";

const planLabels: Record<string, string> = {
  trial: "Teste Grátis (3 horas)",
  mensal_starter: "Mensal Starter",
  mensal_profissional: "Mensal Profissional",
  mensal_completo: "Mensal Completo",
  mensal_executivo: "Mensal Executivo",
  anual_starter: "Anual Starter",
  anual_profissional: "Anual Profissional",
  anual_completo: "Anual Completo",
  anual_executivo: "Anual Executivo",
  // Legacy
  starter: "Plano Starter",
  mensal: "Plano Mensal",
  inicial: "Plano Mensal",
  essencial: "Plano Profissional",
  completo: "Plano Completo",
  anual: "Plano Anual",
  base: "Plano Mensal",
  expirado: "Expirado",
  comprou_expirado: "Comprou Expirado",
};

const PLAN_DURATIONS: Record<string, number> = {
  trial: 0,
  mensal_starter: 30,
  mensal_profissional: 30,
  mensal_completo: 30,
  mensal_executivo: 30,
  anual_starter: 365,
  anual_profissional: 365,
  anual_completo: 365,
  anual_executivo: 365,
  // Legacy
  starter: 30, mensal: 30, inicial: 30, base: 30,
  essencial: 90, completo: 180, anual: 365,
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
  const { plan, daysRemaining, trialStart } = useTrialStatus(profile);
  const { settings: customization, updateSettings, resetSettings } = useCustomization();
  const navigate = useNavigate();
  const location = useLocation();
  const activeSection = (() => {
    if (location.pathname === "/configuracoes/perfil-artistico") return "artist";
    if (location.pathname === "/configuracoes/personalizacao") return "customization";
    if (location.pathname === "/configuracoes/seguranca") return "security";
    return "profile";
  })();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  const [artistName, setArtistName] = useState("");
  const [projectType, setProjectType] = useState("solo");
  const [musicStyle, setMusicStyle] = useState("");
  const [baseCity, setBaseCity] = useState("");
  const [actionRadius, setActionRadius] = useState("100");
  const [savingArtist, setSavingArtist] = useState(false);

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

  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (profile?.email) setResetEmail(profile.email);
  }, [profile]);

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) {
      toast.error("Digite seu email");
      return;
    }
    setResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success("Email enviado! Verifique sua caixa de entrada.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar email de redefinição");
    } finally {
      setResettingPassword(false);
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
      const fileName = `${profile.user_id}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, processedFile, {
        upsert: true,
        contentType: processedFile.type,
      });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
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

  const planGradient = (plan === "expirado" || plan === "comprou_expirado") 
    ? "from-destructive/20 to-destructive/5" 
    : plan === "trial" 
      ? "from-warning/20 to-warning/5"
      : "from-primary/20 to-accent/10";

  const planIcon = (plan === "expirado" || plan === "comprou_expirado") ? "text-destructive" : plan === "trial" ? "text-warning" : "text-primary";

  const sectionTitles: Record<string, { title: string; subtitle: string }> = {
    profile: { title: "Configurações", subtitle: "Gerencie seus dados pessoais e plano" },
    artist: { title: "Perfil Artístico", subtitle: "Configure sua identidade artística pública" },
    customization: { title: "Personalização", subtitle: "Ajuste cores, tema e aparência do app" },
    security: { title: "Segurança", subtitle: "Gerencie senha, acesso e dados sensíveis" },
  };

  return (
    <Layout title={sectionTitles[activeSection].title} subtitle={sectionTitles[activeSection].subtitle}>
      <div className="space-y-6">

        {/* ════════ MEU PERFIL ════════ */}
        {activeSection === "profile" && <div className="space-y-6 animate-in fade-in-50 duration-300">
          
          {/* Plan Card - Hero Style */}
          <div className={`relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br ${planGradient}`}>
            <div className="absolute inset-0 bg-card/80 backdrop-blur-sm" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                    <Crown className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{planLabels[plan] || "Trial"}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {(plan === "expirado" || plan === "comprou_expirado")
                        ? "Plano expirado — renove para continuar" 
                        : plan === "trial"
                          ? "Teste gratuito de 3 horas"
                          : `${daysRemaining} dias restantes`
                      }
                    </p>
                  </div>
                </div>
                {plan !== "trial" && plan !== "expirado" && plan !== "comprou_expirado" && (
                  <span className={`text-2xl font-black ${daysRemaining <= 7 ? "text-destructive" : "text-primary"}`}>
                    {daysRemaining}d
                  </span>
                )}
              </div>

              {plan !== "trial" && plan !== "expirado" && plan !== "comprou_expirado" && trialStart && (
                <div className="space-y-3 mb-5">
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { 
                        label: "Início", 
                        value: (() => {
                          const [y, m, d] = (trialStart.split("T")[0] || "").split("-");
                          return d && m && y ? `${d}/${m}/${y}` : trialStart;
                        })()
                      },
                      { label: "Duração", value: PLAN_DURATIONS[plan] ? `${PLAN_DURATIONS[plan]}d` : "—" },
                      { label: "Restantes", value: `${daysRemaining}d`, highlight: daysRemaining <= 7 },
                    ].map((item, i) => (
                      <div key={i} className="bg-card/60 backdrop-blur-sm rounded-xl p-3 text-center border border-border/30">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                        <p className={`text-sm font-bold ${(item as any).highlight ? "text-destructive" : "text-foreground"}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  {PLAN_DURATIONS[plan] > 0 && (
                    <Progress 
                      value={Math.max(0, (daysRemaining / PLAN_DURATIONS[plan]) * 100)} 
                      className="h-2"
                    />
                  )}
                </div>
              )}

              {(plan !== "anual") && (
                <Button 
                  variant="gradient"
                  className="w-full h-12 text-base font-semibold shadow-lg"
                  onClick={() => navigate("/planos")}
                >
                  {(plan === "expirado" || plan === "comprou_expirado") ? (
                    <><Crown className="w-5 h-5 mr-2" /> Renovar Plano</>
                  ) : plan === "trial" ? (
                    <><Zap className="w-5 h-5 mr-2" /> Escolher um Plano</>
                  ) : (
                    <><ArrowUpCircle className="w-5 h-5 mr-2" /> Fazer Upgrade para Anual</>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Personal Info */}
          <div className="rounded-2xl border border-border/50 bg-card shadow-card overflow-hidden">
            <div className="p-6 pb-0">
              <h3 className="text-lg font-bold text-foreground">Informações Pessoais</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Seus dados de conta</p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden ring-4 ring-background shadow-elevated">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-primary-foreground" />
                      )}
                    </div>
                    <button 
                      onClick={handleSelectFile}
                      disabled={uploading}
                      className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  <span className="text-xs text-muted-foreground">
                    {uploading ? "Enviando..." : "Clique no ícone"}
                  </span>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-4">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome</Label>
                    <Input className="mt-1.5 h-11 bg-secondary/50 border-border/50 focus:bg-card" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                      <Input className="mt-1.5 h-11 bg-secondary/50 border-border/50 focus:bg-card" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Telefone</Label>
                      <Input className="mt-1.5 h-11 bg-secondary/50 border-border/50 focus:bg-card" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cidade</Label>
                    <Input className="mt-1.5 h-11 bg-secondary/50 border-border/50 focus:bg-card" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-secondary/30 border-t border-border/30 flex justify-end">
              <Button variant="gradient" onClick={handleSave} disabled={saving} className="h-10 px-6">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>}

        {/* ════════ PERFIL ARTÍSTICO ════════ */}
        {activeSection === "artist" && <div className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="rounded-2xl border border-border/50 bg-card shadow-card overflow-hidden">
            {/* Header com gradiente */}
            <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                  <Disc3 className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Perfil Artístico</h3>
                  <p className="text-xs text-muted-foreground">Usado em orçamentos, contratos e página de booking</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Nome Artístico
                </Label>
                <Input 
                  className="mt-1.5 h-11 bg-secondary/50 border-border/50 focus:bg-card text-base font-medium" 
                  value={artistName} 
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Como você quer ser chamado"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Guitar className="w-3.5 h-3.5" /> Tipo de Projeto
                  </Label>
                  <Select value={projectType} onValueChange={setProjectType}>
                    <SelectTrigger className="mt-1.5 h-11 bg-secondary/50 border-border/50">
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
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" /> Estilo Musical
                  </Label>
                  <Input 
                    className="mt-1.5 h-11 bg-secondary/50 border-border/50 focus:bg-card" 
                    value={musicStyle} 
                    onChange={(e) => setMusicStyle(e.target.value)}
                    placeholder="Ex: MPB, Sertanejo, Jazz"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Cidade Base
                  </Label>
                  <Input 
                    className="mt-1.5 h-11 bg-secondary/50 border-border/50 focus:bg-card" 
                    value={baseCity} 
                    onChange={(e) => setBaseCity(e.target.value)}
                    placeholder="Cidade onde você atua"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" /> Raio de Atuação (km)
                  </Label>
                  <Input 
                    className="mt-1.5 h-11 bg-secondary/50 border-border/50 focus:bg-card" 
                    type="number"
                    value={actionRadius} 
                    onChange={(e) => setActionRadius(e.target.value)}
                    placeholder="100"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-secondary/30 border-t border-border/30 flex justify-end">
              <Button variant="gradient" onClick={handleSaveArtist} disabled={savingArtist} className="h-10 px-6">
                {savingArtist ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Perfil Artístico
              </Button>
            </div>
          </div>
        </div>}



        {/* ════════ PERSONALIZAÇÃO ════════ */}
        {activeSection === "customization" && <div className="space-y-5 animate-in fade-in-50 duration-300">
          
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card">
            <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                  <Palette className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Personalização</h3>
                  <p className="text-xs text-muted-foreground">Deixe o app com a sua cara</p>
                </div>
              </div>
            </div>

            {/* Cor Principal */}
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-foreground text-sm">Cor Principal</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Escolha a cor da sua identidade visual</p>
              </div>
              
              <div className="flex items-center justify-center gap-3 sm:gap-5 py-2">
                {Object.entries(COLOR_LABELS).map(([hue, label]) => {
                  const isSelected = customization.primaryColor === hue;
                  return (
                    <button
                      key={hue}
                      onClick={() => updateSettings({ primaryColor: hue })}
                      className="group flex flex-col items-center gap-1.5 transition-all duration-200"
                    >
                      <div 
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-md flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
                          isSelected ? "ring-2 ring-foreground/80 ring-offset-2 ring-offset-card scale-110" : "opacity-80 group-hover:opacity-100"
                        }`}
                        style={{ background: `hsl(${hue}, 90%, 56%)` }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                      </div>
                      <span className={`text-[10px] font-medium transition-colors ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Preview */}
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/30">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">Pré-visualização</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="gradient" size="sm">Botão Primário</Button>
                  <Button variant="outline" size="sm">Secundário</Button>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm text-primary font-semibold">Destaque</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="mx-6" />

            {/* Estilo dos Ícones */}
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-foreground text-sm">Estilo dos Ícones</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Como os ícones aparecem no app</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "outline" as const, label: "Vazado", desc: "Leve e moderno", icon: <Circle className="w-6 h-6 text-primary" /> },
                  { value: "filled" as const, label: "Preenchido", desc: "Forte e impactante", icon: <Square className="w-6 h-6 text-primary fill-primary" /> },
                ].map(({ value, label, desc, icon }) => (
                  <button
                    key={value}
                    onClick={() => updateSettings({ iconStyle: value })}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                      customization.iconStyle === value 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{label}</p>
                      <p className="text-[11px] text-muted-foreground">{desc}</p>
                    </div>
                    {customization.iconStyle === value && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="mx-6" />

            {/* Tamanho do Texto */}
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-foreground text-sm">Tamanho do Texto</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Ajuste para seu conforto visual</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: "small" as const, label: "Pequeno", icon: Smartphone, size: "w-5 h-5" },
                  { value: "medium" as const, label: "Médio", icon: Monitor, size: "w-6 h-6" },
                  { value: "large" as const, label: "Grande", icon: Type, size: "w-7 h-7" },
                ]).map(({ value, label, icon: Icon, size }) => (
                  <button
                    key={value}
                    onClick={() => updateSettings({ fontSize: value })}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      customization.fontSize === value 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <Icon className={`text-primary ${size}`} />
                    <span className="font-medium text-foreground text-xs">{label}</span>
                    {customization.fontSize === value && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="mx-6" />

            {/* Modo Compacto */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Modo Compacto</h4>
                    <p className="text-xs text-muted-foreground">Menos espaçamento, mais conteúdo visível</p>
                  </div>
                </div>
                <Switch 
                  checked={customization.compactMode} 
                  onCheckedChange={(checked) => updateSettings({ compactMode: checked })} 
                />
              </div>
            </div>

            {/* Modo Compatibilidade (Lite) */}
            <div className="p-6 border-t border-border/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                      Modo Compatibilidade
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 uppercase tracking-wide">Beta</span>
                    </h4>
                    <p className="text-xs text-muted-foreground">Ative se seu celular for antigo ou estiver com tela bugada/quebrada. Desliga efeitos pesados (blur, animações).</p>
                  </div>
                </div>
                <Switch
                  checked={customization.liteMode}
                  onCheckedChange={(checked) => updateSettings({ liteMode: checked })}
                />
              </div>
            </div>

            {/* Footer - Reset */}
            <div className="px-6 py-4 bg-secondary/20 border-t border-border/30 flex justify-center">
              <Button variant="ghost" size="sm" onClick={handleResetCustomization} className="gap-2 text-muted-foreground hover:text-foreground">
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar Padrão
              </Button>
            </div>
          </div>
        </div>}

        {/* ════════ SEGURANÇA ════════ */}
        {activeSection === "security" && <div className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="rounded-2xl border border-border/50 bg-card shadow-card overflow-hidden">
            <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-r from-destructive/5 via-transparent to-transparent">
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-foreground to-foreground/80 flex items-center justify-center shadow-md">
                  <Lock className="w-6 h-6 text-background" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Segurança da Conta</h3>
                  <p className="text-xs text-muted-foreground">Gerencie sessões e documentos legais</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Sessions */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                <div className="flex items-start gap-3">
                  <LogOut className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Sessões Ativas</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Encerre todas as sessões ativas em outros dispositivos para proteger sua conta.
                    </p>
                    <Button variant="destructive" size="sm" className="mt-3" onClick={handleLogoutAll}>
                      Encerrar Todas as Sessões
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Instalar App */}
              <InstallAppSection />

              <Separator />

              {/* Clear Cache */}

              <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">Limpar Cache do App</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Se o app estiver travando ou mostrando dados desatualizados, limpe o cache para resolver.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 gap-2" 
                      onClick={async () => {
                        try {
                          if ('caches' in window) {
                            const cacheNames = await caches.keys();
                            await Promise.all(cacheNames.map(name => caches.delete(name)));
                          }
                          const authKeys: string[] = [];
                          for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key && (key.startsWith('sb-') || key.startsWith('supabase'))) {
                              authKeys.push(key);
                            }
                          }
                          const authData = authKeys.map(k => ({ k, v: localStorage.getItem(k) }));
                          localStorage.clear();
                          authData.forEach(({ k, v }) => { if (v) localStorage.setItem(k, v); });
                          if ('serviceWorker' in navigator) {
                            const registrations = await navigator.serviceWorker.getRegistrations();
                            await Promise.all(registrations.map(r => r.unregister()));
                          }
                          toast.success("Cache limpo! O app será recarregado...");
                          setTimeout(() => window.location.reload(), 1500);
                        } catch (err) {
                          console.error("Erro ao limpar cache:", err);
                          toast.error("Erro ao limpar cache");
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Limpar Cache e Recarregar
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Legal */}
              <div>
                <h4 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" />
                  Documentos Legais
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" asChild className="h-12 justify-start">
                    <Link to="/privacidade">
                      <FileText className="w-4 h-4 mr-2 text-primary" />
                      Política de Privacidade
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-12 justify-start">
                    <Link to="/termos">
                      <FileText className="w-4 h-4 mr-2 text-primary" />
                      Termos de Uso
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>}
      </div>
    </Layout>
  );
}
