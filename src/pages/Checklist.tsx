import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

const upcomingShows = [
  {
    id: 1,
    name: "Casamento Silva & Santos",
    date: "2024-01-20",
    location: "Espaço Garden",
    time: "19:00",
    tasksCompleted: 3,
    totalTasks: 5,
    status: "pending",
  },
  {
    id: 2,
    name: "Aniversário 50 anos",
    date: "2024-01-25",
    location: "Salão de Festas Premium",
    time: "20:00",
    tasksCompleted: 0,
    totalTasks: 5,
    status: "not-started",
  },
  {
    id: 3,
    name: "Festa Corporativa TechCorp",
    date: "2024-01-28",
    location: "Hotel Marriott",
    time: "20:00",
    tasksCompleted: 5,
    totalTasks: 5,
    status: "completed",
  },
  {
    id: 4,
    name: "Formatura Medicina USP",
    date: "2024-02-05",
    location: "Buffet Elegance",
    time: "22:00",
    tasksCompleted: 2,
    totalTasks: 5,
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
  const [selectedShow, setSelectedShow] = useState<number | null>(null);

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
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Show Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {upcomingShows.map((show) => {
          const progress = Math.round((show.tasksCompleted / show.totalTasks) * 100);
          const statusConfig = getStatusConfig(show.status);
          const StatusIcon = statusConfig.icon;

          return (
            <button
              key={show.id}
              onClick={() => setSelectedShow(selectedShow === show.id ? null : show.id)}
              className={cn(
                "bg-card rounded-xl border p-4 text-left transition-all hover:shadow-md group",
                selectedShow === show.id ? "border-primary ring-1 ring-primary" : "border-border"
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
                    {show.tasksCompleted}/{show.totalTasks}
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
                <ChevronRight className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform",
                  selectedShow === show.id && "rotate-90 text-primary"
                )} />
              </div>
            </button>
          );
        })}
      </div>
    </Layout>
  );
}
