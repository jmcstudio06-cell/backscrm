import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { S as SiteHeader, B as Button, C as Card, a as SiteFooter, c as cn } from "./site-footer-DKV5A62Q.mjs";
import { B as Badge } from "./badge-DXeGp7w1.mjs";
import { R as Root2, I as Item, H as Header, T as Trigger2, C as Content2 } from "../_libs/radix-ui__react-accordion.mjs";
import "../_libs/sonner.mjs";
import { S as Star, A as ArrowRight, C as Check, a as Shield, M as MessageSquare, G as GitBranch, B as Bot, Z as Zap, D as Download, L as Link2, T as TrendingUp, b as ChevronDown } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./router-4m4lsCcr.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-collapsible.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-direction.mjs";
const Accordion = Root2;
const AccordionItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Item, { ref, className: cn("border-b", className), ...props }));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Trigger2,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = Trigger2.displayName;
const AccordionContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = Content2.displayName;
const features = [{
  icon: MessageSquare,
  title: "Organização de Chats",
  desc: "Etiquetas, filtros e categorização inteligente para nunca perder um lead."
}, {
  icon: GitBranch,
  title: "Funis de Vendas",
  desc: "Acompanhe cada contato por etapa: novo, em negociação, fechado ou perdido."
}, {
  icon: Bot,
  title: "Automações",
  desc: "Respostas automáticas, mensagens em massa e gatilhos por palavras-chave."
}, {
  icon: Zap,
  title: "Facilidade de Uso",
  desc: "Instalou, abriu o WhatsApp Web e já está pronto. Sem configurações complexas."
}];
const steps = [{
  icon: Download,
  title: "Instale a extensão",
  desc: "Adicione o Backs ZapCRM ao Chrome em menos de 30 segundos."
}, {
  icon: Link2,
  title: "Conecte seu WhatsApp",
  desc: "Abra o WhatsApp Web e nosso CRM aparece automaticamente ao lado."
}, {
  icon: TrendingUp,
  title: "Venda mais",
  desc: "Organize leads, automatize e acompanhe o resultado em tempo real."
}];
const plans = [{
  name: "Mensal",
  price: "49,90",
  period: "/mês",
  desc: "Ideal para começar",
  highlight: false,
  features: ["Acesso total ao CRM", "Funis ilimitados", "Automações", "Suporte por e-mail"]
}, {
  name: "Trimestral",
  price: "129,90",
  period: "/3 meses",
  desc: "Economia de 14%",
  highlight: true,
  features: ["Tudo do Mensal", "Suporte prioritário", "Onboarding guiado", "13% de desconto"]
}, {
  name: "Anual",
  price: "399,90",
  period: "/ano",
  desc: "Melhor custo-benefício",
  highlight: false,
  features: ["Tudo do Trimestral", "33% de desconto", "Atualizações premium", "Consultoria 1:1"]
}];
const faqs = [{
  q: "Como funciona a Backs ZapCRM?",
  a: "É uma extensão do Chrome que adiciona um painel de CRM ao seu WhatsApp Web. Tudo roda no seu navegador, com sincronização segura."
}, {
  q: "Posso testar grátis?",
  a: "Sim. Ao se cadastrar, você ganha acesso de teste para conhecer todas as funcionalidades antes de assinar."
}, {
  q: "Funciona com WhatsApp Business?",
  a: "Sim, é compatível com WhatsApp e WhatsApp Business via WhatsApp Web."
}, {
  q: "Minhas conversas ficam seguras?",
  a: "Sim. Os dados de licença ficam no nosso servidor; suas conversas permanecem no WhatsApp Web."
}];
function LandingPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-brand opacity-95" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.82_0.18_220/0.4),transparent_60%)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container relative mx-auto px-4 py-20 md:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-4xl text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "mb-6 border-cyan/30 bg-cyan/10 text-cyan backdrop-blur", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "mr-1.5 h-3 w-3 fill-cyan" }),
            " Nova versão disponível"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-balance font-display text-4xl font-bold leading-tight text-white md:text-6xl", children: [
            "Transforme seu WhatsApp em um",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-brand", children: "CRM profissional" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-6 max-w-2xl text-pretty text-lg text-white/80 md:text-xl", children: "Organize chats, monte funis de vendas e automatize mensagens direto no WhatsApp Web. Sem complicação, sem servidores próprios." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 flex flex-wrap items-center justify-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", className: "bg-cyan text-cyan-foreground hover:bg-cyan/90 glow-cyan", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/cadastro", children: [
              "Começar grátis ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", variant: "outline", className: "border-white/30 bg-white/5 text-white hover:bg-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#planos", children: "Ver planos" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-center gap-6 text-sm text-white/60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-cyan" }),
              " Teste grátis"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-cyan" }),
              " Sem cartão"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-cyan" }),
              " 100% seguro"
            ] })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "recursos", className: "container mx-auto px-4 py-20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-3xl font-bold md:text-4xl", children: [
            "Tudo que você precisa para ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient-brand", children: "vender mais" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: "Recursos poderosos que se integram nativamente ao WhatsApp Web." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4", children: features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "group relative overflow-hidden border-border/60 p-6 transition-all hover:border-cyan/50 hover:shadow-[var(--shadow-card)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-cyan/10 text-cyan transition-transform group-hover:scale-110", children: /* @__PURE__ */ jsxRuntimeExports.jsx(f.icon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold", children: f.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: f.desc })
        ] }, f.title)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "como-funciona", className: "bg-card/40 py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-bold md:text-4xl", children: "Como funciona" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: "3 passos para começar a vender mais hoje." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 grid gap-8 md:grid-cols-3", children: steps.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-cyan glow-cyan", children: /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 text-xs font-semibold uppercase tracking-wider text-cyan", children: [
            "Passo ",
            i + 1
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold", children: s.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: s.desc })
        ] }, s.title)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "planos", className: "container mx-auto px-4 py-20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-2xl text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-bold md:text-4xl", children: "Planos para cada momento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: "Cancele quando quiser. Sem fidelidade." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 grid gap-6 md:grid-cols-3", children: plans.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `relative flex flex-col p-8 ${p.highlight ? "border-cyan shadow-[var(--shadow-glow)]" : "border-border/60"}`, children: [
          p.highlight && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan text-cyan-foreground", children: "Mais popular" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-bold", children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: p.desc }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-baseline gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: "R$" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-4xl font-bold", children: p.price }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: p.period })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-6 flex-1 space-y-3", children: p.features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-cyan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: f })
          ] }, f)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: `mt-8 ${p.highlight ? "bg-cyan text-cyan-foreground hover:bg-cyan/90" : ""}`, variant: p.highlight ? "default" : "outline", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cadastro", children: "Começar agora" }) })
        ] }, p.name)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "faq", className: "bg-card/40 py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto max-w-3xl px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-bold md:text-4xl", children: "Perguntas frequentes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: "Tudo que você precisa saber antes de começar." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Accordion, { type: "single", collapsible: true, className: "mt-10", children: faqs.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(AccordionItem, { value: `item-${i}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionTrigger, { className: "text-left font-medium", children: f.q }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionContent, { className: "text-muted-foreground", children: f.a })
        ] }, i)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "container mx-auto px-4 py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden border-cyan/40 bg-gradient-brand p-10 text-center md:p-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-bold text-white md:text-4xl", children: "Pronto para vender mais?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-4 max-w-xl text-white/80", children: "Crie sua conta em 30 segundos e comece a usar o Backs ZapCRM agora." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, size: "lg", className: "mt-8 bg-cyan text-cyan-foreground hover:bg-cyan/90 glow-cyan", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/cadastro", children: [
          "Começar grátis ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 h-4 w-4" })
        ] }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
  ] });
}
export {
  LandingPage as component
};
