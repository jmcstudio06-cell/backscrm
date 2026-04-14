import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Show } from "@/hooks/useShows";
import type { Transaction } from "@/hooks/useTransactions";
import { parseLocalDate } from "@/lib/utils";

const COMPLETED_SHOW_STATUSES = new Set(["completed", "finalizado"]);
const IGNORED_SHOW_STATUSES = new Set(["cancelled"]);

export interface HistoricoMonthData {
  month: string;
  monthKey: string;
  receita: number;
  despesa: number;
  lucro: number;
  shows: number;
  incomeTransactions: Transaction[];
  expenseTransactions: Transaction[];
}

const isValidDateString = (value: string | null | undefined) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const getYearFromDate = (value: string) => parseLocalDate(value).getFullYear();

const getMonthFromDate = (value: string) => parseLocalDate(value).getMonth();

export const isCompletedShowStatus = (status: string) => COMPLETED_SHOW_STATUSES.has(status);

export const shouldIncludeShowInHistory = (status: string) => !IGNORED_SHOW_STATUSES.has(status);

export const formatCurrencyBR = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
  const totalReceita = yearTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const totalDespesa = yearTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const monthlyHistory: HistoricoMonthData[] = Array.from({ length: 12 }, (_, monthIndex) => {
    const monthDate = new Date(selectedYear, monthIndex, 1);
    const incomeTransactions = yearTransactions.filter(
      (transaction) => transaction.type === "income" && getMonthFromDate(transaction.date) === monthIndex,
    );
    const expenseTransactions = yearTransactions.filter(
      (transaction) => transaction.type === "expense" && getMonthFromDate(transaction.date) === monthIndex,
    );
    const completedMonthShows = completedShows.filter((show) => getMonthFromDate(show.date) === monthIndex);
    const receita = incomeTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
    const despesa = expenseTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    return {
      month: format(monthDate, "MMM/yy", { locale: ptBR }),
      monthKey: `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}`,
      receita,
      despesa,
      lucro: receita - despesa,
      shows: completedMonthShows.length,
      incomeTransactions,
      expenseTransactions,
    };
  }).filter(
    (month) => month.receita > 0 || month.despesa > 0 || month.shows > 0,
  );

  return {
    totalReceita,
    totalDespesa,
    totalLucro: totalReceita - totalDespesa,
    totalShows: completedShows.length,
    monthlyHistory,
  };
}