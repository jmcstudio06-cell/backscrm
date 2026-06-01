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
                      <CardContent className="p-4 flex justify-center bg-black/40 overflow-hidden h-[500px]">
                        <div className="scale-[0.6] origin-top">
                          <div
                            ref={flyerRef}
                            className="relative w-[400px] h-[711px] overflow-hidden bg-[#111111] shadow-2xl"
                          >
                            {selectedTemplate === "modern" ? (
                              <div className="relative w-full h-full">
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    backgroundImage: `radial-gradient(circle at center, ${accentColor}40, transparent 36%), linear-gradient(180deg, #151515 0%, #0f0f0f 22%, #1a050a 60%, #111111 100%)`,
                                  }}
                                />
                                <div
                                  className="absolute inset-x-0 top-0 h-[18%] opacity-25"
                                  style={{
                                    backgroundImage:
                                      "repeating-radial-gradient(circle at 0 0, transparent 0 13px, rgba(255,255,255,0.8) 14px 16px)",
                                    backgroundSize: "48px 48px",
                                  }}
                                />
                                <div
                                  className="absolute inset-x-0 bottom-0 h-[17%] opacity-20"
                                  style={{
                                    backgroundImage:
                                      "repeating-radial-gradient(circle at 0 100%, transparent 0 13px, rgba(255,255,255,0.7) 14px 16px)",
                                    backgroundSize: "48px 48px",
                                  }}
                                />

                                <div className="absolute inset-x-[4%] top-[3%] z-20 leading-none tracking-tight uppercase font-black" style={{ color: accentColor }}>
                                  <div className="text-[72px]">{headline}</div>
                                  <div className="text-[72px] -mt-[10%] opacity-50">{headline}</div>
                                </div>

                                <div className="absolute left-[6%] top-[42%] z-20 font-black leading-none uppercase" style={{ color: accentColor }}>
                                  <div className="text-[52px]">{flyerDate.day}/</div>
                                  <div className="text-[42px] -mt-[10%]">{flyerDate.month}</div>
                                  <div className="text-[22px] mt-[6%]">AS {flyerTime}</div>
                                </div>

                                <div className="absolute inset-x-[12%] top-[15%] bottom-[18%] flex items-end justify-center">
                                  <div className="absolute inset-0 rounded-[28px] blur-2xl opacity-50" style={{ background: `radial-gradient(circle at center, ${accentColor}, transparent 78%)` }} />
                                  {artistPhoto ? (
                                    <img
                                      src={artistPhoto}
                                      alt={artistName}
                                      crossOrigin="anonymous"
                                      className="relative z-10 h-full w-full object-cover rounded-[28px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
                                    />
                                  ) : (
                                    <div className="relative z-10 h-full w-full rounded-[28px] border border-white/10 bg-gradient-to-b from-zinc-700 to-zinc-950 flex items-center justify-center shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
                                      <div className="text-white text-[80px] font-black">
                                        {artistName.charAt(0).toUpperCase()}
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 rounded-[28px] bg-gradient-to-t from-black/55 via-transparent to-transparent z-20" />
                                </div>

                                <div className="absolute right-[8%] bottom-[28%] z-20 max-w-[45%] text-right font-extrabold uppercase leading-none" style={{ color: accentColor }}>
                                  <div className="text-[24px] break-words">{artistName}</div>
                                </div>

                                <div className="absolute inset-x-[12%] bottom-[11%] z-20 px-[4%] py-[2.6%] shadow-[0_18px_35px_rgba(0,0,0,0.35)]" style={{ backgroundColor: accentColor }}>
                                  <div className="text-center text-black font-black uppercase leading-[0.88] text-[48px] break-words">
                                    {venueName}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="relative w-full h-full">
                                <div className="absolute inset-0 bg-[#0a0a0a]" />
                                <div className="absolute inset-0 opacity-40">
                                  {artistPhoto && (
                                    <img
                                      src={artistPhoto}
                                      alt=""
                                      className="w-full h-full object-cover blur-xl scale-110"
                                    />
                                  )}
                                </div>
                                
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 z-10" />

                                <div className="absolute inset-[5%] border border-white/10 z-0" />

                                <div className="absolute inset-x-0 top-[8%] z-20 text-center">
                                  <div className="text-[16px] font-bold tracking-[0.3em] text-white/60 uppercase mb-2">Apresenta</div>
                                  <div className="text-[42px] font-black text-white uppercase leading-none px-4 break-words">
                                    {artistName}
                                  </div>
                                  <div className="h-1 w-12 bg-white/40 mx-auto mt-4" style={{ backgroundColor: accentColor }} />
                                </div>

                                <div className="absolute inset-x-[10%] top-[30%] bottom-[25%] z-20">
                                  {artistPhoto ? (
                                    <img
                                      src={artistPhoto}
                                      alt={artistName}
                                      crossOrigin="anonymous"
                                      className="h-full w-full object-cover border-4 border-white/10 shadow-2xl"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-zinc-800 flex items-center justify-center border-4 border-white/10">
                                      <User className="w-24 h-24 text-white/20" />
                                    </div>
                                  )}
                                </div>

                                <div className="absolute inset-x-0 bottom-[10%] z-30 text-center space-y-2">
                                  <div className="inline-block px-4 py-1 text-[18px] font-black text-black uppercase tracking-tighter" style={{ backgroundColor: accentColor }}>
                                    {headline}
                                  </div>
                                  <div className="text-[32px] font-black text-white uppercase leading-none">
                                    {venueName}
                                  </div>
                                  <div className="text-[18px] font-bold text-white/80 uppercase">
                                    {flyerDate.day} {flyerDate.month} • {flyerTime}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Logo footer fixo para todos */}
                            <div className="absolute inset-x-0 bottom-[2.8%] z-40 text-center">
                              <div className="text-white/95 font-black leading-none text-[32px]">
                                backstage<span className="text-white/80 text-[0.58em] align-[0.18em]">pro</span>
                              </div>
                              <div className="text-white/70 uppercase tracking-[0.22em] text-[8px] mt-1">
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
