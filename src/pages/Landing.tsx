import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Play, 
  Calendar, 
  DollarSign, 
  Users, 
  CalendarDays,
  CalendarRange,
  Heart,
  TrendingUp,
  Check,
  Star,
  Sparkles,
  Smartphone,
  Monitor,
  MessageCircle,
  Quote,
  Gift,
  X,
  Clock,
  Zap,
  ClipboardCheck,
  FileText,
  Music,
  MapPin,
  BarChart3,
  Receipt,
  Target,
  Link2,
  Rocket
} from "lucide-react";

// Team images
import joseMarioImg from "@/assets/team/jose-mario.png";
import marianaSantosImg from "@/assets/team/mariana-santos.png";
import escritorioImg from "@/assets/team/escritorio.png";

// Artist images for social proof
import artist1Img from "@/assets/artists/artist-1.png";
import artist2Img from "@/assets/artists/artist-2.png";
import artist3Img from "@/assets/artists/artist-3.png";
import artist4Img from "@/assets/artists/artist-4.png";

// Testimonials
import larissaGoogle from "@/assets/testimonials/larissa-google.png";
import marceloGoogle from "@/assets/testimonials/marcelo-google.png";
import fabioGoogle from "@/assets/testimonials/fabio-google.png";
import { useNavigate } from "react-router-dom";
import { getYouTubeEmbedUrl } from "@/lib/youtube";
import { ArtistAnalysisForm } from "@/components/landing/ArtistAnalysisForm";
import { Shield, HeadphonesIcon, XCircle, AlertTriangle, Briefcase, Crown } from "lucide-react";
import { AppLogo } from "@/components/layout/AppLogo";
import linkAgendaMockup from "@/assets/mockups/link-agenda-mockup.jpeg";
import baIconImg from "@/assets/ba-icon.png";

const STARTER_URL = "https://checkout.infinitepay.io/backstagegroup/98BOGv1XH";
const STARTER_YEARLY_URL = "https://checkout.infinitepay.io/backstagegroup/7MbHszYGv3";
const PRO_URL = "https://checkout.infinitepay.io/backstagegroup/jevBUGiJB";
const FULL_URL = "https://checkout.infinitepay.io/backstagegroup/3gIdDhCDDl";

const PRO_YEARLY_URL = "https://checkout.infinitepay.io/backstagegroup/1q9KDGVzhP";
const FULL_YEARLY_URL = "https://checkout.infinitepay.io/backstagegroup/v4fKMVbOh";

const DEMO_WHATSAPP_URL = "https://wa.me/5512992423317?text=" + encodeURIComponent("Olá! Gostaria de solicitar uma demo do Backstage Pro.");


const plans = [
  {
    id: "starter",
    name: "Starter",
    subtitle: "Comece a organizar sua carreira musical com o essencial.",
    price: "R$ 19,90",
    period: "/mês",
    buttonText: "Começar Starter",
    url: STARTER_URL,
    highlight: false,
    badgeText: "ESSENCIAL",
    icon: Sparkles,
    socialProof: "",
    features: ["Dashboard", "Agenda ilimitada", "Resumo Financeiro", "Precificação", "Avanços", "Tutoriais", "Configurações"],
  },
  {
    id: "pro",
    name: "Profissional",
    subtitle: "Organize sua área comercial e feche mais shows com processos profissionais.",
    price: "R$ 24,90",
    period: "/mês",
    buttonText: "Começar Profissional",
    url: PRO_URL,
    highlight: true,
    badgeText: "MAIS POPULAR",
    icon: Briefcase,
    socialProof: "47 artistas estão nesse plano!",
    features: ["Tudo do Starter +", "Clientes", "Repertório", "Radar de Shows", "Orçamentos Automáticos", "Checklist de Show", "Equipe & Freelancers"],
  },
  {
    id: "full",
    name: "Empresarial",
    subtitle: "Controle total da carreira, com metas, performance e gestão completa do seu negócio.",
    price: "R$ 39,90",
    period: "/mês",
    buttonText: "Começar Empresarial",
    url: FULL_URL,
    highlight: false,
    badgeText: "TUDO LIBERADO",
    icon: Crown,
    socialProof: "21 artistas estão nesse plano!",
    features: ["Tudo do Profissional +", "Link Agendamento Online", "Contratos Automáticos", "Histórico Financeiro", "Mapeamento de Palco", "Metas", "Bônus"],
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);


  const features = [
    {
      icon: Calendar,
      title: "Agenda de Shows",
      description: "Nunca mais esqueça data, horário ou valor combinado. Tudo registrado e organizado.",
      color: "bg-blue-500",
      highlighted: true,
      badge: "Mais usado"
    },
    {
      icon: DollarSign,
      title: "Financeiro Integrado",
      description: "Integrado a todo o app. Sem lançamentos manuais — tudo se conecta automaticamente.",
      color: "bg-emerald-500"
    },
    {
      icon: FileText,
      title: "Orçamentos e Contratos",
      description: "Gere orçamentos e contratos profissionais em menos de 1 minuto, direto pelo app.",
      color: "bg-orange-500"
    },
    {
      icon: Receipt,
      title: "Borderô de Shows",
      description: "Controle individualmente a despesa de cada show e tenha mais controle da sua rentabilidade.",
      color: "bg-pink-500"
    },
    {
      icon: BarChart3,
      title: "Balanço Mensal",
      description: "Um poderoso relatório de fechamento mensal que facilita a gestão do artista.",
      color: "bg-purple-500"
    },
    {
      icon: Target,
      title: "Auxílio de Vendas",
      description: "Radar de shows, gestão de clientes e dicas exclusivas para você vender mais shows.",
      color: "bg-cyan-500"
    },
    {
      icon: Music,
      title: "Repertório Express",
      description: "Monte e baixe seu repertório completo em menos de 1 minuto. Prático e profissional.",
      color: "bg-indigo-500"
    },
    {
      icon: MapPin,
      title: "Mapeamento de Palco",
      description: "Crie riders técnicos profissionais com posição de cada músico e equipamento no palco.",
      color: "bg-amber-500"
    },
    {
      icon: Users,
      title: "Gestão de Músicos",
      description: "Acabou a confusão de quem tocou onde e quanto recebeu. Controle pagamentos da banda.",
      color: "bg-rose-500"
    }
  ];

  // User avatars for social proof

  const userAvatars = [
    artist1Img,
    artist2Img,
    artist3Img,
    artist4Img
  ];

  const benefitsList: string[] = [];

  const mainVideoUrl = "https://www.youtube.com/watch?v=I_5o-hmDuRI";

  const whatsappLink = "https://web.whatsapp.com/send?phone=5512991764910&text=Olá! Tenho uma dúvida sobre o Backstage Pro";

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">

      <Helmet>
        <title>Backstage Pro — Sistema de Gestão para Artistas e Músicos</title>
        <meta name="description" content="Plataforma completa para artistas: agenda de shows, financeiro, CRM de leads, contratos, orçamentos e equipe. Comece grátis." />
        <link rel="canonical" href="https://backstagepro.online/landing" />
        <meta property="og:title" content="Backstage Pro — Sistema de Gestão para Artistas" />
        <meta property="og:description" content="Agenda, financeiro, CRM, contratos e equipe num só lugar para artistas e músicos." />
        <meta property="og:url" content="https://backstagepro.online/landing" />
      </Helmet>

      {/* Header */}
      <header className="fixed left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/50 shadow-sm transition-all duration-300 top-0">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#0066CC]">Backstage</span>
            <span className="text-2xl font-bold text-[#00B4D8]">Pro</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-slate-600 hover:text-[#0066CC] transition-colors">Recursos</a>
            
            <a href="#depoimentos" className="text-slate-600 hover:text-[#0066CC] transition-colors">Depoimentos</a>
            <a href="#contato" className="text-slate-600 hover:text-[#0066CC] transition-colors">Contato</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pb-16 sm:pb-20 bg-gradient-to-br from-[#0033AA] via-[#0066CC] to-[#00B4D8] relative overflow-hidden transition-all duration-300 pt-24 sm:pt-32 min-h-[88vh] lg:min-h-[90vh] flex items-center">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(0,180,216,0.3),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(0,51,170,0.4),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,180,216,0.2),transparent_40%)]" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Floating light orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />

        <div className="container mx-auto px-5 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-5 sm:mb-8 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />
                <span className="text-white/90 text-[11px] sm:text-sm font-medium">Profissionalize sua carreira musical</span>
              </div>

              <h1 className="text-[2rem] leading-[1.1] sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 drop-shadow-lg tracking-tight">
                Sua carreira musical,<br className="hidden sm:block" />
                <span className="text-cyan-300">organizada como um negócio.</span>
              </h1>
              <p className="text-white/85 text-base sm:text-xl max-w-xl mx-auto lg:mx-0 mb-3 sm:mb-2 italic">
                Seu talento é no palco. A organização deixa com a gente.
              </p>
              <p className="text-white/95 text-sm sm:text-xl max-w-xl mx-auto lg:mx-0 mb-2 sm:mb-4">
                Agenda, contratos, cachês e finanças em um só app.
              </p>
              <p className="hidden sm:block text-white/70 text-base max-w-xl mb-8">
                Pare de perder oportunidades por falta de controle.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center lg:items-start gap-3 sm:gap-4 mb-5 sm:mb-6 mt-6">
                <Button
                  onClick={() => window.open(DEMO_WHATSAPP_URL, '_blank')}
                  size="lg"
                  className="bg-white text-[#0066CC] hover:bg-white/95 hover:scale-[1.02] font-bold px-6 sm:px-8 py-6 text-base sm:text-lg shadow-2xl shadow-black/30 transition-all duration-200 w-full sm:w-auto"
                >
                  Solicitar demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  size="lg"
                  variant="ghost"
                  className="text-white/90 hover:text-white hover:bg-white/10 font-medium px-4 sm:px-6 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
                >
                  Já tenho conta
                </Button>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-white/80 text-xs sm:text-sm mb-6 sm:mb-8">
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-cyan-300" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-cyan-300" />
                  <span>Cadastro em 2 minutos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-cyan-300" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>

              {/* Social proof */}
              <div className="mt-3 flex items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <div className="flex -space-x-3">
                  {userAvatars.map((avatar, i) => (
                    <img
                      key={i}
                      src={avatar}
                      alt={`Artista ${i + 1}`}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white object-cover shadow-lg"
                    />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white font-bold text-lg sm:text-2xl leading-tight">
                    +90 Artistas
                  </p>
                  <p className="text-white/85 text-xs sm:text-base leading-tight">
                    já organizam a carreira aqui
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Showcase */}
            <div className="flex items-center justify-center relative mt-4 lg:mt-0">
              {/* Glow effect */}
              <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-cyan-400/20 rounded-full blur-[100px] m-auto" />

              <div className="w-full max-w-[540px] space-y-3 sm:space-y-4 relative z-10">
                {/* Main app mockup card */}
                <div className="rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-black/20">
                  <div className="flex items-center gap-3 mb-4 sm:mb-5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg">
                      <img src={baIconImg} alt="Logotipo Backstage Pro" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Backstage Pro</p>
                      <p className="text-white/50 text-xs">Painel do Artista</p>
                    </div>
                    <div className="ml-auto flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                    {[
                      { icon: Link2, label: "Link Agenda", desc: "Pedidos online", color: "from-blue-500 to-blue-600" },
                      { icon: MapPin, label: "Mapa de Palco", desc: "Rider digital", color: "from-purple-500 to-purple-600" },
                      { icon: DollarSign, label: "Financeiro", desc: "Receita auto", color: "from-emerald-500 to-emerald-600" },
                      { icon: Calendar, label: "Agenda", desc: "Shows no jeito", color: "from-orange-500 to-orange-600" },
                      { icon: Receipt, label: "Orçamento", desc: "1 clique", color: "from-pink-500 to-pink-600" },
                      { icon: FileText, label: "Contrato", desc: "Envio rápido", color: "from-cyan-500 to-cyan-600" },
                    ].map((feat, i) => (
                      <div
                        key={i}
                        className="group flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.12] transition-all duration-300 cursor-default"
                      >
                        <div className={`flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${feat.color} shadow-lg`}>
                          <feat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs sm:text-sm font-semibold truncate">{feat.label}</p>
                          <p className="text-white/40 text-[10px] sm:text-xs truncate">{feat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom stats row */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { icon: Rocket, value: "2min", label: "Setup", color: "text-cyan-300" },
                    { icon: Music, value: "+100", label: "Artistas", color: "text-emerald-300" },
                    { icon: ClipboardCheck, value: "100%", label: "Prático", color: "text-amber-300" },
                  ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5 sm:gap-1 p-3 sm:p-4 rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-lg">
                      <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                      <span className="text-white font-bold text-base sm:text-lg">{stat.value}</span>
                      <span className="text-white/60 text-[10px] sm:text-xs">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
        <Button
          onClick={() => window.open(DEMO_WHATSAPP_URL, '_blank')}
          size="lg"
          className="w-full bg-gradient-to-r from-[#0066CC] to-[#00B4D8] hover:from-[#0055BB] hover:to-[#00A0C4] text-white font-bold py-5 text-base shadow-lg shadow-blue-500/30"
        >
          Solicitar demo
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>


      {/* How It Works - 3 Steps */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#0066CC] font-semibold uppercase tracking-wider text-sm">Como funciona</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mt-2">
              Comece a organizar sua carreira em 3 passos
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0066CC]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#0066CC]">1</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Cadastre seus shows</h3>
              <p className="text-slate-500 text-sm">Adicione eventos, datas e valores em segundos</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00B4D8]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#00B4D8]">2</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Organize contatos e contratos</h3>
              <p className="text-slate-500 text-sm">Gerencie clientes e gere contratos automáticos</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-500">3</span>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Controle pagamentos e banda</h3>
              <p className="text-slate-500 text-sm">Acompanhe cachês, despesas e pagamentos de músicos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Play className="w-5 h-5 text-[#0066CC]" />
            <span className="text-[#0066CC] font-semibold uppercase tracking-wider text-sm">Vídeos</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-2">
            Conheça mais sobre o
          </h2>
          <h3 className="text-3xl md:text-5xl font-bold text-[#0066CC] mb-4">
            Backstage Pro
          </h3>
          <p className="text-slate-500 mb-12">
            Veja como o app funciona e depoimentos de quem já usa
          </p>

          <div className="max-w-sm mx-auto">
            <Card className="overflow-hidden shadow-2xl bg-white border-slate-200">
              <CardContent className="p-0">
                <div className="aspect-[9/16]">
                  <iframe
                    src={getYouTubeEmbedUrl("https://www.youtube.com/shorts/ewx-MyQ3BN4")?.replace('?autoplay=1', '') || ''}
                    title="Veja o app na prática"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
            <p className="text-slate-400 text-sm mt-3">Veja o app funcionando na prática</p>
          </div>
        </div>
      </section>

      {/* Link Agenda Mockup Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Phone Mockup */}
            <div className="flex-shrink-0 flex justify-center lg:justify-start">
              <div className="relative">
                {/* iPhone-style frame - tall & slim (19.5:9 aspect ratio) */}
                <div className="w-[240px] md:w-[270px] rounded-[2.5rem] border-[6px] border-[#1a1a1a] bg-[#1a1a1a] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.35)] overflow-hidden relative">
                  {/* Dynamic Island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-[#1a1a1a] rounded-full z-10" />
                  {/* Screen */}
                  <div className="rounded-[2rem] overflow-hidden bg-white aspect-[9/19.5]">
                    <img
                      src={linkAgendaMockup}
                      alt="Mockup do Link Agenda - página de agendamento online do artista"
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                </div>
                {/* Subtle reflection */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                {/* Glow effect */}
                <div className="absolute -inset-6 bg-[#0066CC]/8 rounded-[4rem] blur-3xl -z-10" />
              </div>
            </div>

            {/* Text content */}
            <div className="text-center lg:text-left max-w-xl">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#0066CC]" />
                <span className="text-[#0066CC] font-semibold uppercase tracking-wider text-sm">Link Agenda</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Seu link profissional para <span className="text-[#0066CC]">fechar shows</span>
              </h2>
              <p className="text-slate-500 text-lg mb-6 leading-relaxed">
                Compartilhe um único link com contratantes e deixe que eles vejam seus serviços, escolham datas disponíveis e solicitem o show — tudo de forma automática e profissional.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Catálogo de serviços com preços e descrições",
                  "Calendário com datas disponíveis em tempo real",
                  "Desconto automático para múltiplas datas",
                  "Formulário de solicitação direto no seu painel",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <Check className="w-5 h-5 text-[#0066CC] mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button
                size="lg"
                className="bg-[#0066CC] hover:bg-[#0055BB] text-white px-8 py-6 text-lg font-semibold shadow-lg"
                onClick={() => window.open(DEMO_WHATSAPP_URL, '_blank')}
              >
                Solicitar demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#0066CC] font-semibold uppercase tracking-wider text-sm">Funcionalidades</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mt-4 mb-2">
              Achou tudo isso incrível?
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold text-[#0066CC] mb-4">
              Calma, que tem muito mais!
            </h3>
            <p className="text-slate-500">
              Cada recurso foi pensado por quem vive a rotina de um artista
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`border bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative ${
                  feature.highlighted 
                    ? 'border-[#0066CC] border-2 bg-blue-50/30' 
                    : 'border-slate-200'
                }`}
              >
                {feature.badge && (
                  <div className="absolute -top-3 left-4 bg-[#0066CC] text-white text-xs font-bold px-3 py-1 rounded-full">
                    {feature.badge}
                  </div>
                )}
                <CardContent className="p-6">
                  <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-500">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* Quem Somos Section - CEO */}
      <section id="quem-somos" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#0066CC] font-semibold uppercase tracking-wider text-sm">Nossa Equipe</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mt-4 mb-2">
              Quem Somos Nós
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Conheça as pessoas por trás do Backstage Pro — profissionais apaixonados por ajudar artistas a crescer
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="relative h-80 lg:h-[450px]">
                    <img 
                      src={joseMarioImg} 
                      alt="José Mario Campos - CEO" 
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent lg:hidden" />
                  </div>
                  <div className="p-8 lg:pr-12">
                    <div className="inline-flex items-center gap-2 bg-[#0066CC]/10 rounded-full px-4 py-2 mb-4">
                      <Sparkles className="w-4 h-4 text-[#0066CC]" />
                      <span className="text-[#0066CC] text-sm font-medium">Fundador & CEO</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                      José Mario Campos
                    </h3>
                    <p className="text-[#00B4D8] font-medium mb-4">
                      Também conhecido artisticamente como Mario Oliveira
                    </p>
                    
                    <div className="relative">
                      <Quote className="w-8 h-8 text-[#0066CC]/20 absolute -left-2 -top-2" />
                      <p className="text-slate-600 leading-relaxed pl-6">
                        É cantor e viveu na pele os desafios de quem tenta profissionalizar a carreira usando apenas planilhas. Durante anos, organizou shows, contatos e ideias no Excel — até perceber que, mesmo trabalhando muito, não conseguia enxergar seus próprios resultados.
                      </p>
                      <p className="text-slate-600 leading-relaxed pl-6 mt-4">
                        Faltava clareza, visão de evolução e, principalmente, uma ferramenta que entendesse a realidade de quem vive de palco.
                      </p>
                      <p className="text-slate-700 font-medium leading-relaxed pl-6 mt-4">
                        Foi dessa frustração real que nasceu a <span className="text-[#0066CC]">Backstage Pro</span>: uma plataforma criada por um artista, para artistas, pensada para transformar esforço em progresso visível e carreira em negócio profissional.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="depoimentos" className="py-20 bg-gradient-to-b from-[#0066CC] to-[#0088DD]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-cyan-300 font-semibold uppercase tracking-wider text-sm">Depoimentos</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 mb-2">
              O que os cantores estão
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-4">
              dizendo sobre nós
            </h3>
            <p className="text-white/80">
              Junte-se a centenas de artistas que já transformaram suas carreiras
            </p>
          </div>

          {/* Testimonials - Layout vertical */}
          <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            {/* Victor Viola - Video */}
            <div className="group">
              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="aspect-video rounded-xl overflow-hidden">
                  <iframe
                    src={getYouTubeEmbedUrl("https://www.youtube.com/shorts/_nUOr9qoNgI")?.replace('?autoplay=1', '') || ''}
                    title="Depoimento Victor Viola"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="mt-4 px-2 pb-2">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-800 font-semibold text-lg">Victor Viola</p>
                  <p className="text-slate-500">"Depoimento em vídeo"</p>
                </div>
              </div>
            </div>

            {/* Larissa - Google */}
            <div className="group">
              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <img 
                  src={larissaGoogle} 
                  alt="Avaliação Larissa Santos Producoes no Google" 
                  className="w-full rounded-xl"
                />
                <div className="mt-4 px-2 pb-2">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-800 font-semibold text-lg">Larissa Santos Producoes</p>
                  <p className="text-slate-500">"O app trouxe muito mais organização pra minha carreira"</p>
                </div>
              </div>
            </div>

            {/* Marcelo - Google */}
            <div className="group">
              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <img 
                  src={marceloGoogle} 
                  alt="Avaliação marcelocantor no Google" 
                  className="w-full rounded-xl"
                />
                <div className="mt-4 px-2 pb-2">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-800 font-semibold text-lg">marcelocantor</p>
                  <p className="text-slate-500">"Gosto muito do aplicativo, parabéns aos desenvolvedores!"</p>
                </div>
              </div>
            </div>

            {/* Fábio - Google */}
            <div className="group">
              <div className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <img 
                  src={fabioGoogle} 
                  alt="Avaliação Fábio Martins - Viverarte Violão no Google" 
                  className="w-full rounded-xl"
                />
                <div className="mt-4 px-2 pb-2">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-800 font-semibold text-lg">Fábio Martins - Viverarte Violão</p>
                  <p className="text-slate-500">"Organizou muito bem minha agenda. Estou gostando."</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>




      {/* Contact Section - Only WhatsApp */}
      <section id="contato" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#0066CC] font-semibold uppercase tracking-wider text-sm">Fale Conosco</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mt-4 mb-4">
              Tem alguma dúvida?
            </h2>
            <p className="text-slate-500 mb-8">
              Entre em contato pelo WhatsApp que te respondemos rapidinho!
            </p>

            <Button 
              size="lg"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold px-8 py-6 text-lg"
              onClick={() => window.open(whatsappLink, '_blank')}
            >
              <MessageCircle className="mr-2 w-6 h-6" />
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-[#0066CC] via-[#0077DD] to-[#00B4D8] rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Pronto para profissionalizar
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-cyan-300 mb-6">
                sua carreira?
              </h3>
              
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Junte-se a milhares de artistas que já estão crescendo com o Backstage Pro. 
                Comece hoje mesmo, é grátis por 3 dias!
              </p>

              <Button 
                size="lg"
                onClick={() => window.open(DEMO_WHATSAPP_URL, '_blank')}
                className="bg-white text-[#0066CC] hover:bg-white/90 font-semibold px-8 py-6 text-lg"
              >
                Solicitar demo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <p className="text-white/60 text-sm mt-4">
                Sem cartão de crédito • Cancele quando quiser
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-100 border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#0066CC]">Backstage</span>
              <span className="text-2xl font-bold text-[#00B4D8]">Pro</span>
            </div>
            
            <nav className="flex items-center gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-[#0066CC] transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-[#0066CC] transition-colors">Privacidade</a>
              <a href="#" className="hover:text-[#0066CC] transition-colors">Suporte</a>
            </nav>

            <p className="text-slate-500 text-sm">
              © 2024 Backstage Pro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
