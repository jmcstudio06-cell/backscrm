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
import { useMusicians } from "@/hooks/useMusicians";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";

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

  const { musicians } = useMusicians();
  const [selectedMusicianId, setSelectedMusicianId] = useState("");
  const [musicianShows, setMusicianShows] = useState<any[]>([]);
  const [selectedShows, setSelectedShows] = useState<string[]>([]);
  const [loadingShows, setLoadingShows] = useState(false);

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
      setSelectedMusicianId("");
      setMusicianShows([]);
      setSelectedShows([]);
    }
  }, [open]);

  useEffect(() => {
    if (category !== "Músicos" || !selectedMusicianId) {
      setMusicianShows([]);
      setSelectedShows([]);
      return;
    }

    const fetchShows = async () => {
      setLoadingShows(true);
      try {
        const mus = musicians.find(m => m.id === selectedMusicianId);
        
        // Fetch shows the musician is part of
        const { data: showsData, error: showsError } = await supabase
          .from("show_musicians")
          .select("fee, show_id, shows(title, date)")
          .eq("musician_id", selectedMusicianId);
        
        if (showsError) throw showsError;
        
        // Fetch past transactions to see what was already paid
        const { data: txData } = await supabase
          .from("transactions")
          .select("description")
          .eq("type", "expense")
          .eq("category", "Músicos");

        const pastDescriptions = (txData || []).map(t => t.description || "");

        if (showsData) {
          const formatted = showsData
            .map((d) => {
              const show = Array.isArray(d.shows) ? d.shows[0] : d.shows;
              return {
                show_id: d.show_id,
                fee: d.fee,
                title: show?.title || "Show",
                date: show?.date || "",
              };
            })

            // Filter out shows whose title appears in any past payment description for this musician
            .filter(s => {
              const isPaid = pastDescriptions.some(desc => 
                desc.includes(mus?.name || "") && desc.includes(s.title)
              );
              return !isPaid;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setMusicianShows(formatted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingShows(false);
      }
    };
    fetchShows();
  }, [category, selectedMusicianId]);

  const handleToggleShow = (showId: string, fee: number) => {
    let newSelected = [...selectedShows];
    if (newSelected.includes(showId)) {
      newSelected = newSelected.filter(id => id !== showId);
    } else {
      newSelected.push(showId);
    }
    setSelectedShows(newSelected);

    // Auto-calculate sum
    const totalFee = musicianShows
      .filter(s => newSelected.includes(s.show_id))
      .reduce((sum, s) => sum + s.fee, 0);
    
    if (totalFee > 0) {
      setAmount(totalFee.toString());
    } else if (newSelected.length === 0) {
      setAmount("");
    }

    // Auto-generate description
    if (newSelected.length > 0) {
      const mus = musicians.find(m => m.id === selectedMusicianId);
      const showsTitles = musicianShows
        .filter(s => newSelected.includes(s.show_id))
        .map(s => {
          const dateObj = new Date(s.date);
          // Ajuste de fuso horário simples para exibição correta
          dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
          return `${s.title} (${format(dateObj, "dd/MM")})`;
        })
        .join(", ");
      setDescription(`Pagamento: ${mus?.name || 'Músico'} - Shows: ${showsTitles}`.slice(0, 200));
    } else {
      setDescription("");
    }
  };

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

          {/* Seleção de Músico e Shows (Apenas se categoria for Músicos) */}
          {type === "expense" && category === "Músicos" && (
            <div className="space-y-4 p-4 rounded-xl bg-secondary/20 border border-border/50">
              <div className="space-y-2">
                <Label>Selecione o Músico</Label>
                <Select value={selectedMusicianId} onValueChange={setSelectedMusicianId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um músico..." />
                  </SelectTrigger>
                  <SelectContent>
                    {musicians.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedMusicianId && (
                <div className="space-y-2">
                  <Label>Vincular a Shows (Opcional)</Label>
                  {loadingShows ? (
                    <p className="text-xs text-muted-foreground">Carregando shows do músico...</p>
                  ) : musicianShows.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum show registrado para este músico.</p>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                      {musicianShows.map((s) => (
                        <div key={s.show_id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`show-${s.show_id}`}
                            checked={selectedShows.includes(s.show_id)}
                            onCheckedChange={() => handleToggleShow(s.show_id, s.fee)}
                          />
                          <Label
                            htmlFor={`show-${s.show_id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {s.title} ({format(new Date(s.date + 'T00:00:00'), "dd/MM")})
                          </Label>
                          <span className="text-xs font-semibold">
                            R$ {s.fee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedShows.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      O valor e a descrição foram preenchidos automaticamente com base nos shows selecionados.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

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