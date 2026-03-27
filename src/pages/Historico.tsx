import { useState, Fragment } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Mic2,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
import { format, startOfMonth, endOfMonth, isWithinInterval, eachMonthOfInterval, subMonths } from "date-fns";
import { parseLocalDate } from "@/lib/utils";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Historico() {
  const { transactions, loading: loadingTransactions } = useTransactions();
  const { shows, loading: loadingShows } = useShowsData();

  const [startDate, setStartDate] = useState(() => format(subMonths(new Date(), 12), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const fromDate = parseLocalDate(startDate);
  const toDate = parseLocalDate(endDate);

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = parseLocalDate(t.date);
    return isWithinInterval(transactionDate, { start: fromDate, end: toDate });
  });

  const filteredShows = shows.filter(s => {
    const showDate = parseLocalDate(s.date);
    return isWithinInterval(showDate, { start: fromDate, end: toDate });
  });

  const totalReceita = filteredTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalDespesa = filteredTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const totalLucro = totalReceita - totalDespesa;
  const totalShows = filteredShows.filter(s => s.status === "completed").length;

  // Generate monthly history from transactions
  const generateMonthlyHistory = () => {
    const months = eachMonthOfInterval({ start: fromDate, end: toDate });

    return months.map(monthDate => {
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthName = format(monthDate, "MMM/yy", { locale: ptBR });

      const monthTransactions = transactions.filter(t => {
        const transactionDate = parseLocalDate(t.date);
        return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
      });

      const monthShows = shows.filter(s => {
        const showDate = parseLocalDate(s.date);
        return isWithinInterval(showDate, { start: monthStart, end: monthEnd }) && s.status === "completed";
      });

      const incomeTransactions = monthTransactions.filter(t => t.type === "income");
      const expenseTransactions = monthTransactions.filter(t => t.type === "expense");
      const receita = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const despesa = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

      return {
        month: monthName,
        receita,
        despesa,
        shows: monthShows.length,
        lucro: receita - despesa,
        incomeTransactions,
        expenseTransactions,
      };
    });
  };

  const monthlyHistory = generateMonthlyHistory();

  const loading = loadingTransactions || loadingShows;

  if (loading) {
    return (
      <Layout title="Histórico Completo" subtitle="Acompanhe sua evolução ao longo do ano">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Histórico Completo" subtitle="Acompanhe toda a evolução da sua carreira">
      {/* Date Range Filter */}
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Início</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="pl-9 w-44 bg-secondary"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-muted-foreground">Fim</Label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="pl-9 w-44 bg-secondary"
            />
          </div>
        </div>
      </div>

      {/* Year Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {totalReceita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                R$ {totalDespesa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                R$ {totalLucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">Lucro Acumulado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart - Evolução Mensal com Receita, Despesa e Lucro */}
      <div className="mb-6">
        <ChartCard title="Evolução Mensal" subtitle="Receita, Despesa e Lucro - últimos 12 meses">
          {monthlyHistory.length === 0 ? (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              Nenhum dado para exibir no período selecionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={monthlyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="#000" tick={{ fill: "#000", fontWeight: 600 }} fontSize={13} />
                <YAxis stroke="#000" tick={{ fill: "#000", fontWeight: 600 }} fontSize={13} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                    name === "receita" ? "Receita" : name === "despesa" ? "Despesa" : "Lucro"
                  ]}
                />
                <Legend 
                  formatter={(value) => value === "receita" ? "Receita" : value === "despesa" ? "Despesa" : "Lucro"}
                />
                <Bar dataKey="receita" fill="#22c55e" radius={[4, 4, 0, 0]} name="receita" />
                <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} name="despesa" />
                <Line
                  type="monotone"
                  dataKey="lucro"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                  name="lucro"
                />
              </ComposedChart>
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
              {monthlyHistory.map((month) => {
                const isExpanded = expandedMonth === month.month;
                return (
                  <Fragment key={month.month}>
                    <TableRow 
                      className="cursor-pointer hover:bg-secondary/80 transition-colors"
                      onClick={() => setExpandedMonth(isExpanded ? null : month.month)}
                    >
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                          {month.month}
                        </div>
                      </TableCell>
                      <TableCell className="text-success">
                        R$ {month.receita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-destructive">
                        R$ {month.despesa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{month.shows} shows</Badge>
                      </TableCell>
                      <TableCell className={`font-semibold ${month.lucro >= 0 ? "text-primary" : "text-destructive"}`}>
                        R$ {month.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={5} className="p-0 border-0">
                          <div className="bg-secondary/30 px-6 py-4 space-y-4">
                            {/* Receitas */}
                            <div>
                              <h4 className="text-xs font-bold text-success flex items-center gap-1.5 mb-2">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                Receitas ({month.incomeTransactions.length})
                              </h4>
                              {month.incomeTransactions.length === 0 ? (
                                <p className="text-xs text-muted-foreground pl-5">Nenhuma receita</p>
                              ) : (
                                <div className="space-y-1 pl-5">
                                  {month.incomeTransactions.map(t => (
                                    <div key={t.id} className="flex justify-between items-center py-1 text-sm">
                                      <span className="text-foreground">{t.description || t.category}</span>
                                      <span className="text-success font-medium">+ R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Despesas */}
                            <div>
                              <h4 className="text-xs font-bold text-destructive flex items-center gap-1.5 mb-2">
                                <ArrowDownRight className="w-3.5 h-3.5" />
                                Despesas ({month.expenseTransactions.length})
                              </h4>
                              {month.expenseTransactions.length === 0 ? (
                                <p className="text-xs text-muted-foreground pl-5">Nenhuma despesa</p>
                              ) : (
                                <div className="space-y-1 pl-5">
                                  {month.expenseTransactions.map(t => (
                                    <div key={t.id} className="flex justify-between items-center py-1 text-sm">
                                      <span className="text-foreground">{t.description || t.category}</span>
                                      <span className="text-destructive font-medium">- R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Lucro */}
                            <div className={`flex justify-between items-center p-3 rounded-lg ${month.lucro >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                              <span className="text-sm font-bold text-foreground">Lucro do Mês</span>
                              <span className={`text-sm font-bold ${month.lucro >= 0 ? 'text-success' : 'text-destructive'}`}>
                                R$ {month.lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        )}
      </ChartCard>
    </Layout>
  );
}
