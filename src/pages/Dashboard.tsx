import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { 
  Users, TrendingUp, DollarSign, Target, Calendar, 
  CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const revenueData = [
    { name: 'Jan', value: 12000 },
    { name: 'Fev', value: 15000 },
    { name: 'Mar', value: 18000 },
    { name: 'Abr', value: 22000 },
    { name: 'Mai', value: 19000 },
    { name: 'Jun', value: 24451 },
  ];

  const leadsData = [
    { name: 'Seg', value: 12 },
    { name: 'Ter', value: 19 },
    { name: 'Qua', value: 15 },
    { name: 'Qui', value: 22 },
    { name: 'Sex', value: 18 },
    { name: 'Sáb', value: 25 },
    { name: 'Dom', value: 20 },
  ];

  const activities = [
    { icon: CheckCircle2, title: "Show confirmado", description: "Casamento Silva - 15/01", time: "Há 2 horas", color: "text-green-500" },
    { icon: DollarSign, title: "Pagamento recebido", description: "R$ 3.500 - Show Corporativo", time: "Há 5 horas", color: "text-cyan-500" },
    { icon: Users, title: "Novo lead", description: "Maria Santos - Aniversário", time: "Há 8 horas", color: "text-purple-500" },
    { icon: AlertCircle, title: "Contrato pendente", description: "Aguardando assinatura - João", time: "Há 1 dia", color: "text-orange-500" },
    { icon: Calendar, title: "Show agendado", description: "Festa Empresa ABC - 20/01", time: "Há 2 dias", color: "text-blue-500" },
  ];

  const upcomingShows = [
    { date: "15 Jan", title: "Casamento Silva", location: "Buffet Aurora", value: "R$ 5.000" },
    { date: "20 Jan", title: "Festa Corporativa", location: "Hotel Grand", value: "R$ 8.000" },
    { date: "28 Jan", title: "Aniversário 50 anos", location: "Espaço Verde", value: "R$ 4.500" },
  ];

  return (
    <Layout title="Dashboard" subtitle="Visão geral da sua carreira">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Olá, Artista! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Aqui está o resumo da sua carreira este mês
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Atualizado há 5 minutos
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Leads no CRM"
            value="48"
            trend={{ value: 12, isPositive: true }}
            icon={Users}
            gradient="purple"
          />
          <StatCard
            title="Vendas Fechadas"
            value="12"
            trend={{ value: 8, isPositive: true }}
            icon={TrendingUp}
            gradient="success"
          />
          <StatCard
            title="Receita Mensal"
            value="R$ 24.451"
            trend={{ value: 15, isPositive: true }}
            icon={DollarSign}
            gradient="primary"
          />
          <StatCard
            title="Taxa de Conversão"
            value="32%"
            trend={{ value: 5, isPositive: true }}
            icon={Target}
            gradient="warning"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Receita Mensal" subtitle="Últimos 6 meses">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Leads por Dia" subtitle="Última semana">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={leadsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Goals & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Metas do Mês</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <ProgressRing progress={75} size={60} />
                <div>
                  <p className="font-medium text-foreground">Receita</p>
                  <p className="text-sm text-muted-foreground">R$ 24.451 / R$ 30.000</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ProgressRing progress={60} size={60} />
                <div>
                  <p className="font-medium text-foreground">Shows</p>
                  <p className="text-sm text-muted-foreground">12 / 20 shows</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ProgressRing progress={85} size={60} />
                <div>
                  <p className="font-medium text-foreground">Leads</p>
                  <p className="text-sm text-muted-foreground">48 / 50 leads</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Shows */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Shows</h3>
            <div className="space-y-4">
              {upcomingShows.map((show, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                  <div className="text-center min-w-[50px]">
                    <p className="text-xs text-muted-foreground">{show.date.split(' ')[1]}</p>
                    <p className="text-xl font-bold text-primary">{show.date.split(' ')[0]}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{show.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{show.location}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-500">{show.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Atividade Recente</h3>
            <div className="space-y-1">
              {activities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Resumo Financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-xl bg-green-500/10">
              <p className="text-sm text-muted-foreground mb-1">Receitas</p>
              <p className="text-2xl font-bold text-green-500">R$ 28.500</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-red-500/10">
              <p className="text-sm text-muted-foreground mb-1">Despesas</p>
              <p className="text-2xl font-bold text-red-500">R$ 4.049</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-cyan-500/10">
              <p className="text-sm text-muted-foreground mb-1">Lucro Líquido</p>
              <p className="text-2xl font-bold text-cyan-500">R$ 24.451</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
