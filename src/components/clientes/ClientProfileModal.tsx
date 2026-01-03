import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
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
  Building2,
  Clock,
  Target,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Client } from "@/hooks/useClients";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface LeadHistoryEntry {
  id: string;
  lead_id: string;
  from_status: string | null;
  to_status: string;
  changed_at: string;
}

interface AssociatedLead {
  id: string;
  name: string;
  status: string;
  source: string | null;
  event_type: string | null;
  estimated_value: number | null;
  created_at: string;
}

const stageConfig: Record<string, { name: string; color: string; bgColor: string; icon: React.ElementType }> = {
  new: { name: "Lead Novo", color: "text-blue-600", bgColor: "bg-blue-100", icon: User },
  proposal: { name: "Com Proposta", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Target },
  closed: { name: "Fechado", color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle2 },
  lost: { name: "Não Fechado", color: "text-red-600", bgColor: "bg-red-100", icon: XCircle },
  repeat: { name: "Já Comprou", color: "text-purple-600", bgColor: "bg-purple-100", icon: TrendingUp },
  never: { name: "Nunca Comprou", color: "text-gray-600", bgColor: "bg-gray-100", icon: Clock },
};

interface ClientProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientProfileModal({ 
  open, 
  onOpenChange, 
  client, 
  onEdit, 
  onDelete,
}: ClientProfileModalProps) {
  const [associatedLead, setAssociatedLead] = useState<AssociatedLead | null>(null);
  const [leadHistory, setLeadHistory] = useState<LeadHistoryEntry[]>([]);
  const [loadingLead, setLoadingLead] = useState(false);

  useEffect(() => {
    if (open && client) {
      fetchAssociatedLead();
    } else {
      setAssociatedLead(null);
      setLeadHistory([]);
    }
  }, [open, client]);

  const fetchAssociatedLead = async () => {
    if (!client) return;
    
    setLoadingLead(true);
    try {
      // Buscar lead pelo nome ou email ou telefone
      let query = supabase.from("leads").select("*");
      
      // Construir query para encontrar lead correspondente
      const conditions = [];
      if (client.name) conditions.push(`name.ilike.%${client.name}%`);
      if (client.email) conditions.push(`email.eq.${client.email}`);
      if (client.phone) conditions.push(`phone.eq.${client.phone}`);
      
      if (conditions.length === 0) {
        setLoadingLead(false);
        return;
      }

      const { data: leads, error } = await supabase
        .from("leads")
        .select("*")
        .or(`name.ilike.%${client.name}%${client.email ? `,email.eq.${client.email}` : ''}${client.phone ? `,phone.eq.${client.phone}` : ''}`)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching associated lead:", error);
        setLoadingLead(false);
        return;
      }

      if (leads) {
        setAssociatedLead(leads);
        
        // Buscar histórico do lead
        const { data: history, error: historyError } = await supabase
          .from("lead_history")
          .select("*")
          .eq("lead_id", leads.id)
          .order("changed_at", { ascending: true });

        if (!historyError && history) {
          setLeadHistory(history);
        }
      }
    } catch (error) {
      console.error("Error fetching associated lead:", error);
    } finally {
      setLoadingLead(false);
    }
  };

  if (!client) return null;

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleWhatsApp = () => {
    if (!client.phone) return;
    let phone = client.phone.replace(/\D/g, '');
    if (!phone.startsWith('55')) {
      phone = '55' + phone;
    }
    const message = encodeURIComponent(`Olá ${client.name}! Tudo bem?`);
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
              <h2 className="text-xl font-bold truncate">{client.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-0">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Cliente
                </Badge>
                {associatedLead && (
                  <Badge className={cn("border-0", stageConfig[associatedLead.status]?.bgColor, stageConfig[associatedLead.status]?.color)}>
                    Veio do Funil
                  </Badge>
                )}
              </div>
              {client.company && (
                <p className="text-sm opacity-80 mt-1 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {client.company}
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
              
              {client.phone && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{client.phone}</span>
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

              {client.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{client.email}</span>
                </div>
              )}

              {client.address && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{client.address}</span>
                </div>
              )}
            </div>

            {/* Documents Section */}
            {(client.cpf || client.rg) && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Documentos
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {client.cpf && (
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground mb-1">CPF/CNPJ</p>
                      <p className="font-medium text-foreground">{client.cpf}</p>
                    </div>
                  )}

                  {client.rg && (
                    <div className="p-3 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground mb-1">RG</p>
                      <p className="font-medium text-foreground">{client.rg}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Estatísticas
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Eventos</span>
                  </div>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {client.shows_count || 0}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-success" />
                    <span className="text-sm text-muted-foreground">Total Gasto</span>
                  </div>
                  <p className="text-2xl font-bold text-success mt-1">
                    R$ {(client.total_spent || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Lead History Timeline - only show if there's an associated lead */}
            {loadingLead ? (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Trajetória no Funil
                </h4>
                <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
              </div>
            ) : associatedLead && leadHistory.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Trajetória no Funil de Vendas
                </h4>
                
                {/* Lead Origin Info */}
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-muted-foreground">
                      Origem: <span className="font-medium text-foreground">{associatedLead.source || 'Não informada'}</span>
                    </span>
                  </div>
                  {associatedLead.event_type && (
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">
                        Tipo de Evento: <span className="font-medium text-foreground">{associatedLead.event_type}</span>
                      </span>
                    </div>
                  )}
                  {associatedLead.estimated_value && (
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <DollarSign className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">
                        Valor Estimado: <span className="font-medium text-foreground">R$ {associatedLead.estimated_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  
                  <div className="space-y-4">
                    {leadHistory.map((entry, index) => {
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
              </div>
            )}

            {/* Info Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Informações
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Cliente há</p>
                  <p className="font-medium text-foreground">{getDaysAgo(client.created_at)} dias</p>
                </div>

                <div className="p-3 rounded-lg bg-secondary/50">
                  <p className="text-xs text-muted-foreground mb-1">Cadastrado em</p>
                  <p className="font-medium text-foreground">
                    {format(parseISO(client.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Observações
                </h4>
                <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-lg">{client.notes}</p>
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
