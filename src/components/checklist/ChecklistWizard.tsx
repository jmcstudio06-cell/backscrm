import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  PartyPopper,
  RotateCcw,
  HelpCircle,
  Save,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  item: string;
  completed: boolean;
  show_id: string;
}

interface ChecklistWizardProps {
  items: ChecklistItem[];
  showTitle: string;
  onComplete: (answers: Record<string, boolean | null>) => void;
  onBack: () => void;
}

export function ChecklistWizard({ items, showTitle, onComplete, onBack }: ChecklistWizardProps) {
  const [answers, setAnswers] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      initial[item.id] = item.completed;
    });
    return initial;
  });
  const [finished, setFinished] = useState(false);

  const yesCount = Object.values(answers).filter((a) => a === true).length;
  const noCount = Object.values(answers).filter((a) => a === false).length;
  const progress = items.length > 0 ? Math.round((yesCount / items.length) * 100) : 0;

  const handleToggle = (itemId: string) => {
    setAnswers((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleSave = () => {
    setFinished(true);
    onComplete(answers);
  };

  const handleRestart = () => {
    const reset: Record<string, boolean> = {};
    items.forEach((item) => {
      reset[item.id] = false;
    });
    setAnswers(reset);
    setFinished(false);
  };

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma tarefa no checklist</h3>
        <p className="text-muted-foreground mb-4">
          Adicione tarefas ao checklist deste show primeiro.
        </p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  // Results screen
  if (finished) {
    const isPerfect = yesCount === items.length;
    const pendingItems = items.filter((item) => !answers[item.id]);

    return (
      <div className="space-y-6">
        <div className={cn(
          "rounded-xl border p-8 text-center",
          isPerfect
            ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
            : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
        )}>
          {isPerfect ? (
            <PartyPopper className="w-16 h-16 text-green-500 mx-auto mb-4" />
          ) : (
            <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          )}
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {isPerfect ? "🔥 100% Pronto!" : `${progress}% concluído`}
          </h2>
          <p className="text-muted-foreground">
            {isPerfect
              ? "Seu checklist está completo! Vai arrasar no show! 🎤"
              : `Faltam ${noCount} ${noCount === 1 ? "item" : "itens"} para ficar 100%`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{yesCount}</p>
            <p className="text-xs text-green-600/80">Sim</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 text-center border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">{noCount}</p>
            <p className="text-xs text-red-600/80">Não</p>
          </div>
        </div>

        {/* Pending items */}
        {!isPerfect && pendingItems.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              O que falta pegar/fazer:
            </h3>
            <div className="space-y-2">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                >
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-sm text-foreground">{item.item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos shows
          </Button>
          <Button onClick={handleRestart} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" />
            Refazer Checklist
          </Button>
        </div>
      </div>
    );
  }

  // Toggle list screen
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Badge variant="outline" className="mb-2 text-xs">
            {showTitle}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {yesCount}/{items.length} itens prontos — {progress}%
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className={cn(
            "h-2.5 rounded-full transition-all duration-300",
            progress === 100 ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist items with toggles */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {items.map((item, index) => {
          const isChecked = answers[item.id] ?? false;
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-center justify-between gap-4 p-4 transition-colors cursor-pointer",
                isChecked
                  ? "bg-green-50/50 dark:bg-green-950/20"
                  : "bg-red-50/30 dark:bg-red-950/10"
              )}
              onClick={(e) => {
                // Avoid double-toggle when clicking the Switch itself
                if ((e.target as HTMLElement).closest('button[role="switch"]')) return;
                handleToggle(item.id);
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-muted-foreground w-6 shrink-0 text-right">
                  {index + 1}.
                </span>
                <span className={cn(
                  "text-sm",
                  isChecked ? "text-green-700 dark:text-green-400" : "text-foreground"
                )}>
                  {item.item}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn(
                  "text-xs font-bold min-w-[32px] text-center",
                  isChecked ? "text-green-600" : "text-red-500"
                )}>
                  {isChecked ? "SIM" : "NÃO"}
                </span>
                <Switch
                  checked={isChecked}
                  onCheckedChange={() => handleToggle(item.id)}
                  className={cn(
                    "shrink-0",
                    isChecked
                      ? "data-[state=checked]:bg-green-500"
                      : "data-[state=unchecked]:bg-red-400"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleSave}
      >
        <Save className="w-5 h-5 mr-2" />
        Salvar Checklist
      </Button>
    </div>
  );
}
