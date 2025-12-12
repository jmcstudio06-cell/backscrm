import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowRight, 
  Play, 
  Calendar, 
  DollarSign, 
  Users, 
  CalendarDays, 
  Brain, 
  TrendingUp,
  Check,
  Star,
  Sparkles,
  Zap,
  Crown,
  Send,
  MessageSquare,
  Smartphone,
  Monitor
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

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
      icon: Brain,
      title: "IA Conselheira",
      description: "Inteligência artificial que analisa seus dados e oferece insights para crescer sua carreira.",
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
      quote: "A IA conselheira é incrível! Me deu insights que aumentaram meu faturamento em 40% em apenas 3 meses. Recomendo demais!",
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

  const plans = [
    {
      name: "Inicial",
      description: "Para quem está começando",
      price: "49,90",
      period: "por mês",
      icon: Zap,
      features: [
        "Dashboard interativo",
        "Painel de metas",
        "Financeiro completo",
        "Aulas de alavancagem",
        "CRM - Funil de Vendas",
        "Pushs Mensais"
      ],
      popular: false,
      buttonVariant: "default" as const
    },
    {
      name: "Essencial",
      description: "Para profissionais",
      price: "24,99",
      period: "por 6 meses",
      originalPrice: "299,40",
      equivalent: "Equivale a R$ 149,90/semestre",
      icon: Sparkles,
      features: [
        "Tudo do Inicial +",
        "Aulas de alavancagem",
        "Histórico Mensal",
        "Pushs Mensais",
        "IA Automatizada no Funil / Contratos",
        "IA Conselheira de Carreira"
      ],
      popular: true,
      buttonVariant: "outline" as const
    },
    {
      name: "Completo",
      description: "Melhor custo-benefício",
      price: "19,99",
      period: "por 12 meses",
      originalPrice: "598,80",
      equivalent: "Equivale a R$ 239,88/ano",
      icon: Crown,
      features: [
        "Tudo do Essencial +",
        "Contratos",
        "Músicos da Banda",
        "Orçamentos",
        "Pushs Avançados"
      ],
      popular: false,
      buttonVariant: "default" as const
    }
  ];

  const benefitsList = [
    "Agenda inteligente com lembretes",
    "Dashboard completo de métricas",
    "Contratos digitais prontos",
    "Gestão de repertório",
    "Relatórios financeiros automáticos"
  ];

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
            <a href="#planos" className="text-slate-600 hover:text-[#0066CC] transition-colors">Planos</a>
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
            <span className="text-white/90 text-sm font-medium">+100+ artistas já usam o Backstage Pro</span>
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
            <Button 
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg bg-transparent"
            >
              <Play className="mr-2 w-5 h-5" />
              Ver Planos
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white/30" />
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
            <span><span className="text-cyan-300 font-semibold">3 dias</span> grátis para testar</span>
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

          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden shadow-2xl bg-white border-slate-200">
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-black/5" />
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xl">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>
                <div className="p-4 bg-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#0066CC]" />
                  <span className="text-slate-800 font-medium">Conheça o Backstage Pro</span>
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

      {/* Pricing Section */}
      <section id="planos" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[#0066CC] font-semibold uppercase tracking-wider text-sm">Planos e Preços</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mt-4 mb-2">
              Escolha o plano ideal
            </h2>
            <h3 className="text-3xl md:text-5xl font-bold text-[#0066CC] mb-4">
              para sua carreira
            </h3>
            <p className="text-slate-500">
              Comece grátis por 3 dias. Cancele quando quiser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-[#0066CC] to-[#004499] text-white border-0 scale-105 shadow-2xl' 
                    : 'border border-slate-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-[#0066CC] text-white text-xs font-bold px-4 py-1 rounded-full uppercase">
                      Mais Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-6 pt-8">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    plan.popular ? 'bg-white/20' : 'bg-[#0066CC]/10'
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-[#0066CC]'}`} />
                  </div>

                  <h3 className={`text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-slate-800'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.popular ? 'text-white/70' : 'text-slate-500'}`}>
                    {plan.description}
                  </p>

                  {plan.equivalent && (
                    <p className={`text-sm mb-2 ${plan.popular ? 'text-cyan-300' : 'text-[#00B4D8]'}`}>
                      {plan.equivalent}
                    </p>
                  )}

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-sm ${plan.popular ? 'text-white/70' : 'text-slate-500'}`}>R$</span>
                    <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-slate-800'}`}>
                      {plan.price}
                    </span>
                  </div>
                  <p className={`text-sm mb-4 ${plan.popular ? 'text-white/70' : 'text-slate-500'}`}>
                    {plan.period}
                  </p>
                  
                  {plan.originalPrice && (
                    <p className={`text-sm line-through mb-4 ${plan.popular ? 'text-white/50' : 'text-slate-400'}`}>
                      De R$ {plan.originalPrice}
                    </p>
                  )}

                  <Button 
                    className={`w-full mb-6 ${
                      plan.popular 
                        ? 'bg-white text-[#0066CC] hover:bg-white/90' 
                        : 'bg-gradient-to-r from-[#0066CC] to-[#00B4D8] text-white hover:opacity-90'
                    }`}
                    onClick={() => navigate('/auth')}
                  >
                    Assinar Agora
                  </Button>

                  <div className="space-y-3">
                    <p className={`text-sm font-semibold ${plan.popular ? 'text-cyan-300' : 'text-[#0066CC]'}`}>
                      INCLUI:
                    </p>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className={`w-4 h-4 ${plan.popular ? 'text-cyan-300' : 'text-[#0066CC]'}`} />
                        <span className={`text-sm ${plan.popular ? 'text-white/90' : 'text-slate-700'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-[#0066CC] font-semibold uppercase tracking-wider text-sm">Fale Conosco</span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mt-4 mb-4">
              Tem alguma dúvida?
            </h2>
            <p className="text-slate-500">
              Envie sua mensagem que entraremos em contato o mais rápido possível
            </p>
          </div>

          <Card className="max-w-2xl mx-auto shadow-xl bg-white border-slate-200">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Nome *</label>
                  <Input placeholder="Seu nome completo" className="border-slate-300 bg-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Email *</label>
                  <Input type="email" placeholder="seu@email.com" className="border-slate-300 bg-white" />
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Telefone / WhatsApp</label>
                <Input placeholder="(00) 00000-0000" className="border-slate-300 bg-white" />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-slate-700 mb-2 block">Mensagem *</label>
                <Textarea 
                  placeholder="Como podemos ajudar você?" 
                  className="border-slate-300 bg-white min-h-[120px]" 
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1 bg-gradient-to-r from-[#0066CC] to-[#00B4D8] text-white hover:opacity-90">
                  <Send className="mr-2 w-4 h-4" />
                  Enviar Mensagem
                </Button>
                <Button variant="outline" className="flex-1 border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC]/10">
                  <MessageSquare className="mr-2 w-4 h-4" />
                  Prefiro WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
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
