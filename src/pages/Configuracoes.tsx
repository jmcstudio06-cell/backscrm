import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Camera,
  Shield,
  Globe,
  CreditCard,
  LogOut,
  Save,
  Loader2,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

export default function Configuracoes() {
  const { profile, loading, updateProfile } = useProfile();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      name,
      email,
      phone,
    });
    setSaving(false);
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
          <ChartCard title="Informações Pessoais" subtitle="Atualize seus dados para aparecer nos orçamentos e contratos">
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
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Alterar Foto
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
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="gradient" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
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
                <Button variant="outline" size="sm">Alterar</Button>
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
                <Button variant="outline" size="sm">Alterar</Button>
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
                    <p className="text-sm text-muted-foreground">Última alteração há 30 dias</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Senha Atual</label>
                    <Input type="password" className="mt-1 bg-secondary" />
                  </div>
                  <div />
                  <div>
                    <label className="text-sm font-medium text-foreground">Nova Senha</label>
                    <Input type="password" className="mt-1 bg-secondary" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Confirmar Nova Senha</label>
                    <Input type="password" className="mt-1 bg-secondary" />
                  </div>
                </div>
                <Button variant="gradient" className="mt-4">
                  Alterar Senha
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Autenticação em Dois Fatores</p>
                    <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                  </div>
                </div>
                <Switch />
              </div>

              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-3 mb-4">
                  <LogOut className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Encerrar Sessão</p>
                    <p className="text-sm text-muted-foreground">Desconectar de todos os dispositivos</p>
                  </div>
                </div>
                <Button variant="destructive">
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
