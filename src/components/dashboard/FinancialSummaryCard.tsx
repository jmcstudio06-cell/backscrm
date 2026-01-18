import { Wallet, ArrowRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FinancialSummaryCardProps {
  totalPending: number;
  totalReceived: number;
  hasContracts: boolean;
}

export function FinancialSummaryCard({ totalPending, totalReceived, hasContracts }: FinancialSummaryCardProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isEmpty = totalPending === 0 && totalReceived === 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
          <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground uppercase tracking-wide">
            Financeiro
          </h3>
        </div>
      </div>

      {/* Content */}
      {isEmpty ? (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
            <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium">
              Você não tem valores a receber
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Isso indica ausência de contratos ativos.
            </p>
          </div>
          <Link to="/contratos">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Criar contrato
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">A Receber</p>
            <p className="text-lg sm:text-xl font-bold text-foreground">
              R$ {formatCurrency(totalPending)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mb-1">Recebido</p>
            <p className="text-lg sm:text-xl font-bold text-foreground">
              R$ {formatCurrency(totalReceived)}
            </p>
          </div>
        </div>
      )}

      {/* Footer message */}
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 italic">
        Isso está abaixo da média de artistas ativos no Backstage.
      </p>
    </div>
  );
}
