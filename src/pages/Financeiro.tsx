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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransactions } from "@/hooks/useTransactions";
import { useShowsData } from "@/hooks/useShows";
import { shouldIncludeInProjections } from "@/lib/showStatus";
import { TransactionModal } from "@/components/financeiro/TransactionModal";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDateBR, parseLocalDate } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function Financeiro() {
  const { transactions, loading: loadingTransactions, deleteTransaction, addTransaction } = useTransactions();
  const { shows, loading: loadingShows } = useShowsData();
  const [showExpenses, setShowExpenses] = useState<any[]>([]);
  const [showMusicians, setShowMusicians] = useState<any[]>([]);

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

  const handleSaveTransaction = async (data: {
    type: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    is_advance_payment: boolean;
  }) => {
    await addTransaction(data);
  };

  const handleExportPdf = () => toast.success("Relatório exportado com sucesso!");

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
  };

  // Filter transactions for current month only
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const currentMonthTransactions = transactions.filter(t => {
    if (!t.date) return false;
    const transactionDate = parseLocalDate(t.date);
    return isWithinInterval(transactionDate, { start: currentMonthStart, end: currentMonthEnd });
  });

  // Filter shows for current month only
  const currentMonthShows = shows.filter(s => {
    if (!s.date) return false;
    try {
      const showDate = parseLocalDate(s.date);
      if (isNaN(showDate.getTime())) return false;
      return isWithinInterval(showDate, { start: currentMonthStart, end: currentMonthEnd }) && shouldIncludeInProjections(s.status);
    } catch (e) {
      return false;
    }
  });

  const totalIncome = currentMonthTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = currentMonthTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  
  // Projection logic
  const projectedIncome = (currentMonthShows || []).reduce((sum, s) => sum + (s.cachet || 0), 0);
  
  // Calculate expenses from shows (musicians and other expenses)
  // We fetch these in a separate effect
  useEffect(() => {
    const fetchShowDetails = async () => {
      if (currentMonthShows.length === 0) return;
      
      const showIds = currentMonthShows.map(s => s.id);
      
      const [musiciansResult, expensesResult] = await Promise.all([
        supabase.from("show_musicians").select("*").in("show_id", showIds),
        supabase.from("show_expenses").select("*").in("show_id", showIds)
      ]);
      
      if (musiciansResult.data) setShowMusicians(musiciansResult.data);
      if (expensesResult.data) setShowExpenses(expensesResult.data);
    };
    
    fetchShowDetails();
  }, [currentMonthShows.length]);

  const projectedMusicianFees = showMusicians.reduce((sum, m) => sum + (m.fee || 0), 0);
  const projectedOtherExpenses = showExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const projectedTotalExpenses = projectedMusicianFees + projectedOtherExpenses;

  const profit = totalIncome - totalExpense;
  const projectedProfit = projectedIncome - projectedTotalExpenses;


  // Group current month transactions by category for pie chart
  const expensesByCategory = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const expenseCategories = Object.entries(expensesByCategory).map(([name, value], index) => ({
    name,
    value,
    color: ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--muted-foreground))"][index % 5],
  }));

  // Smart calculation: Actual Transactions + (Completed/Scheduled Shows that DON'T have transactions yet)
  const showsWithIncomeTransactions = new Set(currentMonthTransactions.filter(t => t.type === "income" && t.show_id).map(t => t.show_id));
  const virtualShowReceita = currentMonthShows
    .filter(s => !showsWithIncomeTransactions.has(s.id))
    .reduce((sum, s) => sum + (s.cachet || 0), 0);

  const displayIncome = totalIncome + virtualShowReceita;
  const custoEquipe = Math.max(projectedMusicianFees, currentMonthTransactions
    .filter(t => t.type === "expense" && (t.category === "Músicos" || t.category === "Equipe"))
    .reduce((sum, t) => sum + t.amount, 0));

  const custoTransporte = currentMonthTransactions
    .filter(t => t.type === "expense" && t.category === "Transporte")
    .reduce((sum, t) => sum + t.amount, 0);

  const custoAlimentacao = currentMonthTransactions
    .filter(t => t.type === "expense" && t.category === "Alimentação")
    .reduce((sum, t) => sum + t.amount, 0);

  const custoTotalShow = custoEquipe + custoTransporte + custoAlimentacao + projectedOtherExpenses;
  const lucroRealShow = displayIncome - custoTotalShow;

  // Generate last 6 months data for chart
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthName = format(monthDate, "MMM", { locale: ptBR });

    const monthTransactions = transactions.filter(t => {
      if (!t.date) return false;
      try {
        const transactionDate = parseLocalDate(t.date);
        if (isNaN(transactionDate.getTime())) return false;
        return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
      } catch (e) {
        return false;
      }
    });

    const monthShows = shows.filter(s => {
      if (!s.date) return false;
      try {
        const showDate = parseLocalDate(s.date);
        if (isNaN(showDate.getTime())) return false;
        return isWithinInterval(showDate, { start: monthStart, end: monthEnd }) && shouldIncludeInProjections(s.status);
      } catch (e) {
        return false;
      }
    });

    const incomeTransactions = monthTransactions.filter(t => t.type === "income");
    const totalReceitaTrans = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    // Add virtual revenue for shows without transactions in this month
    const showsWithTransactions = new Set(incomeTransactions.filter(t => t.show_id).map(t => t.show_id));
    const virtualReceita = monthShows
      .filter(s => !showsWithTransactions.has(s.id))
      .reduce((sum, s) => sum + (s.cachet || 0), 0);

    const receita = totalReceitaTrans + virtualReceita;
    const despesa = monthTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    const receitaPrevista = monthShows.reduce((sum, s) => sum + (s.cachet || 0), 0);

    if (receita > 0 || despesa > 0 || receitaPrevista > 0) {
      monthlyData.push({ month: monthName, receita: Math.max(receita, receitaPrevista), despesa });
    }
  }

  const currentMonthName = format(now, "MMMM 'de' yyyy", { locale: ptBR });

  const loading = loadingTransactions || loadingShows;

  if (loading) {
    return (
      <Layout title="Resumo Mensal" subtitle="Gerencie suas finanças e relatórios">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Resumo Mensal" subtitle={`Resumo de ${currentMonthName}`}>
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="secondary" className="px-3 py-1">
          {currentMonthShows.length} {currentMonthShows.length === 1 ? "Show" : "Shows"} na agenda este mês
        </Badge>
        {projectedIncome > totalIncome && (
          <Badge variant="outline" className="text-warning border-warning/30 bg-warning/5 px-3 py-1">
            Agenda alimentando financeiro (+ {totalIncome > 0 ? ((projectedIncome / totalIncome - 1) * 100).toFixed(0) : "100"}% projetado)
          </Badge>
        )}
      </div>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary w-full justify-start overflow-x-auto overflow-y-hidden flex-nowrap scrollbar-hide px-1 h-12">
          <TabsTrigger value="overview" className="shrink-0">Visão Geral</TabsTrigger>
          <TabsTrigger value="expenses" className="shrink-0">Despesas</TabsTrigger>
          <TabsTrigger value="income" className="shrink-0">Receitas</TabsTrigger>
          <TabsTrigger value="reports" className="shrink-0">Relatórios</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Receita Mensal"
              value={`R$ ${displayIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={TrendingUp}
              gradient="success"
              description={projectedIncome > totalIncome ? "Incluindo shows agendados" : "Total recebido"}
            />
            <StatCard
              title="Despesas Mensais"
              value={`R$ ${custoTotalShow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={TrendingDown}
              gradient="danger"
              description="Custos de shows e outros"
            />
            <StatCard
              title="Lucro Líquido"
              value={`R$ ${lucroRealShow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              gradient="primary"
              description="Resultado do mês"
            />
            <StatCard
              title="Saldo em Conta"
              value={`R$ ${profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={Wallet}
              gradient="blue"
              description="Somente transações confirmadas"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard
              title="Receita vs Despesas"
              subtitle="Últimos 6 meses"
              className="lg:col-span-2"
            >
              {monthlyData.length === 0 ? (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nenhum dado para exibir
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="#000" tick={{ fill: "#000", fontWeight: 600 }} fontSize={13} />
                    <YAxis stroke="#000" tick={{ fill: "#000", fontWeight: 600 }} fontSize={13} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
                    />
                    <Area
                      type="monotone"
                      dataKey="receita"
                      stroke="hsl(var(--success))"
                      fillOpacity={1}
                      fill="url(#colorReceita)"
                      strokeWidth={2}
                      name="Receita"
                    />
                    <Area
                      type="monotone"
                      dataKey="despesa"
                      stroke="hsl(var(--destructive))"
                      fillOpacity={1}
                      fill="url(#colorDespesa)"
                      strokeWidth={2}
                      name="Despesa"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Despesas por Categoria">
              {expenseCategories.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  Nenhuma despesa registrada
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4">
                    {expenseCategories.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-muted-foreground">{cat.name}</span>
                        </div>
                        <span className="font-medium text-foreground">
                          R$ {cat.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </ChartCard>
          </div>

          {/* Custo de Show */}
          <ChartCard 
            title="Custo de Show" 
            subtitle="Quanto você realmente lucra?"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custos */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Custos do Mês</h4>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Equipe</p>
                      <p className="text-xs text-muted-foreground">Músicos, técnicos, freelancers</p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">
                    R$ {custoEquipe.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Car className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Transporte</p>
                      <p className="text-xs text-muted-foreground">Combustível, Uber, estacionamento</p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">
                    R$ {custoTransporte.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Utensils className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Alimentação</p>
                      <p className="text-xs text-muted-foreground">Refeições e lanches</p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">
                    R$ {custoAlimentacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-destructive" />
                    </div>
                    <span className="font-medium text-foreground">Custo Total de Shows</span>
                  </div>
                  <span className="font-bold text-destructive">
                    R$ {custoTotalShow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Resultado */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Resultado</h4>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Receita de Shows</span>
                  <span className="font-semibold text-success">
                    R$ {displayIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">(-) Custos de Show</span>
                  <span className="font-semibold text-destructive">
                    R$ {custoTotalShow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="h-px bg-border my-2" />

                <div className={`flex items-center justify-between p-4 rounded-xl ${lucroRealShow >= 0 ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
                  <div>
                    <p className="text-lg font-bold text-foreground">Lucro Real do Show</p>
                    <p className="text-xs text-muted-foreground">O que sobra no seu bolso</p>
                  </div>
                  <span className={`text-2xl font-bold ${lucroRealShow >= 0 ? 'text-success' : 'text-destructive'}`}>
                    R$ {lucroRealShow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {totalIncome > 0 && (
                  <div className="text-center p-3 rounded-lg bg-primary/5">
                    <p className="text-sm text-muted-foreground">
                      Margem de lucro: <span className={`font-bold ${lucroRealShow >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {((lucroRealShow / totalIncome) * 100).toFixed(1)}%
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {custoTotalShow === 0 && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">
                  Dica: Categorize suas despesas como "Equipe", "Transporte" ou "Alimentação" para ver o custo real dos seus shows.
                </p>
              </div>
            )}
          </ChartCard>

          {/* Transactions */}
          <ChartCard
            title="Transações do Mês"
            action={
              <Button variant="ghost" size="sm" className="text-primary">
                Ver todas
              </Button>
            }
          >
            {currentMonthTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DollarSign className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma transação neste mês</p>
                <p className="text-sm text-muted-foreground">Adicione sua primeira transação para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentMonthTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          transaction.type === "income" ? "bg-success/10" : "bg-destructive/10"
                        }`}
                      >
                        {transaction.type === "income" ? (
                          <ArrowUpRight className="w-5 h-5 text-success" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{transaction.description || transaction.category}</p>
                        <p className="text-xs text-muted-foreground">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "income" ? "text-success" : "text-destructive"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"} R${" "}
                          {transaction.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateBR(transaction.date)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Despesas do Mês</h3>
            <div className="flex gap-3">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleAddExpense}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Despesa
              </Button>
            </div>
          </div>

          <ChartCard title="Lista de Despesas">
            {currentMonthTransactions.filter(t => t.type === "expense").length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingDown className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma despesa neste mês</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthTransactions
                    .filter((t) => t.type === "expense")
                    .map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium text-foreground">{expense.description || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateBR(expense.date)}
                        </TableCell>
                        <TableCell className="text-destructive font-semibold">
                          - R$ {expense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteTransaction(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </ChartCard>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="income" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Receitas do Mês</h3>
            <div className="flex gap-3">
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleAddIncome}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Receita
              </Button>
            </div>
          </div>

          <ChartCard title="Lista de Receitas">
            {currentMonthTransactions.filter(t => t.type === "income").length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma receita neste mês</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentMonthTransactions
                    .filter((t) => t.type === "income")
                    .map((income) => (
                      <TableRow key={income.id}>
                        <TableCell className="font-medium text-foreground">{income.description || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{income.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDateBR(income.date)}
                        </TableCell>
                        <TableCell className="text-success font-semibold">
                          + R$ {income.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteTransaction(income.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </ChartCard>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Nota Financeira do Mês</h3>
            <Button variant="gradient" onClick={handleExportPdf}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Header */}
              <div className="text-center border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  Nota Financeira
                </h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {currentMonthName}
                </p>
              </div>

              {/* Ganhos */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-success flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4" />
                  Ganhos do Mês
                </h3>
                {currentMonthTransactions.filter(t => t.type === "income").length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-6">Nenhum ganho registrado</p>
                ) : (
                  <div className="space-y-1 pl-6">
                    {currentMonthTransactions
                      .filter(t => t.type === "income")
                      .map(t => (
                        <div key={t.id} className="flex justify-between items-center py-1.5 border-b border-dashed border-border/50 last:border-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-foreground">{t.description || t.category}</span>
                            {t.is_advance_payment && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-blue-500/10 text-blue-600 border-blue-500/30">Antecipado</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">({formatDateBR(t.date)})</span>
                          </div>
                          <span className="text-sm font-medium text-success whitespace-nowrap">
                            + R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="text-sm font-semibold text-foreground">Total de Ganhos</span>
                      <span className="text-sm font-bold text-success">
                        R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Gastos */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4" />
                  Gastos do Mês
                </h3>
                {currentMonthTransactions.filter(t => t.type === "expense").length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-6">Nenhum gasto registrado</p>
                ) : (
                  <div className="space-y-1 pl-6">
                    {currentMonthTransactions
                      .filter(t => t.type === "expense")
                      .map(t => (
                        <div key={t.id} className="flex justify-between items-center py-1.5 border-b border-dashed border-border/50 last:border-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-foreground">{t.description || t.category}</span>
                            {t.is_advance_payment && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 bg-blue-500/10 text-blue-600 border-blue-500/30">Antecipado</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">({formatDateBR(t.date)})</span>
                          </div>
                          <span className="text-sm font-medium text-destructive whitespace-nowrap">
                            - R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <span className="text-sm font-semibold text-foreground">Total de Gastos</span>
                      <span className="text-sm font-bold text-destructive">
                        R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Gastos por Categoria */}
              {expenseCategories.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Gastos por Categoria
                  </h3>
                  <div className="space-y-1 pl-6">
                    {expenseCategories.map(cat => (
                      <div key={cat.name} className="flex justify-between items-center py-1.5 border-b border-dashed border-border/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-sm text-foreground">{cat.name}</span>
                        </div>
                        <span className="text-sm font-medium text-destructive whitespace-nowrap">
                          - R$ {cat.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resultado / Lucro */}
              <div className="space-y-3 pt-2 border-t-2 border-border">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Resultado do Mês
                </h3>
                <div className="space-y-2 pl-6">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-muted-foreground">Total de Ganhos</span>
                    <span className="text-sm font-medium text-success">
                      R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-muted-foreground">(-) Total de Gastos</span>
                    <span className="text-sm font-medium text-destructive">
                      R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className={`flex justify-between items-center p-3 rounded-xl ${profit >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <span className="text-base font-bold text-foreground">Lucro Líquido</span>
                    <span className={`text-xl font-bold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                      R$ {profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {totalIncome > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Margem de lucro: <span className={`font-bold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {((profit / totalIncome) * 100).toFixed(1)}%
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
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
