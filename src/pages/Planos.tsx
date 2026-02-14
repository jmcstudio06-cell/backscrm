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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/layout/AppLogo";

const INFINITEPAY_URL = "https://loja.infinitepay.io/backstagegroup?categories=1311210-backstage-pro";

const STARTER_URL = INFINITEPAY_URL;
const PRO_URL = INFINITEPAY_URL;
const FULL_URL = INFINITEPAY_URL;

/* ===============================
   SOCIAL PROOF
================================= */

const TOTAL_USERS = 77;

const PLAN_USAGE: Record<string, number> = {
  starter: 18,
  pro: 42,
  full: 17,
};

/* =============================== */

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

/* =============================== */

export default function Planos() {
  return (
    <Layout title="" subtitle="">
      <div className="pt-4">
        <div className="text-center max-w-4xl mx-auto mb-10">
          <div className="flex justify-center mb-4">
            <AppLogo size="lg" collapsed />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Organize sua carreira como uma empresa</h1>

          <p className="text-base md:text-lg text-muted-foreground">
            Menos improviso. Mais controle. Escolha um plano e comece hoje.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Agenda + clientes + financeiro
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Área comercial completa
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Planejamento e performance
            </Badge>
          </div>

          {/* TOTAL USERS */}
          <p className="mt-4 text-sm font-semibold text-primary">
            🎤 {TOTAL_USERS} artistas já organizam sua carreira com o Backstage Pro
          </p>
        </div>

        {/* PLANS */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {plans.map((p) => {
              const Icon = p.icon;

              return (
                <Card
                  key={p.id}
                  className={cn(
                    "relative h-full overflow-hidden rounded-2xl border bg-background shadow-sm transition-all duration-300 hover:shadow-lg",
                    p.ring,
                    p.highlight ? "scale-[1.01]" : "",
                  )}
                >
                  <div className={cn("absolute inset-x-0 top-0 h-40 bg-gradient-to-b", p.softBg)} />

                  {p.badgeText ? (
                    <div className="absolute top-4 right-4">
                      <Badge
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-bold text-white",
                          p.highlight ? "bg-blue-600" : "bg-amber-600",
                        )}
                      >
                        {p.badgeText}
                      </Badge>
                    </div>
                  ) : null}

                  <CardContent className="relative p-6 h-full flex flex-col">
                    <div className="flex items-start gap-3 mb-4">
                      <AppLogo size="sm" collapsed />
                      <div>
                        <h3 className="text-xl font-bold">{p.name}</h3>
                        <p className="text-sm text-muted-foreground">{p.subtitle}</p>
                      </div>
                    </div>

                    {/* PRICE */}
                    <div className="mb-3">
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{p.price}</span>
                        <span className="text-sm text-muted-foreground mb-1">{p.period}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cobrança mensal pré-paga. Cancele quando quiser.
                      </p>
                    </div>

                    {/* SOCIAL PROOF */}
                    <div className="mb-4">
                      <p className={cn("text-xs font-semibold", p.highlight ? "text-blue-600" : "text-primary")}>
                        {p.highlight ? "🔥" : "🎤"} {PLAN_USAGE[p.id]} artistas usam esse plano
                      </p>
                    </div>

                    {/* FEATURES */}
                    <div className="rounded-xl border border-border bg-muted/25 p-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-3">O que inclui:</p>
                      <ul className="space-y-2">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto pt-5">
                      <Button
                        size="lg"
                        className={cn(
                          "w-full rounded-xl shadow-sm",
                          p.highlight
                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white"
                            : "bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white",
                        )}
                        onClick={() => window.open(p.url, "_blank")}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {p.buttonText}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </Button>

                      <p className="text-[11px] text-muted-foreground mt-2 text-center">
                        {p.highlight
                          ? "Recomendado para quem quer fechar mais shows."
                          : "Ideal para o seu momento atual."}
                      </p>
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
