import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

type Slide = {
  id: string;
  href: string;
  image: string;
  alt: string;
  badge: string;
  title: string;
  description: string;
  cta: string;
};

const ROTATION_MS = 6000;


const isExternal = (href: string) => /^https?:\/\//i.test(href);

/** Renders an internal Link or an external anchor depending on the URL. */
function SlideLink({
  href,
  className,
  ariaLabel,
  children,
}: {
  href: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  if (isExternal(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

export function PartnerAdBanner() {
  const isMobile = useIsMobile();
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("dashboard_ads")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (cancelled || !data) return;


      setSlides(
        data.map((ad) => ({
          id: ad.id,
          href: ad.cta_url,
          image: ad.image_url,
          alt: ad.title,
          badge: ad.badge ?? "Novidade",
          title: ad.title,
          description: ad.description ?? "",
          cta: ad.cta_label,
        }))
      );
      setIndex(0);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATION_MS);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[index] ?? slides[0];
  if (!slide) return null;

  // Mobile: only the image, tap → destination
  if (isMobile) {
    return (
      <div className="relative w-full">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 shadow-card">
          {slides.map((s, i) => (
            <SlideLink
              key={s.id}
              href={s.href}
              ariaLabel={s.title}
              className={cn(
                "block w-full transition-opacity duration-700",
                i === index ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
              )}
            >
              <img
                src={s.image}
                alt={s.alt}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </SlideLink>
          ))}
        </div>

        {/* CTA link */}
        <SlideLink
          href={slide.href}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4"
        >
          {slide.cta}
          <ArrowRight className="w-3.5 h-3.5" />
        </SlideLink>
      </div>
    );
  }

  // Desktop: image + text card, auto-rotating
  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-card">
        {slides.map((s, i) => (
          <SlideLink
            key={s.id}
            href={s.href}
            className={cn(
              "group transition-opacity duration-700",
              i === index
                ? "opacity-100 relative flex flex-col sm:flex-row items-stretch"
                : "opacity-0 absolute inset-0 pointer-events-none flex flex-col sm:flex-row items-stretch"
            )}
          >
            <div className="relative w-full sm:w-[60%] lg:w-[55%] aspect-[2.4/1] sm:aspect-auto overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
              <img
                src={s.image}
                alt={s.alt}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>

            <div className="flex-1 flex flex-col justify-center p-4 sm:p-5 lg:p-6 gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <Sparkles className="w-3 h-3" />
                  {s.badge}
                </span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground leading-tight">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {s.description}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary group-hover:underline underline-offset-4">
                  {s.cta}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </SlideLink>
        ))}

        {/* Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIndex((i) => (i - 1 + slides.length) % slides.length);
              }}
              aria-label="Banner anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur text-foreground hover:bg-background transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIndex((i) => (i + 1) % slides.length);
              }}
              aria-label="Próximo banner"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur text-foreground hover:bg-background transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setIndex(i)}
              aria-label={`Ir para banner ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
