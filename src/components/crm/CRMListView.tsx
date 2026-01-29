import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Phone,
  Target,
  Clock,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Eye,
  Trash2,
  MessageCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Lead } from "@/hooks/useLeads";

const stages = [
  { id: "new", name: "Leads Novos", shortName: "Novo", color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50", borderColor: "border-blue-200", icon: Users },
  { id: "contact", name: "Em Contato", shortName: "Contato", color: "bg-cyan-500", textColor: "text-cyan-600", bgLight: "bg-cyan-50", borderColor: "border-cyan-200", icon: Phone },
  { id: "proposal", name: "Com Proposta", shortName: "Proposta", color: "bg-yellow-500", textColor: "text-yellow-600", bgLight: "bg-yellow-50", borderColor: "border-yellow-200", icon: Target },
  { id: "negotiation", name: "Negociação", shortName: "Negociação", color: "bg-orange-500", textColor: "text-orange-600", bgLight: "bg-orange-50", borderColor: "border-orange-200", icon: Clock },
  { id: "closed", name: "Fechados", shortName: "Fechado", color: "bg-green-500", textColor: "text-green-600", bgLight: "bg-green-50", borderColor: "border-green-200", icon: TrendingUp },
  { id: "lost", name: "Perdidos", shortName: "Perdido", color: "bg-red-500", textColor: "text-red-600", bgLight: "bg-red-50", borderColor: "border-red-200", icon: AlertCircle },
];

interface CRMListViewProps {
  leads: Lead[];
  onViewProfile: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onChangeStage: (leadId: string, newStage: string) => void;
  onWhatsApp: (phone: string | null, name: string) => void;
}

const ITEMS_PER_PAGE = 15;

export function CRMListView({ leads, onViewProfile, onDelete, onChangeStage, onWhatsApp }: CRMListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeads = leads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* List Header - Desktop */}
      <div className="hidden md:grid grid-cols-[1fr_140px_100px_140px_120px_100px] gap-4 p-4 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
        <span>Lead</span>
        <span>Etapa</span>
        <span>Dias</span>
        <span>Valor Estimado</span>
        <span>Telefone</span>
        <span className="text-right">Ações</span>
      </div>
      
      {/* List Content */}
      <div className="divide-y divide-border">
        {paginatedLeads.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            Nenhum lead encontrado
          </div>
        ) : (
          paginatedLeads.map((lead) => {
            const stage = stages.find(s => s.id === lead.status) || stages[0];
            const daysAgo = getDaysAgo(lead.created_at);
            
            return (
              <div 
                key={lead.id}
                className="flex flex-col md:grid md:grid-cols-[1fr_140px_100px_140px_120px_100px] gap-2 md:gap-4 p-4 items-start md:items-center hover:bg-muted/30 transition-colors"
              >
                {/* Lead Info */}
                <div className="min-w-0 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate text-foreground">{lead.name}</h4>
                  </div>
                  {lead.company && (
                    <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                  )}
                  {lead.email && (
                    <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                  )}
                </div>

                {/* Stage Dropdown */}
                <div className="md:hidden text-xs text-muted-foreground mb-1">Etapa:</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer hover:opacity-80",
                      stage.bgLight,
                      stage.textColor,
                      stage.borderColor,
                      "border"
                    )}>
                      <stage.icon className="w-3 h-3" />
                      {stage.shortName}
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {stages.map((s) => (
                      <DropdownMenuItem
                        key={s.id}
                        onClick={() => onChangeStage(lead.id, s.id)}
                        className={cn(
                          "flex items-center gap-2",
                          lead.status === s.id && "bg-muted"
                        )}
                      >
                        <div className={cn("w-2 h-2 rounded-full", s.color)} />
                        {s.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Days in Stage */}
                <div className="hidden md:block">
                  <span className={cn(
                    "text-xs font-medium",
                    daysAgo <= 3 ? "text-green-600" : daysAgo <= 7 ? "text-yellow-600" : "text-red-500"
                  )}>
                    {daysAgo === 0 ? "Hoje" : daysAgo === 1 ? "1 dia" : `${daysAgo} dias`}
                  </span>
                </div>

                {/* Value */}
                <div className="flex items-center gap-1 md:block">
                  <DollarSign className="w-3 h-3 text-muted-foreground md:hidden" />
                  <span className="font-medium text-sm text-foreground">
                    R$ {(lead.estimated_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-1 md:block">
                  <Phone className="w-3 h-3 text-muted-foreground md:hidden" />
                  <span className="text-sm text-muted-foreground truncate">
                    {lead.phone || "-"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                  {lead.phone && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onWhatsApp(lead.phone, lead.name)}
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onViewProfile(lead)}
                    title="Ver perfil"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete(lead.id)}
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {leads.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/30 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {leads.length} {leads.length === 1 ? "lead" : "leads"} • Página {currentPage} de {totalPages || 1}
          </span>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="h-7 w-7 p-0 text-xs"
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
