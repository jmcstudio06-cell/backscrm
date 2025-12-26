import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const commonFeatures = [
  "Centralize contratos e pedidos de show",
  "Organize agenda, valores e histórico de clientes",
  "Crie orçamentos e contratos em 1 minuto",
  "Tenha visão clara da sua carreira em um só lugar",
];

const plans = [
  {
    name: "Plano Essencial",
    description: "1 mês de acesso",
    price: "R$ 49,90",
    period: "/mês",
    icon: Zap,
    highlight: null,
    support: "Acompanhamento estratégico disponível nos planos de maior duração",
    styles: {
      card: "bg-white border border-border",
      icon: "bg-blue-100 text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  },
  {
    name: "Plano Profissional",
    description: "3 meses de acesso",
    price: "R$ 39,90",
    period: "/mês",
    icon: Star,
    highlight: "MAIS VENDIDO",
    support: "Inclui 3 acompanhamentos estratégicos remotos",
    styles: {
      card: "bg-gradient-to-b from-blue-100 to-purple-100 border-2 border-blue-400 scale-105 shadow-xl",
      icon: "bg-gradient-to-br from-blue-500 to-purple-500 text-white",
      button: "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white",
    },
  },
  {
    name: "Plano Profissional",
    description: "6 meses de acesso",
    price: "R$ 29,90",
    period: "/mês",
    icon: Star,
    highlight: "MELHOR CUSTO",
    support: "Inclui 6 acompanhamentos estratégicos remotos",
    styles: {
      card: "bg-white border border-border",
      icon: "bg-indigo-100 text-indigo-600",
      button: "bg-indigo-600 hover:bg-indigo-700 text-white",
    },
  },
];

export default function Planos() {
  return (
    <Layout
      title="Conheça nossos Planos"
      subtitle="Plataforma de gestão para artistas que querem tratar a carreira com visão profissional"
    >
      <div className="mt-16 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div key={plan.description} className={cn("relative rounded-3xl p-8 flex flex-col", plan.styles.card)}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600">
                      {plan.highlight}
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                      plan.styles.icon,
                    )}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold">
                    {plan.price}
                    <span className="text-base font-normal">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {commonFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-xs text-muted-foreground text-center mb-6">{plan.support}</p>

                <Button
                  className={cn("mt-auto w-full", plan.styles.button)}
                  onClick={() =>
                    window.open("https://loja.infinitepay.io/backstagegroup?categories=1311210-backstage-pro", "_blank")
                  }
                >
                  Escolher plano
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center mt-10 font-medium">Venda mais shows e organize sua carreira em um só lugar.</p>
      </div>
    </Layout>
  );
}
