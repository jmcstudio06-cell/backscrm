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
  Zap
} from "lucide-react";

// Team images
import joseMarioImg from "@/assets/team/jose-mario.png";
import marianaSantosImg from "@/assets/team/mariana-santos.png";
import escritorioImg from "@/assets/team/escritorio.png";

// WhatsApp testimonials
import mariaElisaWhatsapp from "@/assets/testimonials/maria-elisa-whatsapp.png";
import renatoWhatsapp from "@/assets/testimonials/renato-whatsapp.png";
import igorWhatsapp from "@/assets/testimonials/igor-whatsapp.png";
import andreWhatsapp from "@/assets/testimonials/andre-whatsapp.png";
import caykWhatsapp from "@/assets/testimonials/cayk-whatsapp.png";
import { useNavigate } from "react-router-dom";
import { getYouTubeEmbedUrl } from "@/lib/youtube";

const Landing = () => {
  const navigate = useNavigate();

  // Track landing page visit
  useEffect(() => {
    trackLandingVisit();
  }, []);

  const features = [
    {
      icon: Calendar,
      title: "Agenda de Shows",
      description: "Gerencie todos os seus eventos e apresentações. Do contato ao pagamento, tudo em um só lugar.",
      color: "bg-blue-500",
      highlighted: true,
      badge: "Mais usado"
    },
    {
      icon: DollarSign,
      title: "Financeiro Completo",
      description: "Controle cachês, despesas e comissões automaticamente. Relatórios claros sem planilhas.",
      color: "bg-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "CRM de Vendas",
      description: "Pipeline visual para converter leads em shows. Nunca perca uma oportunidade de negócio.",
      color: "bg-pink-500"
    },
    {
      icon: Users,
      title: "Gestão de Músicos",
      description: "Organize sua banda, freelancers e pagamentos de forma simples e profissional.",
      color: "bg-purple-500"
    },
    {
      icon: CalendarDays,
      title: "Contratos Automáticos",
      description: "Gere contratos prontos com seus dados. Envie para o cliente em segundos.",
      color: "bg-orange-500"
    },
    {
      icon: Heart,
      title: "Suporte Personalizado",
      description: "Acompanhamento contínuo para ajudar você a crescer na carreira musical.",
      color: "bg-cyan-500"
    }
  ];

  // User avatars for social proof

  const userAvatars = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
  ];

  const benefitsList = [
    "Agenda inteligente com lembretes",
    "Dashboard completo de métricas",
    "Contratos digitais prontos",
    "Gestão de repertório",
    "Relatórios financeiros automáticos"
  ];

  const mainVideoUrl = "https://www.youtube.com/watch?v=I_5o-hmDuRI";
  const victorViolaVideoUrl = "https://www.youtube.com/shorts/_nUOr9qoNgI";

  const whatsappLink = "https://web.whatsapp.com/send?phone=5512981289496&text=Olá! Tenho uma dúvida sobre o Backstage Pro";

  const [showPromoBanner, setShowPromoBanner] = useState(true);

  return (
    <div className="min-h-screen bg-white">
      {/* Promotional Banner - Fixed at very top */}
      {showPromoBanner && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white py-2.5 px-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-center gap-3 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2">
              <div className="animate-pulse">
                <Gift className="w-5 h-5 text-yellow-300" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 text-center">
              <div className="hidden sm:flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                <Zap className="w-3 h-3 text-yellow-300" />
                <span className="text-xs font-bold uppercase tracking-wider">Oferta Especial</span>
              </div>
              <span className="text-sm sm:text-base font-medium">
                🎁 <span className="font-bold">AGENDA DE SHOWS GRÁTIS</span> por tempo indeterminado!
              </span>
              <Button 
                onClick={() => navigate('/auth')}
                size="sm"
                className="bg-white text-emerald-600 hover:bg-white/90 font-bold text-xs sm:text-sm px-3 py-1 h-7 shadow-md hover:scale-105 transition-transform"
              >
                Resgatar Agora
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            
            <button 
              onClick={() => setShowPromoBanner(false)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Fechar banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`fixed left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/50 shadow-sm transition-all duration-300 ${showPromoBanner ? 'top-10' : 'top-0'}`}>
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#0066CC]">Backstage</span>
            <span className="text-2xl font-bold text-[#00B4D8]">Pro</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-slate-600 hover:text-[#0066CC] transition-colors">Recursos</a>
            <a href="#instalar" className="text-slate-600 hover:text-[#0066CC] transition-colors">Instalar App</a>
            <a href="#quem-somos" className="text-slate-600 hover:text-[#0066CC] transition-colors">Quem Somos</a>
            <a href="#depoimentos" className="text-slate-600 hover:text-[#0066CC] transition-colors">Depoimentos</a>
            <a href="#contato" className="text-slate-600 hover:text-[#0066CC] transition-colors">Contato</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`pb-20 bg-gradient-to-b from-[#0066CC] via-[#0088DD] to-[#00B4D8] relative overflow-hidden transition-all duration-300 ${showPromoBanner ? 'pt-44' : 'pt-32'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span className="text-white/90 text-sm font-medium">Gestão completa para artistas</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                Transforme sua
              </h1>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-cyan-300 mb-6">
                carreira musical
              </h2>

              <p className="text-white/90 text-lg md:text-xl max-w-xl mb-4">
                Do primeiro contato ao pagamento do cachê, sem planilhas.
              </p>
              <p className="text-white/70 text-base max-w-xl mb-8">
                Gerencie shows, contratos e finanças em um só lugar.
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

              {/* Social proof - visual */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {userAvatars.map((avatar, i) => (
                    <img 
                      key={i} 
                      src={avatar}
                      alt={`Usuário ${i + 1}`}
                      className="w-9 h-9 rounded-full border-2 border-white/30 object-cover"
                    />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-white/80 text-sm">+100 artistas organizando seus shows</span>
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

          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden shadow-2xl bg-white border-slate-200">
              <CardContent className="p-0">
                <div className="aspect-video">
                  <iframe
                    src={getYouTubeEmbedUrl(mainVideoUrl)?.replace('?autoplay=1', '') || ''}
                    title="Conheça o Backstage Pro"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#0066CC] font-semibold uppercase tracking-wider text-sm">Recursos Poderosos</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mt-4 mb-2">
              Tudo que você precisa para
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold text-[#0066CC] mb-4">
              brilhar no palco e nos negócios
            </h3>
            <p className="text-slate-500">
              Funcionalidades pensadas por quem entende a rotina de um artista
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

      {/* Demo Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#0066CC] font-semibold uppercase tracking-wider text-sm">Demonstração</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-4 mb-2">
                Crie uma rotina inteligente e
              </h2>
              <h3 className="text-3xl md:text-4xl font-bold text-[#00B4D8] mb-6">
                aumente seus resultados
              </h3>
              
              <p className="text-slate-500 mb-8">
                Com o Backstage Pro, você tem controle total da sua carreira na palma da mão. Interface intuitiva, dados organizados e insights poderosos para você focar no que realmente importa: sua música.
              </p>

              <div className="space-y-4 mb-8">
                {benefitsList.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#00B4D8]/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#00B4D8]" />
                    </div>
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6 text-slate-500">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  <span>iOS & Android</span>
                </div>
                <div className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  <span>Web Dashboard</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <div className="text-lg font-bold text-slate-800 mb-4">Dashboard</div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-blue-500 rounded-lg p-3 text-white text-center">
                      <div className="text-xs opacity-80">Leads</div>
                      <div className="font-bold">5</div>
                    </div>
                    <div className="bg-emerald-500 rounded-lg p-3 text-white text-center">
                      <div className="text-xs opacity-80">Shows</div>
                      <div className="font-bold">0</div>
                    </div>
                    <div className="bg-purple-500 rounded-lg p-3 text-white text-center">
                      <div className="text-xs opacity-80">Vendas</div>
                      <div className="font-bold">R$ 24.451</div>
                    </div>
                    <div className="bg-pink-500 rounded-lg p-3 text-white text-center">
                      <div className="text-xs opacity-80">Receita</div>
                      <div className="font-bold">R$ 24.451</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quem Somos Section */}
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

          {/* CEO - Full width card */}
          <div className="mb-12">
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

          {/* Team members */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Mariana */}
            <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-72">
                  <img 
                    src={marianaSantosImg} 
                    alt="Mariana Santos Andrade" 
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-1">
                      Mariana Santos Andrade
                    </h3>
                    <p className="text-cyan-300 font-medium text-sm">
                      Atendimento Comercial
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-sm">
                    Responsável por garantir a melhor experiência para todos os artistas que chegam ao Backstage Pro. Sempre pronta para ajudar!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Escritório */}
            <Card className="bg-white border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-72">
                  <img 
                    src={escritorioImg} 
                    alt="Escritório da Backstage Pro" 
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold text-white mb-1">
                      Nosso Escritório
                    </h3>
                    <p className="text-cyan-300 font-medium text-sm">
                      Área Comercial
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-sm">
                    Sede da Backstage Pro, localizada em São Paulo/SP. De onde trabalhamos para ajudar artistas de todo o Brasil!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
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

          {/* Video Testimonial - Victor Viola */}
          <div className="max-w-xs mx-auto mb-12">
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-white">
              <div className="aspect-[9/16] bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(victorViolaVideoUrl)?.replace('?autoplay=1', '') || ''}
                  title="Depoimento Victor Viola"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-slate-800 font-semibold">Victor Viola</div>
                <div className="text-[#0066CC] text-sm">Usuário do Backstage Pro</div>
              </div>
            </div>
          </div>

          {/* WhatsApp Testimonials - Real Screenshots */}
          <div>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4">
                <MessageCircle className="w-4 h-4 text-cyan-300" />
                <span className="text-white/90 text-sm font-medium">Feedback real de usuários</span>
              </div>
              <h4 className="text-2xl font-bold text-white">
                O que artistas estão nos mandando
              </h4>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto items-start">
              {/* Maria Elisa - Card maior à esquerda */}
              <div className="group w-full lg:w-auto lg:flex-shrink-0">
                <div className="bg-white rounded-2xl p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 lg:w-80">
                  <img 
                    src={mariaElisaWhatsapp} 
                    alt="Depoimento Maria Elisa Fernandes via WhatsApp" 
                    className="w-full rounded-lg"
                  />
                  <div className="mt-3 px-2 pb-1">
                    <p className="text-slate-700 font-medium text-sm">Maria Elisa Fernandes</p>
                    <p className="text-slate-500 text-xs">"Você é um gênio por criar ele"</p>
                  </div>
                </div>
              </div>

              {/* Grid 2x2 com os outros 4 cards */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                {/* Renato */}
                <div className="group">
                  <div className="bg-white rounded-2xl p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full">
                    <img 
                      src={renatoWhatsapp} 
                      alt="Depoimento Renato via WhatsApp" 
                      className="w-full rounded-lg"
                    />
                    <div className="mt-3 px-2 pb-1">
                      <p className="text-slate-700 font-medium text-sm">Renato</p>
                      <p className="text-slate-500 text-xs">"Esse App é top msm!"</p>
                    </div>
                  </div>
                </div>

                {/* Igor */}
                <div className="group">
                  <div className="bg-white rounded-2xl p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full">
                    <img 
                      src={igorWhatsapp} 
                      alt="Depoimento Igor via WhatsApp" 
                      className="w-full rounded-lg"
                    />
                    <div className="mt-3 px-2 pb-1">
                      <p className="text-slate-700 font-medium text-sm">Igor</p>
                      <p className="text-slate-500 text-xs">"Parabéns aos desenvolvedores!"</p>
                    </div>
                  </div>
                </div>

                {/* André */}
                <div className="group">
                  <div className="bg-white rounded-2xl p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full">
                    <img 
                      src={andreWhatsapp} 
                      alt="Depoimento André via WhatsApp" 
                      className="w-full rounded-lg"
                    />
                    <div className="mt-3 px-2 pb-1">
                      <p className="text-slate-700 font-medium text-sm">André</p>
                      <p className="text-slate-500 text-xs">"Uma equipe top! Parabéns!"</p>
                    </div>
                  </div>
                </div>

                {/* Cayk */}
                <div className="group">
                  <div className="bg-white rounded-2xl p-3 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full">
                    <img 
                      src={caykWhatsapp} 
                      alt="Depoimento Cayk via WhatsApp" 
                      className="w-full rounded-lg"
                    />
                    <div className="mt-3 px-2 pb-1">
                      <p className="text-slate-700 font-medium text-sm">Cayk</p>
                      <p className="text-slate-500 text-xs">"Meu show mudou de 80% pra 200%!"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Install App Section */}
      <section id="instalar" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-[#0066CC]" />
              <span className="text-[#0066CC] font-semibold uppercase tracking-wider text-sm">Instale o App</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-2">
              Tenha o Backstage Pro
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold text-[#0066CC] mb-4">
              no seu celular
            </h3>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Instale o aplicativo direto do navegador, sem precisar de loja de apps. 
              Funciona offline e é super rápido!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* iOS Installation */}
            <Card className="overflow-hidden border-slate-200 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-0">
                <div className="bg-slate-800 p-6 text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">iPhone / iPad</h4>
                  <p className="text-white/70 text-sm">Instalação via Safari</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">Abra no Safari</p>
                      <p className="text-slate-500 text-sm">Acesse backstagepro.lovable.app no Safari</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">Toque em Compartilhar</p>
                      <p className="text-slate-500 text-sm">Ícone de compartilhar na barra inferior</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">Adicionar à Tela de Início</p>
                      <p className="text-slate-500 text-sm">Role e selecione essa opção</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Android Installation */}
            <Card className="overflow-hidden border-slate-200 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-0">
                <div className="bg-emerald-500 p-6 text-center">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Android</h4>
                  <p className="text-white/70 text-sm">Instalação via Chrome</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">Abra no Chrome</p>
                      <p className="text-slate-500 text-sm">Acesse backstagepro.lovable.app no Chrome</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">Menu (3 pontinhos)</p>
                      <p className="text-slate-500 text-sm">No canto superior direito</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">Instalar aplicativo</p>
                      <p className="text-slate-500 text-sm">Ou "Adicionar à tela inicial"</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-slate-500 text-sm">
              💡 Dica: Após instalar, o app funciona como um aplicativo nativo, com ícone na tela inicial!
            </p>
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
