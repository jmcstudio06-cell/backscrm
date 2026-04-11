import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { toast } from "sonner";

const transactionSchema = z.object({
  amount: z.number().positive({ message: "Valor deve ser maior que zero" }),
  category: z.string().min(1, { message: "Selecione uma categoria" }),
  description: z.string().max(200, { message: "Descrição muito longa" }).optional(),
  date: z.date({ required_error: "Selecione uma data" }),
});

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense";
  onSave: (data: {
    type: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    is_advance_payment: boolean;
  }) => Promise<void>;
}

const expenseCategories = [
  "Músicos",
  "Transporte",
  "Alimentação",
  "Equipamento",
  "Marketing",
  "Aluguel",
  "Impostos",
  "Manutenção",
  "Outros",
];

const incomeCategories = [
  "Show",
  "Aula",
  "Ensaio",
  "Direitos Autorais",
  "Patrocínio",
  "Venda de Produtos",
  "Outros",
];

export function TransactionModal({ open, onOpenChange, type, onSave }: TransactionModalProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAdvancePayment, setIsAdvancePayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = type === "income" ? incomeCategories : expenseCategories;
  const title = type === "income" ? "Nova Receita" : "Nova Despesa";
  const Icon = type === "income" ? TrendingUp : TrendingDown;

  useEffect(() => {
    if (open) {
      setAmount("");
      setCategory("");
      setDescription("");
      setDate(new Date());
      setIsAdvancePayment(false);
      setErrors({});
    }
  }, [open]);

  const handleAmountChange = (value: string) => {
    // Allow only numbers and comma/dot for decimals
    const cleaned = value.replace(/[^\d,\.]/g, "").replace(",", ".");
    setAmount(cleaned);
  };

  const handleSave = async () => {
    setErrors({});

    const numericAmount = parseFloat(amount);

    const validation = transactionSchema.safeParse({
      amount: isNaN(numericAmount) ? 0 : numericAmount,
      category,
      description: description || undefined,
      date,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await onSave({
        type,
        amount: numericAmount,
        category,
        description: description.trim(),
        date: format(date!, "yyyy-MM-dd"),
        is_advance_payment: isAdvancePayment,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar transação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              type === "income" ? "bg-success/10" : "bg-destructive/10"
            }`}>
              <Icon className={`w-4 h-4 ${type === "income" ? "text-success" : "text-destructive"}`} />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$) *</Label>
            <Input
              id="amount"
              placeholder="0,00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={errors.amount ? "border-destructive" : ""}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                    errors.date && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a transação..."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 200))}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/200
            </p>
          </div>

          {/* Advance Payment Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
            <div className="space-y-0.5">
              <Label htmlFor="advance-payment" className="text-sm font-medium cursor-pointer">
                Pagamento Antecipado
              </Label>
              <p className="text-xs text-muted-foreground">Marque se foi pago antes da data do evento</p>
            </div>
            <Switch
              id="advance-payment"
              checked={isAdvancePayment}
              onCheckedChange={setIsAdvancePayment}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className={type === "income" ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}