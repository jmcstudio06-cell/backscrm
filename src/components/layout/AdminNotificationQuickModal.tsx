import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Sparkles, Gift, Megaphone, Send, Loader2 } from "lucide-react";

const TYPES = [
  { value: "update", label: "Atualização", icon: Sparkles },
  { value: "promo", label: "Promoção", icon: Gift },
  { value: "tip", label: "Dica", icon: Megaphone },
  { value: "general", label: "Geral", icon: Bell },
];

const ACTIONS = [
  { value: "none", label: "Nenhuma" },
  { value: "/dashboard", label: "Dashboard" },
  { value: "/agenda", label: "Agenda" },
  { value: "/planos", label: "Planos" },
  { value: "/financeiro", label: "Financeiro" },
  { value: "/tutoriais", label: "Tutoriais" },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSent?: () => void;
}

export function AdminNotificationQuickModal({ open, onOpenChange, onSent }: Props) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("update");
  const [actionUrl, setActionUrl] = useState("none");
  const [sendPush, setSendPush] = useState(true);
  const [sending, setSending] = useState(false);

  const reset = () => {
    setTitle(""); setMessage(""); setType("update"); setActionUrl("none"); setSendPush(true);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Preencha título e mensagem");
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-app-notification", {
        body: {
          title,
          message,
          notification_type: type,
          action_url: actionUrl === "none" ? null : actionUrl,
          target_audience: "all",
          send_push: sendPush,
        },
      });
      if (error) throw error;
      const inserted = data?.inserted || 0;
      const pushSent = data?.push_sent || 0;
      toast.success(`${inserted} notificações criadas${sendPush ? ` + ${pushSent} push` : ""}`);
      reset();
      onOpenChange(false);
      onSent?.();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar notificação");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Nova notificação
          </DialogTitle>
          <DialogDescription>Envia para todos os usuários do app.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-4 gap-2">
              {TYPES.map((t) => {
                const Icon = t.icon;
                const active = type === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[11px] font-medium transition-all ${
                      active ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/30"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Nova funcionalidade!" />
          </div>

          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Conte a novidade..." />
          </div>

          <div className="space-y-2">
            <Label>Ação ao clicar</Label>
            <Select value={actionUrl} onValueChange={setActionUrl}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACTIONS.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Enviar push também</p>
              <p className="text-xs text-muted-foreground">Notificação no celular</p>
            </div>
            <Switch checked={sendPush} onCheckedChange={setSendPush} />
          </div>

          <Button onClick={handleSend} disabled={sending || !title.trim() || !message.trim()} className="w-full">
            {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <><Send className="w-4 h-4 mr-2" />Enviar</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
