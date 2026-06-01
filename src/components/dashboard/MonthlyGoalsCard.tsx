import { Target, TrendingUp, Users, Flame, Sparkles, Zap, Rocket, CheckCircle2 } from "lucide-react";
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

  const getProgressIcon = (progress: number) => {
    if (progress >= 100) return Flame;
    if (progress >= 75) return Zap;
    if (progress >= 50) return Rocket;
    if (progress >= 25) return CheckCircle2;
    return Target;
  };

  const getProgressIconColor = (progress: number) => {
    if (progress >= 100) return "text-orange-400";
    if (progress >= 75) return "text-yellow-400";
    if (progress >= 50) return "text-cyan-400";
    if (progress >= 25) return "text-emerald-400";
    return "text-slate-400";
  };

  return (
    <div className="relative overflow-hidden rounded-none bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-none blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-none blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-none bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Metas do Mês</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              Continue assim <Sparkles className="w-3 h-3 text-amber-400" />
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {goals.map((goal, index) => {
            const progress = getProgress(goal.current, goal.target);
            const ProgressIcon = getProgressIcon(progress);

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-none bg-slate-800 border border-slate-700", getProgressIconColor(progress))}>
                      <ProgressIcon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{goal.label}</span>
                  </div>
                  <span className="text-sm font-black text-white">
                    {goal.formatValue ? goal.formatValue(goal.current) : goal.current} 
                    <span className="text-slate-500 text-[10px] font-medium ml-1">
                      / {goal.formatValue ? goal.formatValue(goal.target) : goal.target}
                    </span>
                  </span>
                </div>
                <div className="relative h-2.5 bg-slate-800 rounded-none overflow-hidden border border-slate-700/50">
                  <div 
                    className={cn("h-full bg-gradient-to-r transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.5)]", goal.gradient)}
                    style={{ width: `${progress}%` }}
                  />
                  {progress > 0 && (
                    <div 
                      className="absolute top-0 bottom-0 right-0 w-1 bg-white/20 blur-[1px]"
                      style={{ left: `${progress}%` }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
