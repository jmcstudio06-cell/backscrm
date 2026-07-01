import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, ChevronRight, ExternalLink, Sparkles, Trophy } from "lucide-react";
import backsRadarBanner from "@/assets/backs-radar-banner.png.asset.json";

const INTERVAL_MS = 10000; // 10 segundos agora!
const BACKSRADAR_URL = "https://backsradar.com.br";

// ─── Banner 1: Backs Radar ───────────────────────────────────────────────────
function BacksRadarBanner() {
  return (
    <a
      href={BACKSRADAR_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex w-full h-[280px] sm:h-[180px] lg:h-[160px] overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-card transition-all duration-500 hover:shadow-elevated hover:scale-[1.005] animate-fade-in"
      style={{ textDecoration: "none" }}
    >
      {/* Hover gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

      <div className="relative flex flex-col sm:flex-row items-stretch w-full h-full">
        {/* Banner image */}
        <div className="relative w-full h-[140px] sm:h-full sm:w-[55%] lg:w-[55%] shrink-0 overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
          <img
            src={backsRadarBanner.url}
            alt="Backs Radar – App parceiro do Backstage Pro"
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>

        {/* Text content */}
        <div className="flex-1 flex flex-col justify-center p-4 sm:p-5 lg:p-6 gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="w-3 h-3" />
              Parceiro Backstage
            </span>
          </div>

          <div>
            <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground leading-tight line-clamp-1">
              Encontre shows perto de você
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
              O app parceiro para cantores que querem mais palcos, mais oportunidades e mais audiência.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-1 sm:mt-auto">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline underline-offset-4">
              Conhecer agora
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

// ─── Banner 2: Ranking de Shows ───────────────────────────────────────────────
function RankingBanner() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/ranking")}
      className="group relative block w-full h-[280px] sm:h-[180px] lg:h-[160px] overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-card transition-all duration-500 hover:shadow-elevated hover:scale-[1.005] animate-fade-in"
      style={{
        cursor: "pointer",
        padding: 0,
        textAlign: "left",
        textDecoration: "none",
        outline: "none"
      }}
    >
      {/* Hover gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

      <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-blue-900 to-blue-950">
        <img
          src="/ranking-banner.png" 
          alt="Ranking de Shows"
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/800x300/0a2056/ffffff?text=Adicione+ranking-banner.png+na+pasta+public";
          }}
        />
      </div>
    </button>
  );
}

// ─── Carousel wrapper ─────────────────────────────────────────────────────────
const BANNERS = [<BacksRadarBanner key="radar" />, <RankingBanner key="ranking" />];

export function PromoBannerCarousel() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (idx === active || fading) return;
      setFading(true);
      setTimeout(() => {
        setActive(idx);
        setFading(false);
      }, 280);
    },
    [active, fading]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % BANNERS.length);
        setFading(false);
      }, 280);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full relative h-[310px] sm:h-[210px] lg:h-[190px]">
      {/* Banner */}
      <div
        className="absolute top-0 left-0 w-full"
        style={{
          opacity: fading ? 0 : 1,
          transform: fading ? "translateY(6px) scale(0.99)" : "translateY(0) scale(1)",
          transition: "opacity 0.28s ease, transform 0.28s ease",
        }}
      >
        {BANNERS[active]}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-1 left-0 w-full flex justify-center gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Ir para banner ${i + 1}`}
            style={{
              width: i === active ? 22 : 7,
              height: 7,
              borderRadius: 999,
              background: i === active ? "hsl(220, 90%, 56%)" : "hsl(220, 15%, 82%)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
              outline: "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
