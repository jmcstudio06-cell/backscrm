import { useState, useEffect } from "react";
import { Gift, Clock, CheckCircle, Sparkles, Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUserGifts } from "@/hooks/useUserGifts";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactConfetti from "react-confetti";

// Planos pagos que não devem ver o card de resgate
const PAID_PLANS = ["mensal", "essencial", "completo", "mensal_starter", "mensal_profissional", "mensal_completo", "anual_starter", "anual_profissional", "anual_completo", "mensal_empresarial", "anual_empresarial", "parceiros"];

export function GiftClaimCard() {
  const { gifts, loading, claimGift, getAvailableGift } = useUserGifts();
  const { profile, loading: profileLoading, fetchProfile } = useProfile();
  const [claiming, setClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [activatingToken, setActivatingToken] = useState(false);

  const availableGift = getAvailableGift();

  useEffect(() => {
    if (!availableGift?.expires_at) return;

    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(availableGift.expires_at!);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Expirado");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [availableGift]);

  const handleClaim = async () => {
    if (!availableGift) return;

    setClaiming(true);
    const success = await claimGift(availableGift.id);
    if (success) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    setClaiming(false);
  };

  const handleActivateToken = async () => {
    const value = token.trim();
    if (!value) {
      toast.error("Digite o Token Parceiros");
      return;
    }
    setActivatingToken(true);
    try {
      const { data, error } = await supabase.functions.invoke("activate-partner-token", {
        body: { token: value },
      });
      if (error || !data?.ok) {
        toast.error(data?.error || "Token inválido");
        return;
      }
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      toast.success("Plano ativado com sucesso!");
      setToken("");
      fetchProfile();
    } catch (e) {
      toast.error("Erro ao ativar. Tente novamente.");
    } finally {
      setActivatingToken(false);
    }
  };

  if (loading || profileLoading) return null;

  // Se já está no plano Parceiros, não mostra o token.
  const alreadyParceiros = profile?.plan === "parceiros";
  // Esconde o bloco de brinde para planos pagos, mas mantém o Token Parceiros disponível.
  const hideGift = !!(profile?.plan && PAID_PLANS.includes(profile.plan));
  const hasGift = !!availableGift && !hideGift;

  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      <Card className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-amber-500/50 shadow-lg animate-pulse-slow">
        <CardContent className="p-4 sm:p-6 space-y-4">

          {hasGift && (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-bounce" />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                  Você tem um presente!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {availableGift.gift_description || `Resgate seu bônus: ${availableGift.gift_title}`}
                </p>

                {timeLeft && timeLeft !== "Expirado" && (
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2 text-amber-600 dark:text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Tempo restante: {timeLeft}
                    </span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleClaim}
                disabled={claiming || timeLeft === "Expirado"}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
              >
                {claiming ? (
                  "Resgatando..."
                ) : timeLeft === "Expirado" ? (
                  "Expirado"
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Garantir Acesso
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Token Parceiros */}
          {!alreadyParceiros && (
          <div className={hasGift ? "pt-4 border-t border-amber-500/30" : ""}>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 sm:min-w-[160px]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Token Parceiros</p>
                  <p className="text-[11px] text-muted-foreground">Tem uma chave? Ative aqui</p>
                </div>
              </div>
              <Input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Digite sua chave"
                disabled={activatingToken}
                className="bg-background/70"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleActivateToken();
                }}
              />
              <Button
                onClick={handleActivateToken}
                disabled={activatingToken || !token.trim()}
                variant="outline"
                className="border-amber-500/50 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
              >
                {activatingToken ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ativando...
                  </>
                ) : (
                  "Ativar"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
