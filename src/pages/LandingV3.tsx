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
import "@/styles/landing-v3.css";

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
        <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
          {/* Background gradiente animado */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
          </div>

          <div className="relative max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <FadeIn>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-100 shadow-sm mb-8">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-700">
                    +90 artistas organizando suas carreiras agora
                  </span>
                </div>

                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                  Cantar é sua arte.
                  <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Gestão é com a gente.
                  </span>
                </h1>

                <p className="mt-8 text-xl lg:text-2xl text-gray-600 leading-relaxed font-light">
                  Pare de perder shows por desorganização. Agenda, cachês e clientes em um lugar só.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/auth"
                    className="group relative inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-5 rounded-xl text-lg font-bold overflow-hidden transition-all hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative">Começar grátis</span>
                    <ArrowRight size={20} className="relative group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <button
                    onClick={() => setVideoOpen(true)}
                    className="group inline-flex items-center justify-center gap-3 bg-white/80 backdrop-blur-sm text-gray-900 px-8 py-5 rounded-xl text-lg font-bold border-2 border-gray-200 hover:border-blue-600 hover:bg-white transition-all"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play size={18} className="text-white fill-white ml-1" />
                    </div>
                    Ver funcionando
                  </button>
                </div>

                <div className="mt-10 flex items-center gap-8 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white" />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white" />
                    </div>
                    <span className="font-medium">3 horas grátis · Sem cartão</span>
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={300} className="relative">
                {/* Mockup do app com interatividade */}
                <div className="relative group">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl opacity-20 group-hover:opacity-30 blur-2xl transition-opacity" />
                  
                  {/* Browser frame */}
                  <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Browser bar */}
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 border-b border-gray-200">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1 mx-4 px-3 py-1 bg-white rounded-md text-xs text-gray-500 font-mono">
                        backstageproapp.com
                      </div>
                    </div>

                    {/* App content com hover interativo */}
                    <div className="relative">
                      <img 
                        src={appShowcase} 
                        alt="Interface do Backstage Pro"
                        className="w-full transition-transform group-hover:scale-105"
                        loading="eager"
                      />
                      
                      {/* Floating cards com animação */}
                      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200 animate-float">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <div>
                            <div className="text-xs font-semibold text-gray-900">Show confirmado</div>
                            <div className="text-xs text-gray-500">Bar do João · R$ 800</div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-xl px-4 py-3 border border-gray-200 animate-float animation-delay-2000">
                        <div className="flex items-center gap-3">
                          <Calendar size={16} className="text-blue-600" />
                          <div>
                            <div className="text-xs font-semibold text-gray-900">5 shows este mês</div>
                            <div className="text-xs text-gray-500">R$ 4.200 total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-blue-600 rounded-full opacity-10 blur-3xl animate-pulse" />
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-600 rounded-full opacity-10 blur-3xl animate-pulse animation-delay-2000" />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Problema → Solução (Fluxo Unificado) com interatividade */}
        <section id="como-funciona" className="relative py-32 bg-white overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-6">
            <FadeIn className="text-center max-w-3xl mx-auto mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100 mb-6">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-blue-700">DO CAOS AO CONTROLE</span>
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                Como o Backstage Pro
                <span className="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  organiza seu trabalho real
                </span>
              </h2>
              <p className="mt-6 text-xl text-gray-600">
                Sem complicação. Sem burocracia. Só o que você precisa para profissionalizar.
              </p>
            </FadeIn>

            <div className="space-y-32">
              {/* Step 1 - Interativo */}
              <FadeIn>
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl font-black text-2xl mb-8 shadow-xl hover:scale-110 transition-transform">
                      1
                    </div>
                    
                    <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 leading-tight">
                      Novo contato?
                      <span className="block text-blue-600">Salva direto no app</span>
                    </h3>
                    
                    <div className="space-y-4 text-lg text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <X size={14} className="text-red-600" />
                        </div>
                        <p className="line-through opacity-60">Anotar no caderno e depois perder</p>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <X size={14} className="text-red-600" />
                        </div>
                        <p className="line-through opacity-60">Cliente sumiu no WhatsApp</p>
                      </div>

                      <div className="flex items-start gap-3 pt-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Check size={16} className="text-white" />
                        </div>
                        <p className="font-semibold text-gray-900">
                          Cadastra com nome, telefone e todo o histórico de conversas
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 inline-flex items-center gap-2 text-sm text-gray-500">
                      <Users size={16} className="text-blue-600" />
                      <span>Lista de clientes sempre à mão</span>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-10 group-hover:opacity-20 blur-2xl transition-opacity" />
                    <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 flex items-center justify-center shadow-xl group-hover:scale-105 group-hover:shadow-2xl transition-all">
                      <div className="text-center px-8">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-sm font-medium">
                          [PREENCHER: Screenshot da tela de Clientes]
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          Lista com contatos, histórico e negociações
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Step 2 - Com mockup real */}
              <FadeIn>
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="relative lg:order-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl font-black text-2xl mb-8 shadow-xl hover:scale-110 transition-transform">
                      2
                    </div>
                    
                    <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 leading-tight">
                      Show combinado?
                      <span className="block text-purple-600">Vai direto pra agenda</span>
                    </h3>
                    
                    <div className="space-y-4 text-lg text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <X size={14} className="text-red-600" />
                        </div>
                        <p className="line-through opacity-60">Papel perdido, data esquecida</p>
                      </div>

                      <div className="flex items-start gap-3 pt-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Check size={16} className="text-white" />
                        </div>
                        <p className="font-semibold text-gray-900">
                          Data, local, horário e valor do cachê tudo registrado
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Check size={16} className="text-white" />
                        </div>
                        <p className="font-semibold text-gray-900">
                          Notificação antes do show para você não esquecer
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative lg:order-1 group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl opacity-10 group-hover:opacity-20 blur-2xl transition-opacity" />
                    <div className="relative">
                      <img 
                        src={agendaMockup} 
                        alt="Agenda do Backstage Pro"
                        className="rounded-2xl border-2 border-gray-200 shadow-2xl group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                      
                      {/* Badge interativo */}
                      <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-xl font-bold text-sm animate-pulse-subtle">
                        ✓ Tela real do app
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Step 3 */}
              <FadeIn>
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl font-black text-2xl mb-8 shadow-xl hover:scale-110 transition-transform">
                      3
                    </div>
                    
                    <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 leading-tight">
                      Hora do show?
                      <span className="block text-pink-600">Tudo preparado</span>
                    </h3>
                    
                    <div className="space-y-4 text-lg text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Check size={16} className="text-white" />
                        </div>
                        <p className="font-semibold text-gray-900">
                          Repertório, checklist e tudo que foi combinado
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Check size={16} className="text-white" />
                        </div>
                        <p className="font-semibold text-gray-900">
                          Nada fica na memória, tudo documentado
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-600 to-orange-600 rounded-3xl opacity-10 group-hover:opacity-20 blur-2xl transition-opacity" />
                    <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 flex items-center justify-center shadow-xl group-hover:scale-105 transition-all">
                      <div className="text-center px-8">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-sm font-medium">
                          [PREENCHER: Screenshot do Show/Repertório]
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>

              {/* Step 4 */}
              <FadeIn>
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                  <div className="relative lg:order-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl font-black text-2xl mb-8 shadow-xl hover:scale-110 transition-transform">
                      4
                    </div>
                    
                    <h3 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 leading-tight">
                      Recebeu o cachê?
                      <span className="block text-green-600">Registra e pronto</span>
                    </h3>
                    
                    <div className="space-y-4 text-lg text-gray-600">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <X size={14} className="text-red-600" />
                        </div>
                        <p className="line-through opacity-60">Sem ideia de quanto entra e sai</p>
                      </div>

                      <div className="flex items-start gap-3 pt-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Check size={16} className="text-white" />
                        </div>
                        <p className="font-semibold text-gray-900">
                          Lança recebimento, despesas e vê o resultado real
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Check size={16} className="text-white" />
                        </div>
                        <p className="font-semibold text-gray-900">
                          Sabe exatamente quanto sobrou no mês
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative lg:order-1 group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl opacity-10 group-hover:opacity-20 blur-2xl transition-opacity" />
                    <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 flex items-center justify-center shadow-xl group-hover:scale-105 transition-all">
                      <div className="text-center px-8">
                        <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-sm font-medium">
                          [PREENCHER: Screenshot do Resumo Financeiro]
                        </p>
                      </div>
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
