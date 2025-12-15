import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Crown, Zap, Star, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    description: "Organização do artista",
    price: { monthly: 49, yearly: 39 },
    icon: Zap,
    popular: false,
    features: [
      { name: "Dashboard", included: true },
      { name: "Agenda de Shows", included: true },
      { name: "Funil de Vendas", included: true },
      { name: "Clientes", included: true },
      { name: "Orçamento Automático", included: true },

      { name: "Contrato Automático", included: false },
      { name: "Resumo financeiro do mês", included: false },
      { name: "Histórico mensal financeiro", included: false },
      { name: "Checklist de Show", included: false },
      { name: "Equipe e Freelancers", included: false },
      { name: "Metas", included: false },
      { name: "Suporte via WhatsApp", included: false },
      { name: "Apoio de Conhecimentos", included: false },
      { name: "Leads qualificados para contratação", included: false },
    ],
  },
  {
    name: "Essencial",
    description: "Controle e profissionalização",
    price: { monthly: 99, yearly: 79 },
    icon: Star,
    popular: true,
    features: [
      { name: "Dashboard", included: true },
      { name: "Agenda de Shows", included: true },
      { name: "Funil de Vendas", included: true },
      { name: "Clientes", included: true },
      { name: "Orçamento Automático", included: true },
      { name: "Contrato Automático", included: true },
      { name: "Resumo financeiro do mês", included: true },
      { name: "Checklist de Show", included: true },
      { name: "Equipe e Freelancers", included: true },
      { name: "Metas", included: true },

      { name: "Histórico mensal financeiro", included: false },
      { name: "Suporte via WhatsApp", included: false },
      { name: "Apoio de Conhecimentos", included: false },
      { name: "Leads qualificados para contratação", included: false },
    ],
  },
  {
    name: "Completo",
    description: "Gestão total da carreira",
    price: { monthly: 199, yearly: 159 },
    icon: Rocket,
    popular: false,
    features: [
      { name: "Dashboard", included: true },
      { name: "Agenda de Shows", included: true },
      { name: "Funil de Vendas", included: true },
      { name: "Clientes", included: true },
      { name: "Orçamento Automático", included: true },
      { name: "Contrato Automático", included: true },
      { name: "Resumo financeiro do mês", included: true },
      { name: "Histórico mensal financeiro", included: true },
      { name: "Checklist de Show", included: true },
      { name: "Equipe e Freelancers", included: true },
      { name: "Metas", included: true },
      { name: "Suporte via WhatsApp", included: true },
      { name: "Apoio de Conhecimentos", included: true },
      { name: "Leads qualificados para contratação", included: true },
    ],
  },
];

export default function Planos() {
  return (
    <Layout title="Ver Planos" subtitle="Escolha o plano ideal para você">
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
          <Crown className="w-3 h-3 mr-1" />
          Economize até 20% no plano anual
        </Badge>
        <h2 className="text-3xl font-bold text-foreground mb-3">Escolha o plano perfeito para sua carreira</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Todos os planos incluem 7 dias de teste grátis. Cancele quando quiser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon;

          return (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-6 transition-all",
                plan.popular
                  ? "bg-gradient-to-b from-primary/20 to-primary/5 border-2 border-primary scale-105"
                  : "glass border border-border",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Mais Popular
                  </Badge>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                    plan.popular ? "[background:var(--gradient-primary)]" : "bg-secondary",
                  )}
                >
                  <Icon className={cn("w-7 h-7", plan.popular ? "text-primary-foreground" : "text-primary")} />
                </div>
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">R$ {plan.price.yearly}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  cobrado anualmente (R$ {plan.price.monthly}/mês se mensal)
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                    <span className={cn("text-sm", feature.included ? "text-foreground" : "text-muted-foreground")}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button variant={plan.popular ? "gradient" : "outline"} className="w-full">
                {plan.popular ? "Começar Agora" : "Escolher Plano"}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <p className="text-muted-foreground mb-4">Precisa de algo personalizado?</p>
        <Button variant="outline">Fale com nossa equipe</Button>
      </div>
    </Layout>
  );
}
