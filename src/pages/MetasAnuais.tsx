import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Target,
  CheckCircle2,
  Clock,
  Trophy,
  Settings,
  TrendingUp,
  Sparkles,
  Star,
  Megaphone,
  Check,
  Flame,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnnualGoals, AnnualGoal } from "@/hooks/useAnnualGoals";
import { AnnualGoalModal } from "@/components/metas/AnnualGoalModal";

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
  crescimento: "from-emerald-500 to-teal-500",
  pessoal: "from-violet-500 to-purple-500",
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
  const inProgressGoals = totalGoals - completedGoals;
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
      <Layout title="Meta Anual 2026" subtitle="Objetivos e conquistas do ano">
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

        {/* ═══════ HERO CARD ═══════ */}
        <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-card">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/5 to-transparent" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative p-6">
            {/* Top row: progress ring + stats */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              
              {/* Progress ring */}
              <div className="relative flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                    <circle 
                      cx="60" cy="60" r="52" fill="none" 
                      stroke="url(#progressGradient)" 
                      strokeWidth="8" 
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      strokeDashoffset={`${2 * Math.PI * 52 * (1 - overallProgress / 100)}`}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-foreground">{overallProgress}%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-medium">{completedGoals} de {totalGoals} metas</p>
              </div>

              {/* Stats grid */}
              <div className="flex-1 grid grid-cols-3 gap-3 w-full">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                  <p className="text-2xl font-black text-foreground">{completedGoals}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Concluídas</p>
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-center">
                  <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                  <p className="text-2xl font-black text-foreground">{inProgressGoals}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Em progresso</p>
                </div>
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-center">
                  <Target className="w-5 h-5 text-primary mx-auto mb-1.5" />
                  <p className="text-2xl font-black text-foreground">{totalGoals}</p>
                  <p className="text-[11px] text-muted-foreground font-medium">Total</p>
                </div>
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Progresso geral do ano</span>
                <span className="text-xs font-bold text-primary">{overallProgress}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${overallProgress}%`, 
                    background: "var(--gradient-primary)" 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ ADD BUTTON ═══════ */}
        <div className="flex justify-end">
          <Button onClick={handleCreateGoal} variant="gradient" className="shadow-lg h-11 px-5">
            <Plus className="w-4 h-4 mr-2" />
            Nova Meta Anual
          </Button>
        </div>

        {/* ═══════ GOALS BY CATEGORY ═══════ */}
        {Object.keys(goalsByCategory).length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border/50 bg-card/50 p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-primary/60" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Nenhuma meta definida</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-5">
                Defina suas metas para 2026 e acompanhe cada conquista ao longo do ano
              </p>
              <Button onClick={handleCreateGoal} variant="gradient" size="sm">
                <Plus className="w-4 h-4 mr-1.5" /> Criar primeira meta
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(goalsByCategory).map(([category, categoryGoals]) => {
              const CategoryIcon = annualCategoryIcons[category] || Target;
              const completedInCategory = categoryGoals.filter(g => g.completed).length;
              const categoryProgress = categoryGoals.length > 0 
                ? Math.round((completedInCategory / categoryGoals.length) * 100) 
                : 0;
              
              return (
                <div key={category} className="rounded-2xl border border-border/50 bg-card shadow-card overflow-hidden">
                  {/* Category header */}
                  <div className={cn(
                    "px-5 py-3.5 bg-gradient-to-r text-white flex items-center justify-between",
                    annualCategoryColors[category] || "from-zinc-600 to-zinc-500"
                  )}>
                    <div className="flex items-center gap-2.5">
                      <CategoryIcon className="w-5 h-5" />
                      <h3 className="font-bold text-base">{annualCategoryLabels[category] || category}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-white/25 overflow-hidden">
                          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${categoryProgress}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-white/90">{categoryProgress}%</span>
                      </div>
                      <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 text-xs font-semibold">
                        {completedInCategory}/{categoryGoals.length}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Goals list */}
                  <div className="p-3 space-y-2">
                    {categoryGoals.map((goal) => {
                      const progress = goal.target_value > 0 
                        ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
                        : 0;

                      return (
                        <div
                          key={goal.id}
                          className={cn(
                            "flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer group",
                            goal.completed 
                              ? "bg-emerald-50 border-emerald-200/60" 
                              : "bg-card hover:bg-muted/40 border-border/50 hover:border-border"
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
                              "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shrink-0",
                              goal.completed
                                ? "bg-emerald-500 border-emerald-500 text-white scale-105"
                                : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
                            )}
                          >
                            {goal.completed && <Check className="w-4 h-4" />}
                          </button>

                          {/* Goal info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className={cn(
                                "font-semibold text-sm truncate",
                                goal.completed && "line-through text-muted-foreground"
                              )}>
                                {goal.title}
                              </h4>
                              {goal.completed && (
                                <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0 h-4">
                                  ✓
                                </Badge>
                              )}
                            </div>
                            {goal.description && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{goal.description}</p>
                            )}
                            
                            {/* Progress bar */}
                            {goal.target_value > 1 && (
                              <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-muted-foreground font-medium">{goal.current_value} / {goal.target_value}</span>
                                  <span className={cn(
                                    "font-bold",
                                    progress >= 100 ? "text-emerald-500" : progress >= 50 ? "text-primary" : "text-muted-foreground"
                                  )}>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-1.5" />
                              </div>
                            )}
                          </div>

                          {/* Increment buttons */}
                          {goal.target_value > 1 && !goal.completed && (
                            <div className="flex gap-1.5 shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  incrementGoal(goal.id, -1);
                                }}
                                disabled={goal.current_value <= 0}
                                className="h-7 w-7 p-0 text-xs"
                              >
                                −
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  incrementGoal(goal.id, 1);
                                }}
                                className="h-7 w-7 p-0 text-xs"
                              >
                                +
                              </Button>
                            </div>
                          )}

                          {/* Settings */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditGoal(goal);
                            }}
                          >
                            <Settings className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
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