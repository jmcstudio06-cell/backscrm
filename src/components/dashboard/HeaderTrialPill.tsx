import { Timer, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuickTrial } from "@/hooks/useQuickTrial";

export function HeaderTrialPill() {
  const navigate = useNavigate();
  const { isActive, isExpired, daysLeft, hoursLeft, minutesLeft, loading } = useQuickTrial();

  if (loading || (!isActive && !isExpired)) return null;

  if (isExpired) {
    return (
      <button
        onClick={() => navigate("/planos")}
        className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-destructive/15 border border-destructive/40 text-destructive text-xs font-semibold hover:bg-destructive/25 transition-colors"
      >
        <Lock className="w-3.5 h-3.5" />
        Teste expirado
        <Sparkles className="w-3.5 h-3.5" />
      </button>
    );
  }

  const isUrgent = daysLeft === 0 && hoursLeft < 6;
  const primary = daysLeft > 0 ? `${daysLeft}d` : `${hoursLeft}h`;
  const secondary = daysLeft > 0 ? `${hoursLeft}h` : `${minutesLeft}min`;

  return (
    <button
      onClick={() => navigate("/planos")}
      title={isUrgent ? "Tempo acabando! Assine agora" : "Tempo restante do teste grátis"}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-semibold transition-colors border
        ${isUrgent
          ? "bg-destructive/15 border-destructive/40 text-destructive hover:bg-destructive/25"
          : "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
        }`}
    >
      <Timer className={`w-3.5 h-3.5 ${isUrgent ? "animate-pulse" : ""}`} />
      <span className="font-mono tabular-nums">{primary}</span>
      <span className="opacity-60 font-mono tabular-nums hidden xs:inline">{secondary}</span>
    </button>
  );
}
