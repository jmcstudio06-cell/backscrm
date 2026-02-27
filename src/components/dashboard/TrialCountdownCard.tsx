import { Timer, AlertTriangle, Sparkles, ArrowRight, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuickTrial } from "@/hooks/useQuickTrial";
import { Button } from "@/components/ui/button";

export function TrialCountdownCard() {
  const navigate = useNavigate();
  const { isActive, isExpired, minutesLeft, secondsLeft, loading } = useQuickTrial();

  if (loading || (!isActive && !isExpired)) {
    return null;
  }

  const formatTime = (num: number) => num.toString().padStart(2, "0");
  const isUrgent = minutesLeft < 10;

  if (isExpired) {
    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-destructive/50 bg-gradient-to-r from-destructive/10 to-destructive/5 p-5 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0 animate-pulse">
            <Lock className="w-7 h-7 text-destructive" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-destructive flex items-center gap-2 justify-center sm:justify-start">
              <AlertTriangle className="w-5 h-5" />
              Seu tempo de teste acabou!
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Escolha um plano para continuar usando o Backstage Pro
            </p>
          </div>
          <Button
            onClick={() => navigate("/planos")}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-bold gap-2 shrink-0"
          >
            <Sparkles className="w-5 h-5" />
            Ver Planos
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br from-destructive/10 to-transparent blur-2xl" />
      </div>
    );
  }

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border-2 p-5 animate-fade-in transition-colors duration-300
        ${isUrgent
          ? "bg-gradient-to-r from-destructive/10 to-orange-500/10 border-destructive/40"
          : "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30"
        }
      `}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Timer icon */}
        <div
          className={`
            w-14 h-14 rounded-xl flex items-center justify-center shrink-0
            ${isUrgent ? "bg-destructive/20 animate-pulse" : "bg-primary/20"}
          `}
        >
          <Timer className={`w-7 h-7 ${isUrgent ? "text-destructive" : "text-primary"}`} />
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs uppercase tracking-wide font-medium text-muted-foreground">
            {isUrgent ? "⚠️ TEMPO ACABANDO!" : "🧪 MODO TESTE GRATUITO"}
          </p>
          <div className="flex items-center gap-2 justify-center sm:justify-start mt-1">
            <span className="text-sm font-semibold text-foreground">Tempo restante:</span>
            <div className="flex items-center gap-1">
              <div className="bg-foreground/10 backdrop-blur rounded px-2 py-0.5">
                <span className="font-mono font-bold text-xl text-foreground">
                  {formatTime(minutesLeft)}
                </span>
              </div>
              <span className="font-bold text-foreground animate-pulse">:</span>
              <div className="bg-foreground/10 backdrop-blur rounded px-2 py-0.5">
                <span className="font-mono font-bold text-xl text-foreground">
                  {formatTime(secondsLeft)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {isUrgent
              ? "🔥 Aproveite os últimos minutos para explorar!"
              : "Explore as funcionalidades liberadas agora!"}
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={() => navigate("/planos")}
          size="sm"
          className={`
            font-bold gap-2 shrink-0
            ${isUrgent
              ? "bg-gradient-to-r from-destructive to-orange-500 hover:opacity-90 text-white"
              : "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
            }
          `}
        >
          <Sparkles className="w-4 h-4" />
          {isUrgent ? "Assinar Agora" : "Ver Planos"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl" />
    </div>
  );
}
