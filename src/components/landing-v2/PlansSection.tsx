import { Check, ArrowRight, Crown, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    id: "profissional",
    name: "Profissional",
    description: "Organize sua operação comercial",
    price: "R$ 19,90",
    period: "/mês",
    badge: "PARA COMEÇAR",
    icon: Briefcase,
    color: "from-blue-500 to-cyan-500",
    features: [
      "Agenda ilimitada",
      "CRM e clientes",
      "Repertório",
      "Financeiro",
      "Orçamentos automáticos",
      "Checklist de show",
      "Link da Bio / Press Kit",
    ],
    cta: "Começar",
  },
  {
    id: "empresarial",
    name: "Empresarial",
    description: "Controle total da sua carreira",
    price: "R$ 39,90",
    period: "/mês",
    badge: "MAIS POPULAR",
    icon: Crown,
    color: "from-purple-500 to-pink-500",
    highlight: true,
    features: [
      "Tudo do Profissional",
      "Equipe e freelancers",
      "Link de agendamento",
      "Contratos automáticos",
      "Histórico financeiro",
      "Cobranças pendentes",
      "Mapeamento de palco",
      "Metas e bônus",
    ],
    cta: "Começar",
  },
  {
    id: "executivo",
    name: "Executivo",
    description: "Gestão completa + oportunidades",
    price: "R$ 79,90",
    period: "/mês",
    badge: "MAIS COMPLETO",
    icon: Building2,
    color: "from-rose-500 to-orange-500",
    features: [
      "Tudo do Empresarial",
      "Backs Radar",
      "Encontrar oportunidades",
      "Contatos de casas de show",
      "Envio direto ao CRM",
      "Gestão de usuários",
      "Suporte prioritário",
    ],
    cta: "Começar",
  },
];

export function PlansSection() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-gradient-to-b from-background via-violet-950/10 to-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-400 mb-4 uppercase tracking-wider">
            Planos transparentes
          </p>
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Escolha o plano perfeito para você
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Todos os planos incluem 7 dias de teste grátis. Cancele a qualquer momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl transition-all duration-300 ${
                  plan.highlight
                    ? "ring-2 ring-violet-500/50 bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 md:scale-105 md:shadow-2xl md:shadow-violet-500/20"
                    : "border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-8 inline-block">
                    <span className="inline-block px-4 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-bold rounded-full">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title and description */}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/60 mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span className="text-white/60">{plan.period}</span>
                    </div>
                    <p className="text-sm text-white/50 mt-2">Sem taxas ocultas. Cancele quando quiser.</p>
                  </div>

                  {/* CTA Button */}
                  <Link to="/auth" className="w-full mb-8">
                    <Button
                      size="lg"
                      className={`w-full font-bold text-lg py-6 rounded-xl ${
                        plan.highlight
                          ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-2xl"
                          : "border border-white/20 hover:bg-white/10 hover:border-white/40"
                      }`}
                    >
                      {plan.cta}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>

                  {/* Features */}
                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison CTA */}
        <div className="text-center mt-16">
          <p className="text-white/60 mb-4">Quer comparar planos em detalhes?</p>
          <Link to="/planos">
            <Button variant="outline" className="border-white/20 hover:bg-white/10">
              Ver comparação completa
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
