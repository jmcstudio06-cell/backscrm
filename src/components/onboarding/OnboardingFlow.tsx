import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Bell,
  Target,
  Rocket,
  Check,
  ChevronRight,
  ChevronLeft,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  Sparkles,
  Flame,
  Zap,
  Trophy,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { subscribeToWebPush } from "@/lib/webPush";
import { toast } from "sonner";
import Confetti from "react-confetti";

interface OnboardingFlowProps {
  open: boolean;
  userName?: string;
  monthName: string;
  onFinish: (goalTarget: number | null) => void;
}

// Capture beforeinstallprompt globally
let deferredPrompt: any = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

const isIOS = () =>
  typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);

const goalOptions = [
  { value: 3, label: "3 shows", icon: Target, description: "Ritmo tranquilo", gradient: "from-emerald-500 to-teal-600" },
  { value: 5, label: "5 shows", icon: Zap, description: "Boa frequência", gradient: "from-blue-500 to-indigo-600" },
  { value: 10, label: "10 shows", icon: Rocket, description: "Alta performance", gradient: "from-violet-500 to-purple-600" },
  { value: 15, label: "+10 shows", icon: Trophy, description: "Máquina de shows!", gradient: "from-amber-500 to-orange-600" },
];

export function OnboardingFlow({ open, userName, monthName, onFinish }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [canAutoInstall, setCanAutoInstall] = useState(!!deferredPrompt);
  const [notifGranted, setNotifGranted] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<number | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Detect already installed
  useEffect(() => {
    if (!open) return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setInstalled(standalone);
    setCanAutoInstall(!!deferredPrompt);
    setNotifGranted(typeof Notification !== "undefined" && Notification.permission === "granted");
    setSize({ width: window.innerWidth, height: window.innerHeight });

    const handler = () => setCanAutoInstall(true);
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [open]);

  // Confetti only on the final celebration step
  useEffect(() => {
    if (step === 3) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(t);
    }
  }, [step]);

  const steps = useMemo(
    () => [
      { id: "install", label: "Instalar app", icon: Smartphone },
      { id: "notifications", label: "Notificações", icon: Bell },
      { id: "goal", label: "Sua meta", icon: Target },
      { id: "ready", label: "Tudo pronto", icon: Rocket },
    ],
    []
  );

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleAutoInstall = async () => {
    if (!deferredPrompt) {
      goNext();
      return;
    }
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
        deferredPrompt = null;
        toast.success("App instalado!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInstalling(false);
      goNext();
    }
  };

  const handleEnableNotif = async () => {
    setNotifLoading(true);
    try {
      const granted = await subscribeToWebPushSafe();
      if (granted) {
        setNotifGranted(true);
        toast.success("Notificações ativadas!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setNotifLoading(false);
      goNext();
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("user_id", user.id);
      }
      localStorage.setItem("install_prompt_dismissed", Date.now().toString());
    } catch (e) {
      console.error(e);
    } finally {
      onFinish(selectedGoal);
    }
  };

  const ios = isIOS();

  return (
    <>
      {showConfetti && (
        <Confetti
          width={size.width}
          height={size.height}
          recycle={false}
          numberOfPieces={300}
          colors={["#0066CC", "#00B4D8", "#FFD700", "#FF6B6B", "#4ECDC4"]}
        />
      )}
      <Dialog open={open}>
        <DialogContent
          className="sm:max-w-lg p-0 overflow-hidden border-0 bg-gradient-to-b from-primary via-primary/95 to-accent [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          {/* Stepper header */}
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between gap-2">
              {steps.map((s, i) => {
                const Icon = s.icon;
                const active = i === step;
                const done = i < step;
                return (
                  <div key={s.id} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                        done && "bg-emerald-400 text-white",
                        active && "bg-white text-primary scale-110 shadow-lg",
                        !done && !active && "bg-white/20 text-white/70"
                      )}
                    >
                      {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium leading-tight text-center hidden sm:block",
                        active ? "text-white" : "text-white/60"
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 h-1 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-300 to-yellow-300 transition-all duration-500"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Body */}
          <div className="px-6 pb-6 pt-4 min-h-[420px] flex flex-col">
            {/* STEP 1 — Install */}
            {step === 0 && (
              <StepContent
                eyebrow="Etapa 1 de 4"
                title={`Boas-vindas, ${userName || "Artista"}! 👋`}
                subtitle="Vamos configurar tudo em 4 passos rápidos. Primeiro, instale o app no seu celular para acesso rápido."
                icon={<Smartphone className="w-10 h-10 text-primary" />}
              >
                {installed ? (
                  <SuccessNote text="O app já está instalado neste dispositivo!" />
                ) : ios ? (
                  <InfoCard>
                    <p className="font-semibold text-white mb-2 text-sm">Como instalar no iPhone:</p>
                    <ol className="space-y-2 text-sm text-white/90">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-cyan-300">1.</span>
                        <span className="flex-1">
                          Toque no botão <Share className="w-4 h-4 inline mx-1" /> <strong>Compartilhar</strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-cyan-300">2.</span>
                        <span className="flex-1">
                          Role e toque em <strong>"Adicionar à Tela de Início"</strong> <PlusSquare className="w-4 h-4 inline mx-1" />
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-cyan-300">3.</span>
                        <span className="flex-1">Confirme tocando em <strong>"Adicionar"</strong></span>
                      </li>
                    </ol>
                  </InfoCard>
                ) : (
                  <InfoCard>
                    <p className="font-semibold text-white mb-2 text-sm">Como instalar no Android:</p>
                    <ol className="space-y-2 text-sm text-white/90">
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-cyan-300">1.</span>
                        <span className="flex-1">
                          Toque no menu <MoreVertical className="w-4 h-4 inline mx-1" /> (três pontinhos)
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-cyan-300">2.</span>
                        <span className="flex-1">
                          Toque em <strong>"Instalar aplicativo"</strong> <Download className="w-4 h-4 inline mx-1" />
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-cyan-300">3.</span>
                        <span className="flex-1">Confirme tocando em <strong>"Instalar"</strong></span>
                      </li>
                    </ol>
                  </InfoCard>
                )}

                <Footer
                  primary={
                    installed ? (
                      <Button onClick={goNext} className="w-full h-12 bg-white text-primary hover:bg-white/90 font-semibold">
                        Continuar <ChevronRight className="w-5 h-5 ml-1" />
                      </Button>
                    ) : ios ? (
                      <Button onClick={goNext} className="w-full h-12 bg-white text-primary hover:bg-white/90 font-semibold">
                        Já adicionei, continuar <ChevronRight className="w-5 h-5 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleAutoInstall}
                        disabled={installing}
                        className="w-full h-12 bg-white text-primary hover:bg-white/90 font-semibold"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        {installing ? "Instalando..." : canAutoInstall ? "Instalar App Agora" : "Instalar App"}
                      </Button>
                    )
                  }
                  secondary={
                    !installed ? (
                      <button onClick={goNext} className="text-white/70 hover:text-white text-sm">
                        Pular esta etapa
                      </button>
                    ) : null
                  }
                />
              </StepContent>
            )}

            {/* STEP 2 — Notifications */}
            {step === 1 && (
              <StepContent
                eyebrow="Etapa 2 de 4"
                title="Ative as notificações 🔔"
                subtitle="Receba lembretes de shows, cobranças e alertas importantes — direto no seu celular."
                icon={<Bell className="w-10 h-10 text-primary" />}
              >
                {notifGranted ? (
                  <SuccessNote text="Notificações já estão ativadas!" />
                ) : (
                  <InfoCard>
                    <ul className="space-y-2 text-sm text-white/90">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                        <span>Lembretes automáticos antes de cada show</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                        <span>Avisos de cobranças e cachês a receber</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                        <span>Novidades e bônus exclusivos da plataforma</span>
                      </li>
                    </ul>
                  </InfoCard>
                )}

                <Footer
                  primary={
                    notifGranted ? (
                      <Button onClick={goNext} className="w-full h-12 bg-white text-primary hover:bg-white/90 font-semibold">
                        Continuar <ChevronRight className="w-5 h-5 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleEnableNotif}
                        disabled={notifLoading}
                        className="w-full h-12 bg-white text-primary hover:bg-white/90 font-semibold"
                      >
                        <Bell className="w-5 h-5 mr-2" />
                        {notifLoading ? "Ativando..." : "Ativar notificações"}
                      </Button>
                    )
                  }
                  secondary={
                    !notifGranted ? (
                      <button onClick={goNext} className="text-white/70 hover:text-white text-sm">
                        Agora não
                      </button>
                    ) : null
                  }
                  back={
                    <button onClick={goBack} className="text-white/70 hover:text-white text-sm flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" /> Voltar
                    </button>
                  }
                />
              </StepContent>
            )}

            {/* STEP 3 — Goal */}
            {step === 2 && (
              <StepContent
                eyebrow="Etapa 3 de 4"
                title="Defina sua meta de shows 🎯"
                subtitle={
                  <>
                    Quantos shows você pretende fazer em{" "}
                    <span className="font-semibold text-white capitalize">{monthName}</span>?
                  </>
                }
                icon={<Target className="w-10 h-10 text-primary" />}
              >
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {goalOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = selectedGoal === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSelectedGoal(option.value)}
                        className={cn(
                          "relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                          isSelected
                            ? "border-white bg-white/20 scale-[1.02] shadow-lg"
                            : "border-white/20 bg-white/5 hover:border-white/50 hover:bg-white/10"
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                            option.gradient
                          )}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-white text-sm">{option.label}</span>
                        <span className="text-[11px] text-white/70 leading-tight text-center">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <Footer
                  primary={
                    <Button
                      onClick={goNext}
                      disabled={selectedGoal === null}
                      className="w-full h-12 bg-white text-primary hover:bg-white/90 font-semibold disabled:opacity-50"
                    >
                      <Flame className="w-5 h-5 mr-2" />
                      Definir meta e continuar
                    </Button>
                  }
                  back={
                    <button onClick={goBack} className="text-white/70 hover:text-white text-sm flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" /> Voltar
                    </button>
                  }
                />
              </StepContent>
            )}

            {/* STEP 4 — Ready */}
            {step === 3 && (
              <StepContent
                eyebrow="Etapa 4 de 4"
                title={`Tudo pronto, ${userName || "Artista"}! 🚀`}
                subtitle="Sua conta está configurada. Vamos começar a transformar a sua carreira agora!"
                icon={<PartyPopper className="w-10 h-10 text-primary" />}
              >
                <InfoCard>
                  <ul className="space-y-2 text-sm text-white/90">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                      <span>{installed ? "App instalado" : "Instruções de instalação visualizadas"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                      <span>{notifGranted ? "Notificações ativadas" : "Notificações configuradas"}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-300 mt-0.5 shrink-0" />
                      <span>
                        {selectedGoal
                          ? `Meta de ${selectedGoal} shows definida para ${monthName}`
                          : "Meta mensal pronta para definir"}
                      </span>
                    </li>
                  </ul>
                </InfoCard>

                <Footer
                  primary={
                    <Button
                      onClick={handleFinish}
                      disabled={finishing}
                      className="w-full h-12 bg-white text-primary hover:bg-white/90 font-semibold"
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      {finishing ? "Abrindo..." : "Começar a usar"}
                    </Button>
                  }
                />
              </StepContent>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------- helpers ---------- */

function StepContent({
  eyebrow,
  title,
  subtitle,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1 animate-fade-in">
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-lg mx-auto mb-3 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-[11px] uppercase tracking-wider text-cyan-200 font-semibold mb-1">
          {eyebrow}
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">{title}</h2>
        <p className="text-sm text-white/85 leading-snug">{subtitle}</p>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4 mb-4">
      {children}
    </div>
  );
}

function SuccessNote({ text }: { text: string }) {
  return (
    <div className="bg-emerald-400/15 border border-emerald-300/40 rounded-xl p-4 mb-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
        <Check className="w-5 h-5 text-white" />
      </div>
      <p className="text-sm text-white font-medium">{text}</p>
    </div>
  );
}

function Footer({
  primary,
  secondary,
  back,
}: {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  back?: React.ReactNode;
}) {
  return (
    <div className="mt-auto pt-2 space-y-2">
      {primary}
      <div className="flex items-center justify-between">
        <div>{back}</div>
        <div>{secondary}</div>
      </div>
    </div>
  );
}

async function subscribeToWebPushSafe(): Promise<boolean> {
  try {
    const result = await subscribeToWebPush();
    return !!result;
  } catch {
    return false;
  }
}
