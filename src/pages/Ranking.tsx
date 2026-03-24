import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Calendar, Flame, Star, Crown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RankingEntry {
  user_id: string;
  user_name: string;
  show_count: number;
}

const podiumConfig = [
  {
    icon: Crown,
    gradient: "from-yellow-400 to-amber-500",
    ring: "ring-yellow-400/40",
    bg: "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-500/10 dark:to-amber-500/10",
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-300/50 dark:border-yellow-500/30",
    label: "1º Lugar",
    avatarSize: "w-16 h-16 sm:w-20 sm:h-20",
    iconSize: "w-7 h-7 sm:w-9 sm:h-9",
    nameSize: "text-xl sm:text-2xl",
    countSize: "text-3xl sm:text-4xl",
    highlight: true,
  },
  {
    icon: Medal,
    gradient: "from-slate-300 to-slate-400",
    ring: "ring-slate-300/30",
    bg: "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-500/10 dark:to-gray-500/10",
    text: "text-slate-500 dark:text-slate-400",
    border: "border-slate-200/50 dark:border-slate-500/20",
    label: "2º Lugar",
    avatarSize: "w-14 h-14 sm:w-16 sm:h-16",
    iconSize: "w-6 h-6 sm:w-7 sm:h-7",
    nameSize: "text-lg sm:text-xl",
    countSize: "text-2xl sm:text-3xl",
    highlight: false,
  },
  {
    icon: Award,
    gradient: "from-amber-600 to-amber-700",
    ring: "ring-amber-600/25",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10",
    text: "text-amber-700 dark:text-amber-500",
    border: "border-amber-300/40 dark:border-amber-500/20",
    label: "3º Lugar",
    avatarSize: "w-14 h-14 sm:w-16 sm:h-16",
    iconSize: "w-6 h-6 sm:w-7 sm:h-7",
    nameSize: "text-lg sm:text-xl",
    countSize: "text-2xl sm:text-3xl",
    highlight: false,
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

  const isInTop3 = ranking.some((r) => r.user_id === user?.id);
  const minTop3Shows = ranking.length >= 3 ? ranking[2].show_count : ranking.length > 0 ? ranking[0].show_count : 1;
  const showsToTop3 = myShowCount !== null ? Math.max(0, minTop3Shows - myShowCount + 1) : null;

  return (
    <Layout title="Ranking" subtitle="Os artistas que mais vendem shows no mês">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-accent/10 border border-primary/20 p-6 sm:p-8">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl flex-shrink-0">
              <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Top 3 do Mês</h2>
              <p className="text-sm text-muted-foreground capitalize flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4" />
                {monthName}
              </p>
            </div>
          </div>
        </div>

        {/* Motivation Banner */}
        {!loading && !isInTop3 && myShowCount !== null && showsToTop3 !== null && showsToTop3 > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Flame className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold text-foreground">
                  Você está a {showsToTop3} {showsToTop3 === 1 ? "show" : "shows"} de entrar no TOP 3!
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Seus shows este mês: <span className="font-bold text-foreground">{myShowCount}</span> — Continue vendendo!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* In Top 3 Celebration */}
        {!loading && isInTop3 && (
          <div className="rounded-2xl bg-gradient-to-r from-yellow-500/10 via-amber-400/5 to-yellow-500/10 border border-yellow-500/20 p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold text-foreground">
                  Parabéns! Você está no TOP 3 este mês!
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
              <Skeleton key={i} className="h-28 w-full rounded-3xl" />
            ))}
          </div>
        ) : ranking.length === 0 ? (
          <div className="rounded-3xl bg-card border border-border/50 p-12 sm:p-16 text-center shadow-card">
            <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-5">
              <Trophy className="w-9 h-9 text-muted-foreground/40" />
            </div>
            <p className="text-xl font-bold text-foreground mb-2">Nenhum show agendado este mês</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
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
                  className={`relative overflow-hidden rounded-3xl ${config.bg} border ${config.border} p-5 sm:p-7 transition-all duration-300 hover:shadow-elevated ${
                    isMe ? "ring-2 ring-primary/25 shadow-lg" : "shadow-card"
                  } ${config.highlight ? "scale-[1.02]" : ""}`}
                >
                  {isMe && (
                    <div className="absolute top-3 right-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                        Você
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-5 sm:gap-7">
                    {/* Position Badge */}
                    <div
                      className={`${config.avatarSize} rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-xl ring-4 ${config.ring} flex-shrink-0`}
                    >
                      <Icon className={`${config.iconSize} text-white`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] sm:text-xs font-bold uppercase tracking-widest mb-1 ${config.text}`}>
                        {config.label}
                      </p>
                      <h3 className={`${config.nameSize} font-extrabold text-foreground truncate`}>
                        {entry.user_name}
                      </h3>
                      {config.highlight && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Ganha o selo Top Vendedor do Mês
                        </p>
                      )}
                    </div>

                    {/* Show Count */}
                    <div className="flex-shrink-0 text-center px-5 sm:px-7 py-3 sm:py-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-border/30">
                      <p className={`${config.countSize} font-black leading-none ${config.text}`}>
                        {entry.show_count}
                      </p>
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-1">
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
          <div className="rounded-2xl bg-muted/30 border border-border/30 px-6 py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Quem fica em <strong className="text-foreground">1º lugar</strong> ganha um selo exclusivo do{" "}
              <strong className="text-primary">Backstage Pro</strong> — confira seus troféus na página de Selos!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
