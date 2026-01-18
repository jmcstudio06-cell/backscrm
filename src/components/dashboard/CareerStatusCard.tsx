import { TrendingUp, TrendingDown, Sparkles, AlertTriangle, Pause } from "lucide-react";
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
  // Calculate career status based on trends
  const calculateStatus = (): CareerStatus => {
    let positiveIndicators = 0;
    let negativeIndicators = 0;

    // Compare leads
    if (leadsThisMonth > leadsLastMonth) positiveIndicators++;
    else if (leadsThisMonth < leadsLastMonth) negativeIndicators++;

    // Compare shows
    if (showsThisMonth > showsLastMonth) positiveIndicators++;
    else if (showsThisMonth < showsLastMonth) negativeIndicators++;

    // Compare revenue
    if (revenueThisMonth > revenueLastMonth) positiveIndicators++;
    else if (revenueThisMonth < revenueLastMonth) negativeIndicators++;

    // Also consider if there's activity at all
    const hasActivity = leadsThisMonth > 0 || showsThisMonth > 0 || revenueThisMonth > 0;

    if (!hasActivity && leadsLastMonth === 0 && showsLastMonth === 0 && revenueLastMonth === 0) {
      return "stalled"; // No activity at all
    }

    if (positiveIndicators >= 2) return "growing";
    if (negativeIndicators >= 2) return "attention";
    return "attention"; // Mixed signals = attention
  };

  const status = calculateStatus();

  const statusConfig = {
    growing: {
      label: "Em Crescimento",
      sublabel: "Sua carreira está evoluindo!",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-teal-500",
      bgGlow: "bg-success/10",
      iconBg: "bg-success/20",
      textColor: "text-success",
      badgeBg: "bg-success/10",
      badgeBorder: "border-success/30",
      pulse: true,
    },
    attention: {
      label: "Atenção",
      sublabel: "Hora de acelerar as ações",
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-500",
      bgGlow: "bg-warning/10",
      iconBg: "bg-warning/20",
      textColor: "text-warning",
      badgeBg: "bg-warning/10",
      badgeBorder: "border-warning/30",
      pulse: false,
    },
    stalled: {
      label: "Parado",
      sublabel: "Vamos retomar o ritmo!",
      icon: Pause,
      gradient: "from-muted-foreground to-muted-foreground",
      bgGlow: "bg-muted/20",
      iconBg: "bg-muted",
      textColor: "text-muted-foreground",
      badgeBg: "bg-muted",
      badgeBorder: "border-border",
      pulse: false,
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
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-sm">
      {/* Background decoration */}
      <div className={cn("absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl", config.bgGlow)} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-xl", config.iconBg)}>
              <Icon className={cn("w-6 h-6", config.textColor)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Status da Carreira</p>
              <h3 className={cn("text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent", config.gradient)}>
                {config.label}
              </h3>
            </div>
          </div>
          {status === "growing" && (
            <div className={cn("flex items-center gap-1 px-3 py-1 rounded-full border", config.badgeBg, config.badgeBorder)}>
              <Sparkles className="w-3 h-3 text-success" />
              <span className="text-xs font-medium text-success">Excelente!</span>
            </div>
          )}
        </div>

        {/* Sublabel */}
        <p className="text-muted-foreground text-sm mb-6">{config.sublabel}</p>

        {/* Metrics comparison */}
        <div className="grid grid-cols-3 gap-4">
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
    <div className="p-3 rounded-xl bg-secondary/50 border border-border">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold text-foreground">{displayValue}</p>
      <div className="flex items-center gap-1 mt-1">
        {isPositive ? (
          <TrendingUp className="w-3 h-3 text-success" />
        ) : (
          <TrendingDown className="w-3 h-3 text-destructive" />
        )}
        <span className={cn("text-xs font-medium", isPositive ? "text-success" : "text-destructive")}>
          {change}
        </span>
      </div>
    </div>
  );
}
