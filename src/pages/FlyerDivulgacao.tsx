import { useState, useRef, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, Download, ChevronLeft, ChevronRight, Music, MapPin, Clock, Calendar } from "lucide-react";
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
  const [format, setFormat] = useState<"feed" | "stories">("feed");

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
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleDownload = async () => {
    if (!flyerRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(flyerRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#000",
      });
      const link = document.createElement("a");
      link.download = `flyer-${MONTH_NAMES[selectedMonth].toLowerCase()}-${selectedYear}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Flyer baixado com sucesso!");
    } catch {
      toast.error("Erro ao gerar imagem do flyer");
    } finally {
      setDownloading(false);
    }
  };

  const formatShowDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    return {
      day: String(d.getDate()).padStart(2, "0"),
      weekday: WEEKDAY_SHORT[d.getDay()],
    };
  };

  return (
    <Layout title="Flyer Divulgação">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="w-7 h-7 text-primary" />
            Flyer Divulgação
          </h1>
          <p className="text-muted-foreground mt-1">
            Gere flyers mensais profissionais com suas datas de show
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="px-4 py-2 font-semibold text-foreground min-w-[160px] text-center">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Select value={format} onValueChange={(v) => setFormat(v as "feed" | "stories")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feed">Feed (1:1)</SelectItem>
              <SelectItem value="stories">Stories (9:16)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleDownload}
            disabled={downloading || monthShows.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Gerando..." : "Baixar Flyer"}
          </Button>
        </div>

        {monthShows.length === 0 ? (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground" />
              <h2 className="text-xl font-semibold text-foreground">Nenhum show neste mês</h2>
              <p className="text-muted-foreground max-w-md">
                Adicione shows na Agenda para gerar o flyer mensal.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex justify-center overflow-auto pb-4">
            {/* Flyer Preview */}
            <div
              ref={flyerRef}
              className="relative overflow-hidden flex-shrink-0"
              style={{
                width: format === "feed" ? 540 : 405,
                height: format === "feed" ? 540 : 720,
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
              }}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1025] to-[#0d0d0d]" />
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-bl from-purple-600/20 via-transparent to-transparent rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-amber-500/10 via-transparent to-transparent rounded-tr-full" />
              
              {/* Grid lines decorative */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full p-6">
                {/* Header - Artist info */}
                <div className="flex items-center gap-3 mb-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={artistName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-purple-400/60 shadow-lg shadow-purple-500/20"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center border-2 border-purple-400/60">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-white font-extrabold text-xl leading-tight tracking-tight">
                      {artistName}
                    </h2>
                    <p className="text-purple-300/80 text-xs font-medium uppercase tracking-widest">
                      Agenda de Shows
                    </p>
                  </div>
                </div>

                {/* Month Title */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-amber-400 font-black text-3xl tracking-tight">
                      {MONTH_NAMES[selectedMonth]}
                    </span>
                    <span className="text-white/40 font-light text-lg">{selectedYear}</span>
                  </div>
                  <div className="h-[2px] w-16 bg-gradient-to-r from-amber-400 to-purple-500 mt-1 rounded-full" />
                </div>

                {/* Shows List */}
                <div
                  className="flex-1 overflow-hidden flex flex-col"
                  style={{ gap: monthShows.length > 8 ? 4 : monthShows.length > 5 ? 6 : 10 }}
                >
                  {monthShows.map((show, i) => {
                    const { day, weekday } = formatShowDate(show.date);
                    const isCompact = monthShows.length > 8;
                    const isMedium = monthShows.length > 5;

                    return (
                      <div
                        key={show.id}
                        className="flex items-center gap-3 rounded-xl px-3"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.04)",
                          borderLeft: "3px solid",
                          borderImage: i % 2 === 0
                            ? "linear-gradient(to bottom, #a855f7, #7c3aed) 1"
                            : "linear-gradient(to bottom, #f59e0b, #d97706) 1",
                          padding: isCompact ? "6px 12px" : isMedium ? "8px 12px" : "10px 12px",
                        }}
                      >
                        {/* Date */}
                        <div className="text-center flex-shrink-0" style={{ minWidth: 44 }}>
                          <div
                            className="font-black text-white leading-none"
                            style={{ fontSize: isCompact ? 20 : 26 }}
                          >
                            {day}
                          </div>
                          <div
                            className="font-bold uppercase tracking-wider"
                            style={{
                              fontSize: isCompact ? 8 : 9,
                              color: i % 2 === 0 ? "#c084fc" : "#fbbf24",
                            }}
                          >
                            {weekday}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-8 bg-white/10 flex-shrink-0" />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-white font-bold truncate leading-tight"
                            style={{ fontSize: isCompact ? 12 : isMedium ? 13 : 14 }}
                          >
                            {show.title}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {show.start_time && (
                              <span className="flex items-center gap-1 text-white/50" style={{ fontSize: isCompact ? 9 : 10 }}>
                                <Clock className="flex-shrink-0" style={{ width: 9, height: 9 }} />
                                {show.start_time.slice(0, 5)}
                              </span>
                            )}
                            {(show.venue || show.address) && (
                              <span className="flex items-center gap-1 text-white/50 truncate" style={{ fontSize: isCompact ? 9 : 10 }}>
                                <MapPin className="flex-shrink-0" style={{ width: 9, height: 9 }} />
                                <span className="truncate">{show.venue || show.address}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer - Branding */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center">
                      <Music className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white/30 text-[10px] font-semibold tracking-wider uppercase">
                      Backstage Pro
                    </span>
                  </div>
                  <span className="text-white/20 text-[9px]">
                    {monthShows.length} {monthShows.length === 1 ? "show" : "shows"} confirmados
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
