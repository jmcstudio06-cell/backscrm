import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PartyPopper,
  RotateCcw,
  HelpCircle,
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [finished, setFinished] = useState(false);

  const currentItem = items[currentIndex];
  const progress = Math.round(((currentIndex) / items.length) * 100);

  const handleAnswer = (answer: boolean | null) => {
    const newAnswers = { ...answers, [currentItem.id]: answer };
    setAnswers(newAnswers);

    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
      onComplete(newAnswers);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
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
    const yesCount = Object.values(answers).filter((a) => a === true).length;
    const noCount = Object.values(answers).filter((a) => a === false).length;
    const unsureCount = Object.values(answers).filter((a) => a === null).length;
    const percentage = Math.round((yesCount / items.length) * 100);
    const isPerfect = yesCount === items.length;
    const pendingItems = items.filter((item) => answers[item.id] !== true);

    return (
      <div className="space-y-6">
        {/* Result Header */}
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
            {isPerfect ? "🔥 100% Pronto!" : `${percentage}% concluído`}
          </h2>
          <p className="text-muted-foreground">
            {isPerfect
              ? "Seu checklist está completo! Vai arrasar no show! 🎤"
              : `Faltam ${noCount + unsureCount} ${noCount + unsureCount === 1 ? "item" : "itens"} para ficar 100%`}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 text-center border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{yesCount}</p>
            <p className="text-xs text-green-600/80">Sim</p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4 text-center border border-red-200 dark:border-red-800">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-red-600">{noCount}</p>
            <p className="text-xs text-red-600/80">Não</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 text-center border border-amber-200 dark:border-amber-800">
            <HelpCircle className="w-6 h-6 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-amber-600">{unsureCount}</p>
            <p className="text-xs text-amber-600/80">Não sei</p>
          </div>
        </div>

        {/* Pending items */}
        {!isPerfect && pendingItems.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              O que falta fazer:
            </h3>
            <div className="space-y-3">
              {pendingItems.map((item) => {
                const answer = answers[item.id];
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border",
                      answer === false
                        ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800"
                        : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                    )}
                  >
                    {answer === false ? (
                      <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    ) : (
                      <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    )}
                    <span className="text-sm text-foreground">{item.item}</span>
                    <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                      {answer === false ? "Não feito" : "Verificar"}
                    </Badge>
                  </div>
                );
              })}
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

  // Question screen
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Pergunta {currentIndex + 1} de {items.length}
          </span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="bg-card rounded-xl border border-border p-8 text-center min-h-[250px] flex flex-col items-center justify-center">
        <Badge variant="outline" className="mb-6 text-xs">
          {showTitle}
        </Badge>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 max-w-md">
          {currentItem.item}
        </h2>
        <p className="text-muted-foreground text-sm">Você já fez isso?</p>
      </div>

      {/* Answer buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          size="lg"
          className="h-16 flex flex-col gap-1 border-green-300 hover:bg-green-50 hover:border-green-500 dark:border-green-700 dark:hover:bg-green-950/30"
          onClick={() => handleAnswer(true)}
        >
          <CheckCircle2 className="w-6 h-6 text-green-500" />
          <span className="text-xs font-medium">Sim ✅</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-16 flex flex-col gap-1 border-red-300 hover:bg-red-50 hover:border-red-500 dark:border-red-700 dark:hover:bg-red-950/30"
          onClick={() => handleAnswer(false)}
        >
          <XCircle className="w-6 h-6 text-red-500" />
          <span className="text-xs font-medium">Não ❌</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="h-16 flex flex-col gap-1 border-amber-300 hover:bg-amber-50 hover:border-amber-500 dark:border-amber-700 dark:hover:bg-amber-950/30"
          onClick={() => handleAnswer(null)}
        >
          <HelpCircle className="w-6 h-6 text-amber-500" />
          <span className="text-xs font-medium">Não sei 🤷</span>
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        <Button variant="ghost" onClick={onBack}>
          Sair
        </Button>
      </div>
    </div>
  );
}