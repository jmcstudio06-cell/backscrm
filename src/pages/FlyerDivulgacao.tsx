import { useState, useRef, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, Download, ChevronLeft, ChevronRight, Calendar, Music } from "lucide-react";
import { useShows } from "@/contexts/ShowsContext";
import { useProfile } from "@/hooks/useProfile";
import { toPng } from "html-to-image";
import { toast } from "sonner";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const WEEKDAY_SHORT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export default function FlyerDivulgacao() {
  const { shows } = useShows();
  const { profile } = useProfile();
  const flyerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [format, setFormat] = useState<"feed" | "stories">("stories");

  const artistName = profile?.artist_name || profile?.name || "Artista";
  const avatarUrl = profile?.avatar_url || null;

  const monthShows = useMemo(() => {
    return shows
      .filter((s) => {
        if (!s.date || s.status === "cancelled") return false;
        const d = new Date(s.date + "T12:00:00");
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [shows, selectedMonth, selectedYear]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear((y) => y - 1); }
    else setSelectedMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear((y) => y + 1); }
    else setSelectedMonth((m) => m + 1);
  };

  const handleDownload = async () => {
    if (!flyerRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(flyerRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement("a");
      link.download = `flyer-${MONTH_NAMES[selectedMonth].toLowerCase()}-${selectedYear}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Flyer baixado com sucesso!");
    } catch { toast.error("Erro ao gerar imagem do flyer"); }
    finally { setDownloading(false); }
  };

  const midpoint = Math.ceil(monthShows.length / 2);
  const col1 = monthShows.slice(0, midpoint);
  const col2 = monthShows.slice(midpoint);

  const flyerW = format === "feed" ? 540 : 405;
  const flyerH = format === "feed" ? 540 : 720;
  const isFeed = format === "feed";
  const isCompact = monthShows.length > 10;
  const isMedium = monthShows.length > 6;

  return (
    <Layout title="Flyer Divulgação">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-primary" />
            Flyer Divulgação
          </h1>
          <p className="text-muted-foreground mt-1">Gere flyers mensais profissionais com suas datas de show</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}><ChevronLeft className="w-4 h-4" /></Button>
            <div className="px-4 py-2 font-semibold text-foreground min-w-[160px] text-center">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextMonth}><ChevronRight className="w-4 h-4" /></Button>
          </div>
          <Select value={format} onValueChange={(v) => setFormat(v as "feed" | "stories")}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="feed">Feed (1:1)</SelectItem>
              <SelectItem value="stories">Stories (9:16)</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownload} disabled={downloading || monthShows.length === 0} className="gap-2">
            <Download className="w-4 h-4" />
            {downloading ? "Gerando..." : "Baixar Flyer"}
          </Button>
        </div>

        {monthShows.length === 0 ? (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground">Nenhum show neste mês</h2>
              <p className="text-muted-foreground max-w-md">Adicione shows na Agenda para gerar o flyer mensal.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex justify-center overflow-auto pb-4">
            <div
              ref={flyerRef}
              className="relative overflow-hidden flex-shrink-0"
              style={{ width: flyerW, height: flyerH, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
            >
              {/* ===== BACKGROUND ===== */}
              <div className="absolute inset-0" style={{
                background: "linear-gradient(160deg, #0f0c29 0%, #1a0a2e 25%, #24243e 50%, #1a0a2e 75%, #0f0c29 100%)",
              }} />

              {/* Neon glow blobs */}
              <div className="absolute" style={{
                width: 300, height: 300, top: -80, right: -60,
                background: "radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)",
                filter: "blur(40px)",
              }} />
              <div className="absolute" style={{
                width: 250, height: 250, bottom: -40, left: -50,
                background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)",
                filter: "blur(40px)",
              }} />
              <div className="absolute" style={{
                width: 200, height: 200, top: "40%", left: "50%",
                transform: "translateX(-50%)",
                background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
                filter: "blur(30px)",
              }} />

              {/* Subtle grain overlay */}
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
                opacity: 0.5,
              }} />

              {/* ===== CONTENT ===== */}
              <div className="relative z-10 flex flex-col h-full" style={{ padding: isFeed ? "24px 24px 16px" : "28px 26px 18px" }}>

                {/* ── HEADER: Avatar + Title ── */}
                <div className="flex flex-col items-center" style={{ marginBottom: isFeed ? 14 : 20 }}>
                  {/* Glowing avatar ring */}
                  <div className="relative" style={{ width: isFeed ? 80 : 90, height: isFeed ? 80 : 90, marginBottom: 10 }}>
                    {/* Outer glow */}
                    <div className="absolute inset-0 rounded-full" style={{
                      background: "conic-gradient(from 0deg, #a855f7, #ec4899, #f97316, #eab308, #22c55e, #3b82f6, #a855f7)",
                      padding: 3,
                      filter: "blur(1px)",
                    }}>
                      <div className="w-full h-full rounded-full" style={{ background: "#1a0a2e" }} />
                    </div>
                    {/* Avatar container */}
                    <div className="absolute inset-0 rounded-full" style={{ padding: 3 }}>
                      <div className="absolute inset-0 rounded-full" style={{
                        background: "conic-gradient(from 0deg, #a855f7, #ec4899, #f97316, #eab308, #22c55e, #3b82f6, #a855f7)",
                      }} />
                      <div className="absolute rounded-full overflow-hidden" style={{ inset: 3, background: "#1a0a2e" }}>
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={artistName} className="w-full h-full object-cover" crossOrigin="anonymous" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{
                            background: "linear-gradient(135deg, #a855f7, #ec4899)",
                          }}>
                            <Music className="text-white" style={{ width: 32, height: 32 }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Artist Name */}
                  <div className="text-center" style={{
                    fontSize: isFeed ? 22 : 26,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #e879f9, #f9a8d4, #fcd34d)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "1px",
                    lineHeight: 1.1,
                  }}>
                    {artistName}
                  </div>

                  {/* "PRÓXIMOS SHOWS" */}
                  <div className="flex items-center gap-2" style={{ marginTop: 6 }}>
                    <div style={{ width: 24, height: 1, background: "linear-gradient(to right, transparent, rgba(168,85,247,0.6))" }} />
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: "4px",
                      color: "rgba(168,85,247,0.8)",
                      textTransform: "uppercase",
                    }}>
                      Próximos Shows
                    </span>
                    <div style={{ width: 24, height: 1, background: "linear-gradient(to left, transparent, rgba(168,85,247,0.6))" }} />
                  </div>
                </div>

                {/* ── MONTH BADGE ── */}
                <div className="flex items-center justify-center" style={{ marginBottom: isFeed ? 12 : 16 }}>
                  <div style={{
                    padding: "4px 20px",
                    borderRadius: 20,
                    background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.2))",
                    border: "1px solid rgba(168,85,247,0.3)",
                    backdropFilter: "blur(10px)",
                  }}>
                    <span style={{
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      background: "linear-gradient(135deg, #c084fc, #f9a8d4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>
                      {MONTH_NAMES[selectedMonth]} {selectedYear}
                    </span>
                  </div>
                </div>

                {/* ── SHOWS LIST ── */}
                <div className="flex-1 flex gap-3" style={{ overflow: "hidden" }}>
                  {[col1, col2].map((col, ci) => {
                    if (col.length === 0) return null;
                    return (
                      <div key={ci} className="flex-1 flex flex-col" style={{ gap: isCompact ? 3 : isMedium ? 5 : 7 }}>
                        {col.map((show, i) => {
                          const d = new Date(show.date + "T12:00:00");
                          const day = String(d.getDate()).padStart(2, "0");
                          const weekday = WEEKDAY_SHORT[d.getDay()];
                          const city = show.venue || show.address || show.title;
                          const globalIdx = ci === 0 ? i : i + col1.length;
                          const colors = [
                            ["#a855f7", "rgba(168,85,247,0.12)"],
                            ["#ec4899", "rgba(236,72,153,0.12)"],
                            ["#f97316", "rgba(249,115,22,0.12)"],
                            ["#3b82f6", "rgba(59,130,246,0.12)"],
                            ["#eab308", "rgba(234,179,8,0.12)"],
                            ["#22c55e", "rgba(34,197,94,0.12)"],
                          ];
                          const [accent, bg] = colors[globalIdx % colors.length];

                          return (
                            <div
                              key={show.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: isCompact ? "4px 8px" : "6px 10px",
                                borderRadius: 10,
                                background: bg,
                                borderLeft: `3px solid ${accent}`,
                              }}
                            >
                              {/* Day number */}
                              <div style={{ textAlign: "center", minWidth: 30, flexShrink: 0 }}>
                                <div style={{
                                  fontSize: isCompact ? 16 : 20,
                                  fontWeight: 900,
                                  color: accent,
                                  lineHeight: 1,
                                }}>
                                  {day}
                                </div>
                                <div style={{
                                  fontSize: 7,
                                  fontWeight: 700,
                                  color: "rgba(255,255,255,0.35)",
                                  letterSpacing: "1px",
                                  textTransform: "uppercase",
                                }}>
                                  {weekday}
                                </div>
                              </div>

                              {/* City */}
                              <div style={{
                                flex: 1,
                                minWidth: 0,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: isCompact ? 9 : isMedium ? 10 : 11,
                                fontWeight: 700,
                                color: "rgba(255,255,255,0.85)",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}>
                                {city}
                              </div>

                              {/* Time pill */}
                              {show.start_time && !isCompact && (
                                <div style={{
                                  flexShrink: 0,
                                  fontSize: 8,
                                  fontWeight: 600,
                                  color: accent,
                                  padding: "1px 5px",
                                  borderRadius: 4,
                                  background: "rgba(255,255,255,0.05)",
                                }}>
                                  {show.start_time.slice(0, 5)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* ── FOOTER ── */}
                <div className="flex items-center justify-center" style={{ marginTop: isFeed ? 10 : 14, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-1.5">
                    <div style={{
                      width: 14, height: 14, borderRadius: 4,
                      background: "linear-gradient(135deg, #a855f7, #ec4899)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Music style={{ width: 8, height: 8, color: "white" }} />
                    </div>
                    <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: "2px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>
                      Backstage Pro
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
