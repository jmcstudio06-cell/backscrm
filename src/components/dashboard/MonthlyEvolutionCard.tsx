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
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (totalSemester === 0) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-card border border-border p-5 shadow-sm animate-fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-md bg-muted">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Evolução Mensal</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Desempenho dos últimos meses
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
          Sem dados ainda. Registre shows para começar a evolução.
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-card border border-border p-5 shadow-sm animate-fade-in h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Evolução Mensal</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Desempenho dos últimos meses
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground">
          Total: <span className="text-foreground">{fmt(totalSemester)}</span>
        </span>
      </div>

      <div className="space-y-2">
        {months.map((m, idx) => {
          const pct = (m.value / max) * 100;
          return (
            <div
              key={m.key}
              className="flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="w-10 text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                {m.label}
              </div>
              <div className="flex-1 h-7 rounded-md bg-muted/40 overflow-hidden relative">
                <div
                  className={cn(
                    "h-full rounded-md bg-gradient-to-r transition-all duration-700",
                    m.isCurrent
                      ? "from-primary to-accent"
                      : "from-primary/30 to-accent/30"
                  )}
                  style={{ width: `${Math.max(pct, m.value > 0 ? 4 : 0)}%` }}
                />
                <div className="absolute inset-0 flex items-center px-2.5">
                  <span className={cn(
                    "text-[11px] font-bold",
                    pct > 50 ? "text-white" : "text-foreground"
                  )}>
                    {m.value > 0 ? fmt(m.value) : "—"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

