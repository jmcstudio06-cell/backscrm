import { TrendingUp, TrendingDown, Calendar, Users, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface Last30DaysCardProps {
  leadsThisMonth: number;
  leadsLastMonth: number;
  showsThisMonth: number;
  showsLastMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
}

export function Last30DaysCard({
  leadsThisMonth,
  leadsLastMonth,
  showsThisMonth,
  showsLastMonth,
  revenueThisMonth,
  revenueLastMonth,
}: Last30DaysCardProps) {
  const formatChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const metrics = [
    {
      label: "Novos contatos",
      value: leadsThisMonth,
      change: formatChange(leadsThisMonth, leadsLastMonth),
      isPositive: leadsThisMonth >= leadsLastMonth,
      icon: Users,
    },
    {
      label: "Shows realizados",
      value: showsThisMonth,
      change: formatChange(showsThisMonth, showsLastMonth),
      isPositive: showsThisMonth >= showsLastMonth,
      icon: Calendar,
    },
    {
      label: "Receita nos últimos",
      value: `R$ ${formatCurrency(revenueThisMonth)}`,
      change: formatChange(revenueThisMonth, revenueLastMonth),
      isPositive: revenueThisMonth >= revenueLastMonth,
      icon: DollarSign,
      suffix: "30 dias",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-primary/10">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground uppercase tracking-wide">
            Últimos 30 dias
          </h3>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="text-center">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 line-clamp-1">
                {metric.label}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {metric.value}
              </p>
              {metric.suffix && (
                <p className="text-[10px] text-muted-foreground">{metric.suffix}</p>
              )}
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {metric.isPositive ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={cn(
                  "text-[10px] sm:text-xs font-medium",
                  metric.isPositive ? "text-emerald-500" : "text-red-500"
                )}>
                  {metric.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
