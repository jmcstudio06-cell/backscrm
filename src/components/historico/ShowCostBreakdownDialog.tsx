import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Car, Utensils, Calculator, ChevronLeft, ChevronRight } from "lucide-react";
import type { HistoricoMonthData } from "@/lib/historico";
import { formatCurrencyBR } from "@/lib/historico";
import type { Transaction } from "@/hooks/useTransactions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monthlyHistory: HistoricoMonthData[];
  initialMonthKey?: string | null;
  selectedYear: number;
}

const normalizeCat = (c: string) => c?.trim().toLowerCase() || "";

const isEquipe = (t: Transaction) =>
  t.type === "expense" &&
  ["músicos", "musicos", "produção", "producao", "equipe", "equipamentos"].includes(normalizeCat(t.category));
const isTransporte = (t: Transaction) => t.type === "expense" && normalizeCat(t.category) === "transporte";
const isAlimentacao = (t: Transaction) =>
  t.type === "expense" && ["alimentação", "alimentacao"].includes(normalizeCat(t.category));

export function ShowCostBreakdownDialog({ open, onOpenChange, monthlyHistory, initialMonthKey, selectedYear }: Props) {
  const monthsWithData = monthlyHistory;
  const defaultIdx = useMemo(() => {
    if (initialMonthKey) {
      const i = monthsWithData.findIndex((m) => m.monthKey === initialMonthKey);
      if (i >= 0) return i;
    }
    // default to current month if in this year, else last
    const now = new Date();
    if (now.getFullYear() === selectedYear) return now.getMonth();
    return monthsWithData.length - 1;
  }, [initialMonthKey, monthsWithData, selectedYear]);

  const [idx, setIdx] = useState(defaultIdx);
  useEffect(() => {
    if (open) setIdx(defaultIdx);
  }, [open, defaultIdx]);

  const month = monthsWithData[idx];
  if (!month) return null;

  const allTx = [...month.incomeTransactions, ...month.expenseTransactions];
  const receita = month.receita;
  const custoEquipe = allTx.filter(isEquipe).reduce((s, t) => s + Number(t.amount || 0), 0);
  const custoTransporte = allTx.filter(isTransporte).reduce((s, t) => s + Number(t.amount || 0), 0);
  const custoAlimentacao = allTx.filter(isAlimentacao).reduce((s, t) => s + Number(t.amount || 0), 0);
  const custoTotal = month.despesa;
  const lucro = receita - custoTotal;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Custo de Show — Detalhamento Mensal</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase">Quanto você realmente lucra?</p>
            <p className="text-lg font-bold text-foreground">{month.month}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIdx((i) => Math.min(monthsWithData.length - 1, i + 1))}
            disabled={idx === monthsWithData.length - 1}
          >
            Próximo <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Custos do Mês</h4>

            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Equipe</p>
                  <p className="text-xs text-muted-foreground">Músicos, técnicos, freelancers</p>
                </div>
              </div>
              <span className="font-bold text-foreground">{formatCurrencyBR(custoEquipe)}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Car className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Transporte</p>
                  <p className="text-xs text-muted-foreground">Combustível, Uber, estacionamento</p>
                </div>
              </div>
              <span className="font-bold text-foreground">{formatCurrencyBR(custoTransporte)}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Alimentação</p>
                  <p className="text-xs text-muted-foreground">Refeições e lanches</p>
                </div>
              </div>
              <span className="font-bold text-foreground">{formatCurrencyBR(custoAlimentacao)}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-destructive" />
                </div>
                <span className="font-semibold text-foreground">Custo Total de Shows</span>
              </div>
              <span className="font-bold text-destructive">{formatCurrencyBR(custoTotal)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Resultado</h4>
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
              <span className="text-muted-foreground font-medium">Receita de Shows</span>
              <span className="font-bold text-success">{formatCurrencyBR(receita)}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
              <span className="text-muted-foreground font-medium">(-) Custos de Show</span>
              <span className="font-bold text-destructive">{formatCurrencyBR(custoTotal)}</span>
            </div>

            <div className="h-px bg-border my-2" />

            <div
              className={`flex items-center justify-between p-5 rounded-2xl ${
                lucro >= 0 ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"
              }`}
            >
              <div>
                <p className="text-lg font-bold text-foreground">Lucro Real do Show</p>
                <p className="text-xs text-muted-foreground mt-1">O que sobra no seu bolso</p>
              </div>
              <span className={`text-2xl font-black ${lucro >= 0 ? "text-success" : "text-destructive"}`}>
                {formatCurrencyBR(lucro)}
              </span>
            </div>
            {receita > 0 && (
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <p className="text-sm text-muted-foreground">
                  Margem de lucro:{" "}
                  <span className={`font-bold ${lucro >= 0 ? "text-success" : "text-destructive"}`}>
                    {((lucro / receita) * 100).toFixed(1)}%
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
