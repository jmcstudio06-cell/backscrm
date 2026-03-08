import { TrendingUp, TrendingDown, Sparkles, AlertTriangle, Pause, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CareerStatusCardProps {
  leadsThisMonth: number;
  leadsLastMonth: number;
  showsThisMonth: number;
  showsLastMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
}

type CareerStatus = "growing" | "attention" | "stalled";

export function CareerStatusCard({
  leadsThisMonth,
  leadsLastMonth,
  showsThisMonth,
  showsLastMonth,
  revenueThisMonth,
  revenueLastMonth,
}: CareerStatusCardProps) {
  const calculateStatus = (): CareerStatus => {
    let positiveIndicators = 0;
    let negativeIndicators = 0;

    if (leadsThisMonth > leadsLastMonth) positiveIndicators++;
    else if (leadsThisMonth < leadsLastMonth) negativeIndicators++;

    if (showsThisMonth > showsLastMonth) positiveIndicators++;
    else if (showsThisMonth < showsLastMonth) negativeIndicators++;

    if (revenueThisMonth > revenueLastMonth) positiveIndicators++;
    else if (revenueThisMonth < revenueLastMonth) negativeIndicators++;

    const hasActivity = leadsThisMonth > 0 || showsThisMonth > 0 || revenueThisMonth > 0;

    if (!hasActivity && leadsLastMonth === 0 && showsLastMonth === 0 && revenueLastMonth === 0) {
      return "stalled";
    }

    if (positiveIndicators >= 2) return "growing";
    if (negativeIndicators >= 2) return "attention";
    return "attention";
  };

  const status = calculateStatus();

  const statusConfig = {
    growing: {
      label: "Em Crescimento",
      sublabel: "Sua carreira está evoluindo!",
      icon: TrendingUp,
      gradient: "from-success via-success/80 to-success/60",
      bgGlow: "bg-gradient-to-br from-success/20 via-success/10 to-transparent",
      iconBg: "bg-gradient-to-br from-success to-success/80",
      textColor: "text-success",
      badgeBg: "bg-success/10",
      badgeBorder: "border-success/30",
    },
    attention: {
      label: "Atenção",
      sublabel: "Hora de acelerar as ações",
      icon: AlertTriangle,
      gradient: "from-destructive via-destructive/80 to-destructive/60",
      bgGlow: "bg-gradient-to-br from-destructive/15 via-destructive/5 to-transparent",
      iconBg: "bg-gradient-to-br from-destructive to-destructive/80",
      textColor: "text-destructive",
      badgeBg: "bg-destructive/10",
      badgeBorder: "border-destructive/30",
    },
    stalled: {
      label: "Parado",
      sublabel: "Vamos retomar o ritmo!",
      icon: Pause,
      gradient: "from-muted-foreground via-muted-foreground/80 to-muted-foreground/60",
      bgGlow: "bg-gradient-to-br from-muted/30 via-muted/20 to-transparent",
      iconBg: "bg-gradient-to-br from-muted-foreground/50 to-muted-foreground",
      textColor: "text-muted-foreground",
      badgeBg: "bg-muted",
      badgeBorder: "border-border",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const formatChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 shadow-card group hover:shadow-elevated transition-all duration-500">
      {/* Animated mesh background */}
      <div className={cn("absolute inset-0 opacity-60", config.bgGlow)} />
      <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-primary/20 to-accent/20 group-hover:opacity-50 transition-opacity duration-700" />
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-20 h-20 rounded-full border border-border/20 opacity-20" />
      <div className="absolute top-8 right-8 w-12 h-12 rounded-full border border-border/20 opacity-20" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-2xl shadow-lg",
              config.iconBg
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Status da Carreira</p>
              <h3 className={cn(
                "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                config.gradient
              )}>
                {config.label}
              </h3>
            </div>
          </div>
          {status === "growing" && (
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-sm",
              config.badgeBg, config.badgeBorder
            )}>
              <Sparkles className="w-3.5 h-3.5 text-success animate-pulse-soft" />
              <span className="text-xs font-semibold text-success">Excelente!</span>
            </div>
          )}
        </div>

        {/* Sublabel */}
        <p className="text-muted-foreground text-sm mb-6">{config.sublabel}</p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <MetricItem
            label="Leads"
            current={leadsThisMonth}
            change={formatChange(leadsThisMonth, leadsLastMonth)}
            isPositive={leadsThisMonth >= leadsLastMonth}
          />
          <MetricItem
            label="Shows"
            current={showsThisMonth}
            change={formatChange(showsThisMonth, showsLastMonth)}
            isPositive={showsThisMonth >= showsLastMonth}
          />
          <MetricItem
            label="Receita"
            current={revenueThisMonth}
            change={formatChange(revenueThisMonth, revenueLastMonth)}
            isPositive={revenueThisMonth >= revenueLastMonth}
            isCurrency
          />
        </div>
      </div>
    </div>
  );
}

interface MetricItemProps {
  label: string;
  current: number;
  change: string;
  isPositive: boolean;
  isCurrency?: boolean;
}

function MetricItem({ label, current, change, isPositive, isCurrency }: MetricItemProps) {
  const displayValue = isCurrency
    ? `R$ ${current.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : current;

  return (
    <div className="relative p-4 rounded-2xl bg-secondary/30 border border-border/50 backdrop-blur-sm group/metric hover:bg-secondary/50 transition-all duration-300">
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/metric:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="relative">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">{label}</p>
        <p className="text-xl font-bold text-foreground">{displayValue}</p>
        <div className={cn(
          "inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-semibold",
          isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
        )}>
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {change}
        </div>
      </div>
    </div>
  );
}