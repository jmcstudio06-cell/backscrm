import { TrendingUp, Minus, AlertTriangle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface CareerThermometerCardProps {
  showsThisMonth: number;
  showsLastMonth: number;
  monthlyGoal: number; // target shows
  monthlyGoalProgress: number; // 0..100 (clamped here too)
  revenueThisMonth: number;
  revenueLastMonth: number;
}

type Status = "accelerating" | "stable" | "attention";

function computeStatus({
  showsThisMonth,
  showsLastMonth,
  monthlyGoalProgress,
  revenueThisMonth,
  revenueLastMonth,
}: Pick<CareerThermometerCardProps, "showsThisMonth" | "showsLastMonth" | "monthlyGoalProgress" | "revenueThisMonth" | "revenueLastMonth">): Status {
  const showsGrowing = showsThisMonth >= showsLastMonth;
  const revenueGrowing = revenueThisMonth >= revenueLastMonth;
  const goodGoal = monthlyGoalProgress >= 70;
  const okGoal = monthlyGoalProgress >= 40;

  if (goodGoal && showsGrowing && revenueGrowing) return "accelerating";
  if (okGoal || (showsGrowing && revenueGrowing)) return "stable";
  return "attention";
}

const STATUS_CONFIG: Record<Status, {
  label: string;
  emoji: string;
  icon: typeof Flame;
  ring: string;
  bg: string;
  text: string;
  dot: string;
  gradient: string;
  message: (p: { showsThisMonth: number; monthlyGoal: number }) => string;
}> = {
  accelerating: {
    label: "Acelerando",
    emoji: "🟢",
    icon: Flame,
    ring: "ring-emerald-500/30",
    bg: "from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    gradient: "from-emerald-500 to-teal-500",
    message: ({ showsThisMonth, monthlyGoal }) =>
      `Você realizou ${showsThisMonth}${monthlyGoal ? ` dos ${monthlyGoal}` : ""} shows da meta mensal. Continue assim!`,
  },
  stable: {
    label: "Estável",
    emoji: "🟡",
    icon: Minus,
    ring: "ring-amber-500/30",
    bg: "from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    gradient: "from-amber-500 to-orange-500",
    message: ({ showsThisMonth, monthlyGoal }) =>
      `Você realizou ${showsThisMonth}${monthlyGoal ? ` dos ${monthlyGoal}` : ""} shows da meta mensal. Dá pra acelerar.`,
  },
  attention: {
    label: "Atenção",
    emoji: "🔴",
    icon: AlertTriangle,
    ring: "ring-red-500/30",
    bg: "from-red-500/10 via-red-500/5 to-transparent border-red-500/30",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    gradient: "from-red-500 to-rose-600",
    message: ({ showsThisMonth, monthlyGoal }) =>
      `Você realizou ${showsThisMonth}${monthlyGoal ? ` dos ${monthlyGoal}` : ""} shows da meta mensal. Hora de buscar mais oportunidades.`,
  },
};

export function CareerThermometerCard(props: CareerThermometerCardProps) {
  const status = computeStatus(props);
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  const progress = Math.min(100, Math.max(0, props.monthlyGoalProgress));

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-card animate-fade-in",
      cfg.bg
    )}>
      <div className="relative flex items-start gap-4">
        <div className={cn(
          "w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center shadow-lg ring-4 bg-gradient-to-br",
          cfg.gradient,
          cfg.ring
        )}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground leading-none">
            Status da Carreira
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("w-2.5 h-2.5 rounded-full animate-pulse", cfg.dot)} />
            <h3 className={cn("text-xl sm:text-2xl font-extrabold leading-none", cfg.text)}>
              {cfg.label}
            </h3>
          </div>
          <p className="text-sm text-foreground/80 mt-2 leading-snug">
            {cfg.message({ showsThisMonth: props.showsThisMonth, monthlyGoal: props.monthlyGoal })}
          </p>

          {/* Mini progress */}
          {props.monthlyGoal > 0 && (
            <div className="mt-3">
              <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={cn("h-full rounded-full bg-gradient-to-r transition-all", cfg.gradient)}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground font-medium">
                <span>Progresso da meta mensal</span>
                <span className={cn("font-bold", cfg.text)}>{Math.round(progress)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
