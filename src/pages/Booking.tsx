import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  MapPin, Music, Loader2, CheckCircle, CalendarDays, User, Phone, Send, Instagram, Youtube, Music2, Globe, ExternalLink, FileText, Video, List, Sparkles, Gift, Tag, ArrowLeft, ArrowRight, Clock, ShoppingCart,
  Mic, MicVocal, Guitar, Piano, Drum, Headphones, Radio, Volume2, Disc3, ListMusic, AudioLines, Waves,
  PartyPopper, GlassWater, Star, Heart, Zap, Award, Crown, Camera, Users, UserPlus, Briefcase, Church, Building2, Tent, TreePine, Utensils, Package,
  type LucideIcon,
} from "lucide-react";
import { format, isBefore, startOfDay, addMonths } from "date-fns";

const ICON_MAP: Record<string, LucideIcon> = {
  music: Music, mic: Mic, "mic-vocal": MicVocal, guitar: Guitar, piano: Piano, drum: Drum,
  headphones: Headphones, radio: Radio, "volume-2": Volume2, "disc-3": Disc3, "list-music": ListMusic,
  "audio-lines": AudioLines, waves: Waves, "party-popper": PartyPopper, "glass-water": GlassWater,
  sparkles: Sparkles, star: Star, heart: Heart, zap: Zap, award: Award, crown: Crown,
  camera: Camera, video: Video, users: Users, "user-plus": UserPlus, briefcase: Briefcase,
  church: Church, "building-2": Building2, tent: Tent, "tree-pine": TreePine, utensils: Utensils, package: Package,
};

function getServiceIcon(iconName: string | null): LucideIcon {
  if (!iconName) return Music;
  return ICON_MAP[iconName] || Music;
}
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ArtistProfile {
  user_id: string;
  artist_name: string | null;
  avatar_url: string | null;
  base_city: string | null;
  music_style: string | null;
  project_type: string | null;
  bio: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  spotify_url: string | null;
  website_url: string | null;
  media_kit_url: string | null;
  show_video_url: string | null;
  repertoire_url: string | null;
}

interface PerformanceType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  icon: string | null;
}

type BookingStep = "products" | "calendar" | "form";

export default function Booking() {
  const { slug } = useParams<{ slug: string }>();
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [products, setProducts] = useState<PerformanceType[]>([]);
  const [confirmedDates, setConfirmedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Wizard step
  const [step, setStep] = useState<BookingStep>("products");
  const [selectedProduct, setSelectedProduct] = useState<PerformanceType | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventCity, setEventCity] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [observations, setObservations] = useState("");

  useEffect(() => {
    if (!slug) return;
    loadArtistData();
  }, [slug]);

  const loadArtistData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("artist_public_profiles")
        .select(
          "user_id, artist_name, avatar_url, base_city, music_style, project_type, bio, instagram_url, youtube_url, tiktok_url, spotify_url, website_url, media_kit_url, show_video_url, repertoire_url"
        )
        .eq("slug", slug)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        setNotFound(true);
        return;
      }

      setArtist(profileData);

      const [productsRes, showsRes] = await Promise.all([
        supabase.rpc("get_artist_products", { artist_user_id: profileData.user_id }),
        supabase.rpc("get_artist_occupied_dates", { artist_user_id: profileData.user_id }),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (showsRes.data) setConfirmedDates(showsRes.data.map((s: { show_date: string }) => s.show_date));
    } catch (error) {
      console.error("Error loading artist data:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmedDateSet = useMemo(() => new Set(confirmedDates), [confirmedDates]);

  const today = startOfDay(new Date());
  const maxDate = addMonths(today, 3);

  const handleMultipleDatesSelect = (dates: Date[] | undefined) => {
    if (!dates) {
      setSelectedDates([]);
      return;
    }
    const validDates = dates.filter(d => !confirmedDateSet.has(format(d, "yyyy-MM-dd")));
    setSelectedDates(validDates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist || selectedDates.length === 0) return;
    if (!clientName.trim() || !clientPhone.trim()) {
      toast.error("Preencha nome e telefone.");
      return;
    }

    setSubmitting(true);
    try {
      const requests = selectedDates.map(date => ({
        artist_id: artist.user_id,
        event_date: format(date, "yyyy-MM-dd"),
        product_id: selectedProduct?.id || null,
        product_name: selectedProduct?.name || null,
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        event_type: eventType.trim() || null,
        event_city: eventCity.trim() || null,
        event_location: eventLocation.trim() || null,
        event_time: eventTime.trim() || null,
        observations: observations.trim() || null,
      }));

      const { error } = await supabase.from("booking_requests").insert(requests);

      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting booking request:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectProduct = (product: PerformanceType) => {
    setSelectedProduct(product);
    setStep("calendar");
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setSelectedDates([]);
    setStep("products");
  };

  const handleContinueToForm = () => {
    if (selectedDates.length === 0) {
      toast.error("Selecione pelo menos uma data.");
      return;
    }
    setStep("form");
  };

  const handleBackToCalendar = () => {
    setStep("calendar");
  };

  const resetBooking = () => {
    setSubmitted(false);
    setStep("products");
    setSelectedProduct(null);
    setSelectedDates([]);
    setClientName("");
    setClientPhone("");
    setEventType("");
    setEventCity("");
    setEventLocation("");
    setEventTime("");
    setObservations("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <Music className="w-16 h-16 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Artista não encontrado</h1>
          <p className="text-muted-foreground">O link que você acessou não corresponde a nenhum artista cadastrado.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Solicitação Enviada!</h1>
          <p className="text-muted-foreground">
            {selectedDates.length > 1 
              ? `Suas ${selectedDates.length} solicitações foram enviadas para `
              : "Sua solicitação foi enviada para "}
            <strong>{artist?.artist_name}</strong>. Você receberá um retorno em breve.
          </p>
          <Button variant="outline" onClick={resetBooking}>
            Fazer nova solicitação
          </Button>
        </div>
      </div>
    );
  }

  const projectTypeLabels: Record<string, string> = {
    solo: "Artista Solo",
    dupla: "Dupla",
    trio: "Trio",
    banda: "Banda",
    orquestra: "Orquestra/Grupo",
  };

  const socialLinks = [
    { icon: Instagram, url: artist?.instagram_url, label: "Instagram" },
    { icon: Youtube, url: artist?.youtube_url, label: "YouTube" },
    { icon: Music2, url: artist?.tiktok_url, label: "TikTok" },
    { icon: Music2, url: artist?.spotify_url, label: "Spotify" },
    { icon: Globe, url: artist?.website_url, label: "Website" },
  ].filter(link => link.url);

  const portfolioLinks = [
    { icon: FileText, url: artist?.media_kit_url, label: "Mídia Kit" },
    { icon: Video, url: artist?.show_video_url, label: "Vídeo" },
    { icon: List, url: artist?.repertoire_url, label: "Repertório" },
  ].filter(link => link.url);

  const hasDiscount = selectedDates.length >= 3;
  const discountPercentage = 10;

  // Step indicator
  const steps = [
    { key: "products", label: "Serviço", icon: Tag },
    { key: "calendar", label: "Data", icon: CalendarDays },
    { key: "form", label: "Dados", icon: User },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header do Artista - Compacto */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {artist?.avatar_url ? (
              <img
                src={artist.avatar_url}
                alt={artist.artist_name || "Artista"}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/30 shadow-md shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shadow-md shrink-0">
                <Music className="w-7 h-7 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-foreground truncate">{artist?.artist_name || "Artista"}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm flex-wrap">
                {artist?.music_style && <Badge variant="outline" className="text-xs">{artist.music_style}</Badge>}
                {artist?.base_city && (
                  <span className="flex items-center gap-1 text-muted-foreground text-xs">
                    <MapPin className="w-3 h-3" />
                    {artist.base_city}
                  </span>
                )}
              </div>
            </div>
            {/* Redes sociais compactas */}
            {socialLinks.length > 0 && (
              <div className="hidden sm:flex gap-1">
                {socialLinks.slice(0, 3).map((link, idx) => (
                  <Button key={idx} variant="ghost" size="icon" asChild className="h-8 w-8">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <link.icon className="w-4 h-4" />
                    </a>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          {steps.map((s, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-primary/20 text-primary",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-1",
                    idx < currentStepIndex ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-3xl mx-auto px-4 pb-8 space-y-6">
        
        {/* STEP 1: Produtos */}
        {step === "products" && (
          <>
            {/* Banner de desconto */}
            <Card className="p-4 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Condição especial!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Contrate 3 ou mais datas e ganhe <strong className="text-primary">{discountPercentage}% de desconto</strong>.
                  </p>
                </div>
              </div>
            </Card>

            {/* Portfolio Links */}
            {portfolioLinks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {portfolioLinks.map((link, idx) => (
                  <Button key={idx} variant="outline" size="sm" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                      <link.icon className="w-4 h-4" />
                      {link.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                ))}
              </div>
            )}

            {/* Serviços/Produtos */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                Escolha um Serviço
              </h2>
              
             {products.length > 0 ? (
                <div className="grid gap-3">
                  {products.map((p) => {
                    const ServiceIcon = getServiceIcon(p.icon);
                    return (
                      <div 
                        key={p.id} 
                        className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-card transition-all cursor-pointer group"
                        onClick={() => handleSelectProduct(p)}
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                          <ServiceIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{p.name}</p>
                          {p.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-foreground text-base whitespace-nowrap">
                            {p.price > 0 ? `R$ ${p.price.toLocaleString("pt-BR")}` : "Consultar"}
                          </span>
                          <Button size="sm" className="shrink-0 gap-1.5">
                            Contratar
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum serviço cadastrado ainda.</p>
                  <p className="text-sm mt-1">Entre em contato diretamente com o artista.</p>
                </div>
              )}
            </Card>
          </>
        )}

        {/* STEP 2: Calendário */}
        {step === "calendar" && selectedProduct && (
          <Card className="p-6">
            {/* Produto selecionado */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {(() => { const Icon = getServiceIcon(selectedProduct.icon); return <Icon className="w-5 h-5 text-primary" />; })()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedProduct.name}</p>
                  <p className="text-sm text-primary font-medium">
                    {selectedProduct.price > 0 ? `R$ ${selectedProduct.price.toLocaleString("pt-BR")}` : "Valor sob consulta"}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleBackToProducts}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Trocar
              </Button>
            </div>

            <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Selecione a(s) Data(s)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Escolha 1 ou mais datas disponíveis. Datas em vermelho estão ocupadas.
            </p>

            {/* Indicador de datas selecionadas */}
            {selectedDates.length > 0 && (
              <div className={cn(
                "mb-4 p-3 rounded-lg border flex items-center justify-between gap-2 flex-wrap",
                hasDiscount ? "bg-green-500/10 border-green-500/30" : "bg-primary/10 border-primary/30"
              )}>
                <div className="flex items-center gap-2 flex-wrap">
                  {hasDiscount && <Gift className="w-4 h-4 text-green-600" />}
                  <span className="text-sm font-medium">
                    {selectedDates.length} {selectedDates.length === 1 ? "data" : "datas"}
                  </span>
                  {hasDiscount && (
                    <Badge variant="default" className="bg-green-600 text-white">
                      -{discountPercentage}% OFF
                    </Badge>
                  )}
                </div>
                <Button size="sm" onClick={handleContinueToForm}>
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Grid de 3 calendários */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((monthOffset) => {
                const monthDate = addMonths(today, monthOffset);
                return (
                  <div key={monthOffset} className="bg-white dark:bg-card rounded-xl shadow-sm border border-border/50 overflow-hidden">
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={handleMultipleDatesSelect}
                      month={monthDate}
                      onMonthChange={() => {}}
                      locale={ptBR}
                      disabled={(date) => 
                        isBefore(date, today) || 
                        isBefore(maxDate, date) || 
                        confirmedDateSet.has(format(date, "yyyy-MM-dd"))
                      }
                      modifiers={{
                        booked: (date) => confirmedDateSet.has(format(date, "yyyy-MM-dd")),
                      }}
                      modifiersClassNames={{
                        booked: "booking-occupied",
                      }}
                      className="w-full pointer-events-auto p-3"
                      classNames={{
                        months: "flex flex-col",
                        month: "space-y-2",
                        caption: "flex justify-center relative items-center pb-2",
                        caption_label: "text-sm font-bold text-foreground",
                        nav: "hidden",
                        nav_button: "hidden",
                        table: "w-full border-collapse",
                        head_row: "flex w-full",
                        head_cell: "text-muted-foreground/60 font-semibold text-[0.65rem] uppercase flex-1 text-center",
                        row: "flex w-full mt-0.5",
                        cell: "flex-1 text-center text-sm p-0 relative aspect-square flex items-center justify-center",
                        day: cn(
                          "h-7 w-7 mx-auto p-0 font-normal rounded-full text-xs transition-all inline-flex items-center justify-center",
                          "hover:bg-primary/10 hover:text-primary"
                        ),
                        day_selected: "!bg-primary !text-primary-foreground hover:!bg-primary/90 font-semibold shadow-sm",
                        day_today: "bg-primary/15 text-primary font-bold ring-2 ring-primary/30",
                        day_outside: "text-muted-foreground/25",
                        day_disabled: "text-muted-foreground/20 cursor-not-allowed hover:!bg-transparent",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary shadow-sm"></div>
                <span className="text-sm text-muted-foreground">Selecionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-rose-400/80"></div>
                <span className="text-sm text-muted-foreground">Ocupado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-primary/40"></div>
                <span className="text-sm text-muted-foreground">Hoje</span>
              </div>
            </div>

            {/* Botão de continuar (mobile) */}
            {selectedDates.length > 0 && (
              <div className="mt-6 md:hidden">
                <Button className="w-full" onClick={handleContinueToForm}>
                  Continuar para dados
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* STEP 3: Formulário */}
        {step === "form" && selectedProduct && selectedDates.length > 0 && (
          <Card className="p-6">
            {/* Resumo */}
            <div className="mb-6 pb-4 border-b border-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {(() => { const Icon = getServiceIcon(selectedProduct.icon); return <Icon className="w-5 h-5 text-primary" />; })()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedProduct.name}</p>
                    <p className="text-sm text-primary font-medium">
                      {selectedProduct.price > 0 ? `R$ ${selectedProduct.price.toLocaleString("pt-BR")}` : "Valor sob consulta"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleBackToCalendar}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((date, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm">
                    <CalendarDays className="w-3 h-3 mr-1" />
                    {format(date, "dd/MM/yyyy", { locale: ptBR })}
                  </Badge>
                ))}
              </div>

              {hasDiscount && (
                <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
                  <Gift className="w-4 h-4" />
                  Você ganhou {discountPercentage}% de desconto por contratar {selectedDates.length} datas!
                </div>
              )}
            </div>

            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Seus Dados
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nome completo *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Seu nome"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>WhatsApp *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Evento</Label>
                  <Input
                    className="mt-1"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    placeholder="Ex: Casamento, Festa, Bar"
                  />
                </div>
                <div>
                  <Label>Horário</Label>
                  <div className="relative mt-1">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Cidade</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={eventCity}
                      onChange={(e) => setEventCity(e.target.value)}
                      placeholder="Cidade do evento"
                    />
                  </div>
                </div>
                <div>
                  <Label>Local</Label>
                  <Input
                    className="mt-1"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Nome do espaço"
                  />
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  className="mt-1"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Detalhes sobre o evento, estrutura necessária, etc."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Enviar Solicitação
              </Button>
            </form>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 pb-4">
          <p>Powered by <span className="font-semibold text-primary">Backstage Pro</span></p>
        </div>
      </div>
    </div>
  );
}
