import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Crown, Award, Calendar } from "lucide-react";

interface Badge {
  id: string;
  user_id: string;
  badge_type: string;
  month: number;
  year: number;
  show_count: number;
  created_at: string;
}

const monthNames = [
  "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function SelosPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [myBadges, setMyBadges] = useState<Badge[]>([]);
  const [allBadges, setAllBadges] = useState<{ user_name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      // Fetch all badges to build the leaderboard
      const { data: allData } = await supabase
        .from("artist_badges")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (allData) {
        // Get user's own badges
        if (user) {
          setMyBadges(allData.filter((b: Badge) => b.user_id === user.id));
        }

        // Build leaderboard: count badges per user
        const countMap: Record<string, number> = {};
        allData.forEach((b: Badge) => {
          countMap[b.user_id] = (countMap[b.user_id] || 0) + 1;
        });

        // Need to fetch names
        const userIds = Object.keys(countMap);
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, artist_name, name")
            .in("user_id", userIds);

          const leaderboard = userIds
            .map((uid) => {
              const p = profiles?.find((pr) => pr.user_id === uid);
              return {
                user_name: p?.artist_name || p?.name || "Artista",
                count: countMap[uid],
              };
            })
            .sort((a, b) => b.count - a.count);

          setAllBadges(leaderboard);
        }
      }

      setLoading(false);
    };
    fetchBadges();
  }, [user]);

  return (
    <Layout title="Selos" subtitle="Sala de troféus — seus selos de conquista">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500/15 via-amber-400/5 to-primary/10 border border-yellow-500/20 p-6 sm:p-8">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-xl flex-shrink-0">
              <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Sala de Troféus</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Cada 1º lugar no ranking mensal garante um selo exclusivo
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* My Badges */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Meus Selos
              </h3>
              {myBadges.length === 0 ? (
                <div className="rounded-2xl bg-card border border-border/50 p-8 sm:p-10 text-center shadow-card">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="text-base font-semibold text-foreground mb-1">Nenhum selo ainda</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Fique em 1º lugar no ranking mensal para ganhar seu primeiro selo!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {myBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className="rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10 border border-yellow-300/50 dark:border-yellow-500/30 p-4 text-center shadow-card hover:shadow-elevated transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg mx-auto mb-3 ring-4 ring-yellow-400/30">
                        <Crown className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
                        Top Vendedor
                      </p>
                      <p className="text-sm font-bold text-foreground mt-1 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {monthNames[badge.month]} {badge.year}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {badge.show_count} shows
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* All-time Leaderboard */}
            {allBadges.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Hall da Fama — Quem tem mais selos
                </h3>
                <div className="space-y-2">
                  {allBadges.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 rounded-2xl bg-card border border-border/50 p-4 shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-extrabold text-primary">{index + 1}</span>
                      </div>
                      <p className="flex-1 font-semibold text-foreground truncate">{entry.user_name}</p>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <Crown className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{entry.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
