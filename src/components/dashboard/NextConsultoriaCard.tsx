import { useEffect, useState } from "react";
import { GraduationCap, Presentation, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export function NextConsultoriaCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [next, setNext] = useState<{ at: string; type: string; notes: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("next_consultoria_at, next_consultoria_type, next_consultoria_notes")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.next_consultoria_at) {
        const when = new Date(data.next_consultoria_at);
        if (when.getTime() > Date.now() - 1000 * 60 * 60) {
          setNext({
            at: data.next_consultoria_at,
            type: data.next_consultoria_type || "consultoria",
            notes: data.next_consultoria_notes,
          });
        }
      }
    })();
  }, [user]);

  if (!next) return null;

  const when = new Date(next.at);
  const isApresentacao = next.type === "apresentacao";
  const Icon = isApresentacao ? Presentation : GraduationCap;
  const label = isApresentacao ? "Próxima apresentação" : "Próxima consultoria";
  const dateStr = format(when, "EEEE, dd 'de' MMMM", { locale: ptBR });
  const timeStr = format(when, "HH:mm");

  return (
    <button
      onClick={() => navigate("/consultoria")}
      className="w-full text-left rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 hover:border-primary/40 transition-all flex items-center gap-3 animate-fade-in"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-primary font-semibold">{label}</div>
        <div className="text-sm font-semibold capitalize truncate">{dateStr}</div>
      </div>
      <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground flex-shrink-0">
        <Clock className="w-3 h-3" />
        {timeStr}
      </div>
    </button>
  );
}
