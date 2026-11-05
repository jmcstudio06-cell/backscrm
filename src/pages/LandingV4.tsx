import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import baIcon from '@/assets/ba-icon.png';
import larissamGoogle from '@/assets/testimonials/larissa-google.png';
import marceloGoogle from '@/assets/testimonials/marcelo-google.png';
import fabioGoogle from '@/assets/testimonials/fabio-google.png';
import '../styles/landing-v4.css';

export default function LandingV4() {
  const valorRef = useRef<HTMLStrongElement>(null);

  useEffect(() => {
    // Animação do contador de valor
    const el = valorRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const fim = 11800;
    let ini: number | null = null;

    el.textContent = 'R$ 0';

    function animate(t: number) {
      if (!ini) ini = t + 1100;
      let k = Math.min(Math.max((t - ini!) / 1800, 0), 1);
      k = 1 - Math.pow(1 - k, 3);
      
      if (el) {
        el.textContent = 'R$ ' + Math.round(fim * k).toLocaleString('pt-BR');
      }
      
      if (k < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, []);

  const toggleTask = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.classList.toggle('ok');
  };

  return (
    <div className="landing-v4">
      {/* Fundo animado */}
      <div className="fundo" aria-hidden="true">
        <i className="blob bl1"></i>
        <i className="blob bl2"></i>
        <i className="blob bl3"></i>
        <svg className="rab r1" viewBox="0 0 64 76">
          <path d="M26 66V16L54 8V58M10 66a8 6 0 1 0 16 0a8 6 0 1 0-16 0M38 58a8 6 0 1 0 16 0a8 6 0 1 0-16 0" style={{ '--d': '.4s' } as React.CSSProperties} />
        </svg>
        <svg className="rab r2" viewBox="0 0 60 60">
          <path d="M30 4C32 22 38 28 56 30C38 32 32 38 30 56C28 38 22 32 4 30C22 28 28 22 30 4Z" style={{ '--d': '.9s' } as React.CSSProperties} />
        </svg>
        <svg className="rab r3" viewBox="0 0 130 60">
          <path d="M4 30c10-24 20-24 30 0s20 24 30 0 20-24 30 0 20 24 30 0" style={{ '--d': '.2s' } as React.CSSProperties} />
        </svg>
        <svg className="rab r4" viewBox="0 0 64 76">
          <path d="M26 66V16L54 8V58M10 66a8 6 0 1 0 16 0a8 6 0 1 0-16 0M38 58a8 6 0 1 0 16 0a8 6 0 1 0-16 0" style={{ '--d': '1.2s' } as React.CSSProperties} />
        </svg>
        <svg className="rab r5" viewBox="0 0 60 60">
          <path d="M30 6C14 8 4 22 8 38c4 16 24 20 38 10C58 38 56 14 38 8 24 4 14 12 12 26" style={{ '--d': '1.5s' } as React.CSSProperties} />
        </svg>
      </div>

      {/* Hero */}
      <div className="hero">
        <div className="luz l1" aria-hidden="true"></div>
        <div className="luz l2" aria-hidden="true"></div>
        
        <header>
          <div className="wrap">
            <Link className="marca" to="/">
              <img src={baIcon} alt="Backstage Pro" style={{ width: '32px', height: '32px', marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }} />
              backstage<sup>pro</sup>
            </Link>
            <Link className="btn esc" to="/auth">Criar minha conta</Link>
          </div>
        </header>

        <div className="wrap hero-grid">
          <div className="texto">
            <h1>Sua carreira de cantor, finalmente em ordem.</h1>
            <p className="lead">
              Agenda de shows, cachês, contratos, clientes e equipe num só lugar. 
              Feito para quem vive de palco e cansou de planilha, caderno e conversa perdida no WhatsApp.
            </p>
            <div className="acoes">
              <Link className="btn" to="/auth">Quero organizar minha carreira</Link>
              <a className="btn sec" href="#video">Ver como funciona</a>
            </div>
            <p className="nota">✨ 3 horas grátis · Sem cartão de crédito · Cancele quando quiser</p>
          </div>

          <div className="colagem" aria-label="Exemplo do Backstage Pro">
            <div className="card c-agenda">
              <h3>Sua agenda de sábados</h3>
              <div className="show">
                <div className="sdia">14<small>sáb</small></div>
                <div>
                  <b>Casamento Ana &amp; Pedro</b>
                  <span>Sítio Boa Vista · 20h</span>
                </div>
                <span className="pill">Sinal pago</span>
              </div>
              <div className="show">
                <div className="sdia">21<small>sáb</small></div>
                <div>
                  <b>Bar do Zé</b>
                  <span>Couvert artístico · 22h</span>
                </div>
                <span className="pill am">Contrato enviado</span>
              </div>
              <div className="show">
                <div className="sdia">28<small>sáb</small></div>
                <div>
                  <b>Festa de 15 anos</b>
                  <span>Orçamento em aberto</span>
                </div>
                <span className="pill am">Aguardando</span>
              </div>
            </div>

            <div className="card c-fin">
              <small>Recebido no mês</small>
              <strong ref={valorRef} id="valor">R$ 11.800</strong>
              <div className="barra"><i></i></div>
              <p>Faltam R$ 4.500 a receber</p>
            </div>

            <div className="card c-nota">
              <b>Cobrança enviada</b>
              <span>O saldo do casamento já está a caminho do contratante.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recursos / Setlist */}
      <section id="recursos" style={{ paddingTop: '60px' }}>
        <div className="wrap">
          <h2>O setlist da sua carreira, do orçamento ao saldo</h2>
          <p className="sub">
            Tudo o que você precisa, na ordem em que a vida de cantor acontece. 
            Pode riscar o que já faz ou quer fazer.
          </p>
          
          <div className="folha">
            <div className="cols">
              <div>
                <h3>Antes do palco</h3>
                <ul>
                  <li><button onClick={toggleTask}>Clientes</button></li>
                  <li><button onClick={toggleTask}>Precificação</button></li>
                  <li><button onClick={toggleTask}>Orçamentos automáticos</button></li>
                  <li><button onClick={toggleTask}>Contratos automáticos</button></li>
                  <li><button onClick={toggleTask}>Link de agendamento</button></li>
                  <li><button onClick={toggleTask}>Serviços e produtos</button></li>
                </ul>
              </div>
              <div>
                <h3>No palco</h3>
                <ul>
                  <li><button onClick={toggleTask}>Agenda de shows</button></li>
                  <li><button onClick={toggleTask}>Checklist de show</button></li>
                  <li><button onClick={toggleTask}>Repertório</button></li>
                  <li><button onClick={toggleTask}>Mapeamento de palco</button></li>
                  <li><button onClick={toggleTask}>Equipe e freelancers</button></li>
                </ul>
              </div>
              <div>
                <h3>Depois do show</h3>
                <ul>
                  <li><button onClick={toggleTask}>Resumo financeiro</button></li>
                  <li><button onClick={toggleTask}>Cobranças pendentes</button></li>
                  <li><button onClick={toggleTask}>Histórico financeiro</button></li>
                  <li><button onClick={toggleTask}>Metas</button></li>
                  <li><button onClick={toggleTask}>Bônus</button></li>
                </ul>
              </div>
              <div>
                <h3>O tempo todo</h3>
                <ul>
                  <li><button onClick={toggleTask}>CRM do artista</button></li>
                  <li><button onClick={toggleTask}>Link da bio / press kit</button></li>
                  <li><button onClick={toggleTask}>Ideias de post</button></li>
                  <li><button onClick={toggleTask}>Gestão de usuários</button></li>
                  <li><button onClick={toggleTask}>Tutoriais</button></li>
                </ul>
              </div>
            </div>
            <p className="dica">clica para riscar, igual no papel</p>
          </div>
        </div>
      </section>

      {/* Vídeo / Timeline */}
      <section className="noite" id="video">
        <div className="wrap">
          <h2>Um sábado de show, sem correria nos bastidores</h2>
          <p className="sub">Veja como a semana de um show flui quando cada coisa já está no lugar.</p>
          
          <div className="linha">
            <div className="dia">
              <b>Segunda</b>
              <span>O contratante pede orçamento e ele sai pronto.</span>
            </div>
            <div className="dia">
              <b>Terça</b>
              <span>O contrato vai automático e o sinal é registrado.</span>
            </div>
            <div className="dia">
              <b>Quinta</b>
              <span>Repertório fechado e checklist do show em mãos.</span>
            </div>
            <div className="dia">
              <b>Sábado</b>
              <span>Palco mapeado, equipe avisada, só falta cantar.</span>
            </div>
            <div className="dia">
              <b>Domingo</b>
              <span>Saldo cobrado e financeiro do mês atualizado.</span>
            </div>
          </div>

          <div className="ingr-v">
            <a 
              className="btn" 
              href="https://www.youtube.com/shorts/d-Hx3NwVuIM" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Assistir ao vídeo (1 min)
            </a>
            <p>Veja a plataforma funcionando por dentro.</p>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos">
        <div className="wrap">
          <h2>Recados de quem já está nos bastidores</h2>
          <p className="sub">Avaliações reais de artistas no Google.</p>
          
          <div className="recados">
            <figure className="recado" style={{ margin: 0 }}>
              <div className="estrelas" aria-label="5 estrelas">★★★★★</div>
              <blockquote>
                "Excelente aplicativo! Muito bom para organizar a agenda de shows e controlar os cachês. 
                Recomendo para todos os artistas!"
              </blockquote>
              <small>Larissa · Google</small>
              <img 
                src={larissamGoogle} 
                alt="Avaliação de Larissa no Google" 
                style={{ width: '100%', marginTop: '12px', borderRadius: '8px', display: 'none' }}
              />
            </figure>

            <figure className="recado" style={{ margin: 0 }}>
              <div className="estrelas" aria-label="5 estrelas">★★★★★</div>
              <blockquote>
                "Simplesmente perfeito! Consegui organizar toda minha carreira em um só lugar. 
                Não sei como fazia antes sem o Backstage Pro."
              </blockquote>
              <small>Marcelo · Google</small>
              <img 
                src={marceloGoogle} 
                alt="Avaliação de Marcelo no Google" 
                style={{ width: '100%', marginTop: '12px', borderRadius: '8px', display: 'none' }}
              />
            </figure>

            <figure className="recado" style={{ margin: 0 }}>
              <div className="estrelas" aria-label="5 estrelas">★★★★★</div>
              <blockquote>
                "App sensacional! Facilitou muito minha vida como músico profissional. 
                Agora consigo ter controle total da minha agenda e finanças."
              </blockquote>
              <small>Fábio · Google</small>
              <img 
                src={fabioGoogle} 
                alt="Avaliação de Fábio no Google" 
                style={{ width: '100%', marginTop: '12px', borderRadius: '8px', display: 'none' }}
              />
            </figure>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" style={{ paddingTop: '20px' }}>
        <div className="wrap">
          <h2>Entre no palco do seu jeito e cresça no seu ritmo</h2>
          <p className="sub">
            O Backstage Pro acompanha cada fase da carreira. Você sobe de plano quando precisar de mais.
          </p>
          
          <div className="ingressos">
            <div className="ing">
              <h3>Primeiros shows</h3>
              <p>Agenda, finanças e precificação para sair da bagunça no primeiro dia.</p>
              <strong style={{ fontSize: '32px', display: 'block', margin: '16px 0 8px' }}>R$ 19,90<small style={{ fontSize: '16px', fontWeight: 400, color: 'var(--suave)' }}>/mês</small></strong>
              <em>comece por aqui</em>
            </div>

            <div className="ing">
              <h3>Agenda cheia</h3>
              <p>Clientes, orçamentos, repertório e divulgação para fechar mais shows.</p>
              <strong style={{ fontSize: '32px', display: 'block', margin: '16px 0 8px' }}>R$ 24,90<small style={{ fontSize: '16px', fontWeight: 400, color: '#d7e3ff' }}>/mês</small></strong>
              <em>a fase de vender</em>
            </div>

            <div className="ing">
              <h3>Casa lotada</h3>
              <p>Equipe, contratos, agendamento online e controle completo da carreira.</p>
              <strong style={{ fontSize: '32px', display: 'block', margin: '16px 0 8px' }}>R$ 39,90<small style={{ fontSize: '16px', fontWeight: 400, color: '#d7e3ff' }}>/mês</small></strong>
              <em>a fase de operar</em>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="final">
        <div className="luz l1" aria-hidden="true"></div>
        <div className="luz l2" aria-hidden="true"></div>
        
        <div className="wrap">
          <div className="final-grid">
            <div className="final-txt">
              <h2>A plateia espera você. Os bastidores a gente resolve.</h2>
              <p>Crie sua conta e coloque agenda e dinheiro em ordem hoje.</p>
              <Link className="btn cl" to="/auth">Criar minha conta no Backstage Pro</Link>
            </div>

            <div className="pendulo" aria-label="Credencial de exemplo do Backstage Pro">
              <div className="fita"></div>
              <div className="argola"></div>
              <div className="cred">
                <div className="furo"></div>
                <div className="foto">VC</div>
                <h3>Seu nome artístico</h3>
                <p>Cantor(a) · acesso aos bastidores</p>
                <div className="acesso">
                  <span>Agenda de shows</span>
                  <span>Cachês e contratos</span>
                  <span>Clientes e equipe</span>
                </div>
                <div className="cod"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <span>© 2026 Backstage Pro · gestão para cantores</span>
          <a href="https://backstageproapp.com/" target="_blank" rel="noopener noreferrer">
            backstageproapp.com
          </a>
        </div>
      </footer>
    </div>
  );
}
