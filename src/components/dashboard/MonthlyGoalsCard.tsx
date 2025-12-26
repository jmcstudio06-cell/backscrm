import { Target, TrendingUp, Users, Flame, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  label: string;
  current: number;
  target: number;
  icon: React.ElementType;
  gradient: string;
  formatValue?: (value: number) => string;
}

interface MonthlyGoalsCardProps {
  showsThisMonth: number;
  showsTarget: number;
  revenueThisMonth: number;
  revenueTarget: number;
  leadsThisMonth: number;
  leadsTarget: number;
}

export function MonthlyGoalsCard({
  showsThisMonth,
  showsTarget,
  revenueThisMonth,
  revenueTarget,
  leadsThisMonth,
  leadsTarget,
}: MonthlyGoalsCardProps) {
  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const goals: Goal[] = [
    {
      label: "Shows",
      current: showsThisMonth,
      target: showsTarget,
      icon: Target,
      gradient: "from-violet-500 to-purple-600",
    },
    {
      label: "Faturamento",
      current: revenueThisMonth,
      target: revenueTarget,
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-600",
      formatValue: formatCurrency,
    },
    {
      label: "Leads Fechados",
      current: leadsThisMonth,
      target: leadsTarget,
      icon: Users,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const getProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getStreakEmoji = (progress: number) => {
    if (progress >= 100) return "🔥";
    if (progress >= 75) return "⚡";
    if (progress >= 50) return "💪";
    if (progress >= 25) return "🚀";
    return "🎯";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Metas do Mês</h3>
            <p className="text-xs text-slate-400">Continue assim! 💪</p>
          </div>
        </div>

        <div className="space-y-5">
          {goals.map((goal, index) => {
            const progress = getProgress(goal.current, goal.target);
            const Icon = goal.icon;
            const displayCurrent = goal.formatValue ? goal.formatValue(goal.current) : goal.current;
            const displayTarget = goal.formatValue ? goal.formatValue(goal.target) : goal.target;

            return (
              <div
                key={goal.label}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                      goal.gradient
                    )}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{goal.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getStreakEmoji(progress)}</span>
                        <span className="text-sm font-bold text-white">
                          {displayCurrent} / {displayTarget}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="ml-[52px]">
                  <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
                        goal.gradient
                      )}
                      style={{ width: `${progress}%` }}
                    />
                    {/* Shimmer effect */}
                    {progress > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 w-full animate-pulse"
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                        }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-slate-400">{progress}% concluído</span>
                    {progress >= 100 && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <Sparkles className="w-3 h-3" /> Meta batida!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
