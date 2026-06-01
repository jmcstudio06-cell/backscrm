import { Music, Trophy, Target, Star, TrendingUp, Award, Flame, Zap, Rocket, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";

interface CareerVideogameHeaderProps {
  completedShowsThisMonth: number;
  currentShowGoalTarget: number;
  totalAllTimeRevenue: number;
  completedShowsAllTime: number;
  revenueGrowth: number;
  rankingPosition: number | null;
  myBadgesCount: number;
}

export function CareerVideogameHeader({
  completedShowsThisMonth,
  currentShowGoalTarget,
  totalAllTimeRevenue,
  completedShowsAllTime,
  revenueGrowth,
  rankingPosition,
  myBadgesCount,
}: CareerVideogameHeaderProps) {
  const { profile, loading } = useProfile();

  const avgCachet = completedShowsAllTime > 0 ? totalAllTimeRevenue / completedShowsAllTime : 0;
  
  const progress = currentShowGoalTarget > 0 
    ? Math.min(Math.round((completedShowsThisMonth / currentShowGoalTarget) * 100), 100) 
    : 0;

  const getCareerLevel = () => {
    if (revenueGrowth > 50 || progress > 80) return { label: "Acelerando", color: "text-success", icon: Flame, bg: "bg-success/10", border: "border-success/20" };
    if (revenueGrowth > 0 || progress > 40) return { label: "Em crescimento", color: "text-primary", icon: TrendingUp, bg: "bg-primary/10", border: "border-primary/20" };
    if (completedShowsThisMonth === 0) return { label: "Iniciando", color: "text-muted-foreground", icon: Rocket, bg: "bg-muted", border: "border-border" };
    return { label: "Estável", color: "text-warning", icon: Target, bg: "bg-warning/10", border: "border-warning/20" };
  };

  const level = getCareerLevel();
  const LevelIcon = level.icon;

  const fmt = (val: number) => val.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  if (loading) return <Skeleton className="h-48 w-full rounded-3xl" />;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-card border border-border/50 p-6 sm:p-8 shadow-card group animate-fade-in">
      {/* Background Video-gamey effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-60" />
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-20 bg-primary animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-[100px] opacity-20 bg-accent animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10">
        {/* Top Header: Profile & Career Level */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-xl group-hover:scale-105 transition-transform duration-500">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-black">
                    {profile?.name?.charAt(0) || "A"}
                  </div>
                )}
              </div>
              {rankingPosition && rankingPosition <= 10 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center shadow-lg ring-2 ring-background animate-bounce-soft">
                  <Trophy className="w-4 h-4 text-yellow-900" />
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
                {profile?.name || "Artista"}
                <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10" />
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border", level.bg, level.color, level.border)}>
                  <LevelIcon className="w-3.5 h-3.5" />
                  Nível: {level.label}
                </div>
                {rankingPosition && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/10 text-yellow-600 border border-yellow-400/20">
                    <Trophy className="w-3.5 h-3.5" />
                    #{rankingPosition} Regional
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Goal Progress (Simplified) */}
          <div className="bg-secondary/40 backdrop-blur-md border border-border/50 rounded-2xl p-4 min-w-[240px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meta Mensal</span>
              <span className="text-xs font-bold text-foreground">{progress}%</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium italic">
              Você realizou <span className="text-foreground font-bold">{completedShowsThisMonth}</span> dos <span className="text-foreground font-bold">{currentShowGoalTarget}</span> shows da meta.
            </p>
          </div>
        </div>

        {/* Stats Grid - Career videogame style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GameStat 
            icon={<Music className="w-4 h-4" />}
            label="Shows Realizados"
            value={String(completedShowsAllTime)}
            sublabel="Histórico total"
          />
          <GameStat 
            icon={<Award className="w-4 h-4" />}
            label="Cachê Médio"
            value={`R$ ${fmt(avgCachet)}`}
            sublabel="Por apresentação"
          />
          <GameStat 
            icon={<TrendingUp className="w-4 h-4" />}
            label="Faturamento Total"
            value={`R$ ${fmt(totalAllTimeRevenue)}`}
            sublabel="Carreira completa"
          />
          <GameStat 
            icon={<Star className="w-4 h-4" />}
            label="Conquistas"
            value={String(myBadgesCount)}
            sublabel="Selos e prêmios"
          />
        </div>
      </div>
    </div>
  );
}

function GameStat({ icon, label, value, sublabel }: { icon: React.ReactNode, label: string, value: string, sublabel: string }) {
  return (
    <div className="bg-secondary/30 hover:bg-secondary/50 border border-border/40 rounded-2xl p-4 transition-all duration-300 group/stat">
      <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center mb-3 shadow-inner text-primary group-hover/stat:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-black text-foreground tracking-tight leading-none mb-1">{value}</p>
      <p className="text-[9px] text-muted-foreground font-medium">{sublabel}</p>
    </div>
  );
}
