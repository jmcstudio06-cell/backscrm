import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureBlockedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
}

export function FeatureBlockedDialog({ 
  open, 
  onOpenChange, 
  featureName 
}: FeatureBlockedDialogProps) {
  const navigate = useNavigate();

  const handleViewPlans = () => {
    onOpenChange(false);
    navigate("/planos");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-warning" />
          </div>
          <DialogTitle className="text-xl">Recurso Bloqueado</DialogTitle>
          <DialogDescription className="text-base mt-2">
            {featureName === "Usuários" ? (
              <>Gestão de Usuários está disponível exclusivamente no plano Executivo.</>
            ) : (
              <>
                O seu plano atual não inclui acesso à página <strong>"{featureName}"</strong>.
              </>
            )}
            <br />
            <br />
            Atualize seu plano para desbloquear este e outros recursos exclusivos!
          </DialogDescription>

        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={handleViewPlans}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            <Crown className="w-5 h-5 mr-2" />
            Ver Planos
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
