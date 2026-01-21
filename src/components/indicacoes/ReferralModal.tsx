import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, MessageCircle, User } from "lucide-react";

interface ReferralModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, phone: string) => Promise<boolean>;
  userName: string;
}

export function ReferralModal({ open, onOpenChange, onSubmit, userName }: ReferralModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setConfirmed(false);
  };

  // ✅ Handler correto do Dialog (só reseta quando FECHA)
  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) return;

    setLoading(true);
    const success = await onSubmit(name, phone);
    setLoading(false);

    if (success) {
      resetForm();
      onOpenChange(false); // opcional: fecha após enviar
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const isValid = name.trim().length >= 2 && phone.replace(/\D/g, "").length === 11 && confirmed;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Nova Indicação
          </DialogTitle>
          <DialogDescription>Indique um artista para conhecer o Backstage</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome do Artista
            </Label>
            <Input
              id="name"
              placeholder="Ex: João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Label>
            <Input id="phone" placeholder="(11) 99999-9999" value={phone} onChange={handlePhoneChange} required />
          </div>

          <Alert className="border-yellow-500/30 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-sm">
              <strong>Atenção:</strong> Ao confirmar, seu nome ({userName || "você"}) será informado ao artista indicado
              na mensagem automática do WhatsApp.
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="confirm"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
            <Label htmlFor="confirm" className="text-sm font-normal cursor-pointer">
              Entendi e concordo em compartilhar meu nome
            </Label>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? "Enviando..." : "Indicar e Abrir WhatsApp"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
