import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Posso testar Backstage Pro antes de assinar?",
    answer: "Sim! Todos têm 7 dias de acesso completo gratuito. Sem necessidade de cartão de crédito. Você pode testar todas as funcionalidades e cancelar a qualquer momento.",
  },
  {
    question: "Funciona em celular, tablet e computador?",
    answer: "Sim. O Backstage Pro é totalmente responsivo e sincronizado. Acesse de qualquer dispositivo e todos seus dados estarão atualizados em tempo real.",
  },
  {
    question: "Qual a diferença entre os planos?",
    answer: "Cada plano libera novos recursos: Profissional organiza sua operação, Empresarial inclui gestão de equipe e contratos, e Executivo soma o Backs Radar para encontrar oportunidades.",
  },
  {
    question: "O que é o Backs Radar?",
    answer: "É uma ferramenta exclusiva que encontra oportunidades de shows em bares, restaurantes, hotéis e casas de show nas cidades que você escolher. Você vê os contatos e pode enviá-los direto para seu CRM.",
  },
  {
    question: "Meus dados ficam seguros?",
    answer: "Sim, com segurança de nível enterprise. Cada artista acessa apenas seus próprios dados, com criptografia completa e conformidade com LGPD.",
  },
  {
    question: "Posso cancelar minha assinatura?",
    answer: "Sim, sem complicações. Você pode cancelar pelo próprio app a qualquer momento. O acesso permanece até o fim do período já pago.",
  },
  {
    question: "E se eu precisar de ajuda?",
    answer: "Você encontra tutoriais dentro do app, documentação completa e pode contatar nosso suporte pelo WhatsApp ou email. Cada plano tem diferentes níveis de suporte.",
  },
  {
    question: "Vocês oferecem treinamento?",
    answer: "Sim! Oferecemos webinários gratuitos para novos usuários, vídeo-aulas no app e documentação em texto. Também temos um time pronto para ajudar.",
  },
];

export function FAQSection() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-white/5 border-y border-white/10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-violet-400 mb-4 uppercase tracking-wider">
            Dúvidas frequentes
          </p>
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Perguntas comuns respondidas
          </h2>
          <p className="text-xl text-white/60">
            Não encontrou sua dúvida? Fale conosco no WhatsApp.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="border border-white/10 rounded-lg px-6 data-[state=open]:bg-white/5 transition-all"
            >
              <AccordionTrigger className="py-4 hover:no-underline hover:text-violet-400 transition-colors">
                <span className="text-left font-semibold text-lg">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="pt-0 pb-4 text-white/70 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
