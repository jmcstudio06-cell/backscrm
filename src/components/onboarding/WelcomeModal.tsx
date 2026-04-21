import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  PartyPopper,
  Rocket,
  Star,
  ArrowRight,
  Smartphone,
  Share,
  PlusSquare,
  MoreVertical,
  Download,
  Check,
  Globe,
  ArrowDown,
  Hand,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAppSettings } from "@/hooks/useAppSettings";
import { subscribeToWebPush } from "@/lib/webPush";
import Confetti from "react-confetti";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

let deferredPrompt: any = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

const installSteps = [
  {
    platform: "access",
    title: "Passo 1: Acesse o site",
    icon: Globe,
    color: "bg-[#0066CC]",
    illustration: "browser",
    steps: [
      { icon: Globe, text: "Abra o navegador do seu celular (Safari no iPhone ou Chrome no Android)" },
      { icon: ArrowRight, text: "Digite: backstagepro.online" },
      { icon: Check, text: "Faça login com seu email e senha" },
    ],
  },
  {
    platform: "ios",
    title: "Passo 2: iPhone/iPad",
    icon: Smartphone,
    color: "bg-slate-800",
    illustration: "ios",
    steps: [
      { icon: Share, text: "Toque no ícone de Compartilhar (quadrado com seta)" },
      { icon: ArrowDown, text: "Role para baixo na lista de opções" },
      { icon: PlusSquare, text: 'Toque em "Adicionar à Tela de Início"' },
    ],
  },
  {
    platform: "android",
    title: "Passo 2: Android",
    icon: Smartphone,
    color: "bg-emerald-500",
    illustration: "android",
    steps: [
      { icon: MoreVertical, text: "Toque no menu (⋮ três pontinhos)" },
      { icon: Download, text: 'Toque em "Instalar aplicativo"' },
      { icon: Check, text: 'Confirme tocando em "Instalar"' },
    ],
  },
];

const PhoneMockup = ({ platform, logoUrl }: { platform: string; logoUrl?: string }) => {
  if (platform === "browser") {
    return (
      <div className="relative w-48 h-72 mx-auto">
        <div className="absolute inset-0 bg-slate-800 rounded-[2rem] shadow-2xl">
          <div className="absolute inset-2 bg-white rounded-[1.5rem] overflow-hidden">
            <div className="bg-slate-100 p-2 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-full px-3 py-1 text-[8px] text-slate-600 font-medium">
                backstagepro.online
              </div>
            </div>
            <div className="p-3 bg-gradient-to-b from-[#0066CC] to-[#00B4D8] h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-xl mx-auto mb-2 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-primary mx-auto mt-3" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-4 bottom-20 animate-bounce">
          <Hand className="w-8 h-8 text-[#0066CC] rotate-45" />
        </div>
      </div>
    );
  }

  return null;
};

export function WelcomeModal({ open, onClose, userName }: WelcomeModalProps) {
  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canAutoInstall, setCanAutoInstall] = useState(false);

  const { toast } = useToast();
  const { settings } = useAppSettings();

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const visibleSteps = isIOS
    ? installSteps.filter((s) => s.platform === "access" || s.platform === "ios")
    : installSteps.filter((s) => s.platform === "access" || s.platform === "android");

  const currentInstall = step > 0 ? visibleSteps[step - 1] : null;
  const isLastStep = step === visibleSteps.length;

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

    setIsInstalled(standalone);
    setCanAutoInstall(!!deferredPrompt);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setShowConfetti(true);
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [open]);

  const handleNeverShowAgain = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("profiles").update({ onboarding_completed: true }).eq("user_id", user.id);
      }

      onClose();

      setTimeout(async () => {
        if ("Notification" in window && Notification.permission === "default") {
          await subscribeToWebPush();
        }
      }, 800);
    } catch {
      onClose();
    }
  };

  const handleNext = () => {
    if (step < visibleSteps.length) {
      setStep((prev) => prev + 1);
    } else {
      handleNeverShowAgain();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleAutoInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setIsInstalled(true);
        handleNeverShowAgain();
      }
    } finally {
      setIsInstalling(false);
    }
  };

  if (step === 0) {
    return (
      <>
        {showConfetti && (
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={300} />
        )}

        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 bg-gradient-to-b from-primary via-primary/90 to-accent">
            <div className="p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-3">Boas-vindas, {userName || "Artista"} 🎉</h2>

              <p className="text-white/90 mb-6">Vamos configurar tudo para você começar da forma certa.</p>

              <div className="flex flex-col gap-3">
                {canAutoInstall && !isIOS ? (
                  <Button
                    onClick={handleAutoInstall}
                    disabled={isInstalling}
                    className="w-full h-12 bg-white text-primary"
                  >
                    {isInstalling ? "Instalando..." : "Instalar Agora"}
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="w-full h-12 bg-white text-primary">
                    Começar tutorial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                )}

                <Button variant="ghost" onClick={handleNeverShowAgain} className="text-white">
                  Pular
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (!currentInstall) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0">
        <div className="bg-background">
          <div className="h-1.5 bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${(step / visibleSteps.length) * 100}%` }}
            />
          </div>

          <div className="p-6">
            <div className="text-center mb-5">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold">
                Etapa {step} de {visibleSteps.length}
              </span>
            </div>

            <h3 className="text-xl font-bold text-center mb-6">{currentInstall.title}</h3>

            <div className="mb-6">
              <PhoneMockup platform={currentInstall.illustration} logoUrl={settings.logo_url} />
            </div>

            <div className="space-y-3 mb-6">
              {currentInstall.steps.map((item, index) => (
                <div key={index} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                  <div
                    className={`w-8 h-8 ${currentInstall.color} rounded-lg text-white flex items-center justify-center`}
                  >
                    {index + 1}
                  </div>
                  <p className="text-sm">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 mb-5">
              {visibleSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setStep(index + 1)}
                  className={`h-2 rounded-full transition-all ${
                    step === index + 1 ? "w-8 bg-primary" : "w-2 bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {step > 1 && (
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-12">
                    Voltar
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  className={`${step > 1 ? "flex-1" : "w-full"} ${currentInstall.color} text-white h-12`}
                >
                  {isLastStep ? "Finalizar" : "Próximo"}
                </Button>
              </div>

              <Button variant="ghost" onClick={handleNeverShowAgain}>
                Pular tutorial
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
