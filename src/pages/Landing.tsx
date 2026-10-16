import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, ChevronLeft, ChevronRight, Crown, FileText, Gift, Menu, MessageCircle, Mic2, Play, ShieldCheck, Users, Wallet, X, MapPin, Music2, Briefcase, Building2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LandingExperience } from "@/components/landing/LandingExperience";
import stagePhoto from "@/assets/landing-stage.jpg";
import brandIcon from "@/assets/ba-icon.png";
import founderPhoto from "@/assets/team/jose-mario.png";
import larissaGoogle from "@/assets/testimonials/larissa-google.png";
import marceloGoogle from "@/assets/testimonials/marcelo-google.png";
import fabioGoogle from "@/assets/testimonials/fabio-google.png";

const SUPPORT_WHATSAPP_URL = "https://wa.me/5512992423317?text=" + encodeURIComponent("Olá! Tenho dúvidas sobre o Backstage Pro e gostaria de falar com um atendente humano.");
const faqItems = [
  {
    question: "Posso testar o Backstage Pro antes de assinar?",
    answer: "Sim. Ao criar sua conta, você recebe 3 horas de acesso gratuito para conhecer o app, sem precisar cadastrar cartão de crédito.",
  },
  {
    question: "Consigo usar no celular e no computador?",
    answer: "Sim. O Backstage Pro funciona no celular, tablet e computador. Seus dados ficam sincronizados na mesma conta para você acessar onde estiver.",
  },
  {
    question: "Qual é a diferença entre os planos?",
    answer: "Cada plano libera um conjunto diferente de ferramentas. O Profissional organiza sua operação comercial, o Empresarial amplia a gestão da carreira e o Executivo inclui tudo, além do Backs Radar.",
  },
  {
    question: "O que é o Backs Radar?",
    answer: "É uma ferramenta exclusiva do plano Executivo que ajuda você a encontrar oportunidades em bares, restaurantes, hotéis e casas de show nas cidades selecionadas e enviar os contatos para o seu CRM.",
  },
  {
    question: "Meus dados ficam seguros?",
    answer: "Sim. Cada artista acessa somente os dados da própria conta, com proteção de acesso e isolamento das informações.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer: "Sim. Você pode cancelar sua assinatura quando quiser. O acesso ao plano permanece disponível durante o período já contratado.",
  },
  {
    question: "E se eu precisar de ajuda?",
    answer: "Você encontra tutoriais dentro do app e também pode falar diretamente com nosso atendimento pelo WhatsApp.",
  },
];


const plans = [
  {
    id: "pro",
    name: "Profissional",
    subtitle: "Organize sua área comercial e feche mais shows com processos profissionais.",
    badgeText: "PARA COMEÇAR",
    icon: Briefcase,
    features: ["Agenda ilimitada", "Clientes e CRM", "Repertório", "Financeiro", "Precificação", "Orçamentos automáticos", "Checklist de show", "Link da Bio / Press Kit"],
  },
  {
    id: "full",
    name: "Empresarial",
    subtitle: "Controle total da carreira, com metas, performance e gestão completa do seu negócio.",
    badgeText: "MAIS POPULAR",
    icon: Crown,
    features: ["Tudo do Profissional", "Equipe e freelancers", "Link de agendamento", "Contratos automáticos", "Histórico financeiro", "Cobranças pendentes", "Mapeamento de palco", "Metas e bônus"],
  },
  {
    id: "executivo",
    name: "Executivo",
    subtitle: "Tenha a gestão completa e encontre novas oportunidades para cantar com o Backs Radar.",
    badgeText: "MAIS COMPLETO",
    icon: Building2,
    features: ["Tudo do Empresarial", "Backs Radar", "Oportunidades perto de você", "Contatos de bares, restaurantes, hotéis e casas de show", "Envio direto ao CRM", "Gestão de usuários"],
  },
];


const tools = [
  { icon: CalendarDays, title: "Agenda de shows", description: "Datas, horários e combinados sempre à mão." },
  { icon: Wallet, title: "Cachês e financeiro", description: "Recebimentos, despesas e resultados no mesmo lugar." },
  { icon: FileText, title: "Contratos e orçamentos", description: "Do combinado à assinatura, com apresentação profissional." },
  { icon: Users, title: "Equipe e freelancers", description: "Músicos, funções e pagamentos organizados por show." },
  { icon: MapPin, title: "Backs Radar", description: "Novas oportunidades em bares, restaurantes, hotéis e casas de show." },
  { icon: Music2, title: "Muito além da agenda", description: "Repertório, metas, mapa de palco e links profissionais." },
];
const reviews = [
  { name: "Larissa Santos Producoes", image: larissaGoogle },
  { name: "Marcelo Cantor", image: marceloGoogle },
  { name: "Fábio Martins · Viverarte Violão", image: fabioGoogle },
];
const navigation = [{ href: "#recursos", label: "O app" }, { href: "#depoimentos", label: "Quem usa" }, { href: "#planos", label: "Planos" }, { href: "#faq", label: "FAQ" }];

function Brand() {
  return <Link to="/landing" className="landing-brand" aria-label="Backstage Pro, início"><img src={brandIcon} alt="" width={34} height={34} /><span>Backstage<span className="font-normal"> Pro</span><span className="landing-brand-mark">®</span></span></Link>;
}
function TrialButton({ className = "" }: { className?: string }) {
  return <Button asChild size="lg" className={`landing-trial ${className}`}><Link to="/auth">Testar grátis<ArrowRight className="h-4 w-4" /></Link></Button>;
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [video, setVideo] = useState<"app" | "victor" | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const currentReview = reviews[reviewIndex];
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = landingRef.current;
    if (!root || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('landing-scroll-reveal');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    root.querySelectorAll('.landing-section-heading, .landing-experience, .landing-tool, .landing-workflow-step, .landing-reviews-grid, .landing-founder-copy, .landing-founder-photo, .landing-plan, .landing-faq-grid, .landing-contact-grid').forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  return (
    <div className="landing-page" ref={landingRef}>
      <Helmet>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" />
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
      <header className="landing-header">
        <div className="landing-container flex h-20 items-center justify-between gap-4">
          <Brand />
          <nav aria-label="Menu principal" className="hidden lg:flex items-center gap-1">{navigation.map(item => <Button key={item.href} variant="ghost" asChild className="landing-nav-link"><a href={item.href}>{item.label}</a></Button>)}</nav>
          <div className="flex items-center gap-2"><Button asChild variant="ghost" className="hidden sm:inline-flex"><Link to="/auth">Entrar<ArrowUpRight /></Link></Button><TrialButton className="hidden sm:inline-flex" /><Button variant="ghost" size="icon" className="lg:hidden" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button></div>
        </div>
        {menuOpen && <nav aria-label="Menu móvel" className="landing-mobile-nav">{navigation.map(item => <Button key={item.href} variant="ghost" asChild><a href={item.href} onClick={() => setMenuOpen(false)}>{item.label}<ArrowUpRight /></a></Button>)}<Button asChild variant="outline"><Link to="/auth">Entrar</Link></Button></nav>}
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <img src={stagePhoto} alt="Cantor se apresentando ao vivo com sua banda" width={1600} height={912} className="landing-stage-photo" fetchPriority="high" />
        <div className="landing-hero-shade" />
        <span className="landing-orb landing-orb-a" aria-hidden="true" /><span className="landing-orb landing-orb-b" aria-hidden="true" />
        <div className="landing-container relative z-10">
          <div className="landing-hero-copy">
            <p className="landing-hero-eyebrow"><span />FEITO PARA QUEM VIVE DE MÚSICA</p>
            <h1 id="landing-title">Backstage Pro<span>Seu talento no palco.<br />Sua carreira no controle.</span></h1>
            <p className="landing-hero-description">Agenda, cachês, contratos e contatos.<br className="hidden sm:block" /> Tudo junto. Do primeiro convite ao próximo show.</p>
            <div className="flex flex-wrap gap-3 mt-8"><TrialButton /><Button variant="outline" size="lg" className="landing-watch" onClick={() => setVideo("app")}><Play className="h-4 w-4" />Ver o app em ação</Button></div>
            <p className="landing-hero-reassurance"><Check className="h-4 w-4" />3 horas para conhecer · Sem cartão de crédito</p>
          </div>
          <div className="landing-hero-chips" aria-hidden="true">{[{ icon: CalendarDays, title: "Show confirmado", note: "Agenda atualizada" }, { icon: FileText, title: "Contrato enviado", note: "Pronto para assinar" }, { icon: Wallet, title: "Cachê recebido", note: "Financeiro em dia" }].map(({ icon: Icon, title, note }) => <div className="landing-hero-chip" key={title}><span><Icon className="h-5 w-5" /></span><span>{title}<small>{note}</small></span></div>)}</div>
          <div className="landing-hero-bottom"><span>MENOS IMPROVISO. MAIS CARREIRA.</span></div>
        </div>
      </section>
      <div className="landing-diagonal" role="region" aria-label="Organização, controle, gestão de carreira, Backstage Pro">
        <div className="landing-diagonal-band landing-diagonal-band-a" aria-hidden="true">
          <div className="landing-marquee-track">
            {[0, 1, 2, 3].map(copy => <div className="landing-marquee-group" key={copy}>{["ORGANIZAÇÃO", "CONTROLE", "GESTÃO DE CARREIRA", "BACKSTAGE PRO"].map(word => <span className="landing-marquee-word" key={word}>{word}<Music2 /></span>)}</div>)}
          </div>
        </div>
        <div className="landing-diagonal-band landing-diagonal-band-b" aria-hidden="true">
          <div className="landing-marquee-track is-reverse">
            {[0, 1, 2, 3].map(copy => <div className="landing-marquee-group" key={copy}>{["TESTE GRÁTIS", "SEM CARTÃO", "FEITO PARA ARTISTAS", "BACKSTAGE PRO"].map(word => <span className="landing-marquee-word" key={word}>{word}<Music2 /></span>)}</div>)}
          </div>
        </div>
      </div>

      <section id="recursos" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-heading"><div><p className="landing-eyebrow">01 / O SEU BACKSTAGE</p><h2>Um app completo.<br />Uma rotina mais leve.</h2></div><p>O show acontece no palco. Antes e depois dele, o Backstage Pro cuida da organização com você.</p></div>
          <LandingExperience />
          <div className="landing-tools-grid">{tools.map(({ icon: Icon, title, description }) => <div key={title} className="landing-tool"><span className="landing-tool-icon"><Icon className="h-6 w-6" /></span><h3>{title}</h3><p>{description}</p></div>)}</div>
          <div className="landing-section-end"><span>Do primeiro contato ao cachê recebido.</span><TrialButton /></div>
        </div>
      </section>

      <section className="landing-workflow-band"><span className="landing-orb landing-orb-c" aria-hidden="true" /><span className="landing-orb landing-orb-b" aria-hidden="true" /><div className="landing-container"><p className="landing-eyebrow">TUDO CONVERSA ENTRE SI</p><h2>Um show não é só uma data.</h2><div className="landing-workflow">{[{ icon: Users, title: "O contato", desc: "A oportunidade chega." }, { icon: FileText, title: "O combinado", desc: "Orçamento e contrato." }, { icon: CalendarDays, title: "O show", desc: "Agenda, equipe e repertório." }, { icon: Wallet, title: "O resultado", desc: "Cachê, despesas e histórico." }].map(({ icon: Icon, title, desc }, i) => <div className="landing-workflow-step" key={title}><span className="landing-step-number">0{i + 1}</span><Icon className="h-6 w-6" /><h3>{title}</h3><p>{desc}</p>{i < 3 && <ArrowRight className="landing-step-arrow h-5 w-5" />}</div>)}</div></div></section>

      <section id="depoimentos" className="landing-section"><div className="landing-container"><div className="landing-section-heading"><div><p className="landing-eyebrow">02 / QUEM JÁ ESTÁ NO PALCO</p><h2>Gente de verdade.<br />Rotinas de verdade.</h2></div><p>Conheça a experiência de artistas que usam o Backstage Pro no dia a dia.</p></div><div className="landing-reviews-grid"><div className="landing-video-review"><Quote className="h-8 w-8 text-primary" /><h3>Victor Viola</h3><p>A experiência de quem vive de música, contada em primeira pessoa.</p><Button variant="outline" onClick={() => setVideo("victor")}><Play />Assistir ao depoimento</Button><span className="mt-auto pt-8 text-xs text-muted-foreground">DEPOIMENTO EM VÍDEO</span></div><div className="landing-review-carousel" aria-roledescription="carrossel"><div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">AVALIAÇÕES NO GOOGLE</span><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label="Avaliação anterior" onClick={() => setReviewIndex((reviewIndex + reviews.length - 1) % reviews.length)}><ChevronLeft /></Button><Button size="icon" variant="ghost" aria-label="Próxima avaliação" onClick={() => setReviewIndex((reviewIndex + 1) % reviews.length)}><ChevronRight /></Button></div></div>{currentReview && <div key={currentReview.name} aria-live="polite" className="landing-review-image"><img src={currentReview.image} alt={`Avaliação de ${currentReview.name} no Google`} loading="lazy" /><div className="flex items-center justify-between gap-2 pt-5"><h3>{currentReview.name}</h3><span className="text-xs text-muted-foreground">{reviewIndex + 1} / {reviews.length}</span></div></div>}</div></div></div></section>

      <section id="quem-somos" className="landing-founder-band"><div className="landing-container landing-founder-grid"><div className="landing-founder-photo"><img src={founderPhoto} alt="José Mario Campos, fundador do Backstage Pro" loading="lazy" /></div><div className="landing-founder-copy"><p className="landing-eyebrow">CRIADO POR UM ARTISTA. PARA ARTISTAS.</p><h2>Nasceu fora da planilha.<br />E dentro da vida real.</h2><p>José Mario Campos, também conhecido como Mario Oliveira, é cantor. Como muitos artistas, organizava shows, contatos e ideias em planilhas — mas sentia falta de enxergar seus próprios resultados.</p><p>O Backstage Pro nasceu dessa necessidade: uma ferramenta que entendesse a rotina de quem vive de palco.</p><div className="landing-founder-signature"><strong>José Mario Campos</strong><span>Artista e fundador do Backstage Pro</span></div></div></div></section>

      <section id="planos" className="landing-section"><div className="landing-container"><div className="landing-section-heading"><div><p className="landing-eyebrow">03 / NO RITMO DA SUA CARREIRA</p><h2>Seu próximo passo<br />tem lugar aqui.</h2></div><p>Comece grátis. Conheça o app e escolha o plano que acompanha o seu momento.</p></div><div className="landing-plan-grid">{plans.map(plan => <article key={plan.id} className={`landing-plan ${plan.id === "full" ? "landing-plan-popular" : ""}`}><div className="landing-plan-label"><plan.icon className="h-5 w-5" /><span>{plan.badgeText}</span></div><h3>{plan.name}</h3><p>{plan.subtitle}</p><ul>{plan.features.map(feature => <li key={feature}><Check className="h-4 w-4 text-primary" /><span>{feature}</span></li>)}</ul><TrialButton /><span className="text-xs text-center text-muted-foreground mt-3">Sem cartão de crédito</span></article>)}</div></div></section>

      <section id="faq" className="landing-section landing-faq-band"><div className="landing-container landing-faq-grid"><div><p className="landing-eyebrow">SEM DÚVIDAS NO CAMINHO</p><h2>Perguntas<br />frequentes.</h2><p className="mt-5 text-muted-foreground">Prefere conversar com alguém?</p><Button variant="link" asChild className="px-0 mt-2"><a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Falar com um atendente<ArrowUpRight /></a></Button></div><Accordion type="single" collapsible>{faqItems.map((item, i) => <AccordionItem value={`faq-${i}`} key={item.question} className="landing-faq-item"><AccordionTrigger className="landing-faq-trigger">{item.question}</AccordionTrigger><AccordionContent className="text-muted-foreground leading-relaxed pr-6">{item.answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>

      <section id="contato" className="landing-contact-band"><span className="landing-orb landing-orb-a" aria-hidden="true" /><span className="landing-orb landing-orb-c" aria-hidden="true" /><div className="landing-container landing-contact-grid"><div className="landing-contact-copy"><p className="landing-eyebrow">FALE COM A GENTE</p><h2>O próximo show é seu.<br />A organização é com a gente.</h2><p>Comece a construir uma carreira mais organizada hoje. Escolha como quer começar:</p></div><div className="landing-contact-cards">{[
        { icon: MessageCircle, title: "WhatsApp", note: "Atendimento humano", href: SUPPORT_WHATSAPP_URL, external: true },
        { icon: Play, title: "Testar grátis", note: "3 horas · sem cartão", href: "/auth", external: false },
        { icon: Gift, title: "Kit Profissional", note: "Ferramentas grátis", href: "/kit-profissional", external: false },
        { icon: Mic2, title: "Ver o app em ação", note: "Vídeo de 1 minuto", action: () => setVideo("app") },
      ].map(({ icon: Icon, title, note, href, external, action }) => action ? <button key={title} type="button" className="landing-contact-card" onClick={action}><span className="landing-contact-icon"><Icon className="h-7 w-7" /></span><strong>{title}</strong><span className="landing-contact-note">{note}</span></button> : <a key={title} className="landing-contact-card" href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span className="landing-contact-icon"><Icon className="h-7 w-7" /></span><strong>{title}</strong><span className="landing-contact-note">{note}</span></a>)}</div></div></section>
      <div className="landing-kit-band"><div className="landing-container flex flex-wrap justify-between items-center gap-3"><span className="inline-flex items-center gap-3"><Gift className="h-5 w-5 text-primary" />Mais ferramentas para sua carreira.</span><Button variant="link" asChild><Link to="/kit-profissional">Conhecer o Kit Profissional grátis<ArrowUpRight /></Link></Button></div></div>
      <footer className="landing-footer"><div className="landing-container"><div className="landing-footer-top"><Brand /><nav aria-label="Links legais" className="flex flex-wrap gap-x-6 gap-y-2"><Link to="/termos">Termos de Uso</Link><Link to="/privacidade">Privacidade</Link><a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Suporte</a></nav><p>© 2024 Backstage Pro.</p></div><div className="landing-registration"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><div><p>Backstage Pro® — marca registrada. Empresa com registro de marca, titularidade registrada por Jose Mario Campos.</p><p className="mt-1">CNPJ 69.458.195/0001-14</p></div></div></div></footer>
      <nav className="landing-bottom-bar" aria-label="Contato e cadastro"><Button asChild variant="outline" className="landing-bottom-whatsapp"><a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp"><MessageCircle className="h-5 w-5" />WhatsApp</a></Button><TrialButton /></nav>
      <Dialog open={video !== null} onOpenChange={open => { if (!open) setVideo(null); }}><DialogContent className="landing-video-dialog"><DialogTitle>{video === "victor" ? "Depoimento de Victor Viola" : "Backstage Pro em ação"}</DialogTitle><DialogDescription>Conheça o Backstage Pro em vídeo.</DialogDescription>{video && <iframe src={`https://www.youtube.com/embed/${video === "victor" ? "_nUOr9qoNgI" : "d-Hx3NwVuIM"}?autoplay=1`} title={video === "victor" ? "Depoimento Victor Viola" : "Veja o app na prática"} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="aspect-video w-full rounded-lg" />}</DialogContent></Dialog>
    </div>
  );
}
