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
import { TransactionModal } from "@/components/financeiro/TransactionModal";
import { format, startOfMonth, endOfMonth, subMonths, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDateBR, parseLocalDate } from "@/lib/utils";

export default function Financeiro() {
  const { transactions, loading, deleteTransaction, addTransaction } = useTransactions();
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
    const transactionDate = parseLocalDate(t.date);
    return isWithinInterval(transactionDate, { start: currentMonthStart, end: currentMonthEnd });
  });

  const totalIncome = currentMonthTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = currentMonthTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpense;

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

  // Custo de Show - Agrupamento por categoria
  const showCostCategories = {
    equipe: ["Músico", "Equipe", "Cachê Músico", "Freelancer", "Banda", "Técnico"],
    transporte: ["Transporte", "Combustível", "Gasolina", "Uber", "Táxi", "Passagem", "Estacionamento"],
    alimentacao: ["Alimentação", "Comida", "Refeição", "Lanche", "Restaurante"],
  };

  const custoEquipe = currentMonthTransactions
    .filter(t => t.type === "expense" && showCostCategories.equipe.some(cat => 
      t.category.toLowerCase().includes(cat.toLowerCase()) || 
      (t.description && t.description.toLowerCase().includes(cat.toLowerCase()))
    ))
    .reduce((sum, t) => sum + t.amount, 0);

  const custoTransporte = currentMonthTransactions
    .filter(t => t.type === "expense" && showCostCategories.transporte.some(cat => 
      t.category.toLowerCase().includes(cat.toLowerCase()) || 
      (t.description && t.description.toLowerCase().includes(cat.toLowerCase()))
    ))
    .reduce((sum, t) => sum + t.amount, 0);

  const custoAlimentacao = currentMonthTransactions
    .filter(t => t.type === "expense" && showCostCategories.alimentacao.some(cat => 
      t.category.toLowerCase().includes(cat.toLowerCase()) || 
      (t.description && t.description.toLowerCase().includes(cat.toLowerCase()))
    ))
    .reduce((sum, t) => sum + t.amount, 0);

  const custoTotalShow = custoEquipe + custoTransporte + custoAlimentacao;
  const lucroRealShow = totalIncome - custoTotalShow;

  // Generate last 6 months data for chart
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthName = format(monthDate, "MMM", { locale: ptBR });

    const monthTransactions = transactions.filter(t => {
      const transactionDate = parseLocalDate(t.date);
      return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
    });

    const receita = monthTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const despesa = monthTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    if (receita > 0 || despesa > 0) {
      monthlyData.push({ month: monthName, receita, despesa });
    }
  }

  const currentMonthName = format(now, "MMMM 'de' yyyy", { locale: ptBR });

  if (loading) {
    return (
      <Layout title="Financeiro" subtitle="Gerencie suas finanças e relatórios">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Financeiro" subtitle={`Resumo de ${currentMonthName}`}>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                    R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
            <h3 className="font-semibold text-foreground">Relatórios Financeiros</h3>
            <Button variant="gradient" onClick={handleExportPdf}>
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title={`Relatório de ${currentMonthName}`}>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Receita Total</span>
                  <span className="font-bold text-success">R$ {totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Despesa Total</span>
                  <span className="font-bold text-destructive">R$ {totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                  <span className="text-foreground font-medium">Lucro Líquido</span>
                  <span className="font-bold text-primary">R$ {profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </ChartCard>
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
