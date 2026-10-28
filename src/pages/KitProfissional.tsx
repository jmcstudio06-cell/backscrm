import { useState, useEffect, useMemo, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/metaPixel";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock,
  DollarSign,
  Gift,
  Handshake,
  Lightbulb,
  Loader2,
  Lock,
  MessageSquare,
  Music,
  Palette,
  Phone,
  PlayCircle,
  Puzzle,
  Quote,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  User,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { insertGuideLeadWithFallback } from "@/lib/guide-leads";
import {
  loadManualProgress,
  saveManualProgress,
  type ManualInteractions,
} from "@/lib/manual-progress";
import { CHAPTER_INTERACTIONS, isInteractionAnswered } from "@/lib/manual-interactions";
import { ChapterInteraction } from "@/components/kit/ChapterInteraction";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import "@/styles/kit.css";
import { Input } from "@/components/ui/input";

import baIcon from "@/assets/ba-icon.png";


const LEAD_STORAGE_KEY = "kit_profissional_lead";
const MATERIAL_COMPLETED_KEY = "manual_artista_video_completed"; // reused for backward compat
const YT_VIDEO_ID = "xKQ8Dajx7x4";
// Destino oficial de cadastro gratuito no app da Backstage Pro.
const SIGNUP_URL = "https://backstageproapp.com/kit-profissional";

// ─────────────────────────────────────────────────────────────────────────────
// CONTEÚDO DO CURSO — aulas escritas e interativas
// ─────────────────────────────────────────────────────────────────────────────
type Chapter = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  icon: LucideIcon;
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
    eyebrow: "Aula 1",
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
        text: "Cada dica deste curso funciona uma vez na força de vontade. Repetida 30 vezes por mês, ela só se sustenta dentro de um sistema. É esse o buraco que o Backstage Pro fecha.",
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
    eyebrow: "Aula 2",
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
    eyebrow: "Aula 3",
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
    eyebrow: "Aula 4",
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
    eyebrow: "Aula 5",
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
    eyebrow: "Aula 6",
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
    eyebrow: "Aula 7",
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
        title: "Você concluiu o mini-curso 🎓",
        text: "Você tem agora a visão completa: primeiro contato, precificação, contrato, rotina, dinheiro e pós-show. Repare que toda aula terminava no mesmo ponto — a técnica só se sustenta com estrutura. Na próxima tela, o vídeo completo e todos os bônus foram desbloqueados.",
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
  icon: LucideIcon;
  /** Formato do recurso, exibido no card (ex.: "Vídeo no YouTube"). */
  format?: string;
  cta: string;
  action: () => void;
  accent: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
type View = "intro" | "reading" | "unlocked";

/** Índice do primeiro capítulo ainda não concluído (ou o último, se todos foram). */
function lastReachableIndex(values: ManualInteractions): number {
  const idx = CHAPTERS.findIndex((c) => values[`done:${c.id}`] !== true);
  return idx === -1 ? CHAPTERS.length - 1 : idx;
}

export default function KitProfissional() {
  const navigate = useNavigate();
  const [isLeadRegistered, setIsLeadRegistered] = useState(false);
  const [view, setView] = useState<View>("intro");
  const [chapterIdx, setChapterIdx] = useState(0);

  // telefone (chave do lead) usado para persistir o progresso
  const [leadPhone, setLeadPhone] = useState("");
  // respostas das interações dos capítulos (persistidas)
  const [interactions, setInteractions] = useState<ManualInteractions>({});
  const [progressLoaded, setProgressLoaded] = useState(false);

  // form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Restaura o lead salvo e, a partir do telefone, carrega o progresso do Supabase
  // (com fallback para localStorage) para continuar de onde o artista parou.
  useEffect(() => {
    trackEvent("ViewContent", { content_name: "manual_open" });
    let active = true;
    const raw = localStorage.getItem(LEAD_STORAGE_KEY);
    if (!raw) {
      setProgressLoaded(true);
      return;
    }
    setIsLeadRegistered(true);
    let savedPhone = "";
    try {
      savedPhone = String(JSON.parse(raw)?.phone ?? "").replace(/\D/g, "");
    } catch {
      savedPhone = "";
    }
    setLeadPhone(savedPhone);

    if (!savedPhone) {
      setProgressLoaded(true);
      return;
    }

    loadManualProgress(savedPhone).then((p) => {
      if (!active) return;
      // Nunca reabre além do primeiro capítulo pendente (progresso salvo antes das travas).
      setChapterIdx(Math.min(p.chapterIndex, lastReachableIndex(p.interactions)));
      setInteractions(p.interactions);
      // Quem já concluiu volta direto para a área de bônus; os demais continuam lendo.
      setView(p.completed ? "unlocked" : "reading");
      setProgressLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);


  const totalChapters = CHAPTERS.length;
  const currentChapter = CHAPTERS[chapterIdx];
  // Progresso real: um capítulo só conta como concluído quando o artista
  // chega ao final dele e confirma em "Concluir capítulo" (chave done:<id>).
  const doneCount = CHAPTERS.filter((c) => interactions[`done:${c.id}`] === true).length;
  const progressPct = Math.round((doneCount / totalChapters) * 100);

  // Persiste o progresso sempre que o capítulo atual ou as interações mudam.
  const persist = useCallback(
    (patch: { chapterIndex?: number; completed?: boolean; interactions?: ManualInteractions }) => {
      if (!leadPhone) return;
      saveManualProgress(leadPhone, {
        chapterIndex: patch.chapterIndex ?? chapterIdx,
        completed: patch.completed ?? view === "unlocked",
        interactions: patch.interactions ?? interactions,
      });
    },
    [leadPhone, chapterIdx, view, interactions],
  );

  const handleInteractionChange = useCallback(
    (key: string, value: string | boolean | number) => {
      setInteractions((prev) => {
        // Registra só o fato de ter respondido (nunca a resposta) para medir engajamento.
        if (prev[key] === undefined && !key.startsWith("done:")) {
          trackEvent("ViewContent", { content_name: `manual_activity_${key.split(":")[0]}` });
        }
        const next = { ...prev, [key]: value };
        persist({ interactions: next });
        return next;
      });
    },
    [persist],
  );

  const benefits: Benefit[] = useMemo(
    () => [
      {
        id: "video",
        title: "Aula completa em vídeo",
        description:
          "Assista à versão em vídeo do Manual do Artista Contratado, com exemplos reais.",
        icon: PlayCircle,
        format: "Vídeo no YouTube",
        cta: "Assistir agora",
        action: () => {
          trackEvent("ViewContent", { content_name: "manual_bonus_video" });
          document.getElementById("video-anchor")?.scrollIntoView({ behavior: "smooth" });
        },
        accent: "blue",
      },
      {
        id: "trial",
        title: "Teste gratuito da Backstage Pro",
        description:
          "Organize sua carreira em um só lugar: agenda, clientes, orçamentos, contratos, financeiro e o Backs Radar para encontrar novos contratantes.",
        icon: Rocket,
        format: "Cadastro gratuito · abre em nova aba",
        cta: "Criar minha conta grátis",
        action: () => {
          trackEvent("ViewContent", { content_name: "manual_bonus_trial" });
          trackEvent("Lead", { content_name: "manual_signup_click" });
          window.open(SIGNUP_URL, "_blank", "noopener,noreferrer");
        },
        accent: "emerald",
      },
      {
        id: "artes",
        title: "Artes editáveis grátis",
        description:
          "Divulgue seus shows com arte profissional. Templates prontos no Canva, é só editar.",
        icon: Palette,
        format: "Modelos editáveis no Canva",
        cta: "Abrir artes",
        action: () => {
          trackEvent("ViewContent", { content_name: "manual_bonus_artes" });
          navigate("/kit-profissional/artes");
        },
        accent: "violet",
      },
      {
        id: "mensagens",
        title: "Mensagens prontas para contratantes",
        description:
          "Textos copy-paste para primeiro contato, envio de orçamento, fechamento e pós-show.",
        icon: MessageSquare,
        format: "Textos prontos para copiar",
        cta: "Abrir mensagens",
        action: () => {
          trackEvent("ViewContent", { content_name: "manual_bonus_mensagens" });
          navigate("/kit-profissional/mensagens");
        },
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

    setSubmitting(true);
    try {
      const leadData = {
        name: trimmed,
        phone: digits,
        source: "kit_profissional",
      };
      await insertGuideLeadWithFallback(leadData);
      trackEvent("Lead", { content_name: "kit_profissional" });
      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leadData));
      localStorage.setItem("guia_lead_captured", "true");
      setLeadPhone(digits);
      setIsLeadRegistered(true);
      setView("reading");
      window.scrollTo({ top: 0, behavior: "smooth" });
      trackEvent("ViewContent", { content_name: "manual_chapter_1" });
      // semeia o progresso inicial vinculado ao telefone recém-capturado
      saveManualProgress(digits, { chapterIndex: 0, completed: false, interactions: {} });
      toast.success("Você está dentro! A aula 1 já está liberada.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  // Aulas só abrem em ordem: até a primeira ainda não concluída.
  const maxReachable = lastReachableIndex(interactions);
  const currentActivities = CHAPTER_INTERACTIONS[currentChapter.id] ?? [];
  const pendingActivities = currentActivities.filter(
    (a) => !isInteractionAnswered(a, interactions),
  );
  const canComplete = pendingActivities.length === 0;
  const answeredCount = currentActivities.length - pendingActivities.length;

  const goToChapter = (i: number) => {
    const clamped = Math.max(0, Math.min(i, totalChapters - 1));
    if (clamped > maxReachable) {
      toast("Conclua as aulas em ordem", {
        description: `Responda as atividades da aula ${maxReachable + 1} para liberar a próxima.`,
      });
      return;
    }
    setChapterIdx(clamped);
    persist({ chapterIndex: clamped });
    trackEvent("ViewContent", { content_name: `manual_chapter_${clamped + 1}` });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    if (!canComplete) {
      // Leva o artista até a primeira atividade que falta responder.
      const first = pendingActivities[0];
      document
        .getElementById(`kp-act-${first.key}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast("Responda para continuar", {
        description:
          pendingActivities.length === 1
            ? "Falta 1 atividade nesta aula."
            : `Faltam ${pendingActivities.length} atividades nesta aula.`,
      });
      return;
    }
    trackEvent("ViewContent", { content_name: `manual_chapter_${chapterIdx + 1}_complete` });
    // Marca o capítulo atual como concluído e persiste numa única escrita,
    // para que a navegação não sobrescreva o registro com dados antigos.
    const nextInteractions = { ...interactions, [`done:${currentChapter.id}`]: true };
    setInteractions(nextInteractions);

    if (chapterIdx < totalChapters - 1) {
      const nextIdx = chapterIdx + 1;
      setChapterIdx(nextIdx);
      persist({ chapterIndex: nextIdx, interactions: nextInteractions });
      trackEvent("ViewContent", { content_name: `manual_chapter_${nextIdx + 1}` });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // último capítulo → conclui e libera os bônus
      localStorage.setItem(MATERIAL_COMPLETED_KEY, "true");
      setView("unlocked");
      persist({ completed: true, interactions: nextInteractions });
      trackEvent("ViewContent", { content_name: "manual_completed" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Bônus liberados");
    }
  };

  const goPrev = () => {
    if (chapterIdx > 0) goToChapter(chapterIdx - 1);
  };

  const remaining = totalChapters - doneCount;
  const readMinutes = useMemo(() => minutesFor(currentChapter), [currentChapter]);


  const isDone = (id: string) => interactions[`done:${id}`] === true;
  const isReading = isLeadRegistered && progressLoaded && view !== "unlocked";
  const isUnlocked = isLeadRegistered && progressLoaded && view === "unlocked";

  const openSignup = () => {
    trackEvent("Lead", { content_name: "manual_signup_click" });
    window.open(SIGNUP_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={cn("kit-page", isReading && "has-dock")}>
      <Helmet>
        <title>Mini-curso Manual do Artista Contratado | Backstage Pro</title>
        <meta
          name="description"
          content="Mini-curso gratuito com 7 aulas curtas para aprender a conquistar mais shows, valorizar seu trabalho e profissionalizar sua carreira musical. Inclui 4 bônus."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap"
        />
      </Helmet>

      {/* ── HEADER ── */}
      <header className="kp-header">
        <div className="kp-container kp-header-row">
          <div className="kp-brand">
            <img src={baIcon} alt="" width={36} height={36} />
            <span>
              <strong>Backstage Pro</strong>
              <small>Mini-curso gratuito</small>
            </span>
          </div>

          {isReading && (
            <span className="kp-header-chip">
              <BookOpen aria-hidden="true" />
              Aula {chapterIdx + 1} de {totalChapters}
            </span>
          )}
          {isUnlocked && (
            <span className="kp-header-chip is-done">
              <Trophy aria-hidden="true" /> Curso concluído
            </span>
          )}
          {!isLeadRegistered && (
            <span className="kp-header-chip">
              <Gift aria-hidden="true" /> 100% gratuito
            </span>
          )}
        </div>
        {isReading && (
          <div
            className="kp-header-bar"
            role="progressbar"
            aria-label="Progresso do curso"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
          >
            <span style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </header>

      {/* ── ENTRADA + CAPTURA DO LEAD ── */}
      {!isLeadRegistered && (
        <IntroView
          totalChapters={totalChapters}
          name={name}
          phone={phone}
          submitting={submitting}
          setName={setName}
          setPhone={(v) => setPhone(formatPhone(v))}
          onSubmit={handleSubmitLead}
        />
      )}

      {/* ── CARREGANDO PROGRESSO ── */}
      {isLeadRegistered && !progressLoaded && (
        <div className="kp-loading" role="status">
          <Loader2 className="kp-spin" aria-hidden="true" />
          <p>Carregando seu progresso…</p>
        </div>
      )}

      {/* ── LEITURA ── */}
      {isReading && (
        <>
          <div className="kp-container kp-reader">
            <aside className="kp-toc" aria-label="Aulas do curso">
              <p className="kp-toc-label">Conteúdo do curso</p>
              <ol>
                {CHAPTERS.map((c, i) => {
                  const done = isDone(c.id);
                  const active = i === chapterIdx;
                  const locked = i > maxReachable;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => goToChapter(i)}
                        aria-current={active ? "step" : undefined}
                        aria-disabled={locked || undefined}
                        className={cn(
                          "kp-toc-item",
                          active && "is-active",
                          done && "is-done",
                          locked && "is-locked",
                        )}
                      >
                        <span className="kp-toc-num" aria-hidden="true">
                          {done ? <Check /> : locked ? <Lock /> : i + 1}
                        </span>
                        <span className="kp-toc-title">
                          <small className="kp-toc-meta">
                            Aula {i + 1} · {minutesFor(c)} min
                          </small>
                          {c.title}
                          {done && <span className="sr-only"> (concluído)</span>}
                          {locked && <span className="sr-only"> (bloqueado)</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="kp-toc-progress">
                <div className="kp-toc-progress-top">
                  <span>Seu progresso</span>
                  <strong>
                    {doneCount}/{totalChapters}
                  </strong>
                </div>
                <div className="kp-bar" aria-hidden="true">
                  <span style={{ width: `${progressPct}%` }} />
                </div>
                <p>
                  {remaining === 0
                    ? "Todas as aulas concluídas."
                    : `Conclua ${remaining} ${remaining === 1 ? "aula" : "aulas"} para liberar os 4 bônus.`}
                </p>
              </div>
            </aside>

            <main className="kp-main">
              <nav className="kp-pills" aria-label="Aulas">
                {CHAPTERS.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => goToChapter(i)}
                    aria-label={`Aula ${i + 1}: ${c.title}${isDone(c.id) ? " (concluído)" : i > maxReachable ? " (bloqueado)" : ""}`}
                    aria-current={i === chapterIdx ? "step" : undefined}
                    aria-disabled={i > maxReachable || undefined}
                    className={cn(
                      "kp-pill",
                      i === chapterIdx && "is-active",
                      isDone(c.id) && "is-done",
                      i > maxReachable && "is-locked",
                    )}
                  >
                    {isDone(c.id) && i !== chapterIdx ? (
                      <Check aria-hidden="true" />
                    ) : i > maxReachable ? (
                      <Lock aria-hidden="true" />
                    ) : (
                      i + 1
                    )}
                  </button>
                ))}
              </nav>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentChapter.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ChapterView
                    chapter={currentChapter}
                    index={chapterIdx}
                    total={totalChapters}
                    readMinutes={readMinutes}
                    interactions={interactions}
                    onInteractionChange={handleInteractionChange}
                  />
                </motion.div>
              </AnimatePresence>

              <div className="kp-end">
                <div className={cn("kp-end-card", canComplete ? "is-ready" : "is-pending")} aria-live="polite">
                  <span className="kp-icon-tile">{canComplete ? <Check /> : <Lock />}</span>
                  <div>
                    <strong>
                      {canComplete
                        ? chapterIdx === totalChapters - 1
                          ? "Tudo respondido. Conclua para liberar seus bônus."
                          : `Tudo respondido. Próxima aula: ${CHAPTERS[chapterIdx + 1].title}`
                        : `Responda as atividades para continuar (${answeredCount} de ${currentActivities.length})`}
                    </strong>
                    <div className="kp-bar kp-end-bar" aria-hidden="true">
                      <span
                        style={{
                          width: `${currentActivities.length ? (answeredCount / currentActivities.length) * 100 : 100}%`,
                        }}
                      />
                    </div>
                    <p>
                      {canComplete
                        ? "No final: aula em vídeo, teste gratuito da Backstage Pro, artes no Canva e mensagens prontas para contratantes."
                        : "As atividades ajudam a aplicar a aula na sua carreira. Suas respostas não são compartilhadas."}
                    </p>
                  </div>
                </div>

                <div className="kp-nav">
                  <button
                    type="button"
                    className="kp-btn kp-btn-ghost"
                    onClick={goPrev}
                    disabled={chapterIdx === 0}
                  >
                    <ArrowLeft className="kp-flip" /> Anterior
                  </button>
                  <NextChapterButton
                    canComplete={canComplete}
                    isLast={chapterIdx === totalChapters - 1}
                    pending={pendingActivities.length}
                    onClick={goNext}
                  />
                </div>
              </div>
            </main>
          </div>

          {/* Navegação fixa no celular */}
          <nav className="kp-dock" aria-label="Navegação entre aulas">
            <button
              type="button"
              className="kp-btn kp-btn-ghost kp-dock-prev"
              onClick={goPrev}
              disabled={chapterIdx === 0}
              aria-label="Aula anterior"
            >
              <ArrowLeft className="kp-flip" />
            </button>
            <NextChapterButton
              canComplete={canComplete}
              isLast={chapterIdx === totalChapters - 1}
              pending={pendingActivities.length}
              onClick={goNext}
              compact
            />
          </nav>
        </>
      )}

      {/* ── CONCLUSÃO + BÔNUS ── */}
      {isUnlocked && (
        <main>
          <section className="kp-done-hero" aria-labelledby="kp-done-title">
            <div className="kp-grid-bg is-dark" aria-hidden="true" />
            <span className="kp-glow kp-glow-blue" style={{ width: 380, height: 380, top: -140, left: -120 }} aria-hidden="true" />
            <span className="kp-glow kp-glow-cyan" style={{ width: 380, height: 380, bottom: -160, right: -100 }} aria-hidden="true" />
            <motion.div
              className="kp-container kp-done-inner"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="kp-done-icon" aria-hidden="true">
                <Trophy />
              </span>
              <span className="kp-eyebrow is-dark">
                <span className="kp-eyebrow-dot" /> Curso concluído
              </span>
              <h1 id="kp-done-title">
                Você concluiu o mini-curso
                <span className="kp-text-gradient">Manual do Artista Contratado!</span>
              </h1>
              <p>
                Agora você tem mais clareza sobre como abordar contratantes, valorizar seu trabalho,
                organizar negociações e construir uma rotina profissional. O próximo passo é colocar
                esses conhecimentos em prática.
              </p>
              <div className="kp-done-actions">
                <button type="button" className="kp-btn kp-btn-primary" onClick={openSignup}>
                  Conhecer a Backstage Pro gratuitamente <ArrowRight />
                </button>
                <button
                  type="button"
                  className="kp-btn kp-btn-dark"
                  onClick={() => {
                    setView("reading");
                    goToChapter(0);
                  }}
                >
                  <BookOpen /> Rever as aulas
                </button>
              </div>
              <p className="kp-done-note">
                A Backstage Pro reúne agenda, clientes, orçamentos, contratos, financeiro e o Backs
                Radar em uma única plataforma. Abre em uma nova aba.
              </p>
            </motion.div>
          </section>

          <section className="kp-section" aria-labelledby="kp-bonus-title">
            <div className="kp-container">
              <div className="kp-heading">
                <span className="kp-eyebrow">
                  <Gift /> Seus bônus
                </span>
                <h2 id="kp-bonus-title">
                  4 recursos para
                  <span className="kp-text-gradient"> aplicar o que aprendeu.</span>
                </h2>
                <p>Comece pelo que resolve a sua maior necessidade hoje.</p>
              </div>
              <div className="kp-bonus-grid">
                {benefits.map((b, i) => (
                  <BenefitCard key={b.id} benefit={b} index={i + 1} />
                ))}
              </div>
            </div>
          </section>

          <section id="video-anchor" className="kp-section kp-section-soft" aria-labelledby="kp-video-title">
            <div className="kp-container">
              <div className="kp-heading">
                <span className="kp-eyebrow">
                  <PlayCircle /> Bônus 1 · Aula em vídeo
                </span>
                <h2 id="kp-video-title">
                  O manual completo,
                  <span className="kp-text-gradient"> em vídeo.</span>
                </h2>
              </div>
              <div className="kp-video">
                <iframe
                  src={`https://www.youtube.com/embed/${YT_VIDEO_ID}?rel=0&modestbranding=1&playsinline=1`}
                  title="Aula em vídeo: Manual do Artista Contratado"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>

          <section className="kp-section">
            <div className="kp-container">
              <div className="kp-cta-wrap">
                <div className="kp-cta">
                  <div className="kp-grid-bg is-dark" aria-hidden="true" />
                  <span className="kp-glow kp-glow-blue" style={{ width: 320, height: 320, top: -120, left: -100 }} aria-hidden="true" />
                  <span className="kp-glow kp-glow-cyan" style={{ width: 320, height: 320, bottom: -140, right: -80 }} aria-hidden="true" />
                  <span className="kp-icon-tile kp-cta-icon" aria-hidden="true">
                    <Music />
                  </span>
                  <h2>
                    Agora é hora de
                    <span className="kp-text-gradient"> colocar em prática.</span>
                  </h2>
                  <p>
                    A Backstage Pro pode ajudar você a organizar diferentes áreas da sua carreira em
                    uma única plataforma.
                  </p>
                  <button type="button" className="kp-btn kp-btn-primary" onClick={openSignup}>
                    Conhecer a Backstage Pro gratuitamente <ArrowRight />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      <footer className="kp-footer">
        <div className="kp-container">
          <span>© Backstage Pro®</span>
          <span>Mini-curso Manual do Artista Contratado · gratuito</span>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Botão de concluir: travado até responder as atividades. Continua clicável
// para levar o artista até a atividade que falta (em vez de não fazer nada).
// ─────────────────────────────────────────────────────────────────────────────
function NextChapterButton({
  canComplete,
  isLast,
  pending,
  onClick,
  compact,
}: {
  canComplete: boolean;
  isLast: boolean;
  pending: number;
  onClick: () => void;
  compact?: boolean;
}) {
  if (!canComplete) {
    return (
      <button
        type="button"
        className="kp-btn kp-btn-locked"
        onClick={onClick}
        aria-disabled="true"
        aria-label={`Responda ${pending === 1 ? "1 atividade" : `${pending} atividades`} para continuar`}
      >
        <Lock /> {compact ? `Responda para continuar` : `Responda ${pending === 1 ? "1 atividade" : `${pending} atividades`} para continuar`}
      </button>
    );
  }
  return (
    <button type="button" className="kp-btn kp-btn-primary kp-btn-ready" onClick={onClick}>
      {isLast ? (
        <>
          {compact ? "Liberar bônus" : "Concluir e liberar bônus"} <Sparkles />
        </>
      ) : (
        <>
          Concluir aula <ArrowRight />
        </>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entrada: tela única de inscrição no mini-curso (curta, sem rolagem longa)
// ─────────────────────────────────────────────────────────────────────────────
/** Estimativa de tempo da aula a partir do texto real (≈190 palavras por minuto). */
function minutesFor(chapter: Chapter): number {
  const words = JSON.stringify(chapter.blocks).split(/\s+/).length;
  return Math.max(2, Math.round(words / 190));
}

type IntroProps = {
  totalChapters: number;
  name: string;
  phone: string;
  submitting: boolean;
  setName: (v: string) => void;
  setPhone: (v: string) => void;
  onSubmit: () => void;
};

function IntroView(props: IntroProps) {
  const totalMinutes = useMemo(() => CHAPTERS.reduce((sum, c) => sum + minutesFor(c), 0), []);

  return (
    <main className="kp-enroll" aria-labelledby="kp-title">
      <div className="kp-grid-bg" aria-hidden="true" />
      <span className="kp-glow kp-glow-blue" style={{ width: 420, height: 420, top: -160, left: -160 }} aria-hidden="true" />
      <span className="kp-glow kp-glow-cyan" style={{ width: 420, height: 420, bottom: -200, right: -140 }} aria-hidden="true" />

      <div className="kp-container kp-enroll-grid">
        <div className="kp-enroll-copy">
          <span className="kp-eyebrow">
            <span className="kp-eyebrow-dot" /> Mini-curso gratuito
          </span>
          <h1 id="kp-title">
            Manual do Artista
            <span className="kp-text-gradient">Contratado</span>
          </h1>
          <p className="kp-enroll-lead">
            Aprenda a conquistar mais shows, valorizar seu trabalho e profissionalizar sua carreira
            musical. Aulas curtas, no seu ritmo.
          </p>
          <ul className="kp-enroll-facts">
            <li>
              <BookOpen aria-hidden="true" /> {props.totalChapters} aulas
            </li>
            <li>
              <Clock aria-hidden="true" /> ~{totalMinutes} min
            </li>
            <li>
              <Gift aria-hidden="true" /> 4 bônus
            </li>
          </ul>
        </div>

        <EnrollCard {...props} />

        <section className="kp-lessons" aria-labelledby="kp-lessons-title">
          <h2 id="kp-lessons-title">O que você vai ver</h2>
          <ol>
            {CHAPTERS.map((c, i) => (
              <li key={c.id}>
                <span className="kp-lesson-num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="kp-lesson-title">{c.title}</span>
                <span className="kp-lesson-min">{minutesFor(c)} min</span>
              </li>
            ))}
          </ol>
          <p className="kp-lessons-bonus">
            <Gift aria-hidden="true" />
            <span>
              Ao concluir: 4 bônus (vídeo, teste grátis, artes no Canva e mensagens prontas).
            </span>
          </p>
        </section>
      </div>
    </main>
  );
}

function EnrollCard(props: IntroProps) {
  return (
    <div className="kp-capture" id="kp-capture">
      <form
        className="kp-capture-inner"
        noValidate
        aria-labelledby="kp-capture-title"
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmit();
        }}
      >
        <span className="kp-capture-badge">
          <Sparkles aria-hidden="true" /> 100% gratuito
        </span>
        <h2 id="kp-capture-title">Entre no mini-curso</h2>
        <p>Leva menos de 1 minuto. A primeira aula abre na hora.</p>

        <div className="kp-field">
          <label htmlFor="kp-name">
            <User aria-hidden="true" /> Nome e sobrenome
          </label>
          <Input
            id="kp-name"
            className="kp-input"
            placeholder="Ex.: João Silva"
            autoComplete="name"
            enterKeyHint="next"
            value={props.name}
            onChange={(e) => props.setName(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="kp-field">
          <label htmlFor="kp-phone">
            <Phone aria-hidden="true" /> WhatsApp com DDD
          </label>
          <Input
            id="kp-phone"
            className="kp-input"
            placeholder="(11) 98765-4321"
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="go"
            value={props.phone}
            onChange={(e) => props.setPhone(e.target.value)}
            maxLength={15}
          />
        </div>

        <button type="submit" className="kp-btn kp-btn-primary" disabled={props.submitting}>
          {props.submitting ? (
            <>
              <Loader2 className="kp-spin" /> Abrindo a aula 1…
            </>
          ) : (
            <>
              Quero entrar agora <ArrowRight />
            </>
          )}
        </button>

        <ul className="kp-enroll-perks">
          <li>
            <Check aria-hidden="true" /> Sem cartão
          </li>
          <li>
            <Check aria-hidden="true" /> Pelo celular
          </li>
          <li>
            <Check aria-hidden="true" /> Continue de onde parou
          </li>
        </ul>

        <p className="kp-capture-note">
          <ShieldCheck aria-hidden="true" /> Seus dados ficam protegidos. Não enviamos spam.
        </p>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Capítulo
// ─────────────────────────────────────────────────────────────────────────────
function ChapterView({
  chapter,
  index,
  total,
  readMinutes,
  interactions,
  onInteractionChange,
}: {
  chapter: Chapter;
  index: number;
  total: number;
  readMinutes: number;
  interactions: ManualInteractions;
  onInteractionChange: (key: string, value: string | boolean | number) => void;
}) {
  const Icon = chapter.icon;
  const activities = CHAPTER_INTERACTIONS[chapter.id] ?? [];
  let firstParagraph = true;

  return (
    <article className="kp-article" aria-labelledby={`kp-ch-${chapter.id}`}>
      <header className="kp-chapter-head">
        <div className="kp-chapter-meta">
          <span className="kp-eyebrow">
            <Icon aria-hidden="true" /> Aula {index + 1} de {total}
          </span>
          <span className="kp-readtime">
            <Clock aria-hidden="true" /> {readMinutes} min de leitura
          </span>
        </div>
        <h1 id={`kp-ch-${chapter.id}`}>{chapter.title}</h1>
        <p className="kp-chapter-intro">{chapter.intro}</p>
      </header>

      <div className="kp-blocks">
        {chapter.blocks.map((block, i) => {
          const isLead = block.type === "p" && firstParagraph;
          if (isLead) firstParagraph = false;
          return <BlockRenderer key={i} block={block} lead={isLead} />;
        })}
      </div>

      {activities.length > 0 && (
        <div className="kp-activities">
          <div className="kp-activities-head">
            <span className="kp-eyebrow">
              <Sparkles aria-hidden="true" /> Sua vez
            </span>
            <p>Responda para concluir a aula e liberar a próxima.</p>
          </div>
          {activities.map((activity, i) => (
            <ChapterInteraction
              key={activity.key}
              id={`kp-act-${activity.key}`}
              interaction={activity}
              values={interactions}
              onChange={onInteractionChange}
              step={`Atividade ${i + 1} de ${activities.length}`}
              answered={isInteractionAnswered(activity, interactions)}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function BlockRenderer({ block, lead }: { block: Block; lead?: boolean }) {
  switch (block.type) {
    case "p":
      return <p className={cn("kp-p", lead && "is-lead")}>{block.text}</p>;
    case "h":
      return <h2 className="kp-h2">{block.text}</h2>;
    case "quote":
      return (
        <blockquote className="kp-quote">
          <Quote aria-hidden="true" />
          <p>{block.text}</p>
          {block.author && <cite>— {block.author}</cite>}
        </blockquote>
      );
    case "tip":
      return (
        <aside className="kp-callout is-tip">
          <span className="kp-callout-icon" aria-hidden="true">
            <Lightbulb />
          </span>
          <div>
            <strong>{block.title}</strong>
            <p>{block.text}</p>
          </div>
        </aside>
      );
    case "warn":
      return (
        <aside className="kp-callout is-warn">
          <span className="kp-callout-icon" aria-hidden="true">
            <AlertTriangle />
          </span>
          <div>
            <strong>{block.title}</strong>
            <p>{block.text}</p>
          </div>
        </aside>
      );
    case "list":
      return (
        <ol className="kp-list">
          {block.items.map((it, i) => (
            <li key={i}>
              <span className="kp-list-num" aria-hidden="true">
                {i + 1}
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ol>
      );
    case "stat":
      return (
        <figure className="kp-stat">
          <span className="kp-stat-value">{block.value}</span>
          <figcaption>{block.label}</figcaption>
        </figure>
      );
    case "compare":
      return (
        <div className="kp-compare">
          <div className="kp-compare-card is-wrong">
            <span className="kp-compare-label">
              <X aria-hidden="true" /> Evite
            </span>
            <p>{block.wrong}</p>
          </div>
          <div className="kp-compare-card is-right">
            <span className="kp-compare-label">
              <Check aria-hidden="true" /> Prefira
            </span>
            <p>{block.right}</p>
          </div>
        </div>
      );
    case "gap":
      return (
        <section className="kp-gap" aria-label={block.title}>
          <span className="kp-glow kp-glow-blue" style={{ width: 220, height: 220, top: -90, right: -60 }} aria-hidden="true" />
          <div className="kp-gap-head">
            <span className="kp-icon-tile" aria-hidden="true">
              <Puzzle />
            </span>
            <div>
              <small>Na prática com a Backstage Pro</small>
              <strong>{block.title}</strong>
            </div>
          </div>
          <p>{block.text}</p>
          <ul>
            {block.items.map((it, i) => (
              <li key={i}>
                <span className="kp-check" aria-hidden="true">
                  <Check />
                </span>
                {it}
              </li>
            ))}
          </ul>
        </section>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Card de bônus
// ─────────────────────────────────────────────────────────────────────────────
function BenefitCard({ benefit, index }: { benefit: Benefit; index: number }) {
  const Icon = benefit.icon;
  return (
    <article className="kp-bonus">
      <div className="kp-bonus-top">
        <span className="kp-icon-tile">
          <Icon />
        </span>
        <span className="kp-bonus-num">0{index}</span>
      </div>
      {benefit.format && <span className="kp-bonus-format">{benefit.format}</span>}
      <h3>{benefit.title}</h3>
      <p>{benefit.description}</p>
      <button type="button" className="kp-btn kp-btn-ghost" onClick={benefit.action}>
        {benefit.cta} <ArrowRight />
      </button>
    </article>
  );
}
