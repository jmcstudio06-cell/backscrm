import { Music, TrendingUp, Award, BarChart3 } from "lucide-react";

interface TotalRevenueHeroProps {
  totalRevenue: number;
  completedShowsCount: number;
  growthPercentage: number;
}

export function TotalRevenueHero({
  totalRevenue,
  completedShowsCount,
  growthPercentage,
}: TotalRevenueHeroProps) {
  const averageFee = completedShowsCount > 0 ? totalRevenue / completedShowsCount : 0;

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const isPositiveGrowth = growthPercentage > 0;
  const hasGrowthData = !isNaN(growthPercentage) && isFinite(growthPercentage);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 animate-fade-in">
      {/* Title + Value */}
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Music className="w-5 h-5 text-primary" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          💰 Total gerado pela sua música
        </span>
      </div>
      <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-3 mb-5">
        R$ {formatCurrency(totalRevenue)}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2.5">
          <Award className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-lg font-bold text-foreground leading-tight">{completedShowsCount}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Shows realizados</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-lg font-bold text-foreground leading-tight">R$ {formatCurrency(averageFee)}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Cachê médio</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-4 h-4 text-primary shrink-0" />
          <div>
            <p className="text-lg font-bold text-foreground leading-tight">
              {hasGrowthData
                ? `${isPositiveGrowth ? "+" : ""}${growthPercentage.toFixed(0)}%`
                : "—"
              }
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">Crescimento</p>
          </div>
        </div>
      </div>
    </div>
  );
}
