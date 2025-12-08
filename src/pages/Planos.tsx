import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Crown,
  Zap,
  Star,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    description: "Para artistas iniciantes",
    price: { monthly: 49, yearly: 39 },
    icon: Zap,
    popular: false,
    features: [
      { name: "Até 50 leads no CRM", included: true },
      { name: "10 contratos por mês", included: true },
      { name: "Agenda básica", included: true },
      { name: "Relatórios simples", included: true },
      { name: "Suporte por email", included: true },
      { name: "Integrações avançadas", included: false },
      { name: "Múltiplos usuários", included: false },
      { name: "API personalizada", included: false },
    ],
  },
  {
    name: "Pro",
    description: "Para artistas em crescimento",
    price: { monthly: 99, yearly: 79 },
    icon: Star,
    popular: true,
    features: [
      { name: "Leads ilimitados no CRM", included: true },
      { name: "Contratos ilimitados", included: true },
      { name: "Agenda completa", included: true },
      { name: "Relatórios avançados", included: true },
      { name: "Suporte prioritário", included: true },
      { name: "Integrações avançadas", included: true },
      { name: "Até 3 usuários", included: true },
      { name: "API personalizada", included: false },
    ],
  },
  {
    name: "Business",
    description: "Para bandas e agências",
    price: { monthly: 199, yearly: 159 },
    icon: Rocket,
    popular: false,
    features: [
      { name: "Leads ilimitados no CRM", included: true },
      { name: "Contratos ilimitados", included: true },
      { name: "Agenda completa", included: true },
      { name: "Relatórios personalizados", included: true },
      { name: "Suporte VIP 24/7", included: true },
      { name: "Todas as integrações", included: true },
      { name: "Usuários ilimitados", included: true },
      { name: "API personalizada", included: true },
    ],
  },
];

export default function Planos() {
  return (
    <Layout title="Ver Planos" subtitle="Escolha o plano ideal para você">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
          <Crown className="w-3 h-3 mr-1" />
          Economize até 20% no plano anual
        </Badge>
        <h2 className="text-3xl font-bold text-foreground mb-3">
          Escolha o plano perfeito para sua carreira
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Todos os planos incluem 7 dias de teste grátis. Cancele quando quiser.
        </p>
      </div>

      {/* Plans Grid */}
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
                  : "glass border border-border"
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
                <div className={cn(
                  "w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                  plan.popular ? "[background:var(--gradient-primary)]" : "bg-secondary"
                )}>
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
                    <span className={cn(
                      "text-sm",
                      feature.included ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "gradient" : "outline"}
                className="w-full"
              >
                {plan.popular ? "Começar Agora" : "Escolher Plano"}
              </Button>
            </div>
          );
        })}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-16 text-center">
        <p className="text-muted-foreground mb-4">
          Precisa de algo personalizado?
        </p>
        <Button variant="outline">
          Fale com nossa equipe
        </Button>
      </div>
    </Layout>
  );
}
