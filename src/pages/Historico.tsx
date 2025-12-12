import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Mic2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransactions } from "@/hooks/useTransactions";
import { useShowsData } from "@/hooks/useShows";

export default function Historico() {
  const { transactions, loading: loadingTransactions, getTotalIncome, getTotalExpense } = useTransactions();
  const { shows, loading: loadingShows } = useShowsData();

  const totalReceita = getTotalIncome();
  const totalDespesa = getTotalExpense();
  const totalLucro = totalReceita - totalDespesa;
  const totalShows = shows.filter(s => s.status === "completed").length;

  // Group by month
  const monthlyHistory: { month: string; receita: number; despesa: number; shows: number; lucro: number }[] = [];

  const loading = loadingTransactions || loadingShows;

  if (loading) {
    return (
      <Layout title="Histórico Mensal" subtitle="Acompanhe sua evolução ao longo do ano">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Histórico Mensal" subtitle="Acompanhe sua evolução ao longo do ano">
      {/* Year Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {(totalReceita / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-muted-foreground">Receita Total</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {(totalDespesa / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-muted-foreground">Despesa Total</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalShows}</p>
              <p className="text-xs text-muted-foreground">Shows Realizados</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {(totalLucro / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-muted-foreground">Lucro Acumulado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Evolução Mensal" subtitle="Receita vs Despesa">
          {monthlyHistory.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum dado para exibir
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Bar dataKey="receita" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Lucro Mensal" subtitle="Evolução do lucro líquido">
          {monthlyHistory.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum dado para exibir
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="lucro"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Monthly Table */}
      <ChartCard title="Detalhamento Mensal" subtitle="Resumo mês a mês">
        {monthlyHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum histórico disponível</p>
            <p className="text-sm text-muted-foreground">Os dados aparecerão aqui conforme você registrar transações</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Despesa</TableHead>
                <TableHead>Shows</TableHead>
                <TableHead>Lucro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyHistory.map((month) => (
                <TableRow key={month.month}>
                  <TableCell className="font-medium text-foreground">{month.month}</TableCell>
                  <TableCell className="text-success">
                    R$ {month.receita.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-destructive">
                    R$ {month.despesa.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{month.shows} shows</Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-primary">
                    R$ {month.lucro.toLocaleString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ChartCard>
    </Layout>
  );
}
