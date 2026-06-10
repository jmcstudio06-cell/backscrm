import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  MessageSquare, GitBranch, Bot, Zap, Check, ArrowRight,
  Download, Link2, TrendingUp, Shield, Star,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Backs ZapCRM — CRM e Automação para WhatsApp" },
      { name: "description", content: "Extensão de WhatsApp CRM: organize chats, crie funis de vendas e automatize mensagens. Teste grátis." },
      { property: "og:title", content: "Backs ZapCRM — Transforme seu WhatsApp em CRM" },
      { property: "og:description", content: "Organize chats, monte funis e automatize seu WhatsApp em minutos." },
    ],
  }),
  component: LandingPage,
});

const features = [
  { icon: MessageSquare, title: "Organização de Chats", desc: "Etiquetas, filtros e categorização inteligente para nunca perder um lead." },
  { icon: GitBranch, title: "Funis de Vendas", desc: "Acompanhe cada contato por etapa: novo, em negociação, fechado ou perdido." },
  { icon: Bot, title: "Automações", desc: "Respostas automáticas, mensagens em massa e gatilhos por palavras-chave." },
  { icon: Zap, title: "Facilidade de Uso", desc: "Instalou, abriu o WhatsApp Web e já está pronto. Sem configurações complexas." },
];

const steps = [
  { icon: Download, title: "Instale a extensão", desc: "Adicione o Backs ZapCRM ao Chrome em menos de 30 segundos." },
  { icon: Link2, title: "Conecte seu WhatsApp", desc: "Abra o WhatsApp Web e nosso CRM aparece automaticamente ao lado." },
  { icon: TrendingUp, title: "Venda mais", desc: "Organize leads, automatize e acompanhe o resultado em tempo real." },
];

const plans = [
  { name: "Mensal", price: "49,90", period: "/mês", desc: "Ideal para começar", highlight: false, features: ["Acesso total ao CRM", "Funis ilimitados", "Automações", "Suporte por e-mail"] },
  { name: "Trimestral", price: "129,90", period: "/3 meses", desc: "Economia de 14%", highlight: true, features: ["Tudo do Mensal", "Suporte prioritário", "Onboarding guiado", "13% de desconto"] },
  { name: "Anual", price: "399,90", period: "/ano", desc: "Melhor custo-benefício", highlight: false, features: ["Tudo do Trimestral", "33% de desconto", "Atualizações premium", "Consultoria 1:1"] },
];

const faqs = [
  { q: "Como funciona a Backs ZapCRM?", a: "É uma extensão do Chrome que adiciona um painel de CRM ao seu WhatsApp Web. Tudo roda no seu navegador, com sincronização segura." },
  { q: "Posso testar grátis?", a: "Sim. Ao se cadastrar, você ganha acesso de teste para conhecer todas as funcionalidades antes de assinar." },
  { q: "Funciona com WhatsApp Business?", a: "Sim, é compatível com WhatsApp e WhatsApp Business via WhatsApp Web." },
  { q: "Minhas conversas ficam seguras?", a: "Sim. Os dados de licença ficam no nosso servidor; suas conversas permanecem no WhatsApp Web." },
];

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-brand opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.82_0.18_220/0.4),transparent_60%)]" />
          <div className="container relative mx-auto px-4 py-20 md:py-32">
            <div className="mx-auto max-w-4xl text-center">
              <Badge variant="secondary" className="mb-6 border-cyan/30 bg-cyan/10 text-cyan backdrop-blur">
                <Star className="mr-1.5 h-3 w-3 fill-cyan" /> Nova versão disponível
              </Badge>
              <h1 className="text-balance font-display text-4xl font-bold leading-tight text-white md:text-6xl">
                Transforme seu WhatsApp em um{" "}
                <span className="text-gradient-brand">CRM profissional</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/80 md:text-xl">
                Organize chats, monte funis de vendas e automatize mensagens direto no WhatsApp Web.
                Sem complicação, sem servidores próprios.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="bg-cyan text-cyan-foreground hover:bg-cyan/90 glow-cyan">
                  <Link to="/cadastro">
                    Começar grátis <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/10">
                  <a href="#planos">Ver planos</a>
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/60">
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-cyan" /> Teste grátis</span>
                <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-cyan" /> Sem cartão</span>
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-cyan" /> 100% seguro</span>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="recursos" className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Tudo que você precisa para <span className="text-gradient-brand">vender mais</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Recursos poderosos que se integram nativamente ao WhatsApp Web.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title} className="group relative overflow-hidden border-border/60 p-6 transition-all hover:border-cyan/50 hover:shadow-[var(--shadow-card)]">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-cyan/10 text-cyan transition-transform group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="como-funciona" className="bg-card/40 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Como funciona</h2>
              <p className="mt-4 text-muted-foreground">3 passos para começar a vender mais hoje.</p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
                <div key={s.title} className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-cyan glow-cyan">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan">Passo {i + 1}</div>
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="planos" className="container mx-auto px-4 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Planos para cada momento</h2>
            <p className="mt-4 text-muted-foreground">Cancele quando quiser. Sem fidelidade.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.name} className={`relative flex flex-col p-8 ${p.highlight ? "border-cyan shadow-[var(--shadow-glow)]" : "border-border/60"}`}>
                {p.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan text-cyan-foreground">Mais popular</Badge>
                )}
                <h3 className="font-display text-xl font-bold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="font-display text-4xl font-bold">{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.period}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className={`mt-8 ${p.highlight ? "bg-cyan text-cyan-foreground hover:bg-cyan/90" : ""}`} variant={p.highlight ? "default" : "outline"}>
                  <Link to="/cadastro">Começar agora</Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-card/40 py-20">
          <div className="container mx-auto max-w-3xl px-4">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Perguntas frequentes</h2>
              <p className="mt-4 text-muted-foreground">Tudo que você precisa saber antes de começar.</p>
            </div>
            <Accordion type="single" collapsible className="mt-10">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20">
          <Card className="overflow-hidden border-cyan/40 bg-gradient-brand p-10 text-center md:p-16">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Pronto para vender mais?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              Crie sua conta em 30 segundos e comece a usar o Backs ZapCRM agora.
            </p>
            <Button asChild size="lg" className="mt-8 bg-cyan text-cyan-foreground hover:bg-cyan/90 glow-cyan">
              <Link to="/cadastro">Começar grátis <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

