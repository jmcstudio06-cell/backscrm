import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Camera, Shield, Globe, CreditCard, LogOut, Save, Loader2, Crown } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const planLabels: Record<string, string> = {
  trial: "Trial",
  inicial: "Inicial",
  essencial: "Essencial",
  completo: "Completo",
  expirado: "Expirado",
};

const planColors: Record<string, string> = {
  trial: "bg-orange-500",
  inicial: "bg-blue-500",
  essencial: "bg-green-500",
  completo: "bg-purple-500",
  expirado: "bg-destructive",
};

export default function Configuracoes() {
  const { profile, loading, updateProfile } = useProfile();
  const { plan, daysRemaining } = useTrialStatus();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Avatar upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
      setCity(profile.city || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      name,
      email,
      phone,
      city,
    });
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos de senha");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Erro ao alterar senha");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success("Todas as sessões foram encerradas");
      window.location.href = "/auth";
    } catch (error) {
      toast.error("Erro ao encerrar sessões");
    }
  };

  // Avatar upload handlers
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);

    try {
      const fileName = `${profile.id}_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      await updateProfile({ avatar_url: publicUrl });
      toast.success("Foto atualizada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar foto");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout title="Configurações" subtitle="Gerencie suas preferências">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Plan Badge Card */}
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Seu Plano Atual</p>
                  <h3 className="text-xl font-bold">{planLabels[plan] || plan}</h3>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`${planColors[plan] || "bg-muted"} text-white border-0`}>
                  {daysRemaining > 0 ? `${daysRemaining} dias restantes` : "Expirado"}
                </Badge>
              </div>
            </div>
          </div>

          <ChartCard
            title="Informações Pessoais"
            subtitle="Atualize seus dados para aparecer nos orçamentos e contratos"
          >
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
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

              {/* Form */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Nome Artístico / Empresa</label>
                  <Input
                    placeholder="Ex: João Silva Music"
                    className="mt-1 bg-secondary"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Este nome aparecerá nos orçamentos e contratos</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    placeholder="seu@email.com"
                    className="mt-1 bg-secondary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Telefone</label>
                  <Input
                    placeholder="(00) 00000-0000"
                    className="mt-1 bg-secondary"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Cidade - UF</label>
                  <Input
                    placeholder="Ex: São Paulo - SP"
                    className="mt-1 bg-secondary"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Esta cidade aparecerá na assinatura dos contratos
                  </p>
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

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <ChartCard title="Preferências do Sistema">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Idioma</p>
                    <p className="text-sm text-muted-foreground">Português (Brasil)</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Alterar
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Moeda</p>
                    <p className="text-sm text-muted-foreground">Real Brasileiro (BRL)</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Alterar
                </Button>
              </div>
            </div>
          </ChartCard>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <ChartCard title="Segurança da Conta">
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Alterar Senha</p>
                    <p className="text-sm text-muted-foreground">Defina uma nova senha para sua conta</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Nova Senha</label>
                    <Input
                      type="password"
                      className="mt-1 bg-secondary"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Confirmar Nova Senha</label>
                    <Input
                      type="password"
                      className="mt-1 bg-secondary"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                    />
                  </div>
                </div>
                <Button variant="gradient" className="mt-4" onClick={handleChangePassword} disabled={changingPassword}>
                  {changingPassword ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Alterar Senha
                </Button>
              </div>

              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-3 mb-4">
                  <LogOut className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Encerrar Sessão</p>
                    <p className="text-sm text-muted-foreground">Desconectar de todos os dispositivos</p>
                  </div>
                </div>
                <Button variant="destructive" onClick={handleLogoutAll}>
                  Encerrar Todas as Sessões
                </Button>
              </div>
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
