import { useState, useEffect, useCallback } from "react";
import { useProfile } from "@/hooks/useProfile";
import Confetti from "react-confetti";
import { Crown, Sparkles, PartyPopper, X } from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  mensal_starter: "Starter Mensal",
  mensal_profissional: "Profissional Mensal",
  mensal_completo: "Completo Mensal",
  anual_starter: "Starter Anual",
  anual_profissional: "Profissional Anual",
  anual_completo: "Completo Anual",
};

const INACTIVE_PLANS = ["trial", "expirado"];
const STORAGE_KEY = "last_known_plan";

export function PlanActivatedCelebration() {
  const { profile } = useProfile();
  const [showCelebration, setShowCelebration] = useState(false);
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compare current plan with last known plan from localStorage
  useEffect(() => {
    if (!profile) return;

    const currentPlan = profile.plan;
    const lastKnown = localStorage.getItem(STORAGE_KEY);

    // First time ever: just store current plan, never celebrate
    if (lastKnown === null) {
      localStorage.setItem(STORAGE_KEY, currentPlan || "");
      return;
    }

    // Always update stored plan
    localStorage.setItem(STORAGE_KEY, currentPlan || "");

    // Only celebrate when transitioning FROM inactive TO active
    const wasInactive = INACTIVE_PLANS.includes(lastKnown) || lastKnown === "";
    const isNowActive = currentPlan && !INACTIVE_PLANS.includes(currentPlan);

    if (wasInactive && isNowActive) {
      setActivatedPlan(currentPlan);
      setShowCelebration(true);
    }
  }, [profile?.plan]);

  const handleClose = useCallback(() => {
    setShowCelebration(false);
    setActivatedPlan(null);
  }, []);

  // Auto-dismiss after 12s
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(handleClose, 12000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration, handleClose]);

  if (!showCelebration || !activatedPlan) return null;

  const planLabel = PLAN_LABELS[activatedPlan] || activatedPlan;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <Confetti
        width={windowSize.w}
        height={windowSize.h}
        recycle={false}
        numberOfPieces={400}
        gravity={0.15}
        colors={["#FFD700", "#FF6B35", "#00D4AA", "#7C3AED", "#F43F5E", "#3B82F6"]}
      />

      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto animate-fade-in" onClick={handleClose} />

      <div className="relative pointer-events-auto animate-scale-in max-w-sm w-full mx-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-primary to-accent rounded-3xl blur-lg opacity-75 animate-pulse" />

        <div className="relative bg-gradient-to-br from-background via-background to-secondary rounded-3xl p-8 border border-primary/30 shadow-2xl overflow-hidden">
          <div className="absolute top-4 right-4">
            <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
          <div className="absolute top-12 left-6">
            <Sparkles className="w-4 h-4 text-primary animate-bounce" style={{ animationDelay: "0.5s" }} />
          </div>
          <div className="absolute bottom-8 right-8">
            <Sparkles className="w-5 h-5 text-accent animate-bounce" style={{ animationDelay: "0.8s" }} />
          </div>

          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="text-center space-y-5">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-primary rounded-full animate-pulse opacity-30" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-primary rounded-full flex items-center justify-center shadow-xl">
                <Crown className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
            </div>

            <div className="flex justify-center">
              <PartyPopper className="w-8 h-8 text-yellow-500 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold bg-gradient-to-r from-yellow-400 via-primary to-accent bg-clip-text text-transparent">
                Plano Ativado!
              </h2>
              <p className="text-lg font-semibold text-foreground">
                {planLabel}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sua carreira musical acaba de dar um upgrade. Todas as ferramentas estão liberadas para você brilhar! 🎶
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 px-6 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Começar a usar! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
