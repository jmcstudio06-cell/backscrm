import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Target, Flame, Rocket, Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonthlyShowGoalModalProps {
  open: boolean;
  onClose: (target: number) => void;
  monthName: string;
}

const goalOptions = [
  { value: 3, label: "3 shows", icon: Target, description: "Ritmo tranquilo", gradient: "from-emerald-500 to-teal-600" },
  { value: 5, label: "5 shows", icon: Zap, description: "Boa frequência", gradient: "from-blue-500 to-indigo-600" },
  { value: 10, label: "10 shows", icon: Rocket, description: "Alta performance", gradient: "from-violet-500 to-purple-600" },
  { value: 15, label: "+10 shows", icon: Trophy, description: "Máquina de shows!", gradient: "from-amber-500 to-orange-600" },
];

export function MonthlyShowGoalModal({ open, onClose, monthName }: MonthlyShowGoalModalProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    setLoading(true);
    onClose(selected);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[420px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30">
              <Target className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-lg">
              📊 Defina sua meta de shows
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Quantos shows você pretende fazer em <span className="font-semibold text-foreground capitalize">{monthName}</span>?
          </p>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {goalOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selected === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSelected(option.value)}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br",
                  option.gradient
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-foreground">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={selected === null || loading}
          className="w-full mt-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          size="lg"
        >
          <Flame className="w-4 h-4 mr-2" />
          {loading ? "Salvando..." : "Definir Meta"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
