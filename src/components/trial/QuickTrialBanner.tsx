import { Timer, Sparkles, ArrowRight, AlertTriangle, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuickTrial } from "@/hooks/useQuickTrial";
import { Button } from "@/components/ui/button";

export function QuickTrialBanner() {
  const navigate = useNavigate();
  const { isActive, isExpired, daysLeft, hoursLeft, minutesLeft, loading } = useQuickTrial();

  // Don't show if loading or neither active nor expired
  if (loading || (!isActive && !isExpired)) {
    return null;
  }

  const isUrgent = daysLeft === 0 && hoursLeft < 6;
  const primaryValue = daysLeft > 0 ? daysLeft : hoursLeft;
  const secondaryValue = daysLeft > 0 ? hoursLeft : minutesLeft;
  const secondaryLabel = daysLeft > 0 ? "h" : "min";

  if (isExpired) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 md:left-64">
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-4 shadow-2xl border-t border-red-500">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Seu tempo de teste acabou!
                </h3>
                <p className="text-white/80 text-sm">
                  Escolha um plano para continuar usando o Backstage Pro
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/planos")}
              size="lg"
              className="bg-white text-red-600 hover:bg-white/90 font-bold shadow-lg gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Ver Planos
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:left-64">
      <div
        className={`
          p-3 shadow-2xl border-t transition-colors duration-300
          ${isUrgent 
            ? "bg-gradient-to-r from-red-600 to-orange-500 border-red-400" 
            : "bg-gradient-to-r from-primary to-accent border-primary/50"
          }
        `}
      >
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Timer Section */}
          <div className="flex items-center gap-3">
            <div 
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isUrgent ? "bg-white/20 animate-pulse" : "bg-white/10"}
              `}
            >
              <Timer className={`w-5 h-5 text-white ${isUrgent ? "animate-bounce" : ""}`} />
            </div>

            <div className="text-center sm:text-left">
              <p className="text-white/80 text-xs uppercase tracking-wide font-medium">
                {isUrgent ? "⚠️ TEMPO ACABANDO!" : "🧪 TESTE GRÁTIS"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-sm">Restam:</span>
                <div className="flex items-center gap-1">
                  <div className="bg-white/20 backdrop-blur rounded px-2 py-0.5">
                    <span className="text-white font-mono font-bold text-lg">
                      {primaryValue}{daysLeft > 0 ? "d" : "h"}
                    </span>
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded px-2 py-0.5">
                    <span className="text-white font-mono font-bold text-lg">
                      {secondaryValue}{secondaryLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="hidden md:block flex-1 text-center">
            <p className="text-white/90 text-sm">
              {isUrgent 
                ? "🔥 Aproveite os últimos minutos para explorar!" 
                : "Explore todas as funcionalidades agora!"
              }
            </p>
          </div>

          {/* CTA */}
          <Button
            onClick={() => navigate("/planos")}
            size="sm"
            className={`
              font-bold shadow-lg gap-2 transition-all
              ${isUrgent 
                ? "bg-white text-red-600 hover:bg-white/90" 
                : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
              }
            `}
          >
            <Sparkles className="w-4 h-4" />
            {isUrgent ? "Assinar Agora" : "Ver Planos"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
