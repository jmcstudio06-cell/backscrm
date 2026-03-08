import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Phone, User, Trash2, Loader2, CalendarDays, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
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

const DAYS_LIMIT = 15;

export function GuideLeadsPanel() {
  const [leads, setLeads] = useState<GuideLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    const cutoff = subDays(new Date(), DAYS_LIMIT).toISOString();
    const { data, error } = await (supabase
      .from("guide_leads" as any)
      .select("*")
      .gte("created_at", cutoff)
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

  const dailyCounts = useMemo<DailyCount[]>(() => {
    const today = startOfDay(new Date());
    const days: DailyCount[] = [];
    for (let i = 0; i < DAYS_LIMIT; i++) {
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

  const leadsForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    return leads.filter((l) => isSameDay(new Date(l.created_at), selectedDay));
  }, [leads, selectedDay]);

  const maxCount = Math.max(...dailyCounts.map((d) => d.count), 1);
  const todayCount = dailyCounts[0]?.count || 0;
  const yesterdayCount = dailyCounts[1]?.count || 0;

  const toggleDay = (date: Date) => {
    setSelectedDay((prev) => (prev && isSameDay(prev, date) ? null : date));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-5 w-5 text-primary" />
          Leads do Guia por Dia
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            Últimos {DAYS_LIMIT} dias
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

            {/* Gráfico de barras clicável */}
            <div className="space-y-1">
              {dailyCounts.map((day) => {
                const isSelected = selectedDay && isSameDay(selectedDay, day.date);
                return (
                  <div key={day.label}>
                    <button
                      onClick={() => day.count > 0 && toggleDay(day.date)}
                      className={`w-full flex items-center gap-2 text-sm rounded-md px-1 py-1 transition-colors ${
                        day.count > 0 ? "cursor-pointer hover:bg-secondary/50" : "cursor-default opacity-60"
                      } ${isSelected ? "bg-primary/10" : ""}`}
                    >
                      <span className="w-24 text-xs text-muted-foreground truncate text-left">{day.label}</span>
                      <div className="flex-1 h-5 bg-secondary/50 rounded-full overflow-hidden">
                        {day.count > 0 && (
                          <div
                            className={`h-full rounded-full transition-all ${isSelected ? "bg-primary" : "bg-primary/70"}`}
                            style={{ width: `${(day.count / maxCount) * 100}%` }}
                          />
                        )}
                      </div>
                      <span className={`w-6 text-right text-xs font-semibold ${day.count > 0 ? "text-primary" : "text-muted-foreground"}`}>
                        {day.count}
                      </span>
                      {day.count > 0 && (
                        isSelected
                          ? <ChevronUp className="w-3.5 h-3.5 text-primary shrink-0" />
                          : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {/* Lista expandida do dia selecionado */}
                    {isSelected && (
                      <div className="ml-2 mr-2 mb-2 mt-1 space-y-2 animate-fade-in">
                        {leadsForSelectedDay.map((lead) => (
                          <div
                            key={lead.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground">{lead.name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {lead.phone}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">
                                {format(new Date(lead.created_at), "HH:mm")}
                              </span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteLead(lead.id)}>
                                <Trash2 className="w-3.5 h-3.5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Total ({DAYS_LIMIT} dias)
              </span>
              <span className="font-bold text-sm text-foreground">
                {leads.length} leads
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
