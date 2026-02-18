import { useState } from "react";
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

const STARTER_URL = "https://invoice.infinitepay.io/plans/backstagegroup/7HAAjraSOn";
const PRO_URL = "https://invoice.infinitepay.io/plans/backstagegroup/o81tUzQqP";
const FULL_URL = "https://invoice.infinitepay.io/plans/backstagegroup/j7EFHeAeZ";

const STARTER_YEARLY_URL = "https://invoice.infinitepay.io/plans/backstagegroup/jHWwPyTRH";
const PRO_YEARLY_URL = "https://invoice.infinitepay.io/plans/backstagegroup/62KukbQ1H";
const FULL_YEARLY_URL = "https://invoice.infinitepay.io/plans/backstagegroup/CZrFywU7b";

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
    subtitle: "O plano ideal para começar, se organizar e ter controle da carreira artística.",
    price: "R$ 19,90",
    oldPrice: "R$ 24,90",
    period: "/mês",
    buttonText: "Começar no Starter",
    url: STARTER_URL,
    highlight: false,
    badgeText: "",
    icon: Sparkles,
    socialProof: "19 Artistas estão nesse plano!",
    features: ["Dashboard", "Agenda", "Clientes", "Financeiro", "Repertório", "Tutoriais", "Configurações"],
  },
  {
    id: "pro",
    name: "Profissional",
    subtitle: "Organize sua área comercial e feche mais shows com processos profissionais.",
    price: "R$ 34,90",
    period: "/mês",
    buttonText: "Escolher Profissional",
    url: PRO_URL,
    highlight: true,
    badgeText: "MAIS POPULAR",
    icon: Briefcase,
    socialProof: "47 artistas estão nesse plano!",
    features: ["Tudo do Starter+", "Funil de Vendas", "Orçamentos", "Bonûs", "Checklist", "Avanços", "Precificação"],
  },
  {
    id: "full",
    name: "Completo",
    subtitle: "Controle total da carreira, com metas, performance e gestão completa do seu negócio.",
    price: "R$ 49,99",
    period: "/mês",
    buttonText: "Escolher Completo",
    url: FULL_URL,
    highlight: false,
    badgeText: "TUDO LIBERADO",
    icon: Crown,
    socialProof: "21 artistas estão nesse plano!",
    features: ["Tudo do Profissional+", "Contratos", "Histórico", "Mapeamento de Palco", "Metas", "Equipe"],
  },
] as const;

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
            <p className="text-white/90 text-sm font-medium">Os valores podem voltar ao normal sem aviso prévio.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Planos() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <Layout title="" subtitle="">
      <div className="pt-8 pb-16">
        <UrgencyBanner />

        {/* TOGGLE GLOBAL */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-muted p-1 rounded-full border">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all",
                !isYearly ? "bg-white shadow text-foreground" : "text-muted-foreground",
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all",
                isYearly ? "bg-white shadow text-foreground" : "text-muted-foreground",
              )}
            >
              Anual 🔥
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p) => {
              const finalPrice =
                p.id === "starter"
                  ? isYearly
                    ? "R$ 199,90"
                    : "R$ 19,90"
                  : p.id === "pro"
                    ? isYearly
                      ? "R$ 298,80"
                      : "R$ 34,90"
                    : isYearly
                      ? "R$ 418,80"
                      : "R$ 49,99";

              const finalUrl =
                p.id === "starter"
                  ? isYearly
                    ? STARTER_YEARLY_URL
                    : STARTER_URL
                  : p.id === "pro"
                    ? isYearly
                      ? PRO_YEARLY_URL
                      : PRO_URL
                    : isYearly
                      ? FULL_YEARLY_URL
                      : FULL_URL;

              const finalPeriod = isYearly ? "/ano" : "/mês";

              return (
                <Card key={p.id} className="relative rounded-3xl border shadow-xl h-full flex flex-col">
                  <CardContent className="p-8 flex flex-col h-full">
                    <h3 className="text-xl font-bold">{p.name}</h3>

                    <div className="mb-6 mt-4">
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{finalPrice}</span>
                        <span className="text-sm text-muted-foreground mb-1">{finalPeriod}</span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Button className="w-full rounded-2xl" onClick={() => window.open(finalUrl, "_blank")}>
                        {p.buttonText}
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
