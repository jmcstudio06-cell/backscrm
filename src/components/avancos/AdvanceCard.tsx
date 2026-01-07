import { useState } from "react";
import { Check, Trash2, Target, Music, Video, Users, Briefcase, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Advance } from "@/hooks/useAdvances";
import Confetti from "react-confetti";

interface AdvanceCardProps {
  advance: Advance;
  onComplete: (id: string) => Promise<boolean>;
  onDelete: (id: string) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  shows: Target,
  musica: Music,
  conteudo: Video,
  contatos: Users,
  organizacao: Briefcase,
};

const categoryLabels: Record<string, string> = {
  shows: "Shows",
  musica: "Música",
  conteudo: "Conteúdo",
  contatos: "Contatos",
  organizacao: "Organização",
};

export function AdvanceCard({ advance, onComplete, onDelete }: AdvanceCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const Icon = categoryIcons[advance.category] || Target;

  const handleComplete = async () => {
    setIsCompleting(true);
    const success = await onComplete(advance.id);
    
    if (success) {
      setShowConfetti(true);
      setShowMessage(true);
      
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      setTimeout(() => {
        setShowMessage(false);
      }, 2500);
    }
    setIsCompleting(false);
  };

  if (advance.completed) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 opacity-60">
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <Check className="w-4 h-4 text-green-500" />
        </div>
        <span className="flex-1 line-through text-muted-foreground text-sm">
          {advance.title}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(advance.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={150}
          gravity={0.3}
        />
      )}
      
      {showMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-background/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg border animate-scale-in">
            <p className="text-lg font-medium text-center">
              ✨ Avanço concluído. Sua carreira agradece.
            </p>
          </div>
        </div>
      )}
      
      <div
        className={cn(
          "flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-sm",
          advance.priority === "importante"
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-border bg-card"
        )}
      >
        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110",
            advance.priority === "importante"
              ? "border-amber-500 hover:bg-amber-500/20"
              : "border-primary hover:bg-primary/20"
          )}
        >
          <Check className="w-4 h-4 opacity-0 group-hover:opacity-100" />
        </button>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{advance.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Icon className="w-3 h-3" />
              {categoryLabels[advance.category] || advance.category}
            </span>
            {advance.priority === "importante" && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                <Star className="w-3 h-3 fill-current" />
                Importante
              </span>
            )}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => onDelete(advance.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </>
  );
}
