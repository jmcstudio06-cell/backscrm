import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DollarSign,
  TrendingUp,
  Mic2,
  CalendarIcon,
  Filter,
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
import { DateRange } from "react-day-picker";

export default function Historico() {
  const { transactions, loading: loadingTransactions } = useTransactions();
  const { shows, loading: loadingShows } = useShowsData();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 11),
    to: new Date(),
  });

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const transactionDate = parseLocalDate(t.date);
    return isWithinInterval(transactionDate, { start: dateRange.from, end: dateRange.to });
  });

  const filteredShows = shows.filter(s => {
    if (!dateRange?.from || !dateRange?.to) return true;
    const showDate = parseLocalDate(s.date);
    return isWithinInterval(showDate, { start: dateRange.from, end: dateRange.to });
  });

  const totalReceita = filteredTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalDespesa = filteredTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const totalLucro = totalReceita - totalDespesa;
  const totalShows = filteredShows.filter(s => s.status === "completed").length;

  // Generate monthly history from transactions
  const generateMonthlyHistory = () => {
    if (!dateRange?.from || !dateRange?.to) return [];

    const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });

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

      const receita = monthTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
      const despesa = monthTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

      return {
        month: monthName,
        receita,
        despesa,
        shows: monthShows.length,
        lucro: receita - despesa,
      };
    });
  };

  const monthlyHistory = generateMonthlyHistory();

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
      {/* Date Range Filter */}
      <div className="flex justify-end mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              <CalendarIcon className="w-4 h-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                "Selecionar período"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
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
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                <Bar dataKey="receita" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="receita" />
                <Bar dataKey="despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="despesa" />
                <Line
                  type="monotone"
                  dataKey="lucro"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
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
              {monthlyHistory.map((month) => (
                <TableRow key={month.month}>
                  <TableCell className="font-medium text-foreground">{month.month}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        )}
      </ChartCard>
    </Layout>
  );
}
