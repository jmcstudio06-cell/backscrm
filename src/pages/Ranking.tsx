import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Calendar } from "lucide-react";
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
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const monthName = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR });

  useEffect(() => {
    const fetchRanking = async () => {
      const { data, error } = await supabase.rpc("get_monthly_show_ranking");
      if (!error && data) {
        setRanking(data as RankingEntry[]);
      }
      setLoading(false);
    };
    fetchRanking();
  }, []);

  return (
    <Layout title="Ranking" subtitle="Os artistas que mais vendem shows no mês">
      <div className="space-y-8">
        {/* Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-card p-6 sm:p-8">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Top Artistas do Mês</h2>
                <p className="text-sm text-muted-foreground capitalize flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {monthName}
                </p>
              </div>
            </div>
          </div>
        </div>

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

              return (
                <div
                  key={entry.user_id}
                  className={`relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card p-5 sm:p-6 transition-all hover:shadow-elevated`}
                >
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
      </div>
    </Layout>
  );
}
