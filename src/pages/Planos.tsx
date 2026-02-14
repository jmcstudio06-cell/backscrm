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
  ArrowRight,
  Users,
  Sparkles,
  Briefcase,
  Crown,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/layout/AppLogo";

/* ============================= */
/* CONFIG USUÁRIOS               */
/* ============================= */

const TOTAL_USERS = 77;

const PLAN_USAGE = {
  starter: 18,
  pro: 34,
  full: 25,
};

/* ============================= */
/* LINKS                         */
/* ============================= */

const INFINITEPAY_URL = "https://loja.infinitepay.io/backstagegroup?categories=1311210-backstage-pro";

const STARTER_URL = INFINITEPAY_URL;
const PRO_URL = INFINITEPAY_URL;
const FULL_URL = INFINITEPAY_URL;

/* ============================= */
/* DEPOIMENTOS                   */
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

/* ============================= */
/* GARANTIAS                     */
/* ============================= */

const reassurances = [
  { icon: Shield, text: "Pagamento 100% seguro" },
  { icon: XCircle, text: "Cancele quando quiser" },
  { icon: HeadphonesIcon, text: "Suporte humano real" },
];

/* ============================= */
/* PLANOS                        */
/* ============================= */

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
    accent: "blue",
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
    accent: "blue",
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
    accent: "gold",
    features: [
      "Tudo do Profissional",
      "Metas Comerciais",
      "Meta Anual",
      "Avanços & Performance",
      "Gestão de Equipe & Freelancers",
    ],
  },
];

/* ============================= */
/* COMPONENTES                   */
/* ============================= */

function UrgencyBanner() {
  return (
    <div className="max-w-5xl mx-auto mb-8">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-center gap-3">
          <AlertTriangle className="w-5 h-5 text-white" />
          <div className="text-center">
            <p className="text-white font-bold">Oferta por tempo limitado</p>
            <p className="text-white/90 text-sm">Os valores podem voltar ao normal sem aviso prévio.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================= */
/* PAGE                          */
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

          <h1 className="text-3xl md:text-4xl font-bold mb-3">Organize sua carreira como uma empresa</h1>

          <p className="text-muted-foreground">Menos improviso. Mais controle. Escolha um plano e comece hoje.</p>

          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {TOTAL_USERS} artistas já utilizam a plataforma
          </div>
        </div>

        {/* PLANOS */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const usage = PLAN_USAGE[p.id];

            const isPro = p.id === "pro";
            const isFull = p.id === "full";

            return (
              <Card
                key={p.id}
                className={cn(
                  "relative rounded-3xl border transition-all duration-300 hover:shadow-2xl",
                  isPro && "border-blue-500 shadow-xl scale-[1.02]",
                  isFull && "border-amber-500 shadow-lg",
                  !isPro && !isFull && "border-border shadow-sm",
                )}
              >
                {p.badgeText && (
                  <div className="absolute top-5 right-5">
                    <Badge
                      className={cn(
                        "px-4 py-1 rounded-full text-xs font-semibold shadow",
                        isFull ? "bg-amber-500 text-white" : "bg-blue-600 text-white",
                      )}
                    >
                      {p.badgeText}
                    </Badge>
                  </div>
                )}

                <CardContent className="p-8 flex flex-col h-full">
                  <h3 className="text-2xl font-bold mb-1">{p.name}</h3>

                  <p className="text-sm text-muted-foreground mb-4">{p.subtitle}</p>

                  <div className="text-4xl font-bold">
                    {p.price}
                    <span className="text-base font-normal text-muted-foreground ml-1">{p.period}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">Cobrança mensal pré-paga. Cancele quando quiser.</p>

                  {/* PROVA SOCIAL */}
                  <div
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium mt-4 mb-6",
                      isFull ? "text-amber-600" : "text-blue-600",
                    )}
                  >
                    <Users className="w-4 h-4" />
                    {usage} artistas usam este plano
                  </div>

                  {/* FEATURES BOX */}
                  <div className="bg-muted/40 rounded-2xl p-5 border mb-8">
                    <p className="text-sm font-semibold mb-4">O que inclui:</p>

                    <div className="space-y-3">
                      {p.features.map((f, i) => (
                        <div key={i} className="flex gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-1" />
                          <span className="text-sm">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className={cn(
                      "w-full rounded-xl font-semibold shadow-md",
                      isFull
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        : "bg-gradient-to-r from-blue-600 to-cyan-500 text-white",
                    )}
                    onClick={() => window.open(p.url, "_blank")}
                  >
                    {p.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* DEPOIMENTOS */}
        <div className="max-w-6xl mx-auto mt-14">
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-muted/40 rounded-2xl p-6 border shadow-sm">
                <Quote className="w-5 h-5 text-primary/60 mb-3" />
                <p className="text-sm italic mb-4">"{t.text}"</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>

                  <UserCircle2 className="w-8 h-8 text-muted-foreground/50" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GARANTIAS */}
        <div className="max-w-6xl mx-auto mt-10 mb-6 flex flex-wrap justify-center gap-6 rounded-2xl border bg-muted/30 p-4">
          {reassurances.map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
