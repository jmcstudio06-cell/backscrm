import { useState } from "react";
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
  Calendar,
  CreditCard,
  Wallet,
  PiggyBank,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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

const monthlyData = [
  { month: "Jul", receita: 28000, despesa: 12000 },
  { month: "Ago", receita: 32000, despesa: 14000 },
  { month: "Set", receita: 35000, despesa: 13000 },
  { month: "Out", receita: 38000, despesa: 15000 },
  { month: "Nov", receita: 42000, despesa: 16000 },
  { month: "Dez", receita: 45000, despesa: 18000 },
];

const expenseCategories = [
  { name: "Músicos", value: 8000, color: "hsl(var(--primary))" },
  { name: "Transporte", value: 3500, color: "hsl(var(--accent))" },
  { name: "Equipamentos", value: 2800, color: "hsl(var(--success))" },
  { name: "Marketing", value: 2200, color: "hsl(var(--warning))" },
  { name: "Outros", value: 1500, color: "hsl(var(--muted-foreground))" },
];

const recentTransactions = [
  { id: 1, description: "Show Casamento Silva", type: "income", value: 8500, date: "2024-12-15", category: "Shows" },
  { id: 2, description: "Pagamento músicos", type: "expense", value: 2500, date: "2024-12-14", category: "Músicos" },
  { id: 3, description: "Aluguel equipamento som", type: "expense", value: 800, date: "2024-12-13", category: "Equipamentos" },
  { id: 4, description: "Show Evento Corporativo", type: "income", value: 12000, date: "2024-12-12", category: "Shows" },
  { id: 5, description: "Combustível viagem", type: "expense", value: 450, date: "2024-12-11", category: "Transporte" },
];

export default function Financeiro() {
  return (
    <Layout title="Financeiro" subtitle="Gerencie suas finanças e relatórios">
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
              value="R$ 45.000"
              icon={TrendingUp}
              trend={{ value: 12, isPositive: true }}
              gradient="success"
            />
            <StatCard
              title="Despesas Mensais"
              value="R$ 18.000"
              icon={TrendingDown}
              trend={{ value: 8, isPositive: false }}
              gradient="danger"
            />
            <StatCard
              title="Lucro Líquido"
              value="R$ 27.000"
              icon={DollarSign}
              trend={{ value: 15, isPositive: true }}
              gradient="primary"
            />
            <StatCard
              title="Saldo em Conta"
              value="R$ 85.400"
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
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="hsl(var(--success))"
                    fillOpacity={1}
                    fill="url(#colorReceita)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="despesa"
                    stroke="hsl(var(--destructive))"
                    fillOpacity={1}
                    fill="url(#colorDespesa)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Despesas por Categoria">
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
                  <Tooltip />
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
                      R$ {cat.value.toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Alerts & Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Alertas Financeiros">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Pagamento pendente</p>
                    <p className="text-xs text-muted-foreground">Cachê músicos - R$ 2.500 vence em 3 dias</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Despesa alta</p>
                    <p className="text-xs text-muted-foreground">Transporte acima do orçamento este mês</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-success/10">
                  <PiggyBank className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Meta atingida!</p>
                    <p className="text-xs text-muted-foreground">Lucro mensal superou R$ 25.000</p>
                  </div>
                </div>
              </div>
            </ChartCard>

            <ChartCard
              title="Transações Recentes"
              className="lg:col-span-2"
              action={
                <Button variant="ghost" size="sm" className="text-primary">
                  Ver todas
                </Button>
              }
            >
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
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
                        <p className="text-sm font-medium text-foreground">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">{transaction.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction.type === "income" ? "text-success" : "text-destructive"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"} R${" "}
                        {transaction.value.toLocaleString("pt-BR")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
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
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Nova Despesa
              </Button>
            </div>
          </div>

          <ChartCard title="Lista de Despesas">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions
                  .filter((t) => t.type === "expense")
                  .map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium text-foreground">{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-destructive font-semibold">
                        - R$ {expense.value.toLocaleString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
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
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Nova Receita
              </Button>
            </div>
          </div>

          <ChartCard title="Lista de Receitas">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions
                  .filter((t) => t.type === "income")
                  .map((income) => (
                    <TableRow key={income.id}>
                      <TableCell className="font-medium text-foreground">{income.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{income.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(income.date).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-success font-semibold">
                        + R$ {income.value.toLocaleString("pt-BR")}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </ChartCard>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-foreground">Relatórios Financeiros</h3>
            <Button variant="gradient">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Relatório Mensal">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Receita Total</span>
                  <span className="font-bold text-success">R$ 45.000</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">Despesa Total</span>
                  <span className="font-bold text-destructive">R$ 18.000</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                  <span className="text-foreground font-medium">Lucro Líquido</span>
                  <span className="font-bold text-primary">R$ 27.000</span>
                </div>
              </div>
            </ChartCard>

            <ChartCard title="Comparação de Períodos">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData.slice(-3)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="receita" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesa" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
