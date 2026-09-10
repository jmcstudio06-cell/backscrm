import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, MoreVertical, Clock, FileText, Send, CheckCircle2, Archive } from "lucide-react";
import { cn } from "@/lib/utils";
import { Budget } from "@/hooks/useBudgets";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const stages = [
  { id: "created", name: "Orçamento Criado", short: "Criado", color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50", borderColor: "border-blue-200", Icon: FileText },
  { id: "sent", name: "Orçamento Enviado", short: "Enviado", color: "bg-yellow-500", textColor: "text-yellow-700", bgLight: "bg-yellow-50", borderColor: "border-yellow-200", Icon: Send },
  { id: "sold", name: "Orçamento Vendido", short: "Vendido", color: "bg-green-500", textColor: "text-green-700", bgLight: "bg-green-50", borderColor: "border-green-200", Icon: CheckCircle2 },
  { id: "archived", name: "Arquivados", short: "Arquivado", color: "bg-gray-400", textColor: "text-gray-600", bgLight: "bg-gray-50", borderColor: "border-gray-200", Icon: Archive },
];

interface Props {
  budgets: Budget[];
  onView: (b: Budget) => void;
  onEdit: (b: Budget) => void;
  onDelete: (id: string) => void;
  onChangeStage: (b: Budget, newStage: string) => void;
}

const formatBRL = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

const daysIn = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
};

export function BudgetKanbanView({ budgets, onView, onEdit, onDelete, onChangeStage }: Props) {
  const getByStage = (id: string) => budgets.filter((b) => b.status === id);

  const handleDragStart = (e: React.DragEvent, b: Budget) => {
    e.dataTransfer.setData("budgetId", b.id);
    e.dataTransfer.setData("currentStage", b.status);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("budgetId");
    const current = e.dataTransfer.getData("currentStage");
    if (current !== newStage) {
      const b = budgets.find((x) => x.id === id);
      if (b) onChangeStage(b, newStage);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {stages.map((stage) => {
        const list = getByStage(stage.id);
        const StageIcon = stage.Icon;
        const stageTotal = list.reduce((sum, b) => sum + Number(b.total || 0), 0);
        return (
          <div
            key={stage.id}
            className={cn("rounded-xl border-2 p-3 min-h-[400px] flex flex-col", stage.borderColor, stage.bgLight)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white", stage.color)}>
                  <StageIcon className="w-3.5 h-3.5" />
                </div>
                <h3 className={cn("text-xs font-semibold", stage.textColor)}>{stage.short}</h3>
              </div>
              <Badge variant="secondary" className="h-5 min-w-5 text-[10px]">{list.length}</Badge>
            </div>
            {stage.id !== "archived" && (
              <p className={cn("text-[10px] font-semibold mb-3", stage.textColor)}>
                {formatBRL(stageTotal)} parado
              </p>
            )}
            {stage.id === "archived" && <div className="mb-3" />}

            <div className="flex-1 space-y-2">
              {list.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">Vazio</div>
              ) : (
                list.map((b) => {
                  const days = daysIn(b.stage_changed_at || b.created_at);
                  const daysUntilArchive = stage.id === "archived" ? null : Math.max(0, 30 - days);
                  return (
                    <div
                      key={b.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, b)}
                      className="bg-card rounded-lg border border-border p-2.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h4 className="font-medium text-xs truncate flex-1 text-foreground">{b.client_name}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 -mt-1 -mr-1">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border">
                            {stages.filter((s) => s.id !== b.status).map((s) => (
                              <DropdownMenuItem key={s.id} onClick={() => onChangeStage(b, s.id)}>
                                Mover para {s.short}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mb-1.5">{b.budget_number}</p>
                      <p className="text-xs font-semibold text-success mb-2">{formatBRL(Number(b.total))}</p>

                      <div className="flex items-center gap-1 mb-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {days}d nesta etapa
                          {daysUntilArchive !== null && daysUntilArchive <= 7 && (
                            <span className="text-warning"> · arquiva em {daysUntilArchive}d</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 gap-1 text-[11px] px-1.5"
                          onClick={() => onView(b)}
                        >
                          <Eye className="w-3 h-3 shrink-0" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 gap-1 text-[11px] px-1.5"
                          onClick={() => onEdit(b)}
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive border-destructive/20 hover:bg-destructive/10"
                          onClick={() => onDelete(b.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
