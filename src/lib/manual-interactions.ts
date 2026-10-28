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

/** Atividade principal de cada aula (reflexão, cenário ou checklist). */
const PRIMARY: Record<string, ChapterInteraction> = {
  intro: {
    type: "reflection",
    key: "ch1_reflexao_organizacao",
    question:
      "Hoje, você consegue dizer de cabeça quantos orçamentos pediu neste mês e quais ainda estão abertos?",
    feedbackYes:
      "Ótimo sinal. Quem acompanha os orçamentos em aberto perde muito menos oportunidade por esquecimento. O próximo passo é garantir que esse controle não dependa só da memória nos dias cheios.",
    feedbackNo:
      "Você não está sozinho — é o ponto que mais faz talento virar show perdido. Repare, ao longo das aulas, como cada técnica depende de ter esse histórico em algum lugar além da cabeça e do WhatsApp.",
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

/**
 * Checagem rápida de cada aula: pergunta de compreensão baseada no texto
 * da própria aula. Todas as opções trazem um feedback que ensina algo.
 */
const QUICK_CHECK: Record<string, ChapterInteraction> = {
  intro: {
    type: "scenario",
    key: "ch1_quiz_erros",
    prompt: "O que os 5 erros silenciosos têm em comum?",
    situation: "Pense nos cinco erros que você acabou de ler, da demora para responder até não saber quanto entrou no mês.",
    options: [
      {
        id: "a",
        label: "Todos vêm de falta de talento ou de técnica musical.",
        feedback: "Nenhum dos cinco erros fala de música. A aula mostra que artistas talentosos perdem shows justamente por detalhes fora do palco.",
      },
      {
        id: "b",
        label: "Todos são problemas de organização, não de música.",
        best: true,
        feedback: "Isso mesmo. Responder, apresentar valor, guardar o histórico e saber os números são hábitos de organização, e é isso que as próximas aulas ensinam a construir.",
      },
      {
        id: "c",
        label: "Todos acontecem só com quem está começando a carreira.",
        feedback: "Não. Esses erros aparecem principalmente quando a agenda enche e o artista fica sem tempo, inclusive em carreiras já estabelecidas.",
      },
    ],
  },
  "primeiro-contato": {
    type: "scenario",
    key: "ch2_quiz_prazo",
    prompt: "Qual é a regra para o primeiro retorno ao contratante?",
    situation: "Um contratante acabou de pedir disponibilidade e valores pelo WhatsApp.",
    options: [
      {
        id: "a",
        label: "Responder em até 24 horas, com a proposta completa.",
        feedback: "Em 24 horas o contratante provavelmente já falou com outros artistas. A aula recomenda um retorno bem mais rápido, mesmo sem a proposta pronta.",
      },
      {
        id: "b",
        label: "Responder em até 30 minutos, nem que seja para dizer quando a proposta chega.",
        best: true,
        feedback: "Exato. A regra dos 30 minutos mantém sua autoridade: um retorno curto, com prazo claro, já mostra organização.",
      },
      {
        id: "c",
        label: "Confirmar a data na hora e verificar a agenda depois.",
        feedback: "Esse é o erro que a aula aponta como o mais caro. Disponibilidade precisa ser consultada, não lembrada.",
      },
    ],
  },
  precificacao: {
    type: "reflection",
    key: "ch3_reflexao_custos",
    question:
      "Você sabe quanto sai do seu cachê (músicos, transporte, alimentação, equipamento e imposto) antes de virar lucro?",
    feedbackYes:
      "Ótimo. Com o custo real em mãos, você consegue recusar shows que dariam prejuízo e defender seu valor com segurança.",
    feedbackNo:
      "Esse é o primeiro número a descobrir. Sem ele, um show que parece bom pode estar dando prejuízo. Comece somando os custos do seu próximo show.",
  },
  fechamento: {
    type: "scenario",
    key: "ch4_quiz_sinal",
    prompt: "Qual é a recomendação da aula para o pagamento?",
    situation: "O contratante topou a proposta e você vai formalizar o show.",
    options: [
      {
        id: "a",
        label: "Não pedir sinal, para não parecer desconfiança.",
        feedback: "A aula mostra o contrário: o sinal é sobre comprometimento, e todo contratante sério entende isso.",
      },
      {
        id: "b",
        label: "Sinal de 30% a 50% na assinatura e saldo até 7 dias antes do show.",
        best: true,
        feedback: "Isso. Assim a data fica garantida no nome do contratante e você não depende de cobrar tudo no dia.",
      },
      {
        id: "c",
        label: "Receber 100% no dia do show, depois da apresentação.",
        feedback: "Assim todo o risco fica com você. Se o evento for desmarcado na véspera, não sobra nenhuma garantia.",
      },
    ],
  },
  rotina: {
    type: "scenario",
    key: "ch5_quiz_confirmacao",
    prompt: "Quando a aula recomenda confirmar horário, local e formato?",
    situation: "Você tem um show fechado na próxima semana.",
    options: [
      {
        id: "a",
        label: "No próprio dia do show, quando estiver indo para o local.",
        feedback: "No dia já não dá tempo de resolver um desencontro. A confirmação precisa acontecer com antecedência.",
      },
      {
        id: "b",
        label: "Três dias antes (72 horas).",
        best: true,
        feedback: "Exato. A confirmação 72 horas antes evita a maior parte dos desencontros e passa uma impressão de organização.",
      },
      {
        id: "c",
        label: "Não precisa confirmar se já está tudo no contrato.",
        feedback: "O contrato registra o combinado, mas a confirmação garante que todos lembram dele. São coisas diferentes.",
      },
    ],
  },
  dinheiro: {
    type: "scenario",
    key: "ch6_quiz_sinal_mes",
    prompt: "Em que mês esse sinal deve ser registrado?",
    situation: "Você recebeu 50% de sinal em março para um show que acontece em maio.",
    options: [
      {
        id: "a",
        label: "Em maio, o mês do show.",
        feedback: "Se for para maio, você vai achar que faturou menos em março e mais em maio, e pode tomar decisões erradas nos dois meses.",
      },
      {
        id: "b",
        label: "Em março, quando o dinheiro entrou, com o saldo previsto para maio.",
        best: true,
        feedback: "Isso. O recebido entra no mês em que caiu na conta e o saldo fica como “a receber”, com data.",
      },
      {
        id: "c",
        label: "Não precisa registrar sinal, só o valor total.",
        feedback: "Sem registrar o sinal, você perde a visão do que já entrou e do que ainda falta receber.",
      },
    ],
  },
  "pos-show": {
    type: "scenario",
    key: "ch7_quiz_movimento",
    prompt: "Qual movimento a aula chama de mais valioso e mais esquecido?",
    situation: "O show foi um sucesso e o contratante ficou satisfeito.",
    options: [
      {
        id: "a",
        label: "Mandar a mensagem de agradecimento em até 24 horas.",
        feedback: "É importante, mas não é o mais esquecido. A aula destaca um movimento que acontece meses depois.",
      },
      {
        id: "b",
        label: "Marcar a data provável do próximo evento dele e voltar a falar antes dos concorrentes.",
        best: true,
        feedback: "Exato. Quase todo contratante repete. Quem aparece antes de ele começar a procurar não disputa preço com ninguém.",
      },
      {
        id: "c",
        label: "Pedir fotos e vídeos do evento.",
        feedback: "Ajuda na próxima venda, mas a aula aponta outro movimento como o que mais gera novos contratos.",
      },
    ],
  },
};

/** Atividades de cada aula, na ordem em que aparecem. */
export const CHAPTER_INTERACTIONS: Record<string, ChapterInteraction[]> = Object.fromEntries(
  Object.keys(PRIMARY).map((id) => [id, [PRIMARY[id], QUICK_CHECK[id]].filter(Boolean)]),
);

/** Chave que marca o checklist como revisado (o artista pode não marcar nenhum item). */
export function checklistConfirmedKey(key: string) {
  return `${key}:confirmed`;
}

/** Diz se a atividade já foi respondida. É o que libera a conclusão da aula. */
export function isInteractionAnswered(
  interaction: ChapterInteraction,
  values: Record<string, string | boolean | number>,
): boolean {
  if (interaction.type === "checklist") {
    return values[checklistConfirmedKey(interaction.key)] === true;
  }
  return values[interaction.key] !== undefined;
}
