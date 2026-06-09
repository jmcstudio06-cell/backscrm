import { useEffect, useMemo, useState, useCallback } from "react";
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
import { useShows } from "@/contexts/ShowsContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  buildHistoricoYearSummary,
  formatCurrencyBR,
  getHistoricoAvailableYears,
} from "@/lib/historico";
import { HistoricoMonthlyTable } from "@/components/historico/HistoricoMonthlyTable";
import { ShowCostBreakdownDialog } from "@/components/historico/ShowCostBreakdownDialog";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import { isCompletedShowStatus } from "@/lib/showStatus";

function ComparisonBadge({ current, previous, invertColors = false, isCount = false }: { current: number; previous: number; invertColors?: boolean; isCount?: boolean }) {
  if (previous === 0 && current === 0) return null;
  const diff = current - previous;
  const pct = previous !== 0 ? Math.round((diff / Math.abs(previous)) * 100) : (current > 0 ? 100 : 0);
  const isPositive = invertColors ? diff <= 0 : diff >= 0;
  return (
    <span className={cn("mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold", isPositive ? "text-success" : "text-destructive")}>
      {diff >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {pct >= 0 ? "+" : ""}{pct}% vs ano anterior
    </span>
  );
}

export default function Historico() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const { transactions, loading: loadingTransactions, refetch: refetchTransactions } = useTransactions({ fullHistory: true });
  const { shows, loading: loadingShows } = useShows();
  const availableYears = useMemo(() => getHistoricoAvailableYears(transactions, shows), [transactions, shows]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [compareYear, setCompareYear] = useState<number | null>(null);
  const [repairDone, setRepairDone] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [showLucro, setShowLucro] = useState(true);
  const [showMargem, setShowMargem] = useState(false);

  const comparableYears = availableYears.filter((y) => y !== selectedYear);

  useEffect(() => {
    if (loadingTransactions || loadingShows || availableYears.length === 0) return;

    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
    // Reset compare if selected year changed and compare is now same
    if (compareYear === selectedYear) {
      setCompareYear(null);
    }
  }, [availableYears, loadingShows, loadingTransactions, selectedYear, compareYear]);

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

  const compareYearSummary = useMemo(
    () => (compareYear ? buildHistoricoYearSummary(transactions, shows, compareYear) : null),
    [compareYear, selectedYear, shows, transactions],
  );

  // Merge chart data for comparison + compute margem (%)
  const mergedChartData = useMemo(() => {
    const withMargem = monthlyHistory.map((m) => ({
      ...m,
      margem: m.receita > 0 ? Number(((m.lucro / m.receita) * 100).toFixed(1)) : 0,
    }));
    if (!compareYearSummary) return withMargem;
    return withMargem.map((m, i) => {
      const prev = compareYearSummary.monthlyHistory[i];
      const margemPrev = prev && prev.receita > 0 ? Number(((prev.lucro / prev.receita) * 100).toFixed(1)) : 0;
      return {
        ...m,
        receitaPrev: prev?.receita ?? 0,
        receitaPrevistaPrev: prev?.receitaPrevista ?? 0,
        despesaPrev: prev?.despesa ?? 0,
        lucroPrev: prev?.lucro ?? 0,
        margemPrev,
      };
    });
  }, [monthlyHistory, compareYearSummary]);


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
        {comparableYears.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground">Comparar com</p>
            <Select value={compareYear ? String(compareYear) : "none"} onValueChange={(v) => setCompareYear(v === "none" ? null : Number(v))}>
              <SelectTrigger className="w-40 bg-secondary">
                <SelectValue placeholder="Nenhum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {comparableYears.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="ml-auto">
          <Button onClick={() => setBreakdownOpen(true)} variant="outline" className="gap-2">
            <Calculator className="w-4 h-4" />
            Ver Detalhamento de Custos
          </Button>
        </div>
      </div>

      <ShowCostBreakdownDialog
        open={breakdownOpen}
        onOpenChange={setBreakdownOpen}
        monthlyHistory={monthlyHistory}
        selectedYear={selectedYear}
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrencyBR(totalReceita)}</p>
              <p className="text-xs text-muted-foreground">Receita de {selectedYear}</p>
              {compareYearSummary && (
                <ComparisonBadge current={totalReceita} previous={compareYearSummary.totalReceita} />
              )}
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
              {compareYearSummary && (
                <ComparisonBadge current={totalDespesa} previous={compareYearSummary.totalDespesa} invertColors />
              )}
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
              {compareYearSummary && (
                <ComparisonBadge current={totalShows} previous={compareYearSummary.totalShows} isCount />
              )}
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
              {compareYearSummary && (
                <ComparisonBadge current={totalLucro} previous={compareYearSummary.totalLucro} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={showLucro ? "default" : "outline"}
            onClick={() => setShowLucro((v) => !v)}
            className="gap-2"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} />
            Lucro
          </Button>
          <Button
            size="sm"
            variant={showMargem ? "default" : "outline"}
            onClick={() => setShowMargem((v) => !v)}
            className="gap-2"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#a855f7" }} />
            Margem %
          </Button>
        </div>
        <ChartCard title="Evolução Mensal" subtitle={compareYear ? `${selectedYear} vs ${compareYear}` : `Receita, despesa e lucro reais de ${selectedYear}`}>
          {monthlyHistory.length === 0 ? (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              Nenhum dado financeiro para exibir no ano selecionado
            </div>
          ) : (
            <ResponsiveContainer key={`${selectedYear}-${compareYear}`} width="100%" height={isMobile ? 280 : 350}>
              <ComposedChart data={mergedChartData} margin={isMobile ? { left: -15, right: 5, top: 5, bottom: 5 } : undefined}>
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
                  yAxisId="left"
                  stroke="#000" 
                  tick={{ fill: "#000", fontWeight: 600 }} 
                  fontSize={isMobile ? 9 : 13}
                  tickFormatter={isMobile ? (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v) : undefined}
                  width={isMobile ? 35 : 60}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#a855f7"
                  tick={{ fill: "#a855f7", fontWeight: 600 }}
                  fontSize={isMobile ? 9 : 13}
                  tickFormatter={(v: number) => `${v}%`}
                  width={isMobile ? 35 : 50}
                  domain={[0, 100]}
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
                      receita: `Receita ${selectedYear}`,
                      receitaPrevista: `Previsto ${selectedYear}`,
                      despesa: `Despesa ${selectedYear}`,
                      lucro: `Lucro ${selectedYear}`,
                      margem: `Margem ${selectedYear}`,
                      receitaPrev: `Receita ${compareYear}`,
                      receitaPrevistaPrev: `Previsto ${compareYear}`,
                      despesaPrev: `Despesa ${compareYear}`,
                      lucroPrev: `Lucro ${compareYear}`,
                      margemPrev: `Margem ${compareYear}`,
                    };
                    if (name === "margem" || name === "margemPrev") {
                      return [`${value}%`, labels[name] || name];
                    }
                    return [formatCurrencyBR(value), labels[name] || name];
                  }}
                />
                <Legend 
                  iconSize={isMobile ? 8 : 14}
                  wrapperStyle={isMobile ? { fontSize: 10 } : undefined}
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      receita: `Receita ${compareYear ? selectedYear : ""}`,
                      receitaPrevista: `Previsto ${compareYear ? selectedYear : ""}`,
                      despesa: `Despesa ${compareYear ? selectedYear : ""}`,
                      lucro: `Lucro ${compareYear ? selectedYear : ""}`,
                      margem: `Margem % ${compareYear ? selectedYear : ""}`,
                      receitaPrev: `Receita ${compareYear}`,
                      receitaPrevistaPrev: `Previsto ${compareYear}`,
                      despesaPrev: `Despesa ${compareYear}`,
                      lucroPrev: `Lucro ${compareYear}`,
                      margemPrev: `Margem % ${compareYear}`,
                    };
                    return labels[value] || value;
                  }}
                />
                {/* Current year bars - vivid */}
                <Bar yAxisId="left" dataKey="receita" stackId="revenue" fill="#16a34a" fillOpacity={1} radius={[0, 0, 0, 0]} name="receita" animationDuration={1200} animationBegin={0} />
                <Bar yAxisId="left" dataKey="receitaPrevista" stackId="revenue" fill="#f59e0b" fillOpacity={1} radius={[4, 4, 0, 0]} name="receitaPrevista" animationDuration={1200} animationBegin={200} />
                <Bar yAxisId="left" dataKey="despesa" fill="#dc2626" fillOpacity={1} radius={[4, 4, 0, 0]} name="despesa" animationDuration={1200} animationBegin={400} />
                {/* Comparison year bars (semi-transparent) */}
                {compareYear && (
                  <>
                    <Bar yAxisId="left" dataKey="receitaPrev" stackId="revenuePrev" fill="#16a34a" fillOpacity={0.5} radius={[0, 0, 0, 0]} name="receitaPrev" animationDuration={1200} animationBegin={0} />
                    <Bar yAxisId="left" dataKey="receitaPrevistaPrev" stackId="revenuePrev" fill="#f59e0b" fillOpacity={0.5} radius={[4, 4, 0, 0]} name="receitaPrevistaPrev" animationDuration={1200} animationBegin={200} />
                    <Bar yAxisId="left" dataKey="despesaPrev" fill="#dc2626" fillOpacity={0.5} radius={[4, 4, 0, 0]} name="despesaPrev" animationDuration={1200} animationBegin={400} />
                  </>
                )}
                {showLucro && (
                  <Line
                    yAxisId="left"
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
                )}
                {showMargem && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="margem"
                    stroke="#a855f7"
                    strokeWidth={isMobile ? 2 : 3}
                    dot={{ fill: "#a855f7", strokeWidth: 2, r: isMobile ? 3 : 5 }}
                    activeDot={{ r: isMobile ? 5 : 7, strokeWidth: 2 }}
                    name="margem"
                    animationDuration={1500}
                    animationBegin={800}
                  />
                )}
                {compareYear && (
                  <>
                    {showLucro && (
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="lucroPrev"
                        stroke="#3b82f6"
                        strokeWidth={isMobile ? 1 : 2}
                        strokeDasharray="6 3"
                        strokeOpacity={0.45}
                        dot={{ fill: "#3b82f6", strokeWidth: 1, r: isMobile ? 2 : 3, fillOpacity: 0.45 }}
                        name="lucroPrev"
                        animationDuration={1500}
                        animationBegin={600}
                      />
                    )}
                    {showMargem && (
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="margemPrev"
                        stroke="#a855f7"
                        strokeWidth={isMobile ? 1 : 2}
                        strokeDasharray="6 3"
                        strokeOpacity={0.45}
                        dot={{ fill: "#a855f7", strokeWidth: 1, r: isMobile ? 2 : 3, fillOpacity: 0.45 }}
                        name="margemPrev"
                        animationDuration={1500}
                        animationBegin={800}
                      />
                    )}
                  </>
                )}

              </ComposedChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <HistoricoMonthlyTable
        monthlyHistory={monthlyHistory}
        compareHistory={compareYearSummary?.monthlyHistory ?? null}
        compareYear={compareYear}
        selectedYear={selectedYear}
      />
    </Layout>
  );
}
