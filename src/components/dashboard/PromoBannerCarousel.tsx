import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, ChevronRight, ExternalLink, Trophy } from "lucide-react";

const INTERVAL_MS = 5000;

// ─── Banner 1: Backs Radar ───────────────────────────────────────────────────
function BacksRadarBanner() {
  return (
    <a
      href="https://backsradar.com.br"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-stretch w-full h-full min-h-[110px] rounded-2xl overflow-hidden group"
      style={{ textDecoration: "none" }}
    >
      {/* Left: visual */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{
          width: "62%",
          background: "linear-gradient(135deg, #0a1628 0%, #0d2050 40%, #1a3a8f 100%)",
        }}
      >
        {/* subtle glowing circles */}
        <div
          className="absolute rounded-full opacity-20 blur-2xl"
          style={{ width: 160, height: 160, top: -30, left: -30, background: "#3b82f6" }}
        />
        <div
          className="absolute rounded-full opacity-10 blur-2xl"
          style={{ width: 100, height: 100, bottom: -20, right: 20, background: "#60a5fa" }}
        />

        <div className="relative flex flex-col items-start justify-center px-5 py-4 gap-2 w-full">
          {/* Logo row */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 18, lineHeight: 1 }}>b</span>
            </div>
            <div>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: -0.3 }}>
                backs{" "}
              </span>
              <span style={{ color: "#60a5fa", fontWeight: 800, fontSize: 15 }}>radar</span>
            </div>
          </div>

          <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.35, margin: 0 }}>
            Encontre shows perto de você
            <br />
            <span style={{ color: "#93c5fd" }}>e leve sua música mais longe.</span>
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-1 mt-0.5">
            {["Shows perto de você", "Info completas", "Novos palcos"].map((f) => (
              <span
                key={f}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "#bfdbfe",
                  fontSize: 9,
                  fontWeight: 600,
                  borderRadius: 20,
                  padding: "2px 7px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  whiteSpace: "nowrap",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right: CTA */}
      <div
        className="flex flex-col items-start justify-center px-4 py-4 gap-2 flex-1"
        style={{ background: "#f8faff" }}
      >
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1,
            color: "#2563eb",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <ExternalLink style={{ width: 10, height: 10 }} />
          Parceiro Backstage
        </span>

        <p style={{ color: "#1e3a5f", fontWeight: 700, fontSize: 13, margin: 0, lineHeight: 1.3 }}>
          Encontre shows perto de você
        </p>
        <p style={{ color: "#64748b", fontSize: 11, margin: 0, lineHeight: 1.4 }}>
          O app parceiro para cantores que querem mais palcos, mais oportunidades e mais audiência.
        </p>

        <span
          className="group-hover:underline"
          style={{
            color: "#2563eb",
            fontWeight: 600,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 3,
            marginTop: 2,
          }}
        >
          Conhecer agora
          <ExternalLink style={{ width: 11, height: 11 }} />
        </span>
      </div>
    </a>
  );
}

// ─── Banner 2: Ranking de Shows ───────────────────────────────────────────────
function RankingBanner() {
  const navigate = useNavigate();

  const podium = [
    { pos: 2, name: "Itallo Lima", shows: 17, medal: "🥈", color: "#94a3b8", bg: "#f1f5f9", textColor: "#475569" },
    { pos: 1, name: "Sam Oliveira", shows: 18, medal: "🥇", color: "#f59e0b", bg: "#1e3a8a", textColor: "#fff" },
    { pos: 3, name: "Walteny Marck", shows: 16, medal: "🥉", color: "#cd7c2f", bg: "#fef3c7", textColor: "#92400e" },
  ];

  return (
    <button
      onClick={() => navigate("/ranking")}
      className="flex items-stretch w-full h-full min-h-[110px] rounded-2xl overflow-hidden group text-left"
      style={{
        background: "linear-gradient(135deg, #0a1628 0%, #0f2a6b 35%, #1a3a9f 70%, #1e4fc2 100%)",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {/* Decorative circles */}
      <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
        <div
          className="absolute rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ width: 200, height: 200, top: -60, left: -40, background: "#3b82f6" }}
        />
        <div
          className="absolute rounded-full blur-2xl opacity-15 pointer-events-none"
          style={{ width: 140, height: 140, bottom: -40, right: 60, background: "#f59e0b" }}
        />

        {/* Left: Title */}
        <div className="relative flex flex-col justify-center px-5 py-4" style={{ minWidth: 170 }}>
          <div className="flex items-center gap-2 mb-1">
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Trophy style={{ width: 17, height: 17, color: "#fbbf24" }} />
            </div>
            <span style={{ color: "#fbbf24", fontWeight: 800, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
              Ranking de Shows
            </span>
          </div>

          <p style={{ color: "#fff", fontWeight: 900, fontSize: 22, margin: 0, lineHeight: 1, letterSpacing: -0.5 }}>
            JUNHO
          </p>
          <p style={{ color: "#93c5fd", fontWeight: 700, fontSize: 14, margin: 0 }}>
            2026
          </p>

          <div
            style={{
              marginTop: 8,
              background: "rgba(251,191,36,0.15)",
              border: "1px solid rgba(251,191,36,0.3)",
              borderRadius: 20,
              padding: "3px 10px",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              width: "fit-content",
            }}
          >
            <span style={{ color: "#fbbf24", fontSize: 9, fontWeight: 700 }}>★</span>
            <span style={{ color: "#fde68a", fontSize: 9, fontWeight: 600, letterSpacing: 0.5 }}>
              CONFIRA QUEM FEZ MAIS SHOWS!
            </span>
            <span style={{ color: "#fbbf24", fontSize: 9, fontWeight: 700 }}>★</span>
          </div>
        </div>

        {/* Right: Podium */}
        <div
          className="relative flex items-end justify-center gap-1 flex-1 pb-3 pt-2 px-3"
          style={{ alignSelf: "stretch" }}
        >
          {podium.map((p) => {
            const height = p.pos === 1 ? 76 : p.pos === 2 ? 62 : 56;
            return (
              <div
                key={p.pos}
                className="flex flex-col items-center justify-end gap-0.5"
                style={{ flex: 1 }}
              >
                {/* Medal */}
                <div style={{ fontSize: p.pos === 1 ? 20 : 16, marginBottom: 2 }}>{p.medal}</div>
                {/* Card */}
                <div
                  style={{
                    background: p.bg,
                    borderRadius: 8,
                    width: "100%",
                    height,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 2px",
                    border: p.pos === 1 ? "2px solid #f59e0b" : "1px solid rgba(255,255,255,0.15)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <span style={{ color: p.textColor, fontWeight: 900, fontSize: p.pos === 1 ? 15 : 13, lineHeight: 1 }}>
                    {p.pos}º
                  </span>
                  <span
                    style={{
                      color: p.textColor,
                      fontWeight: 600,
                      fontSize: 8,
                      textAlign: "center",
                      opacity: 0.85,
                      lineHeight: 1.2,
                      wordBreak: "break-word",
                      padding: "0 2px",
                    }}
                  >
                    {p.name.split(" ")[0]}
                  </span>
                  <span style={{ color: p.color, fontWeight: 900, fontSize: p.pos === 1 ? 14 : 12, lineHeight: 1, marginTop: 2 }}>
                    {p.shows}
                  </span>
                  <span style={{ color: p.textColor, fontWeight: 600, fontSize: 7, opacity: 0.7, letterSpacing: 0.5 }}>
                    SHOWS
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA button */}
        <div className="flex items-center pr-4">
          <div
            className="group-hover:bg-blue-400 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
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

// ─── Carousel ────────────────────────────────────────────────────────────────
const banners = [<BacksRadarBanner key="radar" />, <RankingBanner key="ranking" />];

export function PromoBannerCarousel() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (idx: number) => {
      if (idx === active || animating) return;
      setAnimating(true);
      setTimeout(() => {
        setActive(idx);
        setAnimating(false);
      }, 300);
    },
    [active, animating]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % banners.length);
        setAnimating(false);
      }, 300);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full" style={{ position: "relative" }}>
      {/* Banner wrapper */}
      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(4px)" : "translateY(0)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        {banners[active]}
      </div>

      {/* Dot indicators */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginTop: 8,
        }}
      >
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Banner ${i + 1}`}
            style={{
              width: i === active ? 20 : 6,
              height: 6,
              borderRadius: 999,
              background: i === active ? "hsl(220, 90%, 56%)" : "hsl(220, 15%, 80%)",
              border: "none",
              padding: 0,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
