import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Shield, HeadphonesIcon, XCircle, Quote, AlertTriangle, Sparkles, Briefcase, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/layout/AppLogo";

/**
 * Troque por URLs diferentes quando você tiver o checkout separado por plano.
 * Por enquanto, deixei os 3 iguais pro código funcionar já.
 */
const INFINITEPAY_URL = "https://loja.infinitepay.io/backstagegroup?categories=1311210-backstage-pro";

const STARTER_URL = INFINITEPAY_URL;
const PRO_URL = INFINITEPAY_URL;
const FULL_URL = INFINITEPAY_URL;

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

const reassurances = [
  { icon: Shield, text: "Pagamento 100% seguro" },
  { icon: XCircle, text: "Cancele quando quiser" },
  { icon: HeadphonesIcon, text: "Suporte humano real" },
];

const plans = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "Para começar e parar de se perder",
    price: "R$ 19,90",
    period: "/mês",
    buttonText: "Começar agora",
    url: STARTER_URL,
    highlight: false,
    badgeText: "",
    icon: Sparkles,
    headerGradient: "from-primary/10 to-primary/5",
    iconGradient: "from-primary to-blue-600",
    features: [
      "Dashboard completo",
      "Agenda de Shows",
      "Gestão de Clientes",
      "Financeiro básico (Resumo Geral)",
      "Repertório",
      "Tutoriais e Configurações",
    ],
  },
  {
    id: "pro",
    name: "Profissional",
    subtitle: "O plano ideal para quem quer vender mais shows",
    price: "R$ 34,90",
    period: "/mês",
    buttonText: "Escolher Profissional",
    url: PRO_URL,
    highlight: true,
    badgeText: "MAIS POPULAR",
    icon: Briefcase,
    headerGradient: "from-blue-500/15 to-cyan-500/10",
    iconGradient: "from-blue-500 to-cyan-500",
    features: [
      "Tudo do Starter",
      "Funil de Vendas (CRM)",
      "Orçamento Automático",
      "Contrato Automático",
      "Histórico Mensal Financeiro",
      "Checklist de Show",
      "Mapeamento de Palco",
      "Precificação",
    ],
  },
  {
    id: "full",
    name: "Completo",
    subtitle: "Controle total da carreira, como uma empresa",
    price: "R$ 49,99",
    period: "/mês",
    buttonText: "Escolher Completo",
    url: FULL_URL,
    highlight: false,
    badgeText: "",
    icon: Crown,
    headerGradient: "from-amber-500/15 to-orange-500/10",
    iconGradient: "from-amber-500 to-orange-500",
    features: [
      "Tudo do Profissional",
      "Metas Comerciais",
      "Meta Anual",
      "Avanços & Performance",
      "Gestão de Equipe & Freelancers",
    ],
  },
] as const;

function UrgencyBanner() {
  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-5 max-w-3xl mx-auto mb-8 shadow-xl border border-red-400/30">
      <div className="flex items-center gap-3 justify-center">
        <div className="bg-white/20 rounded-full p-2.5 animate-pulse">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-lg">Oferta por tempo limitado</p>
          <p className="text-white/90 text-sm">Os valores podem voltar ao normal sem aviso prévio.</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
      {testimonials.map((t) => (
        <div key={t.name} className="bg-muted/50 rounded-xl p-4 border border-border">
          <Quote className="w-5 h-5 text-primary/60 mb-2" />
          <p className="text-sm italic mb-3">"{t.text}"</p>
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.role}</p>
        </div>
      ))}
    </div>
  );
}

function ReassurancesBar() {
  return (
    <div className="flex flex-wrap justify-center gap-6 mb-8">
      {reassurances.map((item) => (
        <div key={item.text} className="flex items-center gap-2">
          <item.icon className="w-4 h-4" />
          <span className="text-sm">{item.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function Planos() {
  return (
    <Layout title="" subtitle="">
      <div className="pt-4">
        <UrgencyBanner />

        {/* Logo + Hero */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="flex justify-center mb-4">
            <AppLogo size="lg" collapsed />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Pare de perder tempo e dinheiro com desorganização</h1>
          <p className="text-lg text-muted-foreground">
            Escolha um plano e organize sua carreira musical como{" "}
            <span className="text-foreground font-medium">uma empresa</span>.
          </p>
        </div>

        {/* Planos */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Planos</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Comece no Starter e evolua conforme sua carreira cresce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10 items-stretch">
            {plans.map((p) => {
              const Icon = p.icon;

              return (
                <Card
                  key={p.id}
                  className={cn(
                    "border h-full transition-all duration-300",
                    p.highlight ? "border-blue-400 shadow-lg" : "hover:shadow-lg",
                  )}
                >
                  <CardContent className="p-5 h-full flex flex-col">
                    {/* Topo */}
                    <div className={cn("rounded-xl p-4 border bg-gradient-to-b", p.headerGradient)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br text-white",
                              p.iconGradient,
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold leading-tight">{p.name}</h3>
                            <p className="text-xs text-muted-foreground">{p.subtitle}</p>
                          </div>
                        </div>

                        {p.badgeText ? (
                          <Badge className="text-xs font-bold bg-blue-600 text-white">{p.badgeText}</Badge>
                        ) : null}
                      </div>

                      <div className="mt-4">
                        <span className="text-3xl font-bold">{p.price}</span>
                        <span className="text-sm text-muted-foreground">{p.period}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mt-4">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Rodapé alinhado */}
                    <div className="mt-auto pt-4">
                      <Button
                        size="lg"
                        className={cn(
                          "w-full shadow-sm",
                          p.highlight
                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white"
                            : "bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white",
                        )}
                        onClick={() => window.open(p.url, "_blank")}
                      >
                        {p.buttonText}
                      </Button>

                      <p className="text-[11px] text-muted-foreground mt-2 text-center">
                        Cobrança mensal pré-paga. Cancele quando quiser.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <TestimonialsSection />
        <ReassurancesBar />
      </div>
    </Layout>
  );
}
