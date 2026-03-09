import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useBookingRequests } from "@/hooks/useBookingRequests";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar, MapPin, User, Phone, Clock, Package, Trash2,
  CheckCircle, XCircle, Loader2, Link2, ExternalLink, Copy,
  Check, Instagram, Youtube, Music2, Globe, FileText, Video,
  List, Settings2, Music
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Solicitacoes() {
  const { requests, loading: loadingRequests, updateRequestStatus, deleteRequest } = useBookingRequests();
  const { profile, updateProfile, loading: loadingProfile } = useProfile();

  const [copied, setCopied] = useState(false);
  const [bio, setBio] = useState(profile?.bio || "");
  const [instagramUrl, setInstagramUrl] = useState(profile?.instagram_url || "");
  const [youtubeUrl, setYoutubeUrl] = useState(profile?.youtube_url || "");
  const [tiktokUrl, setTiktokUrl] = useState(profile?.tiktok_url || "");
  const [spotifyUrl, setSpotifyUrl] = useState(profile?.spotify_url || "");
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url || "");
  const [mediaKitUrl, setMediaKitUrl] = useState(profile?.media_kit_url || "");
  const [showVideoUrl, setShowVideoUrl] = useState(profile?.show_video_url || "");
  const [repertoireUrl, setRepertoireUrl] = useState(profile?.repertoire_url || "");

  // Gerar slug automaticamente a partir do nome do artista
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/[^a-z0-9]+/g, "")     // remove caracteres especiais
      .replace(/^-+|-+$/g, "");        // remove hífens extras
  };

  const autoSlug = profile?.artist_name ? generateSlug(profile.artist_name) : profile?.name ? generateSlug(profile.name) : "";
  
  const publishedDomain = "https://backstagepro.online";
  const publicUrl = autoSlug
    ? `${publishedDomain}/artista/${autoSlug}`
    : "";

  const copyPublicLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = async () => {
    // Auto-salvar o slug gerado junto com as configurações
    await updateProfile({
      slug: autoSlug || null,
      bio,
      instagram_url: instagramUrl || null,
      youtube_url: youtubeUrl || null,
      tiktok_url: tiktokUrl || null,
      spotify_url: spotifyUrl || null,
      website_url: websiteUrl || null,
      media_kit_url: mediaKitUrl || null,
      show_video_url: showVideoUrl || null,
      repertoire_url: repertoireUrl || null,
    });
  };

  const statusConfig = {
    pendente: { label: "Pendente", variant: "secondary" as const },
    aprovado: { label: "Aprovado", variant: "default" as const },
    recusado: { label: "Recusado", variant: "destructive" as const },
  };

  if (loadingProfile || loadingRequests) {
    return (
      <Layout title="Agenda Online" subtitle="Configure seu link público e gerencie solicitações de contratação">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Agenda Online" subtitle="Configure seu link público e gerencie solicitações de contratação">
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="config" className="flex-1 gap-2">
            <Settings2 className="w-4 h-4" />
            Configuração do Link
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 gap-2">
            <Calendar className="w-4 h-4" />
            Solicitações
            {requests.filter(r => r.status === "pendente").length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                {requests.filter(r => r.status === "pendente").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ---- ABA: Configuração do Link ---- */}
        <TabsContent value="config" className="space-y-6">
          {/* Seu Link Público */}
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              Seu Link Público
            </h3>
            <div className="space-y-3">
              {autoSlug ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Gerado automaticamente a partir do seu nome artístico.
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
                    <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                    <code className="flex-1 text-xs text-muted-foreground truncate">{publicUrl}</code>
                    <Button size="sm" variant="outline" onClick={copyPublicLink} className="gap-1 shrink-0">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                    <Button size="sm" variant="outline" asChild className="shrink-0">
                      <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Configure seu <strong>nome artístico</strong> nas Configurações de Perfil para gerar automaticamente seu link público.
                </p>
              )}
            </div>
          </Card>

          {/* Descrição do Artista */}
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Descrição do Artista
            </h3>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte sobre você, seu estilo musical, experiência..."
              rows={4}
            />
          </Card>

          {/* Redes Sociais */}
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-4">Redes Sociais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5 mb-1">
                  <Instagram className="w-3.5 h-3.5 text-muted-foreground" />
                  Instagram
                </Label>
                <Input
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/seuartista"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1">
                  <Youtube className="w-3.5 h-3.5 text-muted-foreground" />
                  YouTube
                </Label>
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@seucanal"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1">
                  <Music2 className="w-3.5 h-3.5 text-muted-foreground" />
                  TikTok
                </Label>
                <Input
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="https://tiktok.com/@seuartista"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1">
                  <Music className="w-3.5 h-3.5 text-muted-foreground" />
                  Spotify
                </Label>
                <Input
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/artist/..."
                />
              </div>
              <div className="sm:col-span-1">
                <Label className="flex items-center gap-1.5 mb-1">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  Site Pessoal
                </Label>
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://seusite.com"
                />
              </div>
            </div>
          </Card>

          {/* Material / Portfólio */}
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-4">Material / Portfólio</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Mídia Kit (link)
                </Label>
                <Input
                  value={mediaKitUrl}
                  onChange={(e) => setMediaKitUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1">
                  <Video className="w-3.5 h-3.5 text-muted-foreground" />
                  Vídeo de Show (link)
                </Label>
                <Input
                  value={showVideoUrl}
                  onChange={(e) => setShowVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5 mb-1">
                  <List className="w-3.5 h-3.5 text-muted-foreground" />
                  Repertório (link)
                </Label>
                <Input
                  value={repertoireUrl}
                  onChange={(e) => setRepertoireUrl(e.target.value)}
                  placeholder="https://docs.google.com/..."
                />
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} className="w-full sm:w-auto">
            Salvar Configurações
          </Button>
        </TabsContent>

        {/* ---- ABA: Solicitações ---- */}
        <TabsContent value="requests">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Nenhuma solicitação</h2>
              <p className="text-muted-foreground max-w-md">
                Compartilhe seu link público para começar a receber solicitações de contratação dos seus clientes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const status = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pendente;
                return (
                  <Card key={request.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground">{request.client_name}</h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Recebido em {format(new Date(request.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      {request.status === "pendente" && (
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="default" onClick={() => updateRequestStatus(request.id, "aprovado")} className="gap-1">
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Aprovar</span>
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updateRequestStatus(request.id, "recusado")} className="gap-1">
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Recusar</span>
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Data:</span>
                        <span>{format(new Date(request.event_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                      </div>
                      {request.event_time && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Horário:</span>
                          <span>{request.event_time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Telefone:</span>
                        <a href={`tel:${request.client_phone}`} className="text-primary hover:underline">{request.client_phone}</a>
                      </div>
                      {request.product_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Serviço:</span>
                          <span>{request.product_name}</span>
                        </div>
                      )}
                      {request.event_type && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Tipo:</span>
                          <span>{request.event_type}</span>
                        </div>
                      )}
                      {(request.event_city || request.event_location) && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Local:</span>
                          <span>{[request.event_location, request.event_city].filter(Boolean).join(", ")}</span>
                        </div>
                      )}
                    </div>

                    {request.observations && (
                      <div className="p-3 bg-secondary/50 rounded-lg mb-4">
                        <p className="text-sm font-medium text-foreground mb-1">Observações:</p>
                        <p className="text-sm text-muted-foreground">{request.observations}</p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="gap-1 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                            Remover
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover solicitação?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A solicitação será removida permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteRequest(request.id)}>Remover</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
