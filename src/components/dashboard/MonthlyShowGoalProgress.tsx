import { Target, Flame, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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
    if (isCompleted) return { text: "Meta batida! Parabéns!", icon: Flame, color: "text-success", bg: "bg-success/20" };
    if (isOnTrack) return { text: "Você está no ritmo certo!", icon: TrendingUp, color: "text-success", bg: "bg-success/20" };
    if (isBehind) return { text: "Atenção: abaixo da meta", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/20" };
    return { text: "Bora começar o mês!", icon: Target, color: "text-muted-foreground", bg: "bg-muted" };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 sm:p-6 shadow-card">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/3" />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl shadow-lg",
              isCompleted
                ? "bg-gradient-to-br from-success to-success/80 shadow-success/30"
                : "bg-gradient-to-br from-primary to-accent shadow-primary/30"
            )}>
              {isCompleted ? (
                <Flame className="w-5 h-5 text-white" />
              ) : (
                <Target className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">Meta de Shows</h3>
              <p className="text-xs text-muted-foreground capitalize">{monthName}</p>
            </div>
          </div>

          {/* Counter: Realizado x Meta */}
          <div className="flex items-center gap-2 text-right">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-foreground">{current}</div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Realizado</p>
            </div>
            <span className="text-muted-foreground text-lg font-light">/</span>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-muted-foreground">{target}</div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">Meta</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-4 bg-secondary rounded-full overflow-hidden mb-3">
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out",
              isCompleted
                ? "bg-gradient-to-r from-success to-success/80"
                : isOnTrack
                ? "bg-gradient-to-r from-primary to-accent"
                : "bg-gradient-to-r from-primary to-primary/80"
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
          <span className="text-xs font-medium text-muted-foreground">{progress}% concluído</span>
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