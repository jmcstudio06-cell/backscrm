<<<<<<< HEAD
import { useEffect, useState, useMemo } from "react";
=======
import { useState } from "react";
import { toast } from "sonner";
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Users,
  Car,
  Utensils,
  Calculator,
  Lock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
<<<<<<< HEAD
import { useShows } from "@/contexts/shows/ShowsContext";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDateBR, parseLocalDate } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export default function Financeiro() {
  const { isBlocked, loading: blocksLoading } = useFeatureBlocks();
  const { shows, loading: loadingShows } = useShows();
  const [musicians, setMusicians] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Busca músicos e despesas de todos os shows para compilar o resumo financeiro
  useEffect(() => {
    if (shows.length === 0) return;
    
    const fetchDetails = async () => {
      setLoadingDetails(true);
      const showIds = shows.map(s => s.id);
      
      const batchSize = 100;
      let allMusicians: any[] = [];
      let allExpenses: any[] = [];
      
      for (let i = 0; i < showIds.length; i += batchSize) {
        const batchIds = showIds.slice(i, i + batchSize);
        const [mRes, eRes] = await Promise.all([
          supabase.from("show_musicians").select("*, musicians(name)").in("show_id", batchIds),
          supabase.from("show_expenses").select("*").in("show_id", batchIds)
        ]);
        if (mRes.data) allMusicians = [...allMusicians, ...mRes.data];
        if (eRes.data) allExpenses = [...allExpenses, ...eRes.data];
      }
      
      setMusicians(allMusicians);
      setExpenses(allExpenses);
      setLoadingDetails(false);
    };
    
    fetchDetails();
  }, [shows]);

  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();

  // Consolida as informações da agenda em "Transações Virtuais"
  const virtualTransactions = useMemo(() => {
    const transactions: any[] = [];
    
    shows.forEach(show => {
      if (show.status === "cancelled") return;

      if (show.cachet > 0) {
        transactions.push({
          id: `show-${show.id}`,
          show_id: show.id,
          type: "income",
          category: "Show",
          description: `Cachê: ${show.title}`,
          amount: show.cachet,
          date: show.date,
        });
      }

      const showMusicians = musicians.filter(m => m.show_id === show.id);
      showMusicians.forEach(m => {
        if (m.fee > 0) {
          transactions.push({
            id: `musician-${m.id}`,
            show_id: show.id,
            type: "expense",
            category: "Músicos",
            description: `${m.musicians?.name || "Músico"} - ${show.title}`,
            amount: m.fee,
            date: show.date,
          });
        }
      });

      const showExpensesList = expenses.filter(e => e.show_id === show.id);
      showExpensesList.forEach(e => {
        if (e.amount > 0) {
          transactions.push({
            id: `expense-${e.id}`,
            show_id: show.id,
            type: "expense",
            category: e.category,
            description: `${e.description || e.category} - ${show.title}`,
            amount: e.amount,
            date: show.date,
          });
        }
      });
    });
    
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [shows, musicians, expenses]);

  const currentMonthTransactions = useMemo(() => {
    return virtualTransactions.filter(t => {
      const d = parseLocalDate(t.date);
      return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear;
    });
  }, [virtualTransactions, currentMonthIndex, currentYear]);

  const receitaMensal = currentMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const despesaMensal = currentMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const lucroLiquido = receitaMensal - despesaMensal;

  const custoEquipe = currentMonthTransactions
    .filter(t => t.type === "expense" && (t.category === "Músicos" || t.category === "Equipe"))
=======
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const currentMonthEnd = now;

  const currentMonthTransactions = transactions.filter((t) => {
    const transactionDate = parseLocalDate(t.date);
    return isWithinInterval(transactionDate, { start: currentMonthStart, end: currentMonthEnd });
  });

  const totalIncome = currentMonthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpense;

  // Group current month transactions by category for pie chart
  const expensesByCategory = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>,
    );

  const expenseCategories = Object.entries(expensesByCategory).map(([name, value], index) => ({
    name,
    value,
    color: [
      "hsl(var(--primary))",
      "hsl(var(--accent))",
      "hsl(var(--success))",
      "hsl(var(--warning))",
      "hsl(var(--muted-foreground))",
    ][index % 5],
  }));

  // Custo de Show - Agrupamento por categoria
  const showCostCategories = {
    equipe: ["Músico", "Equipe", "Cachê Músico", "Freelancer", "Banda", "Técnico"],
    transporte: ["Transporte", "Combustível", "Gasolina", "Uber", "Táxi", "Passagem", "Estacionamento"],
    alimentacao: ["Alimentação", "Comida", "Refeição", "Lanche", "Restaurante"],
  };

  const custoEquipe = currentMonthTransactions
    .filter(
      (t) =>
        t.type === "expense" &&
        showCostCategories.equipe.some(
          (cat) =>
            t.category.toLowerCase().includes(cat.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(cat.toLowerCase())),
        ),
    )
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
    .reduce((sum, t) => sum + t.amount, 0);

  const custoTransporte = currentMonthTransactions
    .filter(
      (t) =>
        t.type === "expense" &&
        showCostCategories.transporte.some(
          (cat) =>
            t.category.toLowerCase().includes(cat.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(cat.toLowerCase())),
        ),
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const custoAlimentacao = currentMonthTransactions
    .filter(
      (t) =>
        t.type === "expense" &&
        showCostCategories.alimentacao.some(
          (cat) =>
            t.category.toLowerCase().includes(cat.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(cat.toLowerCase())),
        ),
    )
    .reduce((sum, t) => sum + t.amount, 0);

<<<<<<< HEAD
  const custoTotalShows = despesaMensal;

  const chartData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const mIdx = d.getMonth();
      const y = d.getFullYear();
      
      const monthTx = virtualTransactions.filter(t => {
        const td = parseLocalDate(t.date);
        return td.getMonth() === mIdx && td.getFullYear() === y;
      });
      
      const rec = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const des = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      
      data.push({
        month: format(d, "MMM", { locale: ptBR }),
        receita: rec,
        despesa: des
      });
    }
    return data;
  }, [virtualTransactions, now]);

  const expenseCategories = useMemo(() => {
    const cats: Record<string, number> = {};
    currentMonthTransactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
      });
      
    return Object.entries(cats).map(([name, value], index) => ({
      name,
      value,
      color: ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--muted-foreground))"][index % 5] || "#ccc"
    }));
  }, [currentMonthTransactions]);
=======
  const custoTotalShow = custoEquipe + custoTransporte + custoAlimentacao;
  const lucroRealShow = totalIncome - custoTotalShow;

  // Generate last 6 months data for chart
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const monthName = format(monthDate, "MMM", { locale: ptBR });

    const monthTransactions = transactions.filter((t) => {
      const transactionDate = parseLocalDate(t.date);
      return isWithinInterval(transactionDate, { start: monthStart, end: monthEnd });
    });

    const receita = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const despesa = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

    if (receita > 0 || despesa > 0) {
      monthlyData.push({ month: monthName, receita, despesa });
    }
  }
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104

  const currentMonthName = format(now, "MMMM 'de' yyyy", { locale: ptBR }).toUpperCase();
  const showsThisMonth = shows.filter(s => {
    const d = parseLocalDate(s.date);
    return d.getMonth() === currentMonthIndex && d.getFullYear() === currentYear && s.status !== 'cancelled';
  }).length;

<<<<<<< HEAD
  if (blocksLoading || loadingShows || loadingDetails) {
=======
  if (loading) {
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
    return (
      <Layout title="Resumo Mensal" subtitle="Gerenciamento financeiro integrado à Agenda">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center justify-center space-y-4">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             <p className="text-muted-foreground">Sincronizando com a Agenda...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isBlocked("financeiro")) {
    return (
      <Layout title="Resumo Mensal" subtitle="Acesso Restrito">
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
          <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Plano Expirado</h2>
          <p className="text-muted-foreground max-w-md">
            O Resumo Mensal é liberado para todos os planos ativos. Renove sua assinatura para continuar acompanhando suas finanças.
          </p>
          <Button onClick={() => window.location.href = '/planos'} className="mt-4 bg-primary hover:bg-primary/90">
            Ver Planos
          </Button>
        </div>
      </Layout>
    );
  }

  return (
<<<<<<< HEAD
    <Layout title="Resumo Mensal" subtitle={`RESUMO DE ${currentMonthName}`}>
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="secondary" className="px-3 py-1 bg-secondary/50">
          {showsThisMonth} {showsThisMonth === 1 ? "Show" : "Shows"} na agenda este mês
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary/30 border border-border/50 w-full justify-start overflow-x-auto overflow-y-hidden flex-nowrap scrollbar-hide px-1 h-12">
          <TabsTrigger value="overview" className="shrink-0 rounded-md data-[state=active]:shadow-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="expenses" className="shrink-0 rounded-md data-[state=active]:shadow-sm">Despesas</TabsTrigger>
          <TabsTrigger value="income" className="shrink-0 rounded-md data-[state=active]:shadow-sm">Receitas</TabsTrigger>
=======
    <Layout title="Resumo Mensal" subtitle={`Resumo de ${currentMonthName}`}>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
<<<<<<< HEAD
              title="RECEITA MENSAL"
              value={`R$ ${receitaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
=======
              title="Receita Mensal"
              value={`R$ ${totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
              icon={TrendingUp}
              gradient="success"
            />
            <StatCard
<<<<<<< HEAD
              title="DESPESAS MENSAIS"
              value={`R$ ${despesaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
=======
              title="Despesas Mensais"
              value={`R$ ${totalExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
              icon={TrendingDown}
              gradient="danger"
            />
            <StatCard
<<<<<<< HEAD
              title="LUCRO LÍQUIDO"
              value={`R$ ${lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
=======
              title="Lucro Líquido"
              value={`R$ ${profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
              icon={DollarSign}
              gradient="primary"
            />
            <StatCard
              title="SALDO EM CONTA"
              value={`R$ ${lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={Wallet}
              gradient="blue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
<<<<<<< HEAD
            <ChartCard title="Receita vs Despesas" subtitle="ÚLTIMOS 6 MESES" className="lg:col-span-2 shadow-sm border-border/50">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--foreground))", fontWeight: 600 }} fontSize={12} axisLine={false} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fill: "hsl(var(--foreground))", fontWeight: 600 }} fontSize={12} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                  <Area type="monotone" dataKey="receita" stroke="hsl(var(--success))" fillOpacity={1} fill="url(#colorReceita)" name="Receita" strokeWidth={2}/>
                  <Area type="monotone" dataKey="despesa" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorDespesa)" name="Despesa" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
=======
            <ChartCard title="Receita vs Despesas" subtitle="Últimos 6 meses" className="lg:col-span-2">
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
                        borderRadius: "8px",
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
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
            </ChartCard>

            <ChartCard title="Despesas por Categoria" className="shadow-sm border-border/50">
              {expenseCategories.length === 0 ? (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  Nenhuma despesa na agenda
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={expenseCategories} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, ""]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3 mt-2">
                    {expenseCategories.map((cat) => (
                      <div key={cat.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                          <span className="text-muted-foreground capitalize">{cat.name.toLowerCase()}</span>
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

<<<<<<< HEAD
          <ChartCard title="Custo de Show" subtitle="QUANTO VOCÊ REALMENTE LUCRA?" className="shadow-sm border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Custos do Mês</h4>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
=======
          {/* Custo de Show */}
          <ChartCard title="Custo de Show" subtitle="Quanto você realmente lucra?">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Custos */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Custos do Mês</h4>

                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Equipe</p>
                      <p className="text-xs text-muted-foreground">Músicos, técnicos, freelancers</p>
                    </div>
                  </div>
                  <span className="font-bold text-foreground">R$ {custoEquipe.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
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
                  <span className="font-bold text-foreground">R$ {custoTransporte.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
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
                  <span className="font-bold text-foreground">R$ {custoAlimentacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-destructive" />
                    </div>
                    <span className="font-semibold text-foreground">Custo Total de Shows</span>
                  </div>
                  <span className="font-bold text-destructive">R$ {custoTotalShows.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

<<<<<<< HEAD
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Resultado</h4>
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <span className="text-muted-foreground font-medium">Receita de Shows</span>
                  <span className="font-bold text-success">R$ {receitaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <span className="text-muted-foreground font-medium">(-) Custos de Show</span>
                  <span className="font-bold text-destructive">R$ {custoTotalShows.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="h-px bg-border my-4" />
                
                <div className={`flex items-center justify-between p-5 rounded-2xl ${lucroLiquido >= 0 ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
=======
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

                <div
                  className={`flex items-center justify-between p-4 rounded-xl ${lucroRealShow >= 0 ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"}`}
                >
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
                  <div>
                    <p className="text-lg font-bold text-foreground">Lucro Real do Show</p>
                    <p className="text-xs text-muted-foreground mt-1">O que sobra no seu bolso</p>
                  </div>
<<<<<<< HEAD
                  <span className={`text-2xl font-black ${lucroLiquido >= 0 ? 'text-success' : 'text-destructive'}`}>
                    R$ {lucroLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
=======
                  <span className={`text-2xl font-bold ${lucroRealShow >= 0 ? "text-success" : "text-destructive"}`}>
                    R$ {lucroRealShow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
                  </span>
                </div>
                {receitaMensal > 0 && (
                  <div className="text-center p-3 rounded-xl bg-secondary/50">
                    <p className="text-sm text-muted-foreground">
<<<<<<< HEAD
                      Margem de lucro: <span className={`font-bold ${lucroLiquido >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {((lucroLiquido / receitaMensal) * 100).toFixed(1)}%
=======
                      Margem de lucro:{" "}
                      <span className={`font-bold ${lucroRealShow >= 0 ? "text-success" : "text-destructive"}`}>
                        {((lucroRealShow / totalIncome) * 100).toFixed(1)}%
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
<<<<<<< HEAD
=======

            {custoTotalShow === 0 && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">
                  Dica: Categorize suas despesas como "Equipe", "Transporte" ou "Alimentação" para ver o custo real dos
                  seus shows.
                </p>
              </div>
            )}
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
          </ChartCard>

          <ChartCard title="Transações do Mês" action={<span className="text-sm text-primary cursor-pointer hover:underline">Ver todas</span>} className="shadow-sm border-border/50">
            {currentMonthTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <DollarSign className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma transação da agenda neste mês</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentMonthTransactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 transition-colors hover:bg-secondary/50">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.type === "income" ? "bg-success/10" : "bg-destructive/10"}`}>
                        {t.type === "income" ? <ArrowUpRight className="w-6 h-6 text-success" /> : <ArrowDownRight className="w-6 h-6 text-destructive" />}
                      </div>
                      <div>
<<<<<<< HEAD
                        <p className="font-semibold text-foreground">{t.description}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{t.category.toLowerCase()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                        {t.type === "income" ? "+ " : "- "}R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDateBR(t.date)}</p>
=======
                        <p className="text-sm font-medium text-foreground">
                          {transaction.description || transaction.category}
                        </p>
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
                        <p className="text-xs text-muted-foreground">{formatDateBR(transaction.date)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-foreground">Despesas do Mês (Agenda)</h3>
          </div>
<<<<<<< HEAD
          <ChartCard className="shadow-sm border-border/50 overflow-hidden p-0">
            {currentMonthTransactions.filter(t => t.type === "expense").length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <TrendingDown className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                Nenhuma despesa encontrada na agenda para este mês.
=======

          <ChartCard title="Lista de Despesas">
            {currentMonthTransactions.filter((t) => t.type === "expense").length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingDown className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma despesa neste mês</p>
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow>
                    <TableHead className="py-4">Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
<<<<<<< HEAD
                  {currentMonthTransactions.filter(t => t.type === "expense").map(t => (
                    <TableRow key={t.id} className="hover:bg-secondary/20">
                      <TableCell className="font-medium text-foreground py-4">{t.description}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{t.category.toLowerCase()}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{formatDateBR(t.date)}</TableCell>
                      <TableCell className="text-right text-destructive font-semibold">- R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
=======
                  {currentMonthTransactions
                    .filter((t) => t.type === "expense")
                    .map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium text-foreground">{expense.description || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDateBR(expense.date)}</TableCell>
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
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
                </TableBody>
              </Table>
            )}
          </ChartCard>
        </TabsContent>

        <TabsContent value="income" className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-foreground">Receitas do Mês (Agenda)</h3>
          </div>
<<<<<<< HEAD
          <ChartCard className="shadow-sm border-border/50 overflow-hidden p-0">
            {currentMonthTransactions.filter(t => t.type === "income").length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                Nenhuma receita encontrada na agenda para este mês.
=======

          <ChartCard title="Lista de Receitas">
            {currentMonthTransactions.filter((t) => t.type === "income").length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma receita neste mês</p>
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow>
                    <TableHead className="py-4">Descrição</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
<<<<<<< HEAD
                  {currentMonthTransactions.filter(t => t.type === "income").map(t => (
                    <TableRow key={t.id} className="hover:bg-secondary/20">
                      <TableCell className="font-medium text-foreground py-4">{t.description}</TableCell>
                      <TableCell><Badge variant="secondary">Show</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{formatDateBR(t.date)}</TableCell>
                      <TableCell className="text-right text-success font-semibold">+ R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))}
=======
                  {currentMonthTransactions
                    .filter((t) => t.type === "income")
                    .map((income) => (
                      <TableRow key={income.id}>
                        <TableCell className="font-medium text-foreground">{income.description || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{income.category}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDateBR(income.date)}</TableCell>
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
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
                </TableBody>
              </Table>
            )}
          </ChartCard>
        </TabsContent>
<<<<<<< HEAD
=======

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
                <h2 className="text-lg font-bold text-foreground">Nota Financeira</h2>
                <p className="text-sm text-muted-foreground capitalize">{currentMonthName}</p>
              </div>

              {/* Ganhos */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-success flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4" />
                  Ganhos do Mês
                </h3>
                {currentMonthTransactions.filter((t) => t.type === "income").length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-6">Nenhum ganho registrado</p>
                ) : (
                  <div className="space-y-1 pl-6">
                    {currentMonthTransactions
                      .filter((t) => t.type === "income")
                      .map((t) => (
                        <div
                          key={t.id}
                          className="flex justify-between items-center py-1.5 border-b border-dashed border-border/50 last:border-0"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-foreground">{t.description || t.category}</span>
                            {t.is_advance_payment && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 h-4 bg-blue-500/10 text-blue-600 border-blue-500/30"
                              >
                                Antecipado
                              </Badge>
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
                {currentMonthTransactions.filter((t) => t.type === "expense").length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-6">Nenhum gasto registrado</p>
                ) : (
                  <div className="space-y-1 pl-6">
                    {currentMonthTransactions
                      .filter((t) => t.type === "expense")
                      .map((t) => (
                        <div
                          key={t.id}
                          className="flex justify-between items-center py-1.5 border-b border-dashed border-border/50 last:border-0"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-foreground">{t.description || t.category}</span>
                            {t.is_advance_payment && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 h-4 bg-blue-500/10 text-blue-600 border-blue-500/30"
                              >
                                Antecipado
                              </Badge>
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
                    {expenseCategories.map((cat) => (
                      <div
                        key={cat.name}
                        className="flex justify-between items-center py-1.5 border-b border-dashed border-border/50 last:border-0"
                      >
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
                  <div
                    className={`flex justify-between items-center p-3 rounded-xl ${profit >= 0 ? "bg-success/10" : "bg-destructive/10"}`}
                  >
                    <span className="text-base font-bold text-foreground">Lucro Líquido</span>
                    <span className={`text-xl font-bold ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                      R$ {profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {totalIncome > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Margem de lucro:{" "}
                      <span className={`font-bold ${profit >= 0 ? "text-success" : "text-destructive"}`}>
                        {((profit / totalIncome) * 100).toFixed(1)}%
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
>>>>>>> 549c9686e5871bafbff37c2506b54cb9a6974104
      </Tabs>
    </Layout>
  );
}
