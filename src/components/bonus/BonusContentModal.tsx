import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Check, Gift } from "lucide-react";
import { BonusWithProgress } from "@/hooks/useBonuses";
import { extractYouTubeVideoId } from "@/lib/youtube";

interface BonusContentModalProps {
  bonus: BonusWithProgress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (bonusId: string) => void;
}

export function BonusContentModal({ bonus, open, onOpenChange, onComplete }: BonusContentModalProps) {
  const [watchProgress, setWatchProgress] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (bonus?.status === "completed") {
      setHasCompleted(true);
    } else {
      setHasCompleted(false);
      setWatchProgress(0);
    }
  }, [bonus]);

  if (!bonus) return null;

  const isVideo = bonus.content_type === "video";
  const videoId = bonus.content_url ? extractYouTubeVideoId(bonus.content_url) : null;

  const handleComplete = () => {
    if (!hasCompleted) {
      onComplete(bonus.id);
      setHasCompleted(true);
    }
  };

  const handleDownload = () => {
    if (bonus.content_url) {
      window.open(bonus.content_url, "_blank");
    }
    if (!hasCompleted && bonus.completion_rule === "download") {
      handleComplete();
    }
  };

  const handleExternalLink = () => {
    if (bonus.content_url) {
      window.open(bonus.content_url, "_blank");
    }
    if (!hasCompleted) {
      handleComplete();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {bonus.title}
            {hasCompleted && (
              <span className="inline-flex items-center gap-1 text-sm font-normal text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
                <Check className="w-4 h-4" />
                Concluído
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {bonus.description && (
            <p className="text-muted-foreground">{bonus.description}</p>
          )}

          {/* Video content */}
          {isVideo && videoId && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={bonus.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Link content */}
          {bonus.content_type === "link" && (
            <div className="p-6 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground mb-4">
                Clique no botão abaixo para acessar o conteúdo externo
              </p>
              <Button onClick={handleExternalLink} size="lg">
                <ExternalLink className="w-5 h-5 mr-2" />
                Acessar conteúdo
              </Button>
            </div>
          )}

          {/* Download content */}
          {bonus.content_type === "download" && (
            <div className="p-6 rounded-lg bg-muted/50 text-center">
              <p className="text-muted-foreground mb-4">
                Clique no botão abaixo para baixar o material
              </p>
              <Button onClick={handleDownload} size="lg">
                <Download className="w-5 h-5 mr-2" />
                Baixar material
              </Button>
            </div>
          )}

          {/* Lesson content */}
          {bonus.content_type === "lesson" && videoId && (
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={bonus.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Manual complete button for video */}
          {(isVideo || bonus.content_type === "lesson") && !hasCompleted && (
            <div className="flex justify-center pt-4">
              <Button onClick={handleComplete} variant="default" size="lg">
                <Check className="w-5 h-5 mr-2" />
                Marcar como concluído
              </Button>
            </div>
          )}

          {/* Reward section */}
          {hasCompleted && bonus.reward_title && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-600 font-semibold mb-2">
                <Gift className="w-5 h-5" />
                Recompensa desbloqueada: {bonus.reward_title}
              </div>
              {bonus.reward_description && (
                <p className="text-sm text-muted-foreground mb-3">{bonus.reward_description}</p>
              )}
              {bonus.reward_url && (
                <Button 
                  variant="outline" 
                  className="border-amber-500/50"
                  onClick={() => window.open(bonus.reward_url!, "_blank")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar recompensa
                </Button>
              )}
            </div>
          )}

          {/* Next bonus info */}
          {hasCompleted && (
            <div className="text-center text-sm text-muted-foreground pt-4">
              Próximo bônus libera em {bonus.unlock_delay_hours} hora{bonus.unlock_delay_hours > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
