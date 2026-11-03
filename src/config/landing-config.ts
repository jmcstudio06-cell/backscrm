/**
 * CONFIGURAÇÃO CENTRALIZADA DA LANDING PAGE
 * 
 * Edite este arquivo para alterar textos, preços e links
 * sem mexer no código React da landing
 */

export const LANDING_CONFIG = {
  /* ═══════════════════════════════════════════════════════════════
     META E SEO
     ═══════════════════════════════════════════════════════════════ */
  meta: {
    title: "Backstage Pro — Organize sua carreira musical como um negócio",
    description: "Centralize agenda de shows, clientes, cachês e financeiro em uma plataforma profissional. Pare de perder dinheiro por desorganização.",
    ogImage: "/og-image.png",
    faviconPath: "/favicon.png",
  },

  /* ═══════════════════════════════════════════════════════════════
     LINKS E CONTATOS
     ═══════════════════════════════════════════════════════════════ */
  links: {
    // URL de destino do botão principal (checkout, cadastro ou WhatsApp)
    ctaUrl: "[PREENCHER: https://app.backstageproapp.com/cadastro]",
    
    // WhatsApp (formato: 5511999999999)
    whatsappNumber: "[PREENCHER: 5512992423317]",
    whatsappEnabled: false, // true para mostrar botão flutuante
    whatsappMessage: "Oi! Quero saber mais sobre o Backstage Pro",
    
    // Redes sociais
    instagramUrl: "https://instagram.com/backstagepro",
    instagramHandle: "@backstagepro",
    
    // Contato
    emailContato: "contato@backstageproapp.com",
    emailSuport: "suporte@backstageproapp.com",
  },

  /* ═══════════════════════════════════════════════════════════════
     TRACKING
     ═══════════════════════════════════════════════════════════════ */
  tracking: {
    // Meta (Facebook) Pixel
    metaPixelId: "[PREENCHER: 1234567890]",
    metaPixelEnabled: false, // true quando pixel estiver configurado
    
    // Google Analytics 4
    googleAnalyticsId: "[PREENCHER: G-XXXXXXXXXX]",
    googleAnalyticsEnabled: false,
  },

  /* ═══════════════════════════════════════════════════════════════
     VÍDEO DEMONSTRATIVO
     ═══════════════════════════════════════════════════════════════ */
  video: {
    // URL do vídeo MP4 (hospedar em CDN ou Vimeo/YouTube)
    url: "[PREENCHER: https://cdn.backstageproapp.com/demo-vertical.mp4]",
    
    // Thumbnail (imagem que aparece antes de dar play)
    poster: "[PREENCHER: https://cdn.backstageproapp.com/demo-thumb.jpg]",
    
    // Configurações
    autoplay: false, // autoplay mudo ao entrar na seção
    loop: true,
  },

  /* ═══════════════════════════════════════════════════════════════
     OFERTA E COUNTDOWN
     ═══════════════════════════════════════════════════════════════ */
  oferta: {
    ativa: false, // true para mostrar faixa de countdown
    texto: "🔥 30% OFF nos primeiros 100 cadastros",
    dataFim: "2024-12-31T23:59:59", // formato ISO
    mostrarAposVencer: false,
  },

  /* ═══════════════════════════════════════════════════════════════
     COPY — TEXTOS DA PÁGINA
     ═══════════════════════════════════════════════════════════════ */
  copy: {
    // Hero
    hero: {
      badge: "Para artistas e músicos profissionais",
      headline: "Sua carreira musical também é um negócio",
      headlineDestaque: "negócio", // palavra que fica em azul
      subtitulo: "Centralize agenda de shows, clientes, cachês e financeiro em uma plataforma profissional. Pare de perder dinheiro por desorganização.",
      ctaPrimario: "Quero organizar minha carreira",
      ctaSecundario: "Ver como funciona",
    },

    // Problema
    problema: {
      titulo: "O preço da desorganização",
      cards: [
        {
          titulo: "Show esquecido",
          descricao: "Data anotada no caderno, perdida entre outras anotações"
        },
        {
          titulo: "Cachê não cobrado",
          descricao: "Cliente sumiu no WhatsApp e o dinheiro não entrou"
        },
        {
          titulo: "Contrato perdido",
          descricao: "Oportunidade boa que você não conseguiu resgatar"
        },
        {
          titulo: "Financeiro no escuro",
          descricao: "Sem ideia de quanto entra, quanto sai, quanto sobra"
        }
      ]
    },

    // Como funciona
    comoFunciona: {
      badge: "SIMPLES E RÁPIDO",
      titulo: "Como funciona",
      passos: [
        {
          titulo: "Cadastre seus shows",
          descricao: "Adicione datas, locais, valores. Tudo fica salvo e organizado automaticamente."
        },
        {
          titulo: "Gerencie seus clientes",
          descricao: "Salve contatos, histórico e combine orçamentos direto pela plataforma."
        },
        {
          titulo: "Controle o financeiro",
          descricao: "Veja quanto você faturou, quanto gastou e quanto está pendente. Clareza total."
        }
      ]
    },

    // Funcionalidades
    funcionalidades: {
      titulo: "Tudo que você precisa em um só lugar",
      subtitulo: "Funcionalidades pensadas para a rotina do artista independente",
      lista: [
        {
          titulo: "Agenda de Shows",
          descricao: "Organize todas as suas datas com local, horário e detalhes do evento"
        },
        {
          titulo: "Gestão de Clientes",
          descricao: "Centralize contatos, histórico e negociações com contratantes"
        },
        {
          titulo: "Controle de Cachês",
          descricao: "Registre valores, pendências e mantenha o financeiro em dia"
        },
        {
          titulo: "Financeiro Completo",
          descricao: "Receitas, despesas e relatórios para você tomar decisões"
        },
        {
          titulo: "Mapa de Oportunidades",
          descricao: "Descubra novos lugares e contatos para expandir sua agenda"
        },
        {
          titulo: "Central de Mensagens",
          descricao: "Comunicação organizada com clientes e equipe"
        }
      ]
    },

    // Antes x Depois
    antesDepois: {
      titulo: "Antes e depois do Backstage Pro",
      antes: {
        label: "ANTES — Carreira desorganizada",
        itens: [
          "Shows anotados em caderno e WhatsApp",
          "Cachês esquecidos e não cobrados",
          "Contatos perdidos entre conversas",
          "Sem visão clara do financeiro"
        ]
      },
      depois: {
        label: "DEPOIS — Carreira profissional",
        itens: [
          "Agenda centralizada e sempre atualizada",
          "Lembretes automáticos de cobranças",
          "Base de clientes organizada e acessível",
          "Relatórios claros e decisões informadas"
        ]
      }
    },

    // Planos
    planos: {
      titulo: "Escolha o plano ideal para você",
      subtitulo: "Cancele quando quiser, sem complicação"
    },

    // CTA Final
    ctaFinal: {
      titulo: "Pronto para profissionalizar sua carreira?",
      subtitulo: "Comece hoje mesmo a organizar seus shows, clientes e financeiro",
      botao: "Quero começar agora"
    },

    // FAQ
    faq: {
      titulo: "Perguntas frequentes"
    }
  },

  /* ═══════════════════════════════════════════════════════════════
     PLANOS E PREÇOS
     ═══════════════════════════════════════════════════════════════ */
  planos: [
    {
      id: "starter",
      nome: "Starter",
      preco: "R$ 29,90",
      periodo: "/mês",
      destaque: false,
      badge: "PARA COMEÇAR",
      recursos: [
        "Agenda de shows ilimitada",
        "Controle financeiro básico",
        "Até 50 clientes",
        "Repertório e setlist",
        "Tutoriais e suporte"
      ]
    },
    {
      id: "profissional",
      nome: "Profissional",
      preco: "R$ 49,90",
      periodo: "/mês",
      destaque: true, // Plano recomendado (aparece maior e destacado)
      badge: "MAIS POPULAR",
      recursos: [
        "Tudo do Starter",
        "Clientes ilimitados",
        "Contratos automáticos",
        "Orçamentos personalizados",
        "Link da Bio profissional",
        "Mapa de oportunidades",
        "Suporte prioritário"
      ]
    },
    {
      id: "empresarial",
      nome: "Empresarial",
      preco: "R$ 99,90",
      periodo: "/mês",
      destaque: false,
      badge: "COMPLETO",
      recursos: [
        "Tudo do Profissional",
        "Equipe e freelancers ilimitados",
        "Relatórios avançados",
        "Dashboard executivo",
        "API de integração",
        "Gerente de conta dedicado",
        "Suporte 24/7"
      ]
    }
  ],

  /* ═══════════════════════════════════════════════════════════════
     FAQ — PERGUNTAS E RESPOSTAS
     ═══════════════════════════════════════════════════════════════ */
  faq: [
    {
      pergunta: "Como funciona o Backstage Pro?",
      resposta: "O Backstage Pro é uma plataforma web que centraliza toda a gestão da sua carreira musical. Você acessa pelo celular ou computador e organiza agenda, clientes, cachês e oportunidades em um só lugar. Seus dados ficam salvos na nuvem e sincronizados em todos os dispositivos."
    },
    {
      pergunta: "Para quem o Backstage Pro é indicado?",
      resposta: "Para cantores e músicos independentes que fazem shows regularmente e precisam organizar sua carreira de forma profissional. Se você hoje perde tempo entre WhatsApp, caderno e planilha, o Backstage Pro é para você."
    },
    {
      pergunta: "Preciso instalar algum aplicativo?",
      resposta: "Não. O Backstage Pro funciona direto no navegador do seu celular ou computador. Você acessa de qualquer lugar, sem precisar instalar nada. [CONFIRMAR: disponibilidade de app nativo iOS/Android se houver]"
    },
    {
      pergunta: "Como funciona o pagamento?",
      resposta: "[CONFIRMAR: Aceitamos cartão de crédito com cobrança recorrente mensal. O primeiro pagamento é feito no ato da assinatura e renovado automaticamente todo mês. Você pode alterar ou cancelar seu plano a qualquer momento pela área de configurações.]"
    },
    {
      pergunta: "Posso cancelar quando quiser?",
      resposta: "[CONFIRMAR: Sim, você pode cancelar a qualquer momento sem multa ou burocracia. O acesso continua até o fim do período já pago. Não há fidelidade mínima.]"
    },
    {
      pergunta: "Meus dados ficam seguros?",
      resposta: "[CONFIRMAR: Sim. Usamos criptografia SSL/TLS em todas as conexões e seus dados são hospedados em servidores seguros (especificar: AWS/Google Cloud). Estamos em conformidade com a LGPD e fazemos backup automático diário.]"
    },
    {
      pergunta: "Tem suporte se eu precisar de ajuda?",
      resposta: "[CONFIRMAR: Sim! Oferecemos suporte por WhatsApp e email (especificar horário de atendimento). Planos profissionais têm prioridade no atendimento e o plano Empresarial inclui suporte 24/7.]"
    },
    {
      pergunta: "Posso testar antes de assinar?",
      resposta: "[CONFIRMAR: Sim! Oferecemos X dias de teste grátis com acesso a todas as funcionalidades do plano escolhido. Não é necessário cadastrar cartão de crédito para começar.]"
    }
  ],

  /* ═══════════════════════════════════════════════════════════════
     FOOTER
     ═══════════════════════════════════════════════════════════════ */
  footer: {
    descricao: "Plataforma de gestão de carreira para artistas musicais independentes",
    copyright: `© ${new Date().getFullYear()} Backstage Pro. Todos os direitos reservados.`,
    cnpj: "69.458.195/0001-14",
    links: [
      { label: "Termos de Uso", url: "/termos" },
      { label: "Política de Privacidade", url: "/privacidade" },
      { label: "Como funciona", url: "#como-funciona" },
      { label: "Planos", url: "#planos" },
    ]
  }
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS E UTILIDADES
   ═══════════════════════════════════════════════════════════════ */

export const getWhatsAppUrl = () => {
  const number = LANDING_CONFIG.links.whatsappNumber.replace(/\D/g, '');
  const message = encodeURIComponent(LANDING_CONFIG.links.whatsappMessage);
  return `https://wa.me/${number}?text=${message}`;
};

export const getPlanoDestaque = () => {
  return LANDING_CONFIG.planos.find(p => p.destaque) || LANDING_CONFIG.planos[1];
};

export const isOfertaAtiva = () => {
  if (!LANDING_CONFIG.oferta.ativa) return false;
  const now = new Date().getTime();
  const fim = new Date(LANDING_CONFIG.oferta.dataFim).getTime();
  return now < fim;
};
