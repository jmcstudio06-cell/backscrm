import { useEffect, useState } from "react";
import { Trophy, Crown, Medal, Award, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface BadgeRow {
  badge_type: string;
}

const BADGE_ICONS: Record<string, { icon: typeof Crown; color: string; label: string }> = {
  gold: { icon: Crown, color: "from-yellow-400 to-amber-500", label: "Ouro" },
  silver: { icon: Medal, color: "from-slate-300 to-slate-400", label: "Prata" },
  bronze: { icon: Award, color: "from-orange-400 to-amber-600", label: "Bronze" },
};

export function DashboardAchievementsCard() {
  const { user } = useAuth();
  const [position, setPosition] = useState<number | null>(null);
  const [totalArtists, setTotalArtists] = useState(0);
  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [showCount, setShowCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [rankRes, badgeRes] = await Promise.all([
        supabase.rpc("get_monthly_show_ranking"),
        supabase.from("artist_badges").select("badge_type").eq("user_id", user.id),
      ]);

      if (rankRes.data) {
        setTotalArtists(rankRes.data.length);
        const idx = rankRes.data.findIndex((r: any) => r.user_id === user.id);
        if (idx >= 0) {
          setPosition(idx + 1);
          setShowCount((rankRes.data[idx] as any).show_count || 0);
        }
      }
      if (badgeRes.data) setBadges(badgeRes.data as BadgeRow[]);
      setLoaded(true);
    };
    fetch();
  }, [user]);

  if (!loaded) return null;
  if (position === null && badges.length === 0) return null;

  const badgeCounts = badges.reduce<Record<string, number>>((acc, b) => {
    acc[b.badge_type] = (acc[b.badge_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <Link
      to="/ranking"
      className="block relative overflow-hidden rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 p-5 shadow-sm hover:shadow-md transition-all animate-fade-in group h-full"
    >
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl bg-amber-500/20" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground leading-none">
                Ranking e Selos
              </h3>
              <p className="text-[10px] uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 mt-1">
                Seu prestígio na comunidade
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
        </div>

        <div className="space-y-3">
          <div className="rounded-md bg-background/60 backdrop-blur border border-amber-500/20 p-3">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
              Posição mensal
            </p>
            {position ? (
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-foreground">#{position}</span>
                {totalArtists > 0 && (
                  <span className="text-xs text-muted-foreground">de {totalArtists} · {showCount} show{showCount !== 1 ? "s" : ""}</span>
                )}
              </div>
            ) : (
              <p className="text-sm font-semibold text-muted-foreground mt-1">— no ranking de shows</p>
            )}
          </div>

          <div className="rounded-md bg-background/60 backdrop-blur border border-amber-500/20 p-3">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
              Conquistas Recentes
            </p>
            {badges.length > 0 ? (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {(["gold", "silver", "bronze"] as const).map((t) => {
                  const count = badgeCounts[t] || 0;
                  if (count === 0) return null;
                  const cfg = BADGE_ICONS[t];
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={t}
                      className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded text-white text-xs font-bold bg-gradient-to-br shadow-sm",
                        cfg.color
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{count} {cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1.5">
                <Star className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Nenhum selo ainda. Feche mais shows para conquistar.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

