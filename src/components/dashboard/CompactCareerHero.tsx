import { useState } from "react";
import { Trophy, Music, BarChart3, Diamond, Eye, EyeOff, Sparkles, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactCareerHeroProps {
  artistName: string;
  totalRevenue: number;
  completedShowsCount: number;
  bestFee: { value: number; showTitle: string } | null;
  monthlyGoalProgress: number; // 0-100
  annualProjection: number;
}

function getCareerLevel(shows: number) {
  if (shows >= 100) return { label: "Lenda", color: "from-amber-400 to-orange-500" };
  if (shows >= 50) return { label: "Profissional", color: "from-fuchsia-500 to-purple-600" };
  if (shows >= 20) return { label: "Em crescimento", color: "from-primary to-accent" };
  if (shows >= 5) return { label: "Decolando", color: "from-cyan-500 to-blue-500" };
  return { label: "Começando agora", color: "from-emerald-400 to-teal-500" };
}

export function CompactCareerHero({
  artistName,
  totalRevenue,
  completedShowsCount,
  bestFee,
  monthlyGoalProgress,
  annualProjection,
}: CompactCareerHeroProps) {
  const [showValues, setShowValues] = useState(true);
  const averageFee = completedShowsCount > 0 ? totalRevenue / completedShowsCount : 0;
  const hidden = "••••";
  const level = getCareerLevel(completedShowsCount);

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtShort = (v: number) => {
    if (v >= 1000) return `R$ ${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
    return `R$ ${Math.round(v)}`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-4 sm:p-5 shadow-card animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/8 opacity-70" />
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-30 bg-gradient-to-br from-primary to-accent" />

      <div className="relative">
        {/* Top row: artist + level + toggle */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg shrink-0 bg-gradient-to-br",
              level.color
            )}>
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground leading-none mb-1">
                Sua carreira
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-foreground leading-none truncate">
                  {artistName}
                </h2>
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r",
                  level.color
                )}>
                  <Sparkles className="w-2.5 h-2.5" />
                  {level.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowValues(!showValues)}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground shrink-0"
            aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
          >
            {showValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Stats: 4 inline tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <StatTile
            icon={<Trophy className="w-3.5 h-3.5" />}
            label="Total da carreira"
            value={showValues ? fmtShort(totalRevenue) : `R$ ${hidden}`}
            highlight
          />
          <StatTile
            icon={<Music className="w-3.5 h-3.5" />}
            label="Shows realizados"
            value={String(completedShowsCount)}
          />
          <StatTile
            icon={<BarChart3 className="w-3.5 h-3.5" />}
            label="Cachê médio"
            value={showValues ? fmtShort(averageFee) : `R$ ${hidden}`}
          />
          <StatTile
            icon={<Diamond className="w-3.5 h-3.5" />}
            label="Melhor cachê"
            value={bestFee ? (showValues ? fmtShort(bestFee.value) : `R$ ${hidden}`) : "—"}
          />
        </div>

        {/* Bottom row: goal % + annual projection */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-primary/5 border border-primary/15">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary to-accent shrink-0">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold leading-none">
                Meta do mês
              </p>
              <p className="text-sm font-extrabold text-foreground leading-none mt-1">
                {Math.round(monthlyGoalProgress)}%
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-success/5 border border-success/15">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-success to-emerald-500 shrink-0">
              <BarChart3 className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold leading-none">
                Previsão {new Date().getFullYear()}
              </p>
              <p className="text-sm font-extrabold text-foreground leading-none mt-1 truncate">
                {showValues ? `R$ ${fmt(annualProjection)}` : `R$ ${hidden}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-xl border p-2.5 sm:p-3 flex flex-col gap-1",
      highlight
        ? "bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20"
        : "bg-muted/30 border-border/30"
    )}>
      <div className="flex items-center gap-1.5">
        <div className={cn(
          "w-5 h-5 rounded-md flex items-center justify-center",
          highlight ? "bg-gradient-to-br from-primary to-accent text-white" : "bg-muted text-muted-foreground"
        )}>
          {icon}
        </div>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold leading-none truncate">
          {label}
        </p>
      </div>
      <p className={cn(
        "text-base sm:text-lg font-extrabold leading-tight tracking-tight",
        highlight ? "text-primary" : "text-foreground"
      )}>
        {value}
      </p>
    </div>
  );
}
