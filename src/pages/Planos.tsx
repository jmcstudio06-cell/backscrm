import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Inicial",
    description: "Para quem está começando",
    price: "R$ 39,90",
    installments: "apenas",
    period: "por mês",
    icon: Zap,
    highlight: null,
    styles: {
      card: "bg-white border border-border",
      icon: "bg-blue-100 text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    features: [
      { name: "Dashboard", included: true },
      { name: "Agenda de Shows", included: true },
      { name: "Funil de Vendas", included: true },
      { name: "Clientes", included: true },
      { name: "Orçamento Automático", included: true },

      { name: "Contrato Automático", included: false },
      { name: "Resumo Financeiro do Mês", included: false },
      { name: "Checklist de Show", included: false },
      { name: "Equipe e Freelancers", included: false },
      { name: "Metas", included: false },
      { name: "Suporte via WhatsApp", included: false },
      { name: "Apoio de Conhecimentos", included: false },
      { name: "Leads Qualificados para Contratação", included: false },
      { name: "Histórico Mensal Financeiro", included: false },
    ],
  },
  {
    name: "Essencial",
    description: "Para profissionais",
    price: "R$ 21,90",
    installments: "6x de",
    period: "por 6 meses",
    icon: Star,
    highlight: "MAIS POPULAR",
    styles: {
      card: "bg-gradient-to-b from-blue-100 to-purple-100 border-2 border-blue-400 scale-105 shadow-xl",
      icon: "bg-gradient-to-br from-blue-500 to-purple-500 text-white",
      button: "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white",
    },
    features: [
      { name: "Dashboard", included: true },
      { name: "Agenda de Shows", included: true },
      { name: "Funil de Vendas", included: true },
      { name: "Clientes", included: true },
      { name: "Orçamento Automático", included: true },
      { name: "Contrato Automático", included: true },
      { name: "Resumo Financeiro do Mês", included: true },
      { name: "Checklist de Show", included: true },
      { name: "Equipe e Freelancers", included: true },
      { name: "Metas", included: true },

      { name: "Suporte via WhatsApp", included: false },
      { name: "Apoio de Conhecimentos", included: false },
      { name: "Leads Qualificados para Contratação", included: false },
      { name: "Histórico Mensal Financeiro", included: false },
    ],
  },
  {
    name: "Completo",
    description: "Melhor custo-benefício",
    price: "R$ 15,90",
    installments: "12x de",
    period: "por 12 meses",
    icon: Crown,
    highlight: "MELHOR CUSTO",
    styles: {
      card: "bg-white border border-border",
      icon: "bg-orange-100 text-orange-600",
      button: "bg-orange-500 hover:bg-orange-600 text-white",
    },
    features: [
      { name: "Dashboard", included: true },
      { name: "Agenda de Shows", included: true },
      { name: "Funil de Vendas", included: true },
      { name: "Clientes", included: true },
      { name: "Orçamento Automático", included: true },
      { name: "Contrato Automático", included: true },
      { name: "Resumo Financeiro do Mês", included: true },
      { name: "Checklist de Show", included: true },
      { name: "Equipe e Freelancers", included: true },
      { name: "Metas", included: true },
      { name: "Suporte via WhatsApp", included: true },
      { name: "Apoio de Conhecimentos", included: true },

      { name: "Leads Qualificados para Contratação", included: false },
      { name: "Histórico Mensal Financeiro", included: false },
    ],
  },
];

export default function Planos() {
  return (
    <Layout title="Planos" subtitle="Escolha o plano ideal para sua carreira musical">
      <div className="mt-16 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div key={plan.name} className={cn("relative rounded-3xl p-8 flex flex-col", plan.styles.card)}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge
                      className={cn(
                        "px-4 py-1 text-xs font-semibold text-white",
                        plan.highlight === "MAIS POPULAR"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600"
                          : "bg-orange-500",
                      )}
                    >
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
                  <div className="text-xs text-muted-foreground mb-1">{plan.installments}</div>

                  <div className="text-4xl font-bold">{plan.price}</div>

                  <div className="text-sm text-muted-foreground">{plan.period}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={cn("text-sm", feature.included ? "text-foreground" : "text-muted-foreground")}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn("mt-auto w-full", plan.styles.button)}
                  onClick={() =>
                    window.open("https://loja.infinitepay.io/backstagegroup?categories=1311210-backstage-pro", "_blank")
                  }
                >
                  Escolher Plano
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
