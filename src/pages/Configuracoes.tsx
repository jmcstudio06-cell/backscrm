import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  Camera,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  LogOut,
  Save,
} from "lucide-react";

export default function Configuracoes() {
  return (
    <Layout title="Configurações" subtitle="Gerencie suas preferências">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <ChartCard title="Informações Pessoais" subtitle="Atualize seus dados">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <User className="w-16 h-16 text-primary-foreground" />
                </div>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>

              {/* Form */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nome Completo</label>
                  <Input defaultValue="João Silva" className="mt-1 bg-secondary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Nome Artístico</label>
                  <Input defaultValue="Banda Premium" className="mt-1 bg-secondary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input defaultValue="joao@bandapremium.com" className="mt-1 bg-secondary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Telefone</label>
                  <Input defaultValue="(11) 99999-0000" className="mt-1 bg-secondary" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Bio</label>
                  <textarea
                    defaultValue="Banda de música ao vivo para eventos corporativos e casamentos."
                    className="w-full mt-1 p-3 rounded-lg bg-secondary border border-border text-foreground h-24"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="gradient">
                <Save className="w-4 h-4 mr-2" />
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
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Tema Escuro</p>
                    <p className="text-sm text-muted-foreground">Usar tema escuro na interface</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

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

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <ChartCard title="Preferências de Notificação">
            <div className="space-y-4">
              {[
                { title: "Novos leads", description: "Receber notificação quando um novo lead for adicionado", enabled: true },
                { title: "Shows confirmados", description: "Notificar quando um show for confirmado", enabled: true },
                { title: "Pagamentos recebidos", description: "Alertar sobre pagamentos recebidos", enabled: true },
                { title: "Tarefas vencendo", description: "Lembrete de tarefas próximas do prazo", enabled: true },
                { title: "Resumo semanal", description: "Receber resumo semanal por email", enabled: false },
                { title: "Marketing", description: "Novidades e promoções", enabled: false },
              ].map((notification, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={notification.enabled} />
                </div>
              ))}
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
