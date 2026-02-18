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
const FULL_YEARLY_URL = "https://invoice.infinitepay.io/plans/backstagegroup/CZrFywU7b";

/* 🔥 ADICIONADO */
const STARTER_YEARLY_URL = "https://invoice.infinitepay.io/plans/backstagegroup/jHWwPyTRH";
const PRO_YEARLY_URL = "https://invoice.infinitepay.io/plans/backstagegroup/62KukbQ1H";

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

export default function Planos() {
  const [isYearly, setIsYearly] = useState(false); // 🔥 ADICIONADO

  return (
    <Layout title="" subtitle="">
      <div className="pt-8 pb-16">
        {/* 🔥 TOGGLE GLOBAL ADICIONADO */}
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
              /* 🔥 LÓGICA ADICIONADA */
              let finalPrice = p.price;
              let finalUrl = p.url;
              let finalPeriod = p.period;

              if (isYearly) {
                if (p.id === "starter") {
                  finalPrice = "R$ 199,90";
                  finalUrl = STARTER_YEARLY_URL;
                  finalPeriod = "/ano";
                }
                if (p.id === "pro") {
                  finalPrice = "R$ 298,80";
                  finalUrl = PRO_YEARLY_URL;
                  finalPeriod = "/ano";
                }
                if (p.id === "full") {
                  finalPrice = "R$ 418,80";
                  finalUrl = FULL_YEARLY_URL;
                  finalPeriod = "/ano";
                }
              }

              return (
                <Card
                  key={p.id}
                  className={cn(
                    "relative rounded-3xl border shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl h-full flex flex-col",
                    p.highlight
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 via-white to-cyan-50"
                      : p.id === "full"
                        ? "border-amber-400 bg-gradient-to-br from-amber-50 via-white to-orange-50"
                        : "border-border bg-gradient-to-br from-white to-muted/20",
                  )}
                >
                  {p.badgeText && (
                    <div className="absolute top-5 right-5">
                      <Badge className="bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
                        {p.badgeText}
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center">
                        <AppLogo size="sm" collapsed />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{p.name}</h3>
                        <p className="text-sm text-muted-foreground font-medium">{p.subtitle}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      {p.id === "starter" && (
                        <p className="text-sm text-red-600 line-through mb-1 font-semibold">R$ 24,90</p>
                      )}

                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{finalPrice}</span>
                        <span className="text-sm text-muted-foreground mb-1 font-medium">{finalPeriod}</span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {isYearly ? "Cobrança anual." : "Cobrança mensal pré-paga. Cancele quando quiser."}
                      </p>
                    </div>

                    <div className="mt-auto">
                      <Button
                        size="lg"
                        className={cn(
                          "w-full rounded-2xl text-white font-semibold shadow-md",
                          p.highlight
                            ? "bg-gradient-to-r from-blue-600 to-cyan-500"
                            : "bg-gradient-to-r from-primary to-blue-600",
                        )}
                        onClick={() => window.open(finalUrl, "_blank")}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {p.buttonText}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </Button>

                      <p className="text-xs text-center text-muted-foreground mt-3 font-medium">{p.socialProof}</p>
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
