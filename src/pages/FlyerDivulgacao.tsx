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
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FlyerFormat = "feed" | "stories";

interface FlyerTemplate {
  id: string;
  label: string;
  desc: string;
  badge: string;
  badgeColor: string;
  agendaType: "day" | "week" | "month";
  layoutFn: string;
}

const TEMPLATES: FlyerTemplate[] = [
  { id: "mensal", label: "Flyer Mensal", desc: "Layout mensal com todas as datas do mês", badge: "Mensal", badgeColor: "bg-blue-600", agendaType: "month", layoutFn: "mensal" },
  { id: "hoje", label: "Flyer Diário", desc: "Layout diário com destaque para foto", badge: "Diário", badgeColor: "bg-red-600", agendaType: "day", layoutFn: "hoje" },
  { id: "classico", label: "Próximos Shows", desc: "Card elegante com grid de datas", badge: "Semanal", badgeColor: "bg-emerald-600", agendaType: "week", layoutFn: "classico" },
  { id: "editorial", label: "Flyer Editorial", desc: "Estilo revista musical premium", badge: "Semanal", badgeColor: "bg-purple-600", agendaType: "week", layoutFn: "editorial" },
];

const FORMATS: { id: FlyerFormat; label: string; size: string; w: number; h: number }[] = [
  { id: "feed", label: "Feed", size: "1080×1080", w: 1080, h: 1080 },
  { id: "stories", label: "Stories", size: "1080×1920", w: 1080, h: 1920 },
];

function getDayNum(dateStr: string) {
  return parseInt(dateStr.split("-")[2], 10);
}

function getMonthAbbr(dateStr: string) {
  const m = parseInt(dateStr.split("-")[1], 10) - 1;
  return ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"][m];
}

function getMonthName(month: number) {
  return new Date(2024, month, 1).toLocaleDateString("pt-BR", { month: "long" });
}

function getFullDate(dateStr: string) {
  const [, m, d] = dateStr.split("-");
  const monthIdx = parseInt(m, 10) - 1;
  const monthName = getMonthName(monthIdx);
  return `${parseInt(d, 10)} de ${monthName}`;
}

export default function FlyerDivulgacao() {
  const { shows } = useShows();
  const { profile } = useProfile();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [flyerFormat, setFlyerFormat] = useState<FlyerFormat>("stories");
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const getFilteredShows = useCallback((agendaType: string) => {
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

    const monthStr = todayStr.slice(0, 7);
    return confirmed.filter((s) => s.date.startsWith(monthStr));
  }, [shows, todayStr]);

  const artistName = profile?.artist_name || profile?.name || "Artista";
  const avatarUrl = profile?.avatar_url || null;
  const instagram = profile?.instagram_url
    ? profile.instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\//, "@").replace(/\/$/, "")
    : null;

  const generateFlyer = useCallback(async (templateId: string, format: FlyerFormat) => {
    setGenerating(true);
    try {
      const template = TEMPLATES.find((t) => t.id === templateId)!;
      const fmt = FORMATS.find((f) => f.id === format)!;
      const W = fmt.w;
      const H = fmt.h;
      const filteredShows = getFilteredShows(template.agendaType);

      const canvas = canvasRef.current!;
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Load avatar
      let avatarImg: HTMLImageElement | null = null;
      if (avatarUrl) {
        try {
          avatarImg = await loadImage(avatarUrl);
        } catch { /* no avatar */ }
      }

      switch (template.layoutFn) {
        case "mensal":
          drawMensalLayout(ctx, W, H, avatarImg, artistName, filteredShows, instagram);
          break;
        case "hoje":
          drawHojeLayout(ctx, W, H, avatarImg, artistName, filteredShows, instagram);
          break;
        case "classico":
          drawClassicoLayout(ctx, W, H, avatarImg, artistName, filteredShows, instagram);
          break;
        case "editorial":
          drawEditorialLayout(ctx, W, H, avatarImg, artistName, filteredShows, instagram);
          break;
      }

      // Watermark Backstage Pro
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.font = "bold 16px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("BACKSTAGE PRO", W / 2, H - 14);

      const dataUrl = canvas.toDataURL("image/png");
      setGeneratedImage(dataUrl);
      setSelectedTemplate(templateId);
      toast.success("Flyer gerado com sucesso!");
    } catch (err) {
      console.error("Error generating flyer:", err);
      toast.error("Erro ao gerar flyer");
    } finally {
      setGenerating(false);
    }
  }, [getFilteredShows, artistName, avatarUrl, instagram]);

  const downloadFlyer = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.download = `flyer-${selectedTemplate}-${flyerFormat}.png`;
    link.href = generatedImage;
    link.click();
    toast.success("Flyer baixado!");
  };

  const autoGenerateWeek = () => {
    setFlyerFormat("stories");
    generateFlyer("classico", "stories");
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setGeneratedImage(null);
    generateFlyer(templateId, flyerFormat);
  };

  return (
    <Layout title="Flyer Divulgação">
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
          <Button onClick={autoGenerateWeek} variant="gradient" size="lg" disabled={generating} className="gap-2">
            <Sparkles className="w-5 h-5" />
            Gerar flyer da semana
          </Button>
        </div>

        {/* Generated image modal/preview */}
        {generatedImage && (
          <Card className="border-primary/30">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-lg font-semibold text-foreground">Flyer Gerado</h3>
                  <Button variant="ghost" size="sm" onClick={() => setGeneratedImage(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <img
                  src={generatedImage}
                  alt="Flyer gerado"
                  className="w-full max-w-[360px] rounded-lg shadow-xl border border-border"
                />
                <div className="flex gap-3 w-full max-w-[360px]">
                  <Button onClick={downloadFlyer} className="flex-1 gap-2" variant="gradient">
                    <Download className="w-4 h-4" />
                    Baixar Flyer
                  </Button>
                </div>
                {/* Format toggle */}
                <div className="flex gap-2">
                  {FORMATS.map((fmt) => (
                    <Button
                      key={fmt.id}
                      variant={flyerFormat === fmt.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setFlyerFormat(fmt.id);
                        if (selectedTemplate) generateFlyer(selectedTemplate, fmt.id);
                      }}
                    >
                      {fmt.label} ({fmt.size})
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Escolha um template</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Template list */}
        <div className="space-y-3">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              disabled={generating}
              className={cn(
                "w-full flex items-center gap-5 p-5 rounded-xl border-2 transition-all text-left hover:shadow-md",
                selectedTemplate === template.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              )}
            >
              {/* Thumbnail preview */}
              <div className="w-20 h-24 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                <TemplateThumbnail id={template.id} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground text-lg">{template.label}</h3>
                  <span className={cn("text-xs text-white font-semibold px-2.5 py-0.5 rounded-full", template.badgeColor)}>
                    {template.badge}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{template.desc}</p>
              </div>

              {/* Arrow */}
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </Layout>
  );
}

// Mini thumbnail component for template previews
function TemplateThumbnail({ id }: { id: string }) {
  const colors: Record<string, { bg: string; accent: string }> = {
    mensal: { bg: "#0f172a", accent: "#38bdf8" },
    hoje: { bg: "#0e7490", accent: "#ffffff" },
    classico: { bg: "#1a1a1a", accent: "#ef4444" },
    editorial: { bg: "#111111", accent: "#ffffff" },
  };
  const c = colors[id] || colors.mensal;
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2" style={{ background: c.bg }}>
      <div className="w-6 h-6 rounded-full border-2" style={{ borderColor: c.accent, opacity: 0.7 }} />
      <div className="w-10 h-1 rounded" style={{ background: c.accent, opacity: 0.5 }} />
      <div className="w-8 h-0.5 rounded" style={{ background: c.accent, opacity: 0.3 }} />
      <div className="flex gap-1 mt-1">
        <div className="w-3 h-3 rounded-sm" style={{ background: c.accent, opacity: 0.4 }} />
        <div className="w-3 h-3 rounded-sm" style={{ background: c.accent, opacity: 0.3 }} />
      </div>
    </div>
  );
}

// =====================================================
// LAYOUT 1: MENSAL — Dark bg, cyan/blue accent, grid
// =====================================================
function drawMensalLayout(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  avatar: HTMLImageElement | null, name: string, shows: any[], instagram: string | null
) {
  // Dark gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#0f172a");
  bgGrad.addColorStop(0.5, "#1e293b");
  bgGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle diagonal lines
  ctx.strokeStyle = "rgba(56,189,248,0.04)";
  ctx.lineWidth = 1;
  for (let i = -H; i < W + H; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }

  let y = H * 0.04;

  // Avatar
  if (avatar) {
    const size = Math.min(W * 0.3, 280);
    const cx = W / 2;
    const cy = y + size / 2 + 20;

    // Glow behind avatar
    const glowGrad = ctx.createRadialGradient(cx, cy, size * 0.3, cx, cy, size * 0.9);
    glowGrad.addColorStop(0, "rgba(56,189,248,0.15)");
    glowGrad.addColorStop(1, "rgba(56,189,248,0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(cx - size, cy - size, size * 2, size * 2);

    // Avatar circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2 + 4, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56,189,248,0.3)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, cx - size / 2, cy - size / 2, size, size);
    ctx.restore();
    y = cy + size / 2 + 30;
  } else {
    y += 40;
  }

  // Title "AGENDA MENSAL"
  const titleGrad = ctx.createLinearGradient(W * 0.2, y, W * 0.8, y + 60);
  titleGrad.addColorStop(0, "#38bdf8");
  titleGrad.addColorStop(1, "#06b6d4");
  ctx.fillStyle = titleGrad;
  ctx.font = "900 64px 'Segoe UI', Impact, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("AGENDA MENSAL", W / 2, y + 55);
  y += 80;

  // Artist name
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "300 36px 'Segoe UI', sans-serif";
  ctx.letterSpacing = "8px";
  ctx.fillText(name, W / 2, y + 30);
  y += 70;

  // Shows grid (3 columns)
  if (shows.length > 0) {
    const cols = 3;
    const cellW = (W - 120) / cols;
    const cellH = 100;
    const startX = 60;

    for (let i = 0; i < shows.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * cellW;
      const cy = y + row * (cellH + 16);

      // Day number
      ctx.fillStyle = "#38bdf8";
      ctx.font = "900 52px 'Segoe UI', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(String(getDayNum(shows[i].date)), cx, cy + 48);

      // Show title
      const numW = ctx.measureText(String(getDayNum(shows[i].date))).width;
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "400 20px 'Segoe UI', sans-serif";
      const title = truncateText(ctx, shows[i].title, cellW - numW - 30);
      ctx.fillText(title, cx + numW + 12, cy + 30);

      // Venue
      if (shows[i].venue || shows[i].address) {
        ctx.fillStyle = "rgba(148,163,184,0.7)";
        ctx.font = "400 16px 'Segoe UI', sans-serif";
        const venue = truncateText(ctx, shows[i].venue || shows[i].address || "", cellW - numW - 30);
        ctx.fillText(venue, cx + numW + 12, cy + 50);
      }

      // Month abbreviation
      ctx.fillStyle = "#38bdf8";
      ctx.font = "800 22px 'Segoe UI', sans-serif";
      ctx.fillText(getMonthAbbr(shows[i].date), cx, cy + 78);
    }

    const totalRows = Math.ceil(shows.length / cols);
    y += totalRows * (cellH + 16) + 20;
  } else {
    ctx.fillStyle = "#64748b";
    ctx.font = "24px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Nenhum show agendado", W / 2, y + 40);
  }

  // Instagram at bottom
  if (instagram) {
    ctx.fillStyle = "#64748b";
    ctx.font = "22px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`📸 ${instagram}`, W / 2, H - 50);
  }
}

// =====================================================
// LAYOUT 2: HOJE — Teal gradient, wave texture, script
// =====================================================
function drawHojeLayout(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  avatar: HTMLImageElement | null, name: string, shows: any[], instagram: string | null
) {
  // Teal gradient background
  const bgGrad = ctx.createLinearGradient(0, 0, W * 0.5, H);
  bgGrad.addColorStop(0, "#0e7490");
  bgGrad.addColorStop(0.4, "#0891b2");
  bgGrad.addColorStop(1, "#155e75");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Wave texture pattern
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 1.5;
  for (let row = 0; row < H; row += 30) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 5) {
      const yOff = Math.sin((x + row) * 0.02) * 12 + Math.sin((x - row) * 0.015) * 8;
      if (x === 0) ctx.moveTo(x, row + yOff);
      else ctx.lineTo(x, row + yOff);
    }
    ctx.stroke();
  }

  // Artist name at top
  ctx.fillStyle = "#ffffff";
  ctx.font = "300 32px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, W / 2, 60);

  // Large avatar
  const avatarSize = Math.min(W * 0.45, 400);
  const cx = W / 2;
  const cy = H * 0.38;

  if (avatar) {
    // White circle border
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, avatarSize / 2 + 8, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, cx - avatarSize / 2, cy - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();
  }

  // "Hoje" script text
  let textY = cy + avatarSize / 2 - 30;
  ctx.fillStyle = "#ffffff";
  ctx.font = "italic 900 80px Georgia, 'Times New Roman', serif";
  ctx.textAlign = "center";

  // Text shadow
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.fillText("Hoje", W / 2, textY);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  textY += 60;

  // Show info
  if (shows.length > 0) {
    const show = shows[0];
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px 'Segoe UI', sans-serif";
    ctx.fillText(show.title.toUpperCase(), W / 2, textY + 20);

    if (show.venue || show.address) {
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "22px 'Segoe UI', sans-serif";
      ctx.fillText(show.venue || show.address, W / 2, textY + 55);
    }

    // Date at bottom
    ctx.fillStyle = "#ffffff";
    ctx.font = "italic bold 36px Georgia, 'Times New Roman', serif";
    ctx.fillText(getFullDate(show.date), W / 2, H - 80);

    if (show.start_time) {
      ctx.font = "24px 'Segoe UI', sans-serif";
      ctx.fillText(show.start_time, W / 2, H - 45);
    }
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "24px 'Segoe UI', sans-serif";
    ctx.fillText("Nenhum show hoje", W / 2, textY + 30);
  }

  // Instagram
  if (instagram) {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "20px 'Segoe UI', sans-serif";
    ctx.fillText(instagram, W / 2, H - 50);
  }
}

// =====================================================
// LAYOUT 3: CLÁSSICO — Dark angular bg, red accents, 2-col grid
// =====================================================
function drawClassicoLayout(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  avatar: HTMLImageElement | null, name: string, shows: any[], instagram: string | null
) {
  // Base dark background
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, W, H);

  // Angular geometric shapes for depth
  const shapes = [
    { x: W * 0.05, y: H * 0.02, w: W * 0.55, h: H * 0.45, rot: -0.08, color: "rgba(40,40,40,0.9)" },
    { x: W * 0.35, y: H * 0.1, w: W * 0.65, h: H * 0.5, rot: 0.06, color: "rgba(35,35,35,0.8)" },
    { x: -W * 0.1, y: H * 0.55, w: W * 0.7, h: H * 0.5, rot: -0.04, color: "rgba(45,45,45,0.7)" },
    { x: W * 0.4, y: H * 0.6, w: W * 0.7, h: H * 0.45, rot: 0.03, color: "rgba(30,30,30,0.8)" },
  ];
  for (const s of shapes) {
    ctx.save();
    ctx.translate(s.x + s.w / 2, s.y + s.h / 2);
    ctx.rotate(s.rot);
    ctx.fillStyle = s.color;
    ctx.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
    ctx.restore();
  }

  // Subtle noise-like dots for texture
  ctx.fillStyle = "rgba(255,255,255,0.008)";
  for (let i = 0; i < 600; i++) {
    const dx = Math.random() * W;
    const dy = Math.random() * H;
    ctx.fillRect(dx, dy, 2, 2);
  }

  // Calculate layout positions
  const isStories = H > W;
  const avatarSize = isStories ? Math.min(W * 0.38, 340) : Math.min(W * 0.3, 280);
  const cx = W / 2;
  const avatarCy = isStories ? H * 0.18 : H * 0.24;

  // Red accent line TOP
  const lineW = W * 0.5;
  const lineX = (W - lineW) / 2;
  const topLineY = avatarCy + avatarSize / 2 + 20;
  const redGrad = ctx.createLinearGradient(lineX, 0, lineX + lineW, 0);
  redGrad.addColorStop(0, "transparent");
  redGrad.addColorStop(0.15, "#ef4444");
  redGrad.addColorStop(0.85, "#ef4444");
  redGrad.addColorStop(1, "transparent");
  ctx.fillStyle = redGrad;
  ctx.fillRect(lineX, topLineY, lineW, 3);

  // Avatar with white ring
  if (avatar) {
    // Subtle glow
    const glow = ctx.createRadialGradient(cx, avatarCy, avatarSize * 0.3, cx, avatarCy, avatarSize * 0.8);
    glow.addColorStop(0, "rgba(255,255,255,0.06)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, avatarCy - avatarSize, W, avatarSize * 2);

    // White border ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, avatarCy, avatarSize / 2 + 5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 3;
    ctx.stroke();
    // Clip and draw avatar
    ctx.beginPath();
    ctx.arc(cx, avatarCy, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, cx - avatarSize / 2, avatarCy - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();
  } else {
    // Placeholder circle
    ctx.beginPath();
    ctx.arc(cx, avatarCy, avatarSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(80,80,80,0.6)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 3;
    ctx.stroke();
    // Person icon placeholder
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.arc(cx, avatarCy - avatarSize * 0.08, avatarSize * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, avatarCy + avatarSize * 0.28, avatarSize * 0.25, Math.PI, 0);
    ctx.fill();
  }

  // Artist name
  let y = topLineY + 35;
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${isStories ? 42 : 36}px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(name, cx, y);
  y += isStories ? 10 : 8;

  // "Próximos Shows" subtitle in red italic
  ctx.fillStyle = "#ef4444";
  ctx.font = `italic 600 ${isStories ? 28 : 24}px Georgia, 'Times New Roman', serif`;
  ctx.fillText("Próximos Shows", cx, y + 30);
  y += isStories ? 65 : 55;

  // Shows in 2-column grid
  if (shows.length > 0) {
    const cols = 2;
    const gridMargin = isStories ? 80 : 60;
    const colW = (W - gridMargin * 2) / cols;
    const rowH = isStories ? 110 : 95;
    const maxShows = isStories ? 10 : 6;

    for (let i = 0; i < Math.min(shows.length, maxShows); i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = gridMargin + col * colW;
      const sy = y + row * rowH;

      // Large day number
      ctx.fillStyle = "#ffffff";
      ctx.font = `900 ${isStories ? 56 : 48}px 'Segoe UI', sans-serif`;
      ctx.textAlign = "left";
      const dayStr = String(getDayNum(shows[i].date));
      ctx.fillText(dayStr, sx, sy + 48);

      const numW = ctx.measureText(dayStr).width;

      // Show title/venue next to number
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = `400 ${isStories ? 20 : 18}px 'Segoe UI', sans-serif`;
      const titleMaxW = colW - numW - 24;
      const title = truncateText(ctx, shows[i].title || shows[i].venue || "", titleMaxW);
      ctx.fillText(title, sx + numW + 12, sy + 30);

      // Venue below title if different
      if (shows[i].venue && shows[i].title !== shows[i].venue) {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = `400 ${isStories ? 16 : 14}px 'Segoe UI', sans-serif`;
        const venue = truncateText(ctx, shows[i].venue || "", titleMaxW);
        ctx.fillText(venue, sx + numW + 12, sy + 50);
      }

      // Month abbreviation below day number
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = `700 ${isStories ? 20 : 18}px 'Segoe UI', sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText(getMonthAbbr(shows[i].date).toLowerCase(), sx, sy + 76);
    }

    const totalRows = Math.ceil(Math.min(shows.length, maxShows) / cols);
    y += totalRows * rowH + 10;
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "22px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Nenhum show agendado", cx, y + 40);
    y += 80;
  }

  // Red accent line BOTTOM
  const bottomLineY = Math.min(y + 10, H - 70);
  ctx.fillStyle = redGrad;
  ctx.fillRect(lineX, bottomLineY, lineW, 3);

  // Instagram
  if (instagram) {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "20px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(instagram, cx, H - 45);
  }
}

// =====================================================
// LAYOUT 4: EDITORIAL — Concert vibe, paint-splash
// =====================================================
function drawEditorialLayout(
  ctx: CanvasRenderingContext2D, W: number, H: number,
  avatar: HTMLImageElement | null, name: string, shows: any[], instagram: string | null
) {
  // Very dark background
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, W, H);

  // Concert-style gradient at bottom
  const concertGrad = ctx.createLinearGradient(0, H * 0.6, 0, H);
  concertGrad.addColorStop(0, "rgba(17,17,17,1)");
  concertGrad.addColorStop(0.5, "rgba(30,20,20,0.9)");
  concertGrad.addColorStop(1, "rgba(17,17,17,1)");
  ctx.fillStyle = concertGrad;
  ctx.fillRect(0, H * 0.6, W, H * 0.4);

  // Bokeh lights
  for (let i = 0; i < 15; i++) {
    const bx = Math.random() * W;
    const by = H * 0.5 + Math.random() * H * 0.3;
    const br = 3 + Math.random() * 8;
    const alpha = 0.05 + Math.random() * 0.1;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,200,150,${alpha})`;
    ctx.fill();
  }

  // Silhouette hands at bottom
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  for (let x = 0; x < W; x += 60) {
    const handH = 30 + Math.random() * 50;
    const handW = 15 + Math.random() * 20;
    roundRect(ctx, x + Math.random() * 20, H - handH - 30, handW, handH, 8);
    ctx.fill();
  }

  // Avatar on right side with paint-splash effect
  const avatarSize = Math.min(W * 0.42, 380);
  const avX = W * 0.65;
  const avY = H * 0.35;

  if (avatar) {
    // Paint splash shapes (white blobs)
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = avatarSize * 0.45 + Math.random() * avatarSize * 0.2;
      const blobX = avX + Math.cos(angle) * dist;
      const blobY = avY + Math.sin(angle) * dist;
      const blobR = 15 + Math.random() * 35;
      ctx.beginPath();
      ctx.arc(blobX, blobY, blobR, 0, Math.PI * 2);
      ctx.fill();
    }

    // White base circle
    ctx.beginPath();
    ctx.arc(avX, avY, avatarSize / 2 + 15, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fill();

    // Avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(avX, avY, avatarSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, avX - avatarSize / 2, avY - avatarSize / 2, avatarSize, avatarSize);
    ctx.restore();
  }

  // "AGENDA" + "SEMANAL" editorial text top-left
  const margin = 60;
  let y = 80;
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 56px 'Segoe UI', Impact, sans-serif";
  ctx.textAlign = "left";
  ctx.letterSpacing = "12px";
  ctx.fillText("AGENDA", margin, y);
  y += 35;
  ctx.font = "300 32px 'Segoe UI', sans-serif";
  ctx.fillText("S E M A N A L", margin, y);
  y += 50;

  // Shows list (left aligned, editorial style)
  if (shows.length > 0) {
    for (let i = 0; i < Math.min(shows.length, 6); i++) {
      // Day number
      ctx.fillStyle = "#ffffff";
      ctx.font = "italic 900 46px Georgia, 'Times New Roman', serif";
      ctx.textAlign = "left";
      ctx.fillText(String(getDayNum(shows[i].date)), margin, y + 40);

      const numW = ctx.measureText(String(getDayNum(shows[i].date))).width;

      // Show title
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "400 20px 'Segoe UI', sans-serif";
      const maxTitleW = W * 0.4 - numW - 20;
      const title = truncateText(ctx, shows[i].title, maxTitleW);
      ctx.fillText(title, margin + numW + 14, y + 24);

      // Venue
      if (shows[i].venue || shows[i].address) {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "400 16px 'Segoe UI', sans-serif";
        const venue = truncateText(ctx, shows[i].venue || shows[i].address || "", maxTitleW);
        ctx.fillText(venue, margin + numW + 14, y + 44);
      }

      // Month
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 18px 'Segoe UI', sans-serif";
      ctx.fillText(getMonthAbbr(shows[i].date), margin, y + 68);

      y += 90;
    }
  }

  // Artist name at bottom center
  ctx.fillStyle = "#ffffff";
  ctx.font = "600 44px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(name, W / 2, H - 70);

  // Instagram
  if (instagram) {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "20px 'Segoe UI', sans-serif";
    ctx.fillText(instagram, W / 2, H - 38);
  }
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
