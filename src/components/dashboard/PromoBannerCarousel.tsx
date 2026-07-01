import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, ChevronRight, ExternalLink, Sparkles, Trophy } from "lucide-react";
import backsRadarBanner from "@/assets/backs-radar-banner.png.asset.json";

const INTERVAL_MS = 5000;
const BACKSRADAR_URL = "https://backsradar.com.br";

// ─── Banner 1: Backs Radar (usa a imagem real do asset) ──────────────────────
function BacksRadarBanner() {
  return (
    <a
      href={BACKSRADAR_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block w-full overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-card transition-all duration-500 hover:shadow-elevated hover:scale-[1.005] animate-fade-in"
      style={{ textDecoration: "none" }}
    >
      {/* Hover gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />

      <div className="relative flex flex-col sm:flex-row items-stretch">
        {/* Banner image */}
        <div className="relative w-full sm:w-[60%] lg:w-[55%] aspect-[2.4/1] sm:aspect-auto overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
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
    </a>
  );
}

// ─── Banner 2: Ranking de Shows ───────────────────────────────────────────────
function RankingBanner() {
  const navigate = useNavigate();

  // Pódio: order = [2º, 1º, 3º] para o layout visual clássico
  const podium = [
    { pos: 2, name: "Itallo Lima",    shows: 17, bg: "#e2e8f0", cardBg: "#f8fafc", textColor: "#334155", showsColor: "#64748b", borderColor: "#cbd5e1" },
    { pos: 1, name: "Sam Oliveira",   shows: 18, bg: "#1e3a8a", cardBg: "#1e40af", textColor: "#fff",    showsColor: "#fbbf24", borderColor: "#f59e0b" },
    { pos: 3, name: "Walteny Marck",  shows: 16, bg: "#fef3c7", cardBg: "#fffbeb", textColor: "#92400e", showsColor: "#b45309", borderColor: "#d97706" },
  ];

  const medals = ["🥈", "🥇", "🥉"];
  const pillarHeights = [62, 80, 54];

  return (
    <button
      onClick={() => navigate("/ranking")}
      className="group relative block w-full overflow-hidden rounded-2xl animate-fade-in transition-all duration-500 hover:scale-[1.005]"
      style={{
        background: "linear-gradient(135deg, #06122b 0%, #0a2056 40%, #143280 70%, #1a3fa0 100%)",
        border: "1px solid rgba(59,130,246,0.3)",
        boxShadow: "0 4px 24px rgba(10,32,86,0.4)",
        cursor: "pointer",
        padding: 0,
        textAlign: "left",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute rounded-full blur-3xl opacity-25 pointer-events-none"
        style={{ width: 220, height: 220, top: -60, left: -40, background: "#3b82f6" }}
      />
      <div
        className="absolute rounded-full blur-2xl opacity-20 pointer-events-none"
        style={{ width: 150, height: 150, bottom: -40, right: 80, background: "#f59e0b" }}
      />

      <div className="relative flex items-center w-full">
        {/* ── Left: Title ── */}
        <div className="flex flex-col justify-center px-5 py-4 shrink-0" style={{ minWidth: 170 }}>
          {/* Trophy + label */}
          <div className="flex items-center gap-2 mb-2">
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Trophy style={{ width: 17, height: 17, color: "#fbbf24" }} />
            </div>
            <span
              style={{
                color: "#fbbf24",
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              Ranking de Shows
            </span>
          </div>

          <p style={{ color: "#fff", fontWeight: 900, fontSize: 26, margin: 0, lineHeight: 1, letterSpacing: -1 }}>
            JUNHO
          </p>
          <p style={{ color: "#93c5fd", fontWeight: 700, fontSize: 15, margin: "0 0 8px" }}>
            2026
          </p>

          {/* Confira tag */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "rgba(251,191,36,0.15)",
              border: "1px solid rgba(251,191,36,0.3)",
              borderRadius: 20,
              padding: "3px 10px",
              width: "fit-content",
            }}
          >
            <span style={{ color: "#fbbf24", fontSize: 9, fontWeight: 700 }}>★</span>
            <span style={{ color: "#fde68a", fontSize: 9, fontWeight: 600, letterSpacing: 0.5 }}>
              QUEM FEZ MAIS SHOWS!
            </span>
            <span style={{ color: "#fbbf24", fontSize: 9, fontWeight: 700 }}>★</span>
          </div>
        </div>

        {/* ── Center: Podium ── */}
        <div
          className="flex-1 flex items-end justify-center gap-2 pb-3 pt-2 px-2"
          style={{ alignSelf: "stretch" }}
        >
          {podium.map((p, i) => (
            <div
              key={p.pos}
              className="flex flex-col items-center"
              style={{ flex: 1 }}
            >
              {/* Medal emoji */}
              <div style={{ fontSize: p.pos === 1 ? 22 : 17, marginBottom: 3 }}>
                {medals[i]}
              </div>

              {/* Card */}
              <div
                style={{
                  background: p.cardBg,
                  borderRadius: 10,
                  width: "100%",
                  height: pillarHeights[i],
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 3px",
                  border: `2px solid ${p.borderColor}`,
                  boxShadow: p.pos === 1 ? "0 4px 16px rgba(245,158,11,0.35)" : "none",
                }}
              >
                <span
                  style={{
                    color: p.textColor,
                    fontWeight: 900,
                    fontSize: p.pos === 1 ? 16 : 13,
                    lineHeight: 1,
                  }}
                >
                  {p.pos}º
                </span>
                <span
                  style={{
                    color: p.textColor,
                    fontWeight: 600,
                    fontSize: 8,
                    opacity: 0.85,
                    textAlign: "center",
                    lineHeight: 1.2,
                    wordBreak: "break-word",
                    padding: "0 2px",
                    marginTop: 2,
                  }}
                >
                  {p.name.split(" ")[0]}
                </span>
                <span
                  style={{
                    color: p.showsColor,
                    fontWeight: 900,
                    fontSize: p.pos === 1 ? 15 : 12,
                    lineHeight: 1,
                    marginTop: 3,
                  }}
                >
                  {p.shows}
                </span>
                <span
                  style={{
                    color: p.textColor,
                    fontWeight: 600,
                    fontSize: 7,
                    opacity: 0.65,
                    letterSpacing: 0.5,
                  }}
                >
                  SHOWS
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Right: CTA ── */}
        <div className="flex items-center pr-4 shrink-0">
          <div
            className="group-hover:bg-blue-500/30 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)",
              whiteSpace: "nowrap",
            }}
          >
            <BarChart3 style={{ width: 13, height: 13, color: "#fff" }} />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>Ver ranking</span>
            <ChevronRight style={{ width: 12, height: 12, color: "#93c5fd" }} />
          </div>
        </div>
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
    <div className="w-full">
      {/* Banner */}
      <div
        style={{
          opacity: fading ? 0 : 1,
          transform: fading ? "translateY(6px) scale(0.99)" : "translateY(0) scale(1)",
          transition: "opacity 0.28s ease, transform 0.28s ease",
        }}
      >
        {BANNERS[active]}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-2">
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
