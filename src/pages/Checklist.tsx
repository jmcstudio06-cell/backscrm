import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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
import { useShows, Show } from "@/contexts/ShowsContext";

interface ChecklistItem {
  id: string;
  item: string;
  completed: boolean;
  show_id: string;
}

const getStatusConfig = (tasksCompleted: number, totalTasks: number) => {
  const progress = totalTasks > 0 ? tasksCompleted / totalTasks : 0;
  if (progress === 1) {
    return { icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-50", label: "Concluído" };
  } else if (progress > 0) {
    return { icon: AlertCircle, color: "text-yellow-500", bgColor: "bg-yellow-50", label: "Em progresso" };
  }
  return { icon: Clock, color: "text-gray-400", bgColor: "bg-gray-50", label: "Não iniciado" };
};

export default function Checklist() {
  const { getConfirmedShows } = useShows();
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  const [checklistItems, setChecklistItems] = useState<Record<string, ChecklistItem[]>>({});

  const confirmedShows = getConfirmedShows();
  const selectedShow = confirmedShows.find(s => s.id === selectedShowId);

  // Fetch checklist items for all confirmed shows
  useEffect(() => {
    const fetchChecklistItems = async () => {
      if (confirmedShows.length === 0) return;
      
      const showIds = confirmedShows.map(s => s.id);
      const { data, error } = await supabase
        .from("show_checklist")
        .select("*")
        .in("show_id", showIds);

      if (error) {
        console.error("Error fetching checklist:", error);
        return;
      }

      const grouped: Record<string, ChecklistItem[]> = {};
      (data || []).forEach(item => {
        if (!grouped[item.show_id]) grouped[item.show_id] = [];
        grouped[item.show_id].push(item);
      });
      setChecklistItems(grouped);
    };

    fetchChecklistItems();
  }, [confirmedShows.length]);

  const getShowTasks = (showId: string) => checklistItems[showId] || [];

  const handleTaskToggle = async (showId: string, taskId: string, currentState: boolean) => {
    const { error } = await supabase
      .from("show_checklist")
      .update({ completed: !currentState })
      .eq("id", taskId);

    if (error) {
      toast.error("Erro ao atualizar tarefa");
      return;
    }

    setChecklistItems(prev => ({
      ...prev,
      [showId]: prev[showId].map(t => t.id === taskId ? { ...t, completed: !currentState } : t)
    }));
    toast.success("Tarefa atualizada!");
  };

  const handleAddTask = async (showId: string) => {
    const taskText = prompt("Digite o nome da nova tarefa:");
    if (!taskText) return;

    const { data, error } = await supabase
      .from("show_checklist")
      .insert([{ show_id: showId, item: taskText, completed: false }])
      .select()
      .single();

    if (error) {
      toast.error("Erro ao adicionar tarefa");
      return;
    }

    setChecklistItems(prev => ({
      ...prev,
      [showId]: [...(prev[showId] || []), data]
    }));
    toast.success("Tarefa adicionada!");
  };

  const handleDeleteTask = async (showId: string, taskId: string) => {
    const { error } = await supabase
      .from("show_checklist")
      .delete()
      .eq("id", taskId);

    if (error) {
      toast.error("Erro ao remover tarefa");
      return;
    }

    setChecklistItems(prev => ({
      ...prev,
      [showId]: prev[showId].filter(t => t.id !== taskId)
    }));
    toast.success("Tarefa removida!");
  };

  if (selectedShow) {
    const tasks = getShowTasks(selectedShow.id);
    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

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
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-bold text-foreground">{selectedShow.title}</h2>
            <Badge className="bg-primary">Confirmado</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(selectedShow.date).toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{selectedShow.start_time || "Horário não definido"}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{selectedShow.venue || "Local não definido"}</span>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{completedCount}/{tasks.length} tarefas</span>
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
            {tasks.length > 0 ? (
              tasks.map((task) => (
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
                      onCheckedChange={() => handleTaskToggle(selectedShow.id, task.id, task.completed)}
                    />
                    <span className={cn(
                      "text-sm",
                      task.completed && "line-through text-muted-foreground"
                    )}>
                      {task.item}
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
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma tarefa cadastrada. Adicione uma tarefa acima.
              </p>
            )}
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
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Apenas shows confirmados
          </Badge>
        </div>
      </div>

      {confirmedShows.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum show confirmado</h3>
          <p className="text-muted-foreground">
            Quando você confirmar um show na Agenda, ele aparecerá aqui para gerenciar o checklist.
          </p>
        </div>
      ) : (
        /* Show Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {confirmedShows.map((show) => {
            const tasks = getShowTasks(show.id);
            const completedCount = tasks.filter(t => t.completed).length;
            const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
            const statusConfig = getStatusConfig(completedCount, tasks.length);
            const StatusIcon = statusConfig.icon;

            return (
              <button
                key={show.id}
                onClick={() => setSelectedShowId(show.id)}
                className="bg-card rounded-xl border border-border p-4 text-left transition-all hover:shadow-md group"
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
                  {show.title}
                </h3>

                {/* Show Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(show.date).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{show.start_time || "Horário não definido"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{show.venue || "Local não definido"}</span>
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
                      {completedCount}/{tasks.length}
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
      )}
    </Layout>
  );
}
