import { useState, useRef, useMemo, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { useShows } from "@/contexts/shows/ShowsContext";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Image as ImageIcon,
  Download,
  Sparkles,
  Calendar,
  CalendarDays,
  CalendarRange,
  Check,
  MapPin,
  Instagram,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AgendaType = "day" | "week" | "month";
type FlyerFormat = "feed" | "stories";
type FlyerLayout = "classic" | "modern" | "minimal" | "bold";

const LAYOUTS: { id: FlyerLayout; label: string; desc: string }[] = [
  { id: "classic", label: "Clássico", desc: "Elegante e tradicional" },
  { id: "modern", label: "Moderno", desc: "Visual contemporâneo" },
  { id: "minimal", label: "Minimalista", desc: "Limpo e direto" },
  { id: "bold", label: "Impactante", desc: "Cores vibrantes e destaque" },
];

const AGENDA_TYPES: { id: AgendaType; label: string; icon: React.ElementType }[] = [
  { id: "day", label: "Agenda do Dia", icon: Calendar },
  { id: "week", label: "Agenda Semanal", icon: CalendarDays },
  { id: "month", label: "Agenda Mensal", icon: CalendarRange },
];

const FORMATS: { id: FlyerFormat; label: string; size: string; w: number; h: number }[] = [
  { id: "feed", label: "Feed", size: "1080×1080", w: 1080, h: 1080 },
  { id: "stories", label: "Stories", size: "1080×1920", w: 1080, h: 1920 },
];

function formatDateBR(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

function getDayName(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
}

function getMonthName(month: number) {
  return new Date(2024, month, 1).toLocaleDateString("pt-BR", { month: "long" });
}

export default function FlyerDivulgacao() {
  const { shows } = useShows();
  const { profile } = useProfile();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedLayout, setSelectedLayout] = useState<FlyerLayout>("modern");
  const [agendaType, setAgendaType] = useState<AgendaType>("week");
  const [flyerFormat, setFlyerFormat] = useState<FlyerFormat>("feed");
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const filteredShows = useMemo(() => {
    const confirmed = shows.filter(
      (s) => s.status === "confirmed" || s.status === "scheduled"
    );

    if (agendaType === "day") {
      return confirmed.filter((s) => s.date === todayStr);
    }

    if (agendaType === "week") {
      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay();
      startOfWeek.setDate(startOfWeek.getDate() - day);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const startStr = startOfWeek.toISOString().split("T")[0];
      const endStr = endOfWeek.toISOString().split("T")[0];

      return confirmed.filter((s) => s.date >= startStr && s.date <= endStr);
    }

    // month
    const monthStr = todayStr.slice(0, 7);
    return confirmed.filter((s) => s.date.startsWith(monthStr));
  }, [shows, agendaType, todayStr]);

  const artistName = profile?.artist_name || profile?.name || "Artista";
  const avatarUrl = profile?.avatar_url || null;
  const instagram = profile?.instagram_url
    ? profile.instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")
    : null;

  const generateFlyer = useCallback(async () => {
    setGenerating(true);
    try {
      const format = FORMATS.find((f) => f.id === flyerFormat)!;
      const W = format.w;
      const H = format.h;

      const canvas = canvasRef.current!;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Colors by layout
      const themes: Record<FlyerLayout, { bg: string; accent: string; text: string; sub: string; card: string }> = {
        classic: { bg: "#1a1a2e", accent: "#e94560", text: "#ffffff", sub: "#cccccc", card: "rgba(255,255,255,0.08)" },
        modern: { bg: "#0f0f23", accent: "#6366f1", text: "#ffffff", sub: "#a5b4fc", card: "rgba(99,102,241,0.12)" },
        minimal: { bg: "#fafafa", accent: "#18181b", text: "#18181b", sub: "#71717a", card: "rgba(0,0,0,0.04)" },
        bold: { bg: "#ff6b35", accent: "#ffffff", text: "#ffffff", sub: "#ffe0d0", card: "rgba(255,255,255,0.15)" },
      };
      const theme = themes[selectedLayout];

      // Background
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, W, H);

      // Gradient overlay
      if (selectedLayout !== "minimal") {
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, "rgba(0,0,0,0.3)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // Decorative circles
      if (selectedLayout === "modern") {
        ctx.beginPath();
        ctx.arc(W * 0.85, H * 0.1, 200, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99,102,241,0.15)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(W * 0.15, H * 0.9, 150, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(99,102,241,0.1)";
        ctx.fill();
      }

      if (selectedLayout === "bold") {
        ctx.beginPath();
        ctx.arc(W * 0.9, H * 0.05, 300, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fill();
      }

      let yPos = flyerFormat === "stories" ? 140 : 80;

      // Avatar
      if (avatarUrl) {
        try {
          const img = await loadImage(avatarUrl);
          const size = 120;
          const cx = W / 2;
          const cy = yPos + size / 2;
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, size / 2 + 4, 0, Math.PI * 2);
          ctx.fillStyle = theme.accent;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
          ctx.restore();
          yPos += size + 24;
        } catch {
          yPos += 20;
        }
      }

      // Artist name
      ctx.fillStyle = theme.text;
      ctx.font = "bold 52px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(artistName.toUpperCase(), W / 2, yPos + 50);
      yPos += 80;

      // Subtitle
      const subtitles: Record<AgendaType, string> = {
        day: "AGENDA DE HOJE",
        week: "AGENDA DA SEMANA",
        month: `AGENDA DE ${getMonthName(today.getMonth()).toUpperCase()}`,
      };
      ctx.fillStyle = theme.accent;
      ctx.font = "bold 28px 'Segoe UI', sans-serif";
      ctx.fillText(subtitles[agendaType], W / 2, yPos + 30);
      yPos += 60;

      // Divider
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W * 0.3, yPos);
      ctx.lineTo(W * 0.7, yPos);
      ctx.stroke();
      yPos += 30;

      // Shows list
      if (filteredShows.length === 0) {
        ctx.fillStyle = theme.sub;
        ctx.font = "24px 'Segoe UI', sans-serif";
        ctx.fillText("Nenhum show agendado", W / 2, yPos + 40);
      } else {
        const maxShows = flyerFormat === "stories" ? 8 : 5;
        const showsToRender = filteredShows.slice(0, maxShows);
        const cardH = flyerFormat === "stories" ? 120 : 100;
        const gap = 16;

        for (const show of showsToRender) {
          // Card background
          ctx.fillStyle = theme.card;
          const cardW = W - 120;
          const cardX = 60;
          roundRect(ctx, cardX, yPos, cardW, cardH, 16);
          ctx.fill();

          // Date badge
          ctx.fillStyle = theme.accent;
          roundRect(ctx, cardX + 16, yPos + (cardH - 60) / 2, 80, 60, 12);
          ctx.fill();

          ctx.fillStyle = selectedLayout === "bold" ? "#ff6b35" : "#ffffff";
          ctx.font = "bold 22px 'Segoe UI', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(formatDateBR(show.date), cardX + 56, yPos + cardH / 2 - 4);
          ctx.font = "14px 'Segoe UI', sans-serif";
          ctx.fillText(getDayName(show.date).toUpperCase(), cardX + 56, yPos + cardH / 2 + 16);

          // Show info
          ctx.textAlign = "left";
          ctx.fillStyle = theme.text;
          ctx.font = "bold 24px 'Segoe UI', sans-serif";
          const titleX = cardX + 116;
          const maxTitleW = cardW - 140;
          const title = truncateText(ctx, show.title, maxTitleW);
          ctx.fillText(title, titleX, yPos + cardH / 2 - 8);

          ctx.fillStyle = theme.sub;
          ctx.font = "18px 'Segoe UI', sans-serif";
          const venue = show.venue || show.address || "Local a confirmar";
          ctx.fillText(`📍 ${truncateText(ctx, venue, maxTitleW - 30)}`, titleX, yPos + cardH / 2 + 20);

          yPos += cardH + gap;
        }

        if (filteredShows.length > maxShows) {
          ctx.fillStyle = theme.sub;
          ctx.font = "italic 20px 'Segoe UI', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(`+ ${filteredShows.length - maxShows} shows`, W / 2, yPos + 10);
          yPos += 30;
        }
      }

      // Instagram handle at bottom
      const bottomY = H - (flyerFormat === "stories" ? 120 : 60);
      if (instagram) {
        ctx.fillStyle = theme.sub;
        ctx.font = "22px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`📸 ${instagram}`, W / 2, bottomY);
      }

      // Watermark
      ctx.fillStyle = theme.sub;
      ctx.globalAlpha = 0.4;
      ctx.font = "14px 'Segoe UI', sans-serif";
      ctx.fillText("Feito com Backstage Pro", W / 2, H - 20);
      ctx.globalAlpha = 1;

      const dataUrl = canvas.toDataURL("image/png");
      setGeneratedImage(dataUrl);
      toast.success("Flyer gerado com sucesso!");
    } catch (err) {
      console.error("Error generating flyer:", err);
      toast.error("Erro ao gerar flyer");
    } finally {
      setGenerating(false);
    }
  }, [selectedLayout, agendaType, flyerFormat, filteredShows, artistName, avatarUrl, instagram]);

  const downloadFlyer = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.download = `flyer-${agendaType}-${flyerFormat}.png`;
    link.href = generatedImage;
    link.click();
    toast.success("Flyer baixado!");
  };

  const autoGenerateWeek = () => {
    setAgendaType("week");
    setSelectedLayout("modern");
    setFlyerFormat("stories");
    // Delay to let state update then generate
    setTimeout(() => generateFlyer(), 100);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <ImageIcon className="w-7 h-7 text-primary" />
              Flyer Divulgação
            </h1>
            <p className="text-muted-foreground mt-1">
              Gere flyers automáticos da sua agenda para divulgar seus shows
            </p>
          </div>
          <Button
            onClick={autoGenerateWeek}
            variant="gradient"
            size="lg"
            disabled={generating}
            className="gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Gerar flyer da semana
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Configuration */}
          <div className="space-y-6">
            {/* Step 1 - Layout */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center rounded-full p-0 text-xs">1</Badge>
                  Escolha o Layout
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {LAYOUTS.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => { setSelectedLayout(layout.id); setGeneratedImage(null); }}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all text-left",
                        selectedLayout === layout.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      {selectedLayout === layout.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className={cn(
                        "w-full h-16 rounded-lg mb-2",
                        layout.id === "classic" && "bg-[#1a1a2e]",
                        layout.id === "modern" && "bg-[#0f0f23]",
                        layout.id === "minimal" && "bg-[#fafafa] border border-border",
                        layout.id === "bold" && "bg-[#ff6b35]",
                      )}>
                        <div className="flex items-center justify-center h-full">
                          <div className={cn(
                            "w-6 h-6 rounded-full",
                            layout.id === "classic" && "bg-[#e94560]",
                            layout.id === "modern" && "bg-[#6366f1]",
                            layout.id === "minimal" && "bg-[#18181b]",
                            layout.id === "bold" && "bg-white",
                          )} />
                        </div>
                      </div>
                      <p className="font-semibold text-sm text-foreground">{layout.label}</p>
                      <p className="text-xs text-muted-foreground">{layout.desc}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 2 - Agenda Type */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center rounded-full p-0 text-xs">2</Badge>
                  Tipo de Agenda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {AGENDA_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => { setAgendaType(type.id); setGeneratedImage(null); }}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                        agendaType === type.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <type.icon className={cn("w-6 h-6", agendaType === type.id ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-sm font-medium text-foreground">{type.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  {filteredShows.length === 0
                    ? "⚠️ Nenhum show encontrado para esse período"
                    : `✅ ${filteredShows.length} show${filteredShows.length > 1 ? "s" : ""} encontrado${filteredShows.length > 1 ? "s" : ""}`
                  }
                </p>
              </CardContent>
            </Card>

            {/* Step 3 - Format */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground w-6 h-6 flex items-center justify-center rounded-full p-0 text-xs">3</Badge>
                  Formato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => { setFlyerFormat(fmt.id); setGeneratedImage(null); }}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                        flyerFormat === fmt.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <div className={cn(
                        "border-2 rounded",
                        flyerFormat === fmt.id ? "border-primary" : "border-muted-foreground/40",
                        fmt.id === "feed" ? "w-8 h-8" : "w-6 h-10"
                      )} />
                      <div className="text-left">
                        <p className="font-semibold text-sm text-foreground">{fmt.label}</p>
                        <p className="text-xs text-muted-foreground">{fmt.size}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate button */}
            <Button
              onClick={generateFlyer}
              size="lg"
              className="w-full gap-2"
              disabled={generating}
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  Gerar Flyer
                </>
              )}
            </Button>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Prévia do Flyer</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                {generatedImage ? (
                  <>
                    <img
                      src={generatedImage}
                      alt="Flyer gerado"
                      className="w-full max-w-[340px] rounded-lg shadow-lg border border-border"
                    />
                    <Button onClick={downloadFlyer} className="w-full gap-2" variant="gradient">
                      <Download className="w-4 h-4" />
                      Baixar Flyer
                    </Button>
                  </>
                ) : (
                  <div className="w-full aspect-square max-w-[340px] rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-3 p-8">
                    <ImageIcon className="w-12 h-12 opacity-30" />
                    <p className="text-sm text-center">
                      Configure as opções e clique em <strong>"Gerar Flyer"</strong> para ver a prévia
                    </p>
                  </div>
                )}

                {/* Shows info */}
                {filteredShows.length > 0 && (
                  <div className="w-full space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Shows no flyer:</p>
                    {filteredShows.slice(0, 5).map((show) => (
                      <div key={show.id} className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground">{formatDateBR(show.date)}</span>
                        <span className="text-muted-foreground truncate">{show.title}</span>
                      </div>
                    ))}
                    {filteredShows.length > 5 && (
                      <p className="text-xs text-muted-foreground">+ {filteredShows.length - 5} mais</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Layout>
  );
}

// --- Helpers ---

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (ctx.measureText(truncated + "…").width > maxWidth && truncated.length > 0) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "…";
}
