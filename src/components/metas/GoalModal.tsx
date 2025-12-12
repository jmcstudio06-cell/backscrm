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
import { DollarSign, Mic2, Users, TrendingUp } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  type: string;
  target_value: number;
  current_value: number | null;
  month: number;
  year: number;
}

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSave: (id: string, updates: Partial<Goal>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const goalTypes = [
  { value: "sales", label: "Meta de Vendas", icon: TrendingUp },
  { value: "leads", label: "Meta de Lead", icon: Users },
  { value: "financial", label: "Meta de Receita", icon: DollarSign },
  { value: "shows", label: "Meta de Shows", icon: Mic2 },
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
  const [currentValue, setCurrentValue] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setType(goal.type);
      setTargetValue(goal.target_value.toString());
      setCurrentValue((goal.current_value || 0).toString());
      setMonth(goal.month);
      setYear(goal.year);
    }
  }, [goal]);

  const handleSave = async () => {
    if (!goal) return;
    setLoading(true);
    try {
      await onSave(goal.id, {
        title,
        type,
        target_value: parseFloat(targetValue) || 0,
        current_value: parseFloat(currentValue) || 0,
        month,
        year,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!goal) return;
    setLoading(true);
    try {
      await onDelete(goal.id);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Meta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da meta"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {goalTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                      <t.icon className="w-4 h-4" />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor Atual</Label>
              <Input
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Alvo</Label>
              <Input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="0"
              />
            </div>
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

        <div className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            Excluir Meta
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
