import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { ExternalLink, Copy, Check, CalendarDays, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const PUBLIC_DOMAIN = "https://backstagepro.online";
type BookingMethod = "backstage" | "whatsapp";

export function PublicProfileSection() {
  const { profile, updateProfile } = useProfile();
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
  const [bookingMethod, setBookingMethod] = useState<BookingMethod>(
    ((profile as any)?.booking_method as BookingMethod) || "backstage"
  );
  const [bookingWhatsapp, setBookingWhatsapp] = useState<string>(
    (profile as any)?.booking_whatsapp || ""
  );

  const handleSave = async () => {
    await updateProfile({
      bio,
      instagram_url: instagramUrl || null,
      youtube_url: youtubeUrl || null,
      tiktok_url: tiktokUrl || null,
      spotify_url: spotifyUrl || null,
      website_url: websiteUrl || null,
      media_kit_url: mediaKitUrl || null,
      show_video_url: showVideoUrl || null,
      repertoire_url: repertoireUrl || null,
      booking_method: bookingMethod,
      booking_whatsapp: bookingWhatsapp.replace(/\D/g, "") || null,
    } as any);
  };

  const backstageUrl = profile?.slug ? `${PUBLIC_DOMAIN}/artista/${profile.slug}` : null;
  const customDigits = bookingWhatsapp.replace(/\D/g, "");
  const phoneDigits = customDigits || (profile?.phone ? String(profile.phone).replace(/\D/g, "") : "");
  const whatsappUrl = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
        `Olá ${profile?.artist_name || ""}! Vi seu link e quero agendar um show.`
      )}`
    : null;
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
        `Olá ${profile?.artist_name || ""}! Vi seu link e quero agendar um show.`
      )}`
    : null;

  const activeUrl = bookingMethod === "whatsapp" ? whatsappUrl : backstageUrl;

  const copyActive = () => {
    if (!activeUrl) return;
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const choose = async (method: BookingMethod) => {
    setBookingMethod(method);
    await updateProfile({ booking_method: method } as any);
    toast.success(method === "whatsapp" ? "Botão agora abre no WhatsApp" : "Botão agora abre na Agenda Backstage");
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-1">Botão "Agendar Show"</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Escolha para onde o visitante é levado quando clicar no botão "Agendar Show" do seu Link Instagram.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => choose("backstage")}
            disabled={!backstageUrl}
            className={`relative text-left rounded-xl border-2 p-4 transition-all ${
              bookingMethod === "backstage"
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border/60 bg-secondary/20 hover:border-border"
            } ${!backstageUrl ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {bookingMethod === "backstage" && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-md mb-3">
              <CalendarDays className="w-5 h-5" />
            </div>
            <p className="font-semibold text-foreground">Backstage Pro</p>
            <p className="text-xs text-muted-foreground mt-1">Agenda online: contratante escolhe data e produto</p>
          </button>

          <button
            type="button"
            onClick={() => choose("whatsapp")}
            disabled={!whatsappUrl}
            className={`relative text-left rounded-xl border-2 p-4 transition-all ${
              bookingMethod === "whatsapp"
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border/60 bg-secondary/20 hover:border-border"
            } ${!whatsappUrl ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {bookingMethod === "whatsapp" && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-md mb-3">
              <MessageCircle className="w-5 h-5" />
            </div>
            <p className="font-semibold text-foreground">WhatsApp Direto</p>
            <p className="text-xs text-muted-foreground mt-1">
              {whatsappUrl ? "Conversa direta com mensagem pronta" : "Cadastre seu telefone no Perfil"}
            </p>
          </button>
        </div>

        {activeUrl ? (
          <div className="flex items-center gap-2 p-2.5 bg-background rounded-lg border border-border/50">
            <code className="flex-1 text-xs sm:text-sm truncate">{activeUrl}</code>
            <Button size="sm" variant="outline" onClick={copyActive} className="h-8 px-2.5">
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button size="sm" variant="outline" asChild className="h-8 w-8 p-0">
              <a href={activeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            {bookingMethod === "whatsapp"
              ? "Cadastre seu telefone no Perfil para ativar este link."
              : "Configure seu nome artístico no Perfil para gerar o link."}
          </p>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Perfil Público</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Descrição / Bio</Label>
            <Textarea
              className="mt-1"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Shows para bares, eventos, casamentos e festas..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Apresente seu trabalho aos contratantes
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Redes Sociais</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Instagram</Label>
            <Input
              className="mt-1"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/seu_perfil"
            />
          </div>

          <div>
            <Label>YouTube</Label>
            <Input
              className="mt-1"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/@seu_canal"
            />
          </div>

          <div>
            <Label>TikTok</Label>
            <Input
              className="mt-1"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              placeholder="https://tiktok.com/@seu_perfil"
            />
          </div>

          <div>
            <Label>Spotify</Label>
            <Input
              className="mt-1"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/artist/..."
            />
          </div>

          <div>
            <Label>Website</Label>
            <Input
              className="mt-1"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://seu-site.com"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Material / Portfólio</h3>
        
        <div className="space-y-4">
          <div>
            <Label>Link do Mídia Kit</Label>
            <Input
              className="mt-1"
              value={mediaKitUrl}
              onChange={(e) => setMediaKitUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              PDF ou link para download do seu press kit
            </p>
          </div>

          <div>
            <Label>Vídeo do Show</Label>
            <Input
              className="mt-1"
              value={showVideoUrl}
              onChange={(e) => setShowVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Link do YouTube ou Vimeo com seu show
            </p>
          </div>

          <div>
            <Label>Repertório</Label>
            <Input
              className="mt-1"
              value={repertoireUrl}
              onChange={(e) => setRepertoireUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Link para documento ou página com seu repertório
            </p>
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} className="w-full">
        Salvar Configurações
      </Button>
    </div>
  );
}
