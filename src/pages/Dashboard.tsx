import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { 
  Users, TrendingUp, DollarSign, Target, Clock
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const revenueData = [
    { name: 'Jan', value: 0 },
    { name: 'Fev', value: 0 },
    { name: 'Mar', value: 0 },
    { name: 'Abr', value: 0 },
    { name: 'Mai', value: 0 },
    { name: 'Jun', value: 0 },
  ];

  const leadsData = [
    { name: 'Seg', value: 0 },
    { name: 'Ter', value: 0 },
    { name: 'Qua', value: 0 },
    { name: 'Qui', value: 0 },
    { name: 'Sex', value: 0 },
    { name: 'Sáb', value: 0 },
    { name: 'Dom', value: 0 },
  ];

  const upcomingShows: { date: string; title: string; location: string; value: string }[] = [];

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
            value="0"
            icon={Users}
            gradient="purple"
          />
          <StatCard
            title="Vendas Fechadas"
            value="0"
            icon={TrendingUp}
            gradient="success"
          />
          <StatCard
            title="Receita Mensal"
            value="R$ 0"
            icon={DollarSign}
            gradient="primary"
          />
          <StatCard
            title="Taxa de Conversão"
            value="0%"
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

        {/* Goals & Upcoming Shows */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Goals */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Metas do Mês</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <ProgressRing progress={0} size={70} />
                <div>
                  <p className="font-medium text-foreground">Receita</p>
                  <p className="text-sm text-muted-foreground">R$ 0 / R$ 0</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <ProgressRing progress={0} size={70} />
                <div>
                  <p className="font-medium text-foreground">Shows</p>
                  <p className="text-sm text-muted-foreground">0 / 0 shows</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <ProgressRing progress={0} size={70} />
                <div>
                  <p className="font-medium text-foreground">Leads</p>
                  <p className="text-sm text-muted-foreground">0 / 0 leads</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Shows */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Próximos Shows</h3>
            <div className="space-y-4">
              {upcomingShows.length > 0 ? (
                upcomingShows.map((show, index) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum show agendado
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
