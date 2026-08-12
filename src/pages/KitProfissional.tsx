import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Shield,
  User,
  Phone,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  Gift,
  MapPin,
  Music,
  BookOpen,
  Palette,
  MessageSquare,
  Rocket,
  Lightbulb,
  AlertTriangle,
  Target,
  Handshake,
  Trophy,
  Quote,
  Clock,
  DollarSign,
  Star,
  CalendarDays,
  FileSignature,
  Users,
  TrendingUp,
  PuzzleIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { insertGuideLeadWithFallback } from "@/lib/guide-leads";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import baIcon from "@/assets/ba-icon.png";

const LEAD_STORAGE_KEY = "kit_profissional_lead";
const MATERIAL_COMPLETED_KEY = "manual_artista_video_completed"; // reused for backward compat
const YT_VIDEO_ID = "xKQ8Dajx7x4";

// ─────────────────────────────────────────────────────────────────────────────
// CONTEÚDO DO MATERIAL — capítulos escritos, interativos
// ─────────────────────────────────────────────────────────────────────────────
type Chapter = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  icon: any;
  accent: string; // tailwind color name (blue, emerald, amber, rose, violet)
  blocks: Block[];
};

type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "quote"; text: string; author?: string }
  | { type: "tip"; title: string; text: string }
  | { type: "warn"; title: string; text: string }
  | { type: "list"; items: string[] }
  | { type: "stat"; value: string; label: string }
  | { type: "compare"; wrong: string; right: string };

const CHAPTERS: Chapter[] = [
  {
    id: "intro",
    eyebrow: "Capítulo 1",
    title: "Por que artistas talentosos perdem shows",
    intro:
      "Talento não é o suficiente. A cada semana, milhares de artistas perdem contratações porque falham em detalhes que ninguém ensina.",
    icon: AlertTriangle,
    accent: "rose",
    blocks: [
      {
        type: "p",
        text: "Se você já viu um artista com metade do seu talento fechar o triplo de shows, saiba: não é sorte. É posicionamento. É a forma como ele responde, como se apresenta e como conduz uma negociação do início ao fim.",
      },
      {
        type: "stat",
        value: "73%",
        label: "dos contratantes desistem quando não recebem resposta em até 2 horas",
      },
      {
        type: "h",
        text: "Os 3 erros silenciosos",
      },
      {
        type: "list",
        items: [
          "Demorar horas (ou dias) para responder uma mensagem simples de orçamento.",
          "Enviar áudios longos e desorganizados quando o contratante espera algo objetivo.",
          "Passar valores sem contexto, sem apresentar o que está incluso — o preço parece caro sozinho.",
        ],
      },
      {
        type: "quote",
        text: "O contratante não te compra pela sua voz. Ele te compra pela confiança que você transmite antes do show acontecer.",
      },
    ],
  },
  {
    id: "primeiro-contato",
    eyebrow: "Capítulo 2",
    title: "O primeiro contato que fecha shows",
    intro:
      "Os primeiros 5 minutos definem se o contratante vai continuar com você ou procurar outro artista. Existe uma forma certa de responder.",
    icon: MessageSquare,
    accent: "blue",
    blocks: [
      {
        type: "p",
        text: "Quando um contratante manda mensagem, ele já pesquisou. Ele viu seu Instagram, ouviu um trecho seu, e está decidindo. Sua resposta é o momento em que ele confirma se vale a pena continuar.",
      },
      {
        type: "compare",
        wrong: '"Boa noite! Passo os valores amanhã pq to em show 🎤"',
        right:
          '"Boa noite! Que bom seu contato. Para o dia XX consigo sim, vou verificar aqui e te retorno em até 30min com os detalhes completos."',
      },
      {
        type: "tip",
        title: "A regra dos 30 minutos",
        text: "Se demorar mais que isso, você perdeu autoridade. Nem que seja pra dizer 'estou verificando, respondo em 1h', responda de imediato.",
      },
      {
        type: "h",
        text: "O que sempre incluir no primeiro retorno",
      },
      {
        type: "list",
        items: [
          "Cumprimento personalizado (nome do contratante ou do evento).",
          "Confirmação de disponibilidade da data.",
          "Prazo claro para envio da proposta completa.",
          "Um pedido de 2-3 informações que te ajudam a montar orçamento (local, duração, público).",
        ],
      },
    ],
  },
  {
    id: "precificacao",
    eyebrow: "Capítulo 3",
    title: "Como valorizar seu trabalho sem parecer caro",
    intro:
      "Preço não é número — é percepção. Um mesmo valor pode parecer barato ou absurdo dependendo de como você apresenta.",
    icon: DollarSign,
    accent: "emerald",
    blocks: [
      {
        type: "p",
        text: "A maioria dos artistas cai na armadilha de mandar 'R$ X,XX' no WhatsApp e esperar resposta. O contratante compara com o próximo orçamento e escolhe o mais barato. Você entrou numa guerra que não precisava entrar.",
      },
      {
        type: "h",
        text: "A estrutura de proposta que converte",
      },
      {
        type: "list",
        items: [
          "Descrição do que está incluso (repertório, tempo, equipe, equipamento).",
          "Benefícios extras (ensaios, sound check, flexibilidade de repertório).",
          "Prazos e condições de pagamento em bullets claros.",
          "Investimento total — a palavra 'investimento' vale mais que 'preço'.",
        ],
      },
      {
        type: "tip",
        title: "Ancoragem de valor",
        text: "Se seu show custa R$ 2.500, apresente 3 formatos: solo (R$ 2.500), duo (R$ 3.500) e banda (R$ 5.000). A maioria escolhe o do meio — que era exatamente onde você queria chegar.",
      },
      {
        type: "warn",
        title: "Nunca envie só o número",
        text: "Preço solto no WhatsApp é a forma mais rápida de perder um show. Sempre acompanhe de contexto e valor percebido.",
      },
    ],
  },
  {
    id: "fechamento",
    eyebrow: "Capítulo 4",
    title: "Fechamento e profissionalismo",
    intro:
      "Aqui é onde artistas amadores viram profissionais. Como conduzir o fechamento sem dar margem para desistência ou desorganização.",
    icon: Handshake,
    accent: "violet",
    blocks: [
      {
        type: "p",
        text: "Um show fechado no boca-a-boca é um show que pode desmarcar. Fechamento profissional gera contrato, sinal e cronograma. É isso que separa quem vive de música de quem toca por hobby.",
      },
      {
        type: "list",
        items: [
          "Envie um contrato simples — mesmo quando o contratante é conhecido.",
          "Sinal de 30% a 50% na assinatura, saldo até 7 dias antes do show.",
          "Cronograma da apresentação: horário de chegada, sound check, entrada, término.",
          "Rider técnico anexado, mesmo básico. Isso te posiciona.",
        ],
      },
      {
        type: "quote",
        text: "O sinal não é sobre desconfiança. É sobre comprometimento — e todo contratante sério entende isso.",
      },
      {
        type: "tip",
        title: "A frase que blinda o fechamento",
        text: "\"Vou preparar o contrato ainda hoje pra gente formalizar. Assim garantimos a data no seu nome e eu já bloqueio agenda.\" — isso comunica seriedade e cria urgência ao mesmo tempo.",
      },
    ],
  },
  {
    id: "pos-show",
    eyebrow: "Capítulo 5",
    title: "Pós-show: onde nasce o próximo contrato",
    intro:
      "O contrato acabou, o show foi um sucesso — e é aí que 90% dos artistas param. Quem entende o que fazer depois multiplica indicações.",
    icon: Target,
    accent: "amber",
    blocks: [
      {
        type: "p",
        text: "Um contratante satisfeito é a fonte mais barata e mais quente de novos shows que existe. Mas isso só acontece se você fizer o pós certo. E a maioria não faz.",
      },
      {
        type: "h",
        text: "Os 3 movimentos pós-show",
      },
      {
        type: "list",
        items: [
          "Mensagem de agradecimento em até 24h, personalizada — nada de 'valeu' genérico.",
          "Peça 2 fotos ou 1 vídeo curto do evento. Isso vira material pra próxima venda.",
          "Pergunte, com naturalidade, se ele conhece alguém que também vai contratar show em breve. Indicação nasce de pergunta feita.",
        ],
      },
      {
        type: "stat",
        value: "4x",
        label: "mais chances de contratação quando vem de indicação direta",
      },
      {
        type: "tip",
        title: "Você concluiu o material 🎓",
        text: "Agora você tem uma visão completa: do primeiro contato ao pós-show. Na próxima tela, o vídeo completo e todos os bônus foram desbloqueados.",
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BÔNUS — o que é entregue quando o material é concluído
// ─────────────────────────────────────────────────────────────────────────────
type Benefit = {
  id: string;
  title: string;
  description: string;
  icon: any;
  cta: string;
  action: () => void;
  accent: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
type View = "reading" | "unlocked";

export default function KitProfissional() {
  const navigate = useNavigate();
  const [isLeadRegistered, setIsLeadRegistered] = useState(false);
  const [view, setView] = useState<View>("reading");
  const [chapterIdx, setChapterIdx] = useState(0);

  // form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [showsPerMonth, setShowsPerMonth] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(LEAD_STORAGE_KEY)) setIsLeadRegistered(true);
    if (localStorage.getItem(MATERIAL_COMPLETED_KEY) === "true") {
      setView("unlocked");
    }
  }, []);

  const totalChapters = CHAPTERS.length;
  const progressPct = Math.round(((chapterIdx + 1) / totalChapters) * 100);
  const currentChapter = CHAPTERS[chapterIdx];

  const benefits: Benefit[] = useMemo(
    () => [
      {
        id: "video",
        title: "Aula completa em vídeo",
        description:
          "Assista à versão em vídeo do Manual do Artista Contratado, com exemplos reais.",
        icon: PlayCircle,
        cta: "Assistir agora",
        action: () => {
          document.getElementById("video-anchor")?.scrollIntoView({ behavior: "smooth" });
        },
        accent: "blue",
      },
      {
        id: "trial",
        title: "Teste o Backstage Pro de graça",
        description:
          "O sistema que organiza sua carreira: agenda, contratos, financeiro e link da bio.",
        icon: Rocket,
        cta: "Testar o app",
        action: () => {
          window.location.href = "https://backstagepro.online/landing";
        },
        accent: "emerald",
      },
      {
        id: "artes",
        title: "Artes editáveis grátis",
        description:
          "Divulgue seus shows com arte profissional. Templates prontos no Canva, é só editar.",
        icon: Palette,
        cta: "Abrir artes",
        action: () => navigate("/kit-profissional/artes"),
        accent: "violet",
      },
      {
        id: "mensagens",
        title: "Mensagens prontas para contratantes",
        description:
          "Textos copy-paste para primeiro contato, envio de orçamento, fechamento e pós-show.",
        icon: MessageSquare,
        cta: "Abrir mensagens",
        action: () => navigate("/kit-profissional/mensagens"),
        accent: "amber",
      },
    ],
    [navigate],
  );

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const handleSubmitLead = async () => {
    const trimmed = name.trim();
    const digits = phone.replace(/\D/g, "");
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) return toast.error("Digite seu nome e sobrenome");
    if (digits.length < 10 || digits.length > 11)
      return toast.error("Digite um WhatsApp válido com DDD");
    if (/^(.)\1+$/.test(digits)) return toast.error("Insira um WhatsApp válido");
    if (!city.trim()) return toast.error("Digite sua cidade");
    if (!showsPerMonth) return toast.error("Selecione a quantidade de shows");

    setSubmitting(true);
    try {
      const leadData = {
        name: trimmed,
        phone: digits,
        city: city.trim(),
        shows_per_month: showsPerMonth,
        source: "kit_profissional",
      };
      await insertGuideLeadWithFallback(leadData);
      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leadData));
      localStorage.setItem("guia_lead_captured", "true");
      setIsLeadRegistered(true);
      toast.success("Bem-vindo! Seu material está liberado 📖");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    if (chapterIdx < totalChapters - 1) {
      setChapterIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // final chapter → unlock
      localStorage.setItem(MATERIAL_COMPLETED_KEY, "true");
      setView("unlocked");
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Bônus desbloqueados! 🎉");
    }
  };

  const goPrev = () => {
    if (chapterIdx > 0) {
      setChapterIdx((i) => i - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] text-slate-900">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={baIcon}
              alt="Backstage"
              className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                Backstage
              </span>
              <span className="font-black text-sm sm:text-base text-slate-900 -mt-0.5 truncate">
                Manual do Artista
              </span>
            </div>
          </div>

          {isLeadRegistered && view === "reading" && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
                <BookOpen className="w-3.5 h-3.5" />
                Capítulo {chapterIdx + 1} de {totalChapters}
              </div>
              <div className="w-24 sm:w-32 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {isLeadRegistered && view === "unlocked" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <Trophy className="w-3.5 h-3.5" /> Material concluído
            </span>
          )}
        </div>
      </header>

      {/* ── READING VIEW ── */}
      {isLeadRegistered && view === "reading" && (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <ChapterView chapter={currentChapter} />

          {/* Nav */}
          <div className="mt-12 flex items-center justify-between gap-4">
            <button
              onClick={goPrev}
              disabled={chapterIdx === 0}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-lg transition",
                chapterIdx === 0
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
              )}
            >
              <ArrowLeft className="w-4 h-4" /> Anterior
            </button>

            <button
              onClick={goNext}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3.5 rounded-xl shadow-lg shadow-slate-900/10 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              {chapterIdx === totalChapters - 1 ? (
                <>
                  Concluir e desbloquear bônus
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continuar leitura
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Chapter dots */}
          <div className="mt-10 flex items-center justify-center gap-2">
            {CHAPTERS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setChapterIdx(i)}
                aria-label={`Ir para capítulo ${i + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === chapterIdx
                    ? "w-8 bg-slate-900"
                    : i < chapterIdx
                      ? "w-2 bg-emerald-500"
                      : "w-2 bg-slate-300 hover:bg-slate-400",
                )}
              />
            ))}
          </div>
        </main>
      )}

      {/* ── UNLOCKED VIEW ── */}
      {isLeadRegistered && view === "unlocked" && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-12">
          {/* Hero */}
          <section className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
              <Trophy className="w-3.5 h-3.5" />
              Você concluiu o Manual do Artista
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] text-slate-900">
              Todos os seus bônus foram <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                desbloqueados
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              Você tem agora tudo o que precisa para transformar mensagens em contratos assinados.
            </p>
            <button
              onClick={() => {
                setChapterIdx(0);
                setView("reading");
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
            >
              <BookOpen className="w-4 h-4" /> Revisar material escrito
            </button>
          </section>

          {/* Benefits grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {benefits.map((b) => (
              <BenefitCard key={b.id} benefit={b} />
            ))}
          </section>

          {/* Video anchor */}
          <section id="video-anchor" className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-bold">
                  Aula em vídeo
                </p>
                <h2 className="font-bold text-lg sm:text-xl text-slate-900">
                  Manual do Artista — versão completa
                </h2>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-xl">
              <div className="flex justify-center py-5 px-4">
                <div className="relative w-full max-w-[420px] aspect-[9/16] rounded-xl overflow-hidden ring-1 ring-white/10">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${YT_VIDEO_ID}?rel=0&modestbranding=1&playsinline=1`}
                    title="Manual do Artista Contratado"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Closing card */}
          <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-12 text-center space-y-4">
            <Star className="w-8 h-8 text-amber-300 mx-auto" />
            <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              Leve tudo isso para o próximo nível
            </h3>
            <p className="text-slate-300 max-w-lg mx-auto text-sm sm:text-base">
              O Backstage Pro é o sistema onde artistas profissionais aplicam esse manual todo dia — agenda, contratos, financeiro e link da bio em um único lugar.
            </p>
            <button
              onClick={() => (window.location.href = "https://backstagepro.online/landing")}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm sm:text-base px-6 sm:px-8 py-3.5 rounded-xl transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Testar o Backstage Pro grátis
              <ArrowRight className="w-4 h-4" />
            </button>
          </section>
        </main>
      )}

      {/* ── LEAD CAPTURE MODAL ── */}
      {!isLeadRegistered && <LeadCaptureModal
        name={name}
        phone={phone}
        city={city}
        showsPerMonth={showsPerMonth}
        submitting={submitting}
        setName={setName}
        setPhone={(v) => setPhone(formatPhone(v))}
        setCity={setCity}
        setShowsPerMonth={setShowsPerMonth}
        onSubmit={handleSubmitLead}
      />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chapter view
// ─────────────────────────────────────────────────────────────────────────────
function ChapterView({ chapter }: { chapter: Chapter }) {
  const Icon = chapter.icon;
  const accentBg: Record<string, string> = {
    rose: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
    violet: "bg-violet-100 text-violet-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <article className="space-y-8">
      {/* Chapter header */}
      <header className="space-y-4">
        <div
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest",
            accentBg[chapter.accent] || "bg-slate-100 text-slate-700",
          )}
        >
          <Icon className="w-3.5 h-3.5" />
          {chapter.eyebrow}
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] text-slate-900">
          {chapter.title}
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 leading-relaxed font-light">
          {chapter.intro}
        </p>
      </header>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Blocks */}
      <div className="space-y-6">
        {chapter.blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} accent={chapter.accent} />
        ))}
      </div>
    </article>
  );
}

function BlockRenderer({ block, accent }: { block: Block; accent: string }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
          {block.text}
        </p>
      );
    case "h":
      return (
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 pt-4 tracking-tight">
          {block.text}
        </h2>
      );
    case "quote":
      return (
        <blockquote className="relative pl-6 py-2 border-l-4 border-slate-900 bg-slate-50 rounded-r-xl px-6 py-5">
          <Quote className="absolute -top-2 -left-2 w-6 h-6 text-slate-300 bg-[#fafaf7] rounded-full p-1" />
          <p className="text-lg sm:text-xl font-medium text-slate-800 italic leading-snug">
            "{block.text}"
          </p>
          {block.author && (
            <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">
              — {block.author}
            </p>
          )}
        </blockquote>
      );
    case "tip":
      return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-1.5">
            <p className="font-black text-emerald-900 text-sm sm:text-base">{block.title}</p>
            <p className="text-emerald-800/90 text-sm sm:text-base leading-relaxed">
              {block.text}
            </p>
          </div>
        </div>
      );
    case "warn":
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:p-6 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-1.5">
            <p className="font-black text-rose-900 text-sm sm:text-base">{block.title}</p>
            <p className="text-rose-800/90 text-sm sm:text-base leading-relaxed">
              {block.text}
            </p>
          </div>
        </div>
      );
    case "list":
      return (
        <ul className="space-y-3">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 items-start text-base sm:text-lg text-slate-700 leading-relaxed">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "stat":
      return (
        <div className="rounded-2xl bg-slate-900 text-white p-6 sm:p-8 text-center">
          <p className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent leading-none">
            {block.value}
          </p>
          <p className="text-sm sm:text-base text-slate-300 mt-3 font-medium max-w-md mx-auto">
            {block.label}
          </p>
        </div>
      );
    case "compare":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-white p-5 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" /> Errado
            </p>
            <p className="text-sm text-slate-700 leading-relaxed italic">
              {block.wrong}
            </p>
          </div>
          <div className="rounded-2xl border-2 border-emerald-200 bg-white p-5 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> Certo
            </p>
            <p className="text-sm text-slate-700 leading-relaxed italic">
              {block.right}
            </p>
          </div>
        </div>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Benefit card
// ─────────────────────────────────────────────────────────────────────────────
function BenefitCard({ benefit }: { benefit: Benefit }) {
  const Icon = benefit.icon;
  const accents: Record<string, { bg: string; text: string; ring: string; btn: string }> = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      ring: "hover:border-blue-300",
      btn: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      ring: "hover:border-emerald-300",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    violet: {
      bg: "bg-violet-50",
      text: "text-violet-700",
      ring: "hover:border-violet-300",
      btn: "bg-violet-600 hover:bg-violet-700 text-white",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      ring: "hover:border-amber-300",
      btn: "bg-amber-600 hover:bg-amber-700 text-white",
    },
  };
  const a = accents[benefit.accent] || accents.blue;

  return (
    <div
      className={cn(
        "group relative rounded-2xl bg-white border border-slate-200 p-6 flex flex-col shadow-sm hover:shadow-xl transition-all duration-300",
        a.ring,
      )}
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", a.bg)}>
        <Icon className={cn("w-6 h-6", a.text)} />
      </div>
      <h3 className="font-black text-slate-900 text-lg leading-tight">{benefit.title}</h3>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed">{benefit.description}</p>
      <button
        onClick={benefit.action}
        className={cn(
          "mt-5 inline-flex items-center justify-center gap-1.5 font-bold text-sm px-5 py-3 rounded-xl transition-all",
          a.btn,
        )}
      >
        {benefit.cta}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lead capture modal
// ─────────────────────────────────────────────────────────────────────────────
function LeadCaptureModal(props: {
  name: string;
  phone: string;
  city: string;
  showsPerMonth: string;
  submitting: boolean;
  setName: (v: string) => void;
  setPhone: (v: string) => void;
  setCity: (v: string) => void;
  setShowsPerMonth: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 my-auto">
        {/* Top */}
        <div className="p-7 pb-5 text-center border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">
            Manual do Artista Contratado
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
            Acesso ao material profissional
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            5 capítulos práticos + vídeo + bônus. Preencha para começar.
          </p>
        </div>

        {/* Form */}
        <div className="p-7 pt-6 space-y-4">
          <FormField label="Nome e sobrenome" icon={<User className="w-4 h-4" />}>
            <Input
              placeholder="Ex: João Silva"
              value={props.name}
              onChange={(e) => props.setName(e.target.value)}
              maxLength={100}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
            />
          </FormField>

          <FormField label="WhatsApp (com DDD)" icon={<Phone className="w-4 h-4" />}>
            <Input
              placeholder="(11) 98765-4321"
              value={props.phone}
              onChange={(e) => props.setPhone(e.target.value)}
              maxLength={15}
              inputMode="tel"
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
            />
          </FormField>

          <FormField label="De qual cidade você é?" icon={<MapPin className="w-4 h-4" />}>
            <Input
              placeholder="Ex: São Paulo - SP"
              value={props.city}
              onChange={(e) => props.setCity(e.target.value)}
              maxLength={100}
              className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-500"
            />
          </FormField>

          <FormField label="Quantos shows você faz por mês?" icon={<Music className="w-4 h-4" />}>
            <Select value={props.showsPerMonth} onValueChange={props.setShowsPerMonth}>
              <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                <SelectValue placeholder="Selecione uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0-3">0 a 3 shows</SelectItem>
                <SelectItem value="3-5">3 a 5 shows</SelectItem>
                <SelectItem value="5-10">5 a 10 shows</SelectItem>
                <SelectItem value="10+">Mais de 10 shows</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <Button
            className="w-full gap-2 text-base py-6 bg-slate-900 hover:bg-slate-800 text-white border-0 font-bold rounded-xl mt-2"
            onClick={props.onSubmit}
            disabled={props.submitting}
          >
            {props.submitting ? "Liberando acesso..." : "Acessar o material grátis"}
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3" /> Seus dados estão seguros. Não enviamos spam.
          </p>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <span className="text-slate-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
