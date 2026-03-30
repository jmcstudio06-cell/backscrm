import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Palette,
  MessageSquareText,
  Rocket,
  ArrowRight,
  Gift,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const cards = [
  {
    id: "erros",
    title: "Erros que fazem você perder show",
    description: "Descubra os erros mais comuns que artistas cometem e como evitá-los",
    icon: AlertTriangle,
    path: "/guia-atendimento",
    accent: "from-destructive/80 to-destructive/60",
    featured: false,
  },
  {
    id: "artes",
    title: "Artes editáveis no Canva",
    description: "Artes profissionais prontas para divulgar seus shows",
    icon: Palette,
    path: "/kit-profissional/artes",
    accent: "from-primary/70 to-primary/50",
    external: false,
    featured: false,
  },
  {
    id: "mensagens",
    title: "Mensagens prontas",
    description: "Copie e use mensagens profissionais para fechar mais shows",
    icon: MessageSquareText,
    path: "/kit-profissional/mensagens",
    accent: "from-success/80 to-success/60",
    external: false,
    featured: false,
  },
  {
    id: "backstage",
    title: "Backstage Pro",
    description: "Sistema que já está sendo usado por mais de 60 artistas para gerenciar sua carreira",
    icon: Rocket,
    path: "https://backstagepro.online/landing",
    accent: "from-primary to-primary/80",
    external: true,
    featured: true,
  },
];

export default function KitProfissional() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleClick = (card: typeof cards[0]) => {
    if (card.external) {
      window.location.href = card.path;
    } else {
      navigate(card.path);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <Gift className="w-4 h-4" />
            Conteúdo gratuito
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            Kit Profissional
            <br />
            <span className="gradient-text">do Cantor</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Preparei isso para você começar a se profissionalizar hoje — mesmo sem pagar nada
          </p>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            const isHovered = hoveredCard === card.id;

            return (
              <button
                key={card.id}
                onClick={() => handleClick(card)}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={cn(
                  "group relative rounded-2xl border text-left overflow-hidden transition-all duration-300",
                  "bg-card hover:shadow-xl",
                  card.featured
                    ? "sm:col-span-2 border-primary/30 shadow-lg shadow-primary/10"
                    : "border-border hover:border-primary/30",
                  isHovered && "scale-[1.02]"
                )}
              >
                {/* Gradient accent top */}
                <div className={cn("h-1.5 w-full bg-gradient-to-r", card.accent)} />

                <div className={cn("p-6 sm:p-8", card.featured && "sm:flex sm:items-center sm:gap-8")}>
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 transition-transform duration-300",
                      card.accent,
                      card.featured && "sm:mb-0 sm:w-20 sm:h-20 sm:rounded-3xl",
                      isHovered && "scale-110"
                    )}
                  >
                    <Icon className={cn("w-7 h-7 text-white", card.featured && "sm:w-10 sm:h-10")} />
                  </div>

                  <div className="flex-1">
                    <h3
                      className={cn(
                        "font-bold text-foreground mb-2",
                        card.featured ? "text-xl sm:text-2xl" : "text-lg"
                      )}
                    >
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
                      {card.description}
                    </p>

                    <div
                      className={cn(
                        "inline-flex items-center gap-2 text-sm font-semibold transition-colors",
                        card.featured ? "text-primary" : "text-primary/80 group-hover:text-primary"
                      )}
                    >
                      {card.featured ? "Começar agora" : "Acessar"}
                      {card.external ? (
                        <ExternalLink className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
