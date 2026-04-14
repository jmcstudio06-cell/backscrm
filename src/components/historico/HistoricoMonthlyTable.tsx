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

interface HistoricoMonthlyTableProps {
  monthlyHistory: HistoricoMonthData[];
}

export function HistoricoMonthlyTable({ monthlyHistory }: HistoricoMonthlyTableProps) {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  return (
    <ChartCard title="Detalhamento Mensal" subtitle="Resumo financeiro mês a mês do ano selecionado">
      {monthlyHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum histórico disponível neste ano</p>
          <p className="text-sm text-muted-foreground">As receitas e despesas lançadas aparecerão aqui automaticamente</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mês</TableHead>
              <TableHead>Receita</TableHead>
              <TableHead>Despesa</TableHead>
              <TableHead>Previsto</TableHead>
              <TableHead>Shows</TableHead>
              <TableHead>Lucro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyHistory.map((month) => {
              const isExpanded = expandedMonth === month.monthKey;

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
                    <TableCell className="text-destructive">{formatCurrencyBR(month.despesa)}</TableCell>
                    <TableCell className="text-warning">{formatCurrencyBR(month.receitaPrevista)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{month.shows} shows</Badge>
                    </TableCell>
                    <TableCell className={cn("font-semibold", month.lucro >= 0 ? "text-primary" : "text-destructive")}>
                      {formatCurrencyBR(month.lucro)}
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={6} className="border-0 p-0">
                        <div className="space-y-4 bg-secondary/30 px-6 py-4">
                          {/* Receitas */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-success">
                              <ArrowUpRight className="h-3.5 w-3.5" />
                              Receitas ({month.incomeTransactions.length})
                            </h4>
                            {month.incomeTransactions.length === 0 ? (
                              <p className="pl-5 text-xs text-muted-foreground">Nenhuma receita</p>
                            ) : (
                              <div className="space-y-1 pl-5">
                                {month.incomeTransactions.map((transaction) => (
                                  <div key={transaction.id} className="flex items-center justify-between py-1 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                                        {format(parseLocalDate(transaction.date), "dd/MM")}
                                      </span>
                                      <span className="text-foreground">{transaction.description || transaction.category}</span>
                                    </div>
                                    <span className="whitespace-nowrap font-medium text-success">
                                      + {formatCurrencyBR(transaction.amount)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Despesas */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-destructive">
                              <ArrowDownRight className="h-3.5 w-3.5" />
                              Despesas ({month.expenseTransactions.length})
                            </h4>
                            {month.expenseTransactions.length === 0 ? (
                              <p className="pl-5 text-xs text-muted-foreground">Nenhuma despesa</p>
                            ) : (
                              <div className="space-y-1 pl-5">
                                {month.expenseTransactions.map((transaction) => (
                                  <div key={transaction.id} className="flex items-center justify-between py-1 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                                        {format(parseLocalDate(transaction.date), "dd/MM")}
                                      </span>
                                      <span className="text-foreground">{transaction.description || transaction.category}</span>
                                    </div>
                                    <span className="whitespace-nowrap font-medium text-destructive">
                                      - {formatCurrencyBR(transaction.amount)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Receita Prevista */}
                          <div>
                            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-warning">
                              <CalendarClock className="h-3.5 w-3.5" />
                              Receita Prevista ({month.projectedShows.length})
                            </h4>
                            {month.projectedShows.length === 0 ? (
                              <p className="pl-5 text-xs text-muted-foreground">Nenhum show previsto</p>
                            ) : (
                              <div className="space-y-1 pl-5">
                                {month.projectedShows.map((show) => (
                                  <div key={show.id} className="flex items-center justify-between py-1 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                                        {format(parseLocalDate(show.date), "dd/MM")}
                                      </span>
                                      <span className="text-foreground">{show.title}</span>
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-warning border-warning/30">
                                        {getProjectedStatusLabel(show.status)}
                                      </Badge>
                                    </div>
                                    <span className="whitespace-nowrap font-medium text-warning">
                                      {formatCurrencyBR(show.cachet)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Lucro do mês */}
                          <div
                            className={cn(
                              "flex items-center justify-between rounded-lg p-3",
                              month.lucro >= 0 ? "bg-success/10" : "bg-destructive/10",
                            )}
                          >
                            <span className="text-sm font-bold text-foreground">Lucro do Mês</span>
                            <span className={cn("text-sm font-bold", month.lucro >= 0 ? "text-success" : "text-destructive")}>
                              {formatCurrencyBR(month.lucro)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      )}
    </ChartCard>
  );
}
