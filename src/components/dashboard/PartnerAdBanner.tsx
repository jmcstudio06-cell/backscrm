import { useEffect, useState } from "react";
import { ExternalLink, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import backsRadarBanner from "@/assets/backs-radar-banner.png.asset.json";
import rankingBanner from "@/assets/ranking-banner.png.asset.json";

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

const SLIDES: Slide[] = [
  {
    id: "backs-radar",
    href: "https://backsai.online",
    image: backsRadarBanner.url,
    alt: "Backs Radar - App parceiro do Backstage Pro para encontrar shows perto de você",
    badge: "Parceiro Backstage",
    title: "Encontre shows perto de você",
    description:
      "O app parceiro para cantores que querem mais palcos, mais oportunidades e mais audiência.",
    cta: "Conhecer agora",
  },
  {
    id: "ranking-shows",
    href: "https://www.instagram.com/p/DXxfzcmD55S/",
    image: rankingBanner.url,
    alt: "Ranking de Shows do mês - TOP 3 artistas",
    badge: "Ranking Backstage",
    title: "Confira o Ranking de Shows do mês",
    description:
      "Veja quem fez mais shows e concorra ao pódio. Divulgado todo mês no nosso Instagram.",
    cta: "Ver no Instagram",
  },
];

const ROTATION_MS = 6000;

export function PartnerAdBanner() {
  const isMobile = useIsMobile();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, ROTATION_MS);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[index];

  // Mobile: only the image, tap → destination
  if (isMobile) {
    return (
      <div className="relative w-full">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 shadow-card">
          {SLIDES.map((s, i) => (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.title}
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
            </a>
          ))}
        </div>

        {/* CTA link */}
        <a
          href={slide.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4"
        >
          {slide.cta}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  // Desktop: image + text card, auto-rotating
  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-card">
        {SLIDES.map((s, i) => (
          <a
            key={s.id}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
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
                  <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </div>
          </a>
        ))}

        {/* Arrows */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);
          }}
          aria-label="Banner anterior"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur text-foreground hover:bg-background transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            setIndex((i) => (i + 1) % SLIDES.length);
          }}
          aria-label="Próximo banner"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur text-foreground hover:bg-background transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        {SLIDES.map((s, i) => (
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

      {/* keep reference so slide var is used even when array switches */}
      <span className="sr-only">{slide.title}</span>
    </div>
  );
}
