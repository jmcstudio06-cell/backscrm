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
  Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Confetti from "react-confetti";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

const installSteps = [
  {
    platform: "ios",
    title: "Instalação no iPhone",
    icon: Smartphone,
    color: "bg-slate-800",
    steps: [
      { icon: Share, text: "Abra o app no Safari e toque no ícone de Compartilhar" },
      { icon: PlusSquare, text: "Role para baixo e toque em \"Adicionar à Tela de Início\"" },
      { icon: Check, text: "Toque em \"Adicionar\" e pronto! O app estará na sua tela inicial" }
    ]
  },
  {
    platform: "android",
    title: "Instalação no Android",
    icon: Smartphone,
    color: "bg-emerald-500",
    steps: [
      { icon: MoreVertical, text: "Abra o app no Chrome e toque no menu (3 pontinhos)" },
      { icon: Download, text: "Toque em \"Instalar aplicativo\" ou \"Adicionar à tela inicial\"" },
      { icon: Check, text: "Confirme a instalação e pronto! O app estará no seu celular" }
    ]
  }
];

export function WelcomeModal({ open, onClose, userName }: WelcomeModalProps) {
  const [step, setStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleNeverShowAgain = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ onboarding_completed: true })
          .eq("user_id", user.id);
      }
      
      toast({
        title: "Configuração salva!",
        description: "Você não verá mais este tutorial ao entrar.",
      });
      onClose();
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      onClose();
    }
  };

  const handleNext = () => {
    if (step < installSteps.length) {
      setStep(step + 1);
    } else {
      handleNeverShowAgain();
    }
  };

  const handleSkip = () => {
    handleNeverShowAgain();
  };

  // Welcome screen (step 0)
  if (step === 0) {
    return (
      <>
        {showConfetti && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={300}
            colors={['#0066CC', '#00B4D8', '#FFD700', '#FF6B6B', '#4ECDC4']}
          />
        )}
        <Dialog open={open} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 bg-gradient-to-b from-[#0066CC] via-[#0088DD] to-[#00B4D8]">
            <div className="p-8 text-center">
              <div className="flex justify-center gap-2 mb-6">
                <PartyPopper className="w-12 h-12 text-yellow-400 animate-bounce" />
                <Sparkles className="w-10 h-10 text-cyan-300 animate-pulse" />
                <Star className="w-12 h-12 text-yellow-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">
                Parabéns, {userName || "Artista"}! 🎉
              </h2>
              
              <p className="text-xl text-cyan-300 font-medium mb-4">
                Você está no caminho certo!
              </p>

              <p className="text-white/90 mb-6">
                Bem-vindo ao <span className="font-bold">Backstage Pro</span>! 
                A partir de agora, sua carreira terá uma gestão profissional completa.
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Rocket className="w-8 h-8 text-cyan-300" />
                  <span className="text-white font-semibold text-lg">Instale o app no celular!</span>
                </div>
                <p className="text-white/80 text-sm">
                  Para uma experiência completa, instale o Backstage Pro como um aplicativo 
                  no seu celular. É rápido, fácil e funciona offline!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleNext}
                  className="w-full bg-white text-[#0066CC] hover:bg-white/90 font-semibold h-12"
                >
                  Ver como instalar
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-full text-white/70 hover:text-white hover:bg-white/10"
                >
                  Pular e não mostrar novamente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Installation steps
  const currentInstall = installSteps[step - 1];
  const isLastStep = step === installSteps.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0">
        <div className="bg-white">
          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div 
              className="h-full bg-gradient-to-r from-[#0066CC] to-[#00B4D8] transition-all duration-300"
              style={{ width: `${(step / installSteps.length) * 100}%` }}
            />
          </div>

          <div className="p-8">
            {/* Platform icon */}
            <div className={`w-16 h-16 ${currentInstall.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
              <currentInstall.icon className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-slate-800 text-center mb-6">
              {currentInstall.title}
            </h3>

            {/* Steps */}
            <div className="space-y-4 mb-8">
              {currentInstall.steps.map((stepItem, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-10 h-10 ${currentInstall.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <stepItem.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-500">Passo {index + 1}</span>
                    </div>
                    <p className="text-slate-700">{stepItem.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Step indicator */}
            <div className="flex justify-center gap-2 mb-6">
              {installSteps.map((_, index) => (
                <div 
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index + 1 === step 
                      ? 'w-6 bg-[#0066CC]' 
                      : index + 1 < step 
                        ? 'bg-[#00B4D8]' 
                        : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleNext}
                className="w-full bg-[#0066CC] hover:bg-[#0055AA] text-white font-semibold h-12"
              >
                {isLastStep ? "Começar a usar!" : "Próximo: Android"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-slate-500 hover:text-slate-700"
              >
                Pular e não mostrar novamente
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
