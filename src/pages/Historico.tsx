import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Mic2,
  TrendingDown,
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
import { useTransactions } from "@/hooks/useTransactions";
import { useShowsData } from "@/hooks/useShows";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  buildHistoricoYearSummary,
  formatCurrencyBR,
  getHistoricoAvailableYears,
} from "@/lib/historico";
import { HistoricoMonthlyTable } from "@/components/historico/HistoricoMonthlyTable";

export default function Historico() {
  const { transactions, loading: loadingTransactions } = useTransactions({ fullHistory: true });
  const { shows, loading: loadingShows } = useShowsData();
  const availableYears = useMemo(() => getHistoricoAvailableYears(transactions, shows), [transactions, shows]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (loadingTransactions || loadingShows || availableYears.length === 0) return;

    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, loadingShows, loadingTransactions, selectedYear]);

  const { monthlyHistory, totalDespesa, totalLucro, totalReceita, totalShows } = useMemo(
    () => buildHistoricoYearSummary(transactions, shows, selectedYear),
    [selectedYear, shows, transactions],
  );

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
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">Ano</p>
          <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-40 bg-secondary">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrencyBR(totalReceita)}</p>
              <p className="text-xs text-muted-foreground">Receita de {selectedYear}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrencyBR(totalDespesa)}</p>
              <p className="text-xs text-muted-foreground">Despesas de {selectedYear}</p>
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
              <p className="text-xs text-muted-foreground">Shows realizados em {selectedYear}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrencyBR(totalLucro)}</p>
              <p className="text-xs text-muted-foreground">Lucro de {selectedYear}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <ChartCard title="Evolução Mensal" subtitle={`Receita, despesa e lucro reais de ${selectedYear}`}>
          {monthlyHistory.length === 0 ? (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              Nenhum dado financeiro para exibir no ano selecionado
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
                    formatCurrencyBR(value),
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

      <HistoricoMonthlyTable monthlyHistory={monthlyHistory} />
    </Layout>
  );
}
