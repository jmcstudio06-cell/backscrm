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

function TestimonialsSection() {
  return (
    <div className="max-w-6xl mx-auto mt-14">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold">Quem usa, sente a diferença</h3>
        <p className="text-sm text-muted-foreground mt-1 font-medium">Feedback real de artistas e produtores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-muted/40 rounded-2xl p-6 border border-border shadow-sm">
            <Quote className="w-5 h-5 text-primary/60 mb-3" />
            <p className="text-sm italic mb-4 font-medium">"{t.text}"</p>
            <div>
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground font-medium">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReassurancesBar() {
  return (
    <div className="max-w-6xl mx-auto mt-14 mb-6">
      <div className="flex flex-wrap justify-center gap-6 rounded-2xl border border-border bg-muted/30 p-4">
        {reassurances.map((item) => (
          <div key={item.text} className="flex items-center gap-2 font-medium">
            <item.icon className="w-4 h-4" />
            <span className="text-sm">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoStrip() {
  return (
    <div className="max-w-6xl mx-auto mt-10 mb-12">
      <div className="rounded-2xl border border-border bg-gradient-to-r from-muted/40 to-muted/10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Comece no Starter e evolua quando quiser.</p>
          <p className="text-sm text-muted-foreground font-medium">
            A troca de plano é simples. Você pode subir de nível conforme sua carreira cresce.
          </p>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
          <span className="font-semibold text-foreground">Dica:</span> O Profissional é o mais escolhido.
        </div>
      </div>
    </div>
  );
}

export default function Planos() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <Layout title="" subtitle="">
      <div className="pt-8 pb-16">
        <UrgencyBanner />

        {/* TOGGLE */}
        <div className="flex justify-center mb-10">
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

        {/* PLANOS */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p) => {
              const isFull = p.id === "full";
              const isYearly = isFull && billing === "yearly";

              const finalPrice = isYearly ? "R$ 34,90" : p.price;
              const finalUrl = isYearly ? FULL_YEARLY_URL : p.url;

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
                    <div className="mb-6">
                      {p.id === "starter" && (
                        <p className="text-sm text-red-600 line-through mb-1 font-semibold">R$ 24,90</p>
                      )}

                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold">{finalPrice}</span>
                        <span className="text-sm text-muted-foreground mb-1 font-medium">/mês</span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {isYearly ? "Cobrança anual de R$ 418,80." : "Cobrança mensal pré-paga. Cancele quando quiser."}
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

        <InfoStrip />
        <TestimonialsSection />
        <ReassurancesBar />
      </div>
    </Layout>
  );
}
