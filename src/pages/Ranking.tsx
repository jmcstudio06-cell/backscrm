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
    avatarSize: "w-14 h-14",
    iconSize: "w-6 h-6",
  },
  {
    icon: Medal,
    gradient: "from-slate-300 to-slate-400",
    ring: "ring-slate-300/30",
    bg: "bg-slate-300/10",
    text: "text-slate-500 dark:text-slate-400",
    label: "2º Lugar",
    avatarSize: "w-12 h-12",
    iconSize: "w-5 h-5",
  },
  {
    icon: Award,
    gradient: "from-amber-600 to-amber-700",
    ring: "ring-amber-600/20",
    bg: "bg-amber-600/10",
    text: "text-amber-700 dark:text-amber-500",
    label: "3º Lugar",
    avatarSize: "w-12 h-12",
    iconSize: "w-5 h-5",
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
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-5">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg flex-shrink-0">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Top 3 do Mês</h2>
              <p className="text-xs text-muted-foreground capitalize flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3 h-3" />
                {monthName}
              </p>
            </div>
          </div>
        </div>

        {/* Motivation / Celebration Banner */}
        {!loading && !isInTop3 && myShowCount !== null && showsToTop3 !== null && showsToTop3 > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-primary/8 via-primary/4 to-accent/8 border border-primary/15 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Flame className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Você está a {showsToTop3} {showsToTop3 === 1 ? "show" : "shows"} de entrar no TOP 3!
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Seus shows este mês: <span className="font-semibold text-foreground">{myShowCount}</span> — Continue vendendo!
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && isInTop3 && (
          <div className="rounded-2xl bg-gradient-to-r from-yellow-500/10 via-amber-400/5 to-yellow-500/10 border border-yellow-500/15 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md flex-shrink-0">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Parabéns! Você está no TOP 3 este mês!
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Continue assim — você é referência no Backstage Pro!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ranking List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        ) : ranking.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border/50 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">Nenhum show agendado este mês</p>
            <p className="text-sm text-muted-foreground">
              O ranking aparecerá quando houver shows confirmados ou agendados
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ranking.map((entry, index) => {
              const config = podiumConfig[index];
              const Icon = config.icon;
              const isMe = entry.user_id === user?.id;

              return (
                <div
                  key={entry.user_id}
                  className={`relative rounded-2xl bg-card border p-4 transition-all ${
                    isMe
                      ? "border-primary/30 ring-2 ring-primary/15 shadow-md"
                      : "border-border/50 shadow-sm hover:shadow-md"
                  }`}
                >
                  {isMe && (
                    <div className="absolute top-2.5 right-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Você
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {/* Avatar / Icon */}
                    <div
                      className={`${config.avatarSize} rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md ring-4 ${config.ring} flex-shrink-0`}
                    >
                      <Icon className={`${config.iconSize} text-white`} />
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-bold uppercase tracking-wider ${config.text}`}>
                        {config.label}
                      </p>
                      <h3 className="text-base font-bold text-foreground truncate mt-0.5">
                        {entry.user_name}
                      </h3>
                    </div>

                    {/* Count */}
                    <div className={`flex-shrink-0 text-center px-4 py-2.5 rounded-xl ${config.bg}`}>
                      <p className={`text-2xl font-extrabold leading-none ${config.text}`}>
                        {entry.show_count}
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                        {entry.show_count === 1 ? "show" : "shows"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {!loading && ranking.length > 0 && (
          <div className="rounded-xl bg-muted/30 border border-border/20 px-5 py-3.5 text-center">
            <p className="text-xs text-muted-foreground">
              Os artistas do <strong className="text-foreground">Top 3</strong> ganham o selo de{" "}
              <strong className="text-primary">Top Vendedor do Mês</strong> e destaque no Backstage Pro!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
