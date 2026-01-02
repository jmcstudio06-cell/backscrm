import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Check,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnnualGoals, AnnualGoal } from "@/hooks/useAnnualGoals";
import { AnnualGoalModal } from "@/components/metas/AnnualGoalModal";
import { ProgressRing } from "@/components/dashboard/ProgressRing";

const annualCategoryIcons: Record<string, React.ElementType> = {
  marketing: Megaphone,
  midia: TrendingUp,
  parcerias: Star,
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

const annualCategoryLabels: Record<string, string> = {
  marketing: "Marketing",
  midia: "Mídia",
  parcerias: "Parcerias",
  crescimento: "Crescimento",
  pessoal: "Pessoal",
};

export default function MetasAnuais() {
  const { 
    goals: annualGoals, 
    loading, 
    addGoal, 
    updateGoal, 
    deleteGoal,
    incrementGoal,
    toggleComplete 
  } = useAnnualGoals();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<AnnualGoal | null>(null);

  const currentYear = 2026;
  const yearlyGoals = annualGoals.filter(g => g.year === currentYear);

  const handleCreateGoal = () => {
    setSelectedGoal(null);
    setModalOpen(true);
  };

  const handleEditGoal = (goal: AnnualGoal) => {
    setSelectedGoal(goal);
    setModalOpen(true);
  };

  const handleSaveGoal = async (id: string, updates: Partial<AnnualGoal>) => {
    if (!id) {
      await addGoal({ ...updates, year: currentYear });
    } else {
      await updateGoal(id, updates);
    }
  };

  const handleToggleComplete = async (goal: AnnualGoal) => {
    await toggleComplete(goal.id);
  };

  const completedGoals = yearlyGoals.filter(g => g.completed).length;
  const totalGoals = yearlyGoals.length;
  const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Group goals by category
  const goalsByCategory = yearlyGoals.reduce((acc, goal) => {
    const category = goal.category || 'pessoal';
    if (!acc[category]) acc[category] = [];
    acc[category].push(goal);
    return acc;
  }, {} as Record<string, AnnualGoal[]>);

  if (loading) {
    return (
      <Layout title="Meta Anual 2026" subtitle="Acompanhe suas metas do ano">
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
    <Layout title="Meta Anual 2026" subtitle="Objetivos e conquistas do ano">
      <div className="space-y-6">
        {/* Header stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass border-border/50 overflow-hidden relative md:col-span-1">
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
                  Progresso Anual
                </h3>
                <p className="text-xs text-muted-foreground">
                  {completedGoals} de {totalGoals} metas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
            <CardContent className="p-4 relative flex flex-col justify-center h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedGoals}</p>
                  <p className="text-xs text-muted-foreground">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
            <CardContent className="p-4 relative flex flex-col justify-center h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalGoals - completedGoals}</p>
                  <p className="text-xs text-muted-foreground">Em progresso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent" />
            <CardContent className="p-4 relative flex flex-col justify-center h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalGoals}</p>
                  <p className="text-xs text-muted-foreground">Total de metas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add button */}
        <div className="flex justify-end">
          <Button onClick={handleCreateGoal} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
            <Plus className="w-4 h-4 mr-2" />
            Nova Meta Anual
          </Button>
        </div>

        {/* Goals by category */}
        {Object.keys(goalsByCategory).length === 0 ? (
          <Card className="glass border-border/50 border-dashed">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-primary/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhuma meta anual definida
                </h3>
                <p className="text-muted-foreground max-w-md mb-4 text-sm">
                  Crie suas metas para 2026 e acompanhe seu progresso ao longo do ano
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(goalsByCategory).map(([category, categoryGoals]) => {
              const CategoryIcon = annualCategoryIcons[category] || Target;
              const completedInCategory = categoryGoals.filter(g => g.completed).length;
              
              return (
                <Card key={category} className="overflow-hidden">
                  <CardHeader className={cn(
                    "py-3 bg-gradient-to-r text-white",
                    annualCategoryColors[category] || "from-zinc-600 to-zinc-500"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="w-5 h-5" />
                        <CardTitle className="text-base">{annualCategoryLabels[category] || category}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                        {completedInCategory}/{categoryGoals.length} concluídas
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {categoryGoals.map((goal) => {
                        const progress = goal.target_value > 0 
                          ? Math.round((goal.current_value / goal.target_value) * 100) 
                          : 0;

                        return (
                          <div
                            key={goal.id}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer group",
                              goal.completed 
                                ? "bg-emerald-50 border-emerald-200" 
                                : "bg-card hover:bg-muted/50 border-border"
                            )}
                            onClick={() => handleEditGoal(goal)}
                          >
                            {/* Checkbox */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleComplete(goal);
                              }}
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                                goal.completed
                                  ? "bg-emerald-500 border-emerald-500 text-white"
                                  : "border-muted-foreground/30 hover:border-primary"
                              )}
                            >
                              {goal.completed && <Check className="w-5 h-5" />}
                            </button>

                            {/* Goal info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={cn(
                                  "font-semibold truncate",
                                  goal.completed && "line-through text-muted-foreground"
                                )}>
                                  {goal.title}
                                </h4>
                                {goal.completed && (
                                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                    Concluída
                                  </Badge>
                                )}
                              </div>
                              {goal.description && (
                                <p className="text-sm text-muted-foreground truncate">{goal.description}</p>
                              )}
                              
                              {/* Progress bar for quantifiable goals */}
                              {goal.target_value > 1 && (
                                <div className="mt-2 space-y-1">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{goal.current_value} / {goal.target_value}</span>
                                    <span>{progress}%</span>
                                  </div>
                                  <Progress value={progress} className="h-2" />
                                </div>
                              )}
                            </div>

                            {/* Actions for quantifiable goals */}
                            {goal.target_value > 1 && !goal.completed && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    incrementGoal(goal.id, -1);
                                  }}
                                  disabled={goal.current_value <= 0}
                                  className="h-8 w-8 p-0"
                                >
                                  -
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    incrementGoal(goal.id, 1);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  +
                                </Button>
                              </div>
                            )}

                            {/* Settings button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditGoal(goal);
                              }}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AnnualGoalModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        goal={selectedGoal}
        onSave={handleSaveGoal}
        onDelete={deleteGoal}
      />
    </Layout>
  );
}
