import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Show } from "@/hooks/useShows";
import type { Transaction } from "@/hooks/useTransactions";
import { parseLocalDate } from "@/lib/utils";
import {
  isCancelledShowStatus,
  isCompletedShowStatus,
  isProjectedShowStatus,
  normalizeShowStatus,
} from "@/lib/showStatus";

export { isCompletedShowStatus, isProjectedShowStatus };

export interface ProjectedShow {
  id: string;
  title: string;
  date: string;
  cachet: number;
  status: string;
}

export interface HistoricoMonthData {
  month: string;
  monthKey: string;
  receita: number;
  receitaPrevista: number;
  despesa: number;
  lucro: number;
  shows: number;
  incomeTransactions: Transaction[];
  expenseTransactions: Transaction[];
  projectedShows: ProjectedShow[];
}

const isValidDateString = (value: string | null | undefined) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const getYearFromDate = (value: string) => parseLocalDate(value).getFullYear();

const getMonthFromDate = (value: string) => parseLocalDate(value).getMonth();

export const shouldIncludeShowInHistory = (status: string) => !isCancelledShowStatus(status);

export const formatCurrencyBR = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const getProjectedStatusLabel = (status: string) => {
  const normalizedStatus = normalizeShowStatus(status);
  const labels: Record<string, string> = {
    confirmed: "Confirmado",
    pending: "Pendente",
    scheduled: "Agendado",
    negotiation: "Negociação",
  };
  return labels[normalizedStatus] || status;
};

export function getHistoricoAvailableYears(transactions: Transaction[], shows: Show[]) {
  const years = new Set<number>();

  transactions.forEach((transaction) => {
    if (isValidDateString(transaction.date)) {
      years.add(getYearFromDate(transaction.date));
    }
  });

  shows.forEach((show) => {
    if (isValidDateString(show.date) && shouldIncludeShowInHistory(show.status)) {
      years.add(getYearFromDate(show.date));
    }
  });

  if (years.size === 0) {
    years.add(new Date().getFullYear());
  }

  return [...years].sort((first, second) => first - second);
}

export function buildHistoricoYearSummary(transactions: Transaction[], shows: Show[], selectedYear: number) {
  const yearTransactions = transactions.filter(
    (transaction) => isValidDateString(transaction.date) && getYearFromDate(transaction.date) === selectedYear,
  );

  const yearShows = shows.filter(
    (show) =>
      isValidDateString(show.date) &&
      getYearFromDate(show.date) === selectedYear &&
      shouldIncludeShowInHistory(show.status),
  );

  const completedShows = yearShows.filter((show) => isCompletedShowStatus(show.status));
  const projectedShows = yearShows.filter((show) => isProjectedShowStatus(show.status));
  const totalReceita = yearTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const totalDespesa = yearTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const totalReceitaPrevista = projectedShows
    .reduce((sum, show) => sum + Number(show.cachet || 0), 0);

  // Always show all 12 months for any year
  const maxMonth = 11;

  const monthlyHistory: HistoricoMonthData[] = Array.from({ length: maxMonth + 1 }, (_, monthIndex) => {
    const monthDate = new Date(selectedYear, monthIndex, 1);
    const incomeTransactions = yearTransactions.filter(
      (transaction) => transaction.type === "income" && getMonthFromDate(transaction.date) === monthIndex,
    );
    const expenseTransactions = yearTransactions.filter(
      (transaction) => transaction.type === "expense" && getMonthFromDate(transaction.date) === monthIndex,
    );
    const completedMonthShows = completedShows.filter((show) => getMonthFromDate(show.date) === monthIndex);
    const projectedMonthShows = projectedShows.filter((show) => getMonthFromDate(show.date) === monthIndex);
    const receita = incomeTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const despesa = expenseTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const receitaPrevista = projectedMonthShows.reduce((sum, show) => sum + Number(show.cachet || 0), 0);

    return {
      month: format(monthDate, "MMM/yy", { locale: ptBR }),
      monthKey: `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}`,
      receita,
      receitaPrevista,
      despesa,
      lucro: receita - despesa,
      shows: completedMonthShows.length,
      incomeTransactions,
      expenseTransactions,
      projectedShows: projectedMonthShows.map((s) => ({
        id: s.id,
        title: s.title,
        date: s.date,
        cachet: s.cachet,
        status: s.status,
      })),
    };
  });

  return {
    totalReceita,
    totalReceitaPrevista,
    totalDespesa,
    totalLucro: totalReceita - totalDespesa,
    totalShows: completedShows.length,
    monthlyHistory,
  };
}