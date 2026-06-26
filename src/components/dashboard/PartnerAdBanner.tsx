import { useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import backsRadarBanner from "@/assets/backs-radar-banner.png.asset.json";

const BACKSAI_URL = "https://backsai.online";

export function PartnerAdBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("backs_radar_ad_dismissed") === "1";
  });

  if (dismissed) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem("backs_radar_ad_dismissed", "1");
    setDismissed(true);
  };

  return (
    <a
      href={BACKSAI_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-card transition-all duration-500 hover:shadow-elevated hover:scale-[1.01] animate-fade-in"
      )}
    >
      {/* Animated gradient border glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex flex-col sm:flex-row items-stretch">
        {/* Image */}
        <div className="relative w-full sm:w-[60%] lg:w-[55%] aspect-[2.4/1] sm:aspect-auto overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
          <img
            src={backsRadarBanner.url}
            alt="Backs Radar - App parceiro do Backstage Pro para encontrar shows perto de você"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center p-4 sm:p-5 lg:p-6 gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="w-3 h-3" />
              Parceiro Backstage
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground leading-tight">
              Encontre shows perto de você
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              O app parceiro para cantores que querem mais palcos, mais oportunidades e mais audiência.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline underline-offset-4">
              Conhecer agora
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
        aria-label="Fechar anúncio"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </a>
  );
}
