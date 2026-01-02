import { TrendingUp, TrendingDown, Minus, Sparkles, AlertTriangle, Pause } from "lucide-react";
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
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGlow: "from-emerald-500/30",
      iconBg: "bg-emerald-500/20",
      textColor: "text-emerald-400",
      pulse: true,
    },
    attention: {
      label: "Atenção",
      sublabel: "Hora de acelerar as ações",
      icon: AlertTriangle,
      gradient: "from-amber-500 via-orange-500 to-yellow-500",
      bgGlow: "from-amber-500/30",
      iconBg: "bg-amber-500/20",
      textColor: "text-amber-400",
      pulse: false,
    },
    stalled: {
      label: "Parado",
      sublabel: "Vamos retomar o ritmo!",
      icon: Pause,
      gradient: "from-slate-500 via-gray-500 to-zinc-500",
      bgGlow: "from-slate-500/20",
      iconBg: "bg-slate-500/20",
      textColor: "text-slate-400",
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
      {/* Animated background glow */}
      <div
        className={cn(
          "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl transition-all duration-1000",
          `bg-gradient-to-br ${config.bgGlow} to-transparent`,
          config.pulse && "animate-pulse"
        )}
      />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-slate-700/30 to-transparent rounded-full blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-xl", config.iconBg)}>
              <Icon className={cn("w-6 h-6", config.textColor)} />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Status da Carreira</p>
              <h3 className={cn("text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent", config.gradient)}>
                {config.label}
              </h3>
            </div>
          </div>
          {status === "growing" && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Excelente!</span>
            </div>
          )}
        </div>

        {/* Sublabel */}
        <p className="text-slate-400 text-sm mb-6">{config.sublabel}</p>

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
    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{displayValue}</p>
      <div className="flex items-center gap-1 mt-1">
        {isPositive ? (
          <TrendingUp className="w-3 h-3 text-emerald-400" />
        ) : (
          <TrendingDown className="w-3 h-3 text-rose-400" />
        )}
        <span className={cn("text-xs font-medium", isPositive ? "text-emerald-400" : "text-rose-400")}>
          {change}
        </span>
      </div>
    </div>
  );
}
