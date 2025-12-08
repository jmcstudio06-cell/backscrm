import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Mic2,
  ArrowUp,
  ArrowDown,
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

const monthlyHistory = [
  { month: "Jan", receita: 28000, despesa: 12000, shows: 8, lucro: 16000 },
  { month: "Fev", receita: 32000, despesa: 14000, shows: 10, lucro: 18000 },
  { month: "Mar", receita: 35000, despesa: 13000, shows: 12, lucro: 22000 },
  { month: "Abr", receita: 30000, despesa: 11000, shows: 9, lucro: 19000 },
  { month: "Mai", receita: 38000, despesa: 15000, shows: 14, lucro: 23000 },
  { month: "Jun", receita: 42000, despesa: 16000, shows: 15, lucro: 26000 },
  { month: "Jul", receita: 40000, despesa: 17000, shows: 13, lucro: 23000 },
  { month: "Ago", receita: 45000, despesa: 18000, shows: 16, lucro: 27000 },
  { month: "Set", receita: 48000, despesa: 19000, shows: 18, lucro: 29000 },
  { month: "Out", receita: 52000, despesa: 20000, shows: 19, lucro: 32000 },
  { month: "Nov", receita: 55000, despesa: 21000, shows: 20, lucro: 34000 },
  { month: "Dez", receita: 60000, despesa: 22000, shows: 22, lucro: 38000 },
];

export default function Historico() {
  const totalReceita = monthlyHistory.reduce((acc, m) => acc + m.receita, 0);
  const totalDespesa = monthlyHistory.reduce((acc, m) => acc + m.despesa, 0);
  const totalShows = monthlyHistory.reduce((acc, m) => acc + m.shows, 0);
  const totalLucro = monthlyHistory.reduce((acc, m) => acc + m.lucro, 0);

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
              <p className="text-xs text-muted-foreground">Receita Total 2024</p>
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
              <p className="text-xs text-muted-foreground">Despesa Total 2024</p>
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyHistory}>
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
              <Bar dataKey="receita" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Lucro Mensal" subtitle="Evolução do lucro líquido">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyHistory}>
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
              <Line
                type="monotone"
                dataKey="lucro"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Monthly Table */}
      <ChartCard title="Detalhamento Mensal" subtitle="Resumo mês a mês">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês</TableHead>
              <TableHead>Receita</TableHead>
              <TableHead>Despesa</TableHead>
              <TableHead>Shows</TableHead>
              <TableHead>Lucro</TableHead>
              <TableHead>Variação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyHistory.map((month, index) => {
              const prevLucro = index > 0 ? monthlyHistory[index - 1].lucro : month.lucro;
              const variation = ((month.lucro - prevLucro) / prevLucro) * 100;

              return (
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
                  <TableCell>
                    {index === 0 ? (
                      <span className="text-muted-foreground">-</span>
                    ) : (
                      <div
                        className={`flex items-center gap-1 ${
                          variation >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        {variation >= 0 ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(variation).toFixed(1)}%</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ChartCard>
    </Layout>
  );
}
