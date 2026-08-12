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
  Lock,
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
  | { type: "compare"; wrong: string; right: string }
  | { type: "gap"; title: string; text: string; items: string[] };

const CHAPTERS: Chapter[] = [
  {
    id: "intro",
    eyebrow: "Capítulo 1",
    title: "Por que artistas talentosos perdem shows",
    intro:
      "Talento não é o suficiente. A cada semana, milhares de artistas perdem contratações por detalhes de gestão que ninguém ensina.",
    icon: AlertTriangle,
    accent: "rose",
    blocks: [
      {
        type: "p",
        text: "Se você já viu um artista com metade do seu talento fechar o triplo de shows, saiba: não é sorte. É posicionamento. É a forma como ele responde, como se apresenta e como conduz uma negociação do primeiro 'oi' até o pagamento final.",
      },
      {
        type: "stat",
        value: "73%",
        label: "dos contratantes desistem quando não recebem resposta em até 2 horas",
      },
      { type: "h", text: "Os 5 erros silenciosos" },
      {
        type: "list",
        items: [
          "Demorar horas (ou dias) para responder uma mensagem simples de orçamento.",
          "Enviar áudios longos e desorganizados quando o contratante espera algo objetivo.",
          "Passar valores sem contexto: preço sozinho sempre parece caro.",
          "Perder o histórico do contato — quem pediu orçamento, quando, por quanto, e o que ficou combinado.",
          "Não saber, de cabeça, quanto entrou no mês, quanto ainda vai receber e quanto custou cada show.",
        ],
      },
      {
        type: "quote",
        text: "O contratante não te compra pela sua voz. Ele te compra pela confiança que você transmite antes do show acontecer.",
      },
      {
        type: "p",
        text: "Repare em algo: nenhum desses cinco erros é sobre música. Todos são sobre organização. E organização, quando fica no bloco de notas, no print do WhatsApp e na memória, sempre falha exatamente no dia em que você está mais ocupado — o dia do show.",
      },
      {
        type: "gap",
        title: "O que falta quando não existe sistema",
        text: "Cada dica deste material funciona uma vez na força de vontade. Repetida 30 vezes por mês, ela só se sustenta dentro de um sistema. É esse o buraco que o Backstage Pro fecha.",
        items: [
          "Todo contato de show entra no CRM e nunca se perde no meio das conversas.",
          "Agenda, financeiro e clientes no mesmo lugar, atualizados sozinhos.",
          "Você olha uma tela e sabe onde sua carreira está hoje.",
        ],
      },
    ],
  },
  {
    id: "primeiro-contato",
    eyebrow: "Capítulo 2",
    title: "O primeiro contato que fecha shows",
    intro:
      "Os primeiros 5 minutos definem se o contratante continua com você ou procura outro artista. Existe uma forma certa de responder.",
    icon: MessageSquare,
    accent: "blue",
    blocks: [
      {
        type: "p",
        text: "Quando um contratante manda mensagem, ele já pesquisou. Viu seu Instagram, ouviu um trecho seu, e está decidindo. Sua resposta é o momento em que ele confirma se vale a pena continuar — ou se você é 'mais um'.",
      },
      {
        type: "compare",
        wrong: '"Boa noite! Passo os valores amanhã pq to em show 🎤"',
        right:
          '"Boa noite, Marcos! Que bom seu contato. Para o dia 14 tenho disponibilidade sim. Vou montar a proposta com os formatos e te envio em até 30 minutos."',
      },
      {
        type: "tip",
        title: "A regra dos 30 minutos",
        text: "Se demorar mais que isso, você perdeu autoridade. Nem que seja para dizer 'estou verificando, respondo em 1h' — responda de imediato.",
      },
      { type: "h", text: "O que sempre incluir no primeiro retorno" },
      {
        type: "list",
        items: [
          "Cumprimento personalizado com o nome do contratante ou do evento.",
          "Confirmação real de disponibilidade da data (real, não 'acho que dá').",
          "Prazo claro para envio da proposta completa.",
          "Duas ou três perguntas que te ajudam a orçar: local, duração e público estimado.",
          "Um link único com seu material, em vez de sete arquivos soltos.",
        ],
      },
      {
        type: "warn",
        title: "O erro que custa mais caro",
        text: "Dizer que a data está livre sem ter certeza. Quando você descobre que já tinha compromisso, ou perde o show ou queima sua imagem. Disponibilidade precisa ser consultada, não lembrada.",
      },
      {
        type: "gap",
        title: "O que falta quando não existe sistema",
        text: "Responder em 30 minutos com segurança exige que a resposta esteja pronta antes da pergunta chegar.",
        items: [
          "Agenda em tempo real: você confirma a data em 5 segundos, de onde estiver.",
          "Mensagens prontas para contratantes, só ajustando nome e data.",
          "Link da bio profissional com vídeo, fotos e contato num único endereço.",
        ],
      },
    ],
  },
  {
    id: "precificacao",
    eyebrow: "Capítulo 3",
    title: "Como valorizar seu trabalho sem parecer caro",
    intro:
      "Preço não é número — é percepção. O mesmo valor pode parecer barato ou absurdo dependendo de como você apresenta.",
    icon: DollarSign,
    accent: "emerald",
    blocks: [
      {
        type: "p",
        text: "A maioria dos artistas manda 'R$ 2.500' no WhatsApp e espera. O contratante compara com o próximo orçamento e escolhe o mais barato. Você entrou numa guerra de preço que não precisava entrar.",
      },
      { type: "h", text: "A estrutura de proposta que converte" },
      {
        type: "list",
        items: [
          "Descrição do que está incluso: repertório, tempo de show, equipe, equipamento.",
          "Benefícios extras: ensaio, passagem de som, flexibilidade de repertório.",
          "Prazos e condições de pagamento em itens claros, sem letra miúda.",
          "Investimento total — a palavra 'investimento' vale mais que 'preço'.",
          "Prazo de validade da proposta. Proposta sem prazo não gera decisão.",
        ],
      },
      {
        type: "tip",
        title: "Ancoragem de valor",
        text: "Se seu show custa R$ 2.500, apresente três formatos: solo (R$ 2.500), duo (R$ 3.500) e banda (R$ 5.000). A maioria escolhe o do meio — que era exatamente onde você queria chegar.",
      },
      { type: "h", text: "Você sabe quanto custa o seu show?" },
      {
        type: "p",
        text: "Cachê não é lucro. Do valor combinado saem músicos, transporte, alimentação, equipamento e imposto. Artista que não calcula custo real aceita show que dá prejuízo achando que fez um bom negócio.",
      },
      {
        type: "warn",
        title: "Nunca envie só o número",
        text: "Preço solto no WhatsApp é a forma mais rápida de perder um show. Sempre acompanhe de contexto e valor percebido.",
      },
      {
        type: "gap",
        title: "O que falta quando não existe sistema",
        text: "Precificar bem é conta, não intuição. E proposta bonita feita à mão só sai quando você tem tempo — o que nunca acontece na semana cheia.",
        items: [
          "Precificação com custo de equipe e transporte calculado automaticamente.",
          "Orçamento profissional gerado em segundos, com seus formatos e sua marca.",
          "Link de orçamento premium com fotos, vídeos e marcas que já te contrataram.",
        ],
      },
    ],
  },
  {
    id: "fechamento",
    eyebrow: "Capítulo 4",
    title: "Fechamento, contrato e sinal",
    intro:
      "Aqui é onde amadores viram profissionais: conduzir o fechamento sem dar margem para desistência ou desorganização.",
    icon: Handshake,
    accent: "violet",
    blocks: [
      {
        type: "p",
        text: "Um show fechado no boca a boca é um show que pode desmarcar na véspera. Fechamento profissional gera contrato, sinal e cronograma. É isso que separa quem vive de música de quem toca por hobby.",
      },
      {
        type: "list",
        items: [
          "Envie um contrato simples — mesmo quando o contratante é conhecido.",
          "Sinal de 30% a 50% na assinatura, saldo até 7 dias antes do show.",
          "Cronograma da apresentação: chegada, passagem de som, entrada, término.",
          "Rider técnico anexado, mesmo básico. Isso te posiciona acima da média.",
          "Confirmação por escrito de tudo que foi combinado por voz.",
        ],
      },
      {
        type: "quote",
        text: "O sinal não é sobre desconfiança. É sobre comprometimento — e todo contratante sério entende isso.",
      },
      {
        type: "tip",
        title: "A frase que blinda o fechamento",
        text: '"Vou preparar o contrato ainda hoje pra gente formalizar. Assim garantimos a data no seu nome e eu já bloqueio a agenda." — comunica seriedade e cria urgência na mesma frase.',
      },
      {
        type: "warn",
        title: "Contrato em Word não fecha show",
        text: "Editar um modelo antigo, salvar em PDF, imprimir, assinar, fotografar e reenviar faz o fechamento levar dias. Nesse intervalo, o contratante recebe outra proposta.",
      },
      {
        type: "gap",
        title: "O que falta quando não existe sistema",
        text: "Contrato precisa sair no mesmo dia da conversa, com os dados certos e sem retrabalho.",
        items: [
          "Contrato gerado automaticamente com dados do cliente, do show e suas cláusulas.",
          "Assinatura digital por link: o contratante assina do celular, em minutos.",
          "Sinal e saldo já lançados no financeiro, com data prevista de recebimento.",
        ],
      },
    ],
  },
  {
    id: "rotina",
    eyebrow: "Capítulo 5",
    title: "A rotina que sustenta uma agenda cheia",
    intro:
      "Fechar shows é uma habilidade. Sustentar 15 shows no mês sem esquecer nada é outra — e é a que quebra a maioria.",
    icon: CalendarDays,
    accent: "blue",
    blocks: [
      {
        type: "p",
        text: "Quando a agenda enche, o problema deixa de ser conseguir show e passa a ser não deixar nada cair. Data trocada, músico não avisado, equipamento esquecido, cachê não cobrado. Um único erro desses apaga a reputação construída em dez shows perfeitos.",
      },
      { type: "h", text: "O checklist mínimo de cada show" },
      {
        type: "list",
        items: [
          "Data, horário de chegada e horário de início confirmados com o contratante.",
          "Endereço completo e nome de quem vai te receber no local.",
          "Equipe escalada e confirmada, com valor de cada músico definido.",
          "Repertório e formato acertados com a produção do evento.",
          "Equipamento revisado e transporte resolvido com antecedência.",
          "Sinal recebido e saldo com data marcada para cobrança.",
        ],
      },
      {
        type: "stat",
        value: "1 em 4",
        label: "shows tem algum problema evitável de produção por falta de checagem prévia",
      },
      {
        type: "tip",
        title: "Confirmação 72h antes",
        text: "Três dias antes, mande uma mensagem confirmando horário, local e formato. Isso evita 90% dos desencontros e passa uma impressão de organização que o contratante comenta com outros.",
      },
      {
        type: "gap",
        title: "O que falta quando não existe sistema",
        text: "Checklist no papel funciona até o terceiro show do mês. Depois disso, você precisa que o próprio show te cobre.",
        items: [
          "Checklist por show, com pendências visíveis até serem resolvidas.",
          "Equipe, pagamentos e PIX de cada músico organizados por evento.",
          "Notificações e lembretes automáticos dos próximos compromissos.",
        ],
      },
    ],
  },
  {
    id: "dinheiro",
    eyebrow: "Capítulo 6",
    title: "Onde o dinheiro do artista desaparece",
    intro:
      "Faturar bem e não sobrar nada é o sintoma mais comum da carreira musical. O problema quase nunca é o cachê.",
    icon: TrendingUp,
    accent: "emerald",
    blocks: [
      {
        type: "p",
        text: "Pergunte a dez artistas quanto eles faturaram no mês passado. Nove vão dar um número aproximado. Pergunte quanto sobrou depois de equipe, transporte e despesas — praticamente nenhum sabe. Sem esse número, não existe decisão de carreira, só palpite.",
      },
      { type: "h", text: "Os três números que você precisa saber sempre" },
      {
        type: "list",
        items: [
          "Recebido no mês: o que efetivamente caiu na conta.",
          "A receber: sinais e saldos de shows já fechados, com data.",
          "Custo por show: quanto sai do cachê antes de virar seu.",
        ],
      },
      {
        type: "warn",
        title: "O sinal que virou confusão",
        text: "Recebeu 50% em março de um show em maio? Se esse valor não fica registrado no mês certo, você acha que faturou menos em março e mais em maio. Aí toma decisão errada nos dois meses.",
      },
      {
        type: "quote",
        text: "Carreira sem número não é carreira, é tentativa. Quem mede o mês consegue planejar o ano.",
      },
      {
        type: "gap",
        title: "O que falta quando não existe sistema",
        text: "Nenhuma planilha aguenta sinal parcial, custo de equipe e histórico mensal ao mesmo tempo — e ainda ser preenchida depois do show, de madrugada.",
        items: [
          "Financeiro alimentado automaticamente por cada show da agenda.",
          "Recebido, pendente e custo real de equipe separados por mês.",
          "Histórico e gráficos mostrando a evolução real da sua carreira.",
        ],
      },
    ],
  },
  {
    id: "pos-show",
    eyebrow: "Capítulo 7",
    title: "Pós-show: onde nasce o próximo contrato",
    intro:
      "O show foi um sucesso — e é aí que 90% dos artistas param. Quem entende o pós-show multiplica indicações.",
    icon: Target,
    accent: "amber",
    blocks: [
      {
        type: "p",
        text: "Um contratante satisfeito é a fonte mais barata e mais quente de novos shows que existe. Mas isso só acontece se você fizer o pós certo — e a maioria não faz porque, no dia seguinte, já está correndo atrás do próximo evento.",
      },
      { type: "h", text: "Os 4 movimentos pós-show" },
      {
        type: "list",
        items: [
          "Mensagem de agradecimento em até 24h, personalizada — nada de 'valeu' genérico.",
          "Peça duas fotos ou um vídeo curto do evento. Isso vira material da próxima venda.",
          "Pergunte com naturalidade se ele conhece alguém que vai contratar show em breve.",
          "Marque no calendário a data provável do próximo evento dele e volte a falar antes dos concorrentes.",
        ],
      },
      {
        type: "stat",
        value: "4x",
        label: "mais chances de contratação quando o contato vem de indicação direta",
      },
      {
        type: "p",
        text: "Esse quarto movimento é o mais valioso e o mais esquecido. Aniversário de empresa, festa junina, réveillon de um bar: quase todo contratante repete. Quem aparece antes de ele começar a procurar não disputa preço com ninguém.",
      },
      {
        type: "gap",
        title: "O que falta quando não existe sistema",
        text: "Pós-show é sobre lembrar de algo na semana certa, meses depois. Memória não faz isso; sistema faz.",
        items: [
          "CRM com histórico de cada cliente e data de retorno programada.",
          "Radar de shows avisando quando é hora de reativar um contato antigo.",
          "Base de clientes que cresce a cada evento, em vez de sumir na conversa antiga.",
        ],
      },
      {
        type: "tip",
        title: "Você concluiu o material 🎓",
        text: "Você tem agora a visão completa: primeiro contato, precificação, contrato, rotina, dinheiro e pós-show. Repare que todo capítulo terminava no mesmo ponto — a técnica só se sustenta com estrutura. Na próxima tela, o vídeo completo e todos os bônus foram desbloqueados.",
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
    // Sempre começa no material escrito. Quem já concluiu antes acessa os
    // bônus pelo atalho no fim da leitura (o material é o conteúdo principal).
    setView("reading");
    setChapterIdx(0);
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

  const remaining = totalChapters - (chapterIdx + 1);
  const readMinutes = useMemo(() => {
    const words = JSON.stringify(currentChapter.blocks).split(/\s+/).length;
    return Math.max(2, Math.round(words / 190));
  }, [currentChapter]);

  return (
    <div className="min-h-screen paper-texture text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={baIcon}
              alt="Backstage"
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
            />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">
                Backstage Pro
              </span>
              <span className="font-editorial font-semibold text-sm sm:text-base text-slate-900 -mt-0.5 truncate">
                Manual do Artista
              </span>
            </div>
          </div>

          {isLeadRegistered && view === "reading" && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                <BookOpen className="w-3.5 h-3.5" />
                {chapterIdx + 1}/{totalChapters}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-full">
                {remaining === 0 ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Bônus prontos
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" /> 4 bônus em {remaining}{" "}
                    {remaining === 1 ? "capítulo" : "capítulos"}
                  </>
                )}
              </span>
            </div>
          )}

          {isLeadRegistered && view === "unlocked" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <Trophy className="w-3.5 h-3.5" /> Material concluído
            </span>
          )}
        </div>
        {isLeadRegistered && view === "reading" && (
          <div className="h-[3px] w-full bg-slate-200/70">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </header>

      {/* ── READING VIEW ── */}
      {isLeadRegistered && view === "reading" && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 pb-32 lg:pb-16">
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-14">
            {/* Rail */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 mb-4">
                    Sumário
                  </p>
                  <ol className="space-y-1">
                    {CHAPTERS.map((c, i) => (
                      <li key={c.id}>
                        <button
                          onClick={() => {
                            setChapterIdx(i);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={cn(
                            "w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all group",
                            i === chapterIdx
                              ? "bg-white shadow-sm ring-1 ring-slate-200"
                              : "hover:bg-white/70",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 transition",
                              i < chapterIdx
                                ? "bg-emerald-500 text-white"
                                : i === chapterIdx
                                  ? "bg-slate-900 text-white"
                                  : "bg-slate-200 text-slate-500",
                            )}
                          >
                            {i < chapterIdx ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                          </span>
                          <span
                            className={cn(
                              "text-[13px] leading-snug font-medium",
                              i === chapterIdx ? "text-slate-900" : "text-slate-500",
                            )}
                          >
                            {c.title}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>

                <RewardTracker
                  benefits={benefits}
                  progressPct={progressPct}
                  remaining={remaining}
                />
              </div>
            </aside>

            {/* Article */}
            <main>
              <div key={currentChapter.id} className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                <ChapterView chapter={currentChapter} readMinutes={readMinutes} />
              </div>

              {/* Encouragement */}
              <div className="mt-14 rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-white p-6 sm:p-7 flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-400/20 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-amber-700" />
                </div>
                <div className="space-y-1">
                  <p className="font-editorial font-semibold text-lg text-slate-900 leading-tight">
                    {remaining === 0
                      ? "Você chegou ao último capítulo"
                      : `Faltam ${remaining} ${remaining === 1 ? "capítulo" : "capítulos"} para liberar seus bônus`}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Aula completa em vídeo, artes editáveis no Canva, mensagens prontas para
                    contratantes e teste grátis do sistema — tudo liberado no fim da leitura.
                  </p>
                </div>
              </div>

              {/* Chapter dots (mobile) */}
              <div className="mt-10 flex items-center justify-center gap-2 lg:hidden">
                {CHAPTERS.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setChapterIdx(i)}
                    aria-label={`Ir para capítulo ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === chapterIdx
                        ? "w-8 bg-slate-900"
                        : i < chapterIdx
                          ? "w-1.5 bg-emerald-500"
                          : "w-1.5 bg-slate-300",
                    )}
                  />
                ))}
              </div>

              {/* Desktop nav */}
              <div className="mt-10 hidden lg:flex items-center justify-between gap-4">
                <button
                  onClick={goPrev}
                  disabled={chapterIdx === 0}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition",
                    chapterIdx === 0
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white",
                  )}
                >
                  <ArrowLeft className="w-4 h-4" /> Anterior
                </button>
                <NextButton
                  isLast={chapterIdx === totalChapters - 1}
                  onClick={goNext}
                />
              </div>
            </main>
          </div>

          {/* Mobile sticky nav */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-4 py-3 flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={chapterIdx === 0}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition",
                chapterIdx === 0
                  ? "text-slate-300"
                  : "text-slate-700 bg-slate-100 hover:bg-slate-200",
              )}
              aria-label="Capítulo anterior"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <NextButton
              isLast={chapterIdx === totalChapters - 1}
              onClick={goNext}
              full
            />
          </div>
        </div>
      )}

      {/* ── UNLOCKED VIEW ── */}
      {isLeadRegistered && view === "unlocked" && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-14">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 sm:px-12 py-12 sm:py-16 text-center shadow-[0_24px_70px_-40px_rgba(15,23,42,0.35)]">
            <div className="absolute inset-x-0 -top-24 h-56 bg-[radial-gradient(closest-side,rgba(251,191,36,0.22),transparent)]" />
            <div className="relative space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-bold">
                Leitura concluída
              </p>
              <h1 className="font-editorial text-3xl sm:text-5xl font-semibold tracking-tight leading-[1.05] text-slate-900">
                Seus 4 bônus estão
                <br className="hidden sm:block" />{" "}
                <span className="italic bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                  liberados
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
                Você terminou o Manual do Artista Contratado. Agora é hora de aplicar — comece pelo
                bônus que resolve sua maior dor hoje.
              </p>
              <button
                onClick={() => {
                  setChapterIdx(0);
                  setView("reading");
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
              >
                <BookOpen className="w-4 h-4" /> Revisar o material escrito
              </button>
            </div>
          </section>

          {/* Benefits grid */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                Suas recompensas
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {benefits.map((b, i) => (
                <BenefitCard key={b.id} benefit={b} index={i + 1} />
              ))}
            </div>
          </section>

          {/* Video anchor */}
          <section id="video-anchor" className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-slate-400 font-bold">
                  Aula em vídeo
                </p>
                <h2 className="font-editorial font-semibold text-lg sm:text-xl text-slate-900">
                  Manual do Artista — versão completa
                </h2>
              </div>
            </div>
            <div className="rounded-[1.75rem] overflow-hidden border border-slate-200 bg-slate-950 shadow-xl">
              <div className="flex justify-center py-6 px-4">
                <div className="relative w-full max-w-[420px] aspect-[9/16] rounded-2xl overflow-hidden ring-1 ring-white/10">
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
          <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 sm:p-14 text-center space-y-5">
            <div className="absolute inset-x-0 -top-20 h-52 bg-[radial-gradient(closest-side,rgba(59,130,246,0.35),transparent)]" />
            <div className="relative space-y-5">
              <Star className="w-8 h-8 text-amber-300 mx-auto" />
              <h3 className="font-editorial text-2xl sm:text-4xl font-semibold text-white leading-tight">
                Leve tudo isso para o próximo nível
              </h3>
              <p className="text-slate-300 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
                O Backstage Pro é o sistema onde artistas profissionais aplicam esse manual todo dia —
                agenda, contratos, financeiro e link da bio em um único lugar.
              </p>
              <button
                onClick={() => (window.location.href = "https://backstagepro.online/landing")}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm sm:text-base px-7 sm:px-9 py-4 rounded-xl transition-all hover:shadow-2xl hover:-translate-y-0.5"
              >
                Testar o Backstage Pro grátis
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
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
// Next button
// ─────────────────────────────────────────────────────────────────────────────
function NextButton({
  isLast,
  onClick,
  full,
}: {
  isLast: boolean;
  onClick: () => void;
  full?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 font-bold text-sm sm:text-base px-6 sm:px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 overflow-hidden",
        full ? "flex-1" : "",
        isLast
          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25"
          : "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/15",
      )}
    >
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <span className="relative inline-flex items-center gap-2">
        {isLast ? (
          <>
            Concluir e liberar bônus
            <Sparkles className="w-4 h-4" />
          </>
        ) : (
          <>
            Continuar leitura
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Reward tracker (rail)
// ─────────────────────────────────────────────────────────────────────────────
function RewardTracker({
  benefits,
  progressPct,
  remaining,
}: {
  benefits: Benefit[];
  progressPct: number;
  remaining: number;
}) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
            <circle cx="32" cy="32" r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              stroke="url(#rewardGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - (c * progressPct) / 100}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="rewardGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-slate-800">
            {progressPct}%
          </span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Prêmio final
          </p>
          <p className="font-editorial font-semibold text-slate-900 leading-tight">
            4 bônus liberados no fim
          </p>
        </div>
      </div>

      <ul className="space-y-2 pt-1">
        {benefits.map((b) => {
          const Icon = b.icon;
          const done = remaining === 0;
          return (
            <li
              key={b.id}
              className={cn(
                "flex items-center gap-2.5 text-[12px] font-medium transition",
                done ? "text-slate-800" : "text-slate-400",
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  done ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400",
                )}
              >
                {done ? <Icon className="w-3.5 h-3.5" /> : <Lock className="w-3 h-3" />}
              </span>
              <span className="leading-tight">{b.title}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chapter view
// ─────────────────────────────────────────────────────────────────────────────
function ChapterView({ chapter, readMinutes }: { chapter: Chapter; readMinutes: number }) {
  const Icon = chapter.icon;
  const accentBg: Record<string, string> = {
    rose: "bg-rose-50 text-rose-700 ring-rose-200/70",
    blue: "bg-blue-50 text-blue-700 ring-blue-200/70",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    violet: "bg-violet-50 text-violet-700 ring-violet-200/70",
    amber: "bg-amber-50 text-amber-700 ring-amber-200/70",
  };

  let firstParagraph = true;

  return (
    <article className="max-w-[680px]">
      {/* Chapter header */}
      <header className="space-y-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ring-1",
              accentBg[chapter.accent] || "bg-slate-50 text-slate-700 ring-slate-200",
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {chapter.eyebrow}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <Clock className="w-3 h-3" /> {readMinutes} min de leitura
          </span>
        </div>
        <h1 className="font-editorial text-[2rem] sm:text-[3.1rem] font-semibold tracking-tight leading-[1.03] text-slate-900">
          {chapter.title}
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 leading-relaxed font-light">
          {chapter.intro}
        </p>
      </header>

      {/* Divider */}
      <div className="my-9 flex items-center gap-3">
        <span className="h-px flex-1 bg-slate-200" />
        <Music className="w-3.5 h-3.5 text-slate-300" />
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Blocks */}
      <div className="space-y-7">
        {chapter.blocks.map((block, i) => {
          const isLead = block.type === "p" && firstParagraph;
          if (isLead) firstParagraph = false;
          return <BlockRenderer key={i} block={block} accent={chapter.accent} lead={isLead} />;
        })}
      </div>
    </article>
  );
}

function BlockRenderer({
  block,
  accent,
  lead,
}: {
  block: Block;
  accent: string;
  lead?: boolean;
}) {
  switch (block.type) {
    case "p":
      return (
        <p
          className={cn(
            "text-[1.06rem] sm:text-[1.15rem] text-slate-700 leading-[1.75]",
            lead && "kit-prose-first text-slate-800",
          )}
        >
          {block.text}
        </p>
      );
    case "h":
      return (
        <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-slate-900 pt-5 tracking-tight leading-tight">
          {block.text}
        </h2>
      );
    case "quote":
      return (
        <blockquote className="relative rounded-[1.5rem] bg-white ring-1 ring-slate-200 px-7 py-7 shadow-sm">
          <Quote className="absolute -top-3 left-6 w-8 h-8 text-slate-900 bg-white rounded-full p-1.5 ring-1 ring-slate-200" />
          <p className="font-editorial text-xl sm:text-2xl italic font-medium text-slate-900 leading-snug">
            “{block.text}”
          </p>
          {block.author && (
            <p className="text-[11px] text-slate-400 mt-3 uppercase tracking-[0.2em] font-bold">
              — {block.author}
            </p>
          )}
        </blockquote>
      );
    case "tip":
      return (
        <div className="rounded-[1.5rem] border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-6 flex gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-1.5">
            <p className="font-bold text-emerald-900 text-sm uppercase tracking-wide">
              {block.title}
            </p>
            <p className="text-emerald-900/80 text-[15px] sm:text-base leading-relaxed">
              {block.text}
            </p>
          </div>
        </div>
      );
    case "warn":
      return (
        <div className="rounded-[1.5rem] border border-rose-200/80 bg-gradient-to-br from-rose-50 to-white p-6 flex gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-1.5">
            <p className="font-bold text-rose-900 text-sm uppercase tracking-wide">{block.title}</p>
            <p className="text-rose-900/80 text-[15px] sm:text-base leading-relaxed">
              {block.text}
            </p>
          </div>
        </div>
      );
    case "list":
      return (
        <ul className="space-y-3.5">
          {block.items.map((it, i) => (
            <li
              key={i}
              className="group flex gap-4 items-start text-[1.02rem] sm:text-[1.08rem] text-slate-700 leading-relaxed rounded-2xl bg-white/70 ring-1 ring-slate-200/70 px-4 py-3.5 transition hover:bg-white hover:ring-slate-300"
            >
              <span className="font-editorial w-7 h-7 rounded-full bg-slate-900 text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "stat":
      return (
        <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 text-white p-8 sm:p-10 text-center">
          <div className="absolute inset-x-0 -top-16 h-40 bg-[radial-gradient(closest-side,rgba(59,130,246,0.35),transparent)]" />
          <div className="relative">
            <p className="font-editorial text-5xl sm:text-7xl font-semibold bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent leading-none">
              {block.value}
            </p>
            <p className="text-sm sm:text-base text-slate-300 mt-4 font-medium max-w-md mx-auto leading-relaxed">
              {block.label}
            </p>
          </div>
        </div>
      );
    case "compare":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-[1.4rem] bg-white ring-1 ring-rose-200 p-5 space-y-2.5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" /> Errado
            </p>
            <p className="text-[15px] text-slate-600 leading-relaxed italic">{block.wrong}</p>
          </div>
          <div className="rounded-[1.4rem] bg-white ring-1 ring-emerald-200 p-5 space-y-2.5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> Certo
            </p>
            <p className="text-[15px] text-slate-700 leading-relaxed italic">{block.right}</p>
          </div>
        </div>
      );
    case "gap":
      return (
        <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 text-white p-7 sm:p-9 space-y-5 shadow-xl">
          <div className="absolute inset-x-0 -top-16 h-40 bg-[radial-gradient(closest-side,rgba(16,185,129,0.28),transparent)]" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <PuzzleIcon className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-300">
                Backstage Pro
              </p>
              <p className="font-editorial font-semibold text-lg leading-tight">{block.title}</p>
            </div>
          </div>
          <p className="relative text-slate-300 text-[15px] sm:text-base leading-relaxed">
            {block.text}
          </p>
          <ul className="relative space-y-2.5">
            {block.items.map((it, i) => (
              <li key={i} className="flex gap-3 items-start text-[15px] sm:text-base text-white/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Benefit card
// ─────────────────────────────────────────────────────────────────────────────
function BenefitCard({ benefit, index }: { benefit: Benefit; index?: number }) {
  const Icon = benefit.icon;
  const accents: Record<string, { bg: string; text: string; ring: string; btn: string }> = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      ring: "hover:ring-blue-300",
      btn: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      ring: "hover:ring-emerald-300",
      btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    violet: {
      bg: "bg-violet-50",
      text: "text-violet-700",
      ring: "hover:ring-violet-300",
      btn: "bg-violet-600 hover:bg-violet-700 text-white",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      ring: "hover:ring-amber-300",
      btn: "bg-amber-600 hover:bg-amber-700 text-white",
    },
  };
  const a = accents[benefit.accent] || accents.blue;

  return (
    <div
      className={cn(
        "group relative rounded-[1.6rem] bg-white ring-1 ring-slate-200 p-6 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
        a.ring,
      )}
    >
      {index && (
        <span className="font-editorial absolute top-5 right-6 text-3xl font-semibold text-slate-100 group-hover:text-slate-200 transition">
          0{index}
        </span>
      )}
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", a.bg)}>
        <Icon className={cn("w-6 h-6", a.text)} />
      </div>
      <h3 className="font-editorial font-semibold text-slate-900 text-lg leading-tight">
        {benefit.title}
      </h3>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed flex-1">{benefit.description}</p>
      <button
        onClick={benefit.action}
        className={cn(
          "mt-5 inline-flex items-center justify-center gap-1.5 font-bold text-sm px-5 py-3 rounded-xl transition-all",
          a.btn,
        )}
      >
        {benefit.cta}
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-md px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-md rounded-[2rem] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 ring-1 ring-slate-200 my-auto">
        {/* Top */}
        <div className="relative p-8 pb-6 text-center border-b border-slate-100 overflow-hidden">
          <div className="absolute inset-x-0 -top-20 h-44 bg-[radial-gradient(closest-side,rgba(37,99,235,0.16),transparent)]" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold mb-2">
              Manual do Artista Contratado
            </p>
            <h2 className="font-editorial text-2xl sm:text-[1.7rem] font-semibold text-slate-900 leading-tight">
              O material que organiza sua carreira
            </h2>
            <p className="text-sm text-slate-500 mt-2.5 leading-relaxed">
              7 capítulos práticos. No fim da leitura você libera{" "}
              <strong className="text-slate-700">4 bônus gratuitos</strong>.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {["Aula em vídeo", "Artes no Canva", "Mensagens prontas", "Teste grátis"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 ring-1 ring-amber-200/70 px-2.5 py-1 rounded-full"
                >
                  <Gift className="w-2.5 h-2.5" /> {t}
                </span>
              ))}
            </div>
          </div>
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
            {props.submitting ? "Liberando acesso..." : "Começar a leitura grátis"}
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

