import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
  Play,
  ArrowRight,
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
  booking_whatsapp?: string | null;
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.94a8.16 8.16 0 0 0 4.77 1.52V7.05a4.85 4.85 0 0 1-1.84-.36z" />
  </svg>
);

// Quebra "Nome Sobrenome" em duas linhas (primeira palavra em branco, restante em gradiente)
function splitName(name: string): { first: string; rest: string } {
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], rest: "" };
  return { first: parts[0], rest: parts.slice(1).join(" ") };
}

export default function LinkInstagram() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);

      const { data: pub } = await supabase
        .from("artist_public_profiles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (pub) {
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
          "user_id, slug, artist_name, avatar_url, base_city, music_style, bio, phone, instagram_url, youtube_url, tiktok_url, spotify_url, website_url, media_kit_url, show_video_url, repertoire_url, booking_method, booking_whatsapp"
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
  const videoThumb = useMemo(() => {
    const id = profile?.show_video_url?.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{6,})/)?.[1];
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
  }, [profile?.show_video_url]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1a3a] via-[#0d2557] to-[#061029]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-300" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1a3a] via-[#0d2557] to-[#061029] p-6 text-center text-white">
        <h1 className="text-2xl font-bold mb-2">Link não encontrado</h1>
        <p className="text-white/60 mb-6">Este link de artista não existe ou foi removido.</p>
        <Link to="/" className="text-sky-300 underline">Voltar</Link>
      </div>
    );
  }

  const socials: { Icon: React.ElementType; label: string; url: string | null; dot: string }[] = [
    { Icon: Instagram, label: "Instagram", url: profile.instagram_url, dot: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]" },
    { Icon: Youtube, label: "YouTube", url: profile.youtube_url, dot: "bg-red-600" },
    { Icon: TikTokIcon, label: "TikTok", url: profile.tiktok_url, dot: "bg-white" },
    { Icon: Music2, label: "Spotify", url: profile.spotify_url, dot: "bg-green-500" },
    { Icon: Globe, label: "Website", url: profile.website_url, dot: "bg-cyan-400" },
  ];
  const visibleSocials = socials.filter((s) => s.url && s.url.trim().length > 0);

  const fullName = profile.artist_name || "Artista";
  const { first, rest } = splitName(fullName);

  return (
    <div className="relative min-h-screen w-full text-white selection:bg-sky-400/30 overflow-x-hidden bg-gradient-to-br from-[#0a1a3a] via-[#0d2557] to-[#061029]">
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet" />
        <title>{`${fullName} — Press Kit Oficial`}</title>
        <meta name="description" content={`Press kit oficial de ${fullName}: estilo, cidade, redes sociais e contato direto para shows.`} />
        <link rel="canonical" href={`https://backstagepro.online/link/${slug ?? ""}`} />
        <meta property="og:title" content={`${fullName} — Press Kit`} />
        <meta property="og:description" content={`Conheça ${fullName} e contrate seu show pelo Backstage Pro.`} />
        <meta property="og:url" content={`https://backstagepro.online/link/${slug ?? ""}`} />
      </Helmet>

      {/* Ambient avatar backdrop — foto do artista extensa no fundo */}
      {profile.avatar_url && (
        <div className="fixed inset-0 pointer-events-none">
          <img
            src={profile.avatar_url}
            alt=""
            aria-hidden
            className="w-full h-full object-cover scale-110 opacity-30 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a3a]/70 via-[#0d2557]/85 to-[#061029]/95" />
        </div>
      )}

      {/* Nome em watermark gigante atrás de tudo */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden select-none"
      >
        <span
          style={{ fontFamily: "'Syne', sans-serif" }}
          className="text-[28vw] md:text-[20vw] font-extrabold uppercase tracking-tighter text-white/[0.04] whitespace-nowrap leading-none"
        >
          {fullName}
        </span>
      </div>

      {/* Floating glows azuis */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-sky-500/25 blur-[140px]" />
        <div className="absolute top-1/2 -right-32 w-[32rem] h-[32rem] rounded-full bg-blue-500/25 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-cyan-400/20 blur-[120px]" />
      </div>

      {/* Subtle grain */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-5 md:px-8 pt-6 pb-16 flex flex-col gap-14 md:gap-16">
        {/* Top badge */}
        <div className="flex justify-center">
          <a
            href="https://backstagepro.online"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/25 transition-all group"
          >
            <AppLogo collapsed size="sm" />
            <span className="text-[11px] text-white/60 group-hover:text-white transition-colors">
              feito com <span className="font-bold text-white">Backstage Pro</span>
            </span>
          </a>
        </div>

        {/* HERO — Editorial */}
        <section className="relative flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-8 md:mb-10 group">
            <div
              className="absolute -inset-1 rounded-[2.5rem] blur opacity-50 group-hover:opacity-80 transition duration-1000"
              style={{
                background:
                  "conic-gradient(from 0deg, #d946ef, #8b5cf6, #22d3ee, #d946ef)",
                animation: "spin 10s linear infinite",
              }}
            />
            <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-[2.2rem] overflow-hidden border border-white/10 bg-zinc-900">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-white/40" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-violet-700 rounded-2xl flex items-center justify-center border-4 border-[#050505] shadow-2xl">
              <Music className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Tags */}
          {(profile.music_style || profile.base_city) && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {profile.music_style && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">
                  <Music className="w-3 h-3" />
                  {profile.music_style}
                </span>
              )}
              {profile.base_city && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">
                  <MapPin className="w-3 h-3" />
                  {profile.base_city}
                </span>
              )}
            </div>
          )}

          {/* Massive editorial name */}
          <h1
            style={{ fontFamily: "'Syne', sans-serif" }}
            className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] uppercase"
          >
            {first}
            {rest && (
              <>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 via-violet-400 to-cyan-400">
                  {rest}
                </span>
              </>
            )}
          </h1>

          <p className="mt-4 text-zinc-500 font-medium tracking-tight text-base md:text-lg">
            Press Kit Oficial
          </p>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-6 max-w-xl text-[15px] text-white/70 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Socials + docs */}
          {(visibleSocials.length > 0 || profile.media_kit_url || profile.repertoire_url) && (
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {visibleSocials.map(({ Icon, label, url, dot }) => (
                <a
                  key={label}
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 pl-3 pr-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-2xl transition-all hover:-translate-y-0.5"
                >
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <Icon className="w-3.5 h-3.5 text-white/80" />
                  <span className="text-[11px] font-bold tracking-widest uppercase">{label}</span>
                </a>
              ))}

              {profile.media_kit_url && (
                <a
                  href={profile.media_kit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 pl-3 pr-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-2xl transition-all hover:-translate-y-0.5"
                >
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  <FileText className="w-3.5 h-3.5 text-white/80" />
                  <span className="text-[11px] font-bold tracking-widest uppercase">Mídia Kit</span>
                </a>
              )}

              {profile.repertoire_url && (
                <a
                  href={profile.repertoire_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 pl-3 pr-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-2xl transition-all hover:-translate-y-0.5"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <ListMusic className="w-3.5 h-3.5 text-white/80" />
                  <span className="text-[11px] font-bold tracking-widest uppercase">Repertório</span>
                </a>
              )}
            </div>
          )}
        </section>

        {/* VIDEO SPOTLIGHT */}
        {embedUrl && (
          <section className="relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-transparent via-violet-600/10 to-transparent blur-3xl pointer-events-none" />

            <div className="flex items-end justify-between mb-4 px-1">
              <h2
                style={{ fontFamily: "'Syne', sans-serif" }}
                className="text-2xl md:text-3xl font-bold tracking-tight"
              >
                Destaque
              </h2>
              <span className="text-[10px] text-white/40 uppercase tracking-[0.25em] font-bold">
                Assista agora
              </span>
            </div>

            <div className="relative group rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl shadow-black/50">
              <div className="aspect-video relative">
                {videoPlaying ? (
                  <iframe
                    src={embedUrl}
                    title="Vídeo do show"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setVideoPlaying(true)}
                    className="absolute inset-0 w-full h-full group/play"
                    aria-label="Tocar vídeo"
                  >
                    {videoThumb && (
                      <img
                        src={videoThumb}
                        alt="Capa do vídeo"
                        className="absolute inset-0 w-full h-full object-cover grayscale group-hover/play:grayscale-0 group-hover/play:scale-105 transition-all duration-1000"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/20 group-hover/play:bg-fuchsia-600 group-hover/play:scale-110 transition-all duration-500 shadow-[0_0_60px_-10px_rgba(217,70,239,0.7)]">
                        <Play className="w-9 h-9 md:w-10 md:h-10 fill-white text-white ml-1" />
                      </span>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div className="space-y-1 text-left">
                        <h3 className="text-lg md:text-2xl font-bold tracking-tight">Show ao vivo</h3>
                        <p className="text-white/60 text-xs md:text-sm">Toque para assistir</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-lg rounded-xl border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-black tracking-widest">HD</span>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        {(() => {
          if (!profile.slug) return null;
          const customWa = profile.booking_whatsapp ? profile.booking_whatsapp.replace(/\D/g, "") : "";
          const fallbackWa = profile.phone ? profile.phone.replace(/\D/g, "") : "";
          const phoneDigits = customWa || fallbackWa;
          const useWhatsapp = profile.booking_method === "whatsapp" && phoneDigits;
          const whatsappHref = phoneDigits
            ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                `Olá ${fullName}! Vi seu link e quero agendar um show.`
              )}`
            : null;
          const backstageHref = `/artista/${profile.slug}`;

          const Icon = useWhatsapp ? MessageCircle : CalendarDays;
          const subtitle = useWhatsapp ? "Falar agora pelo WhatsApp" : "Veja datas disponíveis";

          const inner = (
            <span className="relative group block overflow-hidden rounded-[2rem] active:scale-[0.98] transition-transform">
              {/* gradient liquid bg */}
              <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-500 bg-[length:200%_100%] group-hover:bg-right transition-[background-position] duration-700" />
              {/* shimmer */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="relative flex items-center justify-between gap-4 px-6 md:px-8 py-5 md:py-6">
                <span className="flex items-center gap-4 md:gap-5">
                  <span className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md ring-1 ring-white/30">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </span>
                  <span className="text-left">
                    <span
                      style={{ fontFamily: "'Syne', sans-serif" }}
                      className="block text-xl md:text-2xl font-extrabold uppercase tracking-tight leading-none"
                    >
                      Agendar Show
                    </span>
                    <span className="block text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] text-white/80 mt-1.5">
                      {subtitle}
                    </span>
                  </span>
                </span>
                <span className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center group-hover:bg-white group-hover:text-fuchsia-700 transition-all duration-300">
                  <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </span>
            </span>
          );

          const wrapper = "block shadow-[0_30px_80px_-20px_rgba(168,85,247,0.45)] rounded-[2rem]";

          if (useWhatsapp && whatsappHref) {
            return (
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={wrapper}>
                {inner}
                <span className="sr-only">
                  <ExternalLink />
                </span>
              </a>
            );
          }
          return (
            <Link to={backstageHref} className={wrapper}>
              {inner}
            </Link>
          );
        })()}
      </div>
    </div>
  );
}
