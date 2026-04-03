import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Flame, Star, Crown, Calendar, ChevronDown, ChevronLeft, ChevronRight, Music, X } from "lucide-react";
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

function toTitleCase(str: string) {
  return str.toLowerCase().split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function getBrasilNow() {
  const now = new Date();
  const brasilStr = now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" });
  return new Date(brasilStr);
}

const BADGE_CONFIG: Record<string, { label: string; icon: typeof Crown; gradient: string; border: string; textColor: string; iconBg: string; ring: string }> = {
  gold: {
    label: "Ouro",
    icon: Crown,
    gradient: "from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10",
    border: "border-yellow-300/40 dark:border-yellow-500/20",
    textColor: "text-yellow-600 dark:text-yellow-400",
    iconBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    ring: "ring-yellow-400/20",
  },
  silver: {
    label: "Prata",
    icon: Medal,
    gradient: "from-slate-50 to-gray-100 dark:from-slate-500/10 dark:to-gray-500/10",
    border: "border-slate-300/40 dark:border-slate-500/20",
    textColor: "text-slate-500 dark:text-slate-400",
    iconBg: "bg-gradient-to-br from-slate-300 to-slate-400",
    ring: "ring-slate-300/20",
  },
  bronze: {
    label: "Bronze",
    icon: Award,
    gradient: "from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-600/10",
    border: "border-orange-300/40 dark:border-orange-500/20",
    textColor: "text-amber-700 dark:text-amber-500",
    iconBg: "bg-gradient-to-br from-amber-600 to-amber-700",
    ring: "ring-amber-500/20",
  },
};

export default function RankingPage() {
  const { user } = useAuth();
  const brasilNow = getBrasilNow();
  const [selectedMonth, setSelectedMonth] = useState(brasilNow.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(brasilNow.getFullYear());
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [myShowCount, setMyShowCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [myBadges, setMyBadges] = useState<Badge[]>([]);
  const [selosOpen, setSelosOpen] = useState(false);
  const [hallOpen, setHallOpen] = useState(false);
  const [hallOfFame, setHallOfFame] = useState<{ user_name: string; count: number }[]>([]);
  const [hallLoading, setHallLoading] = useState(false);

  const isCurrentMonth = selectedMonth === brasilNow.getMonth() + 1 && selectedYear === brasilNow.getFullYear();

  const fetchRankingForMonth = useCallback(async (month: number, year: number) => {
    setRankingLoading(true);
    const { data } = await supabase.rpc("get_monthly_show_ranking_for_month", {
      target_month: month,
      target_year: year,
    });
    if (data) setRanking(data as RankingEntry[]);
    else setRanking([]);
    setRankingLoading(false);
  }, []);

  const goToPrevMonth = () => {
    if (selectedMonth === 1 && selectedYear <= 2026) return;
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    if (newMonth < 1) { newMonth = 12; newYear--; }
    if (newYear < 2026) return;
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    fetchRankingForMonth(newMonth, newYear);
  };

  const goToNextMonth = () => {
    if (isCurrentMonth) return;
    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    const now = getBrasilNow();
    if (newYear > now.getFullYear() || (newYear === now.getFullYear() && newMonth > now.getMonth() + 1)) return;
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    fetchRankingForMonth(newMonth, newYear);
  };

  useEffect(() => {
    const fetchAll = async () => {
      await supabase.rpc("archive_monthly_ranking");

      await fetchRankingForMonth(selectedMonth, selectedYear);

      if (user) {
        const now = getBrasilNow();
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
      }

      setLoading(false);
    };
    fetchAll();
  }, [user, fetchRankingForMonth, selectedMonth, selectedYear]);

  const openHallOfFame = async () => {
    setHallOpen(true);
    setHallLoading(true);
    const { data } = await supabase.rpc("get_alltime_show_totals");
    if (data) {
      setHallOfFame((data as RankingEntry[]).map((e) => ({
        user_name: e.user_name,
        count: Number(e.show_count),
      })));
    }
    setHallLoading(false);
  };

  const isInTop3 = isCurrentMonth && ranking.some((r) => r.user_id === user?.id);
  const minTop3Shows = ranking.length >= 3 ? ranking[2].show_count : ranking.length > 0 ? ranking[0].show_count : 1;
  const showsToTop3 = myShowCount !== null ? Math.max(0, minTop3Shows - myShowCount + 1) : null;

  return (
    <Layout title="Ranking" subtitle="Os artistas que mais vendem shows no mês">
      <div className="space-y-5">

        {/* Motivation / Celebration — only for current month */}
        {!loading && isCurrentMonth && !isInTop3 && myShowCount !== null && showsToTop3 !== null && showsToTop3 > 0 && (
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

        {/* Podium with month navigation */}
        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : (
          <div className="rounded-2xl bg-card border border-border/50 shadow-card p-5 sm:p-6">
            {/* Month Navigator */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={goToPrevMonth}
                className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-30"
                disabled={selectedMonth === 1 && selectedYear <= 2026}
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground capitalize min-w-[140px] text-center">
                {monthNames[selectedMonth]} {selectedYear}
              </p>
              <button
                onClick={goToNextMonth}
                className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-30"
                disabled={isCurrentMonth}
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {/* Podium */}
            {rankingLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : ranking.length === 0 ? (
              <div className="text-center py-10">
                <Trophy className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground mb-1">Nenhum show neste mês</p>
                <p className="text-xs text-muted-foreground">O ranking aparecerá quando houver shows confirmados</p>
              </div>
            ) : (
              <PodiumContent ranking={ranking} currentUserId={user?.id} />
            )}
          </div>
        )}

        {/* List */}
        {!loading && !rankingLoading && ranking.length > 0 && (
          <div className="space-y-2">
            {ranking.slice(0, 5).map((entry, i) => (
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
                    <p className="text-xs text-muted-foreground">Suas conquistas mensais</p>
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
                  Meus Troféus
                </h3>
                {myBadges.length === 0 ? (
                  <div className="rounded-xl bg-card border border-border/50 p-6 text-center">
                    <Trophy className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Nenhum troféu ainda</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Fique no TOP 3 do ranking mensal para ganhar!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {myBadges.map((badge) => {
                      const config = BADGE_CONFIG[badge.badge_type] || BADGE_CONFIG.gold;
                      const BadgeIcon = config.icon;
                      return (
                        <div key={badge.id} className={`rounded-xl bg-gradient-to-br ${config.gradient} border ${config.border} p-3 text-center`}>
                          <div className={`w-9 h-9 rounded-lg ${config.iconBg} flex items-center justify-center shadow mx-auto mb-2 ring-2 ${config.ring}`}>
                            <BadgeIcon className="w-4 h-4 text-white" />
                          </div>
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${config.textColor}`}>
                            Troféu {config.label}
                          </p>
                          <p className="text-xs font-bold text-foreground mt-0.5 flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {monthNames[badge.month]} {badge.year}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{badge.show_count} shows</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Hall of Fame — Top 5 by total shows this year */}
              {hallOfFame.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Hall da Fama {getBrasilNow().getFullYear()}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mb-2">Top 5 artistas com mais shows no ano</p>
                  <div className="space-y-1.5">
                    {hallOfFame.map((entry, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-card border border-border/50 px-3 py-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-extrabold text-primary">{i + 1}</span>
                        </div>
                        <p className="flex-1 text-sm font-semibold text-foreground truncate">{toTitleCase(entry.user_name)}</p>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/15">
                          <Music className="w-3 h-3 text-primary" />
                          <span className="text-xs font-bold text-primary">{entry.count}</span>
                          <span className="text-[9px] text-muted-foreground">shows</span>
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

/* ── Podium Content (no wrapper card) ── */
function PodiumContent({ ranking, currentUserId }: { ranking: RankingEntry[]; currentUserId?: string }) {
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
            <p className="text-xs font-bold text-foreground text-center truncate w-full leading-tight">{toTitleCase(entry.user_name)}</p>
            <p className={`text-lg sm:text-xl font-black ${color.text} leading-none mt-0.5`}>{entry.show_count}</p>
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">shows</p>
            <div className={`w-full ${heights[i]} rounded-t-xl bg-gradient-to-t ${color.bar} mt-2 flex items-start justify-center pt-2`}>
              <span className="text-white font-black text-lg">{positions[i]}º</span>
            </div>
          </div>
        );
      })}
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
        {toTitleCase(entry.user_name)}
        {isMe && <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Você</span>}
      </p>
      <p className={`text-base font-black ${config.text}`}>{entry.show_count}</p>
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground -ml-1">shows</p>
    </div>
  );
}
