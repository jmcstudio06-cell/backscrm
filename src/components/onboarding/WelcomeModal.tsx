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
  Hand
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
    platform: "access",
    title: "Passo 1: Acesse o site",
    icon: Globe,
    color: "bg-[#0066CC]",
    illustration: "browser",
    steps: [
      { icon: Globe, text: "Abra o navegador do seu celular (Safari no iPhone ou Chrome no Android)" },
      { icon: ArrowRight, text: "Digite: backstagepro.online" },
      { icon: Check, text: "Faça login com seu email e senha" }
    ]
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
      { icon: PlusSquare, text: "Toque em \"Adicionar à Tela de Início\"" }
    ]
  },
  {
    platform: "android",
    title: "Passo 2: Android",
    icon: Smartphone,
    color: "bg-emerald-500",
    illustration: "android",
    steps: [
      { icon: MoreVertical, text: "Toque no menu (⋮ três pontinhos)" },
      { icon: Download, text: "Toque em \"Instalar aplicativo\"" },
      { icon: Check, text: "Confirme tocando em \"Instalar\"" }
    ]
  }
];

// Phone mockup component for visual tutorial
const PhoneMockup = ({ platform }: { platform: string }) => {
  if (platform === "browser") {
    return (
      <div className="relative w-48 h-72 mx-auto">
        {/* Phone frame */}
        <div className="absolute inset-0 bg-slate-800 rounded-[2rem] shadow-2xl">
          {/* Screen */}
          <div className="absolute inset-2 bg-white rounded-[1.5rem] overflow-hidden">
            {/* Browser bar */}
            <div className="bg-slate-100 p-2 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-full px-3 py-1 text-[8px] text-slate-600 font-medium flex items-center">
                <span className="animate-pulse">backstagepro.online</span>
              </div>
            </div>
            {/* Content */}
            <div className="p-3 bg-gradient-to-b from-[#0066CC] to-[#00B4D8] h-full">
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <span className="text-2xl">🎸</span>
                </div>
                <div className="text-white text-[10px] font-bold">Backstage Pro</div>
                <div className="text-white/70 text-[8px] mt-1">Gestão Musical</div>
              </div>
            </div>
          </div>
        </div>
        {/* Finger animation */}
        <div className="absolute -right-4 bottom-20 animate-bounce">
          <Hand className="w-8 h-8 text-[#0066CC] transform rotate-45" />
        </div>
      </div>
    );
  }

  if (platform === "ios") {
    return (
      <div className="relative w-48 h-72 mx-auto">
        {/* Phone frame */}
        <div className="absolute inset-0 bg-slate-800 rounded-[2rem] shadow-2xl">
          {/* Screen */}
          <div className="absolute inset-2 bg-white rounded-[1.5rem] overflow-hidden">
            {/* Share sheet simulation */}
            <div className="bg-slate-50 p-2 text-center">
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-2" />
              <div className="text-[8px] text-slate-600 font-medium">backstagepro.online</div>
            </div>
            {/* Options */}
            <div className="p-2 space-y-2">
              <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg">
                <div className="w-6 h-6 bg-slate-300 rounded-lg" />
                <span className="text-[8px] text-slate-500">Copiar</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-[#0066CC]/10 rounded-lg border-2 border-[#0066CC] animate-pulse">
                <div className="w-6 h-6 bg-[#0066CC] rounded-lg flex items-center justify-center">
                  <PlusSquare className="w-4 h-4 text-white" />
                </div>
                <span className="text-[8px] text-[#0066CC] font-bold">Adicionar à Tela de Início</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg">
                <div className="w-6 h-6 bg-slate-300 rounded-lg" />
                <span className="text-[8px] text-slate-500">Favoritos</span>
              </div>
            </div>
          </div>
        </div>
        {/* Share icon highlight */}
        <div className="absolute -top-2 right-8">
          <div className="bg-yellow-400 rounded-full p-1 animate-bounce shadow-lg">
            <Share className="w-5 h-5 text-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (platform === "android") {
    return (
      <div className="relative w-48 h-72 mx-auto">
        {/* Phone frame */}
        <div className="absolute inset-0 bg-slate-800 rounded-[2rem] shadow-2xl">
          {/* Screen */}
          <div className="absolute inset-2 bg-white rounded-[1.5rem] overflow-hidden">
            {/* Chrome bar */}
            <div className="bg-white p-2 flex items-center justify-between border-b">
              <div className="text-[8px] text-slate-600 truncate flex-1">backstagepro.online</div>
              <div className="bg-emerald-500 rounded-full p-1 animate-pulse">
                <MoreVertical className="w-3 h-3 text-white" />
              </div>
            </div>
            {/* Menu dropdown */}
            <div className="absolute top-8 right-2 bg-white shadow-xl rounded-lg border p-2 space-y-2 z-10">
              <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded border-2 border-emerald-500 animate-pulse">
                <Download className="w-4 h-4 text-emerald-600" />
                <span className="text-[8px] text-emerald-700 font-bold">Instalar aplicativo</span>
              </div>
              <div className="flex items-center gap-2 p-1.5">
                <Star className="w-4 h-4 text-slate-400" />
                <span className="text-[8px] text-slate-500">Favoritos</span>
              </div>
            </div>
            {/* Content behind */}
            <div className="p-3 bg-gradient-to-b from-[#0066CC]/20 to-[#00B4D8]/20 h-full opacity-50">
              <div className="text-center mt-4">
                <div className="w-10 h-10 bg-slate-200 rounded-xl mx-auto" />
              </div>
            </div>
          </div>
        </div>
        {/* Arrow pointing to menu */}
        <div className="absolute -right-6 top-8">
          <ArrowRight className="w-6 h-6 text-emerald-500 animate-pulse" />
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
                  Ver tutorial de instalação
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
  const nextPlatform = step === 1 ? "iPhone" : step === 2 ? "Android" : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0">
        <div className="bg-white">
          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100">
            <div 
              className="h-full bg-gradient-to-r from-[#0066CC] to-[#00B4D8] transition-all duration-500"
              style={{ width: `${(step / installSteps.length) * 100}%` }}
            />
          </div>

          <div className="p-6">
            {/* Step counter */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="px-3 py-1 bg-[#0066CC]/10 text-[#0066CC] text-sm font-bold rounded-full">
                {step} de {installSteps.length}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-800 text-center mb-4">
              {currentInstall.title}
            </h3>

            {/* Phone Mockup Illustration */}
            <div className="mb-6">
              <PhoneMockup platform={currentInstall.illustration} />
            </div>

            {/* Steps list */}
            <div className="space-y-3 mb-6">
              {currentInstall.steps.map((stepItem, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className={`w-8 h-8 ${currentInstall.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-slate-700 text-sm flex-1">{stepItem.text}</p>
                </div>
              ))}
            </div>

            {/* Step dots indicator */}
            <div className="flex justify-center gap-2 mb-4">
              {installSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setStep(index + 1)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index + 1 === step 
                      ? 'w-8 bg-[#0066CC]' 
                      : index + 1 < step 
                        ? 'bg-[#00B4D8]' 
                        : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <Button 
                onClick={handleNext}
                className={`w-full ${currentInstall.color} hover:opacity-90 text-white font-semibold h-12`}
              >
                {isLastStep ? (
                  <>
                    <Check className="mr-2 w-5 h-5" />
                    Entendi! Começar a usar
                  </>
                ) : (
                  <>
                    Próximo: {nextPlatform}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </Button>
              <Button 
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-slate-400 hover:text-slate-600 text-sm"
              >
                Pular tutorial
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
