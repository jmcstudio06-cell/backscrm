import { useState, useEffect, useMemo, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent } from "@/lib/metaPixel";
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

import { AppLogo } from "@/components/layout/AppLogo";
import { KitIntro } from "@/components/kit/KitIntro";
import manualCover from "@/assets/kit-manual.png";
import artsCover from "@/assets/kit-artes.png";
import messagesCover from "@/assets/kit-mensagens.png";
import appCover from "@/assets/kit-backstage.png";
import "@/styles/kit.css";

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
  const progressPct = Math.round(((chapterIdx + 1) / totalChapters) * 100);
  const currentChapter = CHAPTERS[chapterIdx];

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
        cta: "Assistir agora",
        action: () => {
          trackEvent("ViewContent", { content_name: "manual_bonus_video" });
          document.getElementById("video-anchor")?.scrollIntoView({ behavior: "smooth" });
        },
        accent: "blue",
      },
      {
        id: "trial",
        title: "Conheça a Backstage Pro gratuitamente",
        description:
          "Organize sua carreira em um só lugar: agenda, clientes, orçamentos, contratos, financeiro e o Backs Radar para encontrar novos contratantes.",
        icon: Rocket,
        cta: "Testar o app",
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
      trackEvent("ViewContent", { content_name: "manual_chapter_1" });
      // semeia o progresso inicial vinculado ao telefone recém-capturado
      saveManualProgress(digits, { chapterIndex: 0, completed: false, interactions: {} });
      toast.success("Bem-vindo! Seu material está liberado");
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
    if (chapterIdx < totalChapters - 1) {
      goToChapter(chapterIdx + 1);
    } else {
      // último capítulo → conclui e libera os bônus
      localStorage.setItem(MATERIAL_COMPLETED_KEY, "true");
      setView("unlocked");
      persist({ completed: true });
      trackEvent("ViewContent", { content_name: "manual_completed" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Bônus desbloqueados!");
    }
  };

  const goPrev = () => {
    if (chapterIdx > 0) goToChapter(chapterIdx - 1);
  };

  const remaining = totalChapters - (chapterIdx + 1);
  const readMinutes = useMemo(() => {
    const words = JSON.stringify(currentChapter.blocks).split(/\s+/).length;
    return Math.max(2, Math.round(words / 190));
  }, [currentChapter]);

  return (
    <div className="kit-page min-h-screen bg-background text-foreground">
      <header className="kit-header">
        <div className="kit-shell kit-header-inner">
          <div className="kit-brand"><AppLogo collapsed size="md" /><div><strong>Backstage Pro</strong><span>Kit Profissional do Artista</span></div></div>
          {!isLeadRegistered && <nav className="kit-header-links" aria-label="Kit Profissional"><a href="#conteudo">O manual</a><a href="#bonus">Os bônus</a><Button className="kit-top-cta" onClick={() => setView("reading")}>Acessar grátis <ArrowRight /></Button></nav>}
          {isLeadRegistered && view === "reading" && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                <BookOpen className="w-3.5 h-3.5" />
                {chapterIdx + 1}/{totalChapters}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-warning bg-warning border border-warning/80 px-2.5 py-1.5 rounded-full">
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
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success bg-success border border-success px-3 py-1.5 rounded-full">
              <Trophy className="w-3.5 h-3.5" /> Material concluído
            </span>
          )}
        </div>
        {isLeadRegistered && view === "reading" && (
          <div className="h-[3px] w-full bg-muted/70">
            <div
              className="h-full kit-progress-bar transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </header>

      {!isLeadRegistered && <KitIntro
        chapters={CHAPTERS}
        readMinutes={Math.max(10, Math.round(JSON.stringify(CHAPTERS.map(c => c.blocks)).split(/\s+/).length / 190))}
        onStart={() => { trackEvent("ViewContent", { content_name: "manual_start_click" }); setView("reading"); }}
      />}

      {/* ── READING VIEW ── */}
      {isLeadRegistered && view === "reading" && (
        <div className="kit-shell kit-reading">
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-14">
            {/* Rail */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mb-4">
                    Sumário
                  </p>
                  <ol className="space-y-1">
                    {CHAPTERS.map((c, i) => (
                      <li key={c.id}>
                        <Button
                          onClick={() => goToChapter(i)}
                          className={cn(
                            "w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all group",
                            i === chapterIdx
                              ? "bg-card shadow-sm ring-1 ring-border"
                              : "hover:bg-card/70",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 transition",
                              i < chapterIdx
                                ? "bg-success text-primary-foreground"
                                : i === chapterIdx
                                  ? "bg-foreground text-primary-foreground"
                                  : "bg-muted text-muted-foreground",
                            )}
                          >
                            {i < chapterIdx ? <CheckCircle2 className="w-3 h-3" /> : i + 1}
                          </span>
                          <span
                            className={cn(
                              "text-[13px] leading-snug font-medium",
                              i === chapterIdx ? "text-foreground" : "text-muted-foreground",
                            )}
                          >
                            {c.title}
                          </span>
                        </Button>
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
              <div className="kit-mobile-chapters"><label className="block text-sm font-semibold mb-2" htmlFor="kit-reading-chapter">Seu capítulo</label><select id="kit-reading-chapter" value={chapterIdx} onChange={e => goToChapter(Number(e.target.value))} className="w-full border border-border bg-card rounded-lg px-3 py-3 text-sm">{CHAPTERS.map((c, i) => <option key={c.id} value={i}>{i + 1}. {c.title}</option>)}</select></div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentChapter.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ChapterView
                    chapter={currentChapter}
                    readMinutes={readMinutes}
                    interactions={interactions}
                    onInteractionChange={handleInteractionChange}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Encouragement */}
              <div className="mt-14 rounded-3xl border border-warning/70 bg-gradient-to-br from-warning to-card p-6 sm:p-7 flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-warning/20 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-warning" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-lg text-foreground leading-tight">
                    {remaining === 0
                      ? "Você chegou ao último capítulo"
                      : `Faltam ${remaining} ${remaining === 1 ? "capítulo" : "capítulos"} para liberar seus bônus`}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    Aula completa em vídeo, artes editáveis no Canva, mensagens prontas para
                    contratantes e teste grátis do sistema — tudo liberado no fim da leitura.
                  </p>
                </div>
              </div>

              {/* Chapter dots (mobile) */}
              <div className="mt-10 flex items-center justify-center gap-2 lg:hidden">
                {CHAPTERS.map((c, i) => (
                  <Button
                    key={c.id}
                    onClick={() => goToChapter(i)}
                    aria-label={`Ir para capítulo ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === chapterIdx
                        ? "w-8 bg-foreground"
                        : i < chapterIdx
                          ? "w-1.5 bg-success"
                          : "w-1.5 bg-muted",
                    )}
                  />
                ))}
              </div>

              {/* Desktop nav */}
              <div className="mt-10 hidden lg:flex items-center justify-between gap-4">
                <Button
                  onClick={goPrev}
                  disabled={chapterIdx === 0}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition",
                    chapterIdx === 0
                      ? "text-muted-foreground cursor-not-allowed"
                      : "text-foreground hover:text-foreground hover:bg-card",
                  )}
                >
                  <ArrowLeft className="w-4 h-4" /> Anterior
                </Button>
                <NextButton
                  isLast={chapterIdx === totalChapters - 1}
                  onClick={goNext}
                />
              </div>
            </main>
          </div>

          {/* Mobile sticky nav */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/90 backdrop-blur-xl border-t border-border px-4 py-3 flex items-center gap-3">
            <Button
              onClick={goPrev}
              disabled={chapterIdx === 0}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition",
                chapterIdx === 0
                  ? "text-muted-foreground"
                  : "text-foreground bg-muted hover:bg-muted",
              )}
              aria-label="Capítulo anterior"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <NextButton
              isLast={chapterIdx === totalChapters - 1}
              onClick={goNext}
              full
            />
          </div>
        </div>
      )}

      {isLeadRegistered && view === "unlocked" && <main>
        <section className="kit-unlocked-banner"><div className="kit-shell"><Trophy className="mx-auto" size={36} /><h1>Seu próximo passo está liberado.</h1><p>Manual concluído. Agora você tem quatro bônus para transformar o conhecimento em prática.</p><Button variant="ghost" className="kit-revisit" onClick={() => { setView("reading"); goToChapter(0); }}><BookOpen /> Revisar o material escrito</Button></div></section>
        <div className="kit-shell kit-section"><div className="kit-section-heading"><div><p className="kit-eyebrow text-primary">SEU KIT COMPLETO</p><h2>Escolha por onde continuar.</h2></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{benefits.map((b, i) => <BenefitCard key={b.id} benefit={b} index={i + 1} />)}</div>
          <section id="video-anchor" className="kit-video"><div className="flex gap-3 items-center"><PlayCircle className="text-primary" /><h2 className="text-xl font-bold">Manual do Artista — aula completa</h2></div><div className="kit-video-frame"><iframe src={`https://www.youtube.com/embed/${YT_VIDEO_ID}?rel=0&modestbranding=1&playsinline=1`} title="Manual do Artista Contratado" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div></section>
        </div>
      </main>}

      {/* ── LEAD CAPTURE MODAL ── */}
      {!isLeadRegistered && view !== "intro" && <LeadCaptureModal
        onCancel={() => setView("intro")}
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
// Entry / intro view — primeira tela, antes da captura de lead
// ─────────────────────────────────────────────────────────────────────────────
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
    <Button
      onClick={onClick}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 font-bold text-sm sm:text-base px-6 sm:px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 overflow-hidden",
        full ? "flex-1" : "",
        isLast
          ? "bg-gradient-to-r from-warning to-warning text-primary-foreground shadow-lg shadow-warning/25"
          : "bg-foreground hover:bg-foreground text-primary-foreground shadow-lg shadow-foreground/15",
      )}
    >
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-card/25 to-transparent" />
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
    </Button>
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
    <div className="kit-reward-tracker space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 64 64" className="kit-progress-circle w-16 h-16 -rotate-90">
            <circle cx="32" cy="32" r={r} fill="none"  strokeWidth="6" />
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - (c * progressPct) / 100}
              className="transition-all duration-700"
            />

          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-foreground">
            {progressPct}%
          </span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Prêmio final
          </p>
          <p className="font-semibold text-foreground leading-tight">
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
                done ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  done ? "bg-success text-success" : "bg-muted text-muted-foreground",
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
function ChapterView({
  chapter,
  readMinutes,
  interactions,
  onInteractionChange,
}: {
  chapter: Chapter;
  readMinutes: number;
  interactions: ManualInteractions;
  onInteractionChange: (key: string, value: string | boolean | number) => void;
}) {
  const interaction = CHAPTER_INTERACTIONS[chapter.id];
  const Icon = chapter.icon;
  const accentBg: Record<string, string> = {
    rose: "bg-destructive text-destructive ring-destructive/70",
    blue: "bg-primary text-primary ring-primary/70",
    emerald: "bg-success text-success ring-success/70",
    violet: "bg-primary text-primary ring-primary/70",
    amber: "bg-warning text-warning ring-warning/70",
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
              accentBg[chapter.accent] || "bg-muted text-foreground ring-border",
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {chapter.eyebrow}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <Clock className="w-3 h-3" /> {readMinutes} min de leitura
          </span>
        </div>
        <h1 className="text-[1.75rem] sm:text-[2.5rem] font-semibold  leading-[1.1] text-foreground">
          {chapter.title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
          {chapter.intro}
        </p>
      </header>

      {/* Divider */}
      <div className="my-9 flex items-center gap-3">
        <span className="h-px flex-1 bg-muted" />
        <Music className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="h-px flex-1 bg-muted" />
      </div>

      {/* Blocks */}
      <div className="space-y-7">
        {chapter.blocks.map((block, i) => {
          const isLead = block.type === "p" && firstParagraph;
          if (isLead) firstParagraph = false;
          return <BlockRenderer key={i} block={block} accent={chapter.accent} lead={isLead} />;
        })}
      </div>

      {/* Interação real do capítulo (reflexão / cenário / checklist) */}
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
            "text-[1.05rem] sm:text-[1.1rem] text-foreground leading-[1.75]",
            lead && "text-foreground",
          )}
        >
          {block.text}
        </p>
      );
    case "h":
      return (
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground pt-4  leading-tight">
          {block.text}
        </h2>
      );
    case "quote":
      return (
        <blockquote className="rounded-xl border-l-2 border-foreground bg-muted px-6 py-5">
          <p className="text-lg sm:text-xl font-medium text-foreground leading-snug ">
            {block.text}
          </p>
          {block.author && (
            <p className="text-[12px] text-muted-foreground mt-2.5 font-medium">— {block.author}</p>
          )}
        </blockquote>
      );
    case "tip":
      return (
        <div className="rounded-xl border border-success bg-success/50 p-5 flex gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-success flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4 text-success" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-success text-[13px]">{block.title}</p>
            <p className="text-success/75 text-[14px] sm:text-[15px] leading-relaxed">
              {block.text}
            </p>
          </div>
        </div>
      );
    case "warn":
      return (
        <div className="rounded-xl border border-warning bg-warning/50 p-5 flex gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-warning" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-warning text-[13px]">{block.title}</p>
            <p className="text-warning/75 text-[14px] sm:text-[15px] leading-relaxed">
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
              className="group flex gap-3.5 items-start text-[0.98rem] sm:text-[1.02rem] text-foreground leading-relaxed rounded-xl border border-border/80 bg-card px-4 py-3 transition-colors hover:border-border"
            >
              <span className="w-6 h-6 rounded-full bg-muted text-foreground text-[12px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "stat":
      return (
        <div className="rounded-2xl border border-border bg-card p-7 sm:p-8 text-center shadow-sm">
          <p className="text-5xl sm:text-6xl font-semibold  text-foreground leading-none">
            {block.value}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm sm:text-[15px] leading-relaxed text-muted-foreground">
            {block.label}
          </p>
        </div>
      );
    case "compare":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-destructive flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Errado
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed">{block.wrong}</p>
          </div>
          <div className="rounded-xl border border-success bg-success/40 p-5 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-success flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Certo
            </p>
            <p className="text-[14px] text-foreground leading-relaxed">{block.right}</p>
          </div>
        </div>
      );
    case "gap":
      return (
        <div className="rounded-2xl border border-foreground bg-foreground text-primary-foreground p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-card/10 flex items-center justify-center shrink-0">
              <PuzzleIcon className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Backstage Pro
              </p>
              <p className="font-semibold text-[17px] leading-tight ">
                {block.title}
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-[14px] sm:text-[15px] leading-relaxed">{block.text}</p>
          <ul className="space-y-2.5">
            {block.items.map((it, i) => (
              <li key={i} className="flex gap-2.5 items-start text-[14px] sm:text-[15px] text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
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
function BenefitCard({ benefit }: { benefit: Benefit; index?: number }) {
  const covers: Record<string, string> = { video: manualCover, trial: appCover, artes: artsCover, mensagens: messagesCover };
  return <article className="kit-bonus-card"><img src={covers[benefit.id]} alt={benefit.title} loading="lazy" /><div><h3>{benefit.title}</h3><p>{benefit.description}</p><Button onClick={benefit.action}>{benefit.cta}<ArrowRight /></Button></div></article>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lead capture modal
// ─────────────────────────────────────────────────────────────────────────────
function LeadCaptureModal(props: {
  onCancel: () => void;
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
    <div className="kit-modal-backdrop fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md px-4 py-6 overflow-y-auto">
      <div role="dialog" aria-modal="true" aria-labelledby="kit-lead-title" className="kit-modal relative w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300 my-auto"><Button variant="ghost" size="icon" className="kit-modal-close" aria-label="Fechar cadastro do kit" onClick={props.onCancel}><X /></Button>
        {/* Top */}
        <div className="kit-modal-heading relative p-8 pb-6 text-center border-b border-border overflow-hidden">
          <div className="absolute inset-x-0 -top-20 h-44 bg-secondary" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-success flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-2">
              Manual do Artista Contratado
            </p>
            <h2 id="kit-lead-title" className="text-2xl sm:text-[1.7rem] font-semibold text-foreground leading-tight">
              O material que organiza sua carreira
            </h2>
            <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">
              7 capítulos práticos. No fim da leitura você libera{" "}
              <strong className="text-foreground">4 bônus gratuitos</strong>.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {["Aula em vídeo", "Artes no Canva", "Mensagens prontas", "Teste grátis"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-warning bg-warning ring-1 ring-warning/70 px-2.5 py-1 rounded-full"
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
              aria-label="Nome e sobrenome" placeholder="Ex: João Silva"
              value={props.name}
              onChange={(e) => props.setName(e.target.value)}
              maxLength={100}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </FormField>

          <FormField label="WhatsApp (com DDD)" icon={<Phone className="w-4 h-4" />}>
            <Input
              aria-label="WhatsApp (com DDD)" placeholder="(11) 98765-4321"
              value={props.phone}
              onChange={(e) => props.setPhone(e.target.value)}
              maxLength={15}
              inputMode="tel"
              className="bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </FormField>

          <FormField label="De qual cidade você é?" icon={<MapPin className="w-4 h-4" />}>
            <Input
              aria-label="De qual cidade você é?" placeholder="Ex: São Paulo - SP"
              value={props.city}
              onChange={(e) => props.setCity(e.target.value)}
              maxLength={100}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          </FormField>

          <FormField label="Quantos shows você faz por mês?" icon={<Music className="w-4 h-4" />}>
            <Select value={props.showsPerMonth} onValueChange={props.setShowsPerMonth}>
              <SelectTrigger aria-label="Quantos shows você faz por mês?" className="bg-card border-border text-foreground">
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
            className="w-full gap-2 text-base py-6 bg-foreground hover:bg-foreground text-primary-foreground border-0 font-bold rounded-xl mt-2"
            onClick={props.onSubmit}
            disabled={props.submitting}
          >
            {props.submitting ? "Liberando acesso..." : "Começar a leitura grátis"}
            <ArrowRight className="w-4 h-4" />
          </Button>

          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
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
      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

