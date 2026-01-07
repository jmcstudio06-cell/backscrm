import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Target, Music, Video, Users, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AdvanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    title: string;
    category: string;
    due_type: string;
    due_date: string | null;
    priority: string;
  }) => void;
  initialTitle?: string;
}

const categories = [
  { value: "shows", label: "Shows", icon: Target },
  { value: "musica", label: "Música", icon: Music },
  { value: "conteudo", label: "Conteúdo", icon: Video },
  { value: "contatos", label: "Contatos", icon: Users },
  { value: "organizacao", label: "Organização", icon: Briefcase },
];

export function AdvanceModal({ open, onOpenChange, onSave, initialTitle = "" }: AdvanceModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState("shows");
  const [dueType, setDueType] = useState("hoje");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState("simples");

  const handleSubmit = () => {
    if (!title.trim()) return;

    let finalDueDate: string | null = null;
    
    if (dueType === "data") {
      finalDueDate = dueDate ? format(dueDate, "yyyy-MM-dd") : null;
    }

    onSave({
      title: title.trim(),
      category,
      due_type: dueType,
      due_date: finalDueDate,
      priority,
    });

    // Reset form
    setTitle("");
    setCategory("shows");
    setDueType("hoje");
    setDueDate(undefined);
    setPriority("simples");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Novo Avanço
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">O que você vai fazer?</Label>
            <Input
              id="title"
              placeholder="Ex: Ligar para o cliente do casamento"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Isso ajuda em quê?</Label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all text-sm",
                    category === cat.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Type */}
          <div className="space-y-2">
            <Label>Quando?</Label>
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant={dueType === "hoje" ? "default" : "outline"}
                size="sm"
                onClick={() => setDueType("hoje")}
              >
                Hoje
              </Button>
              <Button
                type="button"
                variant={dueType === "semana" ? "default" : "outline"}
                size="sm"
                onClick={() => setDueType("semana")}
              >
                Essa semana
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant={dueType === "data" ? "default" : "outline"}
                    size="sm"
                    className="gap-1"
                    onClick={() => setDueType("data")}
                  >
                    <CalendarIcon className="w-3 h-3" />
                    {dueType === "data" && dueDate
                      ? format(dueDate, "dd/MM", { locale: ptBR })
                      : "Data específica"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setDueType("data");
                    }}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Nível (opcional)</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simples">Simples</SelectItem>
                <SelectItem value="importante">Importante</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Criar Avanço
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
