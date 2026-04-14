import { useEffect, useMemo, useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Mic2,
  TrendingDown,
  GitCompareArrows,
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
import { useShows } from "@/contexts/ShowsContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  buildHistoricoYearSummary,
  formatCurrencyBR,
  getHistoricoAvailableYears,
  isCompletedShowStatus,
} from "@/lib/historico";
import { HistoricoMonthlyTable } from "@/components/historico/HistoricoMonthlyTable";

export default function Historico() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { transactions, loading: loadingTransactions, refetch: refetchTransactions } = useTransactions({ fullHistory: true });
  const { shows, loading: loadingShows } = useShows();
  const availableYears = useMemo(() => getHistoricoAvailableYears(transactions, shows), [transactions, shows]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [compareMode, setCompareMode] = useState(false);
  const [repairDone, setRepairDone] = useState(false);

  const hasPreviousYear = availableYears.includes(selectedYear - 1);

  useEffect(() => {
    if (loadingTransactions || loadingShows || availableYears.length === 0) return;

    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, loadingShows, loadingTransactions, selectedYear]);

  // Ensure completed shows have financial transactions
  useEffect(() => {
    if (repairDone || !user || loadingShows || loadingTransactions || shows.length === 0) return;
    setRepairDone(true);

    (async () => {
      try {
        const completedShows = shows.filter((s) => isCompletedShowStatus(s.status) && s.cachet > 0);
        if (completedShows.length === 0) return;

        const showIds = completedShows.map((s) => s.id);
        const transactionShowIds = new Set(
          transactions.filter((t) => t.show_id).map((t) => t.show_id as string),
        );

        const missingShows = completedShows.filter((s) => !transactionShowIds.has(s.id));
        if (missingShows.length === 0) return;

        console.log(`Historico: creating transactions for ${missingShows.length} completed shows without financial data`);

        const newTransactions = missingShows.map((show) => ({
          user_id: user.id,
          type: "income",
          category: "Show",
          amount: show.cachet,
          description: `Cachê: ${show.title}`,
          date: show.date,
          show_id: show.id,
          is_advance_payment: false,
        })) as Array<{
          user_id: string;
          type: string;
          category: string;
          amount: number;
          description: string;
          date: string;
          show_id: string;
          is_advance_payment: boolean;
        }>;

        // Also fetch musician fees and expenses for these shows
        const batchSize = 50;
        for (let i = 0; i < missingShows.length; i += batchSize) {
          const batch = missingShows.slice(i, i + batchSize);
          const batchIds = batch.map((s) => s.id);

          const [musiciansResult, expensesResult] = await Promise.all([
            supabase.from("show_musicians").select("show_id, fee, musicians(name)").in("show_id", batchIds),
            supabase.from("show_expenses").select("show_id, category, amount, description").in("show_id", batchIds),
          ]);

          (musiciansResult.data || []).forEach((m: any) => {
            if (m.fee > 0) {
              newTransactions.push({
                user_id: user.id,
                type: "expense",
                category: "Músicos",
                amount: m.fee,
                description: `${m.musicians?.name || "Músico"} - ${batch.find((s) => s.id === m.show_id)?.title || "Show"}`,
                date: batch.find((s) => s.id === m.show_id)?.date || "",
                show_id: m.show_id,
                is_advance_payment: false,
              });
            }
          });

          (expensesResult.data || []).forEach((e: any) => {
            if (e.amount > 0) {
              newTransactions.push({
                user_id: user.id,
                type: "expense",
                category: e.category,
                amount: e.amount,
                description: `${e.description || e.category} - ${batch.find((s) => s.id === e.show_id)?.title || "Show"}`,
                date: batch.find((s) => s.id === e.show_id)?.date || "",
                show_id: e.show_id,
                is_advance_payment: false,
              });
            }
          });
        }

        // Insert in batches
        for (let i = 0; i < newTransactions.length; i += 200) {
          const batch = newTransactions.slice(i, i + 200);
          const { error } = await supabase.from("transactions").insert(batch);
          if (error) {
            console.error("Historico repair insert error:", error);
            return;
          }
        }

        console.log(`Historico: created ${newTransactions.length} transactions for ${missingShows.length} shows`);
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      } catch (err) {
        console.error("Historico repair error:", err);
      }
    })();
  }, [user, loadingShows, loadingTransactions, shows, transactions, repairDone, queryClient]);

  const { monthlyHistory, totalDespesa, totalLucro, totalReceita, totalReceitaPrevista, totalShows } = useMemo(
    () => buildHistoricoYearSummary(transactions, shows, selectedYear),
    [selectedYear, shows, transactions],
  );

  const previousYearSummary = useMemo(
    () => (hasPreviousYear && compareMode ? buildHistoricoYearSummary(transactions, shows, selectedYear - 1) : null),
    [hasPreviousYear, compareMode, selectedYear, shows, transactions],
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
        {hasPreviousYear && (
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              compareMode
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            <GitCompareArrows className="h-4 w-4" />
            Comparar com {selectedYear - 1}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
              <DollarSign className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrencyBR(totalReceitaPrevista)}</p>
              <p className="text-xs text-muted-foreground">Previsto de {selectedYear}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-muted-foreground" />
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
            <ResponsiveContainer key={selectedYear} width="100%" height={isMobile ? 280 : 350}>
              <ComposedChart data={monthlyHistory} margin={isMobile ? { left: -15, right: 5, top: 5, bottom: 5 } : undefined}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="#000" 
                  tick={{ fill: "#000", fontWeight: 600 }} 
                  fontSize={isMobile ? 9 : 13} 
                  interval={isMobile ? 1 : 0}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 50 : 30}
                />
                <YAxis 
                  stroke="#000" 
                  tick={{ fill: "#000", fontWeight: 600 }} 
                  fontSize={isMobile ? 9 : 13}
                  tickFormatter={isMobile ? (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v) : undefined}
                  width={isMobile ? 35 : 60}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: isMobile ? 12 : 14,
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      receita: "Receita",
                      receitaPrevista: "Previsto",
                      despesa: "Despesa",
                      lucro: "Lucro",
                    };
                    return [formatCurrencyBR(value), labels[name] || name];
                  }}
                />
                <Legend 
                  iconSize={isMobile ? 8 : 14}
                  wrapperStyle={isMobile ? { fontSize: 10 } : undefined}
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      receita: "Receita",
                      receitaPrevista: "Previsto",
                      despesa: "Despesa",
                      lucro: "Lucro",
                    };
                    return labels[value] || value;
                  }}
                />
                <Bar dataKey="receita" stackId="revenue" fill="#22c55e" radius={[0, 0, 0, 0]} name="receita" animationDuration={1200} animationBegin={0} />
                <Bar dataKey="receitaPrevista" stackId="revenue" fill="#eab308" radius={[4, 4, 0, 0]} name="receitaPrevista" animationDuration={1200} animationBegin={200} />
                <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} name="despesa" animationDuration={1200} animationBegin={400} />
                <Line
                  type="monotone"
                  dataKey="lucro"
                  stroke="#3b82f6"
                  strokeWidth={isMobile ? 2 : 3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: isMobile ? 3 : 5 }}
                  activeDot={{ r: isMobile ? 5 : 7, strokeWidth: 2 }}
                  name="lucro"
                  animationDuration={1500}
                  animationBegin={600}
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
