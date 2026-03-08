import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Phone, User, Trash2, Loader2, CalendarDays, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format, startOfDay, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GuideLead {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

interface DailyCount {
  date: Date;
  label: string;
  count: number;
}

export function GuideLeadsPanel() {
  const [leads, setLeads] = useState<GuideLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await (supabase
      .from("guide_leads" as any)
      .select("*")
      .order("created_at", { ascending: false }) as any);

    if (error) {
      console.error("Error fetching guide leads:", error);
    } else {
      setLeads((data as GuideLead[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const deleteLead = async (id: string) => {
    const { error } = await (supabase
      .from("guide_leads" as any)
      .delete()
      .eq("id", id) as any);

    if (error) {
      toast.error("Erro ao remover lead");
    } else {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success("Lead removido");
    }
  };

  // Contabilidade diária dos últimos 14 dias
  const dailyCounts = useMemo<DailyCount[]>(() => {
    const today = startOfDay(new Date());
    const days: DailyCount[] = [];

    for (let i = 0; i < 14; i++) {
      const day = subDays(today, i);
      const count = leads.filter((l) => isSameDay(new Date(l.created_at), day)).length;
      days.push({
        date: day,
        label: format(day, "dd/MM (EEE)", { locale: ptBR }),
        count,
      });
    }
    return days;
  }, [leads]);

  const maxCount = Math.max(...dailyCounts.map((d) => d.count), 1);
  const todayCount = dailyCounts[0]?.count || 0;
  const yesterdayCount = dailyCounts[1]?.count || 0;

  return (
    <div className="space-y-4">
      {/* Resumo diário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-5 w-5 text-primary" />
            Leads do Guia por Dia
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              Últimos 14 dias
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Destaques */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Hoje</p>
                  <p className="text-2xl font-bold text-primary">{todayCount}</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">Ontem</p>
                  <p className="text-2xl font-bold text-foreground">{yesterdayCount}</p>
                </div>
              </div>

              {/* Gráfico de barras simples */}
              <div className="space-y-1.5">
                {dailyCounts.map((day) => (
                  <div key={day.label} className="flex items-center gap-2 text-sm">
                    <span className="w-24 text-xs text-muted-foreground truncate">{day.label}</span>
                    <div className="flex-1 h-5 bg-secondary/50 rounded-full overflow-hidden">
                      {day.count > 0 && (
                        <div
                          className="h-full bg-primary/80 rounded-full transition-all"
                          style={{ width: `${(day.count / maxCount) * 100}%` }}
                        />
                      )}
                    </div>
                    <span className={`w-6 text-right text-xs font-semibold ${day.count > 0 ? "text-primary" : "text-muted-foreground"}`}>
                      {day.count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Total (14 dias)
                </span>
                <span className="font-bold text-sm text-foreground">
                  {dailyCounts.reduce((acc, d) => acc + d.count, 0)} leads
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Lista completa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Ganhou Guia de Atendimento
            <span className="ml-auto text-sm font-normal text-muted-foreground">
              {leads.length} lead{leads.length !== 1 ? "s" : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : leads.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum lead do guia ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {lead.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(lead.created_at), "dd/MM/yyyy HH:mm")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLead(lead.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}