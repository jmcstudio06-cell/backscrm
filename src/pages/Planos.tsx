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

export default function Planos() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      subtitle: "O plano ideal para começar, se organizar e ter controle da carreira artística.",
      price: "R$ 19,90",
      period: "/mês",
      buttonText: "Começar no Starter",
      url: STARTER_URL,
      badgeText: "",
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
      badgeText: "MAIS POPULAR",
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
      badgeText: "TUDO LIBERADO",
      socialProof: "21 artistas estão nesse plano!",
      features: ["Tudo do Profissional+", "Contratos", "Histórico", "Mapeamento de Palco", "Metas", "Equipe"],
    },
  ] as const;

  return (
    <Layout title="" subtitle="">
      <div className="pt-8 pb-16">
        {/* TOGGLE MENSAL / ANUAL */}
        <div className="flex justify-center mb-12">
          <div className="bg-muted p-1 rounded-2xl flex gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-semibold transition-all",
                billing === "monthly" ? "bg-white shadow-md" : "text-muted-foreground",
              )}
            >
              Mensal
            </button>

            <button
              onClick={() => setBilling("yearly")}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-semibold transition-all",
                billing === "yearly" ? "bg-white shadow-md" : "text-muted-foreground",
              )}
            >
              Anual 🔥
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p) => {
              const isFull = p.id === "full";
              const isYearly = isFull && billing === "yearly";

              const finalPrice = isYearly ? "R$ 34,90" : p.price;
              const finalPeriod = isYearly ? "/mês" : p.period;
              const finalUrl = isYearly ? FULL_YEARLY_URL : p.url;

              return (
                <Card
                  key={p.id}
                  className={cn(
                    "relative rounded-3xl border shadow-xl transition-all duration-300 h-full flex flex-col",
                    isYearly
                      ? "border-amber-500 bg-gradient-to-br from-amber-50 via-white to-orange-50"
                      : "border-border bg-white",
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
                    <div className="mb-6">
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{finalPrice}</span>
                        <span className="text-sm text-muted-foreground mb-1 font-medium">{finalPeriod}</span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {isYearly
                          ? "Cobrança anual de R$ 418,80. Economize R$ 180 por ano."
                          : "Cobrança mensal pré-paga. Cancele quando quiser."}
                      </p>
                    </div>

                    <div className="mt-auto">
                      <Button
                        size="lg"
                        className="w-full rounded-2xl text-white font-semibold shadow-md bg-gradient-to-r from-primary to-blue-600"
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
