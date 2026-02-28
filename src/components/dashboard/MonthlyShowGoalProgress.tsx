import { Target, Flame, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthlyShowGoalProgressProps {
  current: number;
  target: number;
  monthName: string;
}

export function MonthlyShowGoalProgress({ current, target, monthName }: MonthlyShowGoalProgressProps) {
  const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  const isCompleted = current >= target;
  const isOnTrack = progress >= 50;
  const isBehind = progress < 50 && progress > 0;

  const getStatus = () => {
    if (isCompleted) return { text: "Meta batida! Parabéns!", icon: Flame, color: "text-orange-400", bg: "bg-orange-500/20" };
    if (isOnTrack) return { text: "Você está no ritmo certo!", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/20" };
    if (isBehind) return { text: "Atenção: abaixo da meta", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/20" };
    return { text: "Bora começar o mês!", icon: Target, color: "text-slate-400", bg: "bg-slate-500/20" };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6 shadow-xl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5" />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl shadow-lg",
              isCompleted
                ? "bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30"
                : "bg-gradient-to-br from-primary to-primary/80 shadow-primary/30"
            )}>
              {isCompleted ? (
                <Flame className="w-5 h-5 text-white" />
              ) : (
                <Target className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Meta de Shows</h3>
              <p className="text-xs text-slate-400 capitalize">{monthName}</p>
            </div>
          </div>

          {/* Counter */}
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black text-white">
              {current}<span className="text-slate-500 text-lg sm:text-xl font-semibold">/{target}</span>
            </div>
            <p className="text-xs text-slate-400">shows realizados</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-4 bg-slate-700/50 rounded-full overflow-hidden mb-3">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
              isCompleted
                ? "bg-gradient-to-r from-orange-500 to-amber-500"
                : isOnTrack
                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                : "bg-gradient-to-r from-violet-500 to-purple-500"
            )}
            style={{ width: `${progress}%` }}
          />
          {/* Shimmer */}
          {progress > 0 && progress < 100 && (
            <div
              className="absolute inset-y-0 left-0 animate-pulse"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
              }}
            />
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">{progress}% concluído</span>
          <div className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", status.bg, status.color)}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.text}
            {isCompleted && <Sparkles className="w-3 h-3" />}
          </div>
        </div>
      </div>
    </div>
  );
}
