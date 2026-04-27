import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLogo } from "@/components/layout/AppLogo";
import {
  Instagram,
  Youtube,
  Music2,
  Globe,
  ExternalLink,
  FileText,
  ListMusic,
  CalendarDays,
  Loader2,
  MapPin,
  Music,
  User as UserIcon,
} from "lucide-react";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

interface PublicProfile {
  user_id: string;
  slug: string;
  artist_name: string | null;
  avatar_url: string | null;
  base_city: string | null;
  music_style: string | null;
  bio: string | null;
  phone?: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  spotify_url: string | null;
  website_url: string | null;
  media_kit_url: string | null;
  show_video_url: string | null;
  repertoire_url: string | null;
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.94a8.16 8.16 0 0 0 4.77 1.52V7.05a4.85 4.85 0 0 1-1.84-.36z" />
  </svg>
);

export default function LinkInstagram() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);

      // Try public table first, then fallback to profiles
      const { data: pub } = await supabase
        .from("artist_public_profiles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (pub) {
        setProfile(pub as PublicProfile);
        setLoading(false);
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select(
          "user_id, slug, artist_name, avatar_url, base_city, music_style, bio, phone, instagram_url, youtube_url, tiktok_url, spotify_url, website_url, media_kit_url, show_video_url, repertoire_url"
        )
        .eq("slug", slug)
        .maybeSingle();

      if (prof) {
        setProfile(prof as PublicProfile);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  const embedUrl = useMemo(
    () => getYouTubeEmbedUrl(profile?.show_video_url),
    [profile?.show_video_url]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Link não encontrado</h1>
        <p className="text-muted-foreground mb-6">Este link de artista não existe ou foi removido.</p>
        <Link to="/" className="text-primary underline">Voltar</Link>
      </div>
    );
  }

  const socials: { icon: React.ElementType; label: string; url: string | null; color: string }[] = [
    { icon: Instagram, label: "Instagram", url: profile.instagram_url, color: "from-pink-500 via-rose-500 to-orange-400" },
    { icon: Youtube, label: "YouTube", url: profile.youtube_url, color: "from-red-600 to-red-400" },
    { icon: TikTokIcon, label: "TikTok", url: profile.tiktok_url, color: "from-foreground to-foreground/70" },
    { icon: Music2, label: "Spotify", url: profile.spotify_url, color: "from-green-600 to-green-400" },
    { icon: Globe, label: "Website", url: profile.website_url, color: "from-sky-600 to-cyan-400" },
  ];
  const visibleSocials = socials.filter((s) => s.url && s.url.trim().length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30">
      {/* Background blur orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent blur-xl opacity-60" />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-accent p-1 shadow-2xl">
              <div className="w-full h-full rounded-full bg-background overflow-hidden flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.artist_name || "Artista"} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-14 h-14 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          <h1 className="mt-5 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {profile.artist_name || "Artista"}
          </h1>

          {(profile.music_style || profile.base_city) && (
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {profile.music_style && (
                <span className="inline-flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5" />
                  {profile.music_style}
                </span>
              )}
              {profile.base_city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.base_city}
                </span>
              )}
            </div>
          )}

          {profile.bio && (
            <p className="mt-4 max-w-md text-sm sm:text-base text-foreground/80 leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Vídeo destaque */}
        {embedUrl && (
          <div className="mb-6 rounded-3xl overflow-hidden border border-border/50 shadow-2xl bg-card">
            <div className="aspect-video">
              <iframe
                src={embedUrl.replace("autoplay=1", "autoplay=0")}
                title="Vídeo do show"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* CTA Agendar Show */}
        {profile.slug && (
          <Link
            to={`/artista/${profile.slug}`}
            className="group relative block mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] hover:bg-right transition-all duration-500 shadow-xl hover:shadow-2xl hover:scale-[1.02]"
          >
            <div className="relative px-6 py-5 flex items-center justify-between text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg leading-tight">Agendar Show</p>
                  <p className="text-xs opacity-90">Veja datas disponíveis</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 opacity-80 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        )}

        {/* Material / Portfólio cards */}
        {(profile.media_kit_url || profile.repertoire_url) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {profile.media_kit_url && (
              <a
                href={profile.media_kit_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl bg-card border border-border/50 p-5 hover:border-primary/40 hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">Mídia Kit</p>
                    <p className="text-xs text-muted-foreground">Press kit profissional</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </a>
            )}
            {profile.repertoire_url && (
              <a
                href={profile.repertoire_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl bg-card border border-border/50 p-5 hover:border-primary/40 hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                    <ListMusic className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">Repertório</p>
                    <p className="text-xs text-muted-foreground">Lista de músicas</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </a>
            )}
          </div>
        )}

        {/* Redes sociais */}
        {visibleSocials.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center mb-3">
              Redes Sociais
            </p>
            <div className="space-y-2.5">
              {visibleSocials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-2xl bg-card border border-border/50 p-4 hover:border-primary/40 hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center text-white shadow-md shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 font-semibold text-foreground">{social.label}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer com marca Backstage */}
        <div className="mt-12 pt-6 border-t border-border/30 flex flex-col items-center gap-3">
          <a
            href="https://backstagepro.online"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/40 transition-colors group"
          >
            <AppLogo collapsed size="sm" />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              feito com <span className="font-bold text-foreground">Backstage Pro</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
