import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useBookingRequests, BookingRequest } from "@/hooks/useBookingRequests";
import { useProfile } from "@/hooks/useProfile";
import { useShows } from "@/contexts/shows/ShowsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock, CheckCircle, XCircle, Trash2, Calendar, MapPin, Phone, User,
  Copy, ExternalLink, Loader2, Link2, Save, Inbox
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendente: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock },
  aprovado: { label: "Aprovado", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle },
  recusado: { label: "Recusado", color: "bg-destructive/20 text-destructive border-destructive/30", icon: XCircle },
};

export default function Solicitacoes() {
  const { requests, loading, updateRequestStatus, deleteRequest } = useBookingRequests();
  const { profile, updateProfile } = useProfile();
  const { addShow } = useShows();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [slug, setSlug] = useState(profile?.slug || "");
  const [savingSlug, setSavingSlug] = useState(false);

  // Sync slug from profile
  useState(() => {
    if (profile?.slug) setSlug(profile.slug);
  });

  const handleApprove = async (request: BookingRequest) => {
    setApproving(request.id);
    const success = await updateRequestStatus(request.id, "aprovado");
    if (success) {
      // Create show in agenda
      try {
        await addShow({
          title: `${request.product_name || "Show"} — ${request.client_name}`,
          date: request.event_date,
          venue: request.event_location || undefined,
          address: request.event_city || undefined,
          status: "confirmed",
          notes: request.observations || undefined,
          cachet: 0,
        });
        toast.success("Show criado na agenda!");
      } catch (error) {
        console.error("Error creating show:", error);
      }
    }
    setApproving(null);
  };

  const handleSaveSlug = async () => {
    if (!slug.trim()) {
      toast.error("Informe um slug válido");
      return;
    }
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
    setSavingSlug(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ slug: cleanSlug })
        .eq("user_id", profile?.user_id);
      if (error) {
        if (error.code === "23505") {
          toast.error("Esse slug já está em uso. Escolha outro.");
        } else {
          throw error;
        }
      } else {
        setSlug(cleanSlug);
        toast.success("Link público atualizado!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar slug");
    } finally {
      setSavingSlug(false);
    }
  };

  const publicUrl = `${window.location.origin}/booking/${slug || "[seu-slug]"}`;

  const copyLink = () => {
    if (!slug) return toast.error("Configure seu slug primeiro.");
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link copiado!");
  };

  const pendingRequests = requests.filter((r) => r.status === "pendente");
  const otherRequests = requests.filter((r) => r.status !== "pendente");

  return (
    <Layout title="Solicitações" subtitle="Gerencie pedidos de contratação recebidos pelo seu link público">
      {/* Public Link Config */}
      <ChartCard title="Seu Link Público" subtitle="Compartilhe para receber solicitações de contratação">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <Label>Slug (identificador único)</Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground whitespace-nowrap">/booking/</span>
                <Input
                  className="bg-secondary"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="seu-nome-artistico"
                />
              </div>
            </div>
            <Button onClick={handleSaveSlug} disabled={savingSlug}>
              {savingSlug ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </div>

          {slug && (
            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border border-border">
              <Link2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-foreground truncate flex-1">{publicUrl}</span>
              <Button size="sm" variant="ghost" onClick={copyLink}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </ChartCard>

      {/* Requests */}
      <Tabs defaultValue="pending" className="mt-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="w-4 h-4" />
            Pendentes
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Inbox className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma solicitação pendente.</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onApprove={() => handleApprove(req)}
                onReject={() => updateRequestStatus(req.id, "recusado")}
                onDelete={() => setDeleteTarget(req.id)}
                approving={approving === req.id}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          {otherRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum histórico.</p>
            </div>
          ) : (
            otherRequests.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onDelete={() => setDeleteTarget(req.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir solicitação?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteTarget) deleteRequest(deleteTarget); setDeleteTarget(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

function RequestCard({
  request,
  onApprove,
  onReject,
  onDelete,
  approving,
}: {
  request: BookingRequest;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  approving?: boolean;
}) {
  const status = statusConfig[request.status] || statusConfig.pendente;
  const StatusIcon = status.icon;

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{request.client_name}</h3>
            <Badge className={cn("border text-xs", status.color)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          {request.product_name && (
            <p className="text-sm text-primary font-medium mt-1">{request.product_name}</p>
          )}
        </div>
        {onDelete && (
          <Button size="icon" variant="ghost" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(request.event_date + "T12:00:00"), "dd/MM/yyyy")}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Phone className="w-3.5 h-3.5" />
          {request.client_phone}
        </div>
        {request.event_city && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {request.event_city}
          </div>
        )}
        {request.event_location && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {request.event_location}
          </div>
        )}
      </div>

      {request.observations && (
        <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">{request.observations}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Recebido em {format(new Date(request.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
      </p>

      {request.status === "pendente" && onApprove && onReject && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" onClick={onApprove} disabled={approving} className="gap-1.5">
            {approving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Aprovar e Agendar
          </Button>
          <Button size="sm" variant="outline" onClick={onReject} className="gap-1.5 text-destructive hover:text-destructive">
            <XCircle className="w-3.5 h-3.5" />
            Recusar
          </Button>
        </div>
      )}
    </div>
  );
}
