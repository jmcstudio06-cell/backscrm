import { useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, Clock, Gift, Lock, Music, Sparkles, PlayCircle, Palette, MessageSquare, Rocket, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import manualCover from "@/assets/kit-manual.png";
import artsCover from "@/assets/kit-artes.png";
import messagesCover from "@/assets/kit-mensagens.png";
import appCover from "@/assets/kit-backstage.png";

export type KitChapterPreview = { id: string; title: string; intro: string; icon: LucideIcon };
const rewards = [
  { title: "Aula completa em vídeo", category: "ASSISTA", image: manualCover, icon: PlayCircle },
  { title: "Artes editáveis no Canva", category: "DIVULGUE", image: artsCover, icon: Palette },
  { title: "Mensagens para contratantes", category: "CONECTE", image: messagesCover, icon: MessageSquare },
  { title: "Conheça a Backstage Pro", category: "ORGANIZE", image: appCover, icon: Rocket },
];

export function KitIntro({ chapters, readMinutes, onStart }: { chapters: KitChapterPreview[]; readMinutes: number; onStart: () => void }) {
  const [selected, setSelected] = useState(0);
  const chapter = chapters[selected];
  if (!chapter) return null;
  const Icon = chapter.icon;
  return <main>
    <section className="kit-hero">
      <img src={manualCover} alt="Manual do Artista Contratado" className="kit-hero-photo" />
      <div className="kit-hero-shade" />
      <div className="kit-shell kit-hero-content">
        <div className="kit-eyebrow"><Sparkles size={16} /> SEU PRÓXIMO PASSO NA MÚSICA</div>
        <h1>Kit Profissional<br /><span>do Artista.</span></h1>
        <p>Seu talento merece uma carreira organizada. Do primeiro contato ao próximo contrato, comece a fazer diferente.</p>
        <Button size="xl" onClick={onStart} className="kit-hero-cta">Começar meu manual <ArrowUpRight /></Button>
        <div className="kit-hero-facts"><span><BookOpen /> {chapters.length} capítulos</span><span><Clock /> ~{readMinutes} min</span><span><Gift /> 4 bônus</span></div>
        <span className="kit-free-note"><CheckCircle2 size={16} /> Material gratuito. Sem compromisso.</span>
      </div>
      <div className="kit-cover-caption"><BookOpen size={20} /><div><span>SEU PONTO DE PARTIDA</span><strong>Manual do Artista Contratado</strong></div></div>
    </section>
    <div className="kit-ribbon" aria-hidden="true"><div>{[0, 1].map(n => <span key={n}>POSICIONAMENTO <Music /> NEGOCIAÇÃO <Music /> ORGANIZAÇÃO <Music /> GESTÃO DE CARREIRA <Music /></span>)}</div></div>
    <section id="conteudo" className="kit-shell kit-section">
      <div className="kit-section-heading"><div><p className="kit-eyebrow text-primary">01 / O MANUAL</p><h2>Antes do palco,<br />vem a estratégia.</h2></div><p>Uma jornada prática para valorizar seu trabalho, conduzir negociações e cuidar do que acontece nos bastidores.</p></div>
      <div className="kit-curriculum">
        <div className="kit-chapter-list" role="tablist" aria-label="Capítulos do manual" aria-orientation="vertical">
          {chapters.map((c, i) => <Button key={c.id} id={`kit-tab-${i}`} variant="ghost" role="tab" aria-selected={selected === i} aria-controls="kit-chapter-preview" onClick={() => setSelected(i)} onKeyDown={e => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const next = (i + (e.key === "ArrowDown" ? 1 : -1) + chapters.length) % chapters.length; setSelected(next); document.getElementById(`kit-tab-${next}`)?.focus(); } }} tabIndex={selected === i ? 0 : -1} className={`kit-chapter-tab ${selected === i ? "is-selected" : ""}`}><span className="kit-chapter-number">{String(i + 1).padStart(2, "0")}</span><span>{c.title}</span><ArrowUpRight /></Button>)}
        </div>
        <div id="kit-chapter-preview" role="tabpanel" aria-labelledby={`kit-tab-${selected}`} className="kit-chapter-preview">
          <div key={chapter.id} className="kit-preview-inner"><div className="kit-preview-top"><Icon size={32} /><span>CAPÍTULO {String(selected + 1).padStart(2, "0")}</span></div><h3>{chapter.title}</h3><p>{chapter.intro}</p><div className="kit-preview-bottom"><span><BookOpen size={17} /> Leitura + atividade prática</span><Button onClick={onStart} variant="secondary">Começar a leitura <ArrowRight /></Button></div></div>
          <span className="kit-preview-watermark" aria-hidden="true">{String(selected + 1).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
    <section id="bonus" className="kit-bonus-band"><div className="kit-shell kit-section">
      <div className="kit-section-heading"><div><p className="kit-eyebrow text-primary">02 / DO CONHECIMENTO À PRÁTICA</p><h2>Termine o manual.<br />Abra novas possibilidades.</h2></div><p>Ao concluir a leitura, estes quatro bônus ficam liberados para você colocar tudo em movimento.</p></div>
      <div className="kit-reward-grid">{rewards.map((reward, i) => <article className="kit-reward-card" key={reward.title}><Button variant="ghost" onClick={onStart} className="kit-reward-image" aria-label={`Começar manual para liberar ${reward.title}`}><img src={reward.image} alt={reward.title} loading="lazy" /><span><Lock size={14} /> Bônus {String(i + 1).padStart(2, "0")}</span></Button><div className="kit-reward-info"><p>{reward.category}</p><h3>{reward.title}</h3><span><reward.icon size={16} /> Liberado ao concluir o manual</span></div></article>)}</div>
    </div></section>
    <section className="kit-final"><div className="kit-shell"><Gift size={32} /><h2>O próximo show começa<br />com o que você faz hoje.</h2><p>Seu manual e quatro bônus. Um novo olhar para sua carreira.</p><Button size="xl" onClick={onStart} className="kit-hero-cta">Quero meu kit gratuito <ArrowUpRight /></Button></div></section>
    <footer className="kit-shell kit-footer"><span>Backstage Pro · Kit Profissional do Artista</span><div><a href="/termos">Termos de uso</a><a href="/privacidade">Privacidade</a></div></footer>
  </main>;
}
