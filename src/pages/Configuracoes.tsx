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
import { processImage, formatFileSize } from "@/lib/imageUtils";

const planLabels: Record<string, string> = {
  trial: "Trial",
  mensal: "Plano Mensal",
  inicial: "Plano Mensal", // compatibilidade
  essencial: "Plano Profissional 3 Meses",
  completo: "Plano Profissional 6 Meses",
  expirado: "Expirado",
};

const planColors: Record<string, string> = {
  trial: "bg-orange-500",
  mensal: "bg-blue-500",
  inicial: "bg-blue-500", // compatibilidade
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

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Avatar
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
    await updateProfile({ name, email, phone, city });
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) return toast.error("Preencha todos os campos de senha");
    if (newPassword !== confirmPassword) return toast.error("As senhas não coincidem");
    if (newPassword.length < 6) return toast.error("A senha deve ter pelo menos 6 caracteres");

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao alterar senha");
    } finally {
      setChangingPassword(false);
    }
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
      // Processar e comprimir imagem (limite 500KB)
      const result = await processImage(file);
      
      if (!result.valid || !result.file) {
        toast.error(result.error || "Erro ao processar imagem");
        setUploading(false);
        return;
      }

      const processedFile = result.file;
      const originalSize = formatFileSize(file.size);
      const newSize = formatFileSize(processedFile.size);

      const fileName = `${profile.id}_${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, processedFile, { upsert: true });
      if (uploadError) throw uploadError;

      // Pegar URL pública
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      if (!data.publicUrl) throw new Error("Não foi possível gerar a URL da imagem");

      // Atualizar perfil com nova URL
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
    <Layout title="Configurações" subtitle="Gerencie suas preferências">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-6">
          {/* Plan Badge */}
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

          <ChartCard title="Informações Pessoais" subtitle="Atualize seus dados">
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
                  <label className="text-sm font-medium text-foreground">Nome</label>
                  <Input className="mt-1 bg-secondary" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input className="mt-1 bg-secondary" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Telefone</label>
                  <Input className="mt-1 bg-secondary" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Cidade</label>
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

        {/* Preferences - placeholder */}
        <TabsContent value="preferences" className="space-y-6">
          <ChartCard title="Preferências" subtitle="Configurações do sistema">
            <p className="text-muted-foreground">Configurações em breve...</p>
          </ChartCard>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <ChartCard title="Segurança da Conta" subtitle="Gerencie a segurança da sua conta">
            <div className="space-y-6">
              {/* Change Password */}
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Alterar Senha
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Nova Senha</label>
                    <Input
                      type="password"
                      className="mt-1 bg-secondary"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Confirmar Nova Senha</label>
                    <Input
                      type="password"
                      className="mt-1 bg-secondary"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button onClick={handleChangePassword} disabled={changingPassword}>
                    {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Alterar Senha
                  </Button>
                </div>
              </div>

              {/* Logout All */}
              <div className="pt-6 border-t border-border">
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
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
