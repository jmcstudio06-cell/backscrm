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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && show) {
      setNewDate("");
      setClientId(show.client_id || "none");
    }
  }, [open, show]);

  const handleMirror = async () => {
    if (!show) return;
    if (!newDate) {
      toast.error("Escolha a nova data");
      return;
    }
    setLoading(true);
    try {
      // Fetch musicians & expenses of source show
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

      // Build new title: if client changed, use "<client> - <event_type or original title suffix>"
      let title = show.title;
      if (client && show.client_id !== finalClientId) {
        title = show.event_type ? `${client.name} - ${show.event_type}` : client.name;
      }

      await addShow(
        {
          title,
          date: newDate,
          start_time: show.start_time,
          end_time: show.end_time,
          duration_minutes: show.duration_minutes,
          performance_format: show.performance_format,
          venue: show.venue,
          address: show.address,
          cachet: show.cachet,
          status: "scheduled",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CopyPlus className="w-5 h-5 text-primary" />
            Espelhar Show
          </DialogTitle>
          <DialogDescription>
            Replique todos os dados de <strong>{show?.title}</strong> para uma nova data.
            Músicos, despesas, local, cachê e formato serão copiados.
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
              Escolha o mesmo cliente para manter, ou selecione outro para agilizar.
            </p>
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
