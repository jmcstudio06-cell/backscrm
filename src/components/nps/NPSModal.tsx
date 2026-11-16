import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell, Gift, Sparkles, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { requestNotificationPermission } from "@/lib/pushNotifications";

interface NPSModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

type NPSStep = "rating" | "feedback" | "referral" | "notification" | "complete";

export function NPSModal({ open, onClose, userId }: NPSModalProps) {
  const [step, setStep] = useState<NPSStep>("rating");
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [wouldRefer, setWouldRefer] = useState<"yes" | "no" | null>(null);
  const [referralReward, setReferralReward] = useState<"discount" | "extra_month" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRatingSubmit = async () => {
    if (rating === null) {
      toast.error("Por favor, selecione uma nota");
      return;
    }

    setStep("feedback");
  };

  const handleFeedbackSubmit = async () => {
    setLoading(true);
    
    try {
      // Salvar NPS no banco
      const { error } = await supabase.from("nps_responses").insert({
        user_id: userId,
        rating,
        feedback: feedback.trim() || null,
        would_refer: wouldRefer,
        referral_reward_choice: referralReward,
      });

      if (error) throw error;

      // Se nota >= 9, perguntar sobre indicação
      if (rating >= 9) {
        setStep("referral");
      } else {
        setStep("notification");
      }
    } catch (error) {
      console.error("Erro ao salvar NPS:", error);
      toast.error("Erro ao enviar feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleReferralSubmit = async () => {
    setLoading(true);

    try {
      // Atualizar resposta com escolha de indicação
      const { error } = await supabase
        .from("nps_responses")
        .update({
          would_refer: wouldRefer,
          referral_reward_choice: referralReward,
        })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      setStep("notification");
    } catch (error) {
      console.error("Erro ao salvar indicação:", error);
      toast.error("Erro ao processar indicação");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationRequest = async () => {
    const granted = await requestNotificationPermission();
    
    if (granted) {
      toast.success("Notificações ativadas! 🎉");
    }

    setStep("complete");
  };

  const handleSkipNotification = () => {
    setStep("complete");
  };

  const handleClose = () => {
    setStep("rating");
    setRating(null);
    setFeedback("");
    setWouldRefer(null);
    setReferralReward(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {/* Step 1: Rating */}
        {step === "rating" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Como está sendo sua experiência?</DialogTitle>
              <DialogDescription>
                De 0 a 10, quanto você recomendaria o Backstage Pro para outro artista?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-11 gap-2">
                {Array.from({ length: 11 }, (_, i) => i).map((num) => (
                  <button
                    key={num}
                    onClick={() => setRating(num)}
                    className={`
                      aspect-square rounded-lg border-2 font-bold text-sm transition-all
                      ${rating === num
                        ? "bg-primary text-primary-foreground border-primary scale-110"
                        : "bg-secondary hover:bg-accent border-border"
                      }
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Nada provável</span>
                <span>Muito provável</span>
              </div>

              <Button 
                onClick={handleRatingSubmit} 
                disabled={rating === null}
                className="w-full"
              >
                Continuar
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Feedback */}
        {step === "feedback" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">
                {rating! >= 9 ? "Que bom que você está gostando! 🎉" : 
                 rating! >= 7 ? "Obrigado pelo feedback! 💙" : 
                 "Queremos melhorar! 🎯"}
              </DialogTitle>
              <DialogDescription>
                {rating! >= 9 ? "O que você mais gosta no Backstage Pro?" :
                 rating! >= 7 ? "Como podemos melhorar sua experiência?" :
                 "O que podemos fazer para te ajudar melhor?"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Seu feedback é muito importante para nós..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="resize-none"
              />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("rating")} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleFeedbackSubmit} disabled={loading} className="flex-1">
                  {loading ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Referral (apenas para notas >= 9) */}
        {step === "referral" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Indique e ganhe!
              </DialogTitle>
              <DialogDescription>
                Conhece outro artista que precisa organizar a carreira?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label>Você indicaria o Backstage Pro?</Label>
                <RadioGroup value={wouldRefer || ""} onValueChange={(v) => setWouldRefer(v as "yes" | "no")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="refer-yes" />
                    <Label htmlFor="refer-yes" className="cursor-pointer">Sim, vou indicar!</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="refer-no" />
                    <Label htmlFor="refer-no" className="cursor-pointer">Não, obrigado</Label>
                  </div>
                </RadioGroup>
              </div>

              {wouldRefer === "yes" && (
                <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <Label className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Quando seu indicado fechar a primeira mensalidade, escolha sua recompensa:
                  </Label>
                  <RadioGroup value={referralReward || ""} onValueChange={(v) => setReferralReward(v as "discount" | "extra_month")}>
                    <div className="flex items-start space-x-2 p-3 rounded-md hover:bg-background transition-colors">
                      <RadioGroupItem value="discount" id="reward-discount" className="mt-1" />
                      <Label htmlFor="reward-discount" className="cursor-pointer flex-1">
                        <div className="font-medium">Desconto na próxima mensalidade</div>
                        <div className="text-sm text-muted-foreground">Economize no seu plano</div>
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2 p-3 rounded-md hover:bg-background transition-colors">
                      <RadioGroupItem value="extra_month" id="reward-month" className="mt-1" />
                      <Label htmlFor="reward-month" className="cursor-pointer flex-1">
                        <div className="font-medium">+1 mês grátis no seu plano</div>
                        <div className="text-sm text-muted-foreground">Aproveite mais tempo</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              <Button 
                onClick={handleReferralSubmit} 
                disabled={loading || wouldRefer === null || (wouldRefer === "yes" && !referralReward)}
                className="w-full"
              >
                {loading ? "Salvando..." : "Continuar"}
              </Button>
            </div>
          </>
        )}

        {/* Step 4: Notification */}
        {step === "notification" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Não perca nenhuma atualização!
              </DialogTitle>
              <DialogDescription>
                Ative as notificações para receber alertas de shows, cobranças e novidades.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  📱 Mantenha sua carreira sempre atualizada com notificações sobre:
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>✓ Shows confirmados</li>
                  <li>✓ Pagamentos recebidos</li>
                  <li>✓ Novos orçamentos</li>
                  <li>✓ Lembretes importantes</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSkipNotification} className="flex-1">
                  Agora não
                </Button>
                <Button onClick={handleNotificationRequest} className="flex-1">
                  Ativar notificações
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Step 5: Complete */}
        {step === "complete" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Obrigado pelo seu feedback!
              </DialogTitle>
              <DialogDescription>
                Sua opinião nos ajuda a melhorar cada vez mais.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-primary/5 rounded-lg text-center">
                <p className="text-sm">
                  Continue organizando sua carreira e fazendo seus shows acontecerem! 🎸
                </p>
              </div>

              <Button onClick={handleClose} className="w-full">
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
