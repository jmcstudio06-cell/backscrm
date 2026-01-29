import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  DollarSign,
  Eye,
  Trash2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Lead } from "@/hooks/useLeads";

const stages = [
  { id: "new", name: "Leads Novos", shortName: "Novo", color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50", borderColor: "border-blue-200" },
  { id: "contact", name: "Em Contato", shortName: "Contato", color: "bg-cyan-500", textColor: "text-cyan-600", bgLight: "bg-cyan-50", borderColor: "border-cyan-200" },
  { id: "proposal", name: "Com Proposta", shortName: "Proposta", color: "bg-yellow-500", textColor: "text-yellow-600", bgLight: "bg-yellow-50", borderColor: "border-yellow-200" },
  { id: "negotiation", name: "Negociação", shortName: "Negociação", color: "bg-orange-500", textColor: "text-orange-600", bgLight: "bg-orange-50", borderColor: "border-orange-200" },
  { id: "closed", name: "Fechados", shortName: "Fechado", color: "bg-green-500", textColor: "text-green-600", bgLight: "bg-green-50", borderColor: "border-green-200" },
  { id: "lost", name: "Perdidos", shortName: "Perdido", color: "bg-red-500", textColor: "text-red-600", bgLight: "bg-red-50", borderColor: "border-red-200" },
];

interface CRMKanbanViewProps {
  leads: Lead[];
  onViewProfile: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onChangeStage: (leadId: string, newStage: string) => void;
  onWhatsApp: (phone: string | null, name: string) => void;
}

const ITEMS_PER_PAGE = 15;

export function CRMKanbanView({ leads, onViewProfile, onDelete, onChangeStage, onWhatsApp }: CRMKanbanViewProps) {
  const [columnPages, setColumnPages] = useState<Record<string, number>>({});

  const getLeadsByStage = (stageId: string) => {
    return leads.filter(lead => lead.status === stageId);
  };

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPageForColumn = (stageId: string) => columnPages[stageId] || 1;

  const getPaginatedLeads = (stageId: string) => {
    const stageLeads = getLeadsByStage(stageId);
    const page = getPageForColumn(stageId);
    const start = (page - 1) * ITEMS_PER_PAGE;
    return {
      leads: stageLeads.slice(start, start + ITEMS_PER_PAGE),
      total: stageLeads.length,
      totalPages: Math.ceil(stageLeads.length / ITEMS_PER_PAGE),
      currentPage: page,
    };
  };

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    e.dataTransfer.setData("leadId", lead.id);
    e.dataTransfer.setData("currentStage", lead.status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    const currentStage = e.dataTransfer.getData("currentStage");
    if (currentStage !== newStageId) {
      onChangeStage(leadId, newStageId);
    }
  };

  const changePage = (stageId: string, delta: number) => {
    setColumnPages(prev => ({
      ...prev,
      [stageId]: Math.max(1, (prev[stageId] || 1) + delta),
    }));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stages.map((stage) => {
        const { leads: paginatedLeads, total, totalPages, currentPage } = getPaginatedLeads(stage.id);
        
        return (
          <div
            key={stage.id}
            className={cn(
              "rounded-xl border-2 p-3 min-h-[400px] flex flex-col",
              stage.borderColor,
              stage.bgLight
            )}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", stage.color)} />
                <h3 className={cn("text-xs font-semibold", stage.textColor)}>
                  {stage.shortName}
                </h3>
              </div>
              <Badge variant="secondary" className="h-5 min-w-5 text-[10px]">
                {total}
              </Badge>
            </div>

            {/* Cards Container */}
            <div className="flex-1 space-y-2 overflow-hidden">
              {paginatedLeads.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Nenhum lead
                </div>
              ) : (
                paginatedLeads.map((lead) => {
                  const daysAgo = getDaysAgo(lead.created_at);
                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead)}
                      className="bg-card rounded-lg border border-border p-2.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <h4 className="font-medium text-xs truncate flex-1 text-foreground">
                          {lead.name}
                        </h4>
                        <span className={cn(
                          "text-[10px] font-medium shrink-0",
                          daysAgo <= 3 ? "text-green-600" : daysAgo <= 7 ? "text-yellow-600" : "text-red-500"
                        )}>
                          {daysAgo}d
                        </span>
                      </div>

                      {lead.estimated_value && lead.estimated_value > 0 && (
                        <div className="flex items-center gap-1 mb-1.5">
                          <DollarSign className="w-3 h-3 text-success" />
                          <span className="text-[10px] font-medium text-success">
                            R$ {lead.estimated_value.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      )}

                      {lead.phone && (
                        <div className="flex items-center gap-1 mb-2">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground truncate">
                            {lead.phone}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-0.5 pt-1.5 border-t border-border">
                        {lead.phone && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => onWhatsApp(lead.phone, lead.name)}
                          >
                            <MessageCircle className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onViewProfile(lead)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => onDelete(lead.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={currentPage === 1}
                  onClick={() => changePage(stage.id, -1)}
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <span className="text-[10px] text-muted-foreground">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={currentPage >= totalPages}
                  onClick={() => changePage(stage.id, 1)}
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
