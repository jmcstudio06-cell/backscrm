import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Flame, Star, Crown, Calendar, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface RankingEntry {
  user_id: string;
  user_name: string;
  show_count: number;
}

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

export default function RankingPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [myShowCount, setMyShowCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [myBadges, setMyBadges] = useState<Badge[]>([]);
  const [hallOfFame, setHallOfFame] = useState<{ user_name: string; count: number }[]>([]);
  const [selosOpen, setSelosOpen] = useState(false);

  const monthName = format(new Date(), "MMMM yyyy", { locale: ptBR });

  useEffect(() => {
    const fetchAll = async () => {
      // Ranking
      const { data } = await supabase.rpc("get_monthly_show_ranking");
      if (data) setRanking(data as RankingEntry[]);

      if (user) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
        const { count } = await supabase
          .from("shows")
          .select("*", { count: "exact", head: true })
          .in("status", ["confirmed", "completed", "scheduled"])
          .gte("date", startOfMonth)
          .lte("date", endOfMonth);
        setMyShowCount(count || 0);
      }

      // Badges
      const { data: allBadges } = await supabase
        .from("artist_badges")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (allBadges) {
        if (user) setMyBadges(allBadges.filter((b: Badge) => b.user_id === user.id));

        const countMap: Record<string, number> = {};
        allBadges.forEach((b: Badge) => {
          countMap[b.user_id] = (countMap[b.user_id] || 0) + 1;
        });

        const userIds = Object.keys(countMap);
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, artist_name, name")
            .in("user_id", userIds);

          setHallOfFame(
            userIds
              .map((uid) => {
                const p = profiles?.find((pr) => pr.user_id === uid);
                return { user_name: p?.artist_name || p?.name || "Artista", count: countMap[uid] };
              })
              .sort((a, b) => b.count - a.count)
          );
        }
      }

      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const isInTop3 = ranking.some((r) => r.user_id === user?.id);
  const minTop3Shows = ranking.length >= 3 ? ranking[2].show_count : ranking.length > 0 ? ranking[0].show_count : 1;
  const showsToTop3 = myShowCount !== null ? Math.max(0, minTop3Shows - myShowCount + 1) : null;

  return (
    <Layout title="Ranking" subtitle="Os artistas que mais vendem shows no mês">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Motivation / Celebration */}
        {!loading && !isInTop3 && myShowCount !== null && showsToTop3 !== null && showsToTop3 > 0 && (
          <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
            <Flame className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">
              Você está a <strong>{showsToTop3} {showsToTop3 === 1 ? "show" : "shows"}</strong> do TOP 3 — seus shows este mês: <strong>{myShowCount}</strong>
            </p>
          </div>
        )}
        {!loading && isInTop3 && (
          <div className="flex items-center gap-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15 px-4 py-3">
            <Star className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-foreground">
              Parabéns! Você está no <strong>TOP 3</strong> este mês!
            </p>
          </div>
        )}

        {/* Podium */}
        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : ranking.length === 0 ? (
          <EmptyState />
        ) : (
          <PodiumView ranking={ranking} currentUserId={user?.id} />
        )}

        {/* List */}
        {!loading && ranking.length > 0 && (
          <div className="space-y-2">
            {ranking.map((entry, i) => (
              <ListItem key={entry.user_id} entry={entry} position={i + 1} isMe={entry.user_id === user?.id} />
            ))}
          </div>
        )}

        {/* Selos — Collapsible */}
        {!loading && (
          <Collapsible open={selosOpen} onOpenChange={setSelosOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between rounded-2xl bg-gradient-to-br from-yellow-500/10 via-amber-400/5 to-primary/10 border border-yellow-500/20 px-5 py-4 hover:from-yellow-500/15 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">Sala de Troféus</p>
                    <p className="text-xs text-muted-foreground">Selos de conquista e Hall da Fama</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${selosOpen ? "rotate-180" : ""}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-4">
              {/* My Badges */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" />
                  Meus Selos
                </h3>
                {myBadges.length === 0 ? (
                  <div className="rounded-xl bg-card border border-border/50 p-6 text-center">
                    <Trophy className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Nenhum selo ainda</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Fique em 1º lugar no ranking mensal para ganhar!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {myBadges.map((badge) => (
                      <div key={badge.id} className="rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10 border border-yellow-300/40 dark:border-yellow-500/20 p-3 text-center">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow mx-auto mb-2 ring-2 ring-yellow-400/20">
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">Top Vendedor</p>
                        <p className="text-xs font-bold text-foreground mt-0.5 flex items-center justify-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {monthNames[badge.month]} {badge.year}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{badge.show_count} shows</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hall of Fame */}
              {hallOfFame.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Hall da Fama
                  </h3>
                  <div className="space-y-1.5">
                    {hallOfFame.map((entry, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-card border border-border/50 px-3 py-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-extrabold text-primary">{i + 1}</span>
                        </div>
                        <p className="flex-1 text-sm font-semibold text-foreground truncate">{entry.user_name}</p>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/15">
                          <Crown className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                          <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">{entry.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </Layout>
  );
}

/* ── Podium ── */
function PodiumView({ ranking, currentUserId }: { ranking: RankingEntry[]; currentUserId?: string }) {
  const ordered = [ranking[1], ranking[0], ranking[2]].filter(Boolean);
  const heights = ["h-28", "h-40", "h-24"];
  const icons = [Medal, Trophy, Award];
  const colors = [
    { bar: "from-slate-300 to-slate-400", icon: "bg-slate-400", text: "text-slate-500" },
    { bar: "from-yellow-400 to-amber-500", icon: "bg-amber-500", text: "text-yellow-600 dark:text-yellow-400" },
    { bar: "from-amber-600 to-amber-700", icon: "bg-amber-700", text: "text-amber-600" },
  ];
  const positions = [2, 1, 3];

  return (
    <div className="rounded-2xl bg-card border border-border/50 shadow-card p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center mb-6 capitalize">
        {format(new Date(), "MMMM yyyy", { locale: ptBR })}
      </p>
      <div className="flex items-end justify-center gap-3 sm:gap-5">
        {ordered.map((entry, i) => {
          if (!entry) return null;
          const Icon = icons[i];
          const color = colors[i];
          const isMe = entry.user_id === currentUserId;
          return (
            <div key={entry.user_id} className="flex flex-col items-center w-24 sm:w-28">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${color.icon} flex items-center justify-center mb-2 shadow-md ${isMe ? "ring-2 ring-primary ring-offset-2 ring-offset-card" : ""}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <p className="text-xs font-bold text-foreground text-center truncate w-full leading-tight">{entry.user_name}</p>
              <p className={`text-lg sm:text-xl font-black ${color.text} leading-none mt-0.5`}>{entry.show_count}</p>
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground">shows</p>
              <div className={`w-full ${heights[i]} rounded-t-xl bg-gradient-to-t ${color.bar} mt-2 flex items-start justify-center pt-2`}>
                <span className="text-white font-black text-lg">{positions[i]}º</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── List Item ── */
function ListItem({ entry, position, isMe }: { entry: RankingEntry; position: number; isMe: boolean }) {
  const config = [
    { text: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10" },
    { text: "text-slate-500 dark:text-slate-400", bg: "bg-slate-400/10" },
    { text: "text-amber-600 dark:text-amber-500", bg: "bg-amber-500/10" },
  ][position - 1] || { text: "text-muted-foreground", bg: "bg-muted/50" };

  return (
    <div className={`flex items-center gap-3 rounded-xl bg-card border px-4 py-3 transition-all ${isMe ? "border-primary/30 shadow-md" : "border-border/50 shadow-sm"}`}>
      <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
        <span className={`text-sm font-black ${config.text}`}>{position}</span>
      </div>
      <p className="flex-1 text-sm font-semibold text-foreground truncate">
        {entry.user_name}
        {isMe && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Você</span>}
      </p>
      <p className={`text-base font-black ${config.text}`}>{entry.show_count}</p>
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground -ml-1">shows</p>
    </div>
  );
}

/* ── Empty ── */
function EmptyState() {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-10 text-center shadow-card">
      <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
        <Trophy className="w-6 h-6 text-muted-foreground/40" />
      </div>
      <p className="text-sm font-semibold text-foreground mb-1">Nenhum show agendado este mês</p>
      <p className="text-xs text-muted-foreground">O ranking aparecerá quando houver shows confirmados</p>
    </div>
  );
}
