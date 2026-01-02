import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Target,
  Save,
  TrendingUp,
  Users,
  Mic2,
  DollarSign,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoals } from "@/hooks/useGoals";
import { useShowsData } from "@/hooks/useShows";
import { useLeads } from "@/hooks/useLeads";
import { useTransactions } from "@/hooks/useTransactions";
import { toast } from "sonner";

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

interface MonthlyTarget {
  leads: number;
  shows: number;
  revenue: number;
}

export default function Metas() {
  const { goals, addGoal, updateGoal, loading } = useGoals();
  const { shows } = useShowsData();
  const { leads } = useLeads();
  const { transactions } = useTransactions();
  
  const currentYear = 2026;
  const [editMode, setEditMode] = useState(false);
  const [targets, setTargets] = useState<Record<number, MonthlyTarget>>({});
  const [initialized, setInitialized] = useState(false);

  // Initialize targets from existing goals
  useMemo(() => {
    if (initialized || loading) return;
    
    const initialTargets: Record<number, MonthlyTarget> = {};
    for (let month = 1; month <= 12; month++) {
      const leadsGoal = goals.find(g => g.month === month && g.year === currentYear && g.type === 'leads');
      const showsGoal = goals.find(g => g.month === month && g.year === currentYear && g.type === 'shows');
      const revenueGoal = goals.find(g => g.month === month && g.year === currentYear && g.type === 'revenue');
      
      initialTargets[month] = {
        leads: leadsGoal?.target_value || 0,
        shows: showsGoal?.target_value || 0,
        revenue: revenueGoal?.target_value || 0,
      };
    }
    setTargets(initialTargets);
    setInitialized(true);
  }, [goals, currentYear, loading, initialized]);

  // Calculate actual values for each month
  const getActualValues = (month: number) => {
    const actualLeads = leads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      return leadDate.getMonth() + 1 === month && leadDate.getFullYear() === currentYear;
    }).length;

    const actualShows = shows.filter(show => {
      const showDate = new Date(show.date);
      return showDate.getMonth() + 1 === month && showDate.getFullYear() === currentYear && show.status !== 'cancelled';
    }).length;

    const actualRevenue = transactions
      .filter(t => {
        const transDate = new Date(t.date);
        return t.type === 'income' && transDate.getMonth() + 1 === month && transDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return { leads: actualLeads, shows: actualShows, revenue: actualRevenue };
  };

  const calculatePercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.round((current / target) * 100);
  };

  const handleTargetChange = (month: number, type: keyof MonthlyTarget, value: string) => {
    const numValue = parseFloat(value) || 0;
    setTargets(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [type]: numValue,
      }
    }));
  };

  const handleSaveTargets = async () => {
    try {
      for (let month = 1; month <= 12; month++) {
        const monthTargets = targets[month];
        if (!monthTargets) continue;

        // Save/update leads goal
        const existingLeadsGoal = goals.find(g => g.month === month && g.year === currentYear && g.type === 'leads');
        if (existingLeadsGoal) {
          await updateGoal(existingLeadsGoal.id, { target_value: monthTargets.leads });
        } else if (monthTargets.leads > 0) {
          await addGoal({ title: 'Meta de Leads', type: 'leads', target_value: monthTargets.leads, month, year: currentYear });
        }

        // Save/update shows goal
        const existingShowsGoal = goals.find(g => g.month === month && g.year === currentYear && g.type === 'shows');
        if (existingShowsGoal) {
          await updateGoal(existingShowsGoal.id, { target_value: monthTargets.shows });
        } else if (monthTargets.shows > 0) {
          await addGoal({ title: 'Meta de Shows', type: 'shows', target_value: monthTargets.shows, month, year: currentYear });
        }

        // Save/update revenue goal
        const existingRevenueGoal = goals.find(g => g.month === month && g.year === currentYear && g.type === 'revenue');
        if (existingRevenueGoal) {
          await updateGoal(existingRevenueGoal.id, { target_value: monthTargets.revenue });
        } else if (monthTargets.revenue > 0) {
          await addGoal({ title: 'Meta de Faturamento', type: 'revenue', target_value: monthTargets.revenue, month, year: currentYear });
        }
      }
      
      setEditMode(false);
      toast.success('Metas salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar metas');
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    let totalLeadsTarget = 0;
    let totalLeadsActual = 0;
    let totalShowsTarget = 0;
    let totalShowsActual = 0;
    let totalRevenueTarget = 0;
    let totalRevenueActual = 0;

    for (let month = 1; month <= 12; month++) {
      const monthTargets = targets[month] || { leads: 0, shows: 0, revenue: 0 };
      const actuals = getActualValues(month);
      
      totalLeadsTarget += monthTargets.leads;
      totalLeadsActual += actuals.leads;
      totalShowsTarget += monthTargets.shows;
      totalShowsActual += actuals.shows;
      totalRevenueTarget += monthTargets.revenue;
      totalRevenueActual += actuals.revenue;
    }

    return {
      leadsTarget: totalLeadsTarget,
      leadsActual: totalLeadsActual,
      showsTarget: totalShowsTarget,
      showsActual: totalShowsActual,
      revenueTarget: totalRevenueTarget,
      revenueActual: totalRevenueActual,
    };
  }, [targets, leads, shows, transactions]);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 100) return 'text-emerald-600 bg-emerald-100';
    if (percentage >= 60) return 'text-amber-600 bg-amber-100';
    if (percentage >= 30) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <Layout title="Metas Comerciais 2026" subtitle="Acompanhe suas metas mensais">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Metas Comerciais 2026" subtitle="Defina e acompanhe suas metas mensais">
      <div className="space-y-6">
        {/* Header with stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{totals.leadsActual}/{totals.leadsTarget}</p>
                  <p className="text-xs text-muted-foreground">Leads no Ano</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Mic2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{totals.showsActual}/{totals.showsTarget}</p>
                  <p className="text-xs text-muted-foreground">Shows no Ano</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm sm:text-lg font-bold text-foreground">{formatCurrency(totals.revenueActual)}</p>
                  <p className="text-xs text-muted-foreground">Faturado no Ano</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm sm:text-lg font-bold text-foreground">{formatCurrency(totals.revenueTarget)}</p>
                  <p className="text-xs text-muted-foreground">Meta Anual</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTargets} className="bg-gradient-to-r from-primary to-primary/80">
                <Save className="w-4 h-4 mr-2" />
                Salvar Metas
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)} variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              Editar Metas
            </Button>
          )}
        </div>

        {/* Main table */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-zinc-800 to-zinc-700 text-white py-3">
            <CardTitle className="text-center text-sm sm:text-base">Controle de Metas Comerciais 2026</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-emerald-700 to-emerald-600">
                    <TableHead className="text-white font-bold text-center border-r border-emerald-500 text-xs sm:text-sm whitespace-nowrap">MÊS</TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-emerald-500 text-xs sm:text-sm whitespace-nowrap">META LEADS</TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-emerald-500 text-xs sm:text-sm">%</TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-emerald-500 text-xs sm:text-sm whitespace-nowrap">LEADS</TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-emerald-500 text-xs sm:text-sm whitespace-nowrap">META SHOWS</TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-emerald-500 text-xs sm:text-sm">%</TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-emerald-500 text-xs sm:text-sm whitespace-nowrap">REALIZADOS</TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-emerald-500 text-xs sm:text-sm whitespace-nowrap">META FATURAMENTO</TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-emerald-500 text-xs sm:text-sm">%</TableHead>
                    <TableHead className="text-white font-bold text-center text-xs sm:text-sm whitespace-nowrap">FATURADO</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthNames.map((monthName, index) => {
                    const month = index + 1;
                    const monthTargets = targets[month] || { leads: 0, shows: 0, revenue: 0 };
                    const actuals = getActualValues(month);
                    
                    const leadsPercent = calculatePercentage(actuals.leads, monthTargets.leads);
                    const showsPercent = calculatePercentage(actuals.shows, monthTargets.shows);
                    const revenuePercent = calculatePercentage(actuals.revenue, monthTargets.revenue);

                    return (
                      <TableRow key={month} className={index % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                        <TableCell className="font-bold text-center border-r bg-zinc-100 text-xs sm:text-sm whitespace-nowrap">{monthName.toUpperCase()}</TableCell>
                        
                        {/* Leads */}
                        <TableCell className="text-center border-r p-1 sm:p-2">
                          {editMode ? (
                            <Input
                              type="number"
                              value={monthTargets.leads || ''}
                              onChange={(e) => handleTargetChange(month, 'leads', e.target.value)}
                              className="w-14 sm:w-20 h-7 sm:h-8 text-center mx-auto text-xs sm:text-sm"
                              min="0"
                            />
                          ) : (
                            <span className="text-xs sm:text-sm">{monthTargets.leads || '-'}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center border-r p-1 sm:p-2">
                          <span className={cn('px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold', monthTargets.leads > 0 ? getPercentageColor(leadsPercent) : '')}>
                            {monthTargets.leads > 0 ? `${leadsPercent}%` : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center border-r font-semibold text-xs sm:text-sm">{actuals.leads}</TableCell>

                        {/* Shows */}
                        <TableCell className="text-center border-r p-1 sm:p-2">
                          {editMode ? (
                            <Input
                              type="number"
                              value={monthTargets.shows || ''}
                              onChange={(e) => handleTargetChange(month, 'shows', e.target.value)}
                              className="w-14 sm:w-20 h-7 sm:h-8 text-center mx-auto text-xs sm:text-sm"
                              min="0"
                            />
                          ) : (
                            <span className="text-xs sm:text-sm">{monthTargets.shows || '-'}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center border-r p-1 sm:p-2">
                          <span className={cn('px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold', monthTargets.shows > 0 ? getPercentageColor(showsPercent) : '')}>
                            {monthTargets.shows > 0 ? `${showsPercent}%` : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center border-r font-semibold text-xs sm:text-sm">{actuals.shows}</TableCell>

                        {/* Revenue */}
                        <TableCell className="text-center border-r p-1 sm:p-2">
                          {editMode ? (
                            <Input
                              type="number"
                              value={monthTargets.revenue || ''}
                              onChange={(e) => handleTargetChange(month, 'revenue', e.target.value)}
                              className="w-20 sm:w-24 h-7 sm:h-8 text-center mx-auto text-xs sm:text-sm"
                              min="0"
                              step="100"
                            />
                          ) : (
                            <span className="text-xs sm:text-sm">{monthTargets.revenue > 0 ? formatCurrency(monthTargets.revenue) : '-'}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center border-r p-1 sm:p-2">
                          <span className={cn('px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold', monthTargets.revenue > 0 ? getPercentageColor(revenuePercent) : '')}>
                            {monthTargets.revenue > 0 ? `${revenuePercent}%` : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-emerald-700 text-xs sm:text-sm whitespace-nowrap">
                          {formatCurrency(actuals.revenue)}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {/* Totals row */}
                  <TableRow className="bg-gradient-to-r from-zinc-800 to-zinc-700 text-white font-bold">
                    <TableCell className="text-center border-r border-zinc-600 text-xs sm:text-sm">TOTAL</TableCell>
                    <TableCell className="text-center border-r border-zinc-600 text-xs sm:text-sm">{totals.leadsTarget}</TableCell>
                    <TableCell className="text-center border-r border-zinc-600 text-xs sm:text-sm">-</TableCell>
                    <TableCell className="text-center border-r border-zinc-600 text-xs sm:text-sm">{totals.leadsActual}</TableCell>
                    <TableCell className="text-center border-r border-zinc-600 text-xs sm:text-sm">{totals.showsTarget}</TableCell>
                    <TableCell className="text-center border-r border-zinc-600 text-xs sm:text-sm">-</TableCell>
                    <TableCell className="text-center border-r border-zinc-600 text-xs sm:text-sm">{totals.showsActual}</TableCell>
                    <TableCell className="text-center border-r border-zinc-600 text-xs sm:text-sm whitespace-nowrap">{formatCurrency(totals.revenueTarget)}</TableCell>
                    <TableCell className="text-center border-r border-zinc-600 text-xs sm:text-sm">-</TableCell>
                    <TableCell className="text-center text-emerald-400 text-xs sm:text-sm whitespace-nowrap">{formatCurrency(totals.revenueActual)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold text-emerald-600 bg-emerald-100">100%+</span>
            <span className="text-muted-foreground">Meta atingida</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold text-amber-600 bg-amber-100">60-99%</span>
            <span className="text-muted-foreground">Bom progresso</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold text-orange-600 bg-orange-100">30-59%</span>
            <span className="text-muted-foreground">Atenção</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold text-red-600 bg-red-100">0-29%</span>
            <span className="text-muted-foreground">Crítico</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
