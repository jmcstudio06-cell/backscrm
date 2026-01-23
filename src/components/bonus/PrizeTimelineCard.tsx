import { useState } from "react";
import { Lock, Check, Play, ExternalLink, Download, BookOpen, Gift, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BonusWithProgress } from "@/hooks/useBonuses";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { extractYouTubeVideoId } from "@/lib/youtube";

interface PrizeTimelineCardProps {
  bonus: BonusWithProgress;
  onComplete: (bonusId: string) => void;
  onView: (bonus: BonusWithProgress) => void;
  isLast?: boolean;
}

const contentTypeIcons = {
  video: Play,
  link: ExternalLink,
  download: Download,
  lesson: BookOpen
};

export function PrizeTimelineCard({ bonus, onComplete, onView, isLast }: PrizeTimelineCardProps) {
  const [imageError, setImageError] = useState(false);
  const Icon = contentTypeIcons[bonus.content_type];
  const isLocked = bonus.status === "locked";
  const isCompleted = bonus.status === "completed";
  const isAvailable = bonus.status === "available";

  // Get thumbnail
  const getThumbnailUrl = (): string | null => {
    if (bonus.thumbnail) return bonus.thumbnail;
    const videoId = extractYouTubeVideoId(bonus.content_url);
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return null;
  };

  const thumbnailUrl = getThumbnailUrl();

  const handleAccess = () => {
    if (isLocked) return;
    onView(bonus);
    if (bonus.completion_rule === "click" && !isCompleted) {
      onComplete(bonus.id);
    }
  };

  return (
    <div className="relative flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        {/* Time badge */}
        <div 
          className={`
            w-16 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10
            ${isCompleted 
              ? "bg-green-500 text-white" 
              : isAvailable 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted text-muted-foreground border-2 border-dashed border-muted-foreground/30"
            }
          `}
        >
          {isCompleted ? (
            <Check className="w-4 h-4" />
          ) : (
            bonus.timeLabel
          )}
        </div>
        
        {/* Vertical line */}
        {!isLast && (
          <div 
            className={`
              w-0.5 flex-1 min-h-[80px]
              ${isCompleted ? "bg-green-500" : "bg-muted"}
            `}
          />
        )}
      </div>

      {/* Card content */}
      <div 
        className={`
          flex-1 mb-4 rounded-xl border-2 overflow-hidden transition-all cursor-pointer
          ${isCompleted 
            ? "bg-green-500/5 border-green-500/30" 
            : isAvailable 
              ? "bg-card border-primary/30 hover:border-primary/50 hover:shadow-lg" 
              : "bg-muted/20 border-muted/50 opacity-70"
          }
        `}
        onClick={handleAccess}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          {thumbnailUrl && !imageError ? (
            <div className={`w-full sm:w-32 h-24 shrink-0 ${isLocked ? "grayscale" : ""}`}>
              <img 
                src={thumbnailUrl} 
                alt={bonus.title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className={`w-full sm:w-32 h-24 shrink-0 bg-muted flex items-center justify-center ${isLocked ? "opacity-50" : ""}`}>
              {isLocked ? (
                <Lock className="w-8 h-8 text-muted-foreground" />
              ) : (
                <Icon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex flex-wrap items-center gap-2">
                {bonus.reward_title && (
                  <Badge variant="outline" className="border-amber-500/50 text-amber-600 bg-amber-500/10">
                    <Gift className="w-3 h-3 mr-1" />
                    Prêmio
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-green-500">
                    <Check className="w-3 h-3 mr-1" />
                    Resgatado
                  </Badge>
                )}
              </div>
            </div>

            <h3 className={`font-semibold text-lg mb-1 ${isLocked ? "text-muted-foreground" : ""}`}>
              {isLocked && <Lock className="w-4 h-4 inline mr-2 opacity-50" />}
              {bonus.title}
            </h3>

            {bonus.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {bonus.description}
              </p>
            )}

            {/* Status */}
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
                <Gift className="w-4 h-4 mr-2" />
                Resgatar prêmio
              </Button>
            )}

            {/* Reward info for completed */}
            {isCompleted && bonus.reward_title && (
              <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                  <Gift className="w-4 h-4" />
                  {bonus.reward_title}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
