import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  ClipboardList
} from "lucide-react";
import { cn, formatDateBR } from "@/lib/utils";
import { useShows } from "@/contexts/shows/ShowsContext";
import { ChecklistWizard } from "@/components/checklist/ChecklistWizard";

interface ChecklistItem {
  id: string;
  item: string;
  completed: boolean;
  show_id: string;
}

const DEFAULT_CHECKLIST = [
  "Você pegou seu instrumento?",
  "Você pegou o microfone?",
  "Você pegou o pedestal de microfone?",
  "Você pegou pelo menos 5 cabos P10?",
  "Você pegou os cabos XLR do microfone?",
  "Você pegou a pedaleira ou pedal?",
  "Você pegou a fonte da pedaleira?",
  "Você pegou extensões elétricas?",
  "Você pegou filtro de linha ou régua de energia?",
  "Você pegou adaptador de tomada?",
  "Você conferiu se o local é 110v ou 220v? ⚡",
  "Você pegou suporte de celular ou tablet?",
  "Você pegou palhetas extras?",
  "Você pegou o afinador?",
  "Você pegou a caixa de som ou retorno (se for levar)?",
];

const localKey = (showId: string) => `checklist_local_${showId}`;

function loadLocalCompleted(showId: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(localKey(showId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalCompleted(showId: string, completed: Record<string, boolean>) {
  try {
    localStorage.setItem(localKey(showId), JSON.stringify(completed));
  } catch {
    /* storage indisponível — segue o jogo */
  }
}

const getStatusConfig = (tasksCompleted: number, totalTasks: number) => {
  const progress = totalTasks > 0 ? tasksCompleted / totalTasks : 0;
  if (progress === 1) {
    return { icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-50", label: "Concluído" };
  } else if (progress > 0) {
    return { icon: AlertCircle, color: "text-yellow-500", bgColor: "bg-yellow-50", label: "Em progresso" };
  }
  return { icon: Clock, color: "text-muted-foreground", bgColor: "bg-muted", label: "Não iniciado" };
};

export default function Checklist() {
  const { getConfirmedShows } = useShows();
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);
  // Estado puramente local — nada persiste no banco. Apenas localStorage por show.
  const [completedMap, setCompletedMap] = useState<Record<string, Record<string, boolean>>>({});

  const confirmedShows = getConfirmedShows();
  const selectedShow = confirmedShows.find(s => s.id === selectedShowId);

  // Carrega marcações locais salvas (se houver) ao montar / quando mudar a lista de shows
  useEffect(() => {
    if (confirmedShows.length === 0) return;
    setCompletedMap((prev) => {
      const next = { ...prev };
      confirmedShows.forEach((show) => {
        if (!next[show.id]) {
          next[show.id] = loadLocalCompleted(show.id);
        }
      });
      return next;
    });
  }, [confirmedShows.length]);

  const getShowTasks = (showId: string): ChecklistItem[] => {
    const completed = completedMap[showId] || {};
    return DEFAULT_CHECKLIST.map((item, index) => {
      const id = `${showId}-${index}`;
      return {
        id,
        item,
        completed: !!completed[id],
        show_id: showId,
      };
    });
  };

  const handleWizardComplete = (answers: Record<string, boolean | null>) => {
    if (!selectedShowId) return;
    const normalized: Record<string, boolean> = {};
    Object.entries(answers).forEach(([id, value]) => {
      normalized[id] = value === true;
    });
    saveLocalCompleted(selectedShowId, normalized);
    setCompletedMap((prev) => ({ ...prev, [selectedShowId]: normalized }));
  };

  // Wizard view — go straight to toggle checklist
  if (selectedShow) {
    const tasks = getShowTasks(selectedShow.id);
    return (
      <Layout title="Checklist de Show" subtitle={selectedShow.title}>
        <ChecklistWizard
          items={tasks}
          showTitle={selectedShow.title}
          onComplete={handleWizardComplete}
          onBack={() => setSelectedShowId(null)}
        />
      </Layout>
    );
  }

  // Shows list
  return (
    <Layout title="Checklist de Show" subtitle="Organize tudo antes do evento">
      <div className="mb-6">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          Apenas shows confirmados
        </Badge>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {confirmedShows.map((show) => {
            const tasks = getShowTasks(show.id);
            const completedCount = tasks.filter(t => t.completed).length;
            const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
            const statusConfig = getStatusConfig(completedCount, tasks.length);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={show.id}
                onClick={() => setSelectedShowId(show.id)}
                className="bg-card rounded-xl border border-border p-4 text-left transition-all hover:shadow-md group cursor-pointer"
              >
                <div className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mb-3",
                  statusConfig.bgColor,
                  statusConfig.color
                )}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </div>

                <h3 className="font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                  {show.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateBR(show.date)}</span>
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

                <div className="mt-3">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedShowId(show.id);
                    }}
                  >
                    <ClipboardList className="w-4 h-4 mr-1" />
                    Fazer Checklist
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </Layout>
  );
}
