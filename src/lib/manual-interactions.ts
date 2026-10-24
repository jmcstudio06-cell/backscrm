/**
 * Interações reais do Manual do Artista Contratado.
 *
 * Cada capítulo recebe UMA interação pertinente ao seu conteúdo. Os tipos são:
 *  - reflection: pergunta de reflexão (sim/não) para o artista pensar na própria carreira.
 *  - scenario:   cenário de decisão com múltiplas respostas; cada opção tem um
 *                feedback educativo (nenhuma resposta é "comercial", todas ensinam).
 *  - checklist:  lista de itens que o artista marca conforme já faz / precisa melhorar.
 *
 * As chaves (key) identificam a interação na persistência (manual_progress.interactions).
 * Não guardamos texto livre — apenas a escolha estruturada do usuário.
 */

export type ReflectionInteraction = {
  type: "reflection";
  key: string;
  question: string;
  /** Mensagem exibida após responder, conforme a resposta. */
  feedbackYes: string;
  feedbackNo: string;
};

export type ScenarioOption = {
  id: string;
  label: string;
  /** true = melhor abordagem (não impede escolher as outras). */
  best?: boolean;
  feedback: string;
};

export type ScenarioInteraction = {
  type: "scenario";
  key: string;
  prompt: string;
  situation: string;
  options: ScenarioOption[];
};

export type ChecklistInteraction = {
  type: "checklist";
  key: string;
  title: string;
  helper: string;
  items: { id: string; label: string }[];
};

export type ChapterInteraction =
  | ReflectionInteraction
  | ScenarioInteraction
  | ChecklistInteraction;

/** Mapeia o id do capítulo (CHAPTERS[].id) para sua interação. */
export const CHAPTER_INTERACTIONS: Record<string, ChapterInteraction> = {
  intro: {
    type: "reflection",
    key: "ch1_reflexao_organizacao",
    question:
      "Hoje, você consegue dizer de cabeça quantos orçamentos pediu neste mês e quais ainda estão abertos?",
    feedbackYes:
      "Ótimo sinal. Quem acompanha os orçamentos em aberto perde muito menos oportunidade por esquecimento. O próximo passo é garantir que esse controle não dependa só da memória nos dias cheios.",
    feedbackNo:
      "Você não está sozinho — é o ponto que mais faz talento virar show perdido. Repare, ao longo dos capítulos, como cada técnica depende de ter esse histórico em algum lugar além da cabeça e do WhatsApp.",
  },
  "primeiro-contato": {
    type: "scenario",
    key: "ch2_cenario_primeiro_contato",
    prompt: "O que você responderia?",
    situation:
      'São 21h. Um contratante manda: "Boa noite! Vocês têm disponibilidade pro dia 14? Qual o valor?" Você está no meio de um show e só vai poder montar a proposta completa amanhã.',
    options: [
      {
        id: "a",
        label: '"Passo os valores amanhã, tô em show agora."',
        feedback:
          "Resolve pra você, mas deixa o contratante no vácuo e sem sentir prioridade. Ele pode mandar a mesma pergunta para outros dois artistas ainda hoje.",
      },
      {
        id: "b",
        label:
          '"Boa noite, [nome]! Que bom seu contato. Para o dia 14 confirmo a disponibilidade e te envio a proposta completa até amanhã às 11h. Posso saber o local e a duração prevista?"',
        best: true,
        feedback:
          "Essa é a melhor. Você respondeu na hora, deu um prazo claro, demonstrou organização e já coletou dados para orçar — tudo sem precisar montar a proposta durante o show.",
      },
      {
        id: "c",
        label: 'Não responde agora e lembra de responder quando chegar em casa.',
        feedback:
          "O silêncio nos primeiros minutos é onde mais se perde show. Mesmo sem a proposta pronta, um retorno curto com prazo mantém você na frente.",
      },
    ],
  },
  precificacao: {
    type: "scenario",
    key: "ch3_cenario_orcamento",
    prompt: "Como você apresenta o valor?",
    situation:
      "Seu show custa R$ 2.500. O contratante pediu orçamento e está comparando com outros artistas.",
    options: [
      {
        id: "a",
        label: 'Mandar apenas "R$ 2.500" e aguardar a resposta.',
        feedback:
          "Preço solto vira comparação direta de número. Sem contexto, o seu show parece igual ao de qualquer outro — e aí decide o mais barato.",
      },
      {
        id: "b",
        label:
          "Apresentar 3 formatos (solo R$ 2.500, duo R$ 3.500, banda R$ 5.000) com o que está incluso em cada um.",
        best: true,
        feedback:
          "Melhor abordagem. Os formatos ancoram a percepção de valor e dão ao contratante uma escolha entre opções suas — em vez de uma escolha entre você e o concorrente.",
      },
      {
        id: "c",
        label: "Dar um desconto antes mesmo de ele questionar o preço.",
        feedback:
          "Baixar o valor por conta própria comunica insegurança e corrói sua margem. Valor se sustenta com contexto e benefícios, não com desconto preventivo.",
      },
    ],
  },
  fechamento: {
    type: "reflection",
    key: "ch4_reflexao_contrato",
    question:
      "Você costuma formalizar seus shows com contrato e sinal, mesmo quando o contratante é conhecido?",
    feedbackYes:
      "Esse é o hábito que separa quem vive de música de quem toca por hobby. Contrato e sinal protegem a data e reduzem desmarcações de última hora.",
    feedbackNo:
      "Vale rever isso. Um acordo só no boca a boca é o que mais desmarca na véspera. Um contrato simples e um sinal de 30% a 50% já mudam completamente o nível de comprometimento.",
  },
  rotina: {
    type: "checklist",
    key: "ch5_checklist_show",
    title: "Checklist mínimo de cada show",
    helper:
      "Marque o que você já faz hoje de forma consistente. O que ficar desmarcado é onde a sua rotina mais corre risco de deixar algo cair.",
    items: [
      { id: "data", label: "Data, horário de chegada e início confirmados com o contratante" },
      { id: "endereco", label: "Endereço completo e nome de quem vai te receber" },
      { id: "equipe", label: "Equipe escalada e confirmada, com valor de cada músico" },
      { id: "repertorio", label: "Repertório e formato acertados com a produção" },
      { id: "equip", label: "Equipamento revisado e transporte resolvido" },
      { id: "sinal", label: "Sinal recebido e saldo com data marcada para cobrança" },
    ],
  },
  dinheiro: {
    type: "reflection",
    key: "ch6_reflexao_financeiro",
    question:
      "Você sabe quanto efetivamente sobrou (depois de equipe, transporte e despesas) no seu último mês de shows?",
    feedbackYes:
      "Excelente. Quem conhece a sobra real decide a carreira com dados, não com palpite — consegue saber quais shows valem a pena e quais dão prejuízo disfarçado.",
    feedbackNo:
      "É o número que quase ninguém tem — e sem ele toda decisão de carreira vira chute. Acompanhar recebido, a receber e custo por show é o que transforma faturamento em lucro visível.",
  },
  "pos-show": {
    type: "checklist",
    key: "ch7_checklist_posshow",
    title: "Seus 4 movimentos pós-show",
    helper:
      "Marque os que você já pratica. Cada movimento que falta é uma indicação ou um show de retorno que pode estar escapando.",
    items: [
      { id: "agradecer", label: "Mensagem de agradecimento personalizada em até 24h" },
      { id: "material", label: "Pedir fotos ou vídeo curto do evento para usar na próxima venda" },
      { id: "indicacao", label: "Perguntar com naturalidade por indicações" },
      { id: "retorno", label: "Marcar a data provável do próximo evento dele para reativar antes dos concorrentes" },
    ],
  },
};
