import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { Button } from "@/components/ui/button";
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  Star,
  Mic2,
  FileCheck,
  ArrowRight,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const revenueData = [
  { month: "Jan", receita: 12000, despesa: 8000 },
  { month: "Fev", receita: 15000, despesa: 9000 },
  { month: "Mar", receita: 18000, despesa: 10000 },
  { month: "Abr", receita: 22000, despesa: 11000 },
  { month: "Mai", receita: 28000, despesa: 12000 },
  { month: "Jun", receita: 32000, despesa: 14000 },
];

const funnelData = [
  { stage: "Novos Leads", value: 45, fill: "hsl(var(--primary))" },
  { stage: "Contato", value: 32, fill: "hsl(var(--accent))" },
  { stage: "Proposta", value: 18, fill: "hsl(var(--success))" },
  { stage: "Negociação", value: 12, fill: "hsl(var(--warning))" },
  { stage: "Fechado", value: 8, fill: "hsl(142, 71%, 45%)" },
];

const upcomingShows = [
  { name: "Casamento Silva", date: "15 Dez", venue: "Espaço Verde", value: "R$ 8.500" },
  { name: "Festa Corporativa", date: "18 Dez", venue: "Hotel Marriott", value: "R$ 12.000" },
  { name: "Aniversário 50 anos", date: "22 Dez", venue: "Clube Municipal", value: "R$ 6.800" },
];

const Dashboard = () => {
  return (
    <Layout title="Dashboard" subtitle="Bem-vindo de volta! Aqui está o resumo do seu negócio.">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Leads no CRM"
          value="127"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          gradient="primary"
        />
        <StatCard
          title="Vendas Fechadas"
          value="23"
          icon={CheckCircle2}
          trend={{ value: 8, isPositive: true }}
          gradient="success"
        />
        <StatCard
          title="Receita Mensal"
          value="R$ 32.450"
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
          gradient="blue"
        />
        <StatCard
          title="Taxa de Conversão"
          value="18.1%"
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
          gradient="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard
          title="Receita vs Despesas"
          subtitle="Últimos 6 meses"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="receita"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorReceita)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="despesa"
                stroke="hsl(var(--destructive))"
                fillOpacity={1}
                fill="url(#colorDespesa)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Meta do Mês" subtitle="Shows realizados">
          <div className="flex flex-col items-center justify-center py-4">
            <ProgressRing progress={72} size={140} />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">18 de 25 shows</p>
              <p className="text-xs text-success mt-1">Faltam 7 para bater a meta!</p>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Funnel */}
        <ChartCard title="Funil de Vendas" subtitle="Pipeline atual">
          <div className="space-y-3">
            {funnelData.map((item, index) => (
              <div key={item.stage} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="flex-1 text-sm text-muted-foreground">{item.stage}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Upcoming Shows */}
        <ChartCard
          title="Próximos Shows"
          subtitle="Agenda da semana"
          action={
            <Button variant="ghost" size="sm" className="text-primary">
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          }
        >
          <div className="space-y-3">
            {upcomingShows.map((show, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mic2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{show.name}</p>
                  <p className="text-xs text-muted-foreground">{show.venue}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-success">{show.value}</p>
                  <p className="text-xs text-muted-foreground">{show.date}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Recent Activity */}
        <ChartCard title="Atividades Recentes" subtitle="Últimas atualizações">
          <div className="space-y-1">
            <ActivityItem
              icon={CheckCircle2}
              title="Contrato assinado"
              description="Casamento Silva - R$ 8.500"
              time="2h atrás"
              variant="success"
            />
            <ActivityItem
              icon={Users}
              title="Novo lead adicionado"
              description="Maria Santos - Formatura"
              time="4h atrás"
            />
            <ActivityItem
              icon={DollarSign}
              title="Pagamento recebido"
              description="Evento Corporativo XYZ"
              time="6h atrás"
              variant="success"
            />
            <ActivityItem
              icon={Clock}
              title="Tarefa pendente"
              description="Enviar orçamento - Festa 15 anos"
              time="1 dia"
              variant="warning"
            />
          </div>
        </ChartCard>
      </div>

      {/* Financial Summary & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Summary */}
        <ChartCard title="Resumo Financeiro" subtitle="Dezembro 2024">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-success/10">
              <p className="text-2xl font-bold text-success">R$ 32.450</p>
              <p className="text-xs text-muted-foreground mt-1">Receitas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-destructive/10">
              <p className="text-2xl font-bold text-destructive">R$ 14.200</p>
              <p className="text-xs text-muted-foreground mt-1">Despesas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-primary/10">
              <p className="text-2xl font-bold text-primary">R$ 18.250</p>
              <p className="text-xs text-muted-foreground mt-1">Lucro Líquido</p>
            </div>
          </div>
        </ChartCard>

        {/* Achievements */}
        <ChartCard title="Conquistas Recentes" subtitle="Continue assim!">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
              <Trophy className="w-8 h-8 text-warning" />
              <div>
                <p className="text-sm font-medium text-foreground">10 Vendas</p>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
              <Star className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">5 Estrelas</p>
                <p className="text-xs text-muted-foreground">Avaliação média</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10">
              <Target className="w-8 h-8 text-success" />
              <div>
                <p className="text-sm font-medium text-foreground">Meta 70%</p>
                <p className="text-xs text-muted-foreground">Concluída</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
              <Sparkles className="w-8 h-8 text-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">Top 10%</p>
                <p className="text-xs text-muted-foreground">Artistas</p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </Layout>
  );
};

export default Dashboard;
