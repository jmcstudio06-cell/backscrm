import { CheckCircle2, Circle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface JourneyChecklistCardProps {
  trialStart: string | null;
  showsCount: number;
  totalRevenue: number;
  contractsCount: number;
  hasMonthlyGoal: boolean;
  hasAnnualGoal: boolean;
}

export function JourneyChecklistCard({
  trialStart,
  showsCount,
  totalRevenue,
  contractsCount,
  hasMonthlyGoal,
  hasAnnualGoal,
}: JourneyChecklistCardProps) {
  const journeyItems = [
    {
      id: "cadastro",
      label: "Cadastro feito",
      completed: true,
    },
    {
      id: "show",
      label: "Primeiro show criado",
      completed: showsCount >= 1,
    },
    {
      id: "contrato",
      label: "Primeiro contrato",
      completed: contractsCount >= 1,
    },
    {
      id: "meta_mensal",
      label: "Meta mensal definida",
      completed: hasMonthlyGoal,
    },
    {
      id: "meta_anual",
      label: "Meta anual definida",
      completed: hasAnnualGoal,
    },
  ];

  const completedCount = journeyItems.filter(item => item.completed).length;
  const totalCount = journeyItems.length;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm sm:text-base font-bold text-foreground uppercase tracking-wide">
            Sua Jornada na Backstage
          </h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Checklist */}
      <div className="space-y-2.5">
        {journeyItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-lg transition-colors",
              item.completed 
                ? "bg-emerald-50 dark:bg-emerald-950/30" 
                : "bg-muted/50"
            )}
          >
            {item.completed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <span className={cn(
              "text-sm",
              item.completed 
                ? "text-emerald-700 dark:text-emerald-400 font-medium" 
                : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
