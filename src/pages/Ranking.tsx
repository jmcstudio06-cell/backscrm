import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Calendar, Flame, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RankingEntry {
  user_id: string;
  user_name: string;
  show_count: number;
}

const podiumConfig = [
  {
    icon: Trophy,
    gradient: "from-yellow-400 to-amber-500",
    ring: "ring-yellow-400/30",
    bg: "bg-yellow-500/10",
    text: "text-yellow-600 dark:text-yellow-400",
    label: "1º Lugar",
    size: "w-20 h-20",
    iconSize: "w-9 h-9",
  },
  {
    icon: Medal,
    gradient: "from-gray-300 to-gray-400",
    ring: "ring-gray-300/30",
    bg: "bg-gray-400/10",
    text: "text-gray-500 dark:text-gray-400",
    label: "2º Lugar",
    size: "w-16 h-16",
    iconSize: "w-7 h-7",
  },
  {
    icon: Award,
    gradient: "from-amber-600 to-amber-700",
    ring: "ring-amber-600/30",
    bg: "bg-amber-600/10",
    text: "text-amber-700 dark:text-amber-500",
    label: "3º Lugar",
    size: "w-14 h-14",
    iconSize: "w-6 h-6",
  },
];

export default function RankingPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [myShowCount, setMyShowCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const monthName = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase.rpc("get_monthly_show_ranking");
      if (!error && data) {
        setRanking(data as RankingEntry[]);
      }

      // Get current user's show count for motivation message
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

      setLoading(false);
    };
    fetchRanking();
  }, [user]);

  // Calculate motivation message
  const isInTop3 = ranking.some((r) => r.user_id === user?.id);
  const minTop3Shows = ranking.length >= 3 ? ranking[2].show_count : ranking.length > 0 ? ranking[0].show_count : 1;
  const showsToTop3 = myShowCount !== null ? Math.max(0, minTop3Shows - myShowCount + 1) : null;

  return (
    <Layout title="Ranking" subtitle="Os artistas que mais vendem shows no mês">
      <div className="space-y-6">
        {/* Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-card p-6 sm:p-8">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Top 3 do Mês</h2>
                <p className="text-sm text-muted-foreground capitalize flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {monthName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Motivation Banner */}
        {!loading && !isInTop3 && myShowCount !== null && showsToTop3 !== null && showsToTop3 > 0 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-5">
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg flex-shrink-0">
                <Flame className="w-6 h-6 text-primary-foreground animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-foreground">
                  Você está a {showsToTop3} {showsToTop3 === 1 ? "show" : "shows"} de entrar no TOP 3!
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Seus shows este mês: <strong className="text-foreground">{myShowCount}</strong> — Continue vendendo!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* In Top 3 Celebration */}
        {!loading && isInTop3 && (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-yellow-500/10 border border-yellow-500/20 p-5">
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-yellow-500/10 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-foreground">
                  Parabéns! Você está no TOP 3 este mês! 🎉
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Continue assim — você é referência no Backstage Pro!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ranking Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : ranking.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-9 h-9 text-muted-foreground/40" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1">Nenhum show agendado este mês</p>
            <p className="text-sm text-muted-foreground">
              O ranking aparecerá quando houver shows confirmados ou agendados
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {ranking.map((entry, index) => {
              const config = podiumConfig[index];
              const Icon = config.icon;
              const isMe = entry.user_id === user?.id;

              return (
                <div
                  key={entry.user_id}
                  className={`relative overflow-hidden rounded-2xl bg-card border shadow-card p-5 sm:p-6 transition-all hover:shadow-elevated ${
                    isMe ? "border-primary/40 ring-2 ring-primary/20" : "border-border/50"
                  }`}
                >
                  {isMe && (
                    <div className="absolute top-2 right-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Você
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 sm:gap-6">
                    {/* Position Badge */}
                    <div
                      className={`${config.size} rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg ring-4 ${config.ring} flex-shrink-0`}
                    >
                      <Icon className={`${config.iconSize} text-white`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${config.text}`}>
                        {config.label}
                      </p>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground truncate">
                        {entry.user_name}
                      </h3>
                    </div>

                    {/* Show Count */}
                    <div className={`text-right flex-shrink-0 p-3 sm:p-4 rounded-2xl ${config.bg}`}>
                      <p className={`text-2xl sm:text-3xl font-bold ${config.text}`}>
                        {entry.show_count}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {entry.show_count === 1 ? "show" : "shows"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Hall da Fama info */}
        {!loading && ranking.length > 0 && (
          <div className="rounded-2xl bg-muted/30 border border-border/30 p-5 text-center">
            <p className="text-sm text-muted-foreground">
              🏅 Os artistas do <strong className="text-foreground">Top 3</strong> ganham o selo de{" "}
              <strong className="text-primary">Top Vendedor do Mês</strong> e destaque no Backstage Pro!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
