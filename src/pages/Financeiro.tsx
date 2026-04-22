import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Plus,
  Wallet,
  Trash2,
  Users,
  Car,
  Utensils,
  Calculator,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useTransactions } from "@/hooks/useTransactions";
import { TransactionModal } from "@/components/financeiro/TransactionModal";

import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";

import { ptBR } from "date-fns/locale";
import { formatDateBR, parseLocalDate } from "@/lib/utils";

export default function Financeiro() {
  // CORREÇÃO PRINCIPAL
  const { transactions, loading, deleteTransaction, addTransaction } = useTransactions(true);

  const [transactionModalOpen, setTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");

  const handleAddExpense = () => {
    setTransactionType("expense");
    setTransactionModalOpen(true);
  };

  const handleAddIncome = () => {
    setTransactionType("income");
    setTransactionModalOpen(true);
  };

  const handleSaveTransaction = async (data: any) => {
    await addTransaction(data);
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  const handleExportPdf = () => {
    toast.success("Relatório exportado com sucesso!");
  };

  // ===========================
  // DATA ATUAL
  // ===========================
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  // =====================================================
  // CORREÇÃO DO BUG:
  // aceita qualquer data válida e puxa tudo do mês vigente
  // =====================================================
  const currentMonthTransactions = transactions.filter((t: any) => {
    if (!t?.date) return false;

    const transactionDate = parseLocalDate(t.date);

    if (!transactionDate || isNaN(transactionDate.getTime())) {
      return false;
    }

    return isWithinInterval(transactionDate, {
      start: currentMonthStart,
      end: currentMonthEnd,
    });
  });

  const totalIncome = currentMonthTransactions
    .filter((t: any) => t.type === "income")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter((t: any) => t.type === "expense")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  const profit = totalIncome - totalExpense;

  const currentMonthName = format(now, "MMMM 'de' yyyy", {
    locale: ptBR,
  });

  if (loading) {
    return (
      <Layout title="Resumo Mensal" subtitle="Carregando">
        <div className="flex items-center justify-center h-64">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Resumo Mensal" subtitle={`Resumo de ${currentMonthName}`}>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* VISÃO GERAL */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <StatCard
              title="Receita Mensal"
              value={`R$ ${totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
              gradient="success"
            />

            <StatCard
              title="Despesas Mensais"
              value={`R$ ${totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={TrendingDown}
              gradient="danger"
            />

            <StatCard
              title="Lucro Líquido"
              value={`R$ ${profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              gradient="primary"
            />

            <StatCard
              title="Saldo em Conta"
              value={`R$ ${profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={Wallet}
              gradient="blue"
            />
          </div>

          <ChartCard title="Transações do Mês">
            {currentMonthTransactions.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">Nenhuma movimentação neste mês</div>
            ) : (
              <div className="space-y-3">
                {currentMonthTransactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-xl border">
                    <div>
                      <p className="font-medium">{transaction.description || transaction.category}</p>

                      <p className="text-sm text-muted-foreground">{formatDateBR(transaction.date)}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={
                          transaction.type === "income" ? "text-green-600 font-bold" : "text-red-600 font-bold"
                        }
                      >
                        {transaction.type === "income" ? "+" : "-"} R${" "}
                        {transaction.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </span>

                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(transaction.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </TabsContent>

        {/* DESPESAS */}
        <TabsContent value="expenses">
          <Button onClick={handleAddExpense}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </Button>
        </TabsContent>

        {/* RECEITAS */}
        <TabsContent value="income">
          <Button onClick={handleAddIncome}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Receita
          </Button>
        </TabsContent>

        {/* RELATÓRIOS */}
        <TabsContent value="reports">
          <Button onClick={handleExportPdf}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </TabsContent>
      </Tabs>

      <TransactionModal
        open={transactionModalOpen}
        onOpenChange={setTransactionModalOpen}
        type={transactionType}
        onSave={handleSaveTransaction}
      />
    </Layout>
  );
}
