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
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0f] text-white">
      {/* Cinematic backdrop: artist avatar as ambient blur */}
      {profile.avatar_url && (
        <div className="fixed inset-0 pointer-events-none">
          <img
            src={profile.avatar_url}
            alt=""
            aria-hidden
            className="w-full h-full object-cover scale-125 opacity-40 blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/70 via-[#0a0a0f]/85 to-[#0a0a0f]" />
        </div>
      )}

      {/* Vibrant ambient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-fuchsia-500/30 blur-3xl animate-pulse" style={{ animationDuration: "6s" }} />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-violet-500/30 blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-0 left-1/4 w-[24rem] h-[24rem] rounded-full bg-cyan-500/20 blur-3xl animate-pulse" style={{ animationDuration: "10s" }} />
      </div>

      {/* Subtle grain */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-5 pt-6 pb-12 sm:pt-8">
        {/* Topo: Badge Backstage Pro */}
        <div className="flex justify-center mb-8">
          <a
            href="https://backstagepro.online"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/25 transition-all group"
          >
            <AppLogo collapsed size="sm" />
            <span className="text-xs text-white/60 group-hover:text-white transition-colors">
              feito com <span className="font-bold text-white">Backstage Pro</span>
            </span>
          </a>
        </div>

        {/* Hero horizontal: foto à esquerda + info/botões à direita */}
        <div className="mb-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 sm:p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Foto */}
            <div className="relative shrink-0">
              <div
                className="absolute -inset-2 rounded-3xl opacity-70 blur-md"
                style={{
                  background:
                    "conic-gradient(from 0deg, #f0abfc, #a78bfa, #22d3ee, #f0abfc)",
                  animation: "spin 8s linear infinite",
                }}
              />
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl p-[3px] bg-gradient-to-br from-fuchsia-400 via-violet-400 to-cyan-400 shadow-[0_20px_60px_-15px_rgba(168,85,247,0.6)]">
                <div className="w-full h-full rounded-[1.3rem] bg-[#0a0a0f] overflow-hidden flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.artist_name || "Artista"} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-14 h-14 text-white/50" />
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shadow-lg ring-4 ring-[#0a0a0f]">
                <Music className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Info + botões */}
            <div className="flex-1 min-w-0 text-center sm:text-left w-full">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent drop-shadow-sm">
                {profile.artist_name || "Artista"}
              </h1>

              {(profile.music_style || profile.base_city) && (
                <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {profile.music_style && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-white/90">
                      <Music className="w-3 h-3" />
                      {profile.music_style}
                    </span>
                  )}
                  {profile.base_city && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-white/90">
                      <MapPin className="w-3 h-3" />
                      {profile.base_city}
                    </span>
                  )}
                </div>
              )}

              {/* Botões: redes sociais + mídia kit + repertório */}
              {(visibleSocials.length > 0 || profile.media_kit_url || profile.repertoire_url) && (
                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                  {visibleSocials.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={social.label}
                        className={`group inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 transition-all`}
                      >
                        <span className={`w-7 h-7 rounded-full bg-gradient-to-br ${social.color} flex items-center justify-center text-white shadow-md shrink-0`}>
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-xs font-semibold text-white">{social.label}</span>
                      </a>
                    );
                  })}

                  {profile.media_kit_url && (
                    <a
                      href={profile.media_kit_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 transition-all"
                    >
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-semibold text-white">Mídia Kit</span>
                    </a>
                  )}

                  {profile.repertoire_url && (
                    <a
                      href={profile.repertoire_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 transition-all"
                    >
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shrink-0">
                        <ListMusic className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-semibold text-white">Repertório</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="mt-5 text-[15px] text-white/75 leading-relaxed text-center sm:text-left">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Vídeo destaque */}
        {embedUrl && (
          <div className="mb-6 rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] bg-black/40 backdrop-blur-xl">
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
          const gradient = useWhatsapp
            ? "from-emerald-400 via-green-500 to-emerald-600"
            : "from-fuchsia-500 via-violet-500 to-cyan-500";
          const glow = useWhatsapp
            ? "shadow-[0_20px_60px_-15px_rgba(16,185,129,0.7)]"
            : "shadow-[0_20px_60px_-15px_rgba(168,85,247,0.7)]";

          const commonClass = `group relative block w-full mb-5 overflow-hidden rounded-3xl ${glow} hover:scale-[1.02] active:scale-[0.99] transition-all duration-300`;
          const inner = (
            <>
              <div className={`absolute inset-0 bg-gradient-to-r ${gradient} bg-[length:200%_100%] group-hover:bg-right transition-[background-position] duration-700`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              {/* shimmer */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="relative px-6 py-5 flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center ring-1 ring-white/30">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-xl leading-tight tracking-tight">Agendar Show</p>
                    <p className="text-[13px] opacity-90 font-medium">{subtitle}</p>
                  </div>
                </div>
                <ExternalLink className="w-5 h-5 opacity-90 group-hover:translate-x-1 transition-transform" />
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

        {/* Material / Portfólio cards */}
        {(profile.media_kit_url || profile.repertoire_url) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {profile.media_kit_url && (
              <a
                href={profile.media_kit_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">Mídia Kit</p>
                    <p className="text-xs text-white/60">Press kit profissional</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </div>
              </a>
            )}
            {profile.repertoire_url && (
              <a
                href={profile.repertoire_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                    <ListMusic className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">Repertório</p>
                    <p className="text-xs text-white/60">Lista de músicas</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                </div>
              </a>
            )}
          </div>
        )}

        {/* Redes sociais */}
        {visibleSocials.length > 0 && (
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 text-center mb-4">
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
                    className="group flex items-center gap-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-4 hover:bg-white/10 hover:border-white/25 hover:-translate-y-0.5 transition-all"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${social.color} flex items-center justify-center text-white shadow-lg shrink-0`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="flex-1 font-semibold text-white">{social.label}</span>
                    <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col items-center gap-3">
          <a
            href="https://backstagepro.online"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/25 transition-all group"
          >
            <AppLogo collapsed size="sm" />
            <span className="text-xs text-white/60 group-hover:text-white transition-colors">
              feito com <span className="font-bold text-white">Backstage Pro</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
