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
    color: "bg-[#0066CC]",
    illustration: "browser",
    steps: [
      { text: "Abra o Safari no seu iPhone" },
      { text: "Digite: backstagepro.online" },
      { text: "Faça login com seu email e senha" },
    ],
  },
  {
    platform: "ios",
    title: "Passo 2: Adicione na tela inicial",
    color: "bg-slate-800",
    illustration: "ios",
    steps: [
      { text: "Toque no botão Compartilhar" },
      { text: "Role para baixo" },
      { text: 'Toque em "Adicionar à Tela de Início"' },
    ],
  },
];

const PhoneMockup = ({ platform }: { platform: string }) => {
  if (platform !== "browser") return null;

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
            <div className="flex-1 bg-white rounded-full px-3 py-1 text-[8px] text-slate-600">backstagepro.online</div>
          </div>
        </div>
      </div>
      <div className="absolute -right-4 bottom-20 animate-bounce">
        <Hand className="w-8 h-8 text-[#0066CC] rotate-45" />
      </div>
    </div>
  );
};

export function WelcomeModal({ open, onClose, userName }: WelcomeModalProps) {
  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const { toast } = useToast();
  const { settings } = useAppSettings();

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const visibleSteps = installSteps;
  const currentInstall = step > 0 ? visibleSteps[step - 1] : null;
  const isLastStep = step === visibleSteps.length;

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;

    setIsInstalled(standalone);
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

  const handleAutoInstall = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Instalação indisponível",
        description: "Seu navegador não permite instalação automática.",
        variant: "destructive",
      });
      return;
    }

    setIsInstalling(true);

    try {
      deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        toast({
          title: "App instalado com sucesso 🎉",
          description: "O aplicativo foi adicionado à tela inicial.",
        });

        handleNeverShowAgain();
      }
    } finally {
      setIsInstalling(false);
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
                {!isIOS ? (
                  <Button
                    onClick={handleAutoInstall}
                    disabled={isInstalling}
                    className="w-full h-12 bg-white text-primary"
                  >
                    {isInstalling ? "Instalando..." : "Instalar aplicativo"}
                    {!isInstalling && <Download className="ml-2 w-5 h-5" />}
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="w-full h-12 bg-white text-primary">
                    Ver como instalar no iPhone
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

  if (!isIOS || !currentInstall) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0">
        <div className="bg-background">
          <div className="h-1.5 bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent"
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
              <PhoneMockup platform={currentInstall.illustration} />
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

            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Voltar
                </Button>
              )}

              <Button
                onClick={handleNext}
                className={`${step > 1 ? "flex-1" : "w-full"} ${currentInstall.color} text-white`}
              >
                {isLastStep ? "Finalizar" : "Próximo"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
