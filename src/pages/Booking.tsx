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
import { Switch } from "@/components/ui/switch";
import { MapPin, Music, Loader2, CheckCircle, CalendarDays, User, Phone, Send, Instagram, Youtube, Music2, Globe, ExternalLink, FileText, Video, List } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
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
}

export default function Booking() {
  const { slug } = useParams<{ slug: string }>();
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [products, setProducts] = useState<PerformanceType[]>([]);
  const [confirmedDates, setConfirmedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [multipleMode, setMultipleMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        .from("profiles")
        .select("user_id, artist_name, avatar_url, base_city, music_style, project_type, bio, instagram_url, youtube_url, tiktok_url, spotify_url, website_url, media_kit_url, show_video_url, repertoire_url")
        .eq("slug", slug)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setArtist(profileData);

      const [productsRes, showsRes] = await Promise.all([
        supabase
          .from("performance_types")
          .select("id, name, description, price")
          .eq("user_id", profileData.user_id)
          .order("name"),
        supabase
          .from("shows")
          .select("date")
          .eq("user_id", profileData.user_id)
          .in("status", ["confirmed", "scheduled"])
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

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const dateStr = format(date, "yyyy-MM-dd");
    if (confirmedDateSet.has(dateStr)) return;
    setSelectedDates([date]);
    setShowForm(true);
  };

  const handleMultipleDatesSelect = (dates: Date[] | undefined) => {
    if (!dates) return;
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
            Sua solicitação de contratação foi enviada para <strong>{artist?.artist_name}</strong>.
            Você receberá um retorno em breve no telefone fornecido.
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 via-background to-accent/10 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          {artist?.avatar_url ? (
            <img
              src={artist.avatar_url}
              alt={artist.artist_name || "Artista"}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-primary/30"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Music className="w-10 h-10 text-primary" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground">{artist?.artist_name || "Artista"}</h1>
          <div className="flex items-center justify-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
            {artist?.project_type && (
              <Badge variant="secondary">{projectTypeLabels[artist.project_type] || artist.project_type}</Badge>
            )}
            {artist?.music_style && <Badge variant="outline">{artist.music_style}</Badge>}
            {artist?.base_city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {artist.base_city}
              </span>
            )}
          </div>
          {artist?.bio && (
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">{artist.bio}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Social Links */}
        {socialLinks.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Redes Sociais</h2>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link, idx) => (
                <Button key={idx} variant="outline" size="sm" asChild>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Portfolio */}
        {portfolioLinks.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Material do Artista</h2>
            <div className="grid gap-3">
              {portfolioLinks.map((link, idx) => (
                <Button key={idx} variant="secondary" asChild className="justify-start">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <link.icon className="w-4 h-4" />
                    {link.label}
                    <ExternalLink className="w-3 h-3 ml-auto" />
                  </a>
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Products */}
        {products.length > 0 && !showForm && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tipos de Show Disponíveis</h2>
            <div className="grid gap-3">
              {products.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                  <div>
                    <p className="font-medium text-foreground">{p.name}</p>
                    {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                  </div>
                  <Badge variant="secondary" className="font-semibold">
                    {p.price > 0 ? `R$ ${p.price.toLocaleString("pt-BR")}` : "Sob consulta"}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Calendar */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Escolha {multipleMode ? "as datas" : "uma data"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Datas em vermelho já estão ocupadas.</p>

          <div className="flex items-center gap-2 mb-4 p-3 bg-secondary/30 rounded-lg">
            <Switch checked={multipleMode} onCheckedChange={setMultipleMode} />
            <Label className="cursor-pointer">Contratar múltiplas datas</Label>
          </div>

          <div className="flex justify-center">
            {multipleMode ? (
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={handleMultipleDatesSelect}
                locale={ptBR}
                disabled={(date) => isBefore(date, startOfDay(new Date())) || confirmedDateSet.has(format(date, "yyyy-MM-dd"))}
                modifiers={{
                  booked: (date) => confirmedDateSet.has(format(date, "yyyy-MM-dd")),
                }}
                modifiersClassNames={{
                  booked: "!bg-destructive/20 !text-destructive line-through cursor-not-allowed",
                }}
                className={cn("p-3 pointer-events-auto")}
              />
            ) : (
              <Calendar
                mode="single"
                selected={selectedDates[0]}
                onSelect={handleDateSelect}
                locale={ptBR}
                disabled={(date) => isBefore(date, startOfDay(new Date())) || confirmedDateSet.has(format(date, "yyyy-MM-dd"))}
                modifiers={{
                  booked: (date) => confirmedDateSet.has(format(date, "yyyy-MM-dd")),
                }}
                modifiersClassNames={{
                  booked: "!bg-destructive/20 !text-destructive line-through cursor-not-allowed",
                }}
                className={cn("p-3 pointer-events-auto")}
              />
            )}
          </div>

          {multipleMode && selectedDates.length > 0 && (
            <div className="mt-4">
              <Button onClick={() => setShowForm(true)} className="w-full">
                Continuar com {selectedDates.length} {selectedDates.length === 1 ? "data" : "datas"}
              </Button>
            </div>
          )}
        </Card>

        {/* Booking Form */}
        {showForm && selectedDates.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Solicitar Contratação</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {selectedDates.length === 1 ? (
                <>Data selecionada: <strong>{format(selectedDates[0], "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</strong></>
              ) : (
                <>{selectedDates.length} datas selecionadas</>
              )}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Contratante *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      className="pl-9 bg-secondary"
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
                      className="pl-9 bg-secondary"
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
                    className="mt-1 bg-secondary"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    placeholder="Ex: Casamento, Bar, Festa"
                  />
                </div>
                <div>
                  <Label>Horário do Evento</Label>
                  <Input
                    className="mt-1 bg-secondary"
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
                    className="mt-1 bg-secondary"
                    value={eventCity}
                    onChange={(e) => setEventCity(e.target.value)}
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <Label>Local do Evento</Label>
                  <Input
                    className="mt-1 bg-secondary"
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
                    <SelectTrigger className="mt-1 bg-secondary">
                      <SelectValue placeholder="Selecione um tipo de show" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
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
                  className="mt-1 bg-secondary"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Detalhes sobre o evento, estrutura necessária, etc."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setSelectedDates([]); }}>
                  Voltar
                </Button>
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Enviar Solicitação
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
