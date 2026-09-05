import { useState, useEffect } from "react";
import { GiftClaimCard } from "@/components/gifts/GiftClaimCard";
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
  CalendarDays,
  CalendarRange,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/layout/AppLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


// InfinitePay checkout URLs
const CHECKOUT_URLS: Record<string, string> = {
  mensal_starter: "https://checkout.infinitepay.io/backstagegroup/xSJTvKbev",
  mensal_profissional: "https://checkout.infinitepay.io/backstagegroup/3ppHyYNBMH",
  mensal_empresarial: "https://checkout.infinitepay.io/backstagegroup/7feafZpCUB",
  mensal_executivo: "https://checkout.infinitepay.io/backstagegroup/executivo-mensal",
  anual_starter: "https://checkout.infinitepay.io/backstagegroup/1uueQ3x5Jr",
  anual_profissional: "https://checkout.infinitepay.io/backstagegroup/1HH6RVTbeb",
  anual_empresarial: "https://checkout.infinitepay.io/backstagegroup/1uuf5FwQOf",
  anual_executivo: "https://checkout.infinitepay.io/backstagegroup/executivo-anual",
};

const PLAN_AMOUNTS: Record<string, number> = {
  mensal_starter: 1990,
  mensal_profissional: 2490,
  mensal_empresarial: 3990,
  mensal_executivo: 7990,
  anual_starter: 14990,
  anual_profissional: 19990,
  anual_empresarial: 29880,
  anual_executivo: 49990,
};

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
    subtitle: "Comece a organizar sua carreira musical com o essencial.",
    price: "R$ 19,90",
    period: "/mês",
    buttonText: "Escolher Starter",
    highlight: false,
    badgeText: "ESSENCIAL",
    icon: Sparkles,
    socialProof: "",
    planKeyMonthly: "mensal_starter",
    planKeyYearly: "anual_starter",
    features: ["Dashboard", "Agenda ilimitada", "Resumo Financeiro", "Precificação", "Avanços", "Tutoriais", "Configurações"],
  },
  {
    id: "pro",
    name: "Profissional",
    subtitle: "Organize sua área comercial e feche mais shows com processos profissionais.",
    price: "R$ 24,90",
    period: "/mês",
    buttonText: "Escolher Profissional",
    highlight: true,
    badgeText: "MAIS POPULAR",
    icon: Briefcase,
    socialProof: "47 artistas estão nesse plano!",
    planKeyMonthly: "mensal_profissional",
    planKeyYearly: "anual_profissional",
    features: [
      "Tudo do Starter +",
      "Clientes",
      "Repertório",
      "Radar de Shows",
      "Orçamentos Automáticos",
      "Checklist de Show",
      "Equipe & Freelancers",
      "Link da bio (Press Kit)",
    ],
  },
  {
    id: "full",
    name: "Empresarial",
    subtitle: "Controle total da carreira, com metas, performance e gestão completa do seu negócio.",
    price: "R$ 39,90",
    period: "/mês",
    buttonText: "Escolher Empresarial",
    highlight: false,
    badgeText: "TUDO LIBERADO",
    icon: Crown,
    socialProof: "21 artistas estão nesse plano!",
    planKeyMonthly: "mensal_empresarial",
    planKeyYearly: "anual_empresarial",
    features: [
      "Tudo do Profissional +",
      "Link Agendamento Online",
      "Contratos Automáticos",
      "Histórico Financeiro",
      "Mapeamento de Palco",
      "Metas",
      "Bônus",
    ],
  },
];

function UrgencyBanner() {
  return (
    <div className="max-w-5xl mx-auto mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 shadow-xl border border-blue-400/30">
        <div className="flex items-center gap-3 justify-center">
          <div className="bg-white/20 rounded-full p-2.5">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">Preço Fixo Garantido</p>
            <p className="text-white/90 text-sm font-medium">Clientes que aderem à plataforma e mantêm a assinatura em dia permanecem sempre com esse valor.</p>
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
          <p className="font-semibold">Comece pelo Starter e evolua quando quiser.</p>
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
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [monthlyBlocked, setMonthlyBlocked] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("plan, feature_blocks").eq("user_id", user.id).maybeSingle();
      if (data) {
        setUserPlan(data.plan);
        const fb = (data.feature_blocks ?? {}) as Record<string, boolean>;
        if (fb.block_monthly_billing === true) {
          setMonthlyBlocked(true);
          setIsYearly(true);
        }
      }
    }
    fetchPlan();
  }, []);

  const isActiveOrExpiredPaid = userPlan && !["trial", "expirado", null].includes(userPlan);

  const getUserPlanTier = (): string | null => {
    if (!userPlan) return null;
    if (userPlan.includes("starter")) return "starter";
    if (userPlan.includes("profissional")) return "pro";
    if (userPlan.includes("completo") || userPlan.includes("empresarial")) return "full";
    if (userPlan === "comprou_expirado") return "comprou_expirado";
    return null;
  };
  const userTier = getUserPlanTier();

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
      <div className="pt-8 pb-16">
        <UrgencyBanner />

        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Escolha o plano ideal para sua carreira</h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Menos improviso. Mais controle. Comece hoje.</p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="flex bg-muted p-1 rounded-full border">
            {!monthlyBlocked && (
              <button
                onClick={() => setIsYearly(false)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                  !isYearly ? "bg-white shadow text-foreground" : "text-muted-foreground",
                )}
              >
                <CalendarDays className="w-4 h-4" />
                Mensal
              </button>
            )}
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                isYearly ? "bg-white shadow text-foreground" : "text-muted-foreground",
              )}
            >
              <CalendarRange className="w-4 h-4" />
              Anual
            </button>
          </div>
        </div>
        {monthlyBlocked && (
          <p className="text-center text-xs text-muted-foreground -mt-6 mb-8 font-medium">
            Apenas planos anuais estão disponíveis para sua conta.
          </p>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((p) => {
              const isStarter = p.id === "starter";
              const isPro = p.id === "pro";
              const monthlyValue = isStarter ? 19.9 : isPro ? 24.9 : 39.9;
              const yearlyOldPrice = isStarter ? "238,80" : isPro ? "298,80" : "478,80";
              const yearlyNewPrice = isStarter ? "149,90" : isPro ? "199,90" : "298,80";
              const yearlyInstallment = isStarter ? "12,49" : isPro ? "16,66" : "24,90";

              const finalPrice = isYearly ? `R$ ${yearlyNewPrice}` : `R$ ${monthlyValue.toFixed(2).replace(".", ",")}`;
              const finalPlanKey = isYearly ? p.planKeyYearly : p.planKeyMonthly;
              
              const finalPeriod = isYearly ? "/ano" : "/mês";
              const isLoading = loadingPlan === finalPlanKey;

              return (
                <Card
                  key={p.id}
                  className={cn(
                    "relative rounded-3xl border shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl h-full flex flex-col",
                    isStarter
                      ? "border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-green-50"
                      : p.highlight
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 via-white to-cyan-50"
                      : "border-amber-400 bg-gradient-to-br from-amber-50 via-white to-orange-50",
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
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center">
                        <AppLogo size="sm" collapsed />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{p.name}</h3>
                        <p className="text-sm text-muted-foreground font-medium">{p.subtitle}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      {isYearly && (
                        <p className="text-sm text-red-600 line-through mb-1 font-semibold">
                          De: R$ {yearlyOldPrice}
                        </p>
                      )}

                      {isYearly ? (
                        <>
                          <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold">12x de R$ {yearlyInstallment}</span>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium mt-1">
                            ou R$ {yearlyNewPrice} à vista /ano
                          </p>
                        </>
                      ) : (
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-bold">{finalPrice}</span>
                          <span className="text-sm text-muted-foreground mb-1 font-medium">{finalPeriod}</span>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        {isYearly ? "Cobrança anual pré-paga." : "Cobrança mensal pré-paga. Cancele quando quiser."}
                      </p>
                    </div>

                    <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-white/40 via-white/20 to-white/40 mb-6 flex-1">
                      <div className="rounded-2xl bg-background/80 backdrop-blur-md border border-white/20 shadow-inner p-6 h-full">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                          O que inclui
                        </p>
                        <ul className="space-y-3">
                          {p.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm font-medium">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Button
                        size="lg"
                        disabled={isLoading}
                        className={cn(
                          "w-full rounded-2xl text-white font-semibold shadow-md",
                          isActiveOrExpiredPaid && userTier === p.id
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-500"
                            : p.highlight
                            ? "bg-gradient-to-r from-blue-600 to-cyan-500"
                            : "bg-gradient-to-r from-primary to-blue-600",
                        )}
                        onClick={() => handleSubscribe(finalPlanKey)}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Processando...
                            </>
                          ) : isActiveOrExpiredPaid && userTier === p.id ? (
                            <>
                              Renovar assinatura
                              <ArrowRight className="w-4 h-4" />
                            </>
                          ) : isActiveOrExpiredPaid ? (
                            <>
                              Renovar plano
                              <ArrowRight className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              {p.buttonText}
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
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

        {/* Token Parceiros e resgate de presentes — área Garantir Acesso */}
        <div className="max-w-6xl mx-auto mt-12">
          <GiftClaimCard />
        </div>
      </div>

    </Layout>
  );
}
