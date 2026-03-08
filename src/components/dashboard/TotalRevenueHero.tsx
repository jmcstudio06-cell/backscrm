import { Music, TrendingUp, Award, BarChart3, Diamond, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface TotalRevenueHeroProps {
  totalRevenue: number;
  completedShowsCount: number;
  growthPercentage: number;
  bestFee: { value: number; showTitle: string } | null;
  bestMonth: { month: string; value: number } | null;
  annualProjection: number;
}

export function TotalRevenueHero({
  totalRevenue,
  completedShowsCount,
  growthPercentage,
  bestFee,
  bestMonth,
  annualProjection,
}: TotalRevenueHeroProps) {
  const averageFee = completedShowsCount > 0 ? totalRevenue / completedShowsCount : 0;

  const fmt = (value: number) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isPositiveGrowth = growthPercentage > 0;
  const hasGrowthData = !isNaN(growthPercentage) && isFinite(growthPercentage);

  return (
    <div className="relative overflow-hidden bg-card border border-border rounded-2xl animate-fade-in">
      {/* Theme color ambient glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/8 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/6 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10 p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Music className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Total gerado pela sua música
          </span>
        </div>

        {/* Main value */}
        <p className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-none">
          R$ {fmt(totalRevenue)}
        </p>

        {/* Divider */}
        <div className="h-px bg-border my-5" />

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          <Stat
            icon={<Award className="w-4 h-4" />}
            value={String(completedShowsCount)}
            label="Shows realizados"
          />
          <Stat
            icon={<BarChart3 className="w-4 h-4" />}
            value={`R$ ${fmt(averageFee)}`}
            label="Cachê médio"
          />
          <Stat
            icon={<TrendingUp className="w-4 h-4" />}
            value={
              hasGrowthData
                ? `${isPositiveGrowth ? "+" : ""}${growthPercentage.toFixed(0)}%`
                : "—"
            }
            label="Crescimento mensal"
          />
        </div>

        {/* Annual projection highlight */}
        {annualProjection > 0 && (
          <>
            <div className="h-px bg-border my-5" />
            <div className="relative overflow-hidden rounded-xl bg-primary/10 border border-primary/20 p-4">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative flex items-center gap-3">
                <div className="p-2.5 bg-primary/15 rounded-xl">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-primary/70 font-medium">
                    Projeção anual no ritmo atual
                  </p>
                  <p className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
                    R$ {fmt(annualProjection)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Best month highlight */}
        {bestMonth && (
          <>
            <div className="h-px bg-border my-5" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Melhor mês da carreira
                </p>
                <p className="text-sm font-bold text-foreground capitalize">
                  {bestMonth.month}
                  <span className="font-normal text-muted-foreground ml-1.5">
                    — R$ {fmt(bestMonth.value)}
                  </span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
  truncateLabel,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  truncateLabel?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-primary">{icon}</div>
      <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
      <p className={cn(
        "text-[11px] text-muted-foreground leading-tight",
        truncateLabel && "truncate"
      )}>
        {label}
      </p>
    </div>
  );
}
