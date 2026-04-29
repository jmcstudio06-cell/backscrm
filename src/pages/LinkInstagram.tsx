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
  MessageCircle,
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
  booking_method?: string | null;
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
        // Buscar phone separado (não está em artist_public_profiles)
        const { data: phoneRow } = await supabase
          .from("profiles")
          .select("phone")
          .eq("slug", slug)
          .maybeSingle();
        setProfile({ ...(pub as PublicProfile), phone: phoneRow?.phone ?? null });
        setLoading(false);
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select(
          "user_id, slug, artist_name, avatar_url, base_city, music_style, bio, phone, instagram_url, youtube_url, tiktok_url, spotify_url, website_url, media_kit_url, show_video_url, repertoire_url, booking_method"
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
      {/* Soft ambient orbs in brand blue */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[24rem] h-[24rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-3 sm:px-5 pt-3 sm:pt-6 pb-8">
        {/* Topo: Badge Backstage Pro */}
        <div className="flex justify-center mb-3 sm:mb-5">
          <a
            href="https://backstagepro.online"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm hover:border-primary/40 transition-all group"
          >
            <AppLogo collapsed size="sm" />
            <span className="text-[11px] text-slate-500 group-hover:text-slate-900 transition-colors">
              feito com <span className="font-bold text-primary">Backstage Pro</span>
            </span>
          </a>
        </div>

        {/* Hero: foto à esquerda + info/botões à direita */}
        <div className="mb-4 rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)]">
          <div className="flex flex-row gap-4 items-start">
            {/* Foto */}
            <div className="relative shrink-0">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl p-[3px] bg-gradient-to-br from-primary to-primary/60 shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.5)]">
                <div className="w-full h-full rounded-[0.9rem] bg-white overflow-hidden flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.artist_name || "Artista"} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-10 h-10 text-slate-400" />
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md ring-4 ring-white">
                <Music className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                {profile.artist_name || "Artista"}
              </h1>

              {(profile.music_style || profile.base_city) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {profile.music_style && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary">
                      <Music className="w-2.5 h-2.5" />
                      {profile.music_style}
                    </span>
                  )}
                  {profile.base_city && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700">
                      <MapPin className="w-2.5 h-2.5" />
                      {profile.base_city}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botões: redes sociais + mídia kit + repertório */}
          {(visibleSocials.length > 0 || profile.media_kit_url || profile.repertoire_url) && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {visibleSocials.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.label}
                    className="group inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-primary/40 hover:shadow-sm transition-all"
                  >
                    <span className={`w-6 h-6 rounded-full bg-gradient-to-br ${social.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                      <Icon className="w-3 h-3" />
                    </span>
                    <span className="text-[11px] font-semibold text-slate-700">{social.label}</span>
                  </a>
                );
              })}

              {profile.media_kit_url && (
                <a
                  href={profile.media_kit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
                    <FileText className="w-3 h-3" />
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700">Mídia Kit</span>
                </a>
              )}

              {profile.repertoire_url && (
                <a
                  href={profile.repertoire_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-primary/40 hover:shadow-sm transition-all"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center text-white shadow-sm shrink-0">
                    <ListMusic className="w-3 h-3" />
                  </span>
                  <span className="text-[11px] font-semibold text-slate-700">Repertório</span>
                </a>
              )}
            </div>
          )}

          {profile.bio && (
            <p className="mt-3 text-[13px] text-slate-600 leading-relaxed">
              {profile.bio}
            </p>
          )}
        </div>

        {/* CTA Agendar Show */}
        {(() => {
          if (!profile.slug) return null;
          const phoneDigits = profile.phone ? profile.phone.replace(/\D/g, "") : "";
          const useWhatsapp = profile.booking_method === "whatsapp" && phoneDigits;
          const whatsappHref = phoneDigits
            ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                `Olá ${profile.artist_name || ""}! Vi seu link e quero agendar um show.`
              )}`
            : null;
          const backstageHref = `/artista/${profile.slug}`;

          const Icon = useWhatsapp ? MessageCircle : CalendarDays;
          const subtitle = useWhatsapp ? "Falar agora pelo WhatsApp" : "Veja datas disponíveis";

          const commonClass = `group relative block w-full mb-4 overflow-hidden rounded-2xl shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.5)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200`;
          const inner = (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/85" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="relative px-4 py-3.5 flex items-center justify-between text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-base leading-tight">Agendar Show</p>
                    <p className="text-[11px] opacity-90 font-medium">{subtitle}</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 opacity-90 group-hover:translate-x-1 transition-transform" />
              </div>
            </>
          );

          if (useWhatsapp && whatsappHref) {
            return (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={commonClass}>
                {inner}
              </a>
            );
          }
          return (
            <Link to={backstageHref} className={commonClass}>
              {inner}
            </Link>
          );
        })()}

        {/* Vídeo destaque */}
        {embedUrl && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.2)] bg-white">
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
      </div>
    </div>
  );
}
