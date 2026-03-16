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
        backgroundColor: "#fdf6ef",
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

  const getShowLine = (show: typeof monthShows[0]) => {
    const d = new Date(show.date + "T12:00:00");
    const day = String(d.getDate()).padStart(2, "0");
    const city = show.venue || show.address || show.title;
    return { day, city };
  };

  // Split shows into two columns
  const midpoint = Math.ceil(monthShows.length / 2);
  const col1 = monthShows.slice(0, midpoint);
  const col2 = monthShows.slice(midpoint);

  const flyerW = format === "feed" ? 540 : 405;
  const flyerH = format === "feed" ? 540 : 720;

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
            {/* ===== FLYER ===== */}
            <div
              ref={flyerRef}
              className="relative overflow-hidden flex-shrink-0"
              style={{
                width: flyerW,
                height: flyerH,
                fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
              }}
            >
              {/* Warm background */}
              <div className="absolute inset-0" style={{ background: "#fdf6ef" }} />

              {/* Organic blob shapes */}
              <svg
                className="absolute"
                style={{ top: -30, right: -40, width: "65%", height: "auto", opacity: 0.9 }}
                viewBox="0 0 300 300"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M45.3,-57.2C58.6,-48.1,69.3,-34.1,74.2,-17.8C79.1,-1.6,78.2,16.8,70.1,31.5C62,46.2,46.7,57.1,30.2,63.3C13.6,69.5,-4.3,71,-21.4,66.7C-38.4,62.4,-54.7,52.3,-64.3,37.8C-73.9,23.3,-76.8,4.4,-73.2,-13C-69.5,-30.3,-59.3,-46.1,-45.5,-55.2C-31.7,-64.3,-14.3,-66.6,1,-67.8C16.2,-69,32,-66.3,45.3,-57.2Z"
                  transform="translate(150,150)"
                  fill="#F4845F"
                />
              </svg>

              <svg
                className="absolute"
                style={{ bottom: -20, left: -50, width: "55%", height: "auto", opacity: 0.85 }}
                viewBox="0 0 300 300"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M39.5,-51.6C52.9,-44.5,66.8,-35.5,72.5,-22.6C78.2,-9.7,75.7,7,68.2,20.2C60.7,33.4,48.2,43.2,35,51.7C21.7,60.3,7.7,67.5,-6.6,69.1C-20.9,70.6,-35.6,66.5,-47.5,57.5C-59.3,48.4,-68.4,34.3,-72.2,18.8C-76,-3.3,-74.5,-18.9,-66.8,-31.4C-59.1,-44,-45.2,-53.6,-31,-59.6C-16.7,-65.6,-2.1,-68,8.3,-62.1C18.7,-56.2,26.1,-58.7,39.5,-51.6Z"
                  transform="translate(150,150)"
                  fill="#F4845F"
                />
              </svg>

              <svg
                className="absolute"
                style={{ bottom: "25%", right: -30, width: "35%", height: "auto", opacity: 0.5 }}
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M44.5,-52.2C56.4,-43.5,64,-28.5,67.7,-12.4C71.3,3.8,71,21.1,63.2,34.1C55.5,47.2,40.3,56,24.2,60.6C8,65.2,-9.2,65.5,-24.3,60C-39.5,54.5,-52.6,43.1,-60.7,28.5C-68.7,13.9,-71.7,-3.8,-66.5,-18.3C-61.3,-32.8,-48,-44.1,-34.2,-52.3C-20.4,-60.5,-6.2,-65.5,5.6,-62.6C17.4,-59.6,32.5,-60.8,44.5,-52.2Z"
                  transform="translate(100,100)"
                  fill="#FDBA74"
                />
              </svg>

              {/* Small decorative hearts */}
              <div className="absolute" style={{ bottom: 60, left: 30, fontSize: 18, color: "#F4845F", opacity: 0.5 }}>♥</div>
              <div className="absolute" style={{ bottom: 100, right: 50, fontSize: 14, color: "#FDBA74", opacity: 0.4 }}>♥</div>
              <div className="absolute" style={{ top: "40%", right: 20, fontSize: 12, color: "#F4845F", opacity: 0.3 }}>♥</div>

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full" style={{ padding: format === "feed" ? "28px 28px 20px" : "32px 28px 20px" }}>
                {/* Title */}
                <div className="text-center" style={{ marginBottom: format === "feed" ? 16 : 24 }}>
                  <h1
                    className="font-black uppercase tracking-tight leading-none"
                    style={{
                      fontSize: format === "feed" ? 36 : 40,
                      color: "#1a1a1a",
                      letterSpacing: "2px",
                    }}
                  >
                    Próximos
                  </h1>
                  <h2
                    className="font-black uppercase tracking-widest"
                    style={{
                      fontSize: format === "feed" ? 28 : 32,
                      color: "#F4845F",
                      letterSpacing: "6px",
                      marginTop: -4,
                    }}
                  >
                    Shows
                  </h2>
                </div>

                {/* Dates in two columns */}
                <div
                  className="flex gap-4"
                  style={{
                    marginBottom: format === "feed" ? 12 : 20,
                    flex: format === "feed" ? "0 0 auto" : undefined,
                  }}
                >
                  {/* Column 1 */}
                  <div className="flex-1 flex flex-col" style={{ gap: monthShows.length > 10 ? 3 : 6 }}>
                    {col1.map((show) => {
                      const { day, city } = getShowLine(show);
                      return (
                        <div
                          key={show.id}
                          className="font-bold uppercase truncate"
                          style={{
                            fontSize: monthShows.length > 12 ? 10 : monthShows.length > 8 ? 11 : 12,
                            color: "#1a1a1a",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {day} – {city}
                        </div>
                      );
                    })}
                  </div>
                  {/* Column 2 */}
                  {col2.length > 0 && (
                    <div className="flex-1 flex flex-col" style={{ gap: monthShows.length > 10 ? 3 : 6 }}>
                      {col2.map((show) => {
                        const { day, city } = getShowLine(show);
                        return (
                          <div
                            key={show.id}
                            className="font-bold uppercase truncate"
                            style={{
                              fontSize: monthShows.length > 12 ? 10 : monthShows.length > 8 ? 11 : 12,
                              color: "#1a1a1a",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {day} – {city}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Spacer to push artist to bottom */}
                <div className="flex-1" />

                {/* Artist Section */}
                <div className="flex flex-col items-center" style={{ marginTop: 8 }}>
                  {/* Circular Avatar */}
                  <div
                    className="relative"
                    style={{
                      width: format === "feed" ? 180 : 200,
                      height: format === "feed" ? 180 : 200,
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #F4845F 0%, #FDBA74 50%, #F4845F 100%)",
                        padding: 4,
                      }}
                    >
                      <div
                        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                        style={{ background: "#fdf6ef" }}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={artistName}
                            className="w-full h-full object-cover rounded-full"
                            crossOrigin="anonymous"
                            style={{ padding: 3 }}
                          />
                        ) : (
                          <div
                            className="w-full h-full rounded-full flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #F4845F, #FDBA74)" }}
                          >
                            <Music className="text-white" style={{ width: 60, height: 60 }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Artist Name */}
                  <div
                    className="text-center"
                    style={{
                      marginTop: 10,
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontStyle: "italic",
                      fontWeight: 700,
                      fontSize: format === "feed" ? 24 : 28,
                      color: "#1a1a1a",
                    }}
                  >
                    {artistName}
                  </div>
                </div>

                {/* Footer Branding */}
                <div className="text-center" style={{ marginTop: 10 }}>
                  <span
                    className="uppercase font-semibold tracking-widest"
                    style={{ fontSize: 8, color: "#1a1a1a", opacity: 0.3 }}
                  >
                    Backstage Pro
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
