import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  PartyPopper, 
  Rocket, 
  Star,
  ArrowRight,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  FileText,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Confetti from "react-confetti";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  userName?: string;
}

const tutorialSteps = [
  {
    icon: Calendar,
    title: "Agenda de Shows",
    description: "Aqui você organiza todos os seus eventos. Adicione shows, defina datas, horários e locais. Tudo fica registrado e você nunca mais perde um compromisso!",
    color: "bg-blue-500",
    page: "/agenda"
  },
  {
    icon: DollarSign,
    title: "Financeiro",
    description: "Controle suas receitas e despesas. Veja quanto você faturou, suas despesas e tenha relatórios claros do seu dinheiro.",
    color: "bg-emerald-500",
    page: "/financeiro"
  },
  {
    icon: BarChart3,
    title: "CRM / Funil de Vendas",
    description: "Gerencie seus leads e oportunidades. Acompanhe cada negociação do primeiro contato até o fechamento do contrato.",
    color: "bg-purple-500",
    page: "/crm"
  },
  {
    icon: Users,
    title: "Clientes",
    description: "Cadastre e organize seus contratantes. Mantenha histórico de shows, contatos e informações importantes de cada cliente.",
    color: "bg-pink-500",
    page: "/clientes"
  },
  {
    icon: FileText,
    title: "Contratos e Orçamentos",
    description: "Crie contratos profissionais e orçamentos personalizados. Envie para seus clientes e feche mais negócios!",
    color: "bg-orange-500",
    page: "/contratos"
  },
  {
    icon: Target,
    title: "Metas",
    description: "Defina suas metas mensais de shows e faturamento. Acompanhe seu progresso e celebre suas conquistas!",
    color: "bg-cyan-500",
    page: "/metas"
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
    if (step < tutorialSteps.length) {
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
                  <span className="text-white font-semibold text-lg">Sua jornada começa agora!</span>
                </div>
                <p className="text-white/80 text-sm">
                  Preparamos um tour rápido para você conhecer todas as ferramentas 
                  que vão transformar sua carreira musical.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleNext}
                  className="w-full bg-white text-[#0066CC] hover:bg-white/90 font-semibold h-12"
                >
                  Ver tutorial rápido
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

  // Tutorial steps
  const currentTutorial = tutorialSteps[step - 1];
  const isLastStep = step === tutorialSteps.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0">
        <div className="bg-white">
          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div 
              className="h-full bg-gradient-to-r from-[#0066CC] to-[#00B4D8] transition-all duration-300"
              style={{ width: `${(step / tutorialSteps.length) * 100}%` }}
            />
          </div>

          <div className="p-8">
            {/* Icon */}
            <div className={`w-16 h-16 ${currentTutorial.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
              <currentTutorial.icon className="w-8 h-8 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-slate-800 text-center mb-4">
              {currentTutorial.title}
            </h3>

            {/* Description */}
            <p className="text-slate-600 text-center mb-8 leading-relaxed">
              {currentTutorial.description}
            </p>

            {/* Step indicator */}
            <div className="flex justify-center gap-2 mb-6">
              {tutorialSteps.map((_, index) => (
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
                {isLastStep ? "Começar a usar!" : "Próximo"}
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
