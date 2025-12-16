import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  FileText,
  CreditCard,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Client } from "@/hooks/useClients";

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
