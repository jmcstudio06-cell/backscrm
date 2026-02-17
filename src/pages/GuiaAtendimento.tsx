import { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, FileText, Clock, CheckCircle, FolderOpen, MapPin,
  AlertTriangle, ArrowRight, ChevronDown, Target, Shield, Zap,
  Send, Users, Calendar, DollarSign, Star, ArrowDown, X,
  Check, AlertCircle, Lightbulb, TrendingUp, Award, Lock, User, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "O Primeiro Contato", icon: MessageCircle },
  { id: 2, title: "Envio do Orçamento", icon: FileText },
  { id: 3, title: "Follow-up", icon: Clock },
  { id: 4, title: "Confirmação", icon: CheckCircle },
  { id: 5, title: "Organização Interna", icon: FolderOpen },
  { id: 6, title: "Mapeamento de Palco", icon: MapPin },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealSection({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function GuiaAtendimento() {
  const [readProgress, setReadProgress] = useState(0);
  const [reflections, setReflections] = useState({
    perdeuVenda: false,
    precoSumiu: false,
    semContrato: false,
    problemaData: false,
    enrolouFinanceiro: false,
  });
  const [budgetType, setBudgetType] = useState<string | null>(null);
  const [guideUnlocked, setGuideUnlocked] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadProgress(Math.min(100, (scrollTop / docHeight) * 100));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const checkedCount = Object.values(reflections).filter(Boolean).length;

  const handleGuideSubmit = async () => {
    if (!leadName.trim() || !leadPhone.trim()) {
      toast.error("Preencha seu nome e telefone para continuar.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("guide_leads" as any)
        .insert({ name: leadName.trim(), phone: leadPhone.trim() } as any);
      if (error) throw error;
      setGuideUnlocked(true);
      toast.success("Guia liberado! Boa leitura.");
      setTimeout(() => {
        document.getElementById("intro")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao confirmar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1">
        <div
          className="h-full transition-all duration-150 ease-out"
          style={{
            width: `${readProgress}%`,
            background: "var(--gradient-primary)",
          }}
        />
      </div>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 mesh-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <Target className="w-4 h-4" />
              Guia exclusivo para artistas
            </div>
          </RevealSection>
          <RevealSection delay={100}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6">
              Guia de Atendimento{" "}
              <span className="gradient-text">Profissional</span>{" "}
              para Artistas
            </h1>
          </RevealSection>
          <RevealSection delay={200}>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              O que separa quem "faz show" de quem constrói carreira.
            </p>
          </RevealSection>
          {!guideUnlocked ? (
            <RevealSection delay={300}>
              <div className="max-w-sm mx-auto p-6 rounded-2xl bg-card/80 backdrop-blur border border-border shadow-card space-y-4">
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Confirme seus dados para acessar o guia completo
                </p>
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Seu nome"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Seu telefone"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  size="xl"
                  variant="gradient"
                  className="w-full rounded-full gap-2 group"
                  onClick={handleGuideSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Confirmando..." : "Continuar para meu guia"}
                  <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </Button>
              </div>
            </RevealSection>
          ) : (
            <RevealSection delay={300}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium">
                <Check className="w-4 h-4" />
                Guia liberado — boa leitura!
              </div>
            </RevealSection>
          )}
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float">
          <ChevronDown className="w-6 h-6 text-muted-foreground/40" />
        </div>
      </section>

      {guideUnlocked && (<>
      {/* INTRO */}
      <section id="intro" className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-6">
          <RevealSection>
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">Introdução</h2>
          </RevealSection>
          <RevealSection delay={100}>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Existe uma diferença silenciosa entre dois tipos de artista:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="p-5 rounded-xl bg-destructive/5 border border-destructive/10">
                <X className="w-5 h-5 text-destructive mb-2" />
                <p className="font-medium text-foreground">O que espera o cliente decidir</p>
              </div>
              <div className="p-5 rounded-xl bg-success/5 border border-success/10">
                <Check className="w-5 h-5 text-success mb-2" />
                <p className="font-medium text-foreground">O que conduz o cliente a fechar</p>
              </div>
            </div>
          </RevealSection>
          <RevealSection delay={150}>
            <div className="space-y-2 text-muted-foreground text-lg mb-8">
              <p>Essa diferença não está na voz.</p>
              <p>Não está no repertório. Não está no talento.</p>
              <p className="text-foreground font-semibold text-xl pt-2">Está no atendimento.</p>
            </div>
            <div className="p-6 rounded-2xl glass border border-border/50 mb-10">
              <p className="text-foreground font-medium text-lg">
                O palco é o que o público vê. Mas o backstage é o que sustenta a carreira. E é aqui que a maioria dos artistas perde dinheiro sem perceber.
              </p>
            </div>
          </RevealSection>

          {/* Self-reflection */}
          <RevealSection delay={200}>
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                  <Lightbulb className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold">Antes de continuar... Responde pra você mesmo:</h3>
              </div>
              <div className="space-y-3">
                {([
                  ["perdeuVenda", "Já perdeu venda por demora?"],
                  ["precoSumiu", "Já mandou preço e o cliente sumiu?"],
                  ["semContrato", "Já esqueceu de formalizar contrato?"],
                  ["problemaData", "Já teve problema com data?"],
                  ["enrolouFinanceiro", "Já se enrolou no financeiro?"],
                ] as const).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <Checkbox
                      checked={reflections[key]}
                      onCheckedChange={(checked) =>
                        setReflections((prev) => ({ ...prev, [key]: !!checked }))
                      }
                    />
                    <span className="text-foreground">{label}</span>
                  </label>
                ))}
              </div>
              {checkedCount >= 2 && (
                <div className="mt-5 p-4 rounded-xl bg-warning/10 border border-warning/20 animate-fade-in">
                  <p className="font-semibold text-foreground">
                    <AlertCircle className="w-4 h-4 inline mr-2 text-warning" />
                    Você não tem problema de talento. Você tem problema de sistema.
                  </p>
                </div>
              )}
            </div>
          </RevealSection>
        </div>
      </section>

      <Separator className="max-w-xl mx-auto" />

      {/* STEP NAVIGATION */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <RevealSection>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {steps.map((step) => (
                <a
                  key={step.id}
                  href={`#etapa-${step.id}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground leading-tight">
                    Etapa {step.id}
                  </span>
                </a>
              ))}
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ETAPA 1 */}
      <StepSection
        id="etapa-1"
        number={1}
        title="O Primeiro Contato"
        subtitle="O erro invisível"
        icon={MessageCircle}
        errorTitle="Erro comum"
        errorContent={
          <>
            <p className="mb-3">Cliente manda: <strong>"Qual o valor do show?"</strong></p>
            <p className="mb-1">O artista responde:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>"Depende da data."</li>
              <li>"Qual cidade?"</li>
              <li>"Quantas horas?"</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Isso parece normal. Mas cria <strong className="text-foreground">insegurança</strong> e <strong className="text-foreground">sensação de improviso</strong>. O cliente sente que está puxando a conversa. E quem puxa negociação, controla negociação.
            </p>
          </>
        }
        proTitle="Forma profissional"
        proContent={
          <>
            <div className="p-4 rounded-xl bg-background/50 border border-border mb-4 font-medium text-foreground">
              "Que massa receber sua mensagem! Pra te passar uma proposta certinha, me confirma só:<br />
              <span className="inline-flex items-center gap-1 mt-2"><MapPin className="w-3.5 h-3.5" /> Cidade</span><br />
              <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Data</span><br />
              <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Tipo de evento</span><br />
              <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Horário</span><br />
              Assim já te envio tudo organizado."
            </div>
            <p className="text-muted-foreground">
              Você assume controle. Demonstra método. Posiciona sua marca como organizada. O cliente te enxerga como <strong className="text-foreground">fornecedor estruturado</strong>, não como músico tentando fechar gig.
            </p>
          </>
        }
      />

      {/* ETAPA 2 */}
      <StepSection
        id="etapa-2"
        number={2}
        title="Envio do Orçamento"
        subtitle="Você virou número?"
        icon={FileText}
        errorTitle="Erro comum"
        errorContent={
          <p>Mandar: <strong>"R$ 3.000."</strong> — Agora você virou número. E número vira comparação.</p>
        }
        proTitle="Forma profissional"
        proContent={
          <>
            <div className="p-4 rounded-xl bg-background/50 border border-border mb-4 font-medium text-foreground">
              "Preparei a proposta do seu evento. Está tudo detalhado: formato, duração e condições. Qualquer ajuste me fala."
            </div>
            <p className="text-muted-foreground mb-2">
              Você não enviou preço. Você enviou <strong className="text-foreground">proposta</strong>.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowRight className="w-4 h-4 text-primary" />
              Proposta comunica estrutura
              <ArrowRight className="w-4 h-4 text-primary" />
              Estrutura comunica segurança
              <ArrowRight className="w-4 h-4 text-primary" />
              Segurança fecha venda
            </div>
          </>
        }
        extra={
          <RevealSection delay={200}>
            <div className="p-6 rounded-2xl bg-card border border-border shadow-card mt-8">
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                Reflexão rápida — Hoje você envia:
              </h4>
              <div className="space-y-3">
                {[
                  ["simple", "Valor simples"],
                  ["organized", "Proposta organizada"],
                  ["integrated", "Proposta + contrato integrado"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                      budgetType === key
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary/50"
                    )}
                    onClick={() => setBudgetType(key)}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      budgetType === key ? "border-primary" : "border-muted-foreground/30"
                    )}>
                      {budgetType === key && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {budgetType && (
                <p className="mt-4 text-sm text-muted-foreground animate-fade-in">
                  Quanto mais alto o nível... <strong className="text-foreground">maior sua taxa de fechamento.</strong>
                </p>
              )}
            </div>
          </RevealSection>
        }
      />

      {/* ETAPA 3 */}
      <StepSection
        id="etapa-3"
        number={3}
        title="Follow-up"
        subtitle="Aqui a maioria perde dinheiro"
        icon={Clock}
        errorTitle="Erro comum"
        errorContent={
          <p>Sumir. Esperar. Mandar <strong>"vai querer?"</strong> — Isso tira autoridade.</p>
        }
        proTitle="Forma estratégica"
        proContent={
          <>
            <div className="p-4 rounded-xl bg-background/50 border border-border mb-4 font-medium text-foreground">
              "Passando pra confirmar se conseguiu analisar. A data está com outra consulta, então queria entender como podemos avançar."
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              {[
                ["Gera urgência leve", Zap],
                ["Mostra controle", Shield],
                ["Mantém postura", Award],
              ].map(([label, Icon]: any) => (
                <div key={label} className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/10">
                  <Icon className="w-4 h-4 text-success" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-muted-foreground">Você não implora. <strong className="text-foreground">Você conduz.</strong></p>
          </>
        }
      />

      {/* ETAPA 4 */}
      <StepSection
        id="etapa-4"
        number={4}
        title="Confirmação"
        subtitle="O amadorismo invisível"
        icon={CheckCircle}
        errorTitle="Erro comum"
        errorContent={
          <p>Cliente diz <strong>"Fechado!"</strong> e você responde <strong>"Show!"</strong> — Sem contrato. Sem formalização. Sem garantia.</p>
        }
        proTitle="Forma profissional"
        proContent={
          <>
            <div className="p-4 rounded-xl bg-background/50 border border-border mb-4 font-medium text-foreground">
              "Perfeito! Vou gerar o contrato e já te envio para formalizarmos. Assim a data fica oficialmente reservada pra você."
            </div>
            <p className="text-muted-foreground">
              Agora você não depende da palavra. Você depende do <strong className="text-foreground">processo</strong>. E processo protege carreira.
            </p>
          </>
        }
      />

      {/* ETAPA 5 */}
      <StepSection
        id="etapa-5"
        number={5}
        title="Organização Interna"
        subtitle="O caos que ninguém vê"
        icon={FolderOpen}
        errorTitle="O problema"
        errorContent={
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              "Agenda em papel",
              "Financeiro em caderno",
              "Contrato perdido",
              "Orçamento na conversa antiga",
              "Datas duplicadas",
              "Cliente esquecido",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        }
        proTitle="A realidade"
        proContent={
          <p className="text-muted-foreground">
            Enquanto você fecha pouco, dá pra segurar. Quando começa a crescer... <strong className="text-foreground">a desorganização começa a custar dinheiro. E reputação.</strong>
          </p>
        }
      />

      {/* ETAPA 6 */}
      <StepSection
        id="etapa-6"
        number={6}
        title="Mapeamento de Palco"
        subtitle="Isso é nível profissional"
        icon={MapPin}
        errorTitle={null}
        errorContent={null}
        proTitle="Quando você envia"
        proContent={
          <>
            <div className="space-y-3 mb-4">
              {["Input list", "Mapa de palco", "Necessidades técnicas"].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-success/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground">
              Você muda o jogo. O contratante sente segurança. O técnico respeita. Você transmite <strong className="text-foreground">padrão</strong>. E padrão constrói marca.
            </p>
          </>
        }
      />

      <Separator className="max-w-xl mx-auto" />

      {/* O PROBLEMA REAL */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-[hsl(220,25%,8%)]" />
        <div className="absolute inset-0 mesh-bg opacity-10" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <RevealSection>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-8">O Problema Real</h2>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              Percebe uma coisa? Tudo que você leu exige:
            </p>
          </RevealSection>
          <RevealSection delay={100}>
            <div className="grid sm:grid-cols-2 gap-3 mb-10">
              {[
                "Modelo estruturado",
                "Agilidade",
                "Geração rápida de proposta",
                "Contrato formal",
                "Agenda integrada",
                "Controle financeiro automático",
                "Documentação técnica",
              ].map((item, i) => (
                <div
                  key={item}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Lock className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-white/90 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </RevealSection>
          <RevealSection delay={200}>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-white/90 text-lg font-medium">
                Você pode fazer manual. Mas manual não escala. <br />
                <span className="text-white font-bold">E carreira é escala.</span>
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* A VIRADA DE CHAVE */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <RevealSection>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              A Virada de Chave
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Atendimento não é conversa.{" "}
              <span className="gradient-text">É sistema.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Artistas que crescem entendem isso. Quando você tem sistema:
            </p>
          </RevealSection>
          <div className="space-y-3">
            {[
              "Responde mais rápido",
              "Fecha mais contratos",
              "Não perde data",
              "Não esquece cliente",
              "Gera contrato em menos de 1 minuto",
              "Organiza financeiro automaticamente",
              "Profissionaliza envio técnico",
            ].map((item, i) => (
              <RevealSection key={item} delay={i * 80}>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span className="font-medium text-foreground">{item}</span>
                </div>
              </RevealSection>
            ))}
          </div>
          <RevealSection delay={600}>
            <p className="text-center text-lg text-muted-foreground mt-10">
              Você para de apagar incêndio. <strong className="text-foreground">Você começa a crescer com controle.</strong>
            </p>
          </RevealSection>
        </div>
      </section>

      {/* BACKSTAGE PRO SECTION */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-primary)", opacity: 0.04 }} />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <RevealSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black mb-4">
                O Backstage é o{" "}
                <span className="gradient-text">Coração</span>{" "}
                Disso Tudo
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Grandes estruturas funcionam porque não dependem de memória. Dependem de processo.
              </p>
            </div>
          </RevealSection>

          {/* Flow */}
          <RevealSection delay={100}>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
              {[
                ["Orçamento", FileText],
                ["Contrato", Shield],
                ["Agenda", Calendar],
                ["Financeiro", DollarSign],
                ["Mapeamento", MapPin],
              ].map(([label, Icon]: any, i, arr) => (
                <div key={label} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-card" style={{ background: "var(--gradient-primary)" }}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-primary/50 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </RevealSection>

          <RevealSection delay={200}>
            <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-elevated text-center">
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-4">
                Em menos de 1 minuto você:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 text-left mb-6">
                {[
                  "Gera proposta profissional",
                  "Converte em contrato",
                  "Reserva a data",
                  "Registra no financeiro",
                  "Organiza agenda",
                  "Envia mapa técnico",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/10">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-sm">
                Tudo integrado. Sem planilha. Sem improviso. Sem risco.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* DECISÃO FINAL */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <RevealSection>
            <h2 className="text-3xl sm:text-4xl font-black mb-8">A Decisão Final</h2>
            <p className="text-lg text-muted-foreground mb-8">Você quer continuar sendo:</p>
          </RevealSection>
          <RevealSection delay={100}>
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10">
                <X className="w-6 h-6 text-destructive mx-auto mb-3" />
                <p className="font-medium">O artista que responde no WhatsApp</p>
              </div>
              <div className="p-6 rounded-2xl bg-success/5 border border-success/10">
                <Check className="w-6 h-6 text-success mx-auto mb-3" />
                <p className="font-medium">O artista que opera como empresa</p>
              </div>
            </div>
          </RevealSection>
          <RevealSection delay={200}>
            <div className="space-y-2 text-lg text-muted-foreground mb-12">
              <p>Talento chama atenção. <strong className="text-foreground">Organização constrói carreira.</strong></p>
              <p>O palco aparece. <strong className="text-foreground">O backstage sustenta.</strong></p>
              <p className="text-foreground font-bold text-xl pt-2">
                E quem controla o backstage controla o crescimento.
              </p>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-primary)", opacity: 0.06 }} />
        <div className="absolute inset-0 mesh-bg opacity-20" />
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <RevealSection>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Pronto para{" "}
              <span className="gradient-text">profissionalizar</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Se você quer estruturar seu atendimento e transformar seu talento em operação profissional...
            </p>
            <Button
              size="xl"
              variant="gradient"
              className="rounded-full gap-2 text-base px-12 py-6 h-auto shadow-float group"
              onClick={() => window.location.href = "/landing"}
            >
              Quero profissionalizar minha carreira agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-muted-foreground mt-6 max-w-md mx-auto">
              Não é sobre ter um app. É sobre ter um sistema que sustenta e escala sua carreira artística.
            </p>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Backstage Pro — O coração da carreira
          </p>
        </div>
      </footer>
      </>)}
    </div>
  );
}

/* Step Section Component */
function StepSection({
  id,
  number,
  title,
  subtitle,
  icon: Icon,
  errorTitle,
  errorContent,
  proTitle,
  proContent,
  extra,
}: {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  icon: any;
  errorTitle: string | null;
  errorContent: React.ReactNode;
  proTitle: string;
  proContent: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <section id={id} className="py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-6">
        <RevealSection>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Etapa {number}</span>
              <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>
            </div>
          </div>
          <p className="text-muted-foreground text-lg mt-2 mb-8">{subtitle}</p>
        </RevealSection>

        {errorTitle && errorContent && (
          <RevealSection delay={100}>
            <div className="p-5 sm:p-6 rounded-2xl bg-destructive/5 border border-destructive/10 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h3 className="font-bold text-destructive">{errorTitle}</h3>
              </div>
              <div className="text-foreground">{errorContent}</div>
            </div>
          </RevealSection>
        )}

        <RevealSection delay={150}>
          <div className="p-5 sm:p-6 rounded-2xl bg-success/5 border border-success/10">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <h3 className="font-bold text-success">{proTitle}</h3>
            </div>
            <div className="text-foreground">{proContent}</div>
          </div>
        </RevealSection>

        {extra}
      </div>
    </section>
  );
}
