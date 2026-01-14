import { useState, useEffect } from "react";
import { Gift, Clock, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUserGifts } from "@/hooks/useUserGifts";
import ReactConfetti from "react-confetti";

export function GiftClaimCard() {
  const { gifts, loading, claimGift, getAvailableGift } = useUserGifts();
  const [claiming, setClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

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

  if (loading) return null;
  if (!availableGift) return null;

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
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-bounce" />
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                🎁 Você tem um presente!
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
                  Resgatar Bônus
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
