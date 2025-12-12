import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Clock } from "lucide-react";

const upcomingShows = [
  {
    id: 1,
    name: "Casamento Silva & Santos",
    date: "2024-01-20",
    location: "Espaço Garden",
    time: "19:00",
    checklist: [
      { id: 1, task: "Confirmar horário com contratante", done: true },
      { id: 2, task: "Verificar equipamento de som", done: true },
      { id: 3, task: "Confirmar músicos", done: false },
      { id: 4, task: "Preparar setlist", done: false },
      { id: 5, task: "Transporte organizado", done: true },
    ],
  },
  {
    id: 2,
    name: "Aniversário 50 anos",
    date: "2024-01-25",
    location: "Salão de Festas Premium",
    time: "20:00",
    checklist: [
      { id: 1, task: "Confirmar horário com contratante", done: false },
      { id: 2, task: "Verificar equipamento de som", done: false },
      { id: 3, task: "Confirmar músicos", done: false },
      { id: 4, task: "Preparar setlist", done: false },
      { id: 5, task: "Transporte organizado", done: false },
    ],
  },
];

export default function Checklist() {
  return (
    <Layout title="Checklist de Show" subtitle="Organize tudo antes do evento">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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

        {/* Shows with Checklists */}
        <div className="grid gap-6">
          {upcomingShows.map((show) => {
            const completedTasks = show.checklist.filter((t) => t.done).length;
            const totalTasks = show.checklist.length;
            const progress = Math.round((completedTasks / totalTasks) * 100);

            return (
              <ChartCard key={show.id} title={show.name}>
                <div className="space-y-4">
                  {/* Show Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(show.date).toLocaleDateString("pt-BR")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{show.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{show.location}</span>
                    </div>
                    <Badge
                      variant={progress === 100 ? "default" : "secondary"}
                      className={progress === 100 ? "bg-green-500" : ""}
                    >
                      {completedTasks}/{totalTasks} tarefas
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-2">
                    {show.checklist.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox checked={item.done} />
                        <span
                          className={
                            item.done
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          }
                        >
                          {item.task}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartCard>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
