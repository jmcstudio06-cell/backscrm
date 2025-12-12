import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Lead } from "@/hooks/useLeads";
import { cn } from "@/lib/utils";

const stageConfig: Record<string, { name: string; color: string; bgColor: string }> = {
  new: { name: "Leads Novos", color: "text-blue-600", bgColor: "bg-blue-100" },
  proposal: { name: "Com Proposta", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  closed: { name: "Fechados", color: "text-green-600", bgColor: "bg-green-100" },
  lost: { name: "Não Fechados", color: "text-red-600", bgColor: "bg-red-100" },
  repeat: { name: "Já Comprou", color: "text-purple-600", bgColor: "bg-purple-100" },
  never: { name: "Nunca Comprou", color: "text-gray-600", bgColor: "bg-gray-100" },
};

interface LeadProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function LeadProfileModal({ open, onOpenChange, lead, onEdit, onDelete }: LeadProfileModalProps) {
  if (!lead) return null;

  const stage = stageConfig[lead.status] || stageConfig.new;

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleWhatsApp = () => {
    if (!lead.phone) return;
    const formattedPhone = lead.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${lead.name}! Tudo bem?`);
    window.open(`https://wa.me/55${formattedPhone}?text=${message}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{lead.name}</h3>
              <Badge className={cn(stage.bgColor, stage.color, "mt-1")}>
                {stage.name}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase">Contato</h4>
            
            {lead.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{lead.phone}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  WhatsApp
                </Button>
              </div>
            )}

            {lead.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{lead.email}</span>
              </div>
            )}

            {lead.company && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{lead.company}</span>
              </div>
            )}
          </div>

          {/* Event Info */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase">Evento</h4>

            {lead.event_type && (
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{lead.event_type}</span>
              </div>
            )}

            {lead.event_date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  {format(parseISO(lead.event_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-success">
                R$ {(lead.estimated_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase">Histórico</h4>
            
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Cadastrado há {getDaysAgo(lead.created_at)} dias
              </span>
            </div>

            {lead.source && (
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Origem: {lead.source}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="space-y-2 pt-4 border-t">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase">Observações</h4>
              <p className="text-sm text-foreground bg-secondary/50 p-3 rounded-lg">{lead.notes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
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