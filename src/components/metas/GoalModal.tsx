import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Goal } from "@/hooks/useGoals";

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSave: (id: string, updates: Partial<Goal>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const goalTypes = [
  { value: "sales", label: "Meta de Vendas" },
  { value: "leads", label: "Meta de Leads" },
  { value: "financial", label: "Meta de Receita" },
  { value: "shows", label: "Meta de Shows" },
];

const months = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export function GoalModal({ open, onOpenChange, goal, onSave, onDelete }: GoalModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("financial");
  const [targetValue, setTargetValue] = useState("");
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setType(goal.type);
      setTargetValue(goal.target_value.toString());
      setMonth(goal.month);
      setYear(goal.year);
    } else {
      setTitle("");
      setType("financial");
      setTargetValue("");
      setMonth(new Date().getMonth() + 1);
      setYear(new Date().getFullYear());
    }
  }, [goal]);

  const handleSave = async () => {
    if (!goal) return;
    setLoading(true);
    try {
      await onSave(goal.id || "", {
        title,
        type,
        target_value: parseFloat(targetValue) || 0,
        month,
        year,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!goal || !goal.id) return;
    setLoading(true);
    try {
      await onDelete(goal.id);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const isNewGoal = !goal?.id;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isNewGoal ? "Nova Meta" : "Configurar Meta"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Meta</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Meta de Shows de Dezembro"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Meta</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {goalTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">
              Valor da Meta {type === "financial" ? "(R$)" : ""}
            </Label>
            <Input
              id="target"
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder={type === "financial" ? "5000" : "10"}
            />
            <p className="text-xs text-muted-foreground">
              {type === "shows" && "O valor atual será calculado automaticamente pelos shows do mês (exceto cancelados)"}
              {type === "leads" && "O valor atual será calculado automaticamente pelos leads cadastrados no mês"}
              {type === "financial" && "O valor atual será calculado automaticamente pela receita bruta do mês"}
              {type === "sales" && "O valor atual será calculado automaticamente pelas vendas fechadas do mês"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          {!isNewGoal && (
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              Excluir Meta
            </Button>
          )}
          <div className={`flex gap-2 ${isNewGoal ? "ml-auto" : ""}`}>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : isNewGoal ? "Criar" : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
