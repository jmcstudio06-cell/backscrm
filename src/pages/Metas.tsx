import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  CheckCircle2,
  Clock,
  Trophy,
  ChevronDown,
  Settings,
  TrendingUp,
  Sparkles,
  Star,
  Award,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoals, Goal } from "@/hooks/useGoals";
import { useAnnualGoals, AnnualGoal } from "@/hooks/useAnnualGoals";
import { useShowsData } from "@/hooks/useShows";
import { useLeads } from "@/hooks/useLeads";
import { useTransactions } from "@/hooks/useTransactions";
import { GoalModal } from "@/components/metas/GoalModal";
import { AnnualGoalModal } from "@/components/metas/AnnualGoalModal";

const iconMap: Record<string, React.ElementType> = {
  revenue: DollarSign,
  shows: Mic2,
  leads: Users,
};

const colorMap: Record<string, string> = {
  revenue: "from-emerald-500 to-teal-500",
  shows: "from-violet-500 to-purple-500",
  leads: "from-blue-500 to-cyan-500",
};

const bgColorMap: Record<string, string> = {
  revenue: "bg-emerald-500/10",
  shows: "bg-violet-500/10",
  leads: "bg-blue-500/10",
};

const textColorMap: Record<string, string> = {
  revenue: "text-emerald-500",
  shows: "text-violet-500",
  leads: "text-blue-500",
};

const goalTypes = [
  { value: "leads", label: "Meta de Leads", icon: Users },
  { value: "revenue", label: "Meta de Receita", icon: DollarSign },
  { value: "shows", label: "Meta de Shows", icon: Mic2 },
];

const annualCategoryIcons: Record<string, React.ElementType> = {
  marketing: Megaphone,
  midia: TrendingUp,
  parcerias: Users,
  crescimento: TrendingUp,
  pessoal: Star,
};

const annualCategoryColors: Record<string, string> = {
  marketing: "from-pink-500 to-rose-500",
  midia: "from-cyan-500 to-blue-500",
  parcerias: "from-amber-500 to-orange-500",
  crescimento: "from-green-500 to-emerald-500",
  pessoal: "from-purple-500 to-indigo-500",
};

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function Metas() {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useGoals();
  const { 
    goals: annualGoals, 
    loading: annualLoading, 
    addGoal: addAnnualGoal, 
    updateGoal: updateAnnualGoal, 
    deleteGoal: deleteAnnualGoal,
    incrementGoal: incrementAnnualGoal 
  } = useAnnualGoals();
  const { shows } = useShowsData();
  const { leads } = useLeads();
  const { transactions } = useTransactions();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [annualModalOpen, setAnnualModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedAnnualGoal, setSelectedAnnualGoal] = useState<AnnualGoal | null>(null);
  const [newGoalType, setNewGoalType] = useState<{ type: string; label: string } | null>(null);

  const calculateCurrentValue = (goal: Goal): number => {
    const goalMonth = goal.month;
    const goalYear = goal.year;

    switch (goal.type) {
      case "shows": {
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
        return leads.filter(lead => {
          const leadDate = new Date(lead.created_at);
          const leadMonth = leadDate.getMonth() + 1;
          const leadYear = leadDate.getFullYear();
          return leadMonth === goalMonth && leadYear === goalYear;
        }).length;
      }
      case "revenue": {
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

  const handleCreateAnnualGoal = () => {
    setSelectedAnnualGoal(null);
    setAnnualModalOpen(true);
  };

  const handleConfigureAnnualGoal = (goal: AnnualGoal) => {
    setSelectedAnnualGoal(goal);
    setAnnualModalOpen(true);
  };

  const handleSaveAnnualGoal = async (id: string, updates: Partial<AnnualGoal>) => {
    if (!id) {
      await addAnnualGoal(updates);
    } else {
      await updateAnnualGoal(id, updates);
    }
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const monthlyGoals = goalsWithCurrentValues.filter(g => g.month === currentMonth && g.year === currentYear);
  const yearlyAnnualGoals = annualGoals.filter(g => g.year === currentYear);

  const overallProgress = monthlyGoals.length > 0
    ? Math.round(
        monthlyGoals.reduce((sum, g) => {
          const progress = g.target_value > 0 ? ((g.current_value || 0) / g.target_value) * 100 : 0;
          return sum + Math.min(progress, 100);
        }, 0) / monthlyGoals.length
      )
    : 0;

  const completedGoals = monthlyGoals.filter(g => 
    g.target_value > 0 && ((g.current_value || 0) / g.target_value) >= 1
  ).length;

  const annualOverallProgress = yearlyAnnualGoals.length > 0
    ? Math.round(
        yearlyAnnualGoals.reduce((sum, g) => {
          const progress = g.target_value > 0 ? (g.current_value / g.target_value) * 100 : 0;
          return sum + Math.min(progress, 100);
        }, 0) / yearlyAnnualGoals.length
      )
    : 0;

  const completedAnnualGoals = yearlyAnnualGoals.filter(g => g.completed).length;

  if (loading || annualLoading) {
    return (
      <Layout title="Definir Metas" subtitle="Acompanhe e defina seus objetivos">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
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
      <Accordion type="multiple" defaultValue={["comerciais", "anuais"]} className="space-y-4">
        {/* Metas Comerciais */}
        <AccordionItem value="comerciais" className="border rounded-xl bg-card/50 overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 [&[data-state=open]>div]:text-primary">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span>Metas Comerciais</span>
              <Badge variant="secondary" className="ml-2">
                {monthlyGoals.length} ativa{monthlyGoals.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Meta Comercial
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    {goalTypes.map((type) => (
                      <DropdownMenuItem
                        key={type.value}
                        onClick={() => handleCreateGoal(type.value, type.label)}
                        className="cursor-pointer py-3"
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mr-3", bgColorMap[type.value])}>
                          <type.icon className={cn("w-4 h-4", textColorMap[type.value])} />
                        </div>
                        {type.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass border-border/50 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <CardContent className="p-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <ProgressRing progress={overallProgress} size={100} strokeWidth={8} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-primary/30" />
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mt-3">
                        Progresso Geral
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {monthNames[currentMonth - 1]} {currentYear}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-border/50 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                  <CardContent className="p-4 relative flex flex-col justify-center h-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{monthlyGoals.length}</p>
                        <p className="text-xs text-muted-foreground">Metas Ativas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-border/50 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                  <CardContent className="p-4 relative flex flex-col justify-center h-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <Trophy className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{completedGoals}</p>
                        <p className="text-xs text-muted-foreground">Concluídas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Goals Grid */}
              {monthlyGoals.length === 0 ? (
                <Card className="glass border-border/50 border-dashed">
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                        <Target className="w-8 h-8 text-primary/50" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhuma meta comercial para este mês
                      </h3>
                      <p className="text-muted-foreground max-w-md mb-4 text-sm">
                        Defina suas metas mensais para acompanhar seu progresso
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {monthlyGoals.map((goal) => {
                    const progress = goal.target_value > 0 
                      ? Math.round(((goal.current_value || 0) / goal.target_value) * 100) 
                      : 0;
                    const remaining = Math.max(0, goal.target_value - (goal.current_value || 0));
                    const Icon = iconMap[goal.type] || Target;
                    const isCompleted = progress >= 100;

                    return (
                      <Card 
                        key={goal.id} 
                        className={cn(
                          "glass border-border/50 overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                          isCompleted && "ring-2 ring-emerald-500/20"
                        )}
                        onClick={() => handleConfigureGoal(goal)}
                      >
                        <div className={cn(
                          "h-1.5 bg-gradient-to-r",
                          colorMap[goal.type] || "from-primary to-primary/80"
                        )} />
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                                colorMap[goal.type] || "from-primary to-primary/80"
                              )}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground text-sm">{goal.title}</h4>
                                <p className="text-xs text-muted-foreground capitalize">{goal.type}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2 h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfigureGoal(goal);
                              }}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-2xl font-bold text-foreground">
                                  {goal.type === "revenue" 
                                    ? `R$ ${((goal.current_value || 0) / 1000).toFixed(1)}k`
                                    : goal.current_value || 0
                                  }
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  de {goal.type === "revenue" 
                                    ? `R$ ${(goal.target_value / 1000).toFixed(1)}k`
                                    : goal.target_value
                                  }
                                </p>
                              </div>
                              <div className="text-right">
                                {isCompleted ? (
                                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Concluída
                                  </Badge>
                                ) : (
                                  <p className="text-xl font-bold text-primary">{progress}%</p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <Progress 
                                value={Math.min(progress, 100)} 
                                className="h-2 bg-muted" 
                              />
                              <p className="text-xs text-muted-foreground">
                                {isCompleted 
                                  ? "🎉 Meta atingida!" 
                                  : `Faltam ${formatValue(goal, remaining)}`
                                }
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Metas Anuais */}
        <AccordionItem value="anuais" className="border rounded-xl bg-card/50 overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 [&[data-state=open]>div]:text-pink-500">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span>Metas Anuais</span>
              <Badge variant="secondary" className="ml-2 bg-pink-500/10 text-pink-600">
                {yearlyAnnualGoals.length} meta{yearlyAnnualGoals.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button 
                  onClick={handleCreateAnnualGoal}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Meta Anual
                </Button>
              </div>

              {/* Annual Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass border-border/50 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent" />
                  <CardContent className="p-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="relative">
                        <ProgressRing progress={annualOverallProgress} size={100} strokeWidth={8} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Star className="w-5 h-5 text-pink-500/30" />
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground mt-3">
                        Progresso Anual
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {currentYear}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-border/50 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent" />
                  <CardContent className="p-4 relative flex flex-col justify-center h-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                        <Megaphone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{yearlyAnnualGoals.length}</p>
                        <p className="text-xs text-muted-foreground">Metas de Marketing</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass border-border/50 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                  <CardContent className="p-4 relative flex flex-col justify-center h-full">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-foreground">{completedAnnualGoals}</p>
                        <p className="text-xs text-muted-foreground">Conquistas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Annual Goals Grid */}
              {yearlyAnnualGoals.length === 0 ? (
                <Card className="glass border-border/50 border-dashed">
                  <CardContent className="py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/5 flex items-center justify-center mb-4">
                        <Star className="w-8 h-8 text-pink-500/50" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Nenhuma meta anual cadastrada
                      </h3>
                      <p className="text-muted-foreground max-w-md mb-4 text-sm">
                        Crie metas de marketing e visibilidade! Ex: Tocar na rádio, aparecer na TV...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {yearlyAnnualGoals.map((goal) => {
                    const progress = goal.target_value > 0 
                      ? Math.round((goal.current_value / goal.target_value) * 100) 
                      : 0;
                    const Icon = annualCategoryIcons[goal.category] || Star;
                    const gradientColor = annualCategoryColors[goal.category] || "from-pink-500 to-rose-500";

                    return (
                      <Card 
                        key={goal.id} 
                        className={cn(
                          "glass border-border/50 overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                          goal.completed && "ring-2 ring-emerald-500/20"
                        )}
                        onClick={() => handleConfigureAnnualGoal(goal)}
                      >
                        <div className={cn("h-1.5 bg-gradient-to-r", gradientColor)} />
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg",
                                gradientColor
                              )}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-foreground text-sm">{goal.title}</h4>
                                <Badge variant="outline" className="text-xs mt-1 capitalize">
                                  {goal.category}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {goal.description && (
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {goal.description}
                            </p>
                          )}

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-foreground">{goal.current_value}</span>
                                <span className="text-muted-foreground text-sm">/ {goal.target_value}</span>
                              </div>
                              {goal.completed ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Concluída
                                </Badge>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    incrementAnnualGoal(goal.id);
                                  }}
                                  className="h-7 text-xs"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  +1
                                </Button>
                              )}
                            </div>

                            <Progress 
                              value={Math.min(progress, 100)} 
                              className="h-2 bg-muted" 
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Histórico */}
        <AccordionItem value="historico" className="border rounded-xl bg-card/50 overflow-hidden">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 [&[data-state=open]>div]:text-amber-500">
            <div className="flex items-center gap-3 text-lg font-semibold">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span>Histórico</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              {/* Commercial Goals History */}
              <Card className="glass border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Histórico de Metas Comerciais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {goalsWithCurrentValues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                        <Target className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-foreground font-medium text-sm">Nenhuma meta cadastrada</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {goalsWithCurrentValues.map((goal) => {
                        const progress = goal.target_value > 0 
                          ? Math.round(((goal.current_value || 0) / goal.target_value) * 100) 
                          : 0;
                        const isCompleted = progress >= 100;
                        const Icon = iconMap[goal.type] || Target;

                        return (
                          <div
                            key={goal.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer hover:shadow-md",
                              isCompleted 
                                ? "bg-emerald-500/5 hover:bg-emerald-500/10" 
                                : "bg-muted/30 hover:bg-muted/50"
                            )}
                            onClick={() => handleConfigureGoal(goal)}
                          >
                            <div className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br",
                              colorMap[goal.type] || "from-primary to-primary/80"
                            )}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground text-sm truncate">{goal.title}</h4>
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {monthNames[goal.month - 1].slice(0, 3)}/{goal.year}
                                </Badge>
                              </div>
                              <Progress value={Math.min(progress, 100)} className="h-1.5" />
                            </div>

                            <span className="text-xs font-medium text-muted-foreground shrink-0">
                              {progress}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Annual Goals History */}
              <Card className="glass border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Star className="w-4 h-4 text-pink-500" />
                    Histórico de Metas Anuais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {annualGoals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                        <Star className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-foreground font-medium text-sm">Nenhuma meta anual cadastrada</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {annualGoals.map((goal) => {
                        const progress = goal.target_value > 0 
                          ? Math.round((goal.current_value / goal.target_value) * 100) 
                          : 0;
                        const Icon = annualCategoryIcons[goal.category] || Star;
                        const gradientColor = annualCategoryColors[goal.category] || "from-pink-500 to-rose-500";

                        return (
                          <div
                            key={goal.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer hover:shadow-md",
                              goal.completed 
                                ? "bg-emerald-500/5 hover:bg-emerald-500/10" 
                                : "bg-muted/30 hover:bg-muted/50"
                            )}
                            onClick={() => handleConfigureAnnualGoal(goal)}
                          >
                            <div className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br",
                              gradientColor
                            )}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground text-sm truncate">{goal.title}</h4>
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {goal.year}
                                </Badge>
                              </div>
                              <Progress value={Math.min(progress, 100)} className="h-1.5" />
                            </div>

                            <span className="text-xs font-medium text-muted-foreground shrink-0">
                              {goal.current_value}/{goal.target_value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <GoalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        goal={selectedGoal}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
      />

      <AnnualGoalModal
        open={annualModalOpen}
        onOpenChange={setAnnualModalOpen}
        goal={selectedAnnualGoal}
        onSave={handleSaveAnnualGoal}
        onDelete={deleteAnnualGoal}
      />
    </Layout>
  );
}
