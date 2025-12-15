import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Inicial",
    description: "Para quem está começando",
    price: "R$ 49,90",
    period: "por mês",
    icon: Zap,
    popular: false,
    highlight: null,
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
    price: "R$ 25,98",
    period: "por 6 meses",
    icon: Star,
    popular: true,
    highlight: "MAIS POPULAR",
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
    price: "R$ 19,99",
    period: "por 12 meses",
    icon: Crown,
    popular: false,
    highlight: "MELHOR CUSTO",
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;

          return (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-6 border transition-all",
                plan.popular
                  ? "bg-gradient-to-b from-primary/20 to-primary/5 border-primary scale-105"
                  : "bg-background border-border",
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge
                    className={cn(
                      "px-3 py-1",
                      plan.popular ? "bg-primary text-primary-foreground" : "bg-orange-500 text-white",
                    )}
                  >
                    {plan.highlight}
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-primary/10">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <p className="text-muted-foreground">{plan.period}</p>
              </div>

              <ul className="space-y-3 mb-6">
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

              <Button className="w-full" variant={plan.popular ? "gradient" : "outline"}>
                Escolher Plano
              </Button>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
