import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  FileText,
  Clock,
  CheckCircle,
  FolderOpen,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Target,
  Shield,
  Zap,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  User,
  Phone,
  Check,
  AlertCircle,
  Lightbulb,
  X,
  Star,
  Layers,
  Timer,
  Ban,
  ClipboardX,
  Brain,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { insertGuideLeadWithFallback } from "@/lib/guide-leads";
import { toast } from "sonner";

// ─── Anti-sabotage helpers (NAME + PHONE) ─────────────────────────────────────
function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

function normalizeName(v: string) {
  return (v || "").trim().replace(/\s+/g, " ");
}

function isRepeatedCharString(s: string) {
  // ex: aaaaaa, bbbbb, 111111
  if (!s) return false;
  return /^([a-zA-ZÀ-ÿ0-9])\1+$/.test(s);
}

function hasEnoughLetters(name: string) {
  // conta letras (inclui acentos)
  const letters = (name.match(/[A-Za-zÀ-ÿ]/g) || []).length;
  return letters >= 6; // ajuste se quiser mais/menos rigor
}

function isValidFullName(name: string) {
  const n = normalizeName(name);
  if (!n) return false;

  const parts = n.split(" ").filter(Boolean);
  if (parts.length < 2) return false;

  // cada palavra precisa ter pelo menos 2 letras
  const badShort = parts.some((p) => (p.match(/[A-Za-zÀ-ÿ]/g) || []).length < 2);
  if (badShort) return false;

  // bloqueia "aaaaaa"/"bbbbbb" etc
  const compact = n.replace(/\s/g, "");
  if (isRepeatedCharString(compact)) return false;

  // bloqueia nome curto demais em letras (tipo "abcd")
  if (!hasEnoughLetters(n)) return false;

  // opcional: não deixar exagero de caracteres não-letra
  const nonLetters = (n.match(/[^A-Za-zÀ-ÿ\s]/g) || []).length;
  if (nonLetters > 2) return false;

  return true;
}

function isAllSameDigit(phoneDigits: string) {
  return /^(\d)\1+$/.test(phoneDigits);
}

function isValidBRMobile(phoneDigits: string) {
  // BR celular: 11 dígitos (DD + 9xxxx-xxxx)
  if (phoneDigits.length !== 11) return false;
  if (isAllSameDigit(phoneDigits)) return false;

  const ddd = phoneDigits.slice(0, 2);
  const firstAfterDDD = phoneDigits.slice(2, 3);

  if (ddd === "00") return false;
  if (firstAfterDDD !== "9") return false;

  // bloqueia um padrão clássico fake
  if (phoneDigits === "99999999999") return false;

  return true;
}

function formatBRMobileFromDigits(phoneDigits: string) {
  // (XX) XXXXX-XXXX
  const ddd = phoneDigits.slice(0, 2);
  const p1 = phoneDigits.slice(2, 7);
  const p2 = phoneDigits.slice(7, 11);
  return `(${ddd}) ${p1}-${p2}`;
}

function handlePhoneMaskChange(raw: string) {
  const d = onlyDigits(raw).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({
  children,
  className,
  delay = 0,
  from = "bottom",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left" | "right" | "scale";
}) {
  const { ref, visible } = useReveal();
  const hidden =
    from === "bottom"
      ? "opacity-0 translate-y-10"
      : from === "left"
        ? "opacity-0 -translate-x-10"
        : from === "right"
          ? "opacity-0 translate-x-10"
          : "opacity-0 scale-95";

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0 translate-x-0 scale-100" : hidden,
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Steps config ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: "Primeiro Contato", icon: MessageCircle, color: "from-blue-500 to-indigo-600" },
  { id: 2, title: "Envio do Orçamento", icon: FileText, color: "from-blue-400 to-cyan-500" },
  { id: 3, title: "Follow-up", icon: Clock, color: "from-orange-500 to-amber-600" },
  { id: 4, title: "Confirmação", icon: CheckCircle, color: "from-emerald-500 to-teal-600" },
  { id: 5, title: "Organização Interna", icon: FolderOpen, color: "from-blue-600 to-indigo-700" },
  { id: 6, title: "Mapeamento de Palco", icon: MapPin, color: "from-cyan-500 to-sky-600" },
];

// ─── Error / Pro block ────────────────────────────────────────────────────────
function ErrorBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-destructive/10 border-b border-destructive/15">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <span className="text-xs font-bold uppercase tracking-widest text-destructive">Erro comum</span>
      </div>
      <div className="p-5 text-foreground/80 leading-relaxed">{children}</div>
    </div>
  );
}

function ProBlock({ label = "Forma profissional", children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-success/20 bg-success/5 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-success/10 border-b border-success/15">
        <Check className="w-4 h-4 text-success" />
        <span className="text-xs font-bold uppercase tracking-widest text-success">{label}</span>
      </div>
      <div className="p-5 text-foreground/90 leading-relaxed">{children}</div>
    </div>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pl-5 border-l-4 border-primary/40 bg-primary/5 rounded-r-xl py-4 pr-4 my-4 italic text-foreground font-medium">
      {children}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GuiaAtendimento() {
  const [progress, setProgress] = useState(0);
  const [unlocked, setUnlocked] = useState(() => {
    return localStorage.getItem("guia_lead_captured") === "true" || !!localStorage.getItem("kit_profissional_lead");
  });
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadErrors, setLeadErrors] = useState<{ name?: string; phone?: string }>({});
  const [reflections, setReflections] = useState({ r1: false, r2: false, r3: false, r4: false, r5: false });
  const [budgetType, setBudgetType] = useState<string | null>(null);
  const [visibleChecks, setVisibleChecks] = useState(0);

  const handleLeadSubmit = async () => {
    const errors: { name?: string; phone?: string } = {};
    
    if (!isValidFullName(leadName)) {
      errors.name = "Digite seu nome e sobrenome completos (mínimo 2 palavras).";
    }
    
    const phoneDigits = onlyDigits(leadPhone);
    if (!isValidBRMobile(phoneDigits)) {
      errors.phone = "Digite um número de celular válido com DDD (ex: 11 98765-4321).";
    }
    
    // Additional anti-fake: block sequential patterns
    const seqPatterns = ["12345678901", "01234567890", "98765432109"];
    if (seqPatterns.includes(phoneDigits)) {
      errors.phone = "Por favor, insira seu número real de WhatsApp.";
    }
    
    // Block phones where last 8 digits are all same
    const last8 = phoneDigits.slice(3);
    if (last8 && /^(\d)\1+$/.test(last8)) {
      errors.phone = "Por favor, insira seu número real de WhatsApp.";
    }

    if (Object.keys(errors).length > 0) {
      setLeadErrors(errors);
      return;
    }
    
    setLeadErrors({});
    setLeadSubmitting(true);
    
    try {
      await insertGuideLeadWithFallback({
        name: normalizeName(leadName),
        phone: formatBRMobileFromDigits(phoneDigits),
        source: "guia_atendimento",
      });
      
      localStorage.setItem("guia_lead_captured", "true");
      setUnlocked(true);
      toast.success("Acesso liberado! Aproveite o guia.");
    } catch (err) {
      toast.error("Erro ao liberar acesso. Tente novamente.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  // Reading progress
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Animated checklist reveal
  useEffect(() => {
    if (!unlocked) return;
    const benefitsLocal = [
      "Responde mais rápido",
      "Fecha mais contratos",
      "Não perde data",
      "Não esquece cliente",
      "Gera contrato em menos de 1 minuto",
      "Organiza financeiro automaticamente",
      "Profissionaliza envio técnico",
    ];
    let i = 0;
    const id = setInterval(() => {
      i++;
      setVisibleChecks(i);
      if (i >= benefitsLocal.length) clearInterval(id);
    }, 120);
    return () => clearInterval(id);
  }, [unlocked]);

  const checkedCount = Object.values(reflections).filter(Boolean).length;


  const benefits = [
    "Responde mais rápido",
    "Fecha mais contratos",
    "Não perde data",
    "Não esquece cliente",
    "Gera contrato em menos de 1 minuto",
    "Organiza financeiro automaticamente",
    "Profissionaliza envio técnico",
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Reading progress bar ─────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[3px]">
        <div
          className="h-full transition-all duration-100 ease-out"
          style={{ width: `${progress}%`, background: "var(--gradient-primary)" }}
        />
      </div>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,30%,97%)] via-white to-[hsl(250,30%,97%)]" />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
          style={{ background: "var(--gradient-blue)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, hsl(220,25%,10%) 0px, hsl(220,25%,10%) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, hsl(220,25%,10%) 0px, hsl(220,25%,10%) 1px, transparent 1px, transparent 60px)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          {/* Eyebrow */}
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-sm font-semibold mb-8 tracking-wide">
              <Star className="w-3.5 h-3.5 fill-primary" />
              Material exclusivo para artistas
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={80}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              Guia de
              <br />
              <span className="gradient-text">Atendimento</span>
              <br />
              Profissional
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-xl sm:text-2xl text-muted-foreground font-light max-w-lg mx-auto mb-12 leading-relaxed">
              O que separa quem <em>"faz show"</em>
              <br className="hidden sm:block" /> de quem constrói carreira.
            </p>
          </Reveal>

          <Reveal delay={240}>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-success/10 border border-success/25 text-success font-semibold">
                <Check className="w-4 h-4" />
                Role para começar o guia
              </div>
            </Reveal>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-float">
          <ChevronDown className="w-5 h-5 text-muted-foreground/30" />
          <ChevronDown className="w-5 h-5 text-muted-foreground/20 -mt-3" />
        </div>
      </section>

      {/* ── LEAD CAPTURE GATE ────────────────────── */}
      {!unlocked && (
        <section className="py-16 sm:py-24">
          <div className="max-w-lg mx-auto px-6">
            <Reveal>
              <div className="rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
                <div className="px-6 py-5 border-b border-border" style={{ background: "var(--gradient-primary)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Acesso Gratuito</h3>
                      <p className="text-xs text-white/70">Preencha para liberar o guia completo</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label htmlFor="guia-lead-name" className="text-sm font-semibold text-foreground mb-1.5 block">
                      <User className="w-3.5 h-3.5 inline mr-1.5" />
                      Nome e sobrenome
                    </label>
                    <Input
                      id="guia-lead-name"
                      placeholder="Ex: João Silva"
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      className={cn(leadErrors.name && "border-destructive")}
                    />
                    {leadErrors.name && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {leadErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="guia-lead-phone" className="text-sm font-semibold text-foreground mb-1.5 block">
                      <Phone className="w-3.5 h-3.5 inline mr-1.5" />
                      WhatsApp (com DDD)
                    </label>
                    <Input
                      id="guia-lead-phone"
                      placeholder="(11) 98765-4321"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(handlePhoneMaskChange(e.target.value))}
                      maxLength={15}
                      className={cn(leadErrors.phone && "border-destructive")}
                    />
                    {leadErrors.phone && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {leadErrors.phone}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="gradient"
                    className="w-full rounded-xl gap-2 h-12 text-base font-bold"
                    onClick={handleLeadSubmit}
                    disabled={leadSubmitting}
                  >
                    {leadSubmitting ? "Liberando..." : "Liberar Guia Completo"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <p className="text-[10px] text-muted-foreground text-center">
                    Seus dados estão seguros. Não enviamos spam.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── CONTENT (locked) ─────────────────────────── */}
      {unlocked && (
        <>
          {/* ── INTRO ──────────────────────────────────── */}
          <section id="intro" className="pt-24 pb-16 sm:pt-32 sm:pb-20">
            <div className="max-w-3xl mx-auto px-6">
              <Reveal>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Introdução</p>
                <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-8">
                  Existe uma diferença silenciosa entre dois tipos de artista.
                </h2>
              </Reveal>

              <Reveal delay={80}>
                <div className="grid grid-cols-2 gap-3 mb-10">
                  <div className="flex flex-col items-start gap-3 p-5 rounded-2xl bg-destructive/5 border border-destructive/15">
                    <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <X className="w-4 h-4 text-destructive" />
                    </div>
                    <p className="font-semibold text-foreground text-sm leading-snug">O que espera o cliente decidir</p>
                  </div>

                  <div className="flex flex-col items-start gap-3 p-5 rounded-2xl bg-success/5 border border-success/15">
                    <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <p className="font-semibold text-foreground text-sm leading-snug">
                      O que conduz o cliente a fechar
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="space-y-1 text-xl text-muted-foreground mb-6 font-light">
                  <p>Não está na voz.</p>
                  <p>Não está no repertório.</p>
                  <p>Não está no talento.</p>
                </div>
                <p className="text-2xl font-black text-foreground mb-10">Está no atendimento.</p>
              </Reveal>

              <Reveal delay={160}>
                <div className="relative p-6 rounded-2xl bg-card border border-border/80 shadow-card overflow-hidden">
                  <div
                    className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                    style={{ background: "var(--gradient-primary)" }}
                  />
                  <p className="text-foreground/80 leading-relaxed pl-2">
                    O palco é o que o público vê. Mas o <strong className="text-foreground">backstage</strong> é o que
                    sustenta a carreira. E é aqui que a maioria dos artistas perde dinheiro sem perceber.
                  </p>
                </div>
              </Reveal>

              {/* Self-reflection */}
              <Reveal delay={200} className="mt-12">
                <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                  <div
                    className="px-6 py-4 border-b border-border flex items-center gap-3"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <Lightbulb className="w-5 h-5 text-primary-foreground" />
                    <span className="font-bold text-primary-foreground">
                      Antes de continuar — responde pra você mesmo:
                    </span>
                  </div>

                  <div className="p-6 space-y-1">
                    {(
                      [
                        ["r1", "Já perdeu venda por demora?"],
                        ["r2", "Já mandou preço e o cliente sumiu?"],
                        ["r3", "Já esqueceu de formalizar contrato?"],
                        ["r4", "Já teve problema com data?"],
                        ["r5", "Já se enrolou no financeiro?"],
                      ] as const
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer group"
                      >
                        <Checkbox
                          checked={reflections[key]}
                          onCheckedChange={(v) => setReflections((p) => ({ ...p, [key]: !!v }))}
                        />
                        <span className="text-foreground/80 group-hover:text-foreground transition-colors text-sm">
                          {label}
                        </span>
                      </label>
                    ))}

                    {checkedCount >= 2 && (
                      <div className="mt-4 p-4 rounded-xl bg-warning/8 border border-warning/20 animate-fade-in">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                          <p className="text-sm font-semibold text-foreground">
                            Você não tem problema de talento.{" "}
                            <span className="text-warning">Você tem problema de sistema.</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── STEP NAV ───────────────────────────────── */}
          <div className="py-8 border-y border-border bg-secondary/30">
            <div className="max-w-4xl mx-auto px-6">
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide snap-x">
                {STEPS.map((step) => (
                  <a
                    key={step.id}
                    href={`#step-${step.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all group whitespace-nowrap snap-start shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0",
                        step.color,
                      )}
                    >
                      <step.icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span>Etapa {step.id}</span>
                  </a>
                ))}

                <a
                  href="#erros-invisíveis"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/8 border border-destructive/20 hover:border-destructive/40 hover:shadow-card transition-all group whitespace-nowrap snap-start shrink-0 text-sm font-medium text-destructive/80 hover:text-destructive"
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-destructive/20 shrink-0">
                    <Ban className="w-3.5 h-3.5 text-destructive" />
                  </div>
                  <span>Erros Invisíveis</span>
                </a>
              </div>
            </div>
          </div>

          {/* ── ETAPA 1 ────────────────────────────────── */}
          <StepSection id="step-1" step={STEPS[0]}>
            <Reveal>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Cliente manda: <strong className="text-foreground">"Qual o valor do show?"</strong>
              </p>
            </Reveal>

            <Reveal delay={80}>
              <ErrorBlock>
                <p className="mb-3 font-medium">O artista responde:</p>
                <div className="space-y-1.5">
                  {['"Depende da data."', '"Qual cidade?"', '"Quantas horas?"'].map((t) => (
                    <div key={t} className="flex items-center gap-2 text-muted-foreground">
                      <X className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Parece normal. Mas cria <strong className="text-foreground">insegurança</strong> e{" "}
                  <strong className="text-foreground">sensação de improviso</strong>. O cliente sente que está puxando a
                  conversa. E quem puxa negociação, controla negociação.
                </p>
              </ErrorBlock>
            </Reveal>

            <Reveal delay={160}>
              <ProBlock>
                <p className="text-sm text-muted-foreground mb-3">Em vez de reagir, conduza:</p>
                <Quote>
                  "Que massa receber sua mensagem! Pra te passar uma proposta certinha, me confirma só:"
                  <div className="mt-3 space-y-1.5 not-italic font-semibold text-foreground text-sm">
                    {[
                      [MapPin, "Cidade"],
                      [Calendar, "Data"],
                      [Star, "Tipo de evento"],
                      [Clock, "Horário"],
                    ].map(([Icon, label]: any) => (
                      <div key={label} className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                        {label}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3">"Assim já te envio tudo organizado."</p>
                </Quote>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  {[
                    "Você assume controle",
                    "Demonstra método",
                    "Posiciona sua marca",
                    "Cliente te vê como empresa",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-foreground/80">
                      <Check className="w-3.5 h-3.5 text-success shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </ProBlock>
            </Reveal>
          </StepSection>

          {/* ── ETAPA 2 ────────────────────────────────── */}
          <StepSection id="step-2" step={STEPS[1]}>
            <Reveal>
              <ErrorBlock>
                <p>
                  Mandar: <strong className="text-xl text-foreground">"R$ 3.000."</strong>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Agora você virou número. E número vira comparação. Comparação vira leilão.
                </p>
              </ErrorBlock>
            </Reveal>

            <Reveal delay={100}>
              <ProBlock>
                <Quote>
                  "Preparei a proposta do seu evento. Está tudo detalhado: formato, duração e condições. Qualquer ajuste
                  me fala."
                </Quote>

                <div className="flex flex-wrap items-center gap-2 mt-4 text-sm">
                  {[
                    ["Proposta", "estrutura"],
                    ["Estrutura", "segurança"],
                    ["Segurança", "fecha venda"],
                  ].map(([cause, effect], i, arr) => (
                    <div key={cause} className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success font-semibold">
                        {cause}
                      </span>
                      {i < arr.length - 1 && (
                        <>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                          <span className="text-muted-foreground text-xs">{effect}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ProBlock>
            </Reveal>

            {/* Reflection */}
            <Reveal delay={200}>
              <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-warning" />
                  <span className="font-bold text-sm">Reflexão rápida — Hoje você envia:</span>
                </div>

                <div className="space-y-2">
                  {[
                    { key: "simple", label: "Valor simples", desc: "Taxa de fechamento baixa" },
                    { key: "organized", label: "Proposta organizada", desc: "Taxa de fechamento média" },
                    { key: "integrated", label: "Proposta + contrato integrado", desc: "Taxa de fechamento alta" },
                  ].map(({ key, label, desc }) => (
                    <button
                      key={key}
                      onClick={() => setBudgetType(key)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                        budgetType === key ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                            budgetType === key ? "border-primary" : "border-muted-foreground/30",
                          )}
                        >
                          {budgetType === key && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <span className="font-medium text-sm">{label}</span>
                      </div>

                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          budgetType === key ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>

                {budgetType && (
                  <p className="mt-4 text-sm text-muted-foreground animate-fade-in">
                    Quanto mais alto o nível… <strong className="text-foreground">maior sua taxa de fechamento.</strong>
                  </p>
                )}
              </div>
            </Reveal>
          </StepSection>

          {/* ── ETAPA 3 ────────────────────────────────── */}
          <StepSection id="step-3" step={STEPS[2]}>
            <Reveal>
              <div className="p-5 rounded-2xl bg-warning/8 border border-warning/20 mb-6">
                <p className="font-bold text-foreground mb-1">Aqui a maioria perde dinheiro.</p>
                <p className="text-sm text-muted-foreground">É o ponto mais negligenciado da jornada de vendas.</p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <ErrorBlock>
                <p>
                  Sumir. Esperar. Mandar <strong>"vai querer?"</strong>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">Isso não é gentileza. É perda de autoridade.</p>
              </ErrorBlock>
            </Reveal>

            <Reveal delay={160}>
              <ProBlock label="Forma estratégica">
                <Quote>
                  "Passando pra confirmar se conseguiu analisar. A data está com outra consulta, então queria entender
                  como podemos avançar."
                </Quote>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    [Zap, "Gera urgência leve"],
                    [Shield, "Mostra controle"],
                    [Award, "Mantém postura"],
                  ].map(([Icon, label]: any) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/10 text-center"
                    >
                      <Icon className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-foreground/80">{label}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-sm font-semibold text-foreground">
                  Você não implora. <span className="text-success">Você conduz.</span>
                </p>
              </ProBlock>
            </Reveal>
          </StepSection>

          {/* ── ERROS INVISÍVEIS ───────────────────────── */}
          <section id="erros-invisíveis" className="py-24 sm:py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[hsl(10,40%,6%)]" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 60px)",
              }}
            />
            <div
              className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl opacity-8"
              style={{ background: "radial-gradient(circle, hsl(10,60%,30%) 0%, transparent 70%)" }}
            />

            <div className="relative z-10 max-w-3xl mx-auto px-6">
              {/* Header */}
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/20 border border-destructive/30 text-[hsl(10,80%,70%)] text-xs font-bold uppercase tracking-widest mb-8">
                  <Ban className="w-3.5 h-3.5" />
                  Erros invisíveis
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4">
                  Erros que te tiram
                  <br />
                  <span style={{ color: "hsl(10,80%,65%)" }}>automaticamente</span>
                  <br />
                  da venda.
                </h2>
                <p className="text-white/50 text-lg mb-14 leading-relaxed">
                  Nenhum deles aparece no palco. Todos aparecem na conta bancária.
                </p>
              </Reveal>

              <div className="space-y-6">
                {/* Erro 1 */}
                <Reveal delay={60}>
                  <div className="rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-white/4">
                      <div className="w-7 h-7 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                        <Timer className="w-3.5 h-3.5 text-destructive" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/80 block">
                          Erro 1
                        </span>
                        <span className="font-bold text-white text-sm">Esperar o cliente puxar a conversa</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/15">
                        <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-white/70 text-sm">Você envia a proposta e espera o cliente responder.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/4 border border-white/8">
                        <p className="text-white/50 text-xs mb-1 uppercase tracking-wider font-bold">
                          O que o cliente interpreta
                        </p>
                        <p className="text-white/80 text-sm">
                          Falta de prioridade. Falta de controle. Falta de processo.
                        </p>
                      </div>
                      <div className="flex gap-2 p-3 rounded-xl bg-white/6 border border-white/10">
                        <Check className="w-4 h-4 text-[hsl(150,60%,55%)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/50 text-xs mb-1 uppercase tracking-wider font-bold">Forma correta</p>
                          <p className="text-white/90 text-sm font-semibold mb-2">Sempre faça follow-up.</p>
                          <div className="pl-3 border-l-2 border-white/15 italic text-white/60 text-sm leading-relaxed">
                            "Passando pra confirmar se conseguiu analisar a proposta. A data está com outras consultas e
                            queria entender como podemos avançar."
                          </div>
                        </div>
                      </div>
                      <p className="text-center font-black text-white/90 text-sm pt-1">
                        Quem conduz, fecha. Quem espera, assiste.
                      </p>
                    </div>
                  </div>
                </Reveal>

                {/* Erro 2 */}
                <Reveal delay={100}>
                  <div className="rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-white/4">
                      <div className="w-7 h-7 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-destructive" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/80 block">
                          Erro 2
                        </span>
                        <span className="font-bold text-white text-sm">Demorar para responder</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/15">
                        <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-white/70 text-sm">Responder horas depois. Ou no dia seguinte.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/4 border border-white/8">
                        <p className="text-white/50 text-xs mb-2 uppercase tracking-wider font-bold">
                          O que o cliente pensa
                        </p>
                        <p className="text-white/70 text-sm italic">
                          "Se demora pra responder agora, vai demorar no evento?"
                        </p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/6 border border-white/10">
                        <Zap className="w-4 h-4 text-[hsl(150,60%,55%)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/50 text-xs mb-1 uppercase tracking-wider font-bold">Regra prática</p>
                          <p className="text-white/90 text-sm font-semibold">Responda o mais rápido possível.</p>
                          <p className="text-white/50 text-xs mt-1">Velocidade transmite profissionalismo.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Erro 3 */}
                <Reveal delay={140}>
                  <div className="rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-white/4">
                      <div className="w-7 h-7 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                        <DollarSign className="w-3.5 h-3.5 text-destructive" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/80 block">
                          Erro 3
                        </span>
                        <span className="font-bold text-white text-sm">Mandar apenas o preço</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="text-center p-5 rounded-xl bg-destructive/10 border border-destructive/15">
                        <p className="text-4xl font-black text-white/90 mb-2">R$ 2.500</p>
                        <p className="text-destructive text-sm font-medium">Você virou número.</p>
                        <p className="text-white/40 text-xs mt-1">
                          Número vira comparação. Comparação vira perda de valor.
                        </p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/6 border border-white/10">
                        <FileText className="w-4 h-4 text-[hsl(150,60%,55%)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/50 text-xs mb-1 uppercase tracking-wider font-bold">
                            Forma profissional
                          </p>
                          <p className="text-white/90 text-sm font-semibold">Sempre envie proposta estruturada.</p>
                          <p className="text-white/50 text-xs mt-1">Estrutura aumenta percepção de valor.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Erro 4 */}
                <Reveal delay={180}>
                  <div className="rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-white/4">
                      <div className="w-7 h-7 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                        <MessageCircle className="w-3.5 h-3.5 text-destructive" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/80 block">
                          Erro 4
                        </span>
                        <span className="font-bold text-white text-sm">Não assumir controle da negociação</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/15">
                        <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-white/70 text-sm">Ficar apenas respondendo perguntas.</p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/6 border border-white/10">
                        <ArrowRight className="w-4 h-4 text-[hsl(150,60%,55%)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/50 text-xs mb-1 uppercase tracking-wider font-bold">
                            Forma profissional
                          </p>
                          <p className="text-white/90 text-sm font-semibold mb-2">Conduzir o processo.</p>
                          <div className="pl-3 border-l-2 border-white/15 italic text-white/60 text-sm">
                            "Vou preparar a proposta completa e já te envio."
                          </div>
                          <p className="text-white/40 text-xs mt-2">Você lidera. O cliente segue.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Erro 5 */}
                <Reveal delay={220}>
                  <div className="rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-white/4">
                      <div className="w-7 h-7 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                        <ClipboardX className="w-3.5 h-3.5 text-destructive" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/80 block">
                          Erro 5
                        </span>
                        <span className="font-bold text-white text-sm">Não formalizar rapidamente</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/15 space-y-1">
                        <p className="text-white/70 text-sm">
                          Cliente diz <strong className="text-white">"Fechado"</strong> — e você não envia contrato
                          imediatamente.
                        </p>
                        <p className="text-destructive text-xs font-semibold mt-2">
                          Outro artista pode assumir sua data.
                        </p>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-white/6 border border-white/10">
                        <Shield className="w-4 h-4 text-[hsl(150,60%,55%)] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-white/50 text-xs mb-1 uppercase tracking-wider font-bold">
                            Forma profissional
                          </p>
                          <p className="text-white/90 text-sm font-semibold">Formalize imediatamente.</p>
                          <p className="text-white/50 text-xs mt-1">Contrato reserva a data. Não a conversa.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>

                {/* Erro 6 */}
                <Reveal delay={260}>
                  <div className="rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-white/4">
                      <div className="w-7 h-7 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                        <Brain className="w-3.5 h-3.5 text-destructive" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/80 block">
                          Erro 6
                        </span>
                        <span className="font-bold text-white text-sm">Confiar na memória</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/15">
                        <X className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <p className="text-white/70 text-sm">Guardar informações na cabeça ou no WhatsApp.</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {["Datas perdidas", "Clientes esquecidos", "Dinheiro não registrado"].map((item) => (
                          <div
                            key={item}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/4 border border-white/8 text-center"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                            <span className="text-white/60 text-xs font-medium">{item}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-center text-white/90 font-black text-sm pt-1">Memória falha. Sistema não.</p>
                    </div>
                  </div>
                </Reveal>

                {/* Erro 7 */}
                <Reveal delay={300}>
                  <div className="rounded-2xl border border-white/8 bg-white/4 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8 bg-white/4">
                      <div className="w-7 h-7 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                        <EyeOff className="w-3.5 h-3.5 text-destructive" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-destructive/80 block">
                          Erro 7
                        </span>
                        <span className="font-bold text-white text-sm">Parecer amador sem perceber</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <p className="text-white/50 text-xs uppercase tracking-wider font-bold mb-1">
                        Pequenos sinais que reduzem sua taxa de fechamento:
                      </p>
                      <div className="space-y-2">
                        {[
                          "Responder sem estrutura",
                          "Não ter proposta organizada",
                          "Não ter contrato",
                          "Não ter processo claro",
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/8 border border-destructive/12"
                          >
                            <X className="w-3.5 h-3.5 text-destructive shrink-0" />
                            <span className="text-white/70 text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/6 text-center">
                        <p className="text-white/60 text-sm">O cliente não compra apenas o show.</p>
                        <p className="text-white font-black text-base mt-1">Ele compra segurança.</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Frase isolada de impacto */}
              <Reveal delay={360} className="mt-16">
                <div
                  className="relative rounded-3xl overflow-hidden border border-white/10 p-10 text-center"
                  style={{ background: "linear-gradient(135deg, hsl(10,40%,8%) 0%, hsl(222,35%,10%) 100%)" }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{ background: "radial-gradient(circle at 50% 0%, hsl(10,60%,25%) 0%, transparent 70%)" }}
                  />
                  <div className="relative z-10">
                    <p className="text-white/40 text-sm uppercase tracking-widest font-bold mb-6">
                      A verdade que muda tudo
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      Contratantes não fecham com o artista
                      <br />
                      mais <span style={{ color: "hsl(10,80%,65%)" }}>talentoso.</span>
                    </p>
                    <p className="text-2xl sm:text-3xl font-black text-white mt-2 leading-tight">
                      Fecham com o artista que transmite
                      <br />
                      mais <span style={{ color: "hsl(150,60%,60%)" }}>segurança.</span>
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* Regra profissional simples */}
              <Reveal delay={420} className="mt-6">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
                  <p className="text-white/40 text-xs uppercase tracking-widest font-bold mb-5 text-center">
                    Regra profissional simples
                  </p>
                  <div className="space-y-3">
                    {[
                      { icon: Timer, text: "Quem responde primeiro, fecha mais." },
                      { icon: ArrowRight, text: "Quem conduz, fecha mais." },
                      { icon: Zap, text: "Quem tem sistema, cresce mais." },
                    ].map(({ icon: Icon, text }) => (
                      <div
                        key={text}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/8"
                      >
                        <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-bold text-white/90 text-sm">{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── ETAPA 4 ────────────────────────────────── */}
          <StepSection id="step-4" step={STEPS[3]}>
            <Reveal>
              <ErrorBlock>
                <p>
                  Cliente diz: <strong>"Fechado!"</strong>
                </p>
                <p className="mt-2">
                  Você responde: <strong>"Show!"</strong>
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Sem contrato. Sem formalização. Sem garantia. Isso é{" "}
                  <strong className="text-destructive">amadorismo invisível</strong>.
                </p>
              </ErrorBlock>
            </Reveal>

            <Reveal delay={100}>
              <ProBlock>
                <Quote>
                  "Perfeito! Vou gerar o contrato e já te envio para formalizarmos. Assim a data fica oficialmente
                  reservada pra você."
                </Quote>
                <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border">
                  <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Processo protege carreira.</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Você não depende de palavra. Você depende de contrato.
                    </p>
                  </div>
                </div>
              </ProBlock>
            </Reveal>
          </StepSection>

          {/* ── ETAPA 5 ────────────────────────────────── */}
          <StepSection id="step-5" step={STEPS[4]}>
            <Reveal>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Aqui está o caos que ninguém vê — mas todo mundo sente.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <ErrorBlock>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Agenda em papel",
                    "Financeiro em caderno",
                    "Contrato perdido",
                    "Orçamento na conversa",
                    "Datas duplicadas",
                    "Cliente esquecido",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </ErrorBlock>
            </Reveal>

            <Reveal delay={160}>
              <div className="p-5 rounded-2xl border border-border bg-card shadow-card">
                <p className="text-foreground/80 leading-relaxed text-sm">
                  Enquanto você fecha pouco, dá pra segurar.
                  <br />
                  Quando começa a crescer…
                </p>
                <p className="mt-3 font-bold text-foreground">
                  A desorganização começa a custar dinheiro. E reputação.
                </p>
              </div>
            </Reveal>
          </StepSection>

          {/* ── ETAPA 6 ────────────────────────────────── */}
          <StepSection id="step-6" step={STEPS[5]}>
            <Reveal>
              <p className="text-lg text-muted-foreground mb-6">
                Quando você envia mapa de palco e input list, você muda o jogo.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <ProBlock label="Nível profissional">
                <div className="space-y-3 mb-5">
                  {["Input list detalhado", "Mapa de palco visual", "Necessidades técnicas listadas"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                      <span className="font-medium text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  O contratante sente segurança. O técnico respeita. Você transmite{" "}
                  <strong className="text-foreground">padrão</strong>. E padrão constrói marca.
                </p>
              </ProBlock>
            </Reveal>
          </StepSection>

          {/* ── O PROBLEMA REAL ─────────────────────────── */}
          <section className="py-24 sm:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-[hsl(222,35%,9%)]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 60px)",
              }}
            />
            <div
              className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-10"
              style={{ background: "var(--gradient-primary)" }}
            />

            <div className="relative z-10 max-w-3xl mx-auto px-6">
              <Reveal>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">O Problema Real</p>
                <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
                  Tudo que você leu exige estrutura.
                </h2>
                <p className="text-white/50 text-lg leading-relaxed mb-12">
                  Modelo estruturado. Agilidade. Proposta rápida. Contrato formal. Agenda integrada. Controle
                  financeiro. Documentação técnica.
                </p>
              </Reveal>

              <Reveal delay={100}>
                <div className="grid gap-3 mb-10">
                  {[
                    ["Modelo estruturado", Layers],
                    ["Geração rápida de proposta", Zap],
                    ["Contrato formal", Shield],
                    ["Agenda integrada", Calendar],
                    ["Controle financeiro automático", DollarSign],
                    ["Documentação técnica de palco", MapPin],
                  ].map(([label, Icon]: any, i) => (
                    <Reveal key={label} delay={i * 60}>
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-white/80 font-medium text-sm">{label}</span>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                  <p className="text-white/70 leading-relaxed mb-2">Você pode fazer tudo isso manual.</p>
                  <p className="text-white text-xl font-black">Mas manual não escala. E carreira é escala.</p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── A VIRADA DE CHAVE ──────────────────────── */}
          <section className="py-24 sm:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/3 to-background" />
            <div className="relative z-10 max-w-3xl mx-auto px-6">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 text-success text-xs font-bold uppercase tracking-widest mb-8">
                  <TrendingUp className="w-3.5 h-3.5" />A Virada de Chave
                </div>
                <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-4">Atendimento não é conversa.</h2>
                <h2 className="text-4xl sm:text-5xl font-black gradient-text leading-tight mb-8">É sistema.</h2>
                <p className="text-lg text-muted-foreground mb-12">
                  Artistas que crescem entendem isso. Quando você tem sistema:
                </p>
              </Reveal>

              <div className="space-y-3">
                {benefits.map((item, i) => (
                  <div
                    key={item}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl border transition-all duration-500",
                      i < visibleChecks
                        ? "bg-card border-success/20 shadow-sm opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4 border-border",
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                        i < visibleChecks ? "bg-success/15" : "bg-secondary",
                      )}
                    >
                      <Check
                        className={cn(
                          "w-4 h-4 transition-colors",
                          i < visibleChecks ? "text-success" : "text-muted-foreground/30",
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "font-medium text-sm transition-colors",
                        i < visibleChecks ? "text-foreground" : "text-muted-foreground/30",
                      )}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <Reveal delay={900}>
                <p className="text-center text-lg text-muted-foreground mt-12 font-light">
                  Você para de apagar incêndio.{" "}
                  <strong className="text-foreground font-black">Você começa a crescer com controle.</strong>
                </p>
              </Reveal>
            </div>
          </section>

          {/* ── BACKSTAGE PRO ──────────────────────────── */}
          <section className="py-24 sm:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background to-primary/3" />
            <div className="relative z-10 max-w-3xl mx-auto px-6">
              <Reveal>
                <div className="text-center mb-16">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">O Backstage Pro</p>
                  <h2 className="text-4xl sm:text-5xl font-black leading-tight mb-6">
                    O backstage é o <span className="gradient-text">coração</span> disso tudo.
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    Grandes estruturas funcionam porque não dependem de memória. Dependem de processo.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="mb-12">
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {[
                      { label: "Orçamento", icon: FileText },
                      { label: "Contrato", icon: Shield },
                      { label: "Agenda", icon: Calendar },
                      { label: "Financeiro", icon: DollarSign },
                      { label: "Palco", icon: MapPin },
                    ].map(({ label, icon: Icon }, i, arr) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-elevated"
                            style={{ background: "var(--gradient-primary)" }}
                          >
                            <Icon className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                        </div>
                        {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-primary/40 shrink-0 mb-4" />}
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="rounded-3xl border border-border bg-card shadow-elevated overflow-hidden">
                  <div
                    className="px-6 py-4 border-b border-border flex items-center justify-between"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-primary-foreground" />
                      <span className="font-bold text-primary-foreground">Em menos de 1 minuto você:</span>
                    </div>
                    <span className="text-xs font-bold text-primary-foreground/70 bg-white/10 px-3 py-1 rounded-full">
                      Tudo integrado
                    </span>
                  </div>

                  <div className="p-6 grid sm:grid-cols-2 gap-3">
                    {[
                      "Gera proposta profissional",
                      "Converte em contrato",
                      "Reserva a data na agenda",
                      "Registra no financeiro",
                      "Organiza a equipe",
                      "Envia mapa técnico de palco",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/10"
                      >
                        <CheckCircle className="w-4 h-4 text-success shrink-0" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="px-6 pb-6">
                    <p className="text-center text-sm text-muted-foreground">Sem planilha. Sem improviso. Sem risco.</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── DECISÃO FINAL ──────────────────────────── */}
          <section className="py-16 sm:py-24">
            <div className="max-w-3xl mx-auto px-6">
              <Reveal>
                <h2 className="text-3xl sm:text-4xl font-black text-center mb-10">A Decisão Final</h2>
              </Reveal>

              <Reveal delay={80}>
                <div className="grid sm:grid-cols-2 gap-4 mb-12">
                  <div className="flex flex-col gap-4 p-6 rounded-2xl bg-destructive/5 border border-destructive/15 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
                      <MessageCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <p className="font-bold text-foreground">O artista que responde no WhatsApp</p>
                    <p className="text-xs text-muted-foreground">Reativo. Sem processo. Depende da sorte.</p>
                  </div>

                  <div className="flex flex-col gap-4 p-6 rounded-2xl bg-success/5 border border-success/15 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                      <TrendingUp className="w-6 h-6 text-success" />
                    </div>
                    <p className="font-bold text-foreground">O artista que opera como empresa</p>
                    <p className="text-xs text-muted-foreground">Proativo. Com sistema. Cresce com controle.</p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={160}>
                <div className="text-center space-y-3 text-lg font-light">
                  <p className="text-muted-foreground">
                    Talento chama atenção.{" "}
                    <strong className="text-foreground font-black">Organização constrói carreira.</strong>
                  </p>
                  <p className="text-muted-foreground">
                    O palco aparece. <strong className="text-foreground font-black">O backstage sustenta.</strong>
                  </p>
                  <p className="text-xl font-black text-foreground mt-6">
                    E quem controla o backstage controla o crescimento.
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ── CTA FINAL ──────────────────────────────── */}
          <section className="py-24 sm:py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-[hsl(222,35%,9%)]" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 60px)",
              }}
            />
            <div className="absolute inset-0 mesh-bg opacity-15" />

            <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest mb-8">
                  <Target className="w-3.5 h-3.5" />
                  Próximo passo
                </div>

                <h2 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-6">
                  Estruture seu atendimento.
                  <br />
                  <span className="gradient-text">Profissionalize sua carreira.</span>
                </h2>

                <p className="text-white/50 text-lg mb-12 leading-relaxed">
                  Se você chegou até aqui, já entendeu que talento não é suficiente.
                  <br />O sistema é o que separa o artista que cresce do que estagna.
                </p>

                <Button
                  size="xl"
                  variant="gradient"
                  className="rounded-2xl gap-3 text-base px-10 py-6 h-auto shadow-float group font-bold"
                  onClick={() => (window.location.href = "https://backstagepro.online/landing")}
                >
                  Quero profissionalizar minha carreira agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-white/30 text-sm mt-6 max-w-sm mx-auto leading-relaxed">
                  Não é sobre ter um app. É sobre ter um sistema que sustenta e escala sua carreira artística.
                </p>
              </Reveal>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 border-t border-border bg-background">
            <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground font-medium">Backstage Pro</p>
              <p className="text-xs text-muted-foreground/50">O coração da carreira artística</p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

// ─── Step section wrapper ─────────────────────────────────────────────────────
function StepSection({ id, step, children }: { id: string; step: (typeof STEPS)[0]; children: React.ReactNode }) {
  return (
    <section id={id} className="py-20 sm:py-24">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal className="mb-10">
          <div className="flex items-start gap-5">
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-lg",
                step.color,
              )}
            >
              <step.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Etapa {step.id} de {STEPS.length}
              </p>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">{step.title}</h2>
            </div>
          </div>
        </Reveal>
        <div className="space-y-5">{children}</div>
      </div>
    </section>
  );
}
