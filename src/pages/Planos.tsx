import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Star, Crown, Shield, HeadphonesIcon, XCircle, Quote, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTrialStatus } from "@/hooks/useTrialStatus";

const testimonials = [
  {
    name: "Paula Seven",
    role: "Cantora, São Paulo",
    text: "Parei de perder orçamentos e fechei 3x mais shows no primeiro mês.",
  },
  {
    name: "Japa Produções",
    role: "Produtor Musical, Rio de Janeiro",
    text: "Finalmente tenho controle real da minha carreira. É como ter um empresário digital.",
  },
  {
    name: "Banda Trago",
    role: "Banda de Rock, Belo Horizonte",
    text: "A gente achava que era organizado. Depois do Backstage, vimos que não era.",
  },
];

const plans = [
  {
    name: "Essencial",
    tagline: "Para quem está começando a profissionalizar",
    description: "1 mês de acesso",
    originalPrice: "R$ 79,90",
    price: "R$ 49,90",
    period: "/mês",
    totalPrice: "R$ 49,90",
    icon: Zap,
    highlight: null,
    support: "Suporte por chat",
    cta: "Quero começar agora",
    features: [
      "Agenda de shows organizada",
      "Orçamentos automáticos",
      "Contratos prontos para enviar",
      "Histórico de clientes",
      "Visão financeira completa",
    ],
    styles: {
      card: "bg-card border border-border hover:border-primary/30 hover:shadow-lg",
      icon: "bg-primary/10 text-primary",
      button: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
  },
  {
    name: "Profissional",
    tagline: "Para artistas que já fazem shows regularmente",
    description: "3 meses de acesso",
    originalPrice: "R$ 69,90",
    price: "R$ 39,90",
    period: "/mês",
    totalPrice: "R$ 119,70",
    icon: Star,
    highlight: "MAIS ESCOLHIDO",
    support: "Suporte prioritário + 1 consultoria",
    cta: "Quero crescer agora",
    features: [
      "Tudo do plano Essencial",
      "1 consultoria estratégica",
      "Economia de R$ 90,00",
      "Funil de vendas completo",
      "Metas e acompanhamento",
    ],
    styles: {
      card: "bg-gradient-to-b from-primary/5 to-primary/10 border-2 border-primary scale-[1.02] shadow-xl ring-1 ring-primary/20",
      icon: "bg-gradient-to-br from-primary to-blue-600 text-white",
      button: "bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white shadow-lg",
    },
  },
  {
    name: "Avançado",
    tagline: "Para quem quer dominar o mercado",
    description: "6 meses de acesso",
    originalPrice: "R$ 49,90",
    price: "R$ 29,90",
    period: "/mês",
    totalPrice: "R$ 179,40",
    icon: Crown,
    highlight: "MELHOR VALOR",
    support: "Suporte VIP + 3 consultorias",
    cta: "Quero ser referência",
    features: [
      "Tudo do plano Profissional",
      "3 consultorias estratégicas",
      "Economia de R$ 120,00",
      "Acompanhamento de metas",
      "Acesso antecipado a novidades",
    ],
    styles: {
      card: "bg-card border border-border hover:border-amber-500/30 hover:shadow-lg",
      icon: "bg-gradient-to-br from-amber-500 to-orange-500 text-white",
      button: "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white",
    },
  },
];

const reassurances = [
  { icon: Shield, text: "Pagamento 100% seguro" },
  { icon: XCircle, text: "Cancele quando quiser" },
  { icon: HeadphonesIcon, text: "Suporte humano real" },
];

export default function Planos() {
  const { daysRemaining, isTrial } = useTrialStatus();

  return (
    <Layout
      title=""
      subtitle=""
    >
      <div className="pt-4">
        {/* Urgency Banner */}
        {isTrial && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 max-w-3xl mx-auto mb-8 shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-base md:text-lg">
                  {daysRemaining <= 1 
                    ? "Último dia para garantir esses preços!" 
                    : `Restam ${daysRemaining} dias para garantir esses preços!`}
                </p>
                <p className="text-white/90 text-sm">
                  Oferta exclusiva do período de teste. Após isso, os valores serão reajustados.
                </p>
              </div>
              <div className="bg-white/20 rounded-full p-2">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            Chega de perder shows por falta de organização
          </h1>
          <p className="text-lg text-muted-foreground">
            O Backstage Pro é a plataforma que ajuda artistas independentes a{" "}
            <span className="text-foreground font-medium">vender mais shows</span>,{" "}
            <span className="text-foreground font-medium">centralizar tudo em um só lugar</span> e{" "}
            <span className="text-foreground font-medium">tratar a carreira como negócio</span>.
          </p>
        </div>

        {/* Social Proof */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-muted/50 rounded-xl p-4 border border-border"
            >
              <Quote className="w-5 h-5 text-primary/60 mb-2" />
              <p className="text-sm text-muted-foreground mb-3 italic">
                "{testimonial.text}"
              </p>
              <div>
                <p className="text-sm font-semibold">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.description}
                className={cn(
                  "relative rounded-2xl p-6 flex flex-col transition-all duration-300",
                  plan.styles.card
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-primary to-blue-600 shadow-md">
                      {plan.highlight}
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-5">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
                      plan.styles.icon
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.tagline}</p>
                </div>

                <div className="text-center mb-5">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-sm text-muted-foreground line-through">
                      {plan.originalPrice}
                    </span>
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                      OFERTA
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plan.description} • Total: {plan.totalPrice}
                  </p>
                </div>

                <ul className="space-y-2.5 mb-5 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-muted-foreground text-center mb-4">
                  {plan.support}
                </p>

                <Button
                  size="lg"
                  className={cn("w-full font-semibold", plan.styles.button)}
                  onClick={() =>
                    window.open(
                      "https://loja.infinitepay.io/backstagegroup?categories=1311210-backstage-pro",
                      "_blank"
                    )
                  }
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Reassurance Section */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {reassurances.map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-muted-foreground">
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="text-center bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 max-w-3xl mx-auto border border-primary/10">
          <h3 className="text-xl font-bold mb-2">
            Ainda com dúvida?
          </h3>
          <p className="text-muted-foreground mb-4">
            Comece pelo plano Essencial e veja na prática como o Backstage Pro pode transformar sua carreira.
          </p>
          <p className="text-sm text-muted-foreground">
            Mais de <span className="font-semibold text-foreground">100 artistas</span> já usam o Backstage Pro para organizar e crescer.
          </p>
        </div>
      </div>
    </Layout>
  );
}
