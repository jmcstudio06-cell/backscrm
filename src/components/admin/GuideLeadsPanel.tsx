import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Phone, User, Trash2, Loader2, CalendarDays, MapPin, Music } from "lucide-react";
import { toast } from "sonner";
import { format, startOfDay, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GuideLead {
  id: string;
  name: string;
  phone: string;
  city?: string;
  shows_per_month?: string;
  created_at: string;
}

const DAYS_LIMIT = 15;

export function GuideLeadsPanel() {
  const [leads, setLeads] = useState<GuideLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

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

  const days = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: DAYS_LIMIT }, (_, i) => {
      const date = subDays(today, i);
      const dayLeads = leads.filter((l) => isSameDay(new Date(l.created_at), date));
      return {
        date,
        label: i === 0 ? "Hoje" : i === 1 ? "Ontem" : format(date, "dd/MM", { locale: ptBR }),
        weekday: format(date, "EEE", { locale: ptBR }),
        count: dayLeads.length,
        leads: dayLeads,
      };
    });
  }, [leads]);

  const selected = days[selectedDayIndex];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-5 w-5 text-primary" />
          Ganhou Guia
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {leads.length} total
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Grid de quadradinhos dos dias */}
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 mb-4">
              {days.map((day, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDayIndex(i)}
                  className={`flex flex-col items-center rounded-lg p-2 transition-all text-center border ${
                    selectedDayIndex === i
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : day.count > 0
                        ? "bg-primary/10 border-primary/30 hover:bg-primary/20"
                        : "bg-secondary/30 border-border hover:bg-secondary/50"
                  }`}
                >
                  <span className="text-[10px] font-medium leading-none">
                    {day.label}
                  </span>
                  <span className={`text-lg font-bold leading-tight mt-0.5 ${
                    selectedDayIndex === i ? "" : day.count > 0 ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {day.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Lista do dia selecionado */}
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {selected.label} — {selected.count} lead{selected.count !== 1 ? "s" : ""}
              </p>

              {selected.leads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhum lead nesse dia.
                </p>
              ) : (
                <div className="space-y-2">
                  {selected.leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{lead.name}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3 text-primary/60" />
                              {lead.phone}
                            </p>
                            {lead.city && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-primary/60" />
                                {lead.city}
                              </p>
                            )}
                            {lead.shows_per_month && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Music className="w-3 h-3 text-primary/60" />
                                {lead.shows_per_month} shows/mês
                              </p>
                            )}
                          </div>
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
