import { useNavigate } from "react-router-dom";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { useProfile } from "@/hooks/useProfile";
import { AlertTriangle, ChevronRight, Sparkles } from "lucide-react";

export function RenewSoonBanner() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { plan, daysRemaining, isExpired, loading } = useTrialStatus(profile);

  if (loading || !plan) return null;
  if (isExpired) return null;
  // Apenas planos mensais pagos
  if (!plan.startsWith("mensal_")) return null;
  if (daysRemaining > 7 || daysRemaining <= 0) return null;

  const isUrgent = daysRemaining <= 3;
  const label =
    daysRemaining === 1
      ? "Seu plano vence amanhã"
      : `Seu plano vence em ${daysRemaining} dias`;

  return (
    <button
      onClick={() => navigate("/planos")}
      className={`group w-full text-left rounded-2xl border overflow-hidden relative transition-all duration-300 hover:shadow-xl active:scale-[0.99] ${
        isUrgent
          ? "border-red-500/40 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10"
          : "border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10"
      }`}
    >
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-orange-400/40 to-pink-500/30 blur-3xl" />
      </div>

      <div className="relative flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
        <div
          className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
            isUrgent
              ? "bg-gradient-to-br from-red-500 to-orange-500"
              : "bg-gradient-to-br from-amber-500 to-orange-500"
          }`}
        >
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                isUrgent ? "text-red-600" : "text-amber-600"
              }`}
            >
              {isUrgent ? "Renove com urgência" : "Renove agora"}
            </span>
            <Sparkles
              className={`w-3.5 h-3.5 ${isUrgent ? "text-red-500" : "text-amber-500"}`}
            />
          </div>
          <p className="text-sm sm:text-base font-bold text-foreground leading-tight">
            {label}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            ⚠️ Se atrasar a mensalidade, o modo mensal será bloqueado e você só poderá
            adquirir o <span className="font-semibold">plano anual</span> nas próximas
            aquisições.
          </p>
        </div>

        <ChevronRight className="hidden sm:block w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
      </div>
    </button>
  );
}
