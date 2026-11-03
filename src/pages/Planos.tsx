import { useState, useEffect } from "react";
import { trackEvent } from "@/lib/metaPixel";
import { GiftClaimCard } from "@/components/gifts/GiftClaimCard";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  Shield,
  HeadphonesIcon,
  XCircle,
  Quote,
  Sparkles,
  Briefcase,
  Crown,
  ArrowRight,
  CalendarDays,
  CalendarRange,
  Loader2,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/black-plans.css";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


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

interface PlanDef {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  buttonText: string;
  highlight: boolean;
  badgeText: string;
  icon: React.ElementType;
  socialProof: string;
  features: string[];
  planKeyMonthly: string;
  planKeyYearly: string;
}

const plans: PlanDef[] = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "Comece a organizar sua carreira com as ferramentas essenciais do dia a dia.",
    price: "R$ 19,90",
    period: "/mês",
    buttonText: "Escolher Starter",
    highlight: false,
    badgeText: "COMECE AQUI",
    icon: Target,
    socialProof: "Ideal para quem está começando!",
    planKeyMonthly: "mensal_starter",
    planKeyYearly: "anual_starter",
    features: [
      "Agenda de Shows",
      "Resumo Financeiro",
      "Precificação",
      "Serviços e Produtos",
      "Avanços",
      "Tutoriais",
    ],
  },
  {
    id: "pro",
    name: "Profissional",
    subtitle: "Organize sua carreira e tenha as ferramentas para vender e executar seus shows profissionalmente.",
    price: "R$ 24,90",
    period: "/mês",
    buttonText: "Escolher Profissional",
    highlight: false,
    badgeText: "ESSENCIAL",
    icon: Briefcase,
    socialProof: "47 artistas estão nesse plano!",
    planKeyMonthly: "mensal_profissional",
    planKeyYearly: "anual_profissional",
    features: [
      "Tudo do Starter, mais:",
      "Clientes",
      "Repertório",
      "Orçamentos Automáticos",
      "Checklist de Show",
      "CRM do Artista",
      "Link da Bio / Press Kit",
      "Ideias de Post",
    ],
  },
  {
    id: "full",
    name: "Empresarial",
    subtitle: "Automatize sua operação e tenha controle completo da sua carreira como negócio.",
    price: "R$ 39,90",
    period: "/mês",
    buttonText: "Escolher Empresarial",
    highlight: true,
    badgeText: "MAIS POPULAR",
    icon: Crown,
    socialProof: "21 artistas estão nesse plano!",
    planKeyMonthly: "mensal_empresarial",
    planKeyYearly: "anual_empresarial",
    features: [
      "Tudo do Profissional, mais:",
      "Equipe & Freelancers",
      "Link de Agendamento Online",
      "Contratos Automáticos",
      "Histórico Financeiro",
      "Cobranças pendentes",
      "Mapeamento de Palco",
      "Metas",
      "Bônus",
      "Gestão de Usuários",
    ],
  },
];


function UrgencyBanner() {
  return (
    <div className="max-w-4xl mx-auto mb-10">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-2xl p-5 shadow-2xl border border-blue-400/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)]" />
        <div className="relative flex items-center gap-4 justify-center">
          <div className="bg-white/15 backdrop-blur-sm rounded-full p-2.5 shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-base">🔒 Preço Fixo Garantido</p>
            <p className="text-blue-100 text-sm font-medium mt-0.5">Assine hoje e mantenha esse valor para sempre, mesmo com reajustes futuros.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  return (
    <div className="max-w-5xl mx-auto mt-16">
      <div className="text-center mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Depoimentos</p>
        <h3 className="text-xl font-bold">Quem usa, sente a diferença</h3>
        <p className="text-sm text-muted-foreground mt-1">Feedback real de artistas e produtores</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((t) => (
          <div key={t.name} className="bg-gradient-to-b from-muted/50 to-muted/20 rounded-2xl p-6 border border-border/60 shadow-sm hover:shadow-md transition-shadow">
            <Quote className="w-6 h-6 text-primary/30 mb-3" />
            <p className="text-sm leading-relaxed mb-5 text-foreground/80">"{t.text}"</p>
            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{t.name[0]}</span>
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
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
    <div className="max-w-4xl mx-auto mt-12 mb-6">
      <div className="flex flex-wrap justify-center gap-8 rounded-2xl border border-border/60 bg-muted/20 backdrop-blur-sm p-5">
        {reassurances.map((item) => (
          <div key={item.text} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground/80">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoStrip() {
  return (
    <div className="max-w-4xl mx-auto mt-10 mb-14">
      <div className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-foreground">Comece pelo Starter e evolua quando quiser.</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            A troca de plano é simples. Suba de nível conforme sua carreira cresce.
          </p>
        </div>
        <div className="shrink-0 text-sm bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-2 text-amber-700 dark:text-amber-400 font-semibold whitespace-nowrap">
          🏆 Empresarial é o mais escolhido
        </div>
      </div>
    </div>
  );
}

function BlackCountdown() {
  const target = new Date(2026, 10, 30, 23, 59, 59).getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, target - now);
  const parts = [
    [Math.floor(diff / 86400000), "dias"],
    [Math.floor(diff / 3600000) % 24, "horas"],
    [Math.floor(diff / 60000) % 60, "min"],
    [Math.floor(diff / 1000) % 60, "seg"],
  ] as const;
  if (diff === 0) return null;
  return (
    <div className="bf-countdown" aria-label="Tempo restante da Black Friday">
      {parts.map(([v, l]) => (
        <div key={l} className="bf-count-box"><strong>{String(v).padStart(2, "0")}</strong><span>{l}</span></div>
      ))}
    </div>
  );
}

export default function Planos() {
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [lastPaidPlan, setLastPaidPlan] = useState<string | null>(null);
  const [monthlyBlocked, setMonthlyBlocked] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("plan, last_paid_plan, feature_blocks").eq("user_id", user.id).maybeSingle();
      if (data) {
        setUserPlan(data.plan);
        setLastPaidPlan(data.last_paid_plan);
        const fb = (data.feature_blocks ?? {}) as Record<string, boolean>;
        if (fb.block_monthly_billing === true) {
          setMonthlyBlocked(true);
          setIsYearly(true);
        }
      }
    }
    fetchPlan();
  }, []);

  const planUsedForRenewal = userPlan === "comprou_expirado" ? lastPaidPlan : userPlan;

  const getUserPlanTier = (): string | null => {
    if (!planUsedForRenewal) return null;
    if (planUsedForRenewal.includes("starter")) return "starter";
    if (planUsedForRenewal.includes("profissional")) return "pro";
    if (planUsedForRenewal.includes("completo") || planUsedForRenewal.includes("empresarial")) return "full";
    if (planUsedForRenewal.includes("executivo")) return "executivo";
    return null;
  };
  const userTier = getUserPlanTier();
  const paidTierRank: Record<string, number> = { starter: 0, pro: 1, full: 2, executivo: 3 };
  const hasPaidPlan = userTier !== null;

  const handleSubscribe = async (planKey: string) => {
    setLoadingPlan(planKey);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para assinar um plano.");
        return;
      }
      const { data, error } = await supabase.functions.invoke("prepare-infinitepay-checkout", {
        body: { plan_key: planKey },
      });
      if (error || !data?.checkout_url) {
        console.error("InfinitePay checkout error:", error, data);
        toast.error("Não foi possível preparar o checkout.");
        return;
      }
      trackEvent("InitiateCheckout", { content_name: planKey });
      toast.success("Redirecionando para pagamento...");
      window.location.href = data.checkout_url;
    } catch (err) {
      console.error("Subscribe error:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <Layout title="" subtitle="">
      <div className="bf-plans pt-6 pb-16">
        <div className="bf-ribbon" aria-hidden="true">
          <div className="bf-ribbon-track">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>BLACK FRIDAY ✦ BACKSTAGE PRO ✦ OFERTA POR TEMPO LIMITADO ✦ BLACK FRIDAY ✦ PREÇO FIXO GARANTIDO ✦ </span>
            ))}
          </div>
        </div>

        <section className="bf-hero">
          <div className="bf-glow bf-glow-a" />
          <div className="bf-glow bf-glow-b" />
          <span className="bf-chip"><Sparkles className="w-3.5 h-3.5" /> Black Friday Backstage Pro</span>
          <h2 className="bf-title">
            A sua carreira<br /><span>no modo Black.</span>
          </h2>
          <p className="bf-sub">Escolha seu plano e garanta o valor de hoje para sempre, mesmo com reajustes futuros.</p>
          <BlackCountdown />
        </section>

        <div className="flex justify-center mb-10">
          <div className="bf-toggle">
            {!monthlyBlocked && (
              <button onClick={() => setIsYearly(false)} className={cn("bf-toggle-btn", !isYearly && "is-active")}>
                <CalendarDays className="w-4 h-4" />
                Mensal
              </button>
            )}
            <button onClick={() => setIsYearly(true)} className={cn("bf-toggle-btn", isYearly && "is-active")}>
              <CalendarRange className="w-4 h-4" />
              Anual
              <span className="bf-save">ECONOMIZE</span>
            </button>
          </div>
        </div>
        {monthlyBlocked && (
          <p className="text-center text-xs bf-muted -mt-6 mb-8 font-medium">
            Apenas planos anuais estão disponíveis para sua conta.
          </p>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch justify-center">

            {plans.map((p) => {
              const pricing: Record<string, { monthly: number; yearlyOld: string; yearlyNew: string; installment: string }> = {
                starter: { monthly: 19.9, yearlyOld: "238,80", yearlyNew: "149,90", installment: "12,49" },
                pro: { monthly: 24.9, yearlyOld: "298,80", yearlyNew: "199,90", installment: "16,66" },
                full: { monthly: 39.9, yearlyOld: "478,80", yearlyNew: "298,80", installment: "24,90" },
                executivo: { monthly: 79.9, yearlyOld: "958,80", yearlyNew: "499,90", installment: "41,66" },
              };
              const planPricing = pricing[p.id];
              const monthlyValue = planPricing.monthly;
              const yearlyOldPrice = planPricing.yearlyOld;
              const yearlyNewPrice = planPricing.yearlyNew;
              const yearlyInstallment = planPricing.installment;

              const finalPrice = isYearly ? `R$ ${yearlyNewPrice}` : `R$ ${monthlyValue.toFixed(2).replace(".", ",")}`;
              const finalPlanKey = isYearly ? p.planKeyYearly : p.planKeyMonthly;
              
              const finalPeriod = isYearly ? "/ano" : "/mês";
              const isLoading = loadingPlan === finalPlanKey;
              const isLowerTier = userTier !== null && paidTierRank[p.id] < paidTierRank[userTier];

              const theme = {
                iconBg: "bf-icon", iconText: "", badge: "bf-badge", check: "bf-check",
                checkBg: "bf-price", button: "bf-cta", accent: "bf-accent", priceAccent: "bf-price-value",
              };

              const PlanIcon = p.icon;

              return (
                <Card
                  key={p.id}
                  className={cn("bf-card relative h-full flex flex-col overflow-visible", p.highlight && "is-highlight")}
                >
                  {p.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="bf-top-badge">
                        <Sparkles className="w-3 h-3" />
                        {p.badgeText}
                      </div>
                    </div>
                  )}

                  <CardContent className="p-6 sm:p-8 flex flex-col h-full gap-0">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md", theme.iconBg)}>
                        <PlanIcon className={cn("w-6 h-6", theme.iconText)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xl font-extrabold tracking-tight leading-tight">{p.name}</h3>
                          {!p.highlight && p.badgeText && (
                            <span className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full", theme.badge)}>
                              {p.badgeText}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-2">{p.subtitle}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className={cn("rounded-2xl p-4 mb-5", theme.checkBg)}>
                      {isYearly ? (
                        <>
                          <p className="text-xs text-muted-foreground line-through">R$ {yearlyOldPrice}/ano</p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className={cn("text-4xl font-black tracking-tighter", theme.priceAccent)}>R$ {yearlyInstallment}</span>
                            <span className="text-sm text-muted-foreground font-medium">/mês</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            ou <span className="font-bold text-foreground">R$ {yearlyNewPrice}</span> à vista por ano
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1.5">
                            <span className={cn("text-4xl font-black tracking-tighter", theme.priceAccent)}>
                              R$ {monthlyValue.toFixed(2).replace(".", ",")}
                            </span>
                            <span className="text-sm text-muted-foreground font-medium">/mês</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Cobrança mensal. Cancele quando quiser.</p>
                        </>
                      )}
                    </div>

                    {/* Features */}
                    <div className="flex-1 mb-6">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-3">
                        Incluso no plano
                      </p>
                      <ul className="space-y-2">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm">
                            <Check className={cn("w-4 h-4 shrink-0 mt-0.5 font-bold", theme.check)} />
                            <span className={cn(
                              "leading-snug",
                              i === 0 && p.features[0].startsWith("Tudo")
                                ? "font-semibold text-foreground"
                                : "text-foreground/80"
                            )}>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="mt-auto">
                      <Button
                        size="lg"
                        disabled={isLoading}
                        className={cn(
                          "w-full rounded-2xl font-bold text-sm h-12", theme.button
                        )}
                        onClick={() => handleSubscribe(finalPlanKey)}
                      >
                        {isLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processando...</>
                        ) : hasPaidPlan && userTier === p.id ? (
                          <>Renovar assinatura <ArrowRight className="w-4 h-4 ml-1.5" /></>
                        ) : isLowerTier ? (
                          <>Mudar para este plano <ArrowRight className="w-4 h-4 ml-1.5" /></>
                        ) : hasPaidPlan ? (
                          <>Fazer upgrade <ArrowRight className="w-4 h-4 ml-1.5" /></>
                        ) : (
                          <>{p.buttonText} <ArrowRight className="w-4 h-4 ml-1.5" /></>
                        )}
                      </Button>
                      {p.socialProof && (
                        <p className="text-xs text-center text-muted-foreground mt-2.5 flex items-center justify-center gap-1">
                          <Sparkles className={cn("w-3 h-3", theme.accent)} />
                          {p.socialProof}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <TestimonialsSection />
        <ReassurancesBar />

        {/* Token Parceiros e resgate de presentes — área Garantir Acesso */}
        <div className="max-w-6xl mx-auto mt-12">
          <GiftClaimCard />
        </div>
      </div>

    </Layout>
  );
}
