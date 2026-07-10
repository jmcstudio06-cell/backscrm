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
  FileText,
  ListMusic,
  CalendarDays,
  Loader2,
  MapPin,
  Music,
  User as UserIcon,
  MessageCircle,
  Play,
  ChevronRight,
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
  link_bg_image_url?: string | null;
  link_cover_type?: string | null;
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
          "user_id, slug, artist_name, avatar_url, base_city, music_style, bio, phone, instagram_url, youtube_url, tiktok_url, spotify_url, website_url, media_kit_url, show_video_url, repertoire_url, booking_method, booking_whatsapp, link_bg_image_url, link_cover_type"
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="w-8 h-8 animate-spin text-white/70" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 p-6 text-center text-white">
        <h1 className="text-2xl font-bold mb-2">Link não encontrado</h1>
        <p className="text-white/60 mb-6">Este link de artista não existe ou foi removido.</p>
        <Link to="/" className="text-sky-300 underline">Voltar</Link>
      </div>
    );
  }

  const fullName = profile.artist_name || "Artista";
  const bgImage = profile.link_bg_image_url || profile.avatar_url || "";
  const useVideoCover = profile.link_cover_type === "video" && !!embedUrl;

  // Booking URL
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

  // Link rows
  type Row = {
    key: string;
    href: string;
    external: boolean;
    label: string;
    sub: string;
    Icon: React.ElementType;
    iconBg: string;
    iconColor: string;
  };
  const rows: Row[] = [];

  if (useWhatsapp && whatsappHref) {
    rows.push({
      key: "booking-wa",
      href: whatsappHref,
      external: true,
      label: "Agendar Show",
      sub: "Conversa direta no WhatsApp",
      Icon: MessageCircle,
      iconBg: "bg-[#25D366]",
      iconColor: "text-white",
    });
  } else if (profile.slug) {
    rows.push({
      key: "booking-agenda",
      href: backstageHref,
      external: false,
      label: "Agendar Show",
      sub: "Ver datas disponíveis na agenda",
      Icon: CalendarDays,
      iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
      iconColor: "text-white",
    });
  }

  if (profile.spotify_url)
    rows.push({
      key: "spotify",
      href: profile.spotify_url,
      external: true,
      label: "Spotify",
      sub: "Ouça agora",
      Icon: Music2,
      iconBg: "bg-[#1DB954]",
      iconColor: "text-white",
    });
  if (profile.youtube_url)
    rows.push({
      key: "youtube",
      href: profile.youtube_url,
      external: true,
      label: "YouTube",
      sub: "Inscreva-se no canal",
      Icon: Youtube,
      iconBg: "bg-[#FF0000]",
      iconColor: "text-white",
    });
  if (profile.instagram_url)
    rows.push({
      key: "instagram",
      href: profile.instagram_url,
      external: true,
      label: "Instagram",
      sub: "Siga nos bastidores",
      Icon: Instagram,
      iconBg: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
      iconColor: "text-white",
    });
  if (profile.tiktok_url)
    rows.push({
      key: "tiktok",
      href: profile.tiktok_url,
      external: true,
      label: "TikTok",
      sub: "Vídeos e cortes",
      Icon: TikTokIcon,
      iconBg: "bg-black border border-white/20",
      iconColor: "text-white",
    });
  if (profile.website_url)
    rows.push({
      key: "website",
      href: profile.website_url,
      external: true,
      label: "Website",
      sub: "Site oficial",
      Icon: Globe,
      iconBg: "bg-gradient-to-br from-cyan-400 to-sky-500",
      iconColor: "text-white",
    });
  if (profile.media_kit_url)
    rows.push({
      key: "midiakit",
      href: profile.media_kit_url,
      external: true,
      label: "Mídia Kit",
      sub: "Baixe o material completo",
      Icon: FileText,
      iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
      iconColor: "text-white",
    });
  if (profile.repertoire_url)
    rows.push({
      key: "repertoire",
      href: profile.repertoire_url,
      external: true,
      label: "Repertório",
      sub: "Lista de músicas",
      Icon: ListMusic,
      iconBg: "bg-gradient-to-br from-fuchsia-500 to-purple-600",
      iconColor: "text-white",
    });

  return (
    <div className="relative min-h-screen w-full text-white overflow-x-hidden bg-neutral-950">
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap" rel="stylesheet" />
        <title>{`${fullName} — Press Kit Oficial`}</title>
        <meta name="description" content={`Press kit oficial de ${fullName}: música, redes sociais e contato direto para shows.`} />
        <link rel="canonical" href={`https://backstagepro.online/link/${slug ?? ""}`} />
        <meta property="og:title" content={`${fullName} — Press Kit`} />
        <meta property="og:description" content={`Conheça ${fullName} e contrate seu show pelo Backstage Pro.`} />
        <meta property="og:url" content={`https://backstagepro.online/link/${slug ?? ""}`} />
      </Helmet>

      {/* Blurred background (uploaded image or avatar fallback) */}
      {bgImage ? (
        <div className="fixed inset-0 pointer-events-none">
          <img
            src={bgImage}
            alt=""
            aria-hidden
            className="w-full h-full object-cover scale-100 blur-[1px] opacity-70 saturate-125 brightness-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/45 to-background/75" />
        </div>
      ) : (
        <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none" />
      )}

      <div className="relative max-w-lg mx-auto px-4 sm:px-6 pt-5 pb-14 flex flex-col gap-6">
        {/* Backstage Pro badge */}
        <div className="flex justify-center">
          <a
            href="https://backstagepro.online"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 hover:bg-white/15 transition-all group"
          >
            <AppLogo collapsed size="sm" />
            <span className="text-[11px] text-white/70 group-hover:text-white transition-colors">
              feito com <span className="font-bold text-white">Backstage Pro</span>
            </span>
          </a>
        </div>

        {/* Cover Card — square, either photo or clickable YouTube */}
        <div className="relative rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] border border-white/10 bg-neutral-900">
          <div className="aspect-square relative">
            {useVideoCover ? (
              videoPlaying ? (
                <iframe
                  src={`${embedUrl}${embedUrl?.includes("?") ? "&" : "?"}autoplay=1`}
                  title="Vídeo do artista"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setVideoPlaying(true)}
                  className="absolute inset-0 w-full h-full group"
                  aria-label="Tocar vídeo"
                >
                  {videoThumb ? (
                    <img
                      src={videoThumb}
                      alt={fullName}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={fullName}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="w-20 h-20 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-xl border border-white/30 group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-2xl">
                      <Play className="w-9 h-9 fill-current ml-1" />
                    </span>
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-lg rounded-lg border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest text-white">VÍDEO</span>
                  </div>
                </button>
              )
            ) : profile.avatar_url ? (
              <img src={profile.avatar_url} alt={fullName} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                <UserIcon className="w-20 h-20 text-white/40" />
              </div>
            )}
          </div>
        </div>

        {/* Name & meta */}
        <div className="text-center px-2">
          <h1
            style={{ fontFamily: "'Syne', sans-serif" }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight"
          >
            {fullName}
          </h1>

          {(profile.music_style || profile.base_city) && (
            <div className="mt-2 flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-white/70 text-sm">
              {profile.music_style && (
                <span className="inline-flex items-center gap-1">
                  <Music className="w-3.5 h-3.5" />
                  {profile.music_style}
                </span>
              )}
              {profile.music_style && profile.base_city && <span className="text-white/30">•</span>}
              {profile.base_city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.base_city}
                </span>
              )}
            </div>
          )}

          {profile.bio && (
            <p className="mt-3 text-white/70 text-sm leading-relaxed max-w-md mx-auto">
              {profile.bio}
            </p>
          )}

          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.3em] text-white/50">
            Escolha uma opção
          </p>
        </div>

        {/* Link rows — Linkfire style */}
        <div className="space-y-2.5">
          {rows.map((r) => {
            const Icon = r.Icon;
            const content = (
              <div className="group flex items-center gap-3 pl-2 pr-3 py-2 bg-white rounded-xl hover:bg-neutral-50 active:scale-[0.985] transition-all shadow-lg shadow-black/30">
                <span className={`w-11 h-11 rounded-lg flex items-center justify-center ${r.iconBg} ${r.iconColor} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-neutral-900 font-bold text-[15px] leading-tight truncate">
                    {r.label}
                  </span>
                  <span className="block text-neutral-500 text-[11px] truncate">{r.sub}</span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 group-hover:text-neutral-900 transition-colors flex items-center gap-0.5">
                  Abrir
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            );
            return r.external ? (
              <a key={r.key} href={r.href} target="_blank" rel="noopener noreferrer" className="block">
                {content}
              </a>
            ) : (
              <Link key={r.key} to={r.href} className="block">
                {content}
              </Link>
            );
          })}
        </div>

        {rows.length === 0 && (
          <p className="text-center text-white/50 text-sm py-8">
            Este artista ainda não configurou seus links.
          </p>
        )}

        <p className="text-center text-[10px] text-white/40 mt-2">
          Press Kit Oficial — © {new Date().getFullYear()} {fullName}
        </p>
      </div>
    </div>
  );
}
