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

// Links corretos (Infinity)
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
    subtitle: "O plano ideal para começar, se organizar e ter controle da carreira artística.",
    price: "R$ 19,90",
    period: "/mês",
    buttonText: "Começar no Starter",
    url: STARTER_URL,
    highlight: false,
    badgeText: "",
    icon: Sparkles,
    ring: "ring-1 ring-border",
    accent: "from-primary to-blue-600",
    softBg: "from-primary/10 to-transparent",
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
    ring: "ring-2 ring-blue-500/60",
    accent: "from-blue-600 to-cyan-500",
    softBg: "from-blue-500/15 to-transparent",
    features: ["Funil de Vendas", "Orçamentos", "Aulas", "Checklist", "Avanços", "Precificação"],
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
    ring: "ring-1 ring-border",
    accent: "from-amber-500 to-orange-500",
    softBg: "from-amber-500/15 to-transparent",
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
    <div className="max-w-6xl mx-auto mt-10">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold">Quem usa, sente a diferença</h3>
        <p className="text-sm text-muted-foreground mt-1">Feedback real de artistas e produtores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-muted/40 rounded-2xl p-5 border border-border shadow-sm">
            <Quote className="w-5 h-5 text-primary/60 mb-2" />
            <p className="text-sm italic mb-4">"{t.text}"</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-blue-600/10 border border-border" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReassurancesBar() {
  return (
    <div className="max-w-6xl mx-auto mt-10 mb-4">
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
    <div className="max-w-6xl mx-auto mt-8 mb-10">
      <div className="rounded-2xl border border-border bg-gradient-to-r from-muted/40 to-muted/10 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Comece no Starter e evolua quando quiser.</p>
          <p className="text-sm text-muted-foreground">
            A troca de plano é simples. Você sempre pode subir para o próximo nível conforme sua carreira cresce.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Dica:</span>
          <span>O Profissional é o mais escolhido.</span>
        </div>
      </div>
    </div>
  );
}

export default function Planos() {
  return (
    <Layout title="" subtitle="">
      <div className="pt-4">
        {/* Background decor */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-140px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute right-[10%] top-[120px] h-[280px] w-[280px] rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute left-[10%] top-[220px] h-[280px] w-[280px] rounded-full bg-amber-500/10 blur-3xl" />
          </div>
        </div>

        <UrgencyBanner />

        {/* Hero */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <div className="flex justify-center mb-4">
            <AppLogo size="lg" collapsed />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Organize sua carreira como uma empresa</h1>

          <p className="text-base md:text-lg text-muted-foreground">
            Menos improviso. Mais controle. Escolha um plano e comece hoje.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Agenda + clientes + financeiro
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Área comercial completa
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Planejamento e performance
            </Badge>
          </div>
        </div>

        {/* Plans */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {plans.map((p) => {
              const Icon = p.icon;

              return (
                <Card
                  key={p.id}
                  className={cn(
                    "relative h-full overflow-hidden rounded-2xl border bg-background shadow-sm transition-all duration-300",
                    "hover:shadow-lg",
                    p.ring,
                    p.highlight ? "scale-[1.01]" : "",
                  )}
                >
                  {/* soft gradient top */}
                  <div className={cn("absolute inset-x-0 top-0 h-40 bg-gradient-to-b", p.softBg)} />

                  {p.badgeText ? (
                    <div className="absolute top-4 right-4">
                      <Badge
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-bold text-white",
                          p.highlight ? "bg-blue-600" : "bg-amber-600",
                        )}
                      >
                        {p.badgeText}
                      </Badge>
                    </div>
                  ) : null}

                  <CardContent className="relative p-6 h-full flex flex-col">
                    {/* header */}
                    <div className="flex items-start gap-3 mb-4">
                      <AppLogo size="sm" collapsed />
                      <div className="min-w-0">
                        <h3 className="text-xl font-bold leading-tight">{p.name}</h3>
                        <p className="text-sm text-muted-foreground">{p.subtitle}</p>
                      </div>
                    </div>

                    {/* price */}
                    <div className="mb-4">
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                        <span className="text-sm text-muted-foreground mb-1">{p.period}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cobrança mensal pré-paga. Cancele quando quiser.
                      </p>
                    </div>

                    {/* features */}
                    <div className="rounded-xl border border-border bg-muted/25 p-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-3">O que inclui:</p>
                      <ul className="space-y-2">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA aligned bottom */}
                    <div className="mt-auto pt-5">
                      <Button
                        size="lg"
                        className={cn(
                          "w-full rounded-xl shadow-sm",
                          p.highlight
                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white"
                            : "bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white",
                        )}
                        onClick={() => window.open(p.url, "_blank")}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {p.buttonText}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </Button>

                      {p.highlight ? (
                        <p className="text-[11px] text-muted-foreground mt-2 text-center">
                          Recomendado para quem quer fechar mais shows.
                        </p>
                      ) : p.id === "full" ? (
                        <p className="text-[11px] text-muted-foreground mt-2 text-center">
                          Para quem quer controle total da carreira.
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground mt-2 text-center">
                          Ideal para o seu momento atual.
                        </p>
                      )}
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
