import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowLeft,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface Show {
  id: number;
  name: string;
  date: string;
  location: string;
  time: string;
  tasks: Task[];
  status: string;
}

const initialShows: Show[] = [
  {
    id: 1,
    name: "Casamento Silva & Santos",
    date: "2024-01-20",
    location: "Espaço Garden",
    time: "19:00",
    tasks: [
      { id: 1, text: "Confirmar equipe", completed: true },
      { id: 2, text: "Verificar equipamentos", completed: true },
      { id: 3, text: "Preparar setlist", completed: true },
      { id: 4, text: "Contatar cliente", completed: false },
      { id: 5, text: "Checar transporte", completed: false },
    ],
    status: "pending",
  },
  {
    id: 2,
    name: "Aniversário 50 anos",
    date: "2024-01-25",
    location: "Salão de Festas Premium",
    time: "20:00",
    tasks: [
      { id: 1, text: "Confirmar equipe", completed: false },
      { id: 2, text: "Verificar equipamentos", completed: false },
      { id: 3, text: "Preparar setlist", completed: false },
      { id: 4, text: "Contatar cliente", completed: false },
      { id: 5, text: "Checar transporte", completed: false },
    ],
    status: "not-started",
  },
  {
    id: 3,
    name: "Festa Corporativa TechCorp",
    date: "2024-01-28",
    location: "Hotel Marriott",
    time: "20:00",
    tasks: [
      { id: 1, text: "Confirmar equipe", completed: true },
      { id: 2, text: "Verificar equipamentos", completed: true },
      { id: 3, text: "Preparar setlist", completed: true },
      { id: 4, text: "Contatar cliente", completed: true },
      { id: 5, text: "Checar transporte", completed: true },
    ],
    status: "completed",
  },
  {
    id: 4,
    name: "Formatura Medicina USP",
    date: "2024-02-05",
    location: "Buffet Elegance",
    time: "22:00",
    tasks: [
      { id: 1, text: "Confirmar equipe", completed: true },
      { id: 2, text: "Verificar equipamentos", completed: true },
      { id: 3, text: "Preparar setlist", completed: false },
      { id: 4, text: "Contatar cliente", completed: false },
      { id: 5, text: "Checar transporte", completed: false },
    ],
    status: "pending",
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return { icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-200", label: "Concluído" };
    case "pending":
      return { icon: AlertCircle, color: "text-yellow-500", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", label: "Em progresso" };
    default:
      return { icon: Clock, color: "text-gray-400", bgColor: "bg-gray-50", borderColor: "border-gray-200", label: "Não iniciado" };
  }
};

export default function Checklist() {
  const [shows, setShows] = useState<Show[]>(initialShows);
  const [selectedShowId, setSelectedShowId] = useState<number | null>(null);

  const selectedShow = shows.find(s => s.id === selectedShowId);

  const handleTaskToggle = (showId: number, taskId: number) => {
    setShows(shows.map(show => {
      if (show.id === showId) {
        const updatedTasks = show.tasks.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const newStatus = completedCount === updatedTasks.length 
          ? "completed" 
          : completedCount > 0 
            ? "pending" 
            : "not-started";
        return { ...show, tasks: updatedTasks, status: newStatus };
      }
      return show;
    }));
    toast.success("Tarefa atualizada!");
  };

  const handleAddTask = (showId: number) => {
    const taskText = prompt("Digite o nome da nova tarefa:");
    if (taskText) {
      setShows(shows.map(show => {
        if (show.id === showId) {
          const newTask = { id: show.tasks.length + 1, text: taskText, completed: false };
          return { ...show, tasks: [...show.tasks, newTask] };
        }
        return show;
      }));
      toast.success("Tarefa adicionada!");
    }
  };

  const handleDeleteTask = (showId: number, taskId: number) => {
    setShows(shows.map(show => {
      if (show.id === showId) {
        const updatedTasks = show.tasks.filter(task => task.id !== taskId);
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const newStatus = updatedTasks.length === 0 
          ? "not-started"
          : completedCount === updatedTasks.length 
            ? "completed" 
            : completedCount > 0 
              ? "pending" 
              : "not-started";
        return { ...show, tasks: updatedTasks, status: newStatus };
      }
      return show;
    }));
    toast.success("Tarefa removida!");
  };

  if (selectedShow) {
    const completedCount = selectedShow.tasks.filter(t => t.completed).length;
    const progress = Math.round((completedCount / selectedShow.tasks.length) * 100);

    return (
      <Layout title="Checklist de Show" subtitle="Organize tudo antes do evento">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => setSelectedShowId(null)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos shows
        </Button>

        {/* Show Header */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">{selectedShow.name}</h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(selectedShow.date).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{selectedShow.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{selectedShow.location}</span>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{completedCount}/{selectedShow.tasks.length} tarefas</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all",
                  progress === 100 ? "bg-green-500" : "bg-primary"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Tarefas</h3>
            <Button size="sm" onClick={() => handleAddTask(selectedShow.id)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
          
          <div className="space-y-3">
            {selectedShow.tasks.map((task) => (
              <div 
                key={task.id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all",
                  task.completed 
                    ? "bg-green-50 border-green-200" 
                    : "bg-muted/50 border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={() => handleTaskToggle(selectedShow.id, task.id)}
                  />
                  <span className={cn(
                    "text-sm",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.text}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteTask(selectedShow.id, task.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Checklist de Show" subtitle="Organize tudo antes do evento">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            Todos os Shows
          </Button>
          <Button variant="ghost" size="sm">
            Próximos 7 dias
          </Button>
        </div>
      </div>

      {/* Show Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {shows.map((show) => {
          const completedCount = show.tasks.filter(t => t.completed).length;
          const progress = Math.round((completedCount / show.tasks.length) * 100);
          const statusConfig = getStatusConfig(show.status);
          const StatusIcon = statusConfig.icon;

          return (
            <button
              key={show.id}
              onClick={() => setSelectedShowId(show.id)}
              className={cn(
                "bg-card rounded-xl border p-4 text-left transition-all hover:shadow-md group border-border"
              )}
            >
              {/* Status Badge */}
              <div className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mb-3",
                statusConfig.bgColor,
                statusConfig.color
              )}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </div>

              {/* Show Name */}
              <h3 className="font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                {show.name}
              </h3>

              {/* Show Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(show.date).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{show.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{show.location}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <Badge
                    variant={progress === 100 ? "default" : "secondary"}
                    className={cn(progress === 100 && "bg-green-500")}
                  >
                    {completedCount}/{show.tasks.length}
                  </Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      progress === 100 ? "bg-green-500" : "bg-primary"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Arrow indicator */}
              <div className="flex justify-end mt-3">
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </Layout>
  );
}