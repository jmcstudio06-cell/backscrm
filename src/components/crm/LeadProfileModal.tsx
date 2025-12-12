import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  MessageCircle,
  Edit,
  Trash2,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Lead, LeadHistoryEntry } from "@/hooks/useLeads";
import { cn } from "@/lib/utils";

const stageConfig: Record<string, { name: string; color: string; bgColor: string; icon: React.ElementType }> = {
  new: { name: "Leads Novos", color: "text-blue-600", bgColor: "bg-blue-100", icon: User },
  proposal: { name: "Com Proposta", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Target },
  closed: { name: "Fechados", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle2 },
  lost: { name: "Não Fechados", color: "text-red-600", bgColor: "bg-red-100", icon: XCircle },
  repeat: { name: "Já Comprou", color: "text-purple-600", bgColor: "bg-purple-100", icon: TrendingUp },
  never: { name: "Nunca Comprou", color: "text-gray-600", bgColor: "bg-gray-100", icon: Clock },
};

interface LeadProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onEdit: () => void;
  onDelete: () => void;
  fetchLeadHistory: (leadId: string) => Promise<LeadHistoryEntry[]>;
}

export function LeadProfileModal({ 
  open, 
  onOpenChange, 
  lead, 
  onEdit, 
  onDelete,
  fetchLeadHistory 
}: LeadProfileModalProps) {
  const [history, setHistory] = useState<LeadHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (open && lead) {
      setLoadingHistory(true);
      fetchLeadHistory(lead.id)
        .then(setHistory)
        .finally(() => setLoadingHistory(false));
    }
  }, [open, lead]);

  if (!lead) return null;

  const stage = stageConfig[lead.status] || stageConfig.new;
  const StageIcon = stage.icon;

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleWhatsApp = () => {
    if (!lead.phone) return;
    // Remove all non-numeric characters
    let phone = lead.phone.replace(/\D/g, '');
    // Add Brazil country code if not present
    if (!phone.startsWith('55')) {
      phone = '55' + phone;
    }
    const message = encodeURIComponent(`Olá ${lead.name}! Tudo bem?`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] p-0 gap-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold truncate">{lead.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={cn("border-0", stage.bgColor, stage.color)}>
                  <StageIcon className="w-3 h-3 mr-1" />
                  {stage.name}
                </Badge>
              </div>
              {lead.company && (
                <p className="text-sm opacity-80 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {lead.company}
                </p>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 space-y-6">
            {/* Contact Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Contato
              </h4>
              
              {lead.phone && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{lead.phone}</span>
                  </div>
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              )}

              {lead.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{lead.email}</span>
                </div>
              )}
            </div>

            {/* Event Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Evento
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {lead.event_type && (
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                    <p className="font-medium text-foreground">{lead.event_type}</p>
                  </div>
                )}

                {lead.event_date && (
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">Data</p>
                    <p className="font-medium text-foreground">
                      {format(parseISO(lead.event_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-success" />
                  <span className="text-sm text-muted-foreground">Valor Estimado</span>
                </div>
                <p className="text-2xl font-bold text-success mt-1">
                  R$ {(lead.estimated_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* History Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Histórico de Etapas
              </h4>
              
              {loadingHistory ? (
                <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
              ) : history.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum histórico disponível</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  
                  <div className="space-y-4">
                    {history.map((entry, index) => {
                      const toStage = stageConfig[entry.to_status] || stageConfig.new;
                      const fromStage = entry.from_status ? stageConfig[entry.from_status] : null;
                      const ToIcon = toStage.icon;
                      
                      return (
                        <div key={entry.id} className="relative flex gap-4 pl-2">
                          {/* Timeline dot */}
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10",
                            toStage.bgColor
                          )}>
                            <ToIcon className={cn("w-3 h-3", toStage.color)} />
                          </div>
                          
                          <div className="flex-1 pb-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {fromStage && (
                                <>
                                  <Badge variant="outline" className="text-xs">
                                    {fromStage.name}
                                  </Badge>
                                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                </>
                              )}
                              <Badge className={cn("text-xs", toStage.bgColor, toStage.color)}>
                                {toStage.name}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(parseISO(entry.changed_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Informações
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Cadastrado há</p>
                  <p className="font-medium text-foreground">{getDaysAgo(lead.created_at)} dias</p>
                </div>

                {lead.source && (
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground mb-1">Origem</p>
                    <p className="font-medium text-foreground">{lead.source}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Observações
                </h4>
                <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-lg">{lead.notes}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-secondary/30 flex gap-3 justify-end">
          <Button 
            variant="outline" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir
          </Button>
          <Button onClick={onEdit} className="bg-primary hover:bg-primary/90">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}