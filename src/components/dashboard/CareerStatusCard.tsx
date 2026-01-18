import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
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
      emoji: "🚀",
      title: "Em crescimento",
      description: "Sua carreira está evoluindo nos últimos 30 dias.",
      bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      titleColor: "text-emerald-700 dark:text-emerald-400",
    },
    attention: {
      emoji: "⚠️",
      title: "Em risco de estagnação",
      description: "Você teve poucos shows e baixa receita nos últimos 30 dias. Organizar contratos e aumentar leads é o próximo passo.",
      bgGradient: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
      borderColor: "border-amber-200 dark:border-amber-800",
      iconBg: "bg-amber-100 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
      titleColor: "text-amber-700 dark:text-amber-400",
    },
    stalled: {
      emoji: "⏸️",
      title: "Parado",
      description: "Sem atividade recente. Vamos retomar o ritmo!",
      bgGradient: "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30",
      borderColor: "border-gray-200 dark:border-gray-700",
      iconBg: "bg-gray-100 dark:bg-gray-800",
      iconColor: "text-gray-600 dark:text-gray-400",
      titleColor: "text-gray-700 dark:text-gray-400",
    },
  };

  const config = statusConfig[status];

  const formatChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className={cn(
      "rounded-2xl border p-4 sm:p-5",
      config.bgGradient,
      config.borderColor
    )}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={cn("p-2.5 rounded-xl", config.iconBg)}>
          <span className="text-2xl">{config.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
            Status da sua carreira
          </p>
          <h3 className={cn("text-lg sm:text-xl font-bold", config.titleColor)}>
            {config.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
        {config.description}
      </p>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-card/80 border border-border/50">
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
          current={`R$ ${formatCurrency(revenueThisMonth)}`}
          change={formatChange(revenueThisMonth, revenueLastMonth)}
          isPositive={revenueThisMonth >= revenueLastMonth}
          isLarge
        />
      </div>

      {/* Footer message */}
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 italic">
        Isso está abaixo da média de artistas ativos no Backstage.
      </p>
    </div>
  );
}

interface MetricItemProps {
  label: string;
  current: number | string;
  change: string;
  isPositive: boolean;
  isLarge?: boolean;
}

function MetricItem({ label, current, change, isPositive, isLarge }: MetricItemProps) {
  return (
    <div className={cn("text-center", isLarge && "col-span-1")}>
      <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-base sm:text-xl font-bold text-foreground">{current}</p>
      <div className="flex items-center justify-center gap-0.5 mt-1">
        {isPositive ? (
          <TrendingUp className="w-3 h-3 text-emerald-500" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-500" />
        )}
        <span className={cn("text-[10px] sm:text-xs font-medium", isPositive ? "text-emerald-500" : "text-red-500")}>
          {change}
        </span>
      </div>
    </div>
  );
}
