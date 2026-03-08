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

const contentTypeIcons: Record<string, typeof Play> = {
  video: Play,
  link: ExternalLink,
  download: Download,
  lesson: BookOpen,
};

export function PrizeTimelineCard({ bonus, onComplete, onView, isLast }: PrizeTimelineCardProps) {
  const [imageError, setImageError] = useState(false);
  const Icon = contentTypeIcons[bonus.content_type] || Gift;
  const isLocked = bonus.status === "locked";
  const isCompleted = bonus.status === "completed";
  const isAvailable = bonus.status === "available";

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
    <div className="relative flex gap-5">
      {/* Timeline column */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Node */}
        <div
          className={`
            w-11 h-11 rounded-2xl flex items-center justify-center z-10 shadow-sm transition-all
            ${isCompleted
              ? "bg-primary text-primary-foreground"
              : isAvailable
                ? "bg-primary/15 text-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                : "bg-muted text-muted-foreground border-2 border-dashed border-muted-foreground/20"
            }
          `}
        >
          {isCompleted ? (
            <Check className="w-5 h-5" />
          ) : isLocked ? (
            <Lock className="w-4 h-4" />
          ) : (
            <Gift className="w-5 h-5" />
          )}
        </div>

        {/* Connector line */}
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-[24px] mt-1 ${
              isCompleted ? "bg-primary/40" : "bg-border"
            }`}
          />
        )}
      </div>

      {/* Card */}
      <div
        className={`
          flex-1 mb-5 rounded-2xl overflow-hidden transition-all duration-300
          ${isCompleted
            ? "bg-primary/5 border border-primary/20"
            : isAvailable
              ? "bg-card border border-primary/30 hover:border-primary/50 hover:shadow-elevated cursor-pointer group"
              : "bg-muted/20 border border-border/30 opacity-60"
          }
          ${isCompleted ? "cursor-pointer" : ""}
        `}
        onClick={handleAccess}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail */}
          {thumbnailUrl && !imageError ? (
            <div className={`w-full sm:w-40 h-28 sm:h-auto shrink-0 overflow-hidden ${isLocked ? "grayscale" : ""}`}>
              <img
                src={thumbnailUrl}
                alt={bonus.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className={`hidden sm:flex w-36 shrink-0 items-center justify-center relative overflow-hidden ${isLocked ? "opacity-40" : ""}`}>
              <div className={`absolute inset-0 ${
                isCompleted
                  ? "bg-gradient-to-br from-primary/10 to-primary/5"
                  : isAvailable
                    ? "bg-gradient-to-br from-primary/10 to-accent/5"
                    : "bg-muted/50"
              }`} />
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${
                isCompleted || isAvailable ? "bg-primary/5" : "bg-muted-foreground/5"
              }`} />
              <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center ${
                isCompleted
                  ? "bg-primary/15 text-primary"
                  : isAvailable
                    ? "bg-primary/10 text-primary"
                    : "bg-muted-foreground/10 text-muted-foreground"
              }`}>
                {isLocked ? <Lock className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 p-4 sm:p-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 font-medium">
                {bonus.timeLabel}
              </Badge>
              {isCompleted && (
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-[10px] px-2 py-0 h-5">
                  <Check className="w-3 h-3 mr-1" />
                  Resgatado
                </Badge>
              )}
              {bonus.reward_title && (
                <Badge variant="outline" className="border-primary/30 text-primary text-[10px] px-2 py-0 h-5">
                  <Gift className="w-3 h-3 mr-1" />
                  Prêmio
                </Badge>
              )}
            </div>

            {/* Title & description */}
            <h3 className={`font-bold text-base mb-1 ${isLocked ? "text-muted-foreground" : "text-foreground"}`}>
              {bonus.title}
            </h3>
            {bonus.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {bonus.description}
              </p>
            )}

            {/* Locked countdown */}
            {isLocked && bonus.unlockTime && (
              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>Libera {formatDistanceToNow(bonus.unlockTime, { locale: ptBR, addSuffix: true })}</span>
              </div>
            )}

            {/* Available CTA */}
            {isAvailable && !isCompleted && (
              <Button size="sm" className="mt-3 bg-primary hover:bg-primary/90 h-8 text-xs">
                <Gift className="w-3.5 h-3.5 mr-1.5" />
                Resgatar prêmio
              </Button>
            )}

            {/* Completed reward info */}
            {isCompleted && bonus.reward_title && (
              <div className="mt-3 p-2.5 rounded-xl bg-primary/5 border border-primary/15">
                <div className="flex items-center gap-2 text-primary text-xs font-medium">
                  <Gift className="w-3.5 h-3.5" />
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
