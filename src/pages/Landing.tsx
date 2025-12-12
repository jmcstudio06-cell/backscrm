import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, DollarSign, Users, History, Brain, TrendingUp, 
  Star, Check, ArrowRight, Play, Mail, Phone, MapPin,
  Sparkles, Menu, X
} from "lucide-react";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { icon: Calendar, title: "Gestão Completa da Carreira", description: "Organize todos os aspectos da sua carreira musical em um único lugar, de forma simples e intuitiva.", color: "bg-cyan-500" },
    { icon: DollarSign, title: "Financeiro Automático", description: "Controle entradas, saídas, cachês e comissões automaticamente. Relatórios claros e precisos.", color: "bg-emerald-500" },
    { icon: Users, title: "CRM e Funil de Vendas", description: "Gerencie contratantes, leads e negociações. Nunca perca uma oportunidade de show.", color: "bg-pink-500" },
    { icon: History, title: "Histórico de Shows", description: "Registre todos os seus shows, locais, valores e detalhes importantes para análise futura.", color: "bg-orange-500" },
    { icon: Brain, title: "IA Conselheira", description: "Inteligência artificial que analisa seus dados e oferece insights para crescer sua carreira.", color: "bg-blue-500" },
    { icon: TrendingUp, title: "Pushs de Performance", description: "Receba relatórios mensais com métricas, comparativos e dicas personalizadas.", color: "bg-purple-500" },
  ];

  const testimonials = [
    { name: "Lucas Mendes", role: "Cantor Sertanejo", text: "O Backstage Pro mudou completamente minha forma de gerenciar minha carreira. Antes eu perdia contratos por desorganização, agora tenho tudo na palma da mão!" },
    { name: "Amanda Silva", role: "Cantora Sertaneja", text: "A IA conselheira é incrível! Me deu insights que aumentaram meu faturamento em 40% em apenas 3 meses. Recomendo demais!" },
    { name: "Rafael Costa", role: "Cantor de Forró", text: "Finalmente um app que entende a rotina de um cantor! O controle financeiro automático me salvou de muita dor de cabeça." },
    { name: "Mariana Santos", role: "Cantora Pop", text: "O funil de vendas do Backstage Pro profissionalizou minhas negociações. Fechei o dobro de shows esse ano!" },
  ];

  const plans = [
    {
      name: "Inicial",
      description: "Para quem está começando",
      price: "49,90",
      period: "por mês",
      features: ["Dashboard interativo", "Painel de metas", "Financeiro completo", "Aulas de alavancagem", "CRM - Funil de Vendas", "Pushs Mensais"],
      popular: false,
      buttonVariant: "default" as const,
    },
    {
      name: "Essencial",
      description: "Para profissionais",
      price: "24,99",
      period: "por 6 meses",
      originalPrice: "299,40",
      equivalent: "Equivale a R$ 149,90/semestre",
      features: ["Tudo do Inicial +", "Aulas de alavancagem", "Histórico Mensal", "Pushs Mensais", "IA Automatizada no Funil / Contratos", "IA Conselheira de Carreira"],
      popular: true,
      buttonVariant: "secondary" as const,
    },
    {
      name: "Completo",
      description: "Melhor custo-benefício",
      price: "19,99",
      period: "por 12 meses",
      originalPrice: "598,80",
      equivalent: "Equivale a R$ 239,88/ano",
      features: ["Tudo do Essencial +", "Contratos", "Músicos da Banda", "Orçamentos", "Pushs Avançados"],
      popular: false,
      buttonVariant: "default" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[hsl(213,80%,25%)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Backstage</span>
            <span className="text-2xl font-bold text-cyan-400">Pro</span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-white/80 hover:text-white transition-colors">Recursos</a>
            <a href="#planos" className="text-white/80 hover:text-white transition-colors">Planos</a>
            <a href="#depoimentos" className="text-white/80 hover:text-white transition-colors">Depoimentos</a>
            <a href="#contato" className="text-white/80 hover:text-white transition-colors">Contato</a>
          </nav>
          
          <div className="hidden md:block">
            <Link to="/auth">
              <Button variant="outline" className="bg-white text-[hsl(213,80%,25%)] hover:bg-white/90 border-0">
                Testar Grátis
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-[hsl(213,80%,20%)] px-4 py-4 flex flex-col gap-4">
            <a href="#recursos" className="text-white/80 hover:text-white transition-colors">Recursos</a>
            <a href="#planos" className="text-white/80 hover:text-white transition-colors">Planos</a>
            <a href="#depoimentos" className="text-white/80 hover:text-white transition-colors">Depoimentos</a>
            <a href="#contato" className="text-white/80 hover:text-white transition-colors">Contato</a>
            <Link to="/auth">
              <Button variant="outline" className="bg-white text-[hsl(213,80%,25%)] hover:bg-white/90 border-0 w-full">
                Testar Grátis
              </Button>
            </Link>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(199, 89%, 48%) 0%, hsl(213, 80%, 25%) 100%)" }}>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span className="text-white/90 text-sm">+100+ artistas já usam o Backstage Pro</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            O app mais completo<br />
            <span className="text-cyan-300">de gestão</span> para <span className="text-cyan-300">artistas</span>
          </h1>
          
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Agenda, financeiro, funil de vendas, contratos, repertório e muito mais — tudo em um só lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-[hsl(213,80%,25%)] hover:bg-white/90 px-8">
                Começar Agora <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Play className="mr-2 w-5 h-5" /> Ver Planos
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white" />
                ))}
              </div>
              <span>+100+ usuários ativos</span>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              <span className="ml-1">4.9/5 de avaliação</span>
            </div>
            <span><span className="text-cyan-400">3 dias</span> grátis para testar</span>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <span className="text-red-500 text-sm font-semibold flex items-center justify-center gap-2 mb-4">
            <Play className="w-4 h-4" /> VÍDEOS
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[hsl(213,80%,25%)] mb-2">
            Conheça mais sobre o<br />
            <span className="text-cyan-500">Backstage Pro</span>
          </h2>
          <p className="text-gray-600 mb-10">
            Veja como o app funciona e depoimentos de quem já usa
          </p>
          
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white fill-white ml-1" />
              </div>
            </div>
            <div className="p-4 flex items-center gap-2 text-[hsl(213,80%,25%)]">
              <Play className="w-4 h-4 text-cyan-500" />
              <span className="font-medium">Conheça o Backstage Pro</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-cyan-500 text-sm font-semibold">RECURSOS PODEROSOS</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[hsl(213,80%,25%)] mt-2">
              Tudo que você precisa para<br />
              <span className="text-cyan-500">brilhar no palco e nos negócios</span>
            </h2>
            <p className="text-gray-600 mt-4">
              Funcionalidades pensadas por quem entende a rotina de um artista
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(213,80%,25%)] mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-cyan-500 text-sm font-semibold">DEMONSTRAÇÃO</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[hsl(213,80%,25%)] mt-2 mb-4">
                Crie uma rotina<br />
                inteligente e<br />
                <span className="text-cyan-500">aumente seus<br />resultados</span>
              </h2>
              <p className="text-gray-600 mb-8">
                Com o Backstage Pro, você tem controle total da sua carreira na palma da mão. Interface intuitiva, dados organizados e insights poderosos para você focar no que realmente importa: sua música.
              </p>
              
              <div className="space-y-4 mb-8">
                {["Agenda inteligente com lembretes", "Dashboard completo de métricas", "Contratos digitais prontos", "Gestão de repertório", "Relatórios financeiros automáticos"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-6 text-gray-500 text-sm">
                <span className="flex items-center gap-2">📱 iOS & Android</span>
                <span className="flex items-center gap-2">💻 Web Dashboard</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl transform rotate-3" />
              <div className="relative bg-gradient-to-br from-[hsl(213,80%,25%)] to-[hsl(199,89%,48%)] rounded-3xl p-8 transform -rotate-3 hover:rotate-0 transition-transform">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
                  <h3 className="text-white text-xl font-bold mb-4">Dashboard</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4">
                      <p className="text-white/70 text-sm">Receita Mensal</p>
                      <p className="text-white text-2xl font-bold">R$ 24.451</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4">
                      <p className="text-white/70 text-sm">Shows</p>
                      <p className="text-white text-2xl font-bold">12</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4">
                      <p className="text-white/70 text-sm">Leads</p>
                      <p className="text-white text-2xl font-bold">48</p>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4">
                      <p className="text-white/70 text-sm">Conversão</p>
                      <p className="text-white text-2xl font-bold">32%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-20" style={{ background: "linear-gradient(180deg, hsl(213, 80%, 25%) 0%, hsl(199, 89%, 48%) 100%)" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-cyan-300 text-sm font-semibold">DEPOIMENTOS</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-2">
              O que os cantores estão<br />
              <span className="text-cyan-300">dizendo sobre nós</span>
            </h2>
            <p className="text-white/70 mt-4">
              Junte-se a centenas de artistas que já transformaram suas carreiras
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-white/90 italic mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-cyan-300 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-cyan-500 text-sm font-semibold">PLANOS E PREÇOS</span>
            <h2 className="text-3xl md:text-5xl font-bold text-[hsl(213,80%,25%)] mt-2">
              Escolha o plano ideal<br />
              <span className="text-cyan-500">para sua carreira</span>
            </h2>
            <p className="text-gray-600 mt-4">
              Comece grátis por 3 dias. Cancele quando quiser.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`rounded-2xl p-6 ${
                  plan.popular 
                    ? "bg-[hsl(213,80%,25%)] text-white ring-4 ring-cyan-500 relative" 
                    : "bg-white border border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  plan.popular ? "bg-cyan-500" : "bg-blue-100"
                }`}>
                  <Sparkles className={`w-6 h-6 ${plan.popular ? "text-white" : "text-blue-600"}`} />
                </div>
                
                <h3 className={`text-xl font-bold ${plan.popular ? "text-white" : "text-[hsl(213,80%,25%)]"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>
                  {plan.description}
                </p>
                
                {plan.equivalent && (
                  <p className="text-cyan-400 text-sm mb-2">{plan.equivalent}</p>
                )}
                
                <div className="mb-2">
                  <span className={`text-sm ${plan.popular ? "text-white/70" : "text-gray-500"}`}>R$</span>
                  <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-[hsl(213,80%,25%)]"}`}>
                    {plan.price}
                  </span>
                </div>
                <p className={`text-sm mb-4 ${plan.popular ? "text-white/70" : "text-gray-500"}`}>
                  {plan.period}
                  {plan.originalPrice && (
                    <span className="line-through ml-2">De R$ {plan.originalPrice}</span>
                  )}
                </p>
                
                <Link to="/auth">
                  <Button 
                    className={`w-full mb-6 ${
                      plan.popular 
                        ? "bg-white text-[hsl(213,80%,25%)] hover:bg-white/90" 
                        : index === 2 
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90"
                          : "bg-[hsl(213,80%,25%)] text-white hover:bg-[hsl(213,80%,20%)]"
                    }`}
                  >
                    Assinar Agora
                  </Button>
                </Link>
                
                <p className={`text-sm font-semibold mb-4 ${plan.popular ? "text-cyan-400" : "text-cyan-600"}`}>
                  INCLUI:
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className={`w-4 h-4 ${plan.popular ? "text-cyan-400" : "text-cyan-600"}`} />
                      <span className={`text-sm ${plan.popular ? "text-white/90" : "text-gray-600"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-cyan-500 text-sm font-semibold">FALE CONOSCO</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(213,80%,25%)] mt-2">
              Tem alguma dúvida?
            </h2>
            <p className="text-gray-600 mt-2">
              Envie sua mensagem que entraremos em contato o mais rápido possível
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input 
                  type="text" 
                  placeholder="Seu nome completo"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input 
                  type="email" 
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone / WhatsApp</label>
              <input 
                type="tel" 
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem *</label>
              <textarea 
                placeholder="Como podemos ajudar você?"
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90">
                <Mail className="mr-2 w-4 h-4" /> Enviar Mensagem
              </Button>
              <Button variant="outline" className="flex-1 border-cyan-500 text-cyan-600 hover:bg-cyan-50">
                💬 Prefiro WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-3xl p-12 text-center" style={{ background: "linear-gradient(135deg, hsl(213, 80%, 25%) 0%, hsl(199, 89%, 48%) 100%)" }}>
            <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-cyan-300" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para profissionalizar<br />
              <span className="text-cyan-300">sua carreira?</span>
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Junte-se a milhares de artistas que já estão crescendo com o Backstage Pro.<br />
              Comece hoje mesmo, é grátis por 3 dias!
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-white text-[hsl(213,80%,25%)] hover:bg-white/90 px-8">
                Quero Começar Agora <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-white/60 text-sm mt-4">
              Sem cartão de crédito • Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-[hsl(213,80%,20%)]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                  B
                </div>
                <span className="text-xl font-bold text-white">Backstage<span className="text-cyan-400">Pro</span></span>
              </div>
              <p className="text-white/60 text-sm mb-4">
                O app mais completo de gestão para artistas.<br />
                Organize sua carreira, aumente seus resultados.
              </p>
              <div className="space-y-2 text-white/60 text-sm">
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> backstagepro.ctt@gmail.com</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> (12) 99154-5726</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> São Paulo, Brasil</p>
              </div>
              <div className="flex gap-3 mt-4">
                <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors">
                  📷
                </a>
                <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors">
                  ▶️
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#recursos" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#planos" className="hover:text-white transition-colors">Planos</a></li>
                <li><a href="#depoimentos" className="hover:text-white transition-colors">Depoimentos</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-white/60 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/40 text-sm">
              © 2025 Backstage Pro. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
