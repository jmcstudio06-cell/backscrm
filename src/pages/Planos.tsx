import { ArrowRight, Check } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/AppLogo";

const plans = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "Para começar e se organizar",
    price: "R$ 19,90",
    period: "/mês",
    highlight: false,
    badgeText: "",
    url: "#",
    buttonText: "Começar agora",
    features: ["Dashboard completo", "Agenda de Shows", "Gestão de Clientes", "Financeiro básico", "Repertório"],
  },
  {
    id: "pro",
    name: "Profissional",
    subtitle: "Para artistas que querem crescer",
    price: "R$ 39,90",
    period: "/mês",
    highlight: true,
    badgeText: "Mais Escolhido",
    url: "#",
    buttonText: "Assinar plano",
    features: [
      "Tudo do Starter",
      "Controle financeiro completo",
      "Relatórios detalhados",
      "Gestão de equipe",
      "Prioridade no suporte",
    ],
  },
  {
    id: "full",
    name: "Avançado",
    subtitle: "Para quem quer dominar o mercado",
    price: "R$ 59,90",
    period: "/mês",
    highlight: false,
    badgeText: "Completo",
    url: "#",
    buttonText: "Assinar plano",
    features: [
      "Tudo do Profissional",
      "Múltiplos usuários",
      "Exportação de relatórios",
      "Automação avançada",
      "Suporte premium",
    ],
  },
];

export default function Planos() {
  return (
    <Layout title="" subtitle="">
      <div className="pt-12 pb-20 px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="flex justify-center mb-4">
            <AppLogo size="lg" collapsed />
          </div>

          <h1 className="text-4xl font-bold mb-4">Organize sua carreira como uma empresa</h1>

          <p className="text-muted-foreground text-lg">Menos improviso. Mais controle. Escolha seu plano.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((p) => (
            <Card
              key={p.id}
              className={cn(
                "relative h-full rounded-3xl shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl",

                p.id === "starter" && "bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-200",

                p.id === "pro" &&
                  "bg-gradient-to-br from-blue-100 via-white to-cyan-100 border-2 border-blue-500 scale-[1.02]",

                p.id === "full" && "bg-gradient-to-br from-amber-50 via-white to-orange-100 border border-amber-300",
              )}
            >
              {p.badgeText && (
                <div className="absolute top-4 right-4">
                  <Badge className="rounded-full px-3 py-1 text-xs font-bold text-white bg-blue-600">
                    {p.badgeText}
                  </Badge>
                </div>
              )}

              <CardContent className="p-8 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white shadow-md rounded-xl flex items-center justify-center">
                    <AppLogo size="sm" collapsed />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.subtitle}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">{p.price}</span>
                    <span className="text-sm text-muted-foreground mb-1">{p.period}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">Cancele quando quiser.</p>
                </div>

                {/* Features */}
                <div className="rounded-2xl bg-white/70 backdrop-blur-sm border p-6 flex-1">
                  <p className="text-xs font-semibold text-muted-foreground mb-4">O que inclui:</p>

                  <ul className="space-y-3">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="mt-6">
                  <Button
                    size="lg"
                    className={cn(
                      "w-full rounded-xl text-white transition-all duration-300",
                      p.id === "starter" && "bg-gradient-to-r from-blue-600 to-cyan-500",
                      p.id === "pro" && "bg-gradient-to-r from-blue-700 to-indigo-600",
                      p.id === "full" && "bg-gradient-to-r from-amber-500 to-orange-500",
                    )}
                    onClick={() => window.open(p.url, "_blank")}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {p.buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
