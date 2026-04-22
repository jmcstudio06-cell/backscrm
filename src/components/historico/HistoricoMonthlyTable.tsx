import { Fragment, useState } from "react";
import { format } from "date-fns";
import { ArrowDownRight, ArrowUpRight, CalendarClock, ChevronDown, ChevronRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartCard } from "@/components/dashboard/ChartCard";
import type { HistoricoMonthData } from "@/lib/historico";
import { formatCurrencyBR, getProjectedStatusLabel } from "@/lib/historico";
import { parseLocalDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface HistoricoMonthlyTableProps {
  monthlyHistory: HistoricoMonthData[];
  compareHistory?: HistoricoMonthData[] | null;
  compareYear?: number | null;
  selectedYear?: number;
  defaultExpanded?: string | null;
}

export function HistoricoMonthlyTable({ monthlyHistory, compareHistory, compareYear, selectedYear, defaultExpanded }: HistoricoMonthlyTableProps) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(defaultExpanded || null);
  const hasCompare = !!compareHistory && !!compareYear;
  const isMobile = useIsMobile();

  return (
    <ChartCard title="Detalhamento Mensal" subtitle={hasCompare ? `${selectedYear} vs ${compareYear}` : "Resumo financeiro mês a mês do ano selecionado"}>
      {monthlyHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum histórico disponível neste ano</p>
          <p className="text-sm text-muted-foreground">As receitas e despesas lançadas aparecerão aqui automaticamente</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês</TableHead>
                <TableHead>Receita{hasCompare ? ` ${selectedYear}` : ""}</TableHead>
                {hasCompare && <TableHead className="text-muted-foreground">Receita {compareYear}</TableHead>}
                <TableHead>Despesa{hasCompare ? ` ${selectedYear}` : ""}</TableHead>
                {hasCompare && <TableHead className="text-muted-foreground">Despesa {compareYear}</TableHead>}
                {!isMobile && <TableHead>Previsto</TableHead>}
                <TableHead>Shows{hasCompare ? ` ${selectedYear}` : ""}</TableHead>
                {hasCompare && <TableHead className="text-muted-foreground">Shows {compareYear}</TableHead>}
                <TableHead>Lucro{hasCompare ? ` ${selectedYear}` : ""}</TableHead>
                {hasCompare && <TableHead className="text-muted-foreground">Lucro {compareYear}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyHistory.map((month, i) => {
                const isExpanded = expandedMonth === month.monthKey;
                const comp = hasCompare ? compareHistory![i] : null;
                const colSpan = isMobile
                  ? (hasCompare ? 9 : 5)
                  : (hasCompare ? 10 : 6);

                return (
                  <Fragment key={month.monthKey}>
                    <TableRow
                      className="cursor-pointer transition-colors hover:bg-secondary/80"
                      onClick={() => setExpandedMonth(isExpanded ? null : month.monthKey)}
                    >
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          {month.month}
                        </div>
                      </TableCell>
                      <TableCell className="text-success">{formatCurrencyBR(month.receita)}</TableCell>
                      {comp && <TableCell className="text-success/60">{formatCurrencyBR(comp.receita)}</TableCell>}
                      <TableCell className="text-destructive">{formatCurrencyBR(month.despesa)}</TableCell>
                      {comp && <TableCell className="text-destructive/60">{formatCurrencyBR(comp.despesa)}</TableCell>}
                      {!isMobile && <TableCell className="text-warning">{formatCurrencyBR(month.receitaPrevista)}</TableCell>}
                      <TableCell>
                        <Badge variant="secondary">{month.shows} shows</Badge>
                      </TableCell>
                      {comp && (
                        <TableCell>
                          <Badge variant="outline" className="text-muted-foreground">{comp.shows} shows</Badge>
                        </TableCell>
                      )}
                      <TableCell className={cn("font-semibold", month.lucro >= 0 ? "text-primary" : "text-destructive")}>
                        {formatCurrencyBR(month.lucro)}
                      </TableCell>
                      {comp && (
                        <TableCell className={cn("font-semibold opacity-60", comp.lucro >= 0 ? "text-primary" : "text-destructive")}>
                          {formatCurrencyBR(comp.lucro)}
                        </TableCell>
                      )}
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell colSpan={colSpan} className="border-0 p-0">
                          <div className={cn("px-6 py-4", hasCompare ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4", "bg-secondary/30")}>
                            {/* Current year details */}
                            <div className="space-y-4">
                              {hasCompare && <p className="text-xs font-bold text-foreground mb-2">{selectedYear}</p>}
                              <TransactionSection
                                type="income"
                                transactions={month.incomeTransactions}
                                projectedShows={month.projectedShows}
                                lucro={month.lucro}
                                despesa={month.despesa}
                                expenseTransactions={month.expenseTransactions}
                              />
                            </div>
                            {/* Compare year details */}
                            {comp && (
                              <div className="space-y-4 opacity-75">
                                <p className="text-xs font-bold text-muted-foreground mb-2">{compareYear}</p>
                                <TransactionSection
                                  type="income"
                                  transactions={comp.incomeTransactions}
                                  projectedShows={comp.projectedShows}
                                  lucro={comp.lucro}
                                  despesa={comp.despesa}
                                  expenseTransactions={comp.expenseTransactions}
                                />
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </ChartCard>
  );
}

function TransactionSection({
  transactions,
  projectedShows,
  lucro,
  expenseTransactions,
}: {
  type: string;
  transactions: HistoricoMonthData["incomeTransactions"];
  projectedShows: HistoricoMonthData["projectedShows"];
  lucro: number;
  despesa: number;
  expenseTransactions: HistoricoMonthData["expenseTransactions"];
}) {
  return (
    <>
      <div>
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-success">
          <ArrowUpRight className="h-3.5 w-3.5" />
          Receitas ({transactions.length})
        </h4>
        {transactions.length === 0 ? (
          <p className="pl-5 text-xs text-muted-foreground">Nenhuma receita</p>
        ) : (
          <div className="space-y-1 pl-5">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {(() => {
                      const d = parseLocalDate(t.date);
                      return isNaN(d.getTime()) ? "--/--" : format(d, "dd/MM");
                    })()}
                  </span>
                  <span className="text-foreground">{t.description || t.category}</span>
                </div>
                <span className="whitespace-nowrap font-medium text-success">+ {formatCurrencyBR(t.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-destructive">
          <ArrowDownRight className="h-3.5 w-3.5" />
          Despesas ({expenseTransactions.length})
        </h4>
        {expenseTransactions.length === 0 ? (
          <p className="pl-5 text-xs text-muted-foreground">Nenhuma despesa</p>
        ) : (
          <div className="space-y-1 pl-5">
            {expenseTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {(() => {
                      const d = parseLocalDate(t.date);
                      return isNaN(d.getTime()) ? "--/--" : format(d, "dd/MM");
                    })()}
                  </span>
                  <span className="text-foreground">{t.description || t.category}</span>
                </div>
                <span className="whitespace-nowrap font-medium text-destructive">- {formatCurrencyBR(t.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-warning">
          <CalendarClock className="h-3.5 w-3.5" />
          Receita Prevista ({projectedShows.length})
        </h4>
        {projectedShows.length === 0 ? (
          <p className="pl-5 text-xs text-muted-foreground">Nenhum show previsto</p>
        ) : (
          <div className="space-y-1 pl-5">
            {projectedShows.map((show) => (
              <div key={show.id} className="flex items-center justify-between py-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {(() => {
                      const d = parseLocalDate(show.date);
                      return isNaN(d.getTime()) ? "--/--" : format(d, "dd/MM");
                    })()}
                  </span>
                  <span className="text-foreground">{show.title}</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-warning border-warning/30">
                    {getProjectedStatusLabel(show.status)}
                  </Badge>
                </div>
                <span className="whitespace-nowrap font-medium text-warning">{formatCurrencyBR(show.cachet)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={cn("flex items-center justify-between rounded-lg p-3", lucro >= 0 ? "bg-success/10" : "bg-destructive/10")}>
        <span className="text-sm font-bold text-foreground">Lucro do Mês</span>
        <span className={cn("text-sm font-bold", lucro >= 0 ? "text-success" : "text-destructive")}>
          {formatCurrencyBR(lucro)}
        </span>
      </div>
    </>
  );
}
