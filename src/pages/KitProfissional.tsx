import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Gift,
  ExternalLink,
  Shield,
  User,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import kitErros from "@/assets/kit-erros.png";
import kitArtes from "@/assets/kit-artes.png";
import kitMensagens from "@/assets/kit-mensagens.png";
import kitBackstage from "@/assets/kit-backstage.png";

const LEAD_STORAGE_KEY = "kit_profissional_lead";

const cards = [
  {
    id: "erros",
    title: "Erros que fazem você perder show",
    description: "Descubra os erros mais comuns que artistas cometem e como evitá-los",
    priceFrom: "R$49,90",
    priceTo: "R$0,00",
    image: kitErros,
    path: "/guia-atendimento",
    external: false,
    requiresLead: true,
  },
  {
    id: "artes",
    title: "Artes editáveis no Canva",
    description: "Artes profissionais prontas para divulgar seus shows",
    priceFrom: "R$49,90",
    priceTo: "R$0,00",
    image: kitArtes,
    path: "/kit-profissional/artes",
    external: false,
    requiresLead: true,
  },
  {
    id: "mensagens",
    title: "Mensagens prontas para o contratante",
    description: "Copie e use mensagens profissionais para fechar mais shows",
    priceFrom: "R$19,90",
    priceTo: "R$0,00",
    image: kitMensagens,
    path: "/kit-profissional/mensagens",
    external: false,
    requiresLead: true,
  },
  {
    id: "backstage",
    title: "Backstage Pro",
    description: "O sistema que organiza sua carreira e faz você vender mais",
    badge: "Cupom especial",
    image: kitBackstage,
    path: "https://backstagepro.online/landing",
    external: true,
    requiresLead: false,
  },
];

export default function KitProfissional() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [pendingPath, setPendingPath] = useState<{ path: string; external: boolean } | null>(null);
  const [isLeadRegistered, setIsLeadRegistered] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LEAD_STORAGE_KEY);
    if (stored) setIsLeadRegistered(true);
  }, []);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleClick = (card: (typeof cards)[0]) => {
    if (card.external) {
      window.location.href = card.path;
      return;
    }

    if (card.requiresLead && !isLeadRegistered) {
      setPendingPath({ path: card.path, external: false });
      setShowLeadForm(true);
      return;
    }

    navigate(card.path);
  };

  const handleSubmitLead = async () => {
    const trimmedName = name.trim();
    const digits = phone.replace(/\D/g, "");

    if (!trimmedName || trimmedName.length < 2) {
      toast.error("Digite seu nome completo");
      return;
    }
    if (digits.length < 10 || digits.length > 11) {
      toast.error("Digite um WhatsApp válido com DDD");
      return;
    }

    setSubmitting(true);
    try {
      await supabase.from("guide_leads").insert({ name: trimmedName, phone: digits });
      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify({ name: trimmedName, phone: digits }));
      setIsLeadRegistered(true);
      setShowLeadForm(false);
      toast.success("Acesso liberado! 🎉");

      if (pendingPath) {
        if (pendingPath.external) {
          window.location.href = pendingPath.path;
        } else {
          navigate(pendingPath.path);
        }
        setPendingPath(null);
      }
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Hero */}
      <section className="relative overflow-hidden py-12 sm:py-20">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <Gift className="w-4 h-4" />
            Conteúdo gratuito
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            Kit Profissional
            <br />
            <span className="gradient-text">do Cantor</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Preparei isso para você começar a se profissionalizar hoje — mesmo sem pagar nada
          </p>
        </div>
      </section>

      {/* Netflix-style cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card) => {
            const isHovered = hoveredCard === card.id;

            return (
              <button
                key={card.id}
                onClick={() => handleClick(card)}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={cn(
                  "group relative rounded-2xl overflow-hidden text-left transition-all duration-300 bg-card border border-border flex flex-col",
                  "hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40",
                  isHovered && "scale-[1.03]"
                )}
              >
                {/* Cover image */}
                <div className="relative aspect-[3/2] overflow-hidden rounded-t-2xl">
                  <img
                    src={card.image}
                    alt={card.title}
                    className={cn(
                      "w-full h-full object-cover object-center transition-transform duration-500",
                      isHovered && "scale-110"
                    )}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-foreground text-sm sm:text-base leading-tight line-clamp-2">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2 mt-1.5">
                    {card.description}
                  </p>
                  {card.priceFrom && (
                    <p className="text-xs sm:text-sm mt-2">
                      <span className="text-muted-foreground line-through">De: {card.priceFrom}</span>
                      {" "}
                      <span className="text-green-500 font-bold">por {card.priceTo}</span>
                    </p>
                  )}
                  {card.badge && (
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                      🎟️ {card.badge}
                    </span>
                  )}
                  <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary mt-auto pt-3">
                    {card.external ? "Começar agora" : "Acessar"}
                    {card.external ? (
                      <ExternalLink className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Lead capture modal */}
      {showLeadForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-primary-foreground">Acesso Gratuito</h2>
              <p className="text-primary-foreground/80 text-sm mt-1">
                Preencha para liberar o conteúdo completo
              </p>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="kit-name" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Nome e sobrenome
                </label>
                <Input
                  id="kit-name"
                  placeholder="Ex: João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="kit-phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  WhatsApp (com DDD)
                </label>
                <Input
                  id="kit-phone"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  maxLength={15}
                  inputMode="tel"
                />
              </div>

              <Button
                className="w-full gap-2 text-base py-6"
                onClick={handleSubmitLead}
                disabled={submitting}
              >
                {submitting ? "Liberando..." : "Liberar Conteúdo"}
                <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Seus dados estão seguros. Não enviamos spam.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
