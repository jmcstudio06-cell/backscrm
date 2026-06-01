import { Trophy, Medal, Award, Star, ChevronRight, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Badge {
  badge_type: string;
  month: number;
  year: number;
}

interface RankingDashboardCardProps {
  position: number | null;
  badges: Badge[];
}

const BADGE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  gold: { label: "Ouro", icon: Crown, color: "text-yellow-600", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  silver: { label: "Prata", icon: Medal, color: "text-slate-500", bg: "bg-slate-400/10", border: "border-slate-400/20" },
  bronze: { label: "Bronze", icon: Award, color: "text-amber-700", bg: "bg-amber-400/10", border: "border-amber-400/20" },
};

const monthNames = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function RankingDashboardCard({ position, badges }: RankingDashboardCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 p-6 shadow-card group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Ranking e Selos</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Seu prestígio na comunidade</p>
          </div>
        </div>
        <Link to="/ranking" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </Link>
      </div>

      <div className="space-y-6">
        {/* Current Position */}
        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-yellow-400/5 to-transparent border border-yellow-400/10 overflow-hidden group/pos">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/pos:opacity-20 transition-opacity">
            <Trophy className="w-16 h-16 text-yellow-600 rotate-12" />
          </div>
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600/80 mb-1">Posição Regional</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground">{position ? `#${position}` : "—"}</span>
              <span className="text-xs font-bold text-muted-foreground">no ranking de shows</span>
            </div>
            {position && position <= 10 && (
              <p className="text-[10px] font-bold text-yellow-600 mt-2 flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-600" /> Top 10 da cidade
              </p>
            )}
          </div>
        </div>

        {/* Recent Badges */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Conquistas Recentes</p>
          <div className="flex flex-wrap gap-2">
            {badges.length > 0 ? (
              badges.slice(0, 3).map((badge, idx) => {
                const config = BADGE_CONFIG[badge.badge_type] || BADGE_CONFIG.bronze;
                const Icon = config.icon;
                return (
                  <div 
                    key={idx}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all hover:scale-105 cursor-default",
                      config.bg, config.border
                    )}
                  >
                    <Icon className={cn("w-4 h-4", config.color)} />
                    <div className="flex flex-col">
                      <span className={cn("text-[10px] font-black uppercase leading-none", config.color)}>
                        {config.label}
                      </span>
                      <span className="text-[8px] font-bold text-muted-foreground mt-0.5">
                        {monthNames[badge.month]} {badge.year}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full py-4 text-center border border-dashed border-border rounded-2xl">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Nenhum selo ainda</p>
                <p className="text-[9px] text-muted-foreground mt-1 px-4">Feche mais shows para ganhar selos de consistência!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
