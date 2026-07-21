import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { AppLogo } from "@/components/layout/AppLogo";
import {
  Loader2,
  MapPin,
  Music,
  User as UserIcon,
  MessageCircle,
  Play,
  Sparkles,
  Check,
  Quote,
  Star,
  Instagram,
  Youtube,
  Globe,
  FileText,
  Award,
  Film,
  Play as PlayIcon,

} from "lucide-react";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

type BudgetPackage = {
  title?: string;
  subtitle?: string;
  price_text?: string;
  features?: string[];
  highlighted?: boolean;
};

type BudgetReview = {
  author?: string;
  role?: string;
  text?: string;
  rating?: number;
  image_url?: string;
};

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
  booking_whatsapp?: string | null;
  budget_link_enabled?: boolean | null;
  budget_headline?: string | null;
  budget_intro?: string | null;
  budget_bg_image_url?: string | null;
  budget_cover_type?: string | null;
  budget_video_url?: string | null;
  budget_cover_image_url?: string | null;
  budget_whatsapp?: string | null;
  budget_packages?: BudgetPackage[] | null;
  budget_reviews?: BudgetReview[] | null;
}

export default function LinkOrcamento() {
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
        setProfile({ ...(pub as any), phone: phoneRow?.phone ?? null });
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  const embedUrl = useMemo(
    () => getYouTubeEmbedUrl(profile?.budget_video_url || undefined),
    [profile?.budget_video_url]
  );
  const videoThumb = useMemo(() => {
    const id = profile?.budget_video_url?.match(
      /(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([\w-]{6,})/
    )?.[1];
    return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
  }, [profile?.budget_video_url]);

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
        <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-white/60 mb-6">Este link de orçamento não existe ou foi removido.</p>
        <Link to="/" className="text-amber-300 underline">Voltar</Link>
      </div>
    );
  }

  const fullName = profile.artist_name || "Artista";
  const bgImage = profile.budget_bg_image_url || profile.avatar_url || "";
  const coverImage = profile.budget_cover_image_url || profile.avatar_url || "";
  const useVideoCover = profile.budget_cover_type === "video" && !!embedUrl;

  const customWa = (profile.budget_whatsapp || profile.booking_whatsapp || "").replace(/\D/g, "");
  const fallbackWa = profile.phone ? profile.phone.replace(/\D/g, "") : "";
  const phoneDigits = customWa || fallbackWa;
  const whatsappHref = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
        `Olá ${fullName}! Vi sua página de orçamento e gostaria de pedir uma proposta.`
      )}`
    : null;

  const packages = (profile.budget_packages || []).filter(
    (p) => p && (p.title || p.price_text)
  );
  const reviews = (profile.budget_reviews || []).filter((r) => r && (r.text || r.author));

  const headline = profile.budget_headline || "Faça seu evento inesquecível";
  const intro =
    profile.budget_intro ||
    profile.bio ||
    "Solicite seu orçamento personalizado e leve uma experiência musical única para seu evento.";

  const socialLinks = [
    profile.instagram_url && { href: profile.instagram_url, Icon: Instagram, label: "Instagram" },
    profile.youtube_url && { href: profile.youtube_url, Icon: Youtube, label: "YouTube" },
    profile.website_url && { href: profile.website_url, Icon: Globe, label: "Site" },
    profile.media_kit_url && { href: profile.media_kit_url, Icon: FileText, label: "Mídia Kit" },
  ].filter(Boolean) as { href: string; Icon: any; label: string }[];

  return (
    <div className="relative min-h-screen w-full text-white overflow-x-hidden bg-neutral-950">
      <Helmet>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <title>{`${fullName} — Solicite seu Orçamento`}</title>
        <meta
          name="description"
          content={`${fullName} — pacotes, apresentação e orçamento personalizado para o seu evento.`}
        />
        <link rel="canonical" href={`https://backstagepro.online/orcamento/${slug ?? ""}`} />
        <meta property="og:title" content={`${fullName} — Solicite seu Orçamento`} />
        <meta property="og:description" content={intro} />
        <meta property="og:url" content={`https://backstagepro.online/orcamento/${slug ?? ""}`} />
      </Helmet>

      {/* Blurred background */}
      {bgImage ? (
        <div className="fixed inset-0 pointer-events-none">
          <img
            src={bgImage}
            alt=""
            aria-hidden
            className="w-full h-full object-cover blur-[1px] saturate-125 brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/90" />
        </div>
      ) : (
        <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black pointer-events-none" />
      )}

      <div
        className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-5 pb-14 flex flex-col gap-8"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
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

        {/* HERO */}
        <section className="relative">
          {/* Cover */}
          <div className="relative rounded-3xl overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.85)] border border-white/10 bg-neutral-900">
            <div className="aspect-[4/5] sm:aspect-[16/10] relative">
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
                      />
                    ) : coverImage ? (
                      <img
                        src={coverImage}
                        alt={fullName}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="w-24 h-24 flex items-center justify-center rounded-full bg-white/15 backdrop-blur-xl border border-white/30 group-hover:bg-white group-hover:text-black transition-all duration-500 shadow-2xl">
                        <Play className="w-10 h-10 fill-current ml-1" />
                      </span>
                    </div>
                  </button>
                )
              ) : coverImage ? (
                <img src={coverImage} alt={fullName} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                  <UserIcon className="w-24 h-24 text-white/40" />
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

              {/* Bottom-left content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 pointer-events-none">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[10px] font-bold uppercase tracking-[0.25em] mb-3">
                  <Sparkles className="w-3 h-3" />
                  Orçamento Exclusivo
                </div>
                <h1
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-4xl sm:text-6xl font-black leading-[0.95] tracking-tight text-white drop-shadow-lg"
                >
                  {fullName}
                </h1>
                {(profile.music_style || profile.base_city) && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-white/85 text-sm">
                    {profile.music_style && (
                      <span className="inline-flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5" />
                        {profile.music_style}
                      </span>
                    )}
                    {profile.music_style && profile.base_city && (
                      <span className="text-white/40">•</span>
                    )}
                    {profile.base_city && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {profile.base_city}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Headline & intro */}
        <section className="text-center px-2">
          <h2
            style={{ fontFamily: "'Playfair Display', serif" }}
            className="text-2xl sm:text-4xl font-bold tracking-tight leading-tight text-white"
          >
            {headline}
          </h2>
          <p className="mt-4 text-white/70 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
            {intro}
          </p>
        </section>

        {/* CTA WhatsApp */}
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-3 rounded-2xl px-6 py-5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-neutral-950 font-bold text-lg shadow-[0_20px_50px_-15px_rgba(251,191,36,0.6)] hover:shadow-[0_25px_60px_-15px_rgba(251,191,36,0.85)] hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            <MessageCircle className="w-6 h-6" />
            <span>Solicitar Orçamento no WhatsApp</span>
          </a>
        )}

        {/* Packages */}
        {packages.length > 0 && (
          <section className="space-y-4">
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-300/80">
                Pacotes e Formatos
              </p>
              <h3
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-2xl sm:text-3xl font-bold text-white mt-1"
              >
                Escolha a experiência ideal
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packages.map((pkg, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-2xl p-6 border backdrop-blur-md transition-all hover:-translate-y-0.5 ${
                    pkg.highlighted
                      ? "bg-gradient-to-br from-amber-400/20 to-amber-500/10 border-amber-300/50 shadow-[0_20px_50px_-15px_rgba(251,191,36,0.4)]"
                      : "bg-white/5 border-white/10 hover:border-white/25"
                  }`}
                >
                  {pkg.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-neutral-950 text-[10px] font-bold uppercase tracking-widest shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      Mais pedido
                    </span>
                  )}

                  {pkg.title && (
                    <h4
                      style={{ fontFamily: "'Playfair Display', serif" }}
                      className="text-2xl font-bold text-white leading-tight"
                    >
                      {pkg.title}
                    </h4>
                  )}
                  {pkg.subtitle && (
                    <p className="mt-1 text-sm text-white/60">{pkg.subtitle}</p>
                  )}
                  {pkg.price_text && (
                    <p className="mt-4 text-3xl font-black text-amber-300">{pkg.price_text}</p>
                  )}

                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {pkg.features.filter(Boolean).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                          <Check className="w-4 h-4 mt-0.5 text-amber-300 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-sm transition-all ${
                        pkg.highlighted
                          ? "bg-neutral-950 text-amber-300 hover:bg-neutral-800"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/15"
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Quero este pacote
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="space-y-4">
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-300/80">
                Depoimentos
              </p>
              <h3
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-2xl sm:text-3xl font-bold text-white mt-1"
              >
                Quem contratou aprovou
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.map((r, idx) => (
                <div
                  key={idx}
                  className="relative rounded-2xl p-6 bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/25 transition-all"
                >
                  <Quote className="w-8 h-8 text-amber-300/60 mb-3" />
                  {r.text && (
                    <p className="text-white/85 text-sm leading-relaxed italic">"{r.text}"</p>
                  )}
                  {typeof r.rating === "number" && r.rating > 0 && (
                    <div className="mt-3 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < (r.rating || 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-white/20"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  {(r.author || r.role) && (
                    <div className="mt-4 flex items-center gap-3">
                      {r.image_url ? (
                        <img
                          src={r.image_url}
                          alt={r.author || ""}
                          className="w-10 h-10 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white/60" />
                        </div>
                      )}
                      <div>
                        {r.author && (
                          <p className="text-white font-semibold text-sm leading-tight">
                            {r.author}
                          </p>
                        )}
                        {r.role && <p className="text-white/50 text-xs">{r.role}</p>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Social row */}
        {socialLinks.length > 0 && (
          <section className="flex flex-wrap justify-center gap-3">
            {socialLinks.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/8 border border-white/15 hover:bg-white/15 hover:border-white/30 text-white/80 hover:text-white text-sm transition-all"
              >
                <Icon className="w-4 h-4" />
                {label}
              </a>
            ))}
          </section>
        )}

        {/* Bottom CTA */}
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 group flex items-center justify-center gap-3 rounded-2xl px-6 py-5 bg-white text-neutral-950 font-bold text-lg shadow-[0_20px_50px_-15px_rgba(255,255,255,0.4)] hover:bg-amber-300 transition-all"
          >
            <MessageCircle className="w-6 h-6" />
            <span>Falar com {fullName.split(" ")[0]}</span>
          </a>
        )}

        <p className="text-center text-[10px] text-white/40 mt-2">
          © {new Date().getFullYear()} {fullName} — Página gerada pelo Backstage Pro
        </p>
      </div>
    </div>
  );
}
