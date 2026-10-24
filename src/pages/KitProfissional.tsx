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
  MapPin,
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
import { CHAPTER_INTERACTIONS } from "@/lib/manual-interactions";
import { ChapterInteraction } from "@/components/kit/ChapterInteraction";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import "@/styles/kit.css";
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
// Destino oficial de cadastro gratuito no app da Backstage Pro.
const SIGNUP_URL = "https://backstageproapp.com/kit-profissional";

// ─────────────────────────────────────────────────────────────────────────────
// CONTEÚDO DO MATERIAL — capítulos escritos, interativos
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
  const [city, setCity] = useState("");
  const [showsPerMonth, setShowsPerMonth] = useState("");
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
      setChapterIdx(Math.min(p.chapterIndex, CHAPTERS.length - 1));
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
      toast.success("Bem-vindo! Seu material está liberado 📖");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const goToChapter = (i: number) => {
    const clamped = Math.max(0, Math.min(i, totalChapters - 1));
    setChapterIdx(clamped);
    persist({ chapterIndex: clamped });
    trackEvent("ViewContent", { content_name: `manual_chapter_${clamped + 1}` });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
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
  const readMinutes = useMemo(() => {
    const words = JSON.stringify(currentChapter.blocks).split(/\s+/).length;
    return Math.max(2, Math.round(words / 190));
  }, [currentChapter]);


  const isDone = (id: string) => interactions[`done:${id}`] === true;
  const isReading = isLeadRegistered && progressLoaded && view !== "unlocked";
  const isUnlocked = isLeadRegistered && progressLoaded && view === "unlocked";

  const openSignup = () => {
    trackEvent("Lead", { content_name: "manual_signup_click" });
    window.open(SIGNUP_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="kit-page">
      <Helmet>
        <title>Manual do Artista Contratado | Backstage Pro</title>
        <meta
          name="description"
          content="Aprenda a conquistar mais shows, valorizar seu trabalho e profissionalizar sua carreira musical. Material gratuito com 7 capítulos e 4 bônus."
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
              <small>Manual do Artista</small>
            </span>
          </div>

          {isReading && (
            <span className="kp-header-chip">
              <BookOpen aria-hidden="true" />
              Capítulo {chapterIdx + 1} de {totalChapters}
            </span>
          )}
          {isUnlocked && (
            <span className="kp-header-chip is-done">
              <Trophy aria-hidden="true" /> Manual concluído
            </span>
          )}
          {!isLeadRegistered && (
            <span className="kp-header-chip">
              <Gift aria-hidden="true" /> Material gratuito
            </span>
          )}
        </div>
        {isReading && (
          <div
            className="kp-header-bar"
            role="progressbar"
            aria-label="Progresso do manual"
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
          city={city}
          showsPerMonth={showsPerMonth}
          submitting={submitting}
          setName={setName}
          setPhone={(v) => setPhone(formatPhone(v))}
          setCity={setCity}
          setShowsPerMonth={setShowsPerMonth}
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
            <aside className="kp-toc" aria-label="Sumário do manual">
              <p className="kp-toc-label">Sumário</p>
              <ol>
                {CHAPTERS.map((c, i) => {
                  const done = isDone(c.id);
                  const active = i === chapterIdx;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => goToChapter(i)}
                        aria-current={active ? "step" : undefined}
                        className={cn("kp-toc-item", active && "is-active", done && "is-done")}
                      >
                        <span className="kp-toc-num" aria-hidden="true">
                          {done ? <Check /> : i + 1}
                        </span>
                        <span className="kp-toc-title">
                          {c.title}
                          {done && <span className="sr-only"> (concluído)</span>}
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
                    ? "Todos os capítulos concluídos."
                    : `Conclua ${remaining} ${remaining === 1 ? "capítulo" : "capítulos"} para liberar os 4 bônus.`}
                </p>
              </div>
            </aside>

            <main className="kp-main">
              <nav className="kp-pills" aria-label="Capítulos">
                {CHAPTERS.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => goToChapter(i)}
                    aria-label={`Capítulo ${i + 1}: ${c.title}${isDone(c.id) ? " (concluído)" : ""}`}
                    aria-current={i === chapterIdx ? "step" : undefined}
                    className={cn(
                      "kp-pill",
                      i === chapterIdx && "is-active",
                      isDone(c.id) && "is-done",
                    )}
                  >
                    {isDone(c.id) && i !== chapterIdx ? <Check aria-hidden="true" /> : i + 1}
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
                <div className="kp-end-card">
                  <span className="kp-icon-tile">
                    <Gift />
                  </span>
                  <div>
                    <strong>
                      {chapterIdx === totalChapters - 1
                        ? "Último capítulo. Conclua para liberar seus bônus."
                        : `Próximo: ${CHAPTERS[chapterIdx + 1].title}`}
                    </strong>
                    <p>
                      No final: aula em vídeo, teste gratuito da Backstage Pro, artes no Canva e
                      mensagens prontas para contratantes.
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
                  <button type="button" className="kp-btn kp-btn-primary" onClick={goNext}>
                    {chapterIdx === totalChapters - 1 ? (
                      <>
                        Concluir e liberar bônus <Sparkles />
                      </>
                    ) : (
                      <>
                        Concluir capítulo <ArrowRight />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </main>
          </div>

          {/* Navegação fixa no celular */}
          <nav className="kp-dock" aria-label="Navegação entre capítulos">
            <button
              type="button"
              className="kp-btn kp-btn-ghost kp-dock-prev"
              onClick={goPrev}
              disabled={chapterIdx === 0}
              aria-label="Capítulo anterior"
            >
              <ArrowLeft className="kp-flip" />
            </button>
            <button type="button" className="kp-btn kp-btn-primary" onClick={goNext}>
              {chapterIdx === totalChapters - 1 ? (
                <>
                  Liberar bônus <Sparkles />
                </>
              ) : (
                <>
                  Concluir capítulo <ArrowRight />
                </>
              )}
            </button>
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
                <span className="kp-eyebrow-dot" /> Manual concluído
              </span>
              <h1 id="kp-done-title">
                Você chegou ao final do
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
                  <BookOpen /> Revisar o manual
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
          <span>Manual do Artista Contratado · material gratuito</span>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Entrada: hero no padrão da landing + formulário de lead embutido
// ─────────────────────────────────────────────────────────────────────────────
type IntroProps = {
  totalChapters: number;
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
};

const BONUS_PREVIEW = [
  { icon: PlayCircle, label: "Aula completa em vídeo" },
  { icon: Rocket, label: "Teste gratuito da Backstage Pro" },
  { icon: Palette, label: "Artes editáveis no Canva" },
  { icon: MessageSquare, label: "Mensagens prontas para contratantes" },
];

function IntroView(props: IntroProps) {
  const totalMinutes = useMemo(() => {
    const words = JSON.stringify(CHAPTERS.map((c) => c.blocks)).split(/\s+/).length;
    return Math.max(10, Math.round(words / 190));
  }, []);

  const focusForm = () => {
    const el = document.getElementById("kp-capture");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => document.getElementById("kp-name")?.focus(), 450);
  };

  return (
    <main>
      <section className="kp-hero" aria-labelledby="kp-title">
        <div className="kp-grid-bg" aria-hidden="true" />
        <span className="kp-glow kp-glow-blue" style={{ width: 420, height: 420, top: -140, left: -160 }} aria-hidden="true" />
        <span className="kp-glow kp-glow-cyan" style={{ width: 420, height: 420, bottom: -180, right: -140 }} aria-hidden="true" />

        <div className="kp-container kp-hero-grid">
          <div className="kp-hero-copy">
            <span className="kp-eyebrow">
              <span className="kp-eyebrow-dot" /> Material gratuito para artistas
            </span>
            <h1 id="kp-title">
              Manual do Artista
              <span className="kp-text-gradient">Contratado</span>
            </h1>
            <p className="kp-hero-lead">
              Aprenda a conquistar mais shows, valorizar seu trabalho e profissionalizar sua
              carreira musical.
            </p>
            <ul className="kp-hero-checks">
              <li>
                <span className="kp-check"><Check /></span> Do primeiro contato ao pós-show
              </li>
              <li>
                <span className="kp-check"><Check /></span> Exercícios e checklists práticos
              </li>
              <li>
                <span className="kp-check"><Check /></span> Continue de onde parou
              </li>
            </ul>
            <div className="kp-hero-meta">
              <span><BookOpen /> {props.totalChapters} capítulos</span>
              <span><Clock /> cerca de {totalMinutes} min de leitura</span>
              <span><Gift /> 4 bônus no final</span>
            </div>
          </div>

          <LeadCaptureCard {...props} />
        </div>
      </section>

      <section className="kp-section" aria-labelledby="kp-learn-title">
        <div className="kp-container">
          <div className="kp-heading">
            <span className="kp-eyebrow">O que você vai aprender</span>
            <h2 id="kp-learn-title">
              Sete capítulos.
              <span className="kp-text-gradient"> Uma carreira mais profissional.</span>
            </h2>
            <p>Cada capítulo complementa o anterior, do primeiro “oi” até o próximo contrato.</p>
          </div>
          <ol className="kp-chapters">
            {CHAPTERS.map((c, i) => {
              const Icon = c.icon;
              return (
                <li key={c.id} className="kp-chapter-card">
                  <div className="kp-chapter-top">
                    <span className="kp-icon-tile"><Icon /></span>
                    <span className="kp-chapter-num">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3>{c.title}</h3>
                  <p>{c.intro}</p>
                </li>
              );
            })}
            <li className="kp-chapter-card is-bonus">
              <div className="kp-chapter-top">
                <span className="kp-icon-tile"><Gift /></span>
                <span className="kp-chapter-num">+4</span>
              </div>
              <h3>Bônus liberados no final</h3>
              <ul className="kp-bonus-mini">
                {BONUS_PREVIEW.map((b) => (
                  <li key={b.label}>
                    <b.icon aria-hidden="true" /> {b.label}
                  </li>
                ))}
              </ul>
            </li>
          </ol>
          <div className="kp-center">
            <button type="button" className="kp-btn kp-btn-primary" onClick={focusForm}>
              Começar meu manual <ArrowRight />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function LeadCaptureCard(props: IntroProps) {
  return (
    <div className="kp-capture" id="kp-capture">
      <form
        className="kp-capture-inner"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmit();
        }}
      >
        <span className="kp-capture-badge">
          <Sparkles aria-hidden="true" /> Acesso gratuito
        </span>
        <h2>Receba seu manual agora</h2>
        <p>Preencha para liberar a leitura. Seu progresso fica salvo neste número.</p>

        <div className="kp-field">
          <label htmlFor="kp-name">
            <User aria-hidden="true" /> Nome e sobrenome
          </label>
          <Input
            id="kp-name"
            className="kp-input"
            placeholder="Ex.: João Silva"
            autoComplete="name"
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
            value={props.phone}
            onChange={(e) => props.setPhone(e.target.value)}
            maxLength={15}
          />
        </div>

        <div className="kp-field-row">
          <div className="kp-field">
            <label htmlFor="kp-city">
              <MapPin aria-hidden="true" /> Cidade
            </label>
            <Input
              id="kp-city"
              className="kp-input"
              placeholder="Ex.: São Paulo - SP"
              autoComplete="address-level2"
              value={props.city}
              onChange={(e) => props.setCity(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="kp-field">
            <label htmlFor="kp-shows">
              <Music aria-hidden="true" /> Shows por mês
            </label>
            <Select value={props.showsPerMonth} onValueChange={props.setShowsPerMonth}>
              <SelectTrigger id="kp-shows" className="kp-input">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent className="bg-white text-slate-900 border-slate-200">
                <SelectItem value="0-3">0 a 3 shows</SelectItem>
                <SelectItem value="3-5">3 a 5 shows</SelectItem>
                <SelectItem value="5-10">5 a 10 shows</SelectItem>
                <SelectItem value="10+">Mais de 10 shows</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <button type="submit" className="kp-btn kp-btn-primary" disabled={props.submitting}>
          {props.submitting ? (
            <>
              <Loader2 className="kp-spin" /> Liberando acesso…
            </>
          ) : (
            <>
              Começar meu manual <ArrowRight />
            </>
          )}
        </button>

        <p className="kp-capture-note">
          <ShieldCheck aria-hidden="true" /> Seus dados ficam protegidos. Não enviamos spam.
        </p>

        <div className="kp-capture-chips" aria-label="Bônus incluídos">
          {BONUS_PREVIEW.map((b) => (
            <span key={b.label} className="kp-chip">
              <b.icon aria-hidden="true" /> {b.label}
            </span>
          ))}
        </div>
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
  const interaction = CHAPTER_INTERACTIONS[chapter.id];
  let firstParagraph = true;

  return (
    <article className="kp-article" aria-labelledby={`kp-ch-${chapter.id}`}>
      <header className="kp-chapter-head">
        <div className="kp-chapter-meta">
          <span className="kp-eyebrow">
            <Icon aria-hidden="true" /> Capítulo {index + 1} de {total}
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

      {interaction && (
        <ChapterInteraction
          interaction={interaction}
          values={interactions}
          onChange={onInteractionChange}
        />
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
