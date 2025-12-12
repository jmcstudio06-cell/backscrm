import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Target,
  DollarSign,
  Mic2,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  Trophy,
  ChevronDown,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoals, Goal } from "@/hooks/useGoals";
import { useShowsData } from "@/hooks/useShows";
import { useLeads } from "@/hooks/useLeads";
import { useTransactions } from "@/hooks/useTransactions";
import { GoalModal } from "@/components/metas/GoalModal";

const iconMap: Record<string, React.ElementType> = {
  revenue: DollarSign,
  shows: Mic2,
  leads: Users,
};

const goalTypes = [
  { value: "leads", label: "Meta de Leads", icon: Users },
  { value: "revenue", label: "Meta de Receita", icon: DollarSign },
  { value: "shows", label: "Meta de Shows", icon: Mic2 },
];

export default function Metas() {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useGoals();
  const { shows } = useShowsData();
  const { leads } = useLeads();
  const { transactions } = useTransactions();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [newGoalType, setNewGoalType] = useState<{ type: string; label: string } | null>(null);

  // Calculate current values based on real data
  const calculateCurrentValue = (goal: Goal): number => {
    const goalMonth = goal.month;
    const goalYear = goal.year;

    switch (goal.type) {
      case "shows": {
        // Count shows in the month (scheduled, confirmed, completed - NOT cancelled)
        return shows.filter(show => {
          const showDate = new Date(show.date);
          const showMonth = showDate.getMonth() + 1;
          const showYear = showDate.getFullYear();
          return showMonth === goalMonth && 
                 showYear === goalYear && 
                 show.status !== "cancelled";
        }).length;
      }
      case "leads": {
        // Count leads created in the month
        return leads.filter(lead => {
          const leadDate = new Date(lead.created_at);
          const leadMonth = leadDate.getMonth() + 1;
          const leadYear = leadDate.getFullYear();
          return leadMonth === goalMonth && leadYear === goalYear;
        }).length;
      }
      case "revenue": {
        // Sum income transactions in the month (gross revenue)
        return transactions
          .filter(t => {
            const transDate = new Date(t.date);
            const transMonth = transDate.getMonth() + 1;
            const transYear = transDate.getFullYear();
            return t.type === "income" && 
                   transMonth === goalMonth && 
                   transYear === goalYear;
          })
          .reduce((sum, t) => sum + t.amount, 0);
      }
      default:
        return 0;
    }
  };

  // Compute goals with calculated current values
  const goalsWithCurrentValues = useMemo(() => {
    return goals.map(goal => ({
      ...goal,
      current_value: calculateCurrentValue(goal),
    }));
  }, [goals, shows, leads, transactions]);

  const handleCreateGoal = (type: string, label: string) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    setSelectedGoal({
      id: "",
      title: label,
      type,
      target_value: 0,
      current_value: 0,
      month: currentMonth,
      year: currentYear,
      created_at: new Date().toISOString(),
    });
    setNewGoalType({ type, label });
    setModalOpen(true);
  };

  const handleConfigureGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setModalOpen(true);
  };

  const handleSaveGoal = async (id: string, updates: Partial<Goal>) => {
    if (newGoalType && !id) {
      await addGoal(updates);
      setNewGoalType(null);
    } else {
      await updateGoal(id, updates);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (id) {
      await deleteGoal(id);
    }
    setNewGoalType(null);
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthlyGoals = goalsWithCurrentValues.filter(g => g.month === currentMonth && g.year === currentYear);

  const overallProgress = monthlyGoals.length > 0
    ? Math.round(
        monthlyGoals.reduce((sum, g) => {
          const progress = g.target_value > 0 ? ((g.current_value || 0) / g.target_value) * 100 : 0;
          return sum + Math.min(progress, 100);
        }, 0) / monthlyGoals.length
      )
    : 0;

  if (loading) {
    return (
      <Layout title="Definir Metas" subtitle="Acompanhe e defina seus objetivos">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  const formatValue = (goal: Goal, value: number) => {
    if (goal.type === "revenue") {
      return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
    }
    return value.toLocaleString("pt-BR");
  };

  return (
    <Layout title="Definir Metas" subtitle="Acompanhe e defina seus objetivos">
      <Tabs defaultValue="monthly" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="bg-secondary">
            <TabsTrigger value="monthly">Metas do Mês</TabsTrigger>
            <TabsTrigger value="all">Minhas Metas</TabsTrigger>
          </TabsList>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {goalTypes.map((type) => (
                <DropdownMenuItem
                  key={type.value}
                  onClick={() => handleCreateGoal(type.value, type.label)}
                  className="cursor-pointer"
                >
                  <type.icon className="w-4 h-4 mr-2" />
                  {type.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Monthly Goals Tab */}
        <TabsContent value="monthly" className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Progresso Geral" subtitle="Meta do mês">
              <div className="flex flex-col items-center py-6">
                <ProgressRing progress={overallProgress} size={160} strokeWidth={12} />
                <p className="text-lg font-semibold text-foreground mt-4">
                  {monthlyGoals.length === 0 ? "Nenhuma meta definida" : `${overallProgress}% concluído`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {monthlyGoals.length} meta(s) ativa(s)
                </p>
              </div>
            </ChartCard>

            <ChartCard title="Resumo" className="lg:col-span-2">
              {monthlyGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Target className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma meta definida para este mês</p>
                  <p className="text-sm text-muted-foreground">Crie suas primeiras metas para acompanhar seu progresso</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {monthlyGoals.map((goal) => {
                    const progress = goal.target_value > 0 
                      ? Math.round(((goal.current_value || 0) / goal.target_value) * 100) 
                      : 0;
                    const Icon = iconMap[goal.type] || Target;

                    return (
                      <div key={goal.id} className="p-4 rounded-xl bg-secondary/50 relative group">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                          onClick={() => handleConfigureGoal(goal)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{goal.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatValue(goal, goal.current_value || 0)} de {formatValue(goal, goal.target_value)}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="font-medium text-primary">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ChartCard>
          </div>

          {/* Detailed Goals */}
          {monthlyGoals.length > 0 && (
            <ChartCard title="Detalhamento das Metas">
              <div className="space-y-4">
                {monthlyGoals.map((goal) => {
                  const progress = goal.target_value > 0 
                    ? Math.round(((goal.current_value || 0) / goal.target_value) * 100) 
                    : 0;
                  const remaining = Math.max(0, goal.target_value - (goal.current_value || 0));
                  const Icon = iconMap[goal.type] || Target;

                  return (
                    <div key={goal.id} className="p-4 rounded-xl bg-secondary/50 relative group">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleConfigureGoal(goal)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <div className="flex items-start justify-between mb-4 pr-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{goal.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {progress >= 100 
                                ? "Meta atingida!" 
                                : `Faltam ${formatValue(goal, remaining)} para atingir a meta`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {formatValue(goal, goal.current_value || 0)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            de {formatValue(goal, goal.target_value)}
                          </p>
                        </div>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-3" />
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          )}
        </TabsContent>

        {/* All Goals Tab */}
        <TabsContent value="all" className="space-y-6">
          <ChartCard title="Todas as Metas" subtitle="Histórico completo">
            {goalsWithCurrentValues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Target className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma meta cadastrada</p>
                <p className="text-sm text-muted-foreground">Crie suas primeiras metas para acompanhar seu progresso</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goalsWithCurrentValues.map((goal) => {
                  const progress = goal.target_value > 0 
                    ? Math.round(((goal.current_value || 0) / goal.target_value) * 100) 
                    : 0;
                  const isCompleted = progress >= 100;

                  return (
                    <div
                      key={goal.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl transition-all relative group cursor-pointer",
                        isCompleted ? "bg-success/10" : "bg-secondary/50"
                      )}
                      onClick={() => handleConfigureGoal(goal)}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isCompleted ? "bg-success/20" : "bg-primary/10"
                      )}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : (
                          <Target className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{goal.title}</h4>
                          <Badge variant="outline">{goal.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <Progress value={Math.min(progress, 100)} className="flex-1 h-2" />
                          <span className="text-sm font-medium text-primary shrink-0">{progress}%</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge
                          variant="outline"
                          className={isCompleted
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-warning/10 text-warning border-warning/20"
                          }
                        >
                          {isCompleted ? (
                            <>
                              <Trophy className="w-3 h-3 mr-1" />
                              Concluída
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Em Progresso
                            </>
                          )}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {goal.month}/{goal.year}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>
        </TabsContent>
      </Tabs>

      <GoalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        goal={selectedGoal}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
      />
    </Layout>
  );
}
