import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, TrendingUp, Music, Calendar, DollarSign, FileText, ArrowRight, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const CHECKOUT_URL = "https://checkout.infinitepay.io/backstageprooficial/Vw3hOE2C8z";
const ORIGINAL_PRICE = 39.90;
const SALE_PRICE = 14.90;
const DISCOUNT_PERCENT = Math.round(((ORIGINAL_PRICE - SALE_PRICE) / ORIGINAL_PRICE) * 100);

interface Benefit {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export default function PlanilhaCantoressVenda() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("user_id", user.id)
          .single();

        setUserPlan(profile?.plan || null);
      } catch (error) {
        console.error("Erro ao buscar plano:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hasPlan = userPlan && userPlan !== "free";

  const benefits: Benefit[] = [
    {
      icon: Music,
      title: "Organiza seus cachês",
      description: "Acompanhe cada apresentação e quanto você recebeu",
    },
    {
      icon: Calendar,
      title: "Calendário de shows",
      description: "Veja todos os seus compromissos em um só lugar",
    },
    {
      icon: DollarSign,
      title: "Controle de despesas",
      description: "Saiba exatamente onde seu dinheiro está indo",
    },
    {
      icon: TrendingUp,
      title: "Análise de rentabilidade",
      description: "Veja qual tipo de show é mais lucrativo pra você",
    },
    {
      icon: FileText,
      title: "Relatórios automáticos",
      description: "Gere relatórios mensais e anuais em segundos",
    },
    {
      icon: Zap,
      title: "Fácil de usar",
      description: "Sem complicação, sem aprender a usar sistema complexo",
    },
  ];

  const promos = [
    "✅ Acesso vitalício - pague uma vez, use para sempre",
    "✅ Atualizações gratuitas - novas funcionalidades sem custo",
    "✅ Suporte via chat - time pronto pra ajudar",
    "✅ Compatível com Excel e Google Sheets",
  ];

  return (
    <Layout title="" subtitle="">
      {/* Hero Section */}
      <div className="relative min-h-screen pt-20 pb-20 bg-gradient-to-b from-violet-950/40 via-background to-background overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-10 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          {/* Discount Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-red-400" />
              <span className="text-sm font-bold text-red-300">
                🔥 DESCONTO DE {DISCOUNT_PERCENT}% - Apenas agora!
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
                  Planilha para{" "}
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                    Cantores
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-white/70 leading-relaxed">
                  Organize seus cachês, shows e despesas em um só lugar. Saiba exatamente quanto você está ganhando.
                </p>
              </div>

              {/* Price Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-sm text-white/60 line-through">
                      R$ {ORIGINAL_PRICE.toFixed(2).replace(".", ",")}
                    </div>
                    <div className="text-5xl font-black text-white">
                      R$ {SALE_PRICE.toFixed(2).replace(".", ",")}
                    </div>
                    <div className="text-sm text-white/60 mt-1">
                      Pagamento único. Acesso vitalício.
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                      <span className="text-2xl font-black text-red-400">{DISCOUNT_PERCENT}%</span>
                    </div>
                    <span className="text-xs text-red-400 font-bold mt-2">OFF</span>
                  </div>
                </div>

                {/* CTA Button */}
                {!hasPlan ? (
                  <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-lg py-6 rounded-xl shadow-lg hover:shadow-2xl transition-all"
                    >
                      <Music className="w-5 h-5 mr-2" />
                      COMPRAR AGORA - R$ {SALE_PRICE.toFixed(2).replace(".", ",")}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </a>
                ) : (
                  <Button
                    size="lg"
                    disabled
                    className="w-full bg-green-600/50 text-white font-bold text-lg py-6 rounded-xl"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Você tem acesso ao Backstage PRO
                  </Button>
                )}
              </div>

              {/* Promos */}
              <div className="space-y-2">
                {promos.map((promo, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-white/80">
                    <span>{promo}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Visual */}
            <div className="relative hidden lg:block">
              <div className="space-y-4">
                {/* Mock spreadsheet visual */}
                <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 p-6 backdrop-blur-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-3/4 h-4 bg-white/10 rounded"></div>
                      <div className="w-1/4 h-4 bg-green-500/20 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-1/2 h-4 bg-white/10 rounded"></div>
                      <div className="w-1/3 h-4 bg-blue-500/20 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-2/3 h-4 bg-white/10 rounded"></div>
                      <div className="w-1/4 h-4 bg-purple-500/20 rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-24 rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 backdrop-blur-sm"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">O que você vai conseguir</h2>
          <p className="text-lg text-white/60">
            Tudo o que você precisa para organizar sua carreira musical
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="group p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-white/60">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-4 sm:px-6 bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Como funciona</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "1",
                title: "Compre agora",
                description: "Acesso imediato após o pagamento",
              },
              {
                number: "2",
                title: "Baixe a planilha",
                description: "Receba por email pronta pra usar",
              },
              {
                number: "3",
                title: "Comece a organizar",
                description: "Organize seus shows e ganhe mais",
              },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center mx-auto mb-4 text-2xl font-black">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-white/60">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">Quem já usa</h2>
          <p className="text-lg text-white/60">
            Centenas de cantores já organizaram sua carreira com a Planilha
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              name: "Marina S.",
              role: "Cantora",
              comment: "Finalmente sei quanto estou ganhando em cada show!",
            },
            {
              name: "Lucas B.",
              role: "Músico",
              comment: "Organizei todas minhas despesas e achei onde cortava gastos",
            },
          ].map((testimonial, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/80 mb-4 italic">"{testimonial.comment}"</p>
              <div>
                <p className="font-bold">{testimonial.name}</p>
                <p className="text-sm text-white/60">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Before Upsell */}
      <div className="py-12 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        {!hasPlan && (
          <>
            <h2 className="text-3xl font-black mb-4">Ainda está na dúvida?</h2>
            <p className="text-lg text-white/60 mb-8">
              Garanta seu acesso agora com {DISCOUNT_PERCENT}% de desconto
            </p>
            <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-lg py-6 px-8 rounded-xl shadow-lg hover:shadow-2xl transition-all"
              >
                FINALIZAR COMPRA - R$ {SALE_PRICE.toFixed(2).replace(".", ",")}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </>
        )}
      </div>

      {/* Upsell - Backstage PRO */}
      <div className="py-20 px-4 sm:px-6 bg-gradient-to-b from-violet-950/40 to-background border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 p-8 sm:p-12 backdrop-blur-sm">
            <div className="flex items-start gap-4 mb-6">
              <Gift className="w-8 h-8 text-violet-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-bold text-violet-300 uppercase tracking-wider mb-2">
                  Próximo passo
                </h3>
                <h2 className="text-3xl sm:text-4xl font-black mb-4">
                  Quer organizar tudo sua carreira?
                </h2>
                <p className="text-lg text-white/70 mb-8 max-w-2xl">
                  Com <span className="font-bold text-violet-300">Backstage PRO</span>, você tem acesso a ferramentas completas: Backs Radar pra encontrar oportunidades, gestão de contatos, contratos, financeiro e muito mais.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    "🎯 Backs Radar - encontre oportunidades de shows",
                    "📊 Dashboard com todas suas métricas",
                    "💼 Gestão de contratos e cachês",
                    "📱 App mobile completo",
                    "🚀 Suporte prioritário",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-white/80">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => navigate("/planos")}
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-lg py-6 px-8 rounded-xl shadow-lg hover:shadow-2xl transition-all"
                >
                  CONHEÇA OS PLANOS
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <h2 className="text-4xl font-black text-center mb-16">Dúvidas comuns</h2>

        <div className="space-y-4">
          {[
            {
              q: "Como funciona a compra?",
              a: "Você clica no botão 'Comprar Agora', faz o pagamento de forma segura e recebe a planilha por email imediatamente.",
            },
            {
              q: "É seguro comprar?",
              a: "Sim! Usamos a InfinityPay, uma plataforma de pagamento 100% segura e confiável.",
            },
            {
              q: "Posso usar em qualquer lugar?",
              a: "Sim! A planilha funciona em Excel, Google Sheets e qualquer programa de planilhas.",
            },
            {
              q: "Tem suporte?",
              a: "Claro! Você tem suporte via chat caso tenha dúvidas sobre como usar a planilha.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              <h3 className="font-bold text-lg mb-2">{item.q}</h3>
              <p className="text-white/70">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          {!hasPlan && (
            <>
              <h2 className="text-4xl font-black mb-6">
                Pronto pra organizar sua carreira?
              </h2>
              <p className="text-lg text-white/60 mb-8">
                Invista R$ {SALE_PRICE.toFixed(2).replace(".", ",")} e receba a Planilha para Cantores
              </p>
              <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold text-lg py-6 rounded-xl shadow-lg hover:shadow-2xl transition-all"
                >
                  COMPRAR AGORA - R$ {SALE_PRICE.toFixed(2).replace(".", ",")}
                </Button>
              </a>
              <p className="text-sm text-white/50 mt-4">
                Pagamento seguro via InfinityPay • Acesso vitalício • Garantia de satisfação
              </p>
            </>
          )}
          {hasPlan && (
            <div className="p-8 rounded-xl border border-green-500/30 bg-green-500/10 backdrop-blur-sm">
              <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                Você tem acesso completo!
              </h3>
              <p className="text-white/70 mb-6">
                Como cliente Backstage PRO, você já tem acesso à Planilha para Cantores e muitas outras ferramentas.
              </p>
              <Button
                onClick={() => navigate("/dashboard")}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-xl"
              >
                IR PARA O DASHBOARD
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
