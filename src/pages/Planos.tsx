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

/* LINKS CORRETOS */
const STARTER_URL = "https://invoice.infinitepay.io/plans/backstagegroup/7HAAjraSOn";

const PRO_URL = "https://invoice.infinitepay.io/plans/backstagegroup/o81tUzQqP";

const FULL_URL = "https://invoice.infinitepay.io/plans/backstagegroup/j7EFHeAeZ";

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
    subtitle: "Para começar e parar de se perder",
    price: "R$ 19,90",
    period: "/mês",
    buttonText: "Começar no Starter",
    url: STARTER_URL,
    highlight: false,
    badgeText: "",
    icon: Sparkles,
    features: ["Dashboard", "Agenda", "Clientes", "Financeiro", "Repertório", "Tutoriais", "Configurações"],
  },
  {
    id: "pro",
    name: "Profissional",
    subtitle: "O plano ideal para quem quer vender mais shows",
    price: "R$ 34,90",
    period: "/mês",
    buttonText: "Escolher Profissional",
    url: PRO_URL,
    highlight: true,
    badgeText: "MAIS POPULAR",
    icon: Briefcase,
    features: ["Funil de Vendas", "Orçamentos", "BÔNUS", "Checklist", "Avanços", "Precificação"],
  },
  {
    id: "full",
    name: "Completo",
    subtitle: "Controle total da carreira, como uma empresa",
    price: "R$ 49,99",
    period: "/mês",
    buttonText: "Escolher Completo",
    url: FULL_URL,
    highlight: false,
    badgeText: "TUDO LIBERADO",
    icon: Crown,
    features: ["Contratos", "Histórico", "Mapeamento de Palco", "Metas", "Equipe"],
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
            <p className="text-white/90 text-sm">Os valores podem voltar ao normal sem aviso prévio.</p>
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
        <p className="text-sm text-muted-foreground mt-1">Feedback real de artistas e produtores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-muted/40 rounded-2xl p-6 border border-border shadow-sm">
            <Quote className="w-5 h-5 text-primary/60 mb-3" />
            <p className="text-sm italic mb-4">"{t.text}"</p>
            <div>
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
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
          <div key={item.text} className="flex items-center gap-2">
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
          <p className="text-sm text-muted-foreground">
            A troca de plano é simples. Você pode subir de nível conforme sua carreira cresce.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Dica:</span> O Profissional é o mais escolhido.
        </div>
      </div>
    </div>
  );
}

export default function Planos() {
  return (
    <Layout title="" subtitle="">
      <div className="pt-8 pb-16">
        <UrgencyBanner />

        <div className="text-center max-w-4xl mx-auto mb-14">
          <div className="flex justify-center mb-6">
            <AppLogo size="lg" collapsed />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">Organize sua carreira como uma empresa</h1>

          <p className="text-muted-foreground text-lg">
            Menos improviso. Mais controle. Escolha um plano e comece hoje.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((p) => (
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
                    <Badge className="bg-blue-600 text-white rounded-full px-3 py-1 text-xs">{p.badgeText}</Badge>
                  </div>
                )}

                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <AppLogo size="sm" collapsed />
                    <div>
                      <h3 className="text-xl font-bold">{p.name}</h3>
                      <p className="text-sm text-muted-foreground">{p.subtitle}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold">{p.price}</span>
                      <span className="text-sm text-muted-foreground mb-1">{p.period}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <Button
                    size="lg"
                    className="w-full rounded-2xl text-white font-semibold bg-gradient-to-r from-primary to-blue-600"
                    onClick={() => window.open(p.url, "_blank")}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {p.buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <InfoStrip />
        <TestimonialsSection />
        <ReassurancesBar />
      </div>
    </Layout>
  );
}
