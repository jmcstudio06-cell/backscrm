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
import { User, Camera, Shield, LogOut, Save, Loader2, Crown, Music, Clock, DollarSign, FileText, ExternalLink, CalendarDays, ArrowUpCircle } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { processImage, formatFileSize } from "@/lib/imageUtils";

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
  trial: 0, // 1 hour, handled separately
  starter: 30,
  mensal: 30,
  inicial: 30,
  essencial: 90,
  completo: 180,
  anual: 365,
};

export default function Configuracoes() {
  const { profile, loading, updateProfile } = useProfile();
  const { plan, daysRemaining, trialStart } = useTrialStatus();
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

  // Regras de Show
  const [showDuration, setShowDuration] = useState("2 horas");
  const [delayTolerance, setDelayTolerance] = useState("30 minutos");
  const [hasInterval, setHasInterval] = useState(false);
  const [requiresFood, setRequiresFood] = useState(false);
  const [savingShow, setSavingShow] = useState(false);

  // Regras Financeiras
  const [minFee, setMinFee] = useState("");
  const [depositPercentage, setDepositPercentage] = useState("50");
  const [acceptedPayment, setAcceptedPayment] = useState("Pix, Transferência");
  const [paymentDeadline, setPaymentDeadline] = useState("No dia do show");
  const [lateFeePercentage, setLateFeePercentage] = useState("2");
  const [savingFinancial, setSavingFinancial] = useState(false);

  // Avatar
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      // Dados Pessoais
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setCity(profile.city || "");
      // Perfil Artístico
      setArtistName(profile.artist_name || "");
      setProjectType(profile.project_type || "solo");
      setMusicStyle(profile.music_style || "");
      setBaseCity(profile.base_city || "");
      setActionRadius(String(profile.action_radius || 100));
      // Regras de Show
      setShowDuration(profile.show_duration || "2 horas");
      setDelayTolerance(profile.delay_tolerance || "30 minutos");
      setHasInterval(profile.has_interval || false);
      setRequiresFood(profile.requires_food || false);
      // Regras Financeiras
      setMinFee(String(profile.min_fee || ""));
      setDepositPercentage(String(profile.deposit_percentage || 50));
      setAcceptedPayment(profile.accepted_payment || "Pix, Transferência");
      setPaymentDeadline(profile.payment_deadline || "No dia do show");
      setLateFeePercentage(String(profile.late_fee_percentage || 2));
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

  const handleSaveShow = async () => {
    setSavingShow(true);
    await updateProfile({
      show_duration: showDuration,
      delay_tolerance: delayTolerance,
      has_interval: hasInterval,
      requires_food: requiresFood,
    });
    setSavingShow(false);
  };

  const handleSaveFinancial = async () => {
    setSavingFinancial(true);
    await updateProfile({
      min_fee: parseFloat(minFee) || 0,
      deposit_percentage: parseInt(depositPercentage) || 50,
      accepted_payment: acceptedPayment,
      payment_deadline: paymentDeadline,
      late_fee_percentage: parseFloat(lateFeePercentage) || 2,
    });
    setSavingFinancial(false);
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

  return (
    <Layout title="Configurações" subtitle="Gerencie suas preferências e regras de trabalho">
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
          <TabsTrigger value="show-rules" className="gap-1.5 flex-1 min-w-fit">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Regras de Show</span>
            <span className="sm:hidden">Show</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="gap-1.5 flex-1 min-w-fit">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Regras Financeiras</span>
            <span className="sm:hidden">Financeiro</span>
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
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${planColors[plan] || "bg-muted"} flex items-center justify-center`}>
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{planLabels[plan] || "Trial"}</p>
                <p className="text-sm text-muted-foreground">
                  {plan === "expirado" ? "Plano expirado" : `${daysRemaining} dias restantes`}
                </p>
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

        {/* Regras de Show */}
        <TabsContent value="show-rules" className="space-y-6">
          <ChartCard 
            title="Regras de Show" 
            subtitle="Defina como você trabalha — será padrão automático nos contratos"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Duração Padrão do Show</Label>
                <Select value={showDuration} onValueChange={setShowDuration}>
                  <SelectTrigger className="mt-1 bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 hora">1 hora</SelectItem>
                    <SelectItem value="1h30">1h30</SelectItem>
                    <SelectItem value="2 horas">2 horas</SelectItem>
                    <SelectItem value="2h30">2h30</SelectItem>
                    <SelectItem value="3 horas">3 horas</SelectItem>
                    <SelectItem value="4 horas">4 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tolerância de Atraso</Label>
                <Select value={delayTolerance} onValueChange={setDelayTolerance}>
                  <SelectTrigger className="mt-1 bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15 minutos">15 minutos</SelectItem>
                    <SelectItem value="30 minutos">30 minutos</SelectItem>
                    <SelectItem value="45 minutos">45 minutos</SelectItem>
                    <SelectItem value="1 hora">1 hora</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <Label>Intervalo no Show</Label>
                  <p className="text-sm text-muted-foreground">Incluir intervalo na apresentação</p>
                </div>
                <Switch checked={hasInterval} onCheckedChange={setHasInterval} />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg md:col-span-2">
                <div>
                  <Label>Alimentação Obrigatória</Label>
                  <p className="text-sm text-muted-foreground">Exigir refeição para a equipe</p>
                </div>
                <Switch checked={requiresFood} onCheckedChange={setRequiresFood} />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="gradient" onClick={handleSaveShow} disabled={savingShow}>
                {savingShow ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Regras de Show
              </Button>
            </div>
          </ChartCard>
        </TabsContent>

        {/* Regras Financeiras */}
        <TabsContent value="financial" className="space-y-6">
          <ChartCard 
            title="Regras Financeiras" 
            subtitle="Defina suas políticas de pagamento — evite conversas desconfortáveis"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Cachê Mínimo Aceitável (R$)</Label>
                <Input 
                  className="mt-1 bg-secondary" 
                  type="number"
                  value={minFee} 
                  onChange={(e) => setMinFee(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <Label>Percentual de Sinal (%)</Label>
                <Select value={depositPercentage} onValueChange={setDepositPercentage}>
                  <SelectTrigger className="mt-1 bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem sinal</SelectItem>
                    <SelectItem value="30">30%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="70">70%</SelectItem>
                    <SelectItem value="100">100% antecipado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Formas de Pagamento Aceitas</Label>
                <Input 
                  className="mt-1 bg-secondary" 
                  value={acceptedPayment} 
                  onChange={(e) => setAcceptedPayment(e.target.value)}
                  placeholder="Pix, Transferência, Dinheiro"
                />
              </div>

              <div>
                <Label>Prazo para Pagamento</Label>
                <Select value={paymentDeadline} onValueChange={setPaymentDeadline}>
                  <SelectTrigger className="mt-1 bg-secondary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Antecipado">100% Antecipado</SelectItem>
                    <SelectItem value="Até o dia anterior">Até o dia anterior</SelectItem>
                    <SelectItem value="No dia do show">No dia do show</SelectItem>
                    <SelectItem value="Até 7 dias após">Até 7 dias após</SelectItem>
                    <SelectItem value="Até 15 dias após">Até 15 dias após</SelectItem>
                    <SelectItem value="Até 30 dias após">Até 30 dias após</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Multa por Atraso (%)</Label>
                <Input 
                  className="mt-1 bg-secondary" 
                  type="number"
                  value={lateFeePercentage} 
                  onChange={(e) => setLateFeePercentage(e.target.value)}
                  placeholder="2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentual cobrado sobre o valor total em caso de atraso no pagamento
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="gradient" onClick={handleSaveFinancial} disabled={savingFinancial}>
                {savingFinancial ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Salvar Regras Financeiras
              </Button>
            </div>
          </ChartCard>
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
