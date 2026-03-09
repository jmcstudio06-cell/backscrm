import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Music, Loader2, CheckCircle, CalendarDays, User, Phone, Send, Instagram, Youtube, Music2, Globe, ExternalLink, FileText, Video, List, Sparkles, Gift, Tag } from "lucide-react";
import { format, isBefore, startOfDay, addMonths } from "date-fns";
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

export default function Booking() {
  const { slug } = useParams<{ slug: string }>();
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [products, setProducts] = useState<PerformanceType[]>([]);
  const [confirmedDates, setConfirmedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Form fields
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventCity, setEventCity] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
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
        supabase
          .from("performance_types")
          .select("id, name, description, price, icon")
          .eq("user_id", profileData.user_id)
          .order("name"),
        supabase
          .from("shows")
          .select("date")
          .eq("user_id", profileData.user_id)
          .in("status", ["confirmed", "scheduled"]),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (showsRes.data) setConfirmedDates(showsRes.data.map((s) => s.date));
    } catch (error) {
      console.error("Error loading artist data:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const confirmedDateSet = useMemo(() => new Set(confirmedDates), [confirmedDates]);

  // Limites do calendário: hoje até 3 meses à frente
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
      const productObj = products.find((p) => p.id === selectedProduct);
      
      const requests = selectedDates.map(date => ({
        artist_id: artist.user_id,
        event_date: format(date, "yyyy-MM-dd"),
        product_id: selectedProduct || null,
        product_name: productObj?.name || null,
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
          <Button variant="outline" onClick={() => { setSubmitted(false); setShowForm(false); setSelectedDates([]); }}>
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
    { icon: FileText, url: artist?.media_kit_url, label: "Baixar Mídia Kit" },
    { icon: Video, url: artist?.show_video_url, label: "Assistir Vídeo do Show" },
    { icon: List, url: artist?.repertoire_url, label: "Ver Repertório" },
  ].filter(link => link.url);

  // Calcular desconto para 3+ datas (10% off)
  const hasDiscount = selectedDates.length >= 3;
  const discountPercentage = 10;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header do Artista */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          {artist?.avatar_url ? (
            <img
              src={artist.avatar_url}
              alt={artist.artist_name || "Artista"}
              className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-primary/30 shadow-lg"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Music className="w-12 h-12 text-primary" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-foreground">{artist?.artist_name || "Artista"}</h1>
          <div className="flex items-center justify-center gap-3 mt-3 text-sm flex-wrap">
            {artist?.project_type && (
              <Badge variant="secondary" className="text-sm">{projectTypeLabels[artist.project_type] || artist.project_type}</Badge>
            )}
            {artist?.music_style && <Badge variant="outline" className="text-sm">{artist.music_style}</Badge>}
            {artist?.base_city && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {artist.base_city}
              </span>
            )}
          </div>
          {artist?.bio && (
            <p className="mt-5 text-muted-foreground max-w-xl mx-auto leading-relaxed">{artist.bio}</p>
          )}

          {/* Redes Sociais inline */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center gap-2 mt-5 flex-wrap">
              {socialLinks.map((link, idx) => (
                <Button key={idx} variant="ghost" size="sm" asChild className="h-9 px-3">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                    <link.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{link.label}</span>
                  </a>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Banner de Condição Especial */}
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
                Selecione 3 ou mais datas e ganhe <strong className="text-primary">{discountPercentage}% de desconto</strong> no valor total.
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
        {products.length > 0 && !showForm && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-primary" />
              Serviços Disponíveis
            </h2>
            <div className="grid gap-3">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                      {p.icon || "🎵"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{p.name}</p>
                      {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-semibold shrink-0">
                    {p.price > 0 ? `R$ ${p.price.toLocaleString("pt-BR")}` : "Sob consulta"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Calendário - 3 meses */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Agenda - Próximos 3 meses
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Selecione 1 ou mais datas disponíveis. Datas em vermelho já estão ocupadas.
          </p>

          {/* Indicador de datas selecionadas */}
          {selectedDates.length > 0 && (
            <div className={cn(
              "mb-4 p-3 rounded-lg border flex items-center justify-between gap-2",
              hasDiscount ? "bg-green-500/10 border-green-500/30" : "bg-primary/10 border-primary/30"
            )}>
              <div className="flex items-center gap-2">
                {hasDiscount && <Gift className="w-4 h-4 text-green-600" />}
                <span className="text-sm font-medium">
                  {selectedDates.length} {selectedDates.length === 1 ? "data selecionada" : "datas selecionadas"}
                </span>
                {hasDiscount && (
                  <Badge variant="default" className="bg-green-600 text-white">
                    -{discountPercentage}% de desconto
                  </Badge>
                )}
              </div>
              <Button size="sm" onClick={() => setShowForm(true)}>
                Continuar
              </Button>
            </div>
          )}

          {/* Grid de 3 calendários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            {[0, 1, 2].map((monthOffset) => {
              const monthDate = addMonths(today, monthOffset);
              return (
                <div key={monthOffset} className="border border-border rounded-xl bg-card p-3">
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
                      booked: "!bg-red-100 dark:!bg-red-900/30 !text-red-500 dark:!text-red-400 line-through cursor-not-allowed opacity-80",
                    }}
                    className="w-full pointer-events-auto"
                    classNames={{
                      months: "flex flex-col",
                      month: "space-y-2",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-semibold capitalize text-foreground",
                      nav: "hidden",
                      nav_button: "hidden",
                      table: "w-full border-collapse",
                      head_row: "flex",
                      head_cell: "text-muted-foreground rounded-md w-8 font-medium text-[0.65rem] uppercase flex-1 text-center",
                      row: "flex w-full mt-1",
                      cell: "text-center text-sm p-0 relative flex-1 focus-within:relative focus-within:z-20",
                      day: cn(
                        "h-8 w-full p-0 font-normal rounded-lg text-xs transition-colors",
                        "hover:bg-primary/10 hover:text-primary",
                        "aria-selected:opacity-100"
                      ),
                      day_selected: "!bg-primary !text-primary-foreground hover:!bg-primary hover:!text-primary-foreground font-medium",
                      day_today: "bg-accent text-accent-foreground font-semibold ring-1 ring-primary/30",
                      day_outside: "text-muted-foreground/40 opacity-50",
                      day_disabled: "text-muted-foreground/30 opacity-40 cursor-not-allowed",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Legenda melhorada */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-5 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-primary shadow-sm"></div>
              <span className="text-sm text-muted-foreground">Selecionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800"></div>
              <span className="text-sm text-muted-foreground">Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-md bg-accent ring-1 ring-primary/30"></div>
              <span className="text-sm text-muted-foreground">Hoje</span>
            </div>
          </div>
        </Card>

        {/* Formulário de Contratação */}
        {showForm && selectedDates.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Solicitar Contratação</h2>
            <div className="text-sm text-muted-foreground mb-6 space-y-2">
              <div className="flex flex-wrap gap-2">
                {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((date, idx) => (
                  <Badge key={idx} variant="secondary">
                    {format(date, "dd/MM/yyyy")}
                  </Badge>
                ))}
              </div>
              {hasDiscount && (
                <p className="text-green-600 font-medium flex items-center gap-1">
                  <Gift className="w-4 h-4" />
                  Você ganhou {discountPercentage}% de desconto por contratar {selectedDates.length} datas!
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Contratante *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Telefone / WhatsApp *</Label>
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
                    placeholder="Ex: Casamento, Bar, Festa"
                  />
                </div>
                <div>
                  <Label>Horário do Evento</Label>
                  <Input
                    className="mt-1"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Cidade do Evento</Label>
                  <Input
                    className="mt-1"
                    value={eventCity}
                    onChange={(e) => setEventCity(e.target.value)}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <Label>Local do Evento</Label>
                  <Input
                    className="mt-1"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Nome do espaço"
                  />
                </div>
              </div>

              {products.length > 0 && (
                <div>
                  <Label>Tipo de Show</Label>
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione um tipo de show" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.icon && <span className="mr-2">{p.icon}</span>}
                          {p.name} {p.price > 0 ? `— R$ ${p.price.toLocaleString("pt-BR")}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

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

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); }}>
                  Voltar
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Enviar {selectedDates.length === 1 ? "Solicitação" : `${selectedDates.length} Solicitações`}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-8 pb-4">
          <p>Powered by <span className="font-semibold text-primary">Backstage Pro</span></p>
        </div>
      </div>
    </div>
  );
}
