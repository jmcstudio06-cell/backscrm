import { Clock, AlertTriangle, Sparkles, Gift, ArrowRight, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { useState, useEffect } from "react";

export function TrialCountdownCard() {
  const navigate = useNavigate();
  const { plan, daysRemaining, isTrial, isExpired, loading } = useTrialStatus();
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  // Countdown timer effect
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  // Don't show if not on trial or loading
  if (loading || (!isTrial && plan !== "expirado")) {
    return null;
  }

  const isUrgent = daysRemaining <= 1;
  const isWarning = daysRemaining <= 2;

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl p-5 mb-6 border-2 animate-fade-in
        ${isExpired 
          ? "bg-gradient-to-r from-red-500/10 to-red-600/10 border-red-300" 
          : isUrgent 
            ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-300" 
            : isWarning 
              ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-300" 
              : "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30"
        }
      `}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div 
            className={`
              w-14 h-14 rounded-xl flex items-center justify-center shrink-0 animate-pulse
              ${isExpired 
                ? "bg-red-100 text-red-600" 
                : isUrgent 
                  ? "bg-orange-100 text-orange-600" 
                  : isWarning 
                    ? "bg-amber-100 text-amber-600" 
                    : "bg-primary/20 text-primary"
              }
            `}
          >
            {isExpired ? (
              <AlertTriangle className="w-7 h-7" />
            ) : (
              <Clock className="w-7 h-7" />
            )}
          </div>
          
          <div className="flex-1">
            {isExpired ? (
              <>
                <h3 className="text-lg font-bold text-red-700">
                  Seu período de teste expirou!
                </h3>
                <p className="text-sm text-red-600 mt-1">
                  Assine um plano agora para continuar usando o Backstage Pro
                </p>
              </>
            ) : (
              <>
                <h3 className={`text-lg font-bold ${isUrgent ? "text-orange-700" : isWarning ? "text-amber-700" : "text-foreground"}`}>
                  {daysRemaining === 1 
                    ? "⚠️ Último dia de teste!" 
                    : `Você tem mais ${daysRemaining} dias de teste`
                  }
                </h3>
                <p className={`text-sm mt-1 ${isUrgent ? "text-orange-600" : isWarning ? "text-amber-600" : "text-muted-foreground"}`}>
                  Aproveite e conheça todos os recursos do Backstage Pro!
                </p>
              </>
            )}
          </div>
        </div>

        {/* Urgency Countdown Timer */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-lg p-3">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-white animate-pulse" />
              <span className="text-white font-bold text-sm">
                🔥 OFERTA EXPIRA EM:
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="bg-white/20 backdrop-blur rounded px-2 py-1">
                <span className="text-white font-mono font-bold text-lg">{formatTime(timeLeft.hours)}</span>
              </div>
              <span className="text-white font-bold">:</span>
              <div className="bg-white/20 backdrop-blur rounded px-2 py-1">
                <span className="text-white font-mono font-bold text-lg">{formatTime(timeLeft.minutes)}</span>
              </div>
              <span className="text-white font-bold">:</span>
              <div className="bg-white/20 backdrop-blur rounded px-2 py-1">
                <span className="text-white font-mono font-bold text-lg">{formatTime(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exclusive Offer Banner */}
      <div 
        onClick={() => navigate("/planos")}
        className="mt-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-3 cursor-pointer hover:from-amber-600 hover:to-orange-600 transition-all duration-300 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Gift className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-200" />
                <span className="text-white font-bold text-sm md:text-base">
                  Ofertas exclusivas do período de teste!
                </span>
              </div>
              <p className="text-white/90 text-xs md:text-sm">
                Preços especiais que você só encontra agora. Clique e confira!
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl" />
      <div className="absolute -left-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent blur-xl" />
    </div>
  );
}
