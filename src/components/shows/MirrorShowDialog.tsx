import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useClients } from "@/hooks/useClients";
import { useShows, type Show } from "@/contexts/shows/ShowsContext";

interface MirrorShowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  show: Show | null;
}

export function MirrorShowDialog({ open, onOpenChange, show }: MirrorShowDialogProps) {
  const { addShow } = useShows();
  const { clients } = useClients();
  const [newDate, setNewDate] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [addressTouched, setAddressTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && show) {
      setNewDate("");
      setClientId(show.client_id || "none");
      setVenue(show.venue || "");
      setAddress(show.address || "");
      setStartTime(show.start_time || "");
      setEndTime(show.end_time || "");
      setAddressTouched(false);
    }
  }, [open, show]);

  // Auto-fill address from client if user hasn't manually edited it
  useEffect(() => {
    if (!open || addressTouched) return;
    if (clientId && clientId !== "none") {
      const client = clients.find((c) => c.id === clientId);
      if (client?.address) {
        setAddress(client.address);
      }
    }
  }, [clientId, clients, open, addressTouched]);

  const handleMirror = async () => {
    if (!show) return;
    if (!newDate) {
      toast.error("Escolha a nova data");
      return;
    }
    setLoading(true);
    try {
      const [{ data: srcMusicians }, { data: srcExpenses }] = await Promise.all([
        supabase.from("show_musicians").select("musician_id, fee, musicians(name)").eq("show_id", show.id),
        supabase.from("show_expenses").select("*").eq("show_id", show.id),
      ]);

      const musicians = (srcMusicians || []).map((m: any) => ({
        musicianId: m.musician_id,
        name: m.musicians?.name || "Músico",
        fee: m.fee || 0,
      }));
      const expenses = (srcExpenses || []).map((e: any) => ({
        id: crypto.randomUUID(),
        description: e.description || "",
        category: e.category,
        value: e.amount || 0,
      }));

      const finalClientId = clientId && clientId !== "none" ? clientId : null;
      const client = finalClientId ? clients.find((c) => c.id === finalClientId) : null;

      let title = show.title;
      if (client && show.client_id !== finalClientId) {
        title = show.event_type ? `${client.name} - ${show.event_type}` : client.name;
      }

      await addShow(
        {
          title,
          date: newDate,
          start_time: startTime || null,
          end_time: endTime || null,
          duration_minutes: (show as any).duration_minutes ?? null,
          performance_format: (show as any).performance_format ?? null,
          venue: venue || null,
          address: address || null,
          cachet: show.cachet ?? 0,
          status: "pending",
          event_type: show.event_type,
          client_id: finalClientId,
          notes: show.notes,
          advance_amount: 0,
          advance_received_date: null,
          balance_due_date: null,
        } as any,
        musicians,
        expenses,
      );

      toast.success("Show espelhado com sucesso!");
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao espelhar show:", err);
      toast.error("Erro ao espelhar o show");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CopyPlus className="w-5 h-5 text-primary" />
            Espelhar Show
          </DialogTitle>
          <DialogDescription>
            Replique os dados de <strong>{show?.title}</strong>. Músicos, despesas, cachê e formato serão copiados automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="mirror-date">Nova data *</Label>
            <Input
              id="mirror-date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="mirror-start">Início</Label>
              <Input
                id="mirror-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mirror-end">Término</Label>
              <Input
                id="mirror-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem cliente / manter em branco</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Se o cliente tiver endereço cadastrado, ele será preenchido automaticamente.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mirror-venue">Local</Label>
            <Input
              id="mirror-venue"
              placeholder="Nome do local"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mirror-address">Endereço</Label>
            <Input
              id="mirror-address"
              placeholder="Rua, número, cidade..."
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setAddressTouched(true);
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleMirror} disabled={loading || !newDate}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CopyPlus className="w-4 h-4 mr-2" />}
            Espelhar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
