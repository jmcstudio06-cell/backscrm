import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  Shield,
  HeadphonesIcon,
  XCircle,
  Quote,
  AlertTriangle,
  Sparkles,
  Briefcase,
  Crown,
  ArrowRight,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/layout/AppLogo";

/* ============================= */
/* USUÁRIOS / PROVA SOCIAL */
/* ============================= */

const TOTAL_USERS = 77;

const PLAN_USAGE: Record<string, number> = {
  starter: 18,
  pro: 34,
  full: 25,
};

/* ============================= */
/* CHECKOUT */
/* ============================= */

const INFINITEPAY_URL = "https://loja.infinitepay.io/backstagegroup?categories=1311210-backstage-pro";

const STARTER_URL = INFINITEPAY_URL;
const PRO_URL = INFINITEPAY_URL;
const FULL_URL = INFINITEPAY_URL;

/* ============================= */
/* RESTANTE DO SEU CÓDIGO */
/* ============================= */

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
    buttonText: "Começar no Starter",
    url: STARTER_URL,
    highlight: false,
    badgeText: "",
    icon: Sparkles,
    ring: "ring-1 ring-border",
    accent: "from-primary to-blue-600",
    softBg: "from-primary/10 to-transparent",
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
    ring: "ring-2 ring-blue-500/60",
    accent: "from-blue-600 to-cyan-500",
    softBg: "from-blue-500/15 to-transparent",
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
    badgeText: "TUDO LIBERADO",
    icon: Crown,
    ring: "ring-1 ring-border",
    accent: "from-amber-500 to-orange-500",
    softBg: "from-amber-500/15 to-transparent",
    features: [
      "Tudo do Profissional",
      "Metas Comerciais",
      "Meta Anual",
      "Avanços & Performance",
      "Gestão de Equipe & Freelancers",
    ],
  },
] as const;

/* ============================= */
/* COMPONENTES ORIGINAIS */
/* ============================= */

function UrgencyBanner() {
  return (
    <div className="max-w-5xl mx-auto mb-8">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-5 shadow-xl border border-red-400/30">
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
    </div>
  );
}

/* ============================= */
/* PÁGINA */
/* ============================= */

export default function Planos() {
  return (
    <Layout title="" subtitle="">
      <div className="pt-4">
        <UrgencyBanner />

        {/* HERO */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <div className="flex justify-center mb-4">
            <AppLogo size="lg" collapsed />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Organize sua carreira como uma empresa</h1>

          <p className="text-base md:text-lg text-muted-foreground">
            Menos improviso. Mais controle. Escolha um plano e comece hoje.
          </p>

          {/* CONTADOR TOTAL */}
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-primary font-medium">
            <Users className="w-4 h-4" />
            {TOTAL_USERS} artistas já utilizam a plataforma
          </div>
        </div>

        {/* PLANS */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {plans.map((p) => {
              const usage = PLAN_USAGE[p.id];

              return (
                <Card key={p.id} className="relative h-full rounded-2xl border bg-background shadow-sm">
                  <CardContent className="p-6 flex flex-col h-full">
                    <h3 className="text-xl font-bold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{p.subtitle}</p>

                    <div className="text-4xl font-bold">
                      {p.price}
                      <span className="text-sm text-muted-foreground ml-1">{p.period}</span>
                    </div>

                    {/* PROVA SOCIAL POR PLANO */}
                    <div className="flex items-center gap-2 mt-3 text-sm text-primary">
                      <Users className="w-4 h-4" />
                      {usage} artistas usam este plano
                    </div>

                    <div className="mt-6 space-y-2">
                      {p.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{f}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      <Button className="w-full" onClick={() => window.open(p.url, "_blank")}>
                        {p.buttonText}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
