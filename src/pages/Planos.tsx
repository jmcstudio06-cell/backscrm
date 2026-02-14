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
  Music2,
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
/* CHECKOUT LINKS                 */
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
    color: "blue",
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
    color: "indigo",
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
    color: "gold",
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
/* COMPONENTES                   */
/* ============================= */

function UrgencyBanner() {
  return (
    <div className="max-w-5xl mx-auto mb-10">
      <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3 justify-center">
          <AlertTriangle className="w-6 h-6 text-white" />
          <div className="text-center">
            <p className="text-white font-bold text-lg">Oferta por tempo limitado</p>
            <p className="text-white/90 text-sm">Os valores podem voltar ao normal sem aviso prévio.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  return (
    <div className="max-w-6xl mx-auto mt-16">
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold">Quem usa, sente a diferença</h3>
        <p className="text-muted-foreground">Feedback real de artistas e produtores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="rounded-2xl p-6 border bg-background shadow-md hover:shadow-xl transition">
            <Quote className="w-6 h-6 text-primary mb-3" />

            <p className="text-sm italic mb-6">"{t.text}"</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReassurancesBar() {
  return (
    <div className="max-w-6xl mx-auto mt-16">
      <div className="flex flex-wrap justify-center gap-6 rounded-2xl border bg-muted/30 p-5">
        {reassurances.map((item) => (
          <div key={item.text} className="flex items-center gap-2">
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.text}</span>
          </div>
        ))}
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
      <div className="pt-6">
        <UrgencyBanner />

        {/* HERO */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <AppLogo size="lg" collapsed />
          <h1 className="text-4xl font-bold mt-6 mb-4">Organize sua carreira como uma empresa</h1>
          <p className="text-muted-foreground">Menos improviso. Mais controle. Escolha um plano e comece hoje.</p>

          <div className="flex justify-center items-center gap-2 mt-4 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {TOTAL_USERS} artistas já utilizam a plataforma
          </div>
        </div>

        {/* PLANS */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {plans.map((p) => {
            const usage = PLAN_USAGE[p.id];

            const isFull = p.id === "full";

            return (
              <Card
                key={p.id}
                className={cn(
                  "rounded-3xl border shadow-lg hover:shadow-2xl transition-all duration-300",
                  isFull ? "border-amber-400 bg-gradient-to-b from-amber-50/60 to-background" : "bg-background",
                )}
              >
                <CardContent className="p-8 flex flex-col h-full">
                  <h3 className="text-2xl font-bold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{p.subtitle}</p>

                  <div className="text-4xl font-bold mb-2">
                    {p.price}
                    <span className="text-sm text-muted-foreground ml-1">{p.period}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-primary mb-6">
                    <Users className="w-4 h-4" />
                    {usage} artistas usam este plano
                  </div>

                  <div className="space-y-3 mb-8">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <Check className="w-4 h-4 text-green-500 mt-1" />
                        <span className="text-sm">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto">
                    <Button
                      className={cn("w-full rounded-xl", isFull ? "bg-amber-500 hover:bg-amber-600 text-white" : "")}
                      onClick={() => window.open(p.url, "_blank")}
                    >
                      {p.buttonText}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <TestimonialsSection />
        <ReassurancesBar />
      </div>
    </Layout>
  );
}
