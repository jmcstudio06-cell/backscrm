import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { parseLocalDate } from "@/lib/utils";

interface Transaction {
  type: string;
  amount: number;
  date: string;
}

interface MonthlyEvolutionCardProps {
  transactions: Transaction[];
}

export function MonthlyEvolutionCard({ transactions }: MonthlyEvolutionCardProps) {
  const months = useMemo(() => {
    const now = new Date();
    const arr: { key: string; label: string; value: number; isCurrent: boolean }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = format(d, "MMM", { locale: ptBR });
      arr.push({
        key,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value: 0,
        isCurrent: i === 0,
      });
    }

    transactions.forEach((t) => {
      if (t.type !== "income") return;
      const d = parseLocalDate(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const item = arr.find((m) => m.key === key);
      if (item) item.value += Number(t.amount);
    });

    return arr;
  }, [transactions]);

  const max = Math.max(...months.map((m) => m.value), 1);
  const totalSemester = months.reduce((s, m) => s + m.value, 0);
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const fmtShort = (v: number) => {
    if (v >= 1000) return `R$ ${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
    return `R$ ${Math.round(v)}`;
  };

  if (totalSemester === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 shadow-card animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">Evolução Mensal</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Últimos 6 meses · R$ {fmt(totalSemester)}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {months.map((m, idx) => {
            const pct = (m.value / max) * 100;
            return (
              <div
                key={m.key}
                className="flex items-center gap-3 animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="w-10 text-[11px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                  {m.label}
                </div>
                <div className="flex-1 h-7 rounded-lg bg-muted/40 overflow-hidden relative">
                  <div
                    className={cn(
                      "h-full rounded-lg bg-gradient-to-r transition-all duration-700",
                      m.isCurrent
                        ? "from-primary to-accent shadow-md"
                        : "from-primary/40 to-accent/40"
                    )}
                    style={{ width: `${Math.max(pct, m.value > 0 ? 4 : 0)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-2.5">
                    <span className={cn(
                      "text-[11px] font-bold",
                      pct > 35 ? "text-white" : "text-foreground"
                    )}>
                      {m.value > 0 ? fmtShort(m.value) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
