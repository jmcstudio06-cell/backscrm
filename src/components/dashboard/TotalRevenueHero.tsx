import { Music, TrendingUp, Award, BarChart3, Diamond, Trophy } from "lucide-react";

interface TotalRevenueHeroProps {
  totalRevenue: number;
  completedShowsCount: number;
  growthPercentage: number;
  bestFee: { value: number; showTitle: string } | null;
  bestMonth: { month: string; value: number } | null;
}

export function TotalRevenueHero({
  totalRevenue,
  completedShowsCount,
  growthPercentage,
  bestFee,
  bestMonth,
}: TotalRevenueHeroProps) {
  const averageFee = completedShowsCount > 0 ? totalRevenue / completedShowsCount : 0;

  const fmt = (value: number) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isPositiveGrowth = growthPercentage > 0;
  const hasGrowthData = !isNaN(growthPercentage) && isFinite(growthPercentage);

  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-2xl p-5 sm:p-6 animate-fade-in">
      {/* Theme color smoke/glow effect */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-primary/6 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-40 bg-primary/4 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
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
          R$ {fmt(totalRevenue)}
        </p>

        {/* Main stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
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
              <p className="text-lg font-bold text-foreground leading-tight">R$ {fmt(averageFee)}</p>
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

        {/* Highlight stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Best fee */}
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl p-3.5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Diamond className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-tight">💎 Maior cachê recebido</p>
              {bestFee ? (
                <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                  R$ {fmt(bestFee.value)}{" "}
                  <span className="font-normal text-muted-foreground text-xs truncate">
                    — {bestFee.showTitle}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground leading-tight mt-0.5">Nenhum show finalizado</p>
              )}
            </div>
          </div>

          {/* Best month */}
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl p-3.5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-tight">🏆 Melhor mês da carreira</p>
              {bestMonth ? (
                <p className="text-sm font-bold text-foreground leading-tight mt-0.5 capitalize">
                  {bestMonth.month}{" "}
                  <span className="font-normal text-muted-foreground text-xs">
                    — R$ {fmt(bestMonth.value)}
                  </span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground leading-tight mt-0.5">Sem dados ainda</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
