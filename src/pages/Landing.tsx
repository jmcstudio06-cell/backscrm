import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight, Calendar, Check, ChevronRight, FileText, Menu, MessageCircle, 
  Music2, Play, Star, TrendingUp, Users, Wallet, X, Zap
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import brandIcon from "@/assets/ba-icon.png";
import larissaGoogle from "@/assets/testimonials/larissa-google.png";
import marceloGoogle from "@/assets/testimonials/marcelo-google.png";
import fabioGoogle from "@/assets/testimonials/fabio-google.png";
import "@/styles/landing.css";

const SUPPORT_WHATSAPP = "https://wa.me/5512992423317?text=" + encodeURIComponent("Oi! Quero saber mais sobre o Backstage Pro");
const VIDEO_ID = "d-Hx3NwVuIM";

function Brand() {
  return (
    <Link to="/landing" className="bp-brand">
      <img src={brandIcon} alt="Backstage Pro" width={36} height={36} />
      <span>Backstage Pro</span>
    </Link>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeReview, setActiveReview] = useState(0);
  const pageRef = useRef<HTMLDivElement>(null);

  const reviews = [
    { name: "Larissa Santos", role: "Produtora Musical", img: larissaGoogle },
    { name: "Marcelo Cantor", role: "Cantor", img: marceloGoogle },
    { name: "Fábio Martins", role: "Violonista", img: fabioGoogle },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  useEffect(() => {
    const root = pageRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("bp-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    root.querySelectorAll(".bp-fade").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bp-page" ref={pageRef}>
      <Helmet>
        <title>Backstage Pro — Gestão para Artistas e Músicos</title>
        <meta name="description" content="Organize sua carreira musical. Agenda, cachês, contratos e clientes em um só lugar. Feito para artistas que querem profissionalizar." />
        <link rel="canonical" href="https://backstageproapp.com/landing" />
        <meta property="og:title" content="Backstage Pro — Gestão para Artistas" />
        <meta property="og:description" content="Sistema completo para organizar shows, cachês e contratos" />
        <meta property="og:image" content="https://backstageproapp.com/og-image.png" />
      </Helmet>

      {/* Header */}
      <header className="bp-header">
        <div className="bp-container">
          <Brand />
          <nav className="bp-nav">
            <a href="#recursos">Recursos</a>
            <a href="#como-funciona">Como funciona</a>
            <a href="#depoimentos">Quem usa</a>
            <a href="#planos">Planos</a>
          </nav>
          <div className="bp-header-actions">
            <Link to="/auth" className="bp-link">Entrar</Link>
            <Link to="/auth" className="bp-btn bp-btn-primary">Começar grátis</Link>
            <button className="bp-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="bp-mobile-menu">
            <a href="#recursos" onClick={() => setMenuOpen(false)}>Recursos</a>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a>
            <a href="#depoimentos" onClick={() => setMenuOpen(false)}>Quem usa</a>
            <a href="#planos" onClick={() => setMenuOpen(false)}>Planos</a>
            <Link to="/auth" onClick={() => setMenuOpen(false)}>Entrar</Link>
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="bp-hero">
          <div className="bp-container">
            <div className="bp-hero-content bp-fade">
              <span className="bp-badge">Para artistas e músicos profissionais</span>
              <h1>
                Pare de perder shows por desorganização
              </h1>
              <p className="bp-lead">
                Agenda, cachês, contratos e clientes organizados. Sem planilha, sem papel, sem improviso.
                Um sistema feito por quem vive de música para quem vive de música.
              </p>
              <div className="bp-hero-ctas">
                <Link to="/auth" className="bp-btn bp-btn-primary bp-btn-lg">
                  Começar grátis agora <ArrowRight size={18} />
                </Link>
                <button onClick={() => setVideoOpen(true)} className="bp-btn bp-btn-ghost bp-btn-lg">
                  <Play size={18} /> Ver como funciona
                </button>
              </div>
              <div className="bp-trust">
                <Check size={16} /> 3 horas grátis para testar
                <Check size={16} /> Sem cartão de crédito
                <Check size={16} /> Use no celular e PC
              </div>
            </div>

            <div className="bp-hero-visual bp-fade">
              <div className="bp-app-preview">
                <div className="bp-app-bar">
                  <div className="bp-app-dots">
                    <i /><i /><i />
                  </div>
                  <span>backstageproapp.com</span>
                </div>
                <div className="bp-app-screen">
                  <div className="bp-app-sidebar">
                    <div className="bp-app-menu-item active">
                      <Calendar size={18} /> Agenda
                    </div>
                    <div className="bp-app-menu-item">
                      <Users size={18} /> Clientes
                    </div>
                    <div className="bp-app-menu-item">
                      <Wallet size={18} /> Financeiro
                    </div>
                    <div className="bp-app-menu-item">
                      <FileText size={18} /> Contratos
                    </div>
                  </div>
                  <div className="bp-app-main">
                    <div className="bp-app-header">
                      <h3>Agenda de Shows</h3>
                      <button className="bp-app-btn-sm">+ Novo Show</button>
                    </div>
                    <div className="bp-app-cards">
                      <div className="bp-app-card bp-app-card-green">
                        <small>15 MAR</small>
                        <strong>Bar do João</strong>
                        <span>Confirmado · R$ 800</span>
                      </div>
                      <div className="bp-app-card bp-app-card-blue">
                        <small>22 MAR</small>
                        <strong>Festa Particular</strong>
                        <span>Orçamento enviado</span>
                      </div>
                      <div className="bp-app-card bp-app-card-purple">
                        <small>30 MAR</small>
                        <strong>Evento Corporativo</strong>
                        <span>Confirmado · R$ 1.500</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="bp-social-bar">
          <div className="bp-container">
            <div className="bp-social-item">
              <Star size={20} fill="currentColor" />
              <div>
                <strong>+90 artistas</strong>
                <span>usam todo dia</span>
              </div>
            </div>
            <div className="bp-social-item">
              <Zap size={20} />
              <div>
                <strong>2 minutos</strong>
                <span>para criar conta</span>
              </div>
            </div>
            <div className="bp-social-item">
              <TrendingUp size={20} />
              <div>
                <strong>3x mais shows</strong>
                <span>no 1º mês (média)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Problema */}
        <section className="bp-section">
          <div className="bp-container">
            <div className="bp-problem bp-fade">
              <span className="bp-eyebrow">O problema que você conhece</span>
              <h2>Shows combinados no WhatsApp.<br />Cachês anotados no papel.</h2>
              <p>
                Você fecha um show. Anota no caderno. Depois esquece de cobrar. O cliente some. 
                O cachê não entra. A data passa e você nem lembrava.
              </p>
              <p>
                Quando a carreira cresce, a bagunça cresce junto. E você perde dinheiro sem perceber.
              </p>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section id="como-funciona" className="bp-section bp-section-alt">
          <div className="bp-container">
            <div className="bp-heading bp-fade">
              <span className="bp-eyebrow">Simples de usar</span>
              <h2>Do contato ao cachê, tudo conectado</h2>
            </div>
            <div className="bp-steps">
              <div className="bp-step bp-fade">
                <div className="bp-step-number">1</div>
                <Users size={28} />
                <h3>Contato chega</h3>
                <p>Salva direto no seu CRM. Nome, telefone, o que combinou. Tudo registrado.</p>
              </div>
              <div className="bp-step bp-fade">
                <div className="bp-step-number">2</div>
                <FileText size={28} />
                <h3>Orçamento pronto</h3>
                <p>Em 2 cliques você manda um orçamento profissional. Cliente recebe e já pode confirmar.</p>
              </div>
              <div className="bp-step bp-fade">
                <div className="bp-step-number">3</div>
                <Calendar size={28} />
                <h3>Show confirmado</h3>
                <p>Vai pra agenda. Repertório, equipe, checklist. Tudo organizado antes de subir no palco.</p>
              </div>
              <div className="bp-step bp-fade">
                <div className="bp-step-number">4</div>
                <Wallet size={28} />
                <h3>Cachê controlado</h3>
                <p>Recebimentos, despesas, histórico. Você sabe exatamente quanto entra e quanto sai.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recursos */}
        <section id="recursos" className="bp-section">
          <div className="bp-container">
            <div className="bp-heading bp-fade">
              <span className="bp-eyebrow">O que você ganha</span>
              <h2>Tudo que você precisa em um só lugar</h2>
            </div>
            <div className="bp-features">
              <div className="bp-feature bp-fade">
                <div className="bp-feature-icon bp-feature-icon-blue">
                  <Calendar size={24} />
                </div>
                <h3>Agenda de shows</h3>
                <p>Datas, horários, endereço, repertório. Tudo que você precisa saber antes do show.</p>
              </div>
              <div className="bp-feature bp-fade">
                <div className="bp-feature-icon bp-feature-icon-green">
                  <Wallet size={24} />
                </div>
                <h3>Controle financeiro</h3>
                <p>Cachês a receber, despesas pagas, histórico completo. Seu financeiro transparente.</p>
              </div>
              <div className="bp-feature bp-fade">
                <div className="bp-feature-icon bp-feature-icon-purple">
                  <Users size={24} />
                </div>
                <h3>CRM de clientes</h3>
                <p>Todos os seus contatos organizados. Quem já contratou, quem pediu orçamento, quem sumiu.</p>
              </div>
              <div className="bp-feature bp-fade">
                <div className="bp-feature-icon bp-feature-icon-orange">
                  <FileText size={24} />
                </div>
                <h3>Contratos automáticos</h3>
                <p>Gera contrato, manda pro cliente, recebe assinado. Tudo digital, tudo rápido.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section id="depoimentos" className="bp-section bp-section-alt">
          <div className="bp-container">
            <div className="bp-heading bp-fade">
              <span className="bp-eyebrow">Quem usa, aprova</span>
              <h2>Artistas reais usando todo dia</h2>
            </div>
            <div className="bp-reviews bp-fade">
              <button 
                className="bp-review-arrow bp-review-arrow-left"
                onClick={() => setActiveReview((activeReview - 1 + reviews.length) % reviews.length)}
              >
                <ChevronRight size={20} />
              </button>
              <div className="bp-review-card">
                <div className="bp-review-stars">
                  {[0,1,2,3,4].map(i => <Star key={i} size={18} fill="#FFA500" color="#FFA500" />)}
                </div>
                <img 
                  src={reviews[activeReview].img} 
                  alt={reviews[activeReview].name}
                  className="bp-review-img"
                />
                <div className="bp-review-author">
                  <strong>{reviews[activeReview].name}</strong>
                  <span>{reviews[activeReview].role}</span>
                </div>
              </div>
              <button 
                className="bp-review-arrow bp-review-arrow-right"
                onClick={() => setActiveReview((activeReview + 1) % reviews.length)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="bp-review-dots">
              {reviews.map((_, i) => (
                <button 
                  key={i} 
                  className={`bp-review-dot ${i === activeReview ? 'active' : ''}`}
                  onClick={() => setActiveReview(i)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="bp-section">
          <div className="bp-container">
            <div className="bp-heading bp-fade">
              <span className="bp-eyebrow">Escolha seu plano</span>
              <h2>Comece grátis. Assine quando quiser.</h2>
              <p>3 horas de teste grátis. Sem cartão de crédito. Cancele quando quiser.</p>
            </div>
            <div className="bp-plans">
              <div className="bp-plan bp-fade">
                <div className="bp-plan-badge">Starter</div>
                <div className="bp-plan-price">
                  <span className="bp-plan-amount">R$ 19,90</span>
                  <span className="bp-plan-period">/mês</span>
                </div>
                <p className="bp-plan-desc">Organize o essencial da sua carreira</p>
                <ul className="bp-plan-features">
                  <li><Check size={18} /> Agenda de shows</li>
                  <li><Check size={18} /> Resumo financeiro</li>
                  <li><Check size={18} /> Precificação</li>
                  <li><Check size={18} /> Tutoriais</li>
                </ul>
                <Link to="/planos" className="bp-btn bp-btn-outline">Escolher Starter</Link>
              </div>

              <div className="bp-plan bp-plan-popular bp-fade">
                <div className="bp-plan-badge-popular">Mais popular</div>
                <div className="bp-plan-header">
                  <div className="bp-plan-badge">Profissional</div>
                  <div className="bp-plan-price">
                    <span className="bp-plan-amount">R$ 24,90</span>
                    <span className="bp-plan-period">/mês</span>
                  </div>
                </div>
                <p className="bp-plan-desc">Profissionalize sua operação</p>
                <ul className="bp-plan-features">
                  <li><Check size={18} /> Tudo do Starter</li>
                  <li><Check size={18} /> CRM de clientes</li>
                  <li><Check size={18} /> Orçamentos automáticos</li>
                  <li><Check size={18} /> Repertório</li>
                  <li><Check size={18} /> Link da Bio</li>
                </ul>
                <Link to="/planos" className="bp-btn bp-btn-primary">Escolher Profissional</Link>
              </div>

              <div className="bp-plan bp-fade">
                <div className="bp-plan-badge">Empresarial</div>
                <div className="bp-plan-price">
                  <span className="bp-plan-amount">R$ 39,90</span>
                  <span className="bp-plan-period">/mês</span>
                </div>
                <p className="bp-plan-desc">Controle total da carreira</p>
                <ul className="bp-plan-features">
                  <li><Check size={18} /> Tudo do Profissional</li>
                  <li><Check size={18} /> Contratos automáticos</li>
                  <li><Check size={18} /> Equipe e freelancers</li>
                  <li><Check size={18} /> Metas e bônus</li>
                  <li><Check size={18} /> Histórico completo</li>
                </ul>
                <Link to="/planos" className="bp-btn bp-btn-outline">Escolher Empresarial</Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="bp-cta-section">
          <div className="bp-container">
            <div className="bp-cta bp-fade">
              <Music2 size={48} />
              <h2>Pronto para organizar sua carreira?</h2>
              <p>Crie sua conta grátis agora. 3 horas para testar tudo. Sem cartão de crédito.</p>
              <div className="bp-cta-actions">
                <Link to="/auth" className="bp-btn bp-btn-primary bp-btn-lg">
                  Começar grátis agora <ArrowRight size={18} />
                </Link>
                <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer" className="bp-btn bp-btn-ghost bp-btn-lg">
                  <MessageCircle size={18} /> Falar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bp-footer">
        <div className="bp-container">
          <div className="bp-footer-top">
            <Brand />
            <nav className="bp-footer-nav">
              <Link to="/termos">Termos de Uso</Link>
              <Link to="/privacidade">Privacidade</Link>
              <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer">Suporte</a>
            </nav>
          </div>
          <div className="bp-footer-bottom">
            <p>© 2024 Backstage Pro® — CNPJ 69.458.195/0001-14</p>
          </div>
        </div>
      </footer>

      {/* Video Dialog */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl">
          <DialogTitle>Veja o Backstage Pro em ação</DialogTitle>
          <DialogDescription>Entenda como funciona em 2 minutos</DialogDescription>
          {videoOpen && (
            <iframe
              src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
              title="Backstage Pro em ação"
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
