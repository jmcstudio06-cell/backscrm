import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowUpRight, Briefcase, Building2, CalendarDays, Check, ChevronLeft, ChevronRight, Crown,
  FileText, Gift, MapPin, Menu, MessageCircle, Music2, Play, ShieldCheck, Sparkles, Star, Users, Wallet, X,
  TriangleAlert, Link2, DollarSign, ClipboardList,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { LandingExperience } from "@/components/landing/LandingExperience";
import brandIcon from "@/assets/ba-icon.png";
import founderPhoto from "@/assets/team/jose-mario.png";
import larissaGoogle from "@/assets/testimonials/larissa-google.png";
import marceloGoogle from "@/assets/testimonials/marcelo-google.png";
import fabioGoogle from "@/assets/testimonials/fabio-google.png";
import "@/styles/landing.css";

const SUPPORT_WHATSAPP_URL = "https://wa.me/5512992423317?text=" + encodeURIComponent("Olá! Tenho dúvidas sobre o Backstage Pro e gostaria de falar com um atendente humano.");
const VIDEO_IDS = { app: "d-Hx3NwVuIM", victor: "_nUOr9qoNgI" } as const;

const navigation = [
  { href: "#recursos", label: "O app" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#depoimentos", label: "Quem usa" },
  { href: "#planos", label: "Planos" },
  { href: "#faq", label: "FAQ" },
];

const tools = [
  { icon: CalendarDays, title: "Agenda de shows", description: "Datas, horários e combinados sempre à mão." },
  { icon: Wallet, title: "Cachês e financeiro", description: "Recebimentos, despesas e resultados no mesmo lugar." },
  { icon: FileText, title: "Contratos e orçamentos", description: "Do combinado à assinatura, com apresentação profissional." },
  { icon: Users, title: "Equipe e freelancers", description: "Músicos, funções e pagamentos organizados por show." },
  { icon: MapPin, title: "Backs Radar", description: "Novas oportunidades em bares, restaurantes, hotéis e casas de show." },
  { icon: Music2, title: "Muito além da agenda", description: "Repertório, metas, mapa de palco e links profissionais." },
];

const steps = [
  { icon: Users, title: "O contato", description: "A oportunidade chega e vai direto para o seu CRM." },
  { icon: FileText, title: "O combinado", description: "Orçamento e contrato prontos em poucos cliques." },
  { icon: CalendarDays, title: "O show", description: "Agenda, equipe e repertório no mesmo lugar." },
  { icon: Wallet, title: "O resultado", description: "Cachê, despesas e histórico sempre claros." },
];

const reviews = [
  { name: "Larissa Santos Produções", image: larissaGoogle },
  { name: "Marcelo Cantor", image: marceloGoogle },
  { name: "Fábio Martins · Viverarte Violão", image: fabioGoogle },
];

const plans = [
  {
    id: "pro", name: "Profissional", badge: "PARA COMEÇAR", icon: Briefcase,
    subtitle: "Organize sua área comercial e feche mais shows com processos profissionais.",
    features: ["Agenda ilimitada", "Clientes e CRM", "Repertório", "Financeiro", "Precificação", "Orçamentos automáticos", "Checklist de show", "Link da Bio / Press Kit"],
  },
  {
    id: "full", name: "Empresarial", badge: "MAIS POPULAR", icon: Crown, popular: true,
    subtitle: "Controle total da carreira, com metas, performance e gestão completa do seu negócio.",
    features: ["Tudo do Profissional", "Equipe e freelancers", "Link de agendamento", "Contratos automáticos", "Histórico financeiro", "Cobranças pendentes", "Mapeamento de palco", "Metas e bônus"],
  },
  {
    id: "executivo", name: "Executivo", badge: "MAIS COMPLETO", icon: Building2,
    subtitle: "Tenha a gestão completa e encontre novas oportunidades para cantar com o Backs Radar.",
    features: ["Tudo do Empresarial", "Backs Radar", "Oportunidades perto de você", "Contatos de bares, restaurantes, hotéis e casas de show", "Envio direto ao CRM", "Gestão de usuários"],
  },
];

const faqItems = [
  { question: "Posso testar o Backstage Pro antes de assinar?", answer: "Sim. Ao criar sua conta, você recebe 3 horas de acesso gratuito para conhecer o app, sem precisar cadastrar cartão de crédito." },
  { question: "Consigo usar no celular e no computador?", answer: "Sim. O Backstage Pro funciona no celular, tablet e computador. Seus dados ficam sincronizados na mesma conta para você acessar onde estiver." },
  { question: "Qual é a diferença entre os planos?", answer: "Cada plano libera um conjunto diferente de ferramentas. O Profissional organiza sua operação comercial, o Empresarial amplia a gestão da carreira e o Executivo inclui tudo, além do Backs Radar." },
  { question: "O que é o Backs Radar?", answer: "É uma ferramenta exclusiva do plano Executivo que ajuda você a encontrar oportunidades em bares, restaurantes, hotéis e casas de show nas cidades selecionadas e enviar os contatos para o seu CRM." },
  { question: "Meus dados ficam seguros?", answer: "Sim. Cada artista acessa somente os dados da própria conta, com proteção de acesso e isolamento das informações." },
  { question: "Posso cancelar quando quiser?", answer: "Sim. Você pode cancelar sua assinatura quando quiser. O acesso ao plano permanece disponível durante o período já contratado." },
  { question: "E se eu precisar de ajuda?", answer: "Você encontra tutoriais dentro do app e também pode falar diretamente com nosso atendimento pelo WhatsApp." },
];

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function Brand() {
  return (
    <Link to="/landing" className="lp-brand" aria-label="Backstage Pro, início">
      <img src={brandIcon} alt="" width={34} height={34} />
      <span>Backstage Pro<sup>®</sup></span>
    </Link>
  );
}

function TrialLink({ className = "", label = "Testar grátis" }: { className?: string; label?: string }) {
  return <Link to="/auth" className={`lp-btn lp-btn-primary ${className}`}>{label}<ArrowRight /></Link>;
}

function Check2() {
  return <span className="lp-check" aria-hidden="true"><Check /></span>;
}

/** Mock visual do painel — apresentação estática, sem dados reais */
function AppMock() {
  const cards = [
    { icon: Link2,         label: "Link Agenda",    sub: "Pedidos online",  bg: "linear-gradient(135deg,#0066CC,#00B4D8)" },
    { icon: MapPin,        label: "Mapa de Palco",  sub: "Rider digital",   bg: "linear-gradient(135deg,#7C3AED,#A855F7)" },
    { icon: DollarSign,    label: "Financeiro",     sub: "Receita auto",    bg: "linear-gradient(135deg,#059669,#10B981)" },
    { icon: CalendarDays,  label: "Agenda",         sub: "Shows no jeito",  bg: "linear-gradient(135deg,#D97706,#F59E0B)" },
    { icon: FileText,      label: "Orçamento",      sub: "1 clique",        bg: "linear-gradient(135deg,#DB2777,#EC4899)" },
    { icon: ClipboardList, label: "Contrato",       sub: "Envio rápido",    bg: "linear-gradient(135deg,#0284C7,#38BDF8)" },
  ];
  return (
    <div className="lp-app-mock" aria-hidden="true">
      {/* Barra de título */}
      <div className="lp-app-mock-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/favicon.png" width={18} height={18} alt="" style={{ borderRadius: 4 }} />
          <span>Backstage Pro — Painel do Artista</span>
        </div>
        <div className="lp-app-mock-dots">
          <i style={{ background: "#ff5f57" }} />
          <i style={{ background: "#febc2e" }} />
          <i style={{ background: "#28c840" }} />
        </div>
      </div>
      {/* Grid de cards */}
      <div className="lp-app-mock-grid">
        {cards.map(({ icon: Icon, label, sub, bg }) => (
          <div key={label} className="lp-app-card">
            <div className="lp-app-card-icon" style={{ background: bg }}>
              <Icon />
            </div>
            <div>
              <strong>{label}</strong>
              <small>{sub}</small>
            </div>
          </div>
        ))}
      </div>
      {/* Stats */}
      <div className="lp-app-stats">
        <div className="lp-app-stat"><strong>2min</strong><small>Setup</small></div>
        <div className="lp-app-stat"><strong>+100</strong><small>Artistas</small></div>
        <div className="lp-app-stat"><strong>100%</strong><small>Prático</small></div>
      </div>
    </div>
  );
}

/** Presentation-only calculator: nothing is saved, it only reflects the visitor's own numbers. */
function ShowCalculator() {
  const [shows, setShows] = useState(8);
  const [fee, setFee] = useState(800);
  const monthly = shows * fee;
  const yearly = monthly * 12;

  return (
    <div className="lp-calc lp-glass">
      <h3>Faça as contas</h3>
      <p>Arraste e veja quanto passa pelas suas mãos.</p>
      <div className="lp-calc-field">
        <div className="lp-calc-label"><span id="calc-shows">Shows por mês</span><strong>{shows}</strong></div>
        <Slider className="lp-slider" aria-labelledby="calc-shows" min={1} max={30} step={1} value={[shows]} onValueChange={([value]) => setShows(value)} />
      </div>
      <div className="lp-calc-field">
        <div className="lp-calc-label"><span id="calc-fee">Cachê médio</span><strong>{brl.format(fee)}</strong></div>
        <Slider className="lp-slider" aria-labelledby="calc-fee" min={150} max={5000} step={50} value={[fee]} onValueChange={([value]) => setFee(value)} />
      </div>
      <div className="lp-calc-result" aria-live="polite">
        <span>Seu faturamento com shows em um ano</span>
        <strong>{brl.format(yearly)}</strong>
        <p>{brl.format(monthly)} por mês em cachês, despesas e pagamentos de equipe para acompanhar.</p>
      </div>
      <p className="lp-calc-note">Simulação com os valores que você escolheu. Nada é salvo.</p>
    </div>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [video, setVideo] = useState<keyof typeof VIDEO_IDS | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const landingRef = useRef<HTMLDivElement>(null);
  const currentReview = reviews[reviewIndex];
  const marqueeWords = useMemo(() => ["ORGANIZAÇÃO", "CONTROLE", "GESTÃO DE CARREIRA", "FEITO PARA ARTISTAS", "BACKSTAGE PRO"], []);

  // Once-per-element scroll reveal.
  useEffect(() => {
    const root = landingRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("landing-scroll-reveal");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    root.querySelectorAll(".lp-heading, .lp-reveal, .lp-tool, .lp-step, .lp-plan-wrap, .landing-experience").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Review carousel auto-advance.
  useEffect(() => {
    const timer = window.setInterval(() => setReviewIndex((index) => (index + 1) % reviews.length), 6000);
    return () => window.clearInterval(timer);
  }, [reviewIndex]);

  return (
    <div className="landing-page" ref={landingRef}>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" />
        <title>Backstage Pro — Sistema de Gestão para Artistas e Músicos</title>
        <meta name="description" content="Plataforma completa para artistas: agenda de shows, financeiro, CRM de leads, contratos, orçamentos e equipe. Comece grátis." />
        <link rel="canonical" href="https://backstageproapp.com/landing" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Backstage Pro — Plataforma para Músicos" />
        <meta property="og:description" content="Organize sua agenda, cachês, contratos e contatos em um único painel. Feito para artistas." />
        <meta property="og:url" content="https://backstageproapp.com/landing" />
        <meta property="og:image" content="https://backstageproapp.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Helmet>

      <header className="lp-header">
        <div className="lp-container lp-header-row">
          <Brand />
          <nav className="lp-nav" aria-label="Menu principal">
            {navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
          <div className="lp-header-actions">
            <Link to="/auth" className="lp-login">Entrar</Link>
            <TrialLink className="lp-btn-sm" />
            <button type="button" className="lp-menu-toggle" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="lp-mobile-nav" aria-label="Menu móvel">
            {navigation.map((item) => <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<ArrowUpRight className="h-4 w-4" /></a>)}
            <Link to="/auth">Entrar<ArrowUpRight className="h-4 w-4" /></Link>
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="lp-hero" aria-labelledby="landing-title">
          <div className="lp-grid-bg" aria-hidden="true" />
          <span className="lp-glow lp-glow-blue" style={{ width: 420, height: 420, top: -120, left: -140 }} aria-hidden="true" />
          <span className="lp-glow lp-glow-cyan" style={{ width: 420, height: 420, bottom: -160, right: -120 }} aria-hidden="true" />
          <div className="lp-container lp-hero-grid">
            <div className="lp-hero-copy">
              <span className="lp-eyebrow"><span className="lp-eyebrow-dot" />Feito para quem vive de música</span>
              <h1 id="landing-title">Sua carreira musical,<span className="lp-text-gradient">organizada como um negócio.</span></h1>
              <p className="lp-hero-lead">Seu talento é no palco. A organização deixa com a gente. Agenda, contratos, cachês e finanças em um só app. Pare de perder oportunidades por falta de controle.</p>
              <div className="lp-hero-ctas">
                <TrialLink label="Cadastrar grátis" />
                <button type="button" className="lp-btn lp-btn-ghost" onClick={() => setVideo("app")}><Play />Ver o app em ação</button>
              </div>
              <div className="lp-hero-trust">
                <span><Check2 />Sem cartão de crédito</span>
                <span><Check2 />Cadastro em 2 minutos</span>
                <span><Check2 />Cancele quando quiser</span>
              </div>
              <div className="lp-hero-social">
                <div className="lp-hero-avatars">
                  {[1,2,3,4].map((i) => (
                    <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(255,255,255,.3)", marginRight: -8, background: `hsl(${i*60} 60% 55%)`, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
                      {["P","M","J","R"][i-1]}
                    </div>
                  ))}
                </div>
                <div className="lp-hero-social-text">
                  <div className="lp-hero-stars">{[0,1,2,3,4].map((i) => <Star key={i} />)}</div>
                  <strong>+90 Artistas</strong>
                  <span>já organizam a carreira aqui</span>
                </div>
              </div>
            </div>

            <div className="lp-hero-visual">
              <AppMock />
            </div>
          </div>
        </section>

        {/* Wave separador */}
        <div className="lp-hero-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 64" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="hsl(var(--background))" />
          </svg>
        </div>

        <div className="lp-marquee" aria-hidden="true">
          <div className="lp-marquee-track">
            {[0, 1].map((copy) => marqueeWords.map((word) => <span className="lp-marquee-word" key={`${copy}-${word}`}>{word}<Sparkles /></span>))}
          </div>
        </div>

        {/* Pain + calculator */}
        <section className="lp-dark" aria-labelledby="dinheiro-title">
          <div className="lp-grid-bg" aria-hidden="true" />
          <span className="lp-glow lp-glow-blue" style={{ width: 380, height: 380, top: -80, left: -100 }} aria-hidden="true" />
          <span className="lp-glow lp-glow-cyan" style={{ width: 380, height: 380, bottom: -120, right: -60 }} aria-hidden="true" />
          <div className="lp-container lp-dark-grid">
            <div className="lp-reveal">
              <span className="lp-eyebrow">O LADO B DO PALCO</span>
              <h2 id="dinheiro-title">Você já faz o show.<br /><span className="lp-text-gradient">Falta enxergar o negócio.</span></h2>
              <p className="lp-dark-lead">Show combinado no WhatsApp, cachê anotado no caderno, contrato perdido no e-mail. Quando a carreira cresce, a bagunça cresce junto.</p>
              <ul className="lp-pain-list">
                <li><TriangleAlert />Datas e combinados espalhados em vários lugares</li>
                <li><TriangleAlert />Cachês a receber que ninguém cobra</li>
                <li><TriangleAlert />Contatos que viram show e depois somem</li>
              </ul>
            </div>
            <div className="lp-reveal"><ShowCalculator /></div>
          </div>
        </section>

        {/* App */}
        <section id="recursos" className="lp-section">
          <div className="lp-container">
            <div className="lp-heading">
              <span className="lp-eyebrow">O SEU BACKSTAGE</span>
              <h2>Um app completo.<br /><span className="lp-text-gradient">Uma rotina mais leve.</span></h2>
              <p>Clique nas abas e explore. O show acontece no palco, antes e depois dele o Backstage Pro cuida da organização com você.</p>
            </div>
            <LandingExperience />
            <div className="lp-tools">
              {tools.map(({ icon: Icon, title, description }) => (
                <div key={title} className="lp-tool">
                  <span className="lp-tool-icon"><Icon /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="lp-section lp-section-soft">
          <div className="lp-container">
            <div className="lp-heading">
              <span className="lp-eyebrow">TUDO CONVERSA ENTRE SI</span>
              <h2>Um show não é só uma data.</h2>
              <p>Do primeiro contato ao cachê recebido, cada etapa fica conectada.</p>
            </div>
            <div className="lp-steps">
              {steps.map(({ icon: Icon, title, description }, index) => (
                <div key={title} className="lp-step">
                  <div className="lp-step-icon"><Icon /><b>{index + 1}</b></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section id="depoimentos" className="lp-section">
          <div className="lp-container">
            <div className="lp-heading">
              <span className="lp-eyebrow">QUEM JÁ ESTÁ NO PALCO</span>
              <h2>Gente de verdade.<br /><span className="lp-text-gradient">Rotinas de verdade.</span></h2>
              <p>Conheça a experiência de artistas que usam o Backstage Pro no dia a dia.</p>
            </div>
            <div className="lp-reviews lp-reveal">
              <button type="button" className="lp-video-card" onClick={() => setVideo("victor")} aria-label="Assistir ao depoimento de Victor Viola">
                <span className="lp-glow lp-glow-blue" style={{ top: -60, right: -60 }} aria-hidden="true" />
                <span className="lp-glow lp-glow-cyan" style={{ bottom: -80, left: -60 }} aria-hidden="true" />
                <span className="lp-play"><Play /></span>
                <small>DEPOIMENTO EM VÍDEO</small>
                <h3>Victor Viola</h3>
                <p>A experiência de quem vive de música, contada em primeira pessoa.</p>
              </button>
              <div className="lp-review-card" aria-roledescription="carrossel">
                <div className="lp-review-top">
                  <div>
                    <span className="lp-stars" aria-label="5 estrelas">{[0, 1, 2, 3, 4].map((i) => <Star key={i} />)}</span>
                    <p className="lp-review-label">AVALIAÇÕES NO GOOGLE</p>
                  </div>
                  <div className="lp-review-arrows">
                    <button type="button" className="lp-icon-btn" aria-label="Avaliação anterior" onClick={() => setReviewIndex((reviewIndex + reviews.length - 1) % reviews.length)}><ChevronLeft className="h-5 w-5" /></button>
                    <button type="button" className="lp-icon-btn" aria-label="Próxima avaliação" onClick={() => setReviewIndex((reviewIndex + 1) % reviews.length)}><ChevronRight className="h-5 w-5" /></button>
                  </div>
                </div>
                <div key={currentReview.name} className="lp-review-image" aria-live="polite">
                  <img src={currentReview.image} alt={`Avaliação de ${currentReview.name} no Google`} loading="lazy" />
                </div>
                <div className="lp-review-foot">
                  <span>{currentReview.name}</span>
                  <span className="lp-dots">{reviews.map((review, index) => <span key={review.name} className={`lp-dot ${index === reviewIndex ? "is-active" : ""}`} />)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Founder */}
        <section id="quem-somos" className="lp-section lp-section-soft">
          <div className="lp-container lp-founder">
            <div className="lp-founder-photo lp-reveal"><img src={founderPhoto} alt="José Mario Campos, fundador do Backstage Pro" loading="lazy" /></div>
            <div className="lp-reveal">
              <span className="lp-eyebrow">CRIADO POR UM ARTISTA. PARA ARTISTAS.</span>
              <h2>Nasceu fora da planilha.<br /><span className="lp-text-gradient">E dentro da vida real.</span></h2>
              <p>José Mario Campos, também conhecido como Mario Oliveira, é cantor. Como muitos artistas, organizava shows, contatos e ideias em planilhas, mas sentia falta de enxergar seus próprios resultados.</p>
              <p>O Backstage Pro nasceu dessa necessidade: uma ferramenta que entendesse a rotina de quem vive de palco.</p>
              <div className="lp-signature"><strong>José Mario Campos</strong><span>Artista e fundador do Backstage Pro</span></div>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section id="planos" className="lp-section">
          <div className="lp-container">
            <div className="lp-heading">
              <span className="lp-eyebrow">NO RITMO DA SUA CARREIRA</span>
              <h2>Seu próximo passo<br /><span className="lp-text-gradient">tem lugar aqui.</span></h2>
              <p>Comece grátis. Conheça o app e escolha o plano que acompanha o seu momento.</p>
            </div>
            <div className="lp-plans">
              {plans.map((plan) => (
                <div key={plan.id} className={`lp-plan-wrap ${plan.popular ? "is-popular" : ""}`}>
                  <article className="lp-plan">
                    <div className="lp-plan-top">
                      <span className="lp-tool-icon"><plan.icon /></span>
                      <span className="lp-plan-badge">{plan.badge}</span>
                    </div>
                    <h3>{plan.name}</h3>
                    <p>{plan.subtitle}</p>
                    <ul>{plan.features.map((feature) => <li key={feature}><Check2 /><span>{feature}</span></li>)}</ul>
                    <TrialLink className={plan.popular ? "" : "lp-btn-ghost"} />
                    <span className="lp-plan-note">3 horas grátis · Sem cartão de crédito</span>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="lp-section lp-section-soft">
          <div className="lp-container lp-faq">
            <div className="lp-faq-aside lp-reveal">
              <span className="lp-eyebrow">SEM DÚVIDAS NO CAMINHO</span>
              <h2>Perguntas<br /><span className="lp-text-gradient">frequentes.</span></h2>
              <p>Prefere conversar com alguém?</p>
              <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="lp-btn lp-btn-ghost lp-btn-sm mt-4"><MessageCircle />Falar com um atendente</a>
            </div>
            <Accordion type="single" collapsible className="lp-reveal">
              {faqItems.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`} className="lp-faq-item">
                  <AccordionTrigger className="lp-faq-trigger">{item.question}</AccordionTrigger>
                  <AccordionContent className="pr-6 text-base leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section id="contato" className="lp-section">
          <div className="lp-container">
            <div className="lp-cta-wrap lp-reveal">
              <div className="lp-cta">
                <div className="lp-grid-bg" aria-hidden="true" />
                <span className="lp-glow lp-glow-blue" style={{ width: 340, height: 340, top: -120, left: -100 }} aria-hidden="true" />
                <span className="lp-glow lp-glow-cyan" style={{ width: 340, height: 340, bottom: -140, right: -80 }} aria-hidden="true" />
                <div className="lp-cta-icon"><Music2 className="h-8 w-8" /></div>
                <h2>O próximo show é seu.<br /><span className="lp-text-gradient">A organização é com a gente.</span></h2>
                <p>Crie sua conta agora e conheça o Backstage Pro por 3 horas, sem cartão de crédito.</p>
                <div className="lp-cta-actions">
                  <TrialLink label="Criar minha conta grátis" />
                  <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="lp-btn lp-btn-ghost"><MessageCircle />Falar no WhatsApp</a>
                </div>
                <div className="lp-cta-links">
                  <button type="button" className="lp-cta-link" onClick={() => setVideo("app")}><Play /><span><strong>Ver o app em ação</strong><small>Vídeo de 1 minuto</small></span></button>
                  <Link to="/kit-profissional" className="lp-cta-link"><Gift /><span><strong>Kit Profissional</strong><small>Ferramentas grátis</small></span></Link>
                  <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="lp-cta-link"><MessageCircle /><span><strong>Atendimento humano</strong><small>Pelo WhatsApp</small></span></a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-top">
            <Brand />
            <nav aria-label="Links legais">
              <Link to="/termos">Termos de Uso</Link>
              <Link to="/privacidade">Privacidade</Link>
              <Link to="/kit-profissional">Kit Profissional</Link>
              <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Suporte</a>
            </nav>
            <p className="text-sm text-muted-foreground">© 2024 Backstage Pro.</p>
          </div>
          <div className="lp-registration">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            <div>
              <p>Backstage Pro® — marca registrada. Empresa com registro de marca, titularidade registrada por Jose Mario Campos.</p>
              <p className="mt-1">CNPJ 69.458.195/0001-14</p>
            </div>
          </div>
        </div>
      </footer>

      <nav className="lp-dock" aria-label="Contato e cadastro">
        <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="lp-btn lp-btn-ghost" aria-label="Falar no WhatsApp"><MessageCircle />WhatsApp</a>
        <TrialLink />
      </nav>

      <Dialog open={video !== null} onOpenChange={(open) => { if (!open) setVideo(null); }}>
        <DialogContent className="max-w-[860px]">
          <DialogTitle>{video === "victor" ? "Depoimento de Victor Viola" : "Backstage Pro em ação"}</DialogTitle>
          <DialogDescription>Conheça o Backstage Pro em vídeo.</DialogDescription>
          {video && (
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_IDS[video]}?autoplay=1`}
              title={video === "victor" ? "Depoimento Victor Viola" : "Veja o app na prática"}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
