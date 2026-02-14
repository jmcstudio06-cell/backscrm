import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Shield, HeadphonesIcon, XCircle, Quote, AlertTriangle, ArrowRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/layout/AppLogo";

/* ============================= */
/* CONFIG USUÁRIOS               */
/* ============================= */

const TOTAL_USERS = 77;

const PLAN_USAGE = {
  starter: 18,
  pro: 34,
  full: 25,
};

/* ============================= */
/* CHECKOUT LINKS                */
/* ============================= */

const INFINITEPAY_URL = "https://loja.infinitepay.io/backstagegroup?categories=1311210-backstage-pro";

const STARTER_URL = INFINITEPAY_URL;
const PRO_URL = INFINITEPAY_URL;
const FULL_URL = INFINITEPAY_URL;

/* ============================= */
/* DEPOIMENTOS                   */
/* ============================= */

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

/* ============================= */
/* GARANTIAS                     */
/* ============================= */

const reassurances = [
  { icon: Shield, text: "Pagamento 100% seguro" },
  { icon: XCircle, text: "Cancele quando quiser" },
  { icon: HeadphonesIcon, text: "Suporte humano real" },
];

/* ============================= */
/* COMPONENTES                   */
/* ============================= */

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
        <h3 className="text-2xl font-bold">Quem usa, sente a diferença</h3>
        <p className="text-sm text-muted-foreground mt-1">Feedback real de artistas e produtores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-white rounded-3xl p-6 border shadow-md hover:shadow-xl transition">
            <Quote className="w-6 h-6 text-blue-600 mb-3" />
            <p className="text-sm italic mb-5">"{t.text}"</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>

              {/* Ícone dentro do quadrado */}
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReassurancesBar() {
  return (
    <div className="max-w-6xl mx-auto mt-14 mb-10">
      <div className="flex flex-wrap justify-center gap-6 rounded-2xl border bg-muted/30 p-5">
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

/* ============================= */
/* PAGE                          */
/* ============================= */

export default function Planos() {
  return (
    <Layout title="" subtitle="">
      <div className="pt-4">
        <UrgencyBanner />

        {/* HERO */}
        <div className="text-center max-w-4xl mx-auto mb-14">
          <div className="flex justify-center mb-4">
            <AppLogo size="lg" collapsed />
          </div>

          <h1 className="text-4xl font-bold mb-3">Organize sua carreira como uma empresa</h1>

          <p className="text-lg text-muted-foreground">
            Menos improviso. Mais controle. Escolha um plano e comece hoje.
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            {TOTAL_USERS} artistas já utilizam a plataforma
          </div>
        </div>

        {/* PLANOS */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* STARTER */}
          <Card className="rounded-3xl border border-blue-200 bg-gradient-to-b from-blue-50/40 to-white shadow-md hover:shadow-xl transition flex flex-col">
            <CardContent className="p-8 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-2">
                <AppLogo size="sm" collapsed />
                <h3 className="text-2xl font-bold">Starter</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4">Para começar e parar de se perder</p>

              <div className="text-4xl font-bold mb-1">
                R$ 19,90 <span className="text-sm text-muted-foreground">/mês</span>
              </div>

              <p className="text-xs text-muted-foreground mb-4">Cobrança mensal pré-paga. Cancele quando quiser.</p>

              <div className="flex items-center gap-2 text-blue-600 font-medium text-sm mb-6">
                <Users className="w-4 h-4" />
                18 artistas usam este plano
              </div>

              <div className="bg-white rounded-2xl border p-5 flex-1 mb-8">
                <p className="font-semibold mb-4 text-sm">O que inclui:</p>
                <div className="space-y-3">
                  <Feature text="Dashboard completo" />
                  <Feature text="Agenda de Shows" />
                  <Feature text="Gestão de Clientes" />
                  <Feature text="Financeiro básico (Resumo Geral)" />
                  <Feature text="Repertório" />
                  <Feature text="Tutoriais e Configurações" />
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                Começar no Starter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* PROFISSIONAL */}
          <Card className="rounded-3xl border-2 border-blue-500 bg-white shadow-xl scale-[1.02] flex flex-col">
            <CardContent className="p-8 flex flex-col h-full relative">
              <Badge className="absolute top-6 right-6 bg-blue-600 text-white px-4 py-1 rounded-full">
                MAIS POPULAR
              </Badge>

              <div className="flex items-center gap-3 mb-2">
                <AppLogo size="sm" collapsed />
                <h3 className="text-2xl font-bold">Profissional</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4">O plano ideal para quem quer vender mais shows</p>

              <div className="text-4xl font-bold mb-1">
                R$ 34,90 <span className="text-sm text-muted-foreground">/mês</span>
              </div>

              <p className="text-xs text-muted-foreground mb-4">Cobrança mensal pré-paga. Cancele quando quiser.</p>

              <div className="flex items-center gap-2 text-blue-600 font-medium text-sm mb-6">
                <Users className="w-4 h-4" />
                34 artistas usam este plano
              </div>

              <div className="bg-white rounded-2xl border p-5 flex-1 mb-8">
                <p className="font-semibold mb-4 text-sm">O que inclui:</p>
                <div className="space-y-3">
                  <Feature text="Tudo do Starter" />
                  <Feature text="Funil de Vendas (CRM)" />
                  <Feature text="Orçamento Automático" />
                  <Feature text="Contrato Automático" />
                  <Feature text="Histórico Mensal Financeiro" />
                  <Feature text="Checklist de Show" />
                  <Feature text="Mapeamento de Palco" />
                  <Feature text="Precificação" />
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-blue-700 to-cyan-500 text-white">
                Escolher Profissional
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* COMPLETO */}
          <Card className="rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-50 to-white shadow-lg flex flex-col">
            <CardContent className="p-8 flex flex-col h-full relative">
              <Badge className="absolute top-6 right-6 bg-amber-500 text-white px-4 py-1 rounded-full">
                TUDO LIBERADO
              </Badge>

              <div className="flex items-center gap-3 mb-2">
                <AppLogo size="sm" collapsed />
                <h3 className="text-2xl font-bold">Completo</h3>
              </div>

              <p className="text-sm text-muted-foreground mb-4">Controle total da carreira, como uma empresa</p>

              <div className="text-4xl font-bold mb-1">
                R$ 49,99 <span className="text-sm text-muted-foreground">/mês</span>
              </div>

              <p className="text-xs text-muted-foreground mb-4">Cobrança mensal pré-paga. Cancele quando quiser.</p>

              <div className="flex items-center gap-2 text-amber-600 font-medium text-sm mb-6">
                <Users className="w-4 h-4" />
                25 artistas usam este plano
              </div>

              <div className="bg-white rounded-2xl border p-5 flex-1 mb-8">
                <p className="font-semibold mb-4 text-sm">O que inclui:</p>
                <div className="space-y-3">
                  <Feature text="Tudo do Profissional" />
                  <Feature text="Metas Comerciais" />
                  <Feature text="Meta Anual" />
                  <Feature text="Avanços & Performance" />
                  <Feature text="Gestão de Equipe & Freelancers" />
                </div>
              </div>

              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                Escolher Completo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <TestimonialsSection />
        <ReassurancesBar />
      </div>
    </Layout>
  );
}

/* ============================= */
/* COMPONENTE FEATURE            */
/* ============================= */

function Feature({ text }: { text: string }) {
  return (
    <div className="flex gap-2">
      <Check className="w-4 h-4 text-green-500 mt-1" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
