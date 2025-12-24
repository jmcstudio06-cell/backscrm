import { useEffect } from "react";
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
  MessageCircle
} from "lucide-react";
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
      title: "Gestão Completa da Carreira",
      description: "Organize todos os aspectos da sua carreira musical em um único lugar, de forma simples e intuitiva.",
      color: "bg-blue-500"
    },
    {
      icon: DollarSign,
      title: "Financeiro Automático",
      description: "Controle entradas, saídas, cachês e comissões automaticamente. Relatórios claros e precisos.",
      color: "bg-emerald-500"
    },
    {
      icon: Users,
      title: "CRM e Funil de Vendas",
      description: "Gerencie contratantes, leads e negociações. Nunca perca uma oportunidade de show.",
      color: "bg-pink-500"
    },
    {
      icon: CalendarDays,
      title: "Histórico de Shows",
      description: "Registre todos os seus shows, locais, valores e detalhes importantes para análise futura.",
      color: "bg-orange-500"
    },
    {
      icon: Heart,
      title: "Acompanhamento Personalizado",
      description: "Suporte dedicado e acompanhamento contínuo para ajudar você a crescer na carreira.",
      color: "bg-purple-500"
    },
    {
      icon: TrendingUp,
      title: "Pushs de Performance",
      description: "Receba relatórios mensais com métricas, comparativos e dicas personalizadas.",
      color: "bg-cyan-500"
    }
  ];

  const testimonials = [
    {
      name: "Lucas Mendes",
      role: "Cantor Sertanejo",
      quote: "O Backstage Pro mudou completamente minha forma de gerenciar minha carreira. Antes eu perdia contratos por desorganização, agora tenho tudo na palma da mão!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Amanda Silva",
      role: "Cantora Sertaneja",
      quote: "O acompanhamento personalizado é incrível! Me deu insights que aumentaram meu faturamento em 40% em apenas 3 meses. Recomendo demais!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Rafael Costa",
      role: "Cantor de Forró",
      quote: "Finalmente um app que entende a rotina de um cantor! O controle financeiro automático me salvou de muita dor de cabeça.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      name: "Mariana Santos",
      role: "Cantora Pop",
      quote: "O funil de vendas do Backstage Pro profissionalizou minhas negociações. Fechei o dobro de shows esse ano!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

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

  const whatsappLink = "https://web.whatsapp.com/send?phone=5512991545726&text=Olá! Tenho uma dúvida sobre o Backstage Pro";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
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

          <Button 
            onClick={() => navigate('/auth')}
            className="bg-[#0066CC] text-white hover:bg-[#0055AA] font-semibold"
          >
            Testar Grátis
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-[#0066CC] via-[#0088DD] to-[#00B4D8] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span className="text-white/90 text-sm font-medium">100+ artistas já usam o Backstage Pro</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            O app mais completo
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-white">de </span>
            <span className="text-cyan-300">gestão para artistas</span>
          </h2>

          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Agenda, financeiro, funil de vendas, contratos, repertório e muito mais — tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-white text-[#0066CC] hover:bg-white/90 font-semibold px-8 py-6 text-lg"
            >
              Começar Agora
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {userAvatars.map((avatar, i) => (
                  <img 
                    key={i} 
                    src={avatar}
                    alt={`Usuário ${i + 1}`}
                    className="w-8 h-8 rounded-full border-2 border-white/30 object-cover"
                  />
                ))}
              </div>
              <span>+100+ usuários ativos</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-1">4.9/5 de avaliação</span>
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
              <Card key={index} className="border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/90 italic mb-6">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-white font-semibold">{testimonial.name}</div>
                      <div className="text-cyan-300 text-sm">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
