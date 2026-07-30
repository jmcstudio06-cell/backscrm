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
import { CalendarIcon, UserPlus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Lead } from "@/hooks/useLeads";

const leadSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }).max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email({ message: "Email inválido" }).max(100).optional().or(z.literal("")),
  company: z.string().max(100).optional(),
  event_type: z.string().optional(),
  estimated_value: z.number().min(0).optional(),
  status: z.string().min(1, { message: "Selecione uma etapa" }),
  source: z.string().optional(),
  notes: z.string().max(500).optional(),
});

const stages = [
  { id: "new", name: "Leads Novos" },
  { id: "proposal", name: "Com Proposta" },
  { id: "closed", name: "Fechados" },
  { id: "lost", name: "Não Fechados" },
  { id: "repeat", name: "Já Comprou" },
  { id: "never", name: "Nunca Comprou" },
];

const eventTypes = [
  "Casamento",
  "Aniversário",
  "Corporativo",
  "Formatura",
  "Bar/Balada",
  "Festa/Baile",
  "Festival",
  "Outro",
];

const sources = [
  "Instagram",
  "Facebook",
  "Google",
  "Indicação",
  "WhatsApp",
  "Site",
  "Outro",
];

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Lead>) => Promise<void>;
  editingLead?: Lead | null;
}

export function LeadModal({ open, onOpenChange, onSave, editingLead }: LeadModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [estimatedValue, setEstimatedValue] = useState("");
  const [status, setStatus] = useState("new");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editingLead) {
        setName(editingLead.name);
        setPhone(editingLead.phone || "");
        setEmail(editingLead.email || "");
        setCompany(editingLead.company || "");
        setEventType(editingLead.event_type || "");
        setEventDate(editingLead.event_date ? parseISO(editingLead.event_date) : undefined);
        setEstimatedValue(editingLead.estimated_value?.toString() || "");
        setStatus(editingLead.status);
        setSource(editingLead.source || "");
        setNotes(editingLead.notes || "");
      } else {
        setName("");
        setPhone("");
        setEmail("");
        setCompany("");
        setEventType("");
        setEventDate(undefined);
        setEstimatedValue("");
        setStatus("new");
        setSource("");
        setNotes("");
      }
      setErrors({});
    }
  }, [open, editingLead]);

  const handleValueChange = (value: string) => {
    const cleaned = value.replace(/[^\d,\.]/g, "").replace(",", ".");
    setEstimatedValue(cleaned);
  };

  const handleSave = async () => {
    setErrors({});

    const numericValue = parseFloat(estimatedValue) || 0;

    const validation = leadSchema.safeParse({
      name,
      phone: phone || undefined,
      email: email || undefined,
      company: company || undefined,
      event_type: eventType || undefined,
      estimated_value: numericValue,
      status,
      source: source || undefined,
      notes: notes || undefined,
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
        name,
        phone: phone || null,
        email: email || null,
        company: company || null,
        event_type: eventType || null,
        event_date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
        estimated_value: numericValue,
        status,
        source: source || null,
        notes: notes || null,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving lead:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            {editingLead ? "Editar Lead" : "Novo Lead"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome do lead"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 100))}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value.slice(0, 20))}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value.slice(0, 100))}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Empresa/Local</Label>
              <Input
                id="company"
                placeholder="Empresa ou local do evento"
                value={company}
                onChange={(e) => setCompany(e.target.value.slice(0, 100))}
              />
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger>
                  <SelectValue placeholder="De onde veio?" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label>Tipo de Evento</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo do evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Event Date */}
            <div className="space-y-2">
              <Label>Data do Evento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !eventDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? format(eventDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Estimated Value */}
            <div className="space-y-2">
              <Label htmlFor="value">Valor Estimado (R$)</Label>
              <Input
                id="value"
                placeholder="0,00"
                value={estimatedValue}
                onChange={(e) => handleValueChange(e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Etapa do Funil *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className={errors.status ? "border-destructive" : ""}>
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
            </div>

            {/* Notes */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Anotações sobre o lead..."
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">{notes.length}/500</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-primary hover:bg-primary/90">
            {loading ? "Salvando..." : editingLead ? "Salvar Alterações" : "Cadastrar Lead"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}