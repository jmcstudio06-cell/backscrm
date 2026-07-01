import { useState } from "react";
import { Trophy, Music, BarChart3, Diamond, Eye, EyeOff, Target, BadgeCheck, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactCareerHeroProps {
  artistName: string;
  avatarUrl?: string | null;
  totalRevenue: number;
  completedShowsCount: number;
  bestFee: { value: number; showTitle: string } | null;
  monthlyGoalProgress: number;
  monthlyGoalTarget?: number;
  monthlyGoalAchieved?: number;
  annualProjection: number;
  achievementsCount?: number;
}

function getCareerLevel(shows: number) {
  if (shows >= 100) return { label: "Lenda", color: "from-amber-400 to-orange-500" };
  if (shows >= 50) return { label: "Profissional", color: "from-fuchsia-500 to-purple-600" };
  if (shows >= 20) return { label: "Em crescimento", color: "from-primary to-accent" };
  if (shows >= 5) return { label: "Decolando", color: "from-cyan-500 to-blue-500" };
  return { label: "Iniciando", color: "from-emerald-400 to-teal-500" };
}

const fmtBRL = (v: number) =>
  `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function CompactCareerHero({
  artistName,
  avatarUrl,
  totalRevenue,
  completedShowsCount,
  bestFee,
  monthlyGoalProgress,
  monthlyGoalTarget = 0,
  monthlyGoalAchieved = 0,
  annualProjection,
  achievementsCount = 0,
}: CompactCareerHeroProps) {
  const [showValues, setShowValues] = useState(true);
  const averageFee = completedShowsCount > 0 ? totalRevenue / completedShowsCount : 0;
  const hidden = "••••••";
  const level = getCareerLevel(completedShowsCount);
  const progress = Math.min(100, Math.max(0, monthlyGoalProgress));

  return (
    <section className="relative overflow-hidden rounded-lg bg-card border border-border shadow-sm animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-accent/[0.04] pointer-events-none" />

      {/* Header row */}
      <div className="relative flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-border/60">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center shadow-md shrink-0 overflow-hidden bg-gradient-to-br",
            level.color
          )}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={artistName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-lg font-extrabold tracking-tight">
                {artistName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-none truncate">
                {artistName}
              </h2>
              <BadgeCheck className="w-5 h-5 text-primary shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Rocket className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Nível: <span className="text-foreground font-semibold">{level.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Meta mensal mini-card */}
        <div className="hidden sm:flex flex-col items-end gap-2 min-w-[180px]">
          <div className="flex items-center justify-between w-full gap-3">
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
              Meta Mensal
            </span>
            <span className="text-sm font-bold text-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {monthlyGoalTarget > 0 && (
            <span className="text-[11px] text-muted-foreground">
              Você realizou <strong className="text-foreground">{monthlyGoalAchieved}</strong> dos <strong className="text-foreground">{monthlyGoalTarget}</strong> shows da meta.
            </span>
          )}
        </div>

        <button
          onClick={() => setShowValues(!showValues)}
          className="absolute top-4 right-4 sm:hidden p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
        >
          {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Stats grid */}
      <div className="relative grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border/60">
        <StatTile
          icon={<Music className="w-4 h-4" />}
          label="Shows Realizados"
          value={String(completedShowsCount)}
          hint="Histórico total"
        />
        <StatTile
          icon={<BarChart3 className="w-4 h-4" />}
          label="Cachê Médio"
          value={showValues ? fmtBRL(averageFee) : `R$ ${hidden}`}
          hint="Por apresentação"
        />
        <StatTile
          icon={<Trophy className="w-4 h-4" />}
          label="Faturamento Total"
          value={showValues ? fmtBRL(totalRevenue) : `R$ ${hidden}`}
          hint="Carreira completa"
          highlight
        />
        <StatTile
          icon={<Diamond className="w-4 h-4" />}
          label="Melhor Cachê"
          value={bestFee ? (showValues ? fmtBRL(bestFee.value) : `R$ ${hidden}`) : "—"}
          hint={bestFee ? "Recorde pessoal" : "Sem dados"}
        />
      </div>

      {/* Footer row */}
      <div className="relative px-5 sm:px-6 py-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-muted/20">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Target className="w-3.5 h-3.5 text-primary" />
          <span>
            Projeção anual: <strong className="text-foreground">{showValues ? fmtBRL(annualProjection) : `R$ ${hidden}`}</strong>
          </span>
        </div>
        <button
          onClick={() => setShowValues(!showValues)}
          className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showValues ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          {showValues ? "Ocultar valores" : "Mostrar valores"}
        </button>
      </div>
    </section>
  );
}

function StatTile({
  icon,
  label,
  value,
  hint,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <div className="px-4 sm:px-5 py-4 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-7 h-7 rounded-md flex items-center justify-center",
          highlight
            ? "bg-gradient-to-br from-primary to-accent text-white"
            : "bg-muted text-muted-foreground"
        )}>
          {icon}
        </div>
      </div>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
        {label}
      </p>
      <p className={cn(
        "text-lg sm:text-xl font-bold leading-tight tracking-tight",
        highlight ? "text-primary" : "text-foreground"
      )}>
        {value}
      </p>
      {hint && (
        <p className="text-[11px] text-muted-foreground -mt-0.5">{hint}</p>
      )}
    </div>
  );
}
