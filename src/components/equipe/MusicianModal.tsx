import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Music, Phone, Mail, DollarSign, Star, Calendar, Key } from "lucide-react";
import { Musician } from "@/hooks/useMusicians";

interface MusicianModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<Musician> & { member_type?: string; rating?: number; payment_request_date?: string }) => void;
  editingMusician?: Musician | null;
}

const instruments = [
  "Vocalista",
  "Guitarra",
  "Baixo",
  "Bateria",
  "Teclado",
  "Sanfoneiro",
  "Saxofone",
  "Trompete",
  "Trombone",
  "Violino",
  "Violinista",
  "Percussão",
  "DJ",
  "Outro",
];

const ratings = [
  { value: "1", label: "⭐ 1 - Precisa melhorar" },
  { value: "2", label: "⭐⭐ 2 - Regular" },
  { value: "3", label: "⭐⭐⭐ 3 - Bom" },
  { value: "4", label: "⭐⭐⭐⭐ 4 - Muito bom" },
  { value: "5", label: "⭐⭐⭐⭐⭐ 5 - Excelente" },
];

export function MusicianModal({ open, onOpenChange, onSave, editingMusician }: MusicianModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    instrument: "",
    email: "",
    phone: "",
    rate: 0,
    notes: "",
    member_type: "freelancer",
    rating: "",
    payment_request_date: "",
    pix_key: "",
  });

  useEffect(() => {
    if (open && editingMusician) {
      setFormData({
        name: editingMusician.name || "",
        instrument: editingMusician.instrument || "",
        email: editingMusician.email || "",
        phone: editingMusician.phone || "",
        rate: editingMusician.rate || 0,
        notes: editingMusician.notes || "",
        member_type: editingMusician.member_type || "freelancer",
        rating: editingMusician.rating?.toString() || "",
        payment_request_date: editingMusician.payment_request_date || "",
        pix_key: editingMusician.pix_key || "",
      });
    } else if (open && !editingMusician) {
      setFormData({
        name: "",
        instrument: "",
        email: "",
        phone: "",
        rate: 0,
        notes: "",
        member_type: "freelancer",
        rating: "",
        payment_request_date: "",
        pix_key: "",
      });
    }
  }, [open, editingMusician]);

  const handleSubmit = () => {
    if (!formData.name) {
      return;
    }

    onSave({
      name: formData.name,
      instrument: formData.instrument || null,
      email: formData.email || null,
      phone: formData.phone || null,
      rate: formData.rate || null,
      notes: formData.notes || null,
      member_type: formData.member_type,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      payment_request_date: formData.payment_request_date || undefined,
      pix_key: formData.pix_key || null,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            {editingMusician ? "Editar Membro" : "Novo Membro"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="w-4 h-4" /> Nome *
              </Label>
              <Input
                id="name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instrument" className="flex items-center gap-2">
                <Music className="w-4 h-4" /> Instrumento/Função
              </Label>
              <Select
                value={formData.instrument}
                onValueChange={(value) => setFormData({ ...formData, instrument: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((inst) => (
                    <SelectItem key={inst} value={inst}>
                      {inst}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> Telefone
              </Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Cachê Padrão (R$)
              </Label>
              <Input
                id="rate"
                type="number"
                placeholder="0,00"
                value={formData.rate || ""}
                onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating" className="flex items-center gap-2">
                <Star className="w-4 h-4" /> Avaliação
              </Label>
              <Select
                value={formData.rating}
                onValueChange={(value) => setFormData({ ...formData, rating: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ratings.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Data Solicitação Cachê
              </Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_request_date}
                onChange={(e) => setFormData({ ...formData, payment_request_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pix_key" className="flex items-center gap-2">
                <Key className="w-4 h-4" /> Chave PIX
              </Label>
              <Input
                id="pix_key"
                placeholder="CPF, telefone, email ou chave aleatória"
                value={formData.pix_key}
                onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">Tipo de Membro</Label>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.member_type === "fixo"}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, member_type: checked ? "fixo" : "freelancer" })
                    }
                  />
                  <span className="text-sm font-medium">
                    {formData.member_type === "fixo" ? "Membro Fixo" : "Freelancer"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Anotações sobre o músico..."
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90">
              {editingMusician ? "Salvar Alterações" : "Adicionar Membro"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
