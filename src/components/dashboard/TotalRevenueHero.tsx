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
    <div className="space-y-4 animate-fade-in">
      {/* Main revenue card */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 sm:p-6 shadow-card group hover:shadow-elevated transition-all duration-500">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 opacity-50" />
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-primary to-accent group-hover:opacity-40 transition-opacity duration-500" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-primary to-accent">
                <Music className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Total gerado pela sua música
              </span>
            </div>
          </div>

          {/* Main value */}
          <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-none mb-5">
            R$ {fmt(totalRevenue)}
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            <MiniStat
              icon={<Award className="w-3.5 h-3.5" />}
              value={String(completedShowsCount)}
              label="Shows realizados"
              gradient="from-primary to-accent"
            />
            <MiniStat
              icon={<BarChart3 className="w-3.5 h-3.5" />}
              value={`R$ ${fmt(averageFee)}`}
              label="Cachê médio"
              gradient="from-primary to-accent"
            />
            <MiniStat
              icon={<TrendingUp className="w-3.5 h-3.5" />}
              value={
                hasGrowthData
                  ? `${isPositiveGrowth ? "+" : ""}${growthPercentage.toFixed(0)}%`
                  : "—"
              }
              label="Crescimento mensal"
              gradient="from-primary to-accent"
              highlight={hasGrowthData && isPositiveGrowth}
            />
          </div>
        </div>
      </div>

      {/* Annual projection card */}
      {annualProjection > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 p-4 sm:p-5 shadow-card hover:shadow-elevated transition-all duration-500 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-primary to-accent" />
          <div className="relative flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-primary to-accent shrink-0">
              <Target className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary/70 font-bold">
                Projeção anual no ritmo atual
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
                R$ {fmt(annualProjection)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Best fee & Best month cards row */}
      {(bestFee || bestMonth) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bestFee && (
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-4 sm:p-5 shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-accent/4 opacity-50" />
              <div className="relative flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br from-primary to-accent shrink-0">
                  <Diamond className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Seu maior cachê até hoje
                  </p>
                  <p className="text-base font-bold text-foreground leading-snug">
                    R$ {fmt(bestFee.value)}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {bestFee.showTitle}
                  </p>
                </div>
              </div>
            </div>
          )}
          {bestMonth && (
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-4 sm:p-5 shadow-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-accent/4 opacity-50" />
              <div className="relative flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br from-primary to-accent shrink-0">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Melhor mês da carreira
                  </p>
                  <p className="text-base font-bold text-foreground leading-snug capitalize">
                    {bestMonth.month}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    R$ {fmt(bestMonth.value)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniStat({
  icon,
  value,
  label,
  gradient,
  highlight,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  gradient: string;
  highlight?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-muted/30 border border-border/30 p-3 space-y-1.5">
      <div className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-sm",
        gradient
      )}>
        <span className="text-white">{icon}</span>
      </div>
      <p className={cn(
        "text-base sm:text-lg font-bold leading-tight tracking-tight",
        highlight ? "text-success" : "text-foreground"
      )}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground leading-tight font-semibold">{label}</p>
    </div>
  );
}
