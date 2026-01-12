import { Lock, Check, Play, ExternalLink, Download, BookOpen, Gift, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BonusWithProgress } from "@/hooks/useBonuses";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BonusCardProps {
  bonus: BonusWithProgress;
  index: number;
  onComplete: (bonusId: string) => void;
  onView: (bonus: BonusWithProgress) => void;
}

const contentTypeIcons = {
  video: Play,
  link: ExternalLink,
  download: Download,
  lesson: BookOpen
};

const contentTypeLabels = {
  video: "Vídeo",
  link: "Link",
  download: "Download",
  lesson: "Aula"
};

export function BonusCard({ bonus, index, onComplete, onView }: BonusCardProps) {
  const Icon = contentTypeIcons[bonus.content_type];
  const isLocked = bonus.status === "locked";
  const isCompleted = bonus.status === "completed";
  const isAvailable = bonus.status === "available";

  const handleAccess = () => {
    if (isLocked) return;
    
    onView(bonus);
    
    // Auto-complete based on rule
    if (bonus.completion_rule === "click" && !isCompleted) {
      onComplete(bonus.id);
    }
  };

  return (
    <div 
      className={`
        relative flex flex-col md:flex-row gap-4 p-5 rounded-xl border-2 transition-all
        ${isCompleted 
          ? "bg-green-500/5 border-green-500/30" 
          : isAvailable 
            ? "bg-card border-primary/30 hover:border-primary/50 cursor-pointer" 
            : "bg-muted/30 border-muted opacity-60"
        }
      `}
      onClick={handleAccess}
    >
      {/* Index badge */}
      <div 
        className={`
          absolute -left-3 -top-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
          ${isCompleted 
            ? "bg-green-500 text-white" 
            : isAvailable 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground"
          }
        `}
      >
        {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
      </div>

      {/* Thumbnail */}
      {bonus.thumbnail && (
        <div className="w-full md:w-40 h-24 rounded-lg overflow-hidden shrink-0">
          <img 
            src={bonus.thumbnail} 
            alt={bonus.title}
            className={`w-full h-full object-cover ${isLocked ? "grayscale" : ""}`}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-2">
          <Badge 
            variant={isCompleted ? "default" : isAvailable ? "secondary" : "outline"}
            className={isCompleted ? "bg-green-500" : ""}
          >
            <Icon className="w-3 h-3 mr-1" />
            {contentTypeLabels[bonus.content_type]}
          </Badge>
          
          {bonus.reward_title && (
            <Badge variant="outline" className="border-amber-500/50 text-amber-600">
              <Gift className="w-3 h-3 mr-1" />
              Recompensa
            </Badge>
          )}
        </div>

        <h3 className={`font-semibold text-lg mb-1 ${isLocked ? "text-muted-foreground" : ""}`}>
          {isLocked && <Lock className="w-4 h-4 inline mr-2" />}
          {bonus.title}
        </h3>

        {bonus.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {bonus.description}
          </p>
        )}

        {/* Status messages */}
        {isCompleted && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="w-4 h-4" />
            <span>Bônus concluído</span>
            {bonus.progress?.completed_at && (
              <span className="text-muted-foreground">
                — Próximo bônus libera em {bonus.unlock_delay_hours}h
              </span>
            )}
          </div>
        )}

        {isLocked && bonus.unlockTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              Libera {formatDistanceToNow(bonus.unlockTime, { locale: ptBR, addSuffix: true })}
            </span>
          </div>
        )}

        {isAvailable && !isCompleted && (
          <Button size="sm" className="mt-2">
            <Icon className="w-4 h-4 mr-2" />
            Acessar conteúdo
          </Button>
        )}

        {/* Reward info */}
        {isCompleted && bonus.reward_title && (
          <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-600 font-medium mb-1">
              <Gift className="w-4 h-4" />
              {bonus.reward_title}
            </div>
            {bonus.reward_description && (
              <p className="text-sm text-muted-foreground">{bonus.reward_description}</p>
            )}
            {bonus.reward_url && (
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2 border-amber-500/50"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(bonus.reward_url!, "_blank");
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar recompensa
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
