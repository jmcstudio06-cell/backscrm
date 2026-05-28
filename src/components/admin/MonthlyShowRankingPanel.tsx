import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Row {
  user_id: string;
  user_name: string;
  user_email: string | null;
  show_count: number;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function MonthlyShowRankingPanel() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_full_monthly_show_ranking" as any, {
      target_month: month,
      target_year: year,
    });
    if (!error && data) setRows(data as Row[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [month, year]);

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  const medalColor = (i: number) => {
    if (i === 0) return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
    if (i === 1) return "bg-slate-400/20 text-slate-500 dark:text-slate-300";
    if (i === 2) return "bg-orange-600/20 text-orange-600 dark:text-orange-400";
    return "bg-primary/10 text-primary";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Ranking Geral de Shows do Mês
            </CardTitle>
            <CardDescription>
              Todos os artistas com pelo menos 1 show marcado no período.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm font-medium min-w-[160px] justify-center">
              <Calendar className="h-4 w-4" />
              {MONTHS[month - 1]} {year}
            </div>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Nenhum artista com shows marcados neste mês.
          </div>
        ) : (
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div
                key={r.user_id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {medal(i) ?? `${i + 1}º`}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.user_name}</div>
                    {r.user_email && (
                      <div className="text-xs text-muted-foreground truncate">{r.user_email}</div>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="flex-shrink-0">
                  {r.show_count} {r.show_count === 1 ? "show" : "shows"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
