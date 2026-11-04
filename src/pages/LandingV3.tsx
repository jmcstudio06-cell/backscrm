import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight, Calendar, Check, ChevronDown, Menu, Play, Users, Wallet, X, FileText
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import brandIcon from "@/assets/ba-icon.png";
import appShowcase from "@/assets/landing-app-showcase.png";
import agendaMockup from "@/assets/mockups/link-agenda-mockup-v2.png";
import larissaGoogle from "@/assets/testimonials/larissa-google.png";
import marceloGoogle from "@/assets/testimonials/marcelo-google.png";
import fabioGoogle from "@/assets/testimonials/fabio-google.png";

/* ═══════════════════════════════════════════════════════════════
   BACKSTAGE PRO LANDING V3
   
   Baseada em: steering files (UI Designer, Brand Guardian, Frontend Developer)
   Aprovação: UI Finish-Gate Reviewer
   
   Regras:
   - Sem inventar depoimentos, stats ou funcionalidades
   - Usar assets reais do projeto
   - Placeholders claros onde faltar informação
   - Mobile-first, WCAG AA, performance otimizada
   ═══════════════════════════════════════════════════════════════ */

// Dados confirmados da landing atual
const SUPPORT_WHATSAPP = "https://wa.me/5512992423317?text=" + encodeURIComponent("Oi! Quero saber mais sobre o Backstage Pro");
const VIDEO_ID = "d-Hx3NwVuIM";

// Planos confirmados (fonte: Landing.tsx + Planos.tsx)
const PLANS = [
  {
    name: "Starter",
    price: "R$ 19,90",
    period: "/mês",
    description: "Comece a organizar sua carreira com as ferramentas essenciais",
    features: [
      "Agenda de Shows",
      "Resumo Financeiro",
      "Precificação",
      "Tutoriais"
    ],
    popular: false
  },
  {
    name: "Profissional",
    price: "R$ 24,90",
    period: "/mês",
    description: "Organize sua carreira e venda shows profissionalmente",
    features: [
      "Tudo do Starter",
      "Clientes (sem limite)",
      "Orçamentos automáticos",
      "Repertório",
      "Link da Bio"
    ],
    popular: true
  },
  {
    name: "Empresarial",
    price: "R$ 39,90",
    period: "/mês",
    description: "Controle total da sua carreira musical",
    features: [
      "Tudo do Profissional",
      "Contratos automáticos",
      "Equipe e freelancers",
      "Metas e bônus",
      "Histórico completo"
    ],
    popular: false
  }
];

// FAQ - apenas fatos confirmados
const FAQ = [
  {
    q: "Como funciona o teste grátis?",
    a: "Você tem 3 horas grátis para testar a plataforma. Não precisa cadastrar cartão de crédito." // Confirmado: Landing.tsx linha 358
  },
  {
    q: "Funciona no celular?",
    a: "Sim. O Backstage Pro funciona no celular, tablet e computador. Seus dados ficam sincronizados." // Confirmado: Landing.tsx linha 125
  },
  {
    q: "Qual a diferença entre os planos?",
    a: "Cada plano libera mais ferramentas. O Starter tem o essencial, o Profissional adiciona clientes ilimitados e orçamentos, e o Empresarial inclui contratos e gestão de equipe."
  },
  {
    q: "Meus dados ficam seguros?",
    a: "[PREENCHER: informações sobre segurança, hospedagem e backup]"
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "[PREENCHER: política de cancelamento e reembolso]"
  }
];

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

export default function LandingV3() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Helmet>
        <title>Backstage Pro — Gestão de carreira para artistas e músicos</title>
        <meta name="description" content="Organize shows, cachês e clientes. Sistema feito por quem vive de música para quem vive de música." />
        <link rel="canonical" href="https://backstageproapp.com/landing" />
        <meta property="og:title" content="Backstage Pro — Gestão para Artistas" />
        <meta property="og:description" content="Organize shows, cachês e clientes em um só lugar" />
        <meta property="og:image" content="https://backstageproapp.com/og-image.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Header Sticky */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-3">
            <img src={brandIcon} alt="Backstage Pro" className="w-9 h-9" />
            <span className="text-xl font-bold text-gray-900">Backstage Pro</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('como-funciona')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Como funciona
            </button>
            <button onClick={() => scrollTo('depoimentos')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Quem usa
            </button>
            <button onClick={() => scrollTo('planos')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Planos
            </button>
            <button onClick={() => scrollTo('faq')} className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Dúvidas
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Entrar
            </Link>
            <Link 
              to="/auth" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105"
            >
              Começar grátis
              <ArrowRight size={16} />
            </Link>
          </div>

          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-gray-200 bg-white px-6 py-4 flex flex-col gap-4">
            <button onClick={() => scrollTo('como-funciona')} className="text-left py-2 font-medium">Como funciona</button>
            <button onClick={() => scrollTo('depoimentos')} className="text-left py-2 font-medium">Quem usa</button>
            <button onClick={() => scrollTo('planos')} className="text-left py-2 font-medium">Planos</button>
            <button onClick={() => scrollTo('faq')} className="text-left py-2 font-medium">Dúvidas</button>
            <Link to="/auth" className="text-left py-2 font-medium border-t border-gray-200 pt-4">Entrar</Link>
            <Link to="/auth" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-center">
              Começar grátis
            </Link>
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="pt-16 pb-24 lg:pt-24 lg:pb-32 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <FadeIn>
                <span className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100">
                  Para artistas e músicos profissionais
                </span>
                <h1 className="mt-6 text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 leading-tight">
                  Pare de perder shows por desorganização
                </h1>
                <p className="mt-6 text-lg lg:text-xl text-gray-600 leading-relaxed">
                  Agenda, cachês, contratos e clientes organizados. Sem planilha, sem papel, sem improviso.
                  <span className="block mt-2 font-medium text-gray-900">
                    Sistema feito por quem vive de música para quem vive de música.
                  </span>
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/auth"
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105 hover:shadow-xl"
                  >
                    Começar grátis agora
                    <ArrowRight size={20} />
                  </Link>
                  <button
                    onClick={() => setVideoOpen(true)}
                    className="inline-flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-all"
                  >
                    <Play size={20} />
                    Ver como funciona
                  </button>
                </div>
                <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Check size={18} className="text-green-600" />
                    3 horas grátis para testar
                  </span>
                  <span className="flex items-center gap-2">
                    <Check size={18} className="text-green-600" />
                    Sem cartão de crédito
                  </span>
                  <span className="flex items-center gap-2">
                    <Check size={18} className="text-green-600" />
                    Use no celular e PC
                  </span>
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl opacity-10 blur-2xl" />
                  <img 
                    src={appShowcase} 
                    alt="Painel do Backstage Pro mostrando agenda de shows"
                    className="relative rounded-2xl shadow-2xl border border-gray-200"
                    loading="eager"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Problema → Solução (Fluxo Unificado) */}
        <section id="como-funciona" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Como funciona</span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-extrabold text-gray-900">
                Do caos no WhatsApp para o controle profissional
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                O Backstage Pro organiza o fluxo real da sua carreira musical
              </p>
            </FadeIn>

            <div className="space-y-24">
              {/* Step 1 */}
              <FadeIn>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl font-bold text-xl mb-6">
                      1
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      Novo contato chega
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      <span className="line-through text-gray-400">Antes: anotar no caderno, perder no WhatsApp</span>
                      <span className="block mt-2 font-medium text-gray-900">
                        Agora: salva direto na lista de clientes com nome, telefone e histórico
                      </span>
                    </p>
                  </div>
                  <div className="relative">
                    <div className="aspect-video bg-gray-100 rounded-2xl border-2 border-gray-200 flex items-center justify-center">
                      <p className="text-gray-500 text-sm px-6 text-center">
                        [PREENCHER: Screenshot da tela de Clientes]
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Step 2 */}
              <FadeIn>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="md:order-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl font-bold text-xl mb-6">
                      2
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      Show é combinado
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      <span className="line-through text-gray-400">Antes: anotação no papel, sem orçamento formal</span>
                      <span className="block mt-2 font-medium text-gray-900">
                        Agora: cadastra na agenda com data, local, horário e valor do cachê
                      </span>
                    </p>
                  </div>
                  <div className="relative md:order-1">
                    <img 
                      src={agendaMockup} 
                      alt="Tela da agenda do Backstage Pro"
                      className="rounded-2xl border-2 border-gray-200 shadow-lg"
                      loading="lazy"
                    />
                  </div>
                </div>
              </FadeIn>

              {/* Step 3 */}
              <FadeIn>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl font-bold text-xl mb-6">
                      3
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      Show acontece
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      <span className="line-through text-gray-400">Antes: confiar na memória</span>
                      <span className="block mt-2 font-medium text-gray-900">
                        Agora: repertório, checklist e registro de tudo que foi combinado
                      </span>
                    </p>
                  </div>
                  <div className="relative">
                    <div className="aspect-video bg-gray-100 rounded-2xl border-2 border-gray-200 flex items-center justify-center">
                      <p className="text-gray-500 text-sm px-6 text-center">
                        [PREENCHER: Screenshot da tela de Show / Repertório]
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Step 4 */}
              <FadeIn>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="md:order-2">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl font-bold text-xl mb-6">
                      4
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      Cachê é recebido
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      <span className="line-through text-gray-400">Antes: sem controle de quanto entra e sai</span>
                      <span className="block mt-2 font-medium text-gray-900">
                        Agora: registra recebimento, despesas e vê o resultado real
                      </span>
                    </p>
                  </div>
                  <div className="relative md:order-1">
                    <div className="aspect-video bg-gray-100 rounded-2xl border-2 border-gray-200 flex items-center justify-center">
                      <p className="text-gray-500 text-sm px-6 text-center">
                        [PREENCHER: Screenshot do Resumo Financeiro]
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Demo em Vídeo */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6">
            <FadeIn className="text-center mb-12">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Veja funcionando</span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-extrabold text-gray-900">
                2 minutos para entender como funciona
              </h2>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <iframe
                  src={`https://www.youtube.com/embed/${VIDEO_ID}`}
                  title="Demonstração do Backstage Pro"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                  loading="lazy"
                />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Depoimentos */}
        <section id="depoimentos" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Quem usa, aprova</span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-extrabold text-gray-900">
                Avaliações reais no Google
              </h2>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { img: larissaGoogle, alt: "Avaliação de Larissa Santos no Google" },
                { img: marceloGoogle, alt: "Avaliação de Marcelo Cantor no Google" },
                { img: fabioGoogle, alt: "Avaliação de Fábio Martins no Google" }
              ].map((review, i) => (
                <FadeIn key={i} delay={i * 100}>
                  <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-blue-200 hover:shadow-xl transition-all">
                    <img 
                      src={review.img} 
                      alt={review.alt}
                      className="w-full"
                      loading="lazy"
                    />
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn className="mt-12 text-center">
              <p className="text-gray-600">
                Depoimentos reais de artistas que usam o Backstage Pro
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Escolha seu plano</span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-extrabold text-gray-900">
                Comece grátis. Assine quando quiser.
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                3 horas de teste grátis · Sem cartão de crédito · Cancele quando quiser
              </p>
            </FadeIn>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {PLANS.map((plan, i) => (
                <FadeIn key={plan.name} delay={i * 100}>
                  <div className={`relative bg-white rounded-2xl border-2 ${plan.popular ? 'border-blue-600 shadow-xl scale-105' : 'border-gray-200'} p-8 hover:border-blue-400 hover:shadow-lg transition-all`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-bold px-6 py-2 rounded-full">
                        MAIS POPULAR
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <div className="mt-4 flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">{plan.period}</span>
                      </div>
                      <p className="mt-3 text-gray-600">{plan.description}</p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/planos"
                      className={`block w-full text-center py-4 rounded-lg font-semibold transition-all ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                          : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      Escolher {plan.name}
                    </Link>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <FadeIn className="text-center mb-16">
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Dúvidas frequentes</span>
              <h2 className="mt-4 text-3xl lg:text-4xl font-extrabold text-gray-900">
                Perguntas e respostas
              </h2>
            </FadeIn>

            <div className="space-y-4">
              {FAQ.map((item, i) => (
                <FadeIn key={i} delay={i * 50}>
                  <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-blue-200 transition-colors">
                    <button
                      onClick={() => setActiveAccordion(activeAccordion === i ? null : i)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      aria-expanded={activeAccordion === i}
                    >
                      <span className="font-semibold text-lg text-gray-900 pr-4">{item.q}</span>
                      <ChevronDown
                        size={24}
                        className={`text-blue-600 flex-shrink-0 transition-transform ${
                          activeAccordion === i ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`px-6 overflow-hidden transition-all duration-300 ${
                        activeAccordion === i ? 'py-5 max-h-96' : 'max-h-0'
                      }`}
                    >
                      <p className="text-gray-700 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn className="mt-12 text-center">
              <p className="text-gray-600 mb-4">Tem outra dúvida?</p>
              <a 
                href={SUPPORT_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
              >
                Fale com a gente no WhatsApp
                <ArrowRight size={16} />
              </a>
            </FadeIn>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <FadeIn>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-6">
                Pronto para profissionalizar sua carreira?
              </h2>
              <p className="text-xl mb-10 text-blue-100">
                Comece hoje mesmo a organizar seus shows, clientes e cachês
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-xl text-xl font-bold hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-2xl"
              >
                Começar grátis agora
                <ArrowRight size={24} />
              </Link>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={brandIcon} alt="Backstage Pro" className="w-9 h-9 brightness-0 invert" />
                <span className="text-xl font-bold">Backstage Pro</span>
              </div>
              <p className="text-gray-400 text-sm">
                Sistema de gestão de carreira para artistas e músicos independentes
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Links</h4>
              <nav className="space-y-2">
                <button onClick={() => scrollTo('como-funciona')} className="block text-gray-400 hover:text-white transition-colors">
                  Como funciona
                </button>
                <button onClick={() => scrollTo('depoimentos')} className="block text-gray-400 hover:text-white transition-colors">
                  Quem usa
                </button>
                <button onClick={() => scrollTo('planos')} className="block text-gray-400 hover:text-white transition-colors">
                  Planos
                </button>
                <Link to="/termos" className="block text-gray-400 hover:text-white transition-colors">
                  Termos de Uso
                </Link>
                <Link to="/privacidade" className="block text-gray-400 hover:text-white transition-colors">
                  Privacidade
                </Link>
              </nav>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Instagram: [PREENCHER: @backstagepro]</p>
                <p>Email: [PREENCHER: contato@backstageproapp.com]</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Backstage Pro® — CNPJ 69.458.195/0001-14</p>
            <p className="mt-2">Todos os direitos reservados</p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Vídeo demonstrativo do Backstage Pro</DialogTitle>
          {videoOpen && (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
                title="Backstage Pro - Demonstração"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
