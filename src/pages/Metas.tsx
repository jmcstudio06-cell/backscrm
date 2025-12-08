import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Target,
  DollarSign,
  Mic2,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const monthlyGoals = [
  {
    id: 1,
    name: "Meta de Faturamento",
    type: "financial",
    target: 50000,
    current: 38000,
    unit: "R$",
    icon: DollarSign,
    color: "success",
  },
  {
    id: 2,
    name: "Shows Realizados",
    type: "shows",
    target: 20,
    current: 15,
    unit: "",
    icon: Mic2,
    color: "primary",
  },
  {
    id: 3,
    name: "Novos Clientes",
    type: "clients",
    target: 10,
    current: 7,
    unit: "",
    icon: Users,
    color: "accent",
  },
  {
    id: 4,
    name: "Taxa de Conversão",
    type: "conversion",
    target: 25,
    current: 18,
    unit: "%",
    icon: TrendingUp,
    color: "warning",
  },
];

const allGoals = [
  { id: 1, name: "Faturar R$ 50.000 no mês", status: "in-progress", progress: 76, deadline: "2024-12-31", category: "Financeiro" },
  { id: 2, name: "Realizar 20 shows", status: "in-progress", progress: 75, deadline: "2024-12-31", category: "Shows" },
  { id: 3, name: "Conseguir 10 novos clientes", status: "in-progress", progress: 70, deadline: "2024-12-31", category: "Vendas" },
  { id: 4, name: "Aumentar taxa de conversão para 25%", status: "in-progress", progress: 72, deadline: "2024-12-31", category: "Vendas" },
  { id: 5, name: "Completar curso de marketing", status: "completed", progress: 100, deadline: "2024-11-30", category: "Aprendizado" },
  { id: 6, name: "Renovar equipamentos de som", status: "completed", progress: 100, deadline: "2024-10-15", category: "Equipamentos" },
];

const colorMap = {
  success: "bg-success text-success-foreground",
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  warning: "bg-warning text-warning-foreground",
};

export default function Metas() {
  return (
    <Layout title="Definir Metas" subtitle="Acompanhe e defina seus objetivos">
      <Tabs defaultValue="monthly" className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList className="bg-secondary">
            <TabsTrigger value="monthly">Metas do Mês</TabsTrigger>
            <TabsTrigger value="create">Criar Meta</TabsTrigger>
            <TabsTrigger value="all">Minhas Metas</TabsTrigger>
          </TabsList>
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            Nova Meta
          </Button>
        </div>

        {/* Monthly Goals Tab */}
        <TabsContent value="monthly" className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Progresso Geral" subtitle="Meta do mês">
              <div className="flex flex-col items-center py-6">
                <ProgressRing progress={73} size={160} strokeWidth={12} />
                <p className="text-lg font-semibold text-foreground mt-4">3 de 4 metas em dia</p>
                <p className="text-sm text-muted-foreground">Continue assim!</p>
              </div>
            </ChartCard>

            <ChartCard title="Resumo" className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-4">
                {monthlyGoals.map((goal) => {
                  const progress = Math.round((goal.current / goal.target) * 100);
                  const Icon = goal.icon;

                  return (
                    <div key={goal.id} className="p-4 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `bg-${goal.color}/10`)}>
                          <Icon className={cn("w-5 h-5", `text-${goal.color}`)} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{goal.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {goal.unit === "R$" ? "R$ " : ""}{goal.current.toLocaleString("pt-BR")}{goal.unit !== "R$" ? goal.unit : ""} 
                            {" de "}
                            {goal.unit === "R$" ? "R$ " : ""}{goal.target.toLocaleString("pt-BR")}{goal.unit !== "R$" ? goal.unit : ""}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className={cn("font-medium", `text-${goal.color}`)}>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>

          {/* Detailed Goals */}
          <ChartCard title="Detalhamento das Metas">
            <div className="space-y-4">
              {monthlyGoals.map((goal) => {
                const progress = Math.round((goal.current / goal.target) * 100);
                const remaining = goal.target - goal.current;
                const Icon = goal.icon;

                return (
                  <div key={goal.id} className="p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", `bg-${goal.color}/10`)}>
                          <Icon className={cn("w-6 h-6", `text-${goal.color}`)} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{goal.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Faltam {goal.unit === "R$" ? "R$ " : ""}{remaining.toLocaleString("pt-BR")}{goal.unit !== "R$" ? goal.unit : ""} para atingir a meta
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-2xl font-bold", `text-${goal.color}`)}>
                          {goal.unit === "R$" ? "R$ " : ""}{goal.current.toLocaleString("pt-BR")}{goal.unit !== "R$" ? goal.unit : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          de {goal.unit === "R$" ? "R$ " : ""}{goal.target.toLocaleString("pt-BR")}{goal.unit !== "R$" ? goal.unit : ""}
                        </p>
                      </div>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </TabsContent>

        {/* Create Goal Tab */}
        <TabsContent value="create" className="space-y-6">
          <ChartCard title="Criar Nova Meta" subtitle="Defina seus próximos objetivos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Nome da Meta</label>
                  <input
                    type="text"
                    placeholder="Ex: Faturar R$ 100.000"
                    className="w-full mt-1 p-3 rounded-lg bg-secondary border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Tipo da Meta</label>
                  <select className="w-full mt-1 p-3 rounded-lg bg-secondary border border-border text-foreground">
                    <option>Financeira</option>
                    <option>Shows</option>
                    <option>Clientes</option>
                    <option>Aprendizado</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Valor / Quantidade</label>
                  <input
                    type="number"
                    placeholder="Ex: 50000"
                    className="w-full mt-1 p-3 rounded-lg bg-secondary border border-border text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Prazo</label>
                  <input
                    type="date"
                    className="w-full mt-1 p-3 rounded-lg bg-secondary border border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Categoria</label>
                  <select className="w-full mt-1 p-3 rounded-lg bg-secondary border border-border text-foreground">
                    <option>Financeiro</option>
                    <option>Vendas</option>
                    <option>Marketing</option>
                    <option>Equipamentos</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Descrição (opcional)</label>
                  <textarea
                    placeholder="Descreva sua meta..."
                    className="w-full mt-1 p-3 rounded-lg bg-secondary border border-border text-foreground h-24"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button variant="gradient" className="w-full md:w-auto">
                <Target className="w-4 h-4 mr-2" />
                Criar Meta
              </Button>
            </div>
          </ChartCard>
        </TabsContent>

        {/* All Goals Tab */}
        <TabsContent value="all" className="space-y-6">
          <ChartCard title="Todas as Metas" subtitle="Histórico completo">
            <div className="space-y-3">
              {allGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl transition-all",
                    goal.status === "completed" ? "bg-success/10" : "bg-secondary/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    goal.status === "completed" ? "bg-success/20" : "bg-primary/10"
                  )}>
                    {goal.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Target className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">{goal.name}</h4>
                      <Badge variant="outline">{goal.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={goal.progress} className="flex-1 h-2" />
                      <span className="text-sm font-medium text-primary shrink-0">{goal.progress}%</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge
                      variant="outline"
                      className={goal.status === "completed"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-warning/10 text-warning border-warning/20"
                      }
                    >
                      {goal.status === "completed" ? (
                        <>
                          <Trophy className="w-3 h-3 mr-1" />
                          Concluída
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Em Progresso
                        </>
                      )}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
