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
  Briefcase,
  Music,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/layout/AppLogo";

const INFINITEPAY_URL = "https://loja.infinitepay.io/backstagegroup?categories=1311210-backstage-pro";

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

const basePlan = {
  name: "Plano Profissional",
  subtitle: "Tudo que você precisa para começar",
  priceNumber: 19.9,
  priceLabel: "R$ 19,90",
  period: "/mês",
  features: [
    "Dashboard completo",
    "Agenda de Shows",
    "Gestão de Clientes",
    "Financeiro básico (Resumo Geral)",
    "Repertório",
    "Tutoriais e Configurações",
  ],
};

const upgrades = [
  {
    id: "upgrade-comercial-performance",
    name: "Upgrade Comercial & Performance",
    subtitle: "Venda mais, acompanhe metas e performance da carreira",
    priceNumber: 16.99,
    priceLabel: "+ R$ 16,99",
    period: "/mês",
    icon: Briefcase,
    color: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-200 hover:border-blue-400",
    features: [
      "Funil de Vendas (CRM)",
      "Orçamento Automático",
      "Contrato Automático",
      "Histórico Mensal Financeiro",
      "Metas Comerciais",
      "Meta Anual",
      "Avanços & Performance",
    ],
  },
  {
    id: "upgrade-producao-show",
    name: "Upgrade Produção de Show",
    subtitle: "Planejamento completo + equipe e freelancers por show",
    priceNumber: 13.1,
    priceLabel: "+ R$ 13,10",
    period: "/mês",
    icon: Music,
    color: "from-purple-500 to-pink-500",
    borderColor: "border-purple-200 hover:border-purple-400",
    features: ["Checklist de Show", "Mapeamento de Palco", "Precificação", "Gestão de equipe e freelancers por show"],
  },
] as const;

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function UrgencyBanner() {
  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-5 max-w-3xl mx-auto mb-8 shadow-xl border border-red-400/30">
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
  );
}

function TestimonialsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
      {testimonials.map((t) => (
        <div key={t.name} className="bg-muted/50 rounded-xl p-4 border border-border">
          <Quote className="w-5 h-5 text-primary/60 mb-2" />
          <p className="text-sm italic mb-3">"{t.text}"</p>
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.role}</p>
        </div>
      ))}
    </div>
  );
}

function ReassurancesBar() {
  return (
    <div className="flex flex-wrap justify-center gap-6 mb-8">
      {reassurances.map((item) => (
        <div key={item.text} className="flex items-center gap-2">
          <item.icon className="w-4 h-4" />
          <span className="text-sm">{item.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function Planos() {
  return (
    <Layout title="" subtitle="">
      <div className="pt-4">
        <UrgencyBanner />

        {/* Logo + Hero */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="flex justify-center mb-4">
            <AppLogo size="lg" collapsed />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Pare de perder tempo e dinheiro com desorganização</h1>
          <p className="text-lg text-muted-foreground">
            O Backstage Pro é o sistema para{" "}
            <span className="text-foreground font-medium">gerir sua carreira musical como uma empresa</span>.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* PLANO BASE */}
          <div className="mb-10">
            <div className="relative rounded-2xl border-2 border-primary bg-gradient-to-b from-primary/5 to-primary/10 p-6 md:p-8 shadow-xl max-w-2xl mx-auto">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="px-4 py-1 text-xs font-bold text-white bg-gradient-to-r from-primary to-blue-600">
                  OBRIGATÓRIO
                </Badge>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{basePlan.name}</h3>
                      <p className="text-xs text-muted-foreground">{basePlan.subtitle}</p>
                    </div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {basePlan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        <span className="text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="text-xs text-muted-foreground">
                    Depois, você pode ativar upgrades conforme sua necessidade.
                  </p>
                </div>

                <div className="text-center shrink-0">
                  <div className="text-4xl font-bold text-foreground">
                    {basePlan.priceLabel}
                    <span className="text-base font-normal text-muted-foreground">{basePlan.period}</span>
                  </div>
                  <Button
                    size="lg"
                    className="mt-4 w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white shadow-lg"
                    onClick={() => window.open(INFINITEPAY_URL, "_blank")}
                  >
                    Começar agora
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* UPGRADES */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Upgrades para liberar recursos avançados</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Os valores abaixo são <span className="font-medium">adicionais</span> ao plano base.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10 items-stretch">
            {upgrades.map((u) => {
              const Icon = u.icon;
              const total = basePlan.priceNumber + u.priceNumber;

              return (
                <Card
                  key={u.id}
                  className={cn("transition-all duration-300 hover:shadow-lg border h-full", u.borderColor)}
                >
                  <CardContent className="p-5 h-full flex flex-col">
                    {/* TOPO */}
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br text-white",
                          u.color,
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-sm">{u.name}</h4>
                          <span className="font-bold text-foreground whitespace-nowrap">
                            {u.priceLabel}
                            <span className="text-xs font-normal text-muted-foreground">{u.period}</span>
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{u.subtitle}</p>
                      </div>
                    </div>

                    {/* LISTA */}
                    <ul className="space-y-1.5 mt-4">
                      {u.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* RODAPÉ */}
                    <div className="mt-auto pt-4">
                      <div className="text-xs text-muted-foreground mb-3">
                        Total com este upgrade:{" "}
                        <span className="font-semibold text-foreground">{formatBRL(total)}</span>
                        <span className="text-muted-foreground">/mês</span>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(INFINITEPAY_URL, "_blank")}
                      >
                        Ativar upgrade
                      </Button>

                      <p className="text-[11px] text-muted-foreground mt-2">
                        Valor adicional ao plano base. Cobrança pré-paga.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <TestimonialsSection />
        <ReassurancesBar />
      </div>
    </Layout>
  );
}
