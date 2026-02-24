import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { trackLandingVisit } from "@/hooks/useLandingInsights";
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
  Target
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

const PRO_URL = "https://invoice.infinitepay.io/plans/backstagegroup/o81tUzQqP";
const FULL_URL = "https://invoice.infinitepay.io/plans/backstagegroup/j7EFHeAeZ";

const PRO_YEARLY_URL = "https://invoice.infinitepay.io/plans/backstagegroup/62KukbQ1H";
const FULL_YEARLY_URL = "https://invoice.infinitepay.io/plans/backstagegroup/CZrFywU7b";

const plans = [
  {
    id: "free",
    name: "Free",
    subtitle: "Comece a se organizar sem pagar nada.",
    price: "R$ 0,00",
    period: "/mês",
    buttonText: "",
    url: "",
    highlight: false,
    badgeText: "GRATUITO",
    icon: Sparkles,
    socialProof: "",
    features: ["Dashboard", "Agenda (até 4 datas/mês)", "Tutoriais", "Configurações"],
    isFree: true,
  },
  {
    id: "pro",
    name: "Profissional",
    subtitle: "Organize sua área comercial e feche mais shows com processos profissionais.",
    price: "R$ 24,90",
    period: "/mês",
    buttonText: "Escolher Profissional",
    url: PRO_URL,
    highlight: true,
    badgeText: "MAIS POPULAR",
    icon: Briefcase,
    socialProof: "47 artistas estão nesse plano!",
    features: ["Dashboard", "Agenda ilimitada", "Clientes", "Resumo Financeiro", "Repertório", "Funil de Vendas", "Orçamentos Automáticos", "Checklist de Show", "Precificação", "Avanços"],
  },
  {
    id: "full",
    name: "Completo",
    subtitle: "Controle total da carreira, com metas, performance e gestão completa do seu negócio.",
    price: "R$ 39,90",
    period: "/mês",
    buttonText: "Escolher Completo",
    url: FULL_URL,
    highlight: false,
    badgeText: "TUDO LIBERADO",
    icon: Crown,
    socialProof: "21 artistas estão nesse plano!",
    features: ["Tudo do Profissional +", "Contratos", "Histórico Financeiro", "Mapeamento de Palco", "Metas", "Equipe & Freelancers", "Bônus"],
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  // Track landing page visit
  useEffect(() => {
    trackLandingVisit();
  }, []);

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
      description: "Funil de vendas, gestão de clientes e dicas exclusivas para você vender mais shows.",
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

  const whatsappLink = "https://web.whatsapp.com/send?phone=5512981289496&text=Olá! Tenho uma dúvida sobre o Backstage Pro";

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="fixed left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/50 shadow-sm transition-all duration-300 top-0">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#0066CC]">Backstage</span>
            <span className="text-2xl font-bold text-[#00B4D8]">Pro</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-slate-600 hover:text-[#0066CC] transition-colors">Recursos</a>
            <a href="#planos" className="text-slate-600 hover:text-[#0066CC] transition-colors">Planos</a>
            <a href="#depoimentos" className="text-slate-600 hover:text-[#0066CC] transition-colors">Depoimentos</a>
            <a href="#contato" className="text-slate-600 hover:text-[#0066CC] transition-colors">Contato</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pb-20 bg-gradient-to-b from-[#0066CC] via-[#0088DD] to-[#00B4D8] relative overflow-hidden transition-all duration-300 pt-32">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span className="text-white/90 text-sm font-medium">A plataforma que artistas usam para profissionalizar a carreira</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                Seu talento é no palco.
              </h1>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-cyan-300 mb-6">
                A organização deixa com a gente.
              </h2>

              <p className="text-white/90 text-lg md:text-xl max-w-xl mb-4">
                Shows, contratos, cachês e finanças em um só lugar.
              </p>
              <p className="text-white/70 text-base max-w-xl mb-8">
                Pare de perder oportunidades por falta de controle.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-6">
                <Button 
                  onClick={() => navigate('/auth')}
                  size="lg"
                  className="bg-white text-[#0066CC] hover:bg-white/90 hover:scale-105 font-bold px-8 py-6 text-lg shadow-xl shadow-black/20 transition-all duration-200"
                >
                  Começar grátis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => navigate('/auth')}
                  size="lg"
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 font-medium px-6 py-6 text-lg"
                >
                  Fazer login
                </Button>
              </div>

              {/* Trust signals below CTA */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-white/70 text-sm mb-8">
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-cyan-300" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-cyan-300" />
                  <span>Leva menos de 2 minutos</span>
                </div>
              </div>

              {/* Social proof - CLEAN DESIGN */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {userAvatars.map((avatar, i) => (
                    <img 
                      key={i} 
                      src={avatar}
                      alt={`Artista ${i + 1}`}
                      className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-lg"
                    />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white font-bold text-xl md:text-2xl">
                    +90 Artistas
                  </p>
                  <p className="text-white/90 text-sm md:text-base">
                    se organizando com o Backstage Pro
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Cards */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {/* Agenda de Shows - Highlighted */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/30 border-2 hover:bg-white/15 transition-all relative">
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-[#0066CC] text-xs font-bold px-2 py-1 rounded-full">
                  Essencial
                </div>
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold mb-1">Agenda de Shows</h3>
                  <p className="text-white/70 text-sm">Gerencie todos os seus eventos e apresentações</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-3">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold mb-1">Financeiro Completo</h3>
                  <p className="text-white/70 text-sm">Controle receitas e despesas automaticamente</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold mb-1">CRM de Vendas</h3>
                  <p className="text-white/70 text-sm">Pipeline visual para converter leads em shows</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all">
                <CardContent className="p-5">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-bold mb-1">Gestão de Músicos</h3>
                  <p className="text-white/70 text-sm">Organize sua banda e pagamentos</p>
                </CardContent>
              </Card>

              {/* Revenue Card - Contextualized */}
              <Card className="col-span-2 bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10 transition-all">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm mb-1">Receita gerenciada por artistas na plataforma</p>
                    <p className="text-white font-bold text-3xl">R$ 2.5M+</p>
                  </div>
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-white/50" />
                  </div>
                </CardContent>
              </Card>
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
                    src={getYouTubeEmbedUrl("https://www.youtube.com/shorts/RITl3r37h0I")?.replace('?autoplay=1', '') || ''}
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

      {/* Features Section */}
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




      {/* Plans Section */}
      <section id="planos" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-[#0066CC] font-semibold uppercase tracking-wider text-sm">Planos</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mt-4 mb-2">
              Escolha o plano ideal
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold text-[#0066CC] mb-4">
              para sua carreira
            </h3>
            <p className="text-slate-500">
              Menos improviso. Mais controle. Comece hoje.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  !isYearly ? "bg-white shadow text-slate-800" : "text-slate-400"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Mensal
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
                  isYearly ? "bg-white shadow text-slate-800" : "text-slate-400"
                }`}
              >
                <CalendarRange className="w-4 h-4" />
                Anual
              </button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {plans.map((p) => {
                // Free plan - no CTA, no annual
                if (p.isFree) {
                  return (
                    <div
                      key={p.id}
                      className="relative rounded-3xl border shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl h-full flex flex-col border-green-400 bg-gradient-to-br from-green-50 via-white to-emerald-50"
                    >
                      <div className="absolute top-5 right-5">
                        <span className="bg-green-600 text-white rounded-full px-3 py-1 text-xs font-semibold">
                          {p.badgeText}
                        </span>
                      </div>
                      <div className="p-8 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center">
                            <AppLogo size="sm" collapsed />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-slate-800">{p.name}</h4>
                            <p className="text-sm text-slate-500 font-medium">{p.subtitle}</p>
                          </div>
                        </div>
                        <div className="mb-6">
                          <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold text-slate-800">R$ 0,00</span>
                            <span className="text-sm text-slate-500 mb-1 font-medium">/mês</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 font-medium">Sem cobrança. Acesso básico gratuito.</p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 flex-1 mb-6">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">O que inclui</p>
                          <ul className="space-y-3">
                            {p.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-auto">
                          <p className="text-xs text-center text-slate-400 mt-3 font-medium">Você já está no plano gratuito!</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Paid plans
                const isPro = p.id === "pro";
                const monthlyValue = isPro ? 24.9 : 39.9;
                const yearlyOldPrice = isPro ? "298,80" : "478,80";
                const yearlyNewPrice = isPro ? "199,90" : "299,90";
                const yearlyInstallment = isPro ? "16,66" : "24,99";

                const finalPrice = isYearly ? `R$ ${yearlyNewPrice}` : `R$ ${monthlyValue.toFixed(2).replace(".", ",")}`;
                const finalUrl = isPro
                  ? isYearly ? PRO_YEARLY_URL : PRO_URL
                  : isYearly ? FULL_YEARLY_URL : FULL_URL;
                const finalPeriod = isYearly ? "/ano" : "/mês";

                return (
                <div
                  key={p.id}
                  className={`relative rounded-3xl border shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl h-full flex flex-col ${
                    p.highlight
                      ? "border-[#0066CC] bg-gradient-to-br from-blue-50 via-white to-cyan-50"
                      : "border-amber-400 bg-gradient-to-br from-amber-50 via-white to-orange-50"
                  }`}
                >
                  {p.badgeText && (
                    <div className="absolute top-5 right-5">
                      <span className="bg-[#0066CC] text-white rounded-full px-3 py-1 text-xs font-semibold">
                        {p.badgeText}
                      </span>
                    </div>
                  )}

                  <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center">
                        <AppLogo size="sm" collapsed />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">{p.name}</h4>
                        <p className="text-sm text-slate-500 font-medium">{p.subtitle}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      {isYearly && (
                        <p className="text-sm text-red-600 line-through mb-1 font-semibold">
                          De: R$ {yearlyOldPrice}
                        </p>
                      )}
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-slate-800">{finalPrice}</span>
                        <span className="text-sm text-slate-500 mb-1 font-medium">{finalPeriod}</span>
                      </div>
                      {isYearly && (
                        <p className="text-sm text-emerald-600 font-bold mt-1">
                          ou 12x de R$ {yearlyInstallment}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        {isYearly ? "Cobrança anual pré-paga." : "Cobrança mensal pré-paga. Cancele quando quiser."}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 flex-1 mb-6">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
                        O que inclui
                      </p>
                      <ul className="space-y-3">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto">
                      <Button
                        size="lg"
                        className={`w-full rounded-2xl text-white font-semibold shadow-md ${
                          p.highlight
                            ? "bg-gradient-to-r from-[#0066CC] to-[#00B4D8]"
                            : "bg-gradient-to-r from-[#0066CC] to-[#0088DD]"
                        }`}
                        onClick={() => window.open(finalUrl, "_blank")}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {p.buttonText}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </Button>
                      <p className="text-xs text-center text-slate-400 mt-3 font-medium">{p.socialProof}</p>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </div>

          {/* Reassurances */}
          <div className="max-w-4xl mx-auto mt-10">
            <div className="flex flex-wrap justify-center gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 font-medium text-slate-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Pagamento 100% seguro</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-slate-600">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">Cancele quando quiser</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-slate-600">
                <HeadphonesIcon className="w-4 h-4" />
                <span className="text-sm">Suporte humano real</span>
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
                onClick={() => navigate('/auth')}
                className="bg-white text-[#0066CC] hover:bg-white/90 font-semibold px-8 py-6 text-lg"
              >
                Quero Começar Agora
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
