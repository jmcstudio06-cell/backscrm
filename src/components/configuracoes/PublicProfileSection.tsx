import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { ExternalLink, Copy, Check } from "lucide-react";
import { toast } from "sonner";

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
    });
  };

  const publicUrl = profile?.slug 
    ? `${window.location.origin}/artista/${profile.slug}`
    : "Configure seu slug primeiro";

  const copyPublicLink = () => {
    if (profile?.slug) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Link Público de Contratação</h3>
        
        {profile?.slug ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
              <code className="flex-1 text-sm">{publicUrl}</code>
              <Button size="sm" variant="outline" onClick={copyPublicLink}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Compartilhe este link com contratantes para receber solicitações de show.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Configure seu slug nas configurações de perfil para ativar o link público.
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
