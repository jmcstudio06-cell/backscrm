import { Layout } from "@/components/layout/Layout";
import { useBookingRequests } from "@/hooks/useBookingRequests";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, Phone, Clock, Package, Trash2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Solicitacoes() {
  const { requests, loading, updateRequestStatus, deleteRequest } = useBookingRequests();

  const statusConfig = {
    pendente: { label: "Pendente", variant: "secondary" as const, color: "bg-yellow-500" },
    aprovado: { label: "Aprovado", variant: "default" as const, color: "bg-green-500" },
    recusado: { label: "Recusado", variant: "destructive" as const, color: "bg-red-500" },
  };

  if (loading) {
    return (
      <Layout title="Solicitações de Contratação" subtitle="Gerencie pedidos de contratação recebidos pelo seu link público">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Agenda Online" subtitle="Configure seu link público e gerencie solicitações de contratação">
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 animate-pulse">
            <Calendar className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Em Breve</h2>
          <p className="text-muted-foreground max-w-md text-lg">
            Novidades chegando! Em breve você poderá gerenciar todas as solicitações de contratação recebidas pelo seu link público.
          </p>
          <div className="mt-6 px-6 py-3 bg-primary/5 rounded-full border border-primary/20">
            <p className="text-sm text-primary font-medium">🎵 Aguarde novidades incríveis</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const status = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pendente;
            
            return (
              <Card key={request.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">{request.client_name}</h3>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recebido em {format(new Date(request.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  
                  {request.status === "pendente" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateRequestStatus(request.id, "aprovado")}
                        className="gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateRequestStatus(request.id, "recusado")}
                        className="gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Recusar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Data:</span>
                    <span>{format(new Date(request.event_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  </div>

                  {request.event_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Horário:</span>
                      <span>{request.event_time}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Telefone:</span>
                    <a href={`tel:${request.client_phone}`} className="text-primary hover:underline">
                      {request.client_phone}
                    </a>
                  </div>

                  {request.product_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Serviço:</span>
                      <span>{request.product_name}</span>
                    </div>
                  )}

                  {request.event_type && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Tipo:</span>
                      <span>{request.event_type}</span>
                    </div>
                  )}

                  {(request.event_city || request.event_location) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Local:</span>
                      <span>
                        {request.event_location && request.event_city
                          ? `${request.event_location}, ${request.event_city}`
                          : request.event_location || request.event_city}
                      </span>
                    </div>
                  )}
                </div>

                {request.observations && (
                  <div className="p-3 bg-secondary/50 rounded-lg mb-4">
                    <p className="text-sm font-medium text-foreground mb-1">Observações:</p>
                    <p className="text-sm text-muted-foreground">{request.observations}</p>
                  </div>
                )}

                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="gap-1 text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                        Remover
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover solicitação?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. A solicitação será removida permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteRequest(request.id)}>
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
