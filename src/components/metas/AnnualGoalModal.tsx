import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnnualGoal } from "@/hooks/useAnnualGoals";
import { Loader2, Trash2 } from "lucide-react";

interface AnnualGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: AnnualGoal | null;
  onSave: (id: string, updates: Partial<AnnualGoal>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const categories = [
  { value: "marketing", label: "Marketing" },
  { value: "midia", label: "Mídia" },
  { value: "parcerias", label: "Parcerias" },
  { value: "crescimento", label: "Crescimento" },
  { value: "pessoal", label: "Pessoal" },
];

const currentYear = new Date().getFullYear();
const years = [currentYear, currentYear + 1, currentYear + 2];

export function AnnualGoalModal({
  open,
  onOpenChange,
  goal,
  onSave,
  onDelete,
}: AnnualGoalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [category, setCategory] = useState("marketing");
  const [year, setYear] = useState(currentYear.toString());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || "");
      setTargetValue(goal.target_value.toString());
      setCategory(goal.category);
      setYear(goal.year.toString());
    } else {
      setTitle("");
      setDescription("");
      setTargetValue("");
      setCategory("marketing");
      setYear(currentYear.toString());
    }
  }, [goal]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(goal?.id || "", {
        title,
        description: description || null,
        target_value: parseInt(targetValue) || 1,
        category,
        year: parseInt(year),
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!goal?.id || !onDelete) return;
    setLoading(true);
    try {
      await onDelete(goal.id);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!goal?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Meta Anual" : "Nova Meta Anual"}
          </DialogTitle>
          <DialogDescription>
            Metas de marketing e visibilidade para o ano
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Meta</Label>
            <Input
              id="title"
              placeholder="Ex: Tocar 5 vezes na rádio, Aparecer na TV..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalhes sobre essa meta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Quantidade</Label>
              <Input
                id="target"
                type="number"
                placeholder="Ex: 5"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Ano</Label>
            <Select value={year} onValueChange={setYear}>
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

        <div className="flex justify-between">
          {isEditing && onDelete ? (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading || !title || !targetValue}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
