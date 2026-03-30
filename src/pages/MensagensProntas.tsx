import { useState } from "react";
import {
  MessageSquareText,
  Copy,
  Check,
  ArrowLeft,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  category: string;
  title: string;
  text: string;
}

const MESSAGES: Message[] = [
  {
    id: "1",
    category: "Primeiro Contato",
    title: "Resposta inicial ao cliente",
    text: `Olá! Tudo bem? 😊

Muito obrigado pelo interesse no nosso trabalho! Ficamos felizes em saber que você está considerando a gente para o seu evento.

Pra montar a melhor proposta pra você, preciso de algumas informações:

📅 Data do evento
📍 Local (cidade e espaço)
⏰ Horário previsto
🎶 Tipo de evento (casamento, corporativo, aniversário...)

Assim que tiver essas informações, envio uma proposta personalizada rapidinho!`,
  },
  {
    id: "2",
    category: "Primeiro Contato",
    title: "Quando o cliente pede o preço direto",
    text: `Entendo perfeitamente! Vou te passar todas as informações. 😊

Nossos valores variam de acordo com o formato do show, quantidade de músicos e localização do evento.

Pra te dar o valor exato (sem surpresas), preciso saber:

📅 Qual a data?
📍 Onde será?
🎶 Que tipo de evento?

Com esses dados consigo montar uma proposta sob medida pra você!`,
  },
  {
    id: "3",
    category: "Negociação",
    title: "Envio de orçamento",
    text: `Segue a proposta para o seu evento! 🎶

📋 PROPOSTA COMERCIAL

🎤 Show: [tipo de show]
📅 Data: [data]
📍 Local: [local]
⏰ Horário: [horário]
💰 Investimento: R$ [valor]

✅ Incluso:
- [item 1]
- [item 2]
- [item 3]

📌 Condições de pagamento: [condições]
⏳ Proposta válida por [X] dias

Qualquer dúvida estou à disposição!`,
  },
  {
    id: "4",
    category: "Negociação",
    title: "Cliente pediu desconto",
    text: `Entendo sua preocupação com o investimento! 😊

O valor que apresentei já é o melhor que consigo oferecer considerando a qualidade do show, equipe envolvida e toda a estrutura que levamos.

Porém, tenho uma condição especial: se fecharmos até [data], consigo manter esse valor com condição de pagamento facilitada.

O que acha? Posso reservar a data pra você?`,
  },
  {
    id: "5",
    category: "Negociação",
    title: "Cliente sumiu depois do orçamento",
    text: `Oi [nome]! Tudo bem? 😊

Passando pra saber se conseguiu analisar a proposta que enviei para o evento do dia [data].

Caso tenha qualquer dúvida ou queira ajustar algum detalhe, estou à disposição!

Ah, um detalhe: a data [data] já teve outras consultas, então se tiver interesse, é bom garantirmos logo. 😉`,
  },
  {
    id: "6",
    category: "Fechamento",
    title: "Confirmação do show",
    text: `Que ótima notícia! Fico muito feliz em fazer parte do seu evento! 🎉

Vou te enviar o contrato para formalizar tudo. Assim que estiver assinado e o sinal confirmado, a data fica oficialmente reservada.

📋 Próximos passos:
1. Assinatura do contrato
2. Pagamento do sinal
3. Alinhamento de detalhes (repertório, horários, etc.)

Qualquer dúvida, pode contar comigo!`,
  },
  {
    id: "7",
    category: "Fechamento",
    title: "Envio do contrato",
    text: `Segue o contrato para o nosso show! 📋

Por favor, leia com atenção e, se estiver tudo certo, assine e me devolva.

📌 Dados para pagamento do sinal:
PIX: [chave]
Valor: R$ [valor do sinal]

Após a confirmação do pagamento, a data fica oficialmente reservada! ✅

Estou à disposição para qualquer dúvida.`,
  },
  {
    id: "8",
    category: "Pós-venda",
    title: "Agradecimento após o show",
    text: `Oi [nome]! 😊

Quero agradecer imensamente pela confiança e pela oportunidade de fazer parte desse momento tão especial!

Foi um prazer tocar no seu evento e esperamos ter contribuído pra tornar tudo ainda mais marcante. 🎶

Se puder, adoraríamos receber seu feedback — e claro, estamos à disposição para próximos eventos!

Um grande abraço! 🙏`,
  },
  {
    id: "9",
    category: "Pós-venda",
    title: "Pedido de indicação",
    text: `Oi [nome]! Tudo bem? 😊

Espero que as lembranças do evento ainda estejam fresquinhas! 🎶

Se alguém próximo de você estiver precisando de música ao vivo pra algum evento, ficarei muito feliz se puder nos indicar!

A melhor propaganda é a de quem já viveu a experiência. 🙏

Grande abraço!`,
  },
];

const CATEGORIES = [...new Set(MESSAGES.map((m) => m.category))];

export default function MensagensProntas() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);

  const handleCopy = async (msg: Message) => {
    try {
      await navigator.clipboard.writeText(msg.text);
      setCopiedId(msg.id);
      toast.success("Mensagem copiada!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const filtered = MESSAGES.filter((m) => m.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate("/kit-profissional")}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold">Mensagens Prontas</h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {filtered.map((msg) => (
            <div
              key={msg.id}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-border bg-secondary/30">
                <h3 className="font-semibold text-sm">{msg.title}</h3>
              </div>
              <div className="p-5">
                <pre className="whitespace-pre-wrap text-sm text-foreground/85 font-sans leading-relaxed">
                  {msg.text}
                </pre>
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    variant={copiedId === msg.id ? "success" : "outline"}
                    onClick={() => handleCopy(msg)}
                    className="gap-2"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="w-4 h-4" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Backstage Pro */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center space-y-4 mt-8">
          <Rocket className="w-10 h-10 text-primary mx-auto" />
          <p className="text-foreground font-semibold text-lg leading-relaxed">
            Agora imagina automatizar tudo isso e responder ainda mais rápido...
          </p>
          <Button
            variant="gradient"
            size="lg"
            className="gap-2"
            onClick={() => (window.location.href = "https://backstagepro.online/landing")}
          >
            Conhecer o Backstage Pro
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
