import { useMemo } from "react";
import { Music, TrendingUp, Award, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 sm:p-8 text-primary-foreground animate-fade-in">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm">
            <Music className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-primary-foreground/80 uppercase tracking-wider">
            💰 Total gerado pela sua música
          </span>
        </div>

        {/* Main value */}
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
          R$ {formatCurrency(totalRevenue)}
        </h2>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-xs text-primary-foreground/70">Shows realizados</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{completedShowsCount}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-xs text-primary-foreground/70">Cachê médio</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold">
              R$ {formatCurrency(averageFee)}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary-foreground/70" />
              <span className="text-xs text-primary-foreground/70">Crescimento</span>
            </div>
            <p className={cn("text-xl sm:text-2xl font-bold")}>
              {hasGrowthData
                ? `${isPositiveGrowth ? "+" : ""}${growthPercentage.toFixed(0)}%`
                : "—"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
