import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Filter,
  ListTodo,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Todas", count: 24, color: "bg-primary" },
  { name: "Shows", count: 8, color: "bg-accent" },
  { name: "Clientes", count: 6, color: "bg-success" },
  { name: "Financeiro", count: 5, color: "bg-warning" },
  { name: "Contratos", count: 5, color: "bg-destructive" },
];

const tasks = [
  {
    id: 1,
    title: "Enviar orçamento para Casamento Silva",
    category: "Clientes",
    dueDate: "2024-12-10",
    priority: "high",
    status: "pending",
    description: "Preparar proposta completa com banda de 5 músicos",
  },
  {
    id: 2,
    title: "Confirmar músicos para show dia 15",
    category: "Shows",
    dueDate: "2024-12-12",
    priority: "high",
    status: "pending",
    description: "Ligar para todos os músicos e confirmar disponibilidade",
  },
  {
    id: 3,
    title: "Pagar cachê dos músicos - Show anterior",
    category: "Financeiro",
    dueDate: "2024-12-08",
    priority: "high",
    status: "overdue",
    description: "Transferir pagamento via PIX",
  },
  {
    id: 4,
    title: "Renovar contrato com Hotel Marriott",
    category: "Contratos",
    dueDate: "2024-12-15",
    priority: "medium",
    status: "pending",
    description: "Revisar termos e enviar para assinatura",
  },
  {
    id: 5,
    title: "Preparar setlist para formatura",
    category: "Shows",
    dueDate: "2024-12-20",
    priority: "low",
    status: "pending",
    description: "Montar playlist com músicas dos anos 2000",
  },
  {
    id: 6,
    title: "Atualizar fotos do portfólio",
    category: "Marketing",
    dueDate: "2024-12-18",
    priority: "low",
    status: "done",
    description: "Selecionar melhores fotos dos últimos shows",
  },
];

const priorityConfig = {
  high: { label: "Alta", color: "bg-destructive/10 text-destructive border-destructive/20" },
  medium: { label: "Média", color: "bg-warning/10 text-warning border-warning/20" },
  low: { label: "Baixa", color: "bg-success/10 text-success border-success/20" },
};

const statusConfig = {
  pending: { label: "Pendente", icon: Circle },
  done: { label: "Concluída", icon: CheckCircle2 },
  overdue: { label: "Atrasada", icon: AlertTriangle },
};

export default function Tarefas() {
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [checkedTasks, setCheckedTasks] = useState<number[]>([6]);

  const filteredTasks =
    selectedCategory === "Todas"
      ? tasks
      : tasks.filter((t) => t.category === selectedCategory);

  return (
    <Layout title="Tarefas" subtitle="Organize suas atividades e compromissos">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ListTodo className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-xs text-muted-foreground">Total de Tarefas</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">18</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-xs text-muted-foreground">Atrasadas</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">6</p>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories */}
        <ChartCard title="Categorias">
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg transition-all",
                  selectedCategory === cat.name
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-secondary text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", cat.color)} />
                  <span className="text-sm font-medium">{cat.name}</span>
                </div>
                <Badge variant="secondary">{cat.count}</Badge>
              </button>
            ))}
          </div>
        </ChartCard>

        {/* Tasks List */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">
              {selectedCategory === "Todas" ? "Todas as Tarefas" : selectedCategory}
            </h3>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>

          <div className="space-y-3">
            {filteredTasks.map((task) => {
              const isChecked = checkedTasks.includes(task.id);
              const StatusIcon = statusConfig[task.status as keyof typeof statusConfig].icon;

              return (
                <div
                  key={task.id}
                  className={cn(
                    "p-4 rounded-xl glass transition-all",
                    isChecked && "opacity-60",
                    task.status === "overdue" && "border-l-4 border-l-destructive"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCheckedTasks([...checkedTasks, task.id]);
                        } else {
                          setCheckedTasks(checkedTasks.filter((id) => id !== task.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={cn(
                            "font-medium text-foreground",
                            isChecked && "line-through text-muted-foreground"
                          )}
                        >
                          {task.title}
                        </h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {task.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={priorityConfig[task.priority as keyof typeof priorityConfig].color}
                        >
                          {priorityConfig[task.priority as keyof typeof priorityConfig].label}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-xs",
                      task.status === "done" && "text-success",
                      task.status === "overdue" && "text-destructive",
                      task.status === "pending" && "text-muted-foreground"
                    )}>
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig[task.status as keyof typeof statusConfig].label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
