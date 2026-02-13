import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  Zap,
  Star,
  Crown,
  Shield,
  HeadphonesIcon,
  XCircle,
  Quote,
  AlertTriangle,
  Trophy,
  Briefcase,
  Music,
  Users,
  Target,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const INFINITEPAY_URL =
  "https://loja.infinitepay.io/backstagegroup?categories=1311210-backstage-pro";

// ─── Planos Clássicos (modelo antigo) ───────────────────────────
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

const classicPlans = [
  {
    name: "Essencial",
    tagline: "Para quem está começando a profissionalizar",
    description: "1 mês de acesso",
    originalPrice: "R$ 79,90",
    price: "1x de R$ 45,00",
    totalPrice: "R$ 45,00",
    icon: Zap,
    highlight: null,
    support: "Suporte por chat",
    cta: "Quero começar agora",
    features: [
      "Agenda de shows organizada",
      "Orçamentos e contratos prontos em minutos",
      "Histórico de clientes e contratantes",
      "Controle financeiro claro e simples",
      "Tudo da sua carreira em um só lugar",
    ],
    styles: {
      card: "bg-card border border-border hover:border-primary/30 hover:shadow-lg",
      icon: "bg-primary/10 text-primary",
      button: "bg-primary hover:bg-primary/90 text-primary-foreground",
    },
  },
  {
    name: "Profissional",
    tagline: "Para artistas que já fazem shows regularmente",
    description: "3 meses de acesso",
    originalPrice: "R$ 135,00",
    price: "3x de R$ 25,00",
    totalPrice: "R$ 75,00",
    icon: Star,
    highlight: "MAIS ESCOLHIDO",
    support: "Suporte prioritário",
    cta: "Quero crescer agora",
    features: [
      "Tudo do plano Essencial",
      "Funil de vendas para fechar mais shows",
      "Metas e acompanhamento de crescimento",
      "Relatórios de performance detalhados",
      "Economize R$ 60,00 comparado ao mensal",
    ],
    styles: {
      card: "bg-gradient-to-b from-primary/5 to-primary/10 border-2 border-primary scale-[1.02] shadow-xl ring-1 ring-primary/20",
      icon: "bg-gradient-to-br from-primary to-blue-600 text-white",
      button:
        "bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white shadow-lg",
    },
  },
  {
    name: "Avançado",
    tagline: "Para quem quer dominar o mercado",
    description: "6 meses de acesso",
    originalPrice: "R$ 270,00",
    price: "6x de R$ 16,66",
    totalPrice: "R$ 99,99",
    icon: Crown,
    highlight: "MELHOR VALOR",
    support: "Suporte VIP",
    cta: "Quero ser referência",
    features: [
      "Tudo do plano Profissional",
      "Acompanhamento contínuo de metas",
      "Prioridade em novidades e recursos",
      "Acesso antecipado a novas funcionalidades",
      "Economize R$ 170,01 comparado ao mensal",
    ],
    styles: {
      card: "bg-card border border-border hover:border-amber-500/30 hover:shadow-lg",
      icon: "bg-gradient-to-br from-amber-500 to-orange-500 text-white",
      button:
        "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white",
    },
  },
  {
    name: "Anual",
    tagline: "Máximo compromisso, máxima economia",
    description: "12 meses de acesso",
    originalPrice: "R$ 540,00",
    price: "12x de R$ 12,50",
    totalPrice: "R$ 149,99",
    icon: Trophy,
    highlight: "ECONOMIA MÁXIMA",
    support: "Suporte VIP prioritário",
    cta: "Quero o melhor preço",
    features: [
      "Tudo do plano Avançado",
      "1 ano completo de acesso",
      "Prioridade absoluta em novidades",
      "Suporte VIP prioritário",
      "Economize R$ 390,01 comparado ao mensal",
    ],
    styles: {
      card: "bg-card border border-border hover:border-emerald-500/30 hover:shadow-lg",
      icon: "bg-gradient-to-br from-emerald-500 to-teal-500 text-white",
      button:
        "bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white",
    },
  },
];

const reassurances = [
  { icon: Shield, text: "Pagamento 100% seguro" },
  { icon: XCircle, text: "Cancele quando quiser" },
  { icon: HeadphonesIcon, text: "Suporte humano real" },
];

// ─── Novo modelo: Plano Base + Módulos ─────────────────────────
const basePlan = {
  price: "R$ 19,90",
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

const modules = [
  {
    id: "comercial",
    name: "Área Comercial PRO",
    icon: Briefcase,
    price: "R$ 9,90",
    period: "/mês",
    color: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-200 hover:border-blue-400",
    features: [
      "Funil de Vendas (CRM)",
      "Orçamento Automático",
      "Contrato Automático",
      "Histórico Mensal Financeiro",
    ],
  },
  {
    id: "show",
    name: "Planejamento de Show PRO",
    icon: Music,
    price: "R$ 7,90",
    period: "/mês",
    color: "from-purple-500 to-pink-500",
    borderColor: "border-purple-200 hover:border-purple-400",
    features: [
      "Checklist de Show",
      "Mapeamento de Palco",
      "Precificação",
    ],
  },
  {
    id: "equipe",
    name: "Equipe & Freelancer",
    icon: Users,
    price: "R$ 6,90",
    period: "/mês",
    color: "from-green-500 to-emerald-500",
    borderColor: "border-green-200 hover:border-green-400",
    features: ["Gestão de equipe e freelancers por show"],
  },
  {
    id: "metas",
    name: "Metas & Performance",
    icon: Target,
    price: "R$ 6,90",
    period: "/mês",
    color: "from-amber-500 to-orange-500",
    borderColor: "border-amber-200 hover:border-amber-400",
    features: [
      "Metas Comerciais",
      "Meta Anual",
      "Avanços e Performance",
    ],
  },
];

// ─── Componentes internos ───────────────────────────────────────

function UrgencyBanner() {
  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-5 max-w-3xl mx-auto mb-8 shadow-xl border border-red-400/30">
      <div className="flex items-center gap-3 justify-center">
        <div className="bg-white/20 rounded-full p-2.5 animate-pulse">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-lg">
            ⚠️ Oferta por tempo limitado
          </p>
          <p className="text-white/90 text-sm">
            Os valores podem voltar ao normal sem aviso prévio.
          </p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
      {testimonials.map((testimonial) => (
        <div
          key={testimonial.name}
          className="bg-muted/50 rounded-xl p-4 border border-border"
        >
          <Quote className="w-5 h-5 text-primary/60 mb-2" />
          <p className="text-sm italic mb-3">"{testimonial.text}"</p>
          <p className="text-sm font-semibold">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.role}</p>
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

function ClassicPlansGrid() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-10">
        {classicPlans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl p-6 flex flex-col transition-all duration-300",
                plan.styles.card
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-primary to-blue-600">
                    {plan.highlight}
                  </Badge>
                </div>
              )}

              <div className="text-center mb-5">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center",
                    plan.styles.icon
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.tagline}
                </p>
              </div>

              <div className="text-center mb-5">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-sm text-muted-foreground line-through">
                    {plan.originalPrice}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    OFERTA
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {plan.price}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.description} • Total: {plan.totalPrice}
                </p>
              </div>

              <ul className="space-y-2.5 mb-5 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-muted-foreground text-center mb-4">
                {plan.support}
              </p>

              <Button
                size="lg"
                className={cn("w-full font-semibold", plan.styles.button)}
                onClick={() => window.open(INFINITEPAY_URL, "_blank")}
              >
                {plan.cta}
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function ModularPlansSection() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Plano Base */}
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
                  <h3 className="text-xl font-bold">Plano Base</h3>
                  <p className="text-xs text-muted-foreground">
                    Tudo que você precisa para começar
                  </p>
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
            </div>

            <div className="text-center shrink-0">
              <div className="text-4xl font-bold text-foreground">
                {basePlan.price}
                <span className="text-base font-normal text-muted-foreground">
                  {basePlan.period}
                </span>
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

      {/* Módulos extras */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">
          Desbloqueie mais recursos para sua carreira
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ative apenas o que faz sentido para você, quando precisar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Card
              key={mod.id}
              className={cn(
                "transition-all duration-300 hover:shadow-lg",
                mod.borderColor
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br text-white",
                      mod.color
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm">{mod.name}</h4>
                      <span className="font-bold text-foreground whitespace-nowrap">
                        {mod.price}
                        <span className="text-xs font-normal text-muted-foreground">
                          {mod.period}
                        </span>
                      </span>
                    </div>
                    <ul className="space-y-1.5 mb-3">
                      {mod.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(INFINITEPAY_URL, "_blank")}
                    >
                      Desbloquear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Página principal ───────────────────────────────────────────

export default function Planos() {
  return (
    <Layout title="" subtitle="">
      <div className="pt-4">
        <UrgencyBanner />

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            Pare de perder tempo e dinheiro com desorganização
          </h1>
          <p className="text-lg text-muted-foreground">
            O Backstage Pro é o sistema completo para{" "}
            <span className="text-foreground font-medium">
              gerir sua carreira musical como uma empresa
            </span>
            .
          </p>
        </div>

        {/* Tabs para alternar entre modelos */}
        <Tabs defaultValue="modular" className="max-w-6xl mx-auto mb-10">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="modular">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Monte seu plano
            </TabsTrigger>
            <TabsTrigger value="classic">
              <Crown className="w-4 h-4 mr-1.5" />
              Planos completos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modular">
            <ModularPlansSection />
          </TabsContent>

          <TabsContent value="classic">
            <ClassicPlansGrid />
          </TabsContent>
        </Tabs>

        <TestimonialsSection />
        <ReassurancesBar />
      </div>
    </Layout>
  );
}
