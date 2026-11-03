import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { 
  ArrowRight, Calendar, Check, ChevronDown, FileText, MapPin, 
  MessageCircle, TrendingUp, Users, Wallet, X, Menu, Play, Pause 
} from "lucide-react";
import brandIcon from "@/assets/ba-icon.png";
import { LANDING_CONFIG, getWhatsAppUrl, isOfertaAtiva } from "@/config/landing-config";

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE — ALTA CONVERSÃO
   
   📝 Para editar textos, preços e links, vá em:
   src/config/landing-config.ts
   
   Tudo está centralizado lá para facilitar a manutenção!
   ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   COMPONENTES
   ═══════════════════════════════════════════════════════════════ */

function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      } ${className}`}
    >
      {children}
    </div>
  );
}

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-4 justify-center">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="text-3xl font-bold text-white bg-[#003D7A] rounded-lg px-4 py-2 min-w-[70px]">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-600 mt-1 capitalize">{unit}</div>
        </div>
      ))}
    </div>
  );
}

export default function LandingNew() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  useEffect(() => {
    // Pixel Meta (quando disponível)
    if (LANDING_CONFIG.tracking.metaPixelEnabled) {
      // fbq('init', LANDING_CONFIG.tracking.metaPixelId);
      // fbq('track', 'PageView');
    }
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMenuOpen(false);
    }
  };

  const handleCTAClick = () => {
    // Event tracking
    if (LANDING_CONFIG.tracking.metaPixelEnabled) {
      // fbq('track', 'Lead');
    }
    window.location.href = LANDING_CONFIG.links.ctaUrl;
  };

  return (
    <div className="min-h-screen bg-white font-['Inter',sans-serif] text-[#1A1A1A]">
      <Helmet>
        <title>{LANDING_CONFIG.meta.title}</title>
        <meta name="description" content={LANDING_CONFIG.meta.description} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={LANDING_CONFIG.meta.title} />
        <meta property="og:description" content={LANDING_CONFIG.meta.description} />
        <meta property="og:image" content={LANDING_CONFIG.meta.ogImage} />
        
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
        
        {/* Meta Pixel placeholder */}
        {LANDING_CONFIG.tracking.metaPixelEnabled && (
          <script>
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${LANDING_CONFIG.tracking.metaPixelId}');
              fbq('track', 'PageView');
            `}
          </script>
        )}
      </Helmet>

      {/* Header Sticky */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src={brandIcon} alt="Backstage Pro" className="h-10 w-auto" />
          
          {/* Nav Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('como-funciona')} className="text-[#4A4A4A] hover:text-[#0066CC] transition-colors font-medium">
              Como funciona
            </button>
            <button onClick={() => scrollToSection('funcionalidades')} className="text-[#4A4A4A] hover:text-[#0066CC] transition-colors font-medium">
              Funcionalidades
            </button>
            <button onClick={() => scrollToSection('planos')} className="text-[#4A4A4A] hover:text-[#0066CC] transition-colors font-medium">
              Planos
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-[#4A4A4A] hover:text-[#0066CC] transition-colors font-medium">
              Dúvidas
            </button>
          </nav>

          <button
            onClick={handleCTAClick}
            className="hidden md:inline-flex items-center gap-2 bg-[#0066CC] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0052A3] hover:scale-105 hover:shadow-lg transition-all"
          >
            Quero organizar minha carreira
            <ArrowRight size={18} />
          </button>

          {/* Menu Mobile */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="flex flex-col p-6 gap-4">
              <button onClick={() => scrollToSection('como-funciona')} className="text-left py-2 font-medium">Como funciona</button>
              <button onClick={() => scrollToSection('funcionalidades')} className="text-left py-2 font-medium">Funcionalidades</button>
              <button onClick={() => scrollToSection('planos')} className="text-left py-2 font-medium">Planos</button>
              <button onClick={() => scrollToSection('faq')} className="text-left py-2 font-medium">Dúvidas</button>
              <button onClick={handleCTAClick} className="bg-[#0066CC] text-white px-6 py-3 rounded-lg font-semibold mt-2">
                Começar agora
              </button>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* HERO */}
        <section className="bg-gradient-to-b from-[#F5F7FA] to-white pt-20 pb-24 lg:pt-32 lg:pb-40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <FadeInSection>
                <h1 className="text-4xl lg:text-[56px] font-bold leading-tight lg:leading-[1.1]">
                  {LANDING_CONFIG.copy.hero.headline.split(LANDING_CONFIG.copy.hero.headlineDestaque)[0]}
                  <span className="text-[#0066CC]">{LANDING_CONFIG.copy.hero.headlineDestaque}</span>
                  {LANDING_CONFIG.copy.hero.headline.split(LANDING_CONFIG.copy.hero.headlineDestaque)[1]}
                </h1>
                <p className="text-lg lg:text-xl text-[#4A4A4A] mt-6 leading-relaxed">
                  {LANDING_CONFIG.copy.hero.subtitulo}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    onClick={handleCTAClick}
                    className="inline-flex items-center justify-center gap-2 bg-[#0066CC] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#0052A3] hover:scale-105 hover:shadow-xl transition-all"
                  >
                    {LANDING_CONFIG.copy.hero.ctaPrimario}
                    <ArrowRight size={20} />
                  </button>
                  
                  <button
                    onClick={() => scrollToSection('video')}
                    className="inline-flex items-center justify-center gap-2 border-2 border-[#0066CC] text-[#0066CC] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#E6F2FF] transition-all"
                  >
                    {LANDING_CONFIG.copy.hero.ctaSecundario}
                  </button>
                </div>
              </FadeInSection>

              <FadeInSection delay={200} className="relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Mockup placeholder - substituir por imagem real */}
                  <div className="bg-[#1A1A1A] rounded-3xl shadow-2xl overflow-hidden border-8 border-[#1A1A1A]">
                    <div className="bg-white p-6 space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b">
                        <div className="font-bold text-lg">Agenda de Shows</div>
                        <div className="bg-[#0066CC] text-white text-sm px-3 py-1 rounded-full">+ Novo</div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-[#E6F2FF] p-4 rounded-lg border-l-4 border-[#0066CC]">
                          <div className="text-xs text-gray-500">15 MAR</div>
                          <div className="font-semibold mt-1">Bar do João - Centro</div>
                          <div className="text-sm text-gray-600 mt-1">Confirmado · R$ 800</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
                          <div className="text-xs text-gray-500">22 MAR</div>
                          <div className="font-semibold mt-1">Festa Particular</div>
                          <div className="text-sm text-gray-600 mt-1">Orçamento enviado</div>
                        </div>
                        <div className="bg-[#F0FDF4] p-4 rounded-lg border-l-4 border-[#10B981]">
                          <div className="text-xs text-gray-500">30 MAR</div>
                          <div className="font-semibold mt-1">Evento Corporativo</div>
                          <div className="text-sm text-gray-600 mt-1">Pago · R$ 1.500</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decoração */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#0066CC]/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#0066CC]/10 rounded-full blur-2xl" />
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* PROBLEMA */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <FadeInSection className="text-center mb-16">
              <h2 className="text-3xl lg:text-[42px] font-bold">{LANDING_CONFIG.copy.problema.titulo.split('desorganização')[0]}<span className="text-[#EF4444]">desorganização</span></h2>
            </FadeInSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {LANDING_CONFIG.copy.problema.cards.map((item, i) => (
                <FadeInSection key={i} delay={i * 100}>
                  <div className="bg-white border-2 border-red-100 rounded-2xl p-6 hover:border-[#EF4444] hover:shadow-lg transition-all">
                    <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-4">
                      {[Calendar, Wallet, Users, TrendingUp][i] && 
                        (() => {
                          const Icon = [Calendar, Wallet, Users, TrendingUp][i];
                          return <Icon size={28} className="text-[#EF4444]" />;
                        })()
                      }
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.titulo}</h3>
                    <p className="text-[#4A4A4A] text-sm leading-relaxed">{item.descricao}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* VÍDEO DEMO */}
        <section id="video" className="py-20 bg-[#F5F7FA]">
          <div className="max-w-4xl mx-auto px-6">
            <FadeInSection className="text-center mb-12">
              <h2 className="text-3xl lg:text-[42px] font-bold">Veja a plataforma em ação</h2>
              <p className="text-lg text-[#4A4A4A] mt-4">2 minutos para entender como funciona</p>
            </FadeInSection>

            <FadeInSection delay={200}>
              <div className="relative max-w-sm mx-auto">
                {/* Moldura de celular */}
                <div className="bg-[#1A1A1A] rounded-[3rem] p-4 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden relative aspect-[9/19]">
                    <video
                      ref={videoRef}
                      poster={LANDING_CONFIG.video.poster}
                      playsInline
                      loop={LANDING_CONFIG.video.loop}
                      muted={!videoPlaying}
                      className="w-full h-full object-cover"
                      onPlay={() => setVideoPlaying(true)}
                      onPause={() => setVideoPlaying(false)}
                    >
                      <source src={LANDING_CONFIG.video.url} type="video/mp4" />
                    </video>
                    
                    {/* Overlay de controle */}
                    <button
                      onClick={handleVideoToggle}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                    >
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        {videoPlaying ? <Pause size={28} className="text-[#0066CC]" /> : <Play size={28} className="text-[#0066CC] ml-1" />}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* COMO FUNCIONA */}
        <section id="como-funciona" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <FadeInSection className="text-center mb-16">
              <div className="inline-block bg-[#E6F2FF] text-[#0066CC] text-sm font-semibold px-4 py-2 rounded-full mb-4">
                {LANDING_CONFIG.copy.comoFunciona.badge}
              </div>
              <h2 className="text-3xl lg:text-[42px] font-bold">{LANDING_CONFIG.copy.comoFunciona.titulo}</h2>
            </FadeInSection>

            <div className="relative">
              {/* Linha conectora (desktop) */}
              <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gray-200" style={{ width: '66%', margin: '0 auto' }} />

              <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
                {LANDING_CONFIG.copy.comoFunciona.passos.map((step, i) => (
                  <FadeInSection key={i} delay={i * 150} className="relative">
                    <div className="text-center">
                      <div className="relative inline-block mb-6">
                        <div className="w-24 h-24 bg-[#0066CC] text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg mx-auto relative z-10">
                          {i + 1}
                        </div>
                      </div>
                      <h3 className="font-bold text-xl mb-3">{step.titulo}</h3>
                      <p className="text-[#4A4A4A] leading-relaxed">{step.descricao}</p>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FUNCIONALIDADES */}
        <section id="funcionalidades" className="py-20 bg-[#F5F7FA]">
          <div className="max-w-6xl mx-auto px-6">
            <FadeInSection className="text-center mb-16">
              <h2 className="text-3xl lg:text-[42px] font-bold">{LANDING_CONFIG.copy.funcionalidades.titulo}</h2>
              <p className="text-lg text-[#4A4A4A] mt-4">{LANDING_CONFIG.copy.funcionalidades.subtitulo}</p>
            </FadeInSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {LANDING_CONFIG.copy.funcionalidades.lista.map((feature, i) => {
                const icons = [Calendar, Users, Wallet, TrendingUp, MapPin, MessageCircle];
                const Icon = icons[i];
                return (
                  <FadeInSection key={i} delay={i * 100}>
                    <div className="bg-white rounded-2xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all border border-gray-100">
                      <div className="w-14 h-14 bg-[#E6F2FF] rounded-xl flex items-center justify-center mb-5">
                        <Icon size={28} className="text-[#0066CC]" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{feature.titulo}</h3>
                      <p className="text-[#4A4A4A] leading-relaxed">{feature.descricao}</p>
                    </div>
                  </FadeInSection>
                );
              })}
            </div>

            {/* Nota sobre screenshots reais */}
            <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-gray-700">
                <strong>🖼️ Screenshots reais:</strong> [PREENCHER: Adicionar capturas de tela reais da plataforma alternando esquerda/direita entre os blocos acima]
              </p>
            </div>
          </div>
        </section>

        {/* ANTES x DEPOIS */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <FadeInSection className="text-center mb-16">
              <h2 className="text-3xl lg:text-[42px] font-bold">Antes e depois do Backstage Pro</h2>
            </FadeInSection>

            <div className="grid md:grid-cols-2 gap-8">
              <FadeInSection>
                <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
                  <div className="text-red-500 font-bold mb-4 flex items-center gap-2">
                    <X size={24} />
                    <span>ANTES — Carreira desorganizada</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-[#4A4A4A]">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X size={14} className="text-red-500" />
                      </div>
                      Shows anotados em caderno e WhatsApp
                    </li>
                    <li className="flex gap-3 text-[#4A4A4A]">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X size={14} className="text-red-500" />
                      </div>
                      Cachês esquecidos e não cobrados
                    </li>
                    <li className="flex gap-3 text-[#4A4A4A]">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X size={14} className="text-red-500" />
                      </div>
                      Contatos perdidos entre conversas
                    </li>
                    <li className="flex gap-3 text-[#4A4A4A]">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X size={14} className="text-red-500" />
                      </div>
                      Sem visão clara do financeiro
                    </li>
                  </ul>
                </div>
              </FadeInSection>

              <FadeInSection delay={200}>
                <div className="bg-[#E6F2FF] rounded-2xl p-8 border-2 border-[#0066CC]">
                  <div className="text-[#0066CC] font-bold mb-4 flex items-center gap-2">
                    <Check size={24} />
                    <span>DEPOIS — Carreira profissional</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex gap-3 text-[#1A1A1A]">
                      <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-white" />
                      </div>
                      Agenda centralizada e sempre atualizada
                    </li>
                    <li className="flex gap-3 text-[#1A1A1A]">
                      <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-white" />
                      </div>
                      Lembretes automáticos de cobranças
                    </li>
                    <li className="flex gap-3 text-[#1A1A1A]">
                      <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-white" />
                      </div>
                      Base de clientes organizada e acessível
                    </li>
                    <li className="flex gap-3 text-[#1A1A1A]">
                      <div className="w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-white" />
                      </div>
                      Relatórios claros e decisões informadas
                    </li>
                  </ul>
                </div>
              </FadeInSection>
            </div>
          </div>
        </section>

        {/* PLANOS */}
        <section id="planos" className="py-20 bg-[#F5F7FA]">
          <div className="max-w-6xl mx-auto px-6">
            <FadeInSection className="text-center mb-12">
              <h2 className="text-3xl lg:text-[42px] font-bold">{LANDING_CONFIG.copy.planos.titulo}</h2>
              <p className="text-lg text-[#4A4A4A] mt-4">{LANDING_CONFIG.copy.planos.subtitulo}</p>
            </FadeInSection>

            {/* Countdown de oferta (se ativo) */}
            {isOfertaAtiva() && (
              <FadeInSection className="mb-12">
                <div className="bg-gradient-to-r from-[#0066CC] to-[#003D7A] rounded-2xl p-8 text-center text-white">
                  <div className="text-2xl font-bold mb-4">{LANDING_CONFIG.oferta.texto}</div>
                  <div className="text-sm mb-6">Oferta termina em:</div>
                  <CountdownTimer targetDate={LANDING_CONFIG.oferta.dataFim} />
                </div>
              </FadeInSection>
            )}

            <div className="grid md:grid-cols-3 gap-8">
              {LANDING_CONFIG.planos.map((plano, i) => (
                <FadeInSection key={i} delay={i * 100}>
                  <div className={`bg-white rounded-2xl p-8 relative ${
                    plano.destaque 
                      ? 'border-2 border-[#0066CC] shadow-2xl scale-105' 
                      : 'border border-gray-200 hover:border-[#0066CC] hover:shadow-xl'
                  } transition-all`}>
                    {plano.destaque && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0066CC] text-white text-sm font-bold px-6 py-2 rounded-full whitespace-nowrap">
                        {plano.badge}
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                      <div className="flex items-end justify-center gap-1">
                        <span className="text-5xl font-bold">{plano.preco}</span>
                        <span className="text-[#4A4A4A] mb-2">{plano.periodo}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plano.recursos.map((recurso, j) => (
                        <li key={j} className="flex gap-3 items-start">
                          <Check size={20} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                          <span className="text-[#4A4A4A]">{recurso}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={handleCTAClick}
                      className={`w-full py-4 rounded-lg font-semibold transition-all ${
                        plano.destaque
                          ? 'bg-[#0066CC] text-white hover:bg-[#0052A3] hover:scale-105'
                          : 'bg-white border-2 border-[#0066CC] text-[#0066CC] hover:bg-[#E6F2FF]'
                      }`}
                    >
                      Começar agora
                    </button>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* PROVA SOCIAL (hidden até conteúdo real) */}
        <section className="py-20 bg-white hidden" data-placeholder="prova-social">
          <div className="max-w-6xl mx-auto px-6">
            <FadeInSection className="text-center mb-16">
              <h2 className="text-3xl lg:text-[42px] font-bold">Artistas que confiam no Backstage Pro</h2>
            </FadeInSection>

            <div className="grid md:grid-cols-3 gap-8">
              {/* [PREENCHER: Cards de depoimentos reais com foto, nome, tipo de artista e frase] */}
              <div className="p-6 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">[Aguardando depoimentos reais]</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-12 mt-16 opacity-30">
              {/* [PREENCHER: Logos de artistas/bandas que usam (se houver autorização)] */}
              <div className="text-gray-400 text-sm">[Logos aguardando autorização]</div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 bg-[#F5F7FA]">
          <div className="max-w-4xl mx-auto px-6">
            <FadeInSection className="text-center mb-16">
              <h2 className="text-3xl lg:text-[42px] font-bold">{LANDING_CONFIG.copy.faq.titulo}</h2>
            </FadeInSection>

            <div className="space-y-4">
              {LANDING_CONFIG.faq.map((item, i) => (
                <FadeInSection key={i} delay={i * 50}>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setActiveAccordion(activeAccordion === i ? null : i)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-lg pr-4">{item.pergunta}</span>
                      <ChevronDown
                        size={24}
                        className={`flex-shrink-0 text-[#0066CC] transition-transform ${
                          activeAccordion === i ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`px-6 overflow-hidden transition-all duration-300 ${
                        activeAccordion === i ? 'py-5 max-h-96' : 'max-h-0'
                      }`}
                    >
                      <p className="text-[#4A4A4A] leading-relaxed">{item.resposta}</p>
                    </div>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="py-20 bg-gradient-to-br from-[#003D7A] to-[#0066CC] text-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <FadeInSection>
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                {LANDING_CONFIG.copy.ctaFinal.titulo}
              </h2>
              <p className="text-xl opacity-90 mb-10">
                {LANDING_CONFIG.copy.ctaFinal.subtitulo}
              </p>
              <button
                onClick={handleCTAClick}
                className="inline-flex items-center gap-3 bg-white text-[#0066CC] px-10 py-5 rounded-xl text-xl font-bold hover:bg-gray-100 hover:scale-105 hover:shadow-2xl transition-all"
              >
                {LANDING_CONFIG.copy.ctaFinal.botao}
                <ArrowRight size={24} />
              </button>
            </FadeInSection>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1A1A1A] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <img src={brandIcon} alt="Backstage Pro" className="h-10 mb-4 brightness-0 invert" />
              <p className="text-gray-400 text-sm">
                {LANDING_CONFIG.footer.descricao}
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Links</h4>
              <nav className="space-y-2">
                {LANDING_CONFIG.footer.links.map((link, i) => (
                  link.url.startsWith('#') ? (
                    <button key={i} onClick={() => scrollToSection(link.url.substring(1))} className="block text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </button>
                  ) : (
                    <a key={i} href={link.url} className="block text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  )
                ))}
              </nav>
            </div>

            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <div className="space-y-2 text-gray-400 text-sm">
                <div>Instagram: <a href={LANDING_CONFIG.links.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{LANDING_CONFIG.links.instagramHandle}</a></div>
                <div>Email: <a href={`mailto:${LANDING_CONFIG.links.emailContato}`} className="hover:text-white transition-colors">{LANDING_CONFIG.links.emailContato}</a></div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            {LANDING_CONFIG.footer.copyright} — CNPJ {LANDING_CONFIG.footer.cnpj}
          </div>
        </div>
      </footer>

      {/* Botão WhatsApp Flutuante (se ativado) */}
      {LANDING_CONFIG.links.whatsappEnabled && (
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
          aria-label="Falar no WhatsApp"
        >
          <MessageCircle size={32} className="text-white" />
        </a>
      )}
    </div>
  );
}
