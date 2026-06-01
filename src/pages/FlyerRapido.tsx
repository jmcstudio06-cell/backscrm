import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useShows } from "@/contexts/shows/ShowsContext";
import { useProfile } from "@/hooks/useProfile";
import { CalendarDays, Download, MapPin, Sparkles, Clock, User, Palette, Image as ImageIcon, Type } from "lucide-react";
import { toast } from "sonner";

const WEEKDAY_NAMES = ["DOMINGO", "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO"];
const MONTH_NAMES = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

function parseShowDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getHeadlineFromDate(dateString: string) {
  const showDate = parseShowDate(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  showDate.setHours(0, 0, 0, 0);

  const diffDays = Math.round((showDate.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) return "HOJE";
  if (diffDays === 1) return "AMANHA";
  return WEEKDAY_NAMES[showDate.getDay()] || "SHOW";
}

function formatShowLabel(dateString: string, title: string, venue: string | null) {
  const showDate = parseShowDate(dateString);
  const dateLabel = showDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${dateLabel} • ${title}${venue ? ` • ${venue}` : ""}`;
}

function formatFlyerDate(dateString: string) {
  const showDate = parseShowDate(dateString);
  return {
    day: String(showDate.getDate()).padStart(2, "0"),
    month: MONTH_NAMES[showDate.getMonth()],
  };
}

function formatFlyerTime(time: string | null) {
  if (!time) return "CONSULTE";
  const [hours, minutes] = time.split(":");
  if (minutes && minutes !== "00") return `${hours}:${minutes}`;
  return `${hours}H`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function FlyerRapido() {
  const { shows, loading } = useShows();
  const { profile } = useProfile();
  const flyerRef = useRef<HTMLDivElement>(null);
  const [selectedShowId, setSelectedShowId] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  // Estados de personalização
  const [customHeadline, setCustomHeadline] = useState("");
  const [customArtistName, setCustomArtistName] = useState("");
  const [customVenueName, setCustomVenueName] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState("#f6ff00");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");

  const orderedShows = useMemo(() => {
    return [...shows]
      .filter((show) => show.status !== "cancelled")
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.start_time || "").localeCompare(b.start_time || "");
      });
  }, [shows]);

  useEffect(() => {
    if (!selectedShowId && orderedShows.length > 0) {
      setSelectedShowId(orderedShows[0].id);
    }
  }, [orderedShows, selectedShowId]);

  const selectedShow = useMemo(
    () => orderedShows.find((show) => show.id === selectedShowId) || null,
    [orderedShows, selectedShowId],
  );

  const artistName = customArtistName || profile?.artist_name || profile?.name || "NOME DO CANTOR";
  const artistPhoto = customPhoto || profile?.avatar_url || null;
  const headline = customHeadline || (selectedShow ? getHeadlineFromDate(selectedShow.date) : "SHOW");
  const flyerDate = selectedShow ? formatFlyerDate(selectedShow.date) : { day: "00", month: "MES" };
  const flyerTime = customTime || (selectedShow ? formatFlyerTime(selectedShow.start_time) : "20H");
  const venueName = customVenueName || selectedShow?.venue || selectedShow?.title || "NOME DO LOCAL";

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!flyerRef.current || !selectedShow) {
      toast.error("Selecione uma data da agenda antes de baixar.");
      return;
    }

    setDownloading(true);
    try {
      const canvas = await html2canvas(flyerRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#111111",
        logging: false,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1);
      link.download = `${slugify(artistName)}-${selectedShow.date}-flyer.png`;
      link.click();
      toast.success("Flyer baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao baixar flyer:", error);
      toast.error("Nao foi possivel gerar o flyer.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Layout title="Flyer rapido" subtitle="Escolha uma data da agenda e gere um flyer automaticamente">
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Modelo automatico de flyer</CardTitle>
                <CardDescription>
                  Escolha um show da sua agenda para preencher data, horario, local e usar sua foto de perfil no layout.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Carregando seus shows...</div>
            ) : orderedShows.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                Nenhum show encontrado na agenda. Cadastre uma data primeiro para gerar o flyer.
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                  <Tabs defaultValue="agenda" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
                      <TabsTrigger value="agenda" className="gap-2">
                        <CalendarDays className="w-4 h-4" /> Agenda
                      </TabsTrigger>
                      <TabsTrigger value="texto" className="gap-2">
                        <Type className="w-4 h-4" /> Texto
                      </TabsTrigger>
                      <TabsTrigger value="estilo" className="gap-2">
                        <Palette className="w-4 h-4" /> Estilo
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="agenda" className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Escolha o show na sua agenda</Label>
                        <Select value={selectedShowId} onValueChange={setSelectedShowId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha uma data da agenda" />
                          </SelectTrigger>
                          <SelectContent>
                            {orderedShows.map((show) => (
                              <SelectItem key={show.id} value={show.id}>
                                {formatShowLabel(show.date, show.title, show.venue)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground">
                          Os dados abaixo são preenchidos automaticamente, mas você pode alterá-los na aba "Texto".
                        </p>
                      </div>

                      {selectedShow && (
                        <div className="grid gap-2 sm:grid-cols-3">
                          <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Data</div>
                            <div className="text-sm font-semibold truncate">
                              {parseShowDate(selectedShow.date).toLocaleDateString("pt-BR", {
                                weekday: "short",
                                day: "2-digit",
                                month: "short",
                              })}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Horário</div>
                            <div className="text-sm font-semibold truncate">{selectedShow.start_time || "N/I"}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/30 border space-y-1">
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Local</div>
                            <div className="text-sm font-semibold truncate">{venueName}</div>
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="texto" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Chamada (Headline)</Label>
                          <Input
                            placeholder="Ex: HOJE, SEXTA..."
                            value={customHeadline}
                            onChange={(e) => setCustomHeadline(e.target.value.toUpperCase())}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Horário</Label>
                          <Input
                            placeholder="Ex: 21H, 22:30..."
                            value={customTime}
                            onChange={(e) => setCustomTime(e.target.value.toUpperCase())}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Nome do Artista</Label>
                        <Input
                          placeholder="Como aparecerá no flyer"
                          value={customArtistName}
                          onChange={(e) => setCustomArtistName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Local do Show</Label>
                        <Input
                          placeholder="Nome do bar, clube ou evento"
                          value={customVenueName}
                          onChange={(e) => setCustomVenueName(e.target.value)}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="estilo" className="space-y-4 pt-4">
                      <div className="space-y-3">
                        <Label>Modelo do Layout</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setSelectedTemplate("modern")}
                            className={`p-3 rounded-xl border-2 transition-all text-left space-y-1 ${
                              selectedTemplate === "modern" ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"
                            }`}
                          >
                            <div className="font-bold text-sm">Moderno</div>
                            <div className="text-[11px] text-muted-foreground">Headline grande e cores vibrantes</div>
                          </button>
                          <button
                            onClick={() => setSelectedTemplate("impact")}
                            className={`p-3 rounded-xl border-2 transition-all text-left space-y-1 ${
                              selectedTemplate === "impact" ? "border-primary bg-primary/5" : "border-border hover:border-primary/20"
                            }`}
                          >
                            <div className="font-bold text-sm">Impacto</div>
                            <div className="text-[11px] text-muted-foreground">Foco total na foto do artista</div>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Cor de Destaque</Label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={accentColor}
                              onChange={(e) => setAccentColor(e.target.value)}
                              className="font-mono text-xs uppercase"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Sua Foto</Label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 text-xs h-10"
                              onClick={() => document.getElementById("flyer-photo-upload")?.click()}
                            >
                              <ImageIcon className="w-3.5 h-3.5" /> Alterar Foto
                            </Button>
                            <input
                              id="flyer-photo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePhotoUpload}
                            />
                            {customPhoto && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-10 text-xs text-destructive"
                                onClick={() => setCustomPhoto(null)}
                              >
                                Reset
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button onClick={handleDownload} disabled={!selectedShow || downloading} className="gap-2 h-11 px-6 shadow-lg shadow-primary/20">
                      <Download className="w-4 h-4" />
                      {downloading ? "Gerando imagem..." : "Baixar Flyer PNG"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11 px-4"
                      onClick={() => {
                        setCustomHeadline("");
                        setCustomArtistName("");
                        setCustomVenueName("");
                        setCustomTime("");
                        setCustomPhoto(null);
                        setAccentColor("#f6ff00");
                      }}
                    >
                      Limpar Alterações
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="sticky top-6">
                    <Card className="bg-muted/20 border-primary/10 overflow-hidden">
                      <CardHeader className="p-4 bg-muted/40 border-b">
                        <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Sparkles className="w-3 h-3" /> Pré-visualização
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 flex justify-center bg-[#1a1a1a] overflow-hidden h-[600px] relative">
                        <div className="scale-[0.55] sm:scale-[0.58] origin-top mt-4">
                          <div
                            ref={flyerRef}
                            className="relative w-[1000px] h-[1000px] overflow-hidden bg-[#050505] shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {/* Background Pattern - Elegant Wavy Lines */}
                            <div className="absolute inset-0 opacity-30 pointer-events-none z-0">
                              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                  <pattern id="waves-pattern" x="0" y="0" width="1000" height="200" patternUnits="userSpaceOnUse">
                                    <path 
                                      d="M0 100 C 250 50, 250 150, 500 100 C 750 50, 750 150, 1000 100" 
                                      fill="none" 
                                      stroke={accentColor} 
                                      strokeWidth="0.5" 
                                      opacity="0.3"
                                    />
                                    <path 
                                      d="M0 120 C 250 70, 250 170, 500 120 C 750 70, 750 170, 1000 120" 
                                      fill="none" 
                                      stroke={accentColor} 
                                      strokeWidth="0.5" 
                                      opacity="0.2"
                                    />
                                    <path 
                                      d="M0 80 C 250 30, 250 130, 500 80 C 750 30, 750 130, 1000 80" 
                                      fill="none" 
                                      stroke={accentColor} 
                                      strokeWidth="0.5" 
                                      opacity="0.2"
                                    />
                                  </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#waves-pattern)" />
                              </svg>
                            </div>
                            
                            {/* Lighting Effects */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 z-10" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[40%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent_70%)] z-10" />

                            {/* Headline (Double) */}
                            <div className="absolute inset-x-0 top-[5%] z-20 flex flex-col items-center leading-[0.82] tracking-[-0.05em] uppercase font-[1000] italic" style={{ color: accentColor }}>
                              <div className="text-[170px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">{headline}</div>
                              <div className="text-[170px] -mt-[15px] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">{headline}</div>
                            </div>

                            {/* Date & Time (Left Side) */}
                            <div className="absolute left-[6%] top-[48%] z-20 flex flex-col font-[1000] leading-none" style={{ color: accentColor }}>
                              <div className="text-[140px] flex items-start drop-shadow-lg">
                                {flyerDate.day}<span className="text-[80px] mt-6 ml-1 opacity-80">/</span>
                              </div>
                              <div className="text-[110px] -mt-6 drop-shadow-lg">{flyerDate.month}</div>
                              <div className="text-[46px] mt-8 tracking-tighter italic font-black bg-black/40 px-3 py-1 self-start rounded-sm">ÀS {flyerTime}</div>
                            </div>

                            {/* Artist Photo / Placeholder */}
                            <div className="absolute inset-0 z-0 flex items-center justify-center">
                              {artistPhoto ? (
                                <img
                                  src={artistPhoto}
                                  alt={artistName}
                                  crossOrigin="anonymous"
                                  className="h-full w-full object-cover grayscale-[0.2] contrast-[1.1]"
                                />
                              ) : (
                                <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
                                  <User className="w-[400px] h-[400px] text-white/5" />
                                </div>
                              )}
                              {/* Overlay for better text legibility */}
                              <div className="absolute inset-0 bg-black/20 z-[1]" />
                            </div>

                            {/* Artist Name (Floating Right) */}
                            <div className="absolute right-[8%] bottom-[33%] z-30 font-black uppercase tracking-[0.2em] italic" style={{ color: accentColor }}>
                              <div className="text-[32px] drop-shadow-md bg-black/60 px-4 py-2 rounded-sm border-r-4" style={{ borderColor: accentColor }}>{artistName}</div>
                            </div>

                            {/* Venue Box */}
                            <div className="absolute inset-x-[8%] bottom-[10%] z-40 px-8 py-12 shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center transform skew-x-[-2deg]" style={{ backgroundColor: accentColor }}>
                              <div className="text-black font-[1000] uppercase leading-[0.85] text-center italic tracking-tighter" style={{ fontSize: venueName.length > 15 ? '90px' : '120px' }}>
                                {venueName.split(' ').map((word, i) => (
                                  <div key={i}>{word}</div>
                                ))}
                              </div>
                            </div>

                            {/* Footer Logo */}
                            <div className="absolute inset-x-0 bottom-[2.5%] z-50 text-center">
                              <div className="text-white font-black leading-none text-[42px] tracking-tighter">
                                backstage<span className="text-white/80 text-[0.6em] align-[0.15em] font-bold ml-1">pro</span>
                              </div>
                              <div className="text-white/50 uppercase tracking-[0.4em] text-[11px] mt-2 font-black">
                                gestão para cantores
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        <span className="font-bold text-primary mr-1">DICA:</span>
                        Para melhores resultados, use uma foto com fundo limpo ou removido.
                        O flyer é gerado em alta resolução (3x) pronto para postar nos Stories.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
