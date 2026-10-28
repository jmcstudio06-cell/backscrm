import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Beer,
  Check,
  Crown,
  Gift,
  Hotel,
  Info,
  MapPin,
  Menu,
  MessageCircle,
  Mic2,
  Radar,
  ShieldCheck,
  UserPlus,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { RadarPreview } from "@/components/landing/RadarPreview";
import { PLAN_MODULES } from "@/hooks/useFeatureBlocks";
import { trackEvent } from "@/lib/metaPixel";
import brandIcon from "@/assets/ba-icon.png";
import "@/styles/landing.css";
import "@/styles/radar-landing.css";

/**
 * Landing pública do Backs Radar.
 * Reaproveita os tokens e átomos da landing (escopo .landing-page, que também
 * isola a página dos temas de artista e do modo lite) e acrescenta só o que é
 * específico do Radar em radar-landing.css. O destino do cadastro é o mesmo da
 * landing principal: /auth. O Radar é encontrado dentro do app, no menu.
 */

const navigation = [
  { href: "#o-que-e", label: "O que é" },
  { href: "#experimente", label: "Experimente" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#acesso", label: "Acesso" },
  { href: "#faq", label: "FAQ" },
];

const pillars = [
  {
    icon: Radar,
    title: "Encontre",
    description: "Bares, restaurantes, hotéis e casas de show nas cidades que você escolher.",
  },
  {
    icon: MessageCircle,
    title: "Chame",
    description: "Veja telefone e endereço de cada local e abra o WhatsApp com um toque.",
  },
  {
    icon: UserPlus,
    title: "Organize",
    description: "Envie o contato para o seu CRM e acompanhe a conversa como qualquer outro lead.",
  },
];

const steps = [
  { icon: UserPlus, title: "Crie sua conta", description: "Cadastro gratuito no Backstage Pro, sem cartão de crédito." },
  { icon: Radar, title: "Abra o Backs Radar", description: "Ele fica no menu do app. Informe o seu CEP para definir a cidade base." },
  { icon: MapPin, title: "Escolha cidades e categorias", description: "Até 5 cidades do seu estado, em bares, restaurantes, hotéis e casas de show." },
  { icon: MessageCircle, title: "Pesquise e chame", description: "No plano Executivo, abra o WhatsApp do local ou envie o contato para o seu CRM." },
];

const goodToKnow = [
  "O Radar aponta lugares e contatos. A conversa e o fechamento são com você.",
  "Nem todo estabelecimento contrata música ao vivo.",
  "A cobertura varia de cidade para cidade.",
  "Entram apenas locais com telefone cadastrado, e o número nem sempre é de WhatsApp.",
];

const faqItems = [
  {
    question: "O que é o Backs Radar?",
    answer:
      "É a ferramenta do Backstage Pro que encontra bares, restaurantes, hotéis e casas de show nas cidades que você escolher. Para cada local você vê o telefone e o endereço, abre o WhatsApp com um toque e pode enviar o contato para o seu CRM.",
  },
  {
    question: "Preciso pagar para começar?",
    answer:
      "Não. O cadastro no Backstage Pro é gratuito e dá 3 horas para conhecer o app, sem cartão de crédito. No Backs Radar, o teste mostra quantas oportunidades existem na sua região. Nomes e telefones são liberados no plano Executivo.",
  },
  {
    question: "Onde encontro o Backs Radar depois de me cadastrar?",
    answer:
      "Ele fica no menu do app, com o nome Backs Radar. Na primeira vez, você informa o seu CEP para definir a cidade base.",
  },
  {
    question: "Quais tipos de lugar aparecem?",
    answer: "Bares, restaurantes, hotéis e casas de show. Você escolhe quais categorias quer pesquisar.",
  },
  {
    question: "Posso pesquisar mais de uma cidade?",
    answer: "Sim. Em cada pesquisa você escolhe até 5 cidades do mesmo estado do seu CEP.",
  },
  {
    question: "Os contatos têm WhatsApp?",
    answer:
      "Cada local mostra o telefone cadastrado e um botão que abre o WhatsApp com esse número. Nem todo telefone é de WhatsApp, e só entram locais que tenham telefone.",
  },
  {
    question: "O Backs Radar garante shows?",
    answer:
      "Não. Ele ajuda você a encontrar lugares e contatos. A conversa, a proposta e o fechamento ficam com você, e nem todo estabelecimento contrata música ao vivo.",
  },
  {
    question: "Posso levar os contatos para o meu CRM?",
    answer:
      "Sim. O botão Enviar ao CRM cria um lead com os dados do local e a origem Backs Radar. Você acompanha a negociação junto com os seus outros contatos.",
  },
  {
    question: "Funciona no celular?",
    answer: "Sim. O Backstage Pro funciona no celular, tablet e computador.",
  },
];

// Pontos que pulsam dentro do radar do hero (posições em % do círculo).
const BLIPS = [
  { top: "24%", left: "30%", delay: "0s" },
  { top: "30%", left: "68%", delay: "0.9s" },
  { top: "56%", left: "78%", delay: "1.7s" },
  { top: "72%", left: "38%", delay: "0.4s" },
  { top: "46%", left: "22%", delay: "2.2s" },
  { top: "62%", left: "58%", delay: "1.2s" },
];

function Brand() {
  return (
    <Link to="/landing" className="lp-brand" aria-label="Backstage Pro, início">
      <img src={brandIcon} alt="" width={34} height={34} />
      <span>Backstage Pro<sup>®</sup></span>
    </Link>
  );
}

function Check2() {
  return <span className="lp-check" aria-hidden="true"><Check /></span>;
}

function SignupLink({
  where,
  className = "",
  label = "Criar minha conta grátis",
}: {
  where: string;
  className?: string;
  label?: string;
}) {
  return (
    <Link
      to="/auth"
      className={`lp-btn lp-btn-primary ${className}`}
      onClick={() => trackEvent("ViewContent", { content_name: `radar_landing_signup_${where}` })}
    >
      {label}
      <ArrowRight />
    </Link>
  );
}

export default function BacksRadarLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  // O botão fixo do celular só aparece depois do primeiro bloco, que já tem o seu próprio botão.
  const [dockVisible, setDockVisible] = useState(false);
  const executivo = PLAN_MODULES.executivo;

  // Revelação única por elemento, igual à landing principal.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("landing-scroll-reveal");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    root
      .querySelectorAll(".lp-heading, .lp-reveal, .lp-tool, .lp-step, .lp-plan-wrap")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !("IntersectionObserver" in window)) {
      setDockVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setDockVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page radar-landing" ref={rootRef}>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap"
        />
        <title>Backs Radar: encontre bares, restaurantes, hotéis e casas de show | Backstage Pro</title>
        <meta
          name="description"
          content="O Backs Radar encontra bares, restaurantes, hotéis e casas de show nas cidades que você escolher, com telefone, WhatsApp e envio para o seu CRM. Faça o cadastro gratuito no Backstage Pro."
        />
        <link rel="canonical" href="https://backstageproapp.com/radar" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Backs Radar: descubra onde sua música pode tocar" />
        <meta
          property="og:description"
          content="Encontre bares, restaurantes, hotéis e casas de show perto de você e leve os contatos para o seu CRM. Dentro do Backstage Pro."
        />
        <meta property="og:url" content="https://backstageproapp.com/radar" />
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
            <SignupLink where="header" className="lp-btn-sm" label="Criar conta grátis" />
            <button
              type="button"
              className="lp-menu-toggle"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="lp-mobile-nav" aria-label="Menu móvel">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                {item.label}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            ))}
            <Link to="/auth">Entrar<ArrowUpRight className="h-4 w-4" /></Link>
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="rl-hero" aria-labelledby="rl-title" ref={heroRef}>
          <div className="lp-grid-bg" aria-hidden="true" />
          <span className="lp-glow lp-glow-blue" style={{ width: 460, height: 460, top: -160, left: -160 }} aria-hidden="true" />
          <span className="lp-glow lp-glow-cyan" style={{ width: 460, height: 460, bottom: -200, right: -140 }} aria-hidden="true" />

          <div className="lp-container rl-hero-grid">
            <div className="rl-hero-copy">
              <span className="lp-eyebrow"><span className="lp-eyebrow-dot" />Backs Radar</span>
              <h1 id="rl-title">
                Descubra onde sua música
                <span className="lp-text-gradient">pode tocar.</span>
              </h1>
              <p className="rl-hero-lead">
                O Backs Radar encontra bares, restaurantes, hotéis e casas de show nas cidades que
                você escolher. Você vê o telefone, chama no WhatsApp e leva o contato para o seu CRM.
              </p>
              <div className="rl-hero-ctas">
                <SignupLink where="hero" />
                <a href="#como-funciona" className="lp-btn lp-btn-ghost">Ver como funciona</a>
              </div>
              <div className="rl-hero-trust">
                <span><Check2 />Cadastro gratuito</span>
                <span><Check2 />Sem cartão de crédito</span>
                <span><Check2 />Dentro do Backstage Pro</span>
              </div>
            </div>

            <div className="rl-radar-wrap" aria-hidden="true">
              <div className="rl-radar">
                <span className="rl-ring rl-ring-1" />
                <span className="rl-ring rl-ring-2" />
                <span className="rl-ring rl-ring-3" />
                <span className="rl-sweep" />
                {BLIPS.map((blip, i) => (
                  <span key={i} className="rl-blip" style={{ top: blip.top, left: blip.left, animationDelay: blip.delay }} />
                ))}
                <span className="rl-core"><Radar /></span>
              </div>
              <div className="rl-chip rl-chip-a"><span className="rl-chip-icon"><Beer /></span>Bares</div>
              <div className="rl-chip rl-chip-b"><span className="rl-chip-icon"><UtensilsCrossed /></span>Restaurantes</div>
              <div className="rl-chip rl-chip-c"><span className="rl-chip-icon"><Hotel /></span>Hotéis</div>
              <div className="rl-chip rl-chip-d"><span className="rl-chip-icon"><Mic2 /></span>Casas de show</div>
            </div>
          </div>
        </section>

        {/* O que é */}
        <section id="o-que-e" className="lp-section">
          <div className="lp-container">
            <div className="lp-heading">
              <span className="lp-eyebrow">O QUE É</span>
              <h2>Um radar de oportunidades<br /><span className="lp-text-gradient">dentro do seu app.</span></h2>
              <p>
                O Backs Radar faz parte do Backstage Pro. Você cria a sua conta, abre o Radar no menu
                e começa a explorar a sua região.
              </p>
            </div>
            <div className="lp-tools rl-pillars">
              {pillars.map(({ icon: Icon, title, description }) => (
                <div key={title} className="lp-tool">
                  <span className="lp-tool-icon"><Icon /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demonstração */}
        <section id="experimente" className="lp-section lp-section-soft">
          <div className="lp-container">
            <div className="lp-heading">
              <span className="lp-eyebrow">EXPERIMENTE</span>
              <h2>Veja como a busca<br /><span className="lp-text-gradient">funciona.</span></h2>
              <p>
                Escolha categorias e cidades e veja um exemplo do resultado. É só uma demonstração:
                nada é salvo e os dados são genéricos.
              </p>
            </div>
            <div className="lp-reveal">
              <RadarPreview />
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="lp-section">
          <div className="lp-container">
            <div className="lp-heading">
              <span className="lp-eyebrow">PASSO A PASSO</span>
              <h2>Do cadastro ao<br /><span className="lp-text-gradient">primeiro contato.</span></h2>
              <p>O Backs Radar está dentro do Backstage Pro. É só criar a conta e abrir o menu.</p>
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
            <div className="rl-center">
              <SignupLink where="steps" />
            </div>
          </div>
        </section>

        {/* Acesso */}
        <section id="acesso" className="lp-section lp-section-soft">
          <div className="lp-container">
            <div className="lp-heading">
              <span className="lp-eyebrow">COMO FUNCIONA O ACESSO</span>
              <h2>Comece grátis.<br /><span className="lp-text-gradient">Contatos no Executivo.</span></h2>
              <p>O cadastro é gratuito. Os contatos completos do Backs Radar fazem parte do plano Executivo.</p>
            </div>

            <div className="lp-plans rl-plans">
              <div className="lp-plan-wrap">
                <article className="lp-plan">
                  <div className="lp-plan-top">
                    <span className="lp-tool-icon"><Gift /></span>
                    <span className="lp-plan-badge">CADASTRO GRÁTIS</span>
                  </div>
                  <h3>Teste do Backstage Pro</h3>
                  <p>3 horas para conhecer o app, sem cartão de crédito.</p>
                  <ul>
                    <li><Check2 /><span>Acesso ao Backstage Pro para explorar as ferramentas</span></li>
                    <li><Check2 /><span>No Backs Radar, você pesquisa e vê quantas oportunidades existem na sua região</span></li>
                    <li><Check2 /><span>Nomes e telefones dos locais ficam no plano Executivo</span></li>
                  </ul>
                  <SignupLink where="access" />
                  <span className="lp-plan-note">Sem cartão de crédito</span>
                </article>
              </div>

              <div className="lp-plan-wrap is-popular">
                <article className="lp-plan">
                  <div className="lp-plan-top">
                    <span className="lp-tool-icon"><Crown /></span>
                    <span className="lp-plan-badge">PLANO EXECUTIVO</span>
                  </div>
                  <h3>Backs Radar completo</h3>
                  <p>{executivo.price}. Inclui tudo do plano Empresarial.</p>
                  <ul>
                    <li><Check2 /><span>Nome, telefone, endereço e link do mapa de cada local</span></li>
                    <li><Check2 /><span>Botão de WhatsApp para cada telefone</span></li>
                    <li><Check2 /><span>Envio de cada contato para o seu CRM</span></li>
                    <li><Check2 /><span>Até 5 cidades do seu estado em cada pesquisa</span></li>
                  </ul>
                  <span className="lp-plan-note rl-plan-foot">Você faz o upgrade dentro do app, quando quiser.</span>
                </article>
              </div>
            </div>

            <aside className="rl-note lp-reveal" aria-labelledby="rl-note-title">
              <div className="rl-note-head">
                <span className="rl-note-icon"><Info /></span>
                <h3 id="rl-note-title">Bom saber antes de começar</h3>
              </div>
              <ul>
                {goodToKnow.map((item) => (
                  <li key={item}><Check2 /><span>{item}</span></li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="lp-section">
          <div className="lp-container lp-faq">
            <div className="lp-faq-aside lp-reveal">
              <span className="lp-eyebrow">SEM DÚVIDAS NO CAMINHO</span>
              <h2>Perguntas<br /><span className="lp-text-gradient">frequentes.</span></h2>
              <p>Quer conhecer o resto do app?</p>
              <Link to="/landing" className="lp-btn lp-btn-ghost lp-btn-sm mt-4">Conhecer o Backstage Pro<ArrowUpRight /></Link>
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

        {/* CTA final */}
        <section className="lp-section rl-final">
          <div className="lp-container">
            <div className="lp-cta-wrap lp-reveal">
              <div className="lp-cta">
                <div className="lp-grid-bg" aria-hidden="true" />
                <span className="lp-glow lp-glow-blue" style={{ width: 340, height: 340, top: -120, left: -100 }} aria-hidden="true" />
                <span className="lp-glow lp-glow-cyan" style={{ width: 340, height: 340, bottom: -140, right: -80 }} aria-hidden="true" />
                <div className="lp-cta-icon"><Radar className="h-8 w-8" /></div>
                <h2>Seu próximo palco<br /><span className="lp-text-gradient">pode estar na sua região.</span></h2>
                <p>Crie a sua conta grátis e veja quantas oportunidades o Backs Radar encontra perto de você.</p>
                <div className="lp-cta-actions">
                  <SignupLink where="final" />
                  <Link to="/landing" className="lp-btn lp-btn-ghost">Conhecer o Backstage Pro</Link>
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
              <Link to="/landing">Backstage Pro</Link>
            </nav>
            <p className="text-sm text-muted-foreground">© Backstage Pro.</p>
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

      <nav className={`lp-dock rl-dock${dockVisible ? " is-visible" : ""}`} aria-label="Cadastro">
        <SignupLink where="dock" />
      </nav>
    </div>
  );
}
