import { useMemo } from "react";
import { PieChart, Heart, Building2, Cake, GraduationCap, Music2, Beer, Flame, Sparkles, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ShowLike {
  event_type: string | null;
  status: string;
}

interface EventTypeBreakdownCardProps {
  shows: ShowLike[];
}

const TYPE_META: Record<string, { icon: LucideIcon; label: string }> = {
  "Casamento": { icon: Heart, label: "Casamento" },
  "Corporativo": { icon: Building2, label: "Corporativo" },
  "Aniversário": { icon: Cake, label: "Aniversário" },
  "Formatura": { icon: GraduationCap, label: "Formatura" },
  "Festival": { icon: Music2, label: "Festival" },
  "Bar/Restaurante": { icon: Beer, label: "Bar/Restaurante" },
  "Festa Junina": { icon: Flame, label: "Festa Junina" },
  "Outro": { icon: Sparkles, label: "Outro" },
};

export function EventTypeBreakdownCard({ shows }: EventTypeBreakdownCardProps) {
  const { rows, total, topLabel } = useMemo(() => {
    const counted = shows.filter(
      (s) => s.event_type && !["cancelled", "cancelado"].includes(s.status)
    );
    const map = new Map<string, number>();
    for (const s of counted) {
      const key = (s.event_type as string).trim();
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const total = counted.length;
    const rows = Array.from(map.entries())
      .map(([type, count]) => ({ type, count, pct: total ? (count / total) * 100 : 0 }))
      .sort((a, b) => b.count - a.count);
    return { rows, total, topLabel: rows[0]?.type ?? null };
  }, [shows]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 sm:p-6 shadow-card group hover:shadow-elevated transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-60" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl opacity-50" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Onde você mais toca</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Distribuição por tipo de evento
              </p>
            </div>
          </div>
          {topLabel && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Trophy className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-primary truncate max-w-[140px]">{topLabel}</span>
            </div>
          )}
        </div>

        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-3">
              <PieChart className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Cadastre shows com o tipo de evento para ver sua distribuição aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((r, i) => {
              const meta = TYPE_META[r.type] ?? { icon: Sparkles, label: r.type };
              const Icon = meta.icon;
              const isTop = i === 0;
              return (
                <div key={r.type} className="group/row">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isTop
                            ? "bg-gradient-to-br from-primary to-accent text-white shadow-sm"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium text-foreground truncate">{meta.label}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {r.count} {r.count === 1 ? "show" : "shows"}
                      </span>
                      <span className="text-xs font-bold text-foreground min-w-[42px] text-right">
                        {r.pct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isTop
                          ? "bg-gradient-to-r from-primary to-accent"
                          : "bg-gradient-to-r from-primary/40 to-accent/40"
                      }`}
                      style={{ width: `${Math.max(r.pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="pt-2 text-[11px] text-muted-foreground">
              Baseado em {total} {total === 1 ? "show cadastrado" : "shows cadastrados"}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
