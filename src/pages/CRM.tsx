import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  TrendingUp,
  Clock,
  Target,
  AlertCircle,
  Phone,
  MapPin,
  DollarSign,
  Eye,
  Trash2,
  MessageCircle,
  CalendarDays,
  Users,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeads, Lead } from "@/hooks/useLeads";
import { useIsMobile } from "@/hooks/use-mobile";
import { LeadModal } from "@/components/crm/LeadModal";
import { LeadProfileModal } from "@/components/crm/LeadProfileModal";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const stages = [
  { id: "new", name: "Leads Novos", color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50", icon: Users },
  { id: "proposal", name: "Com Proposta", color: "bg-yellow-500", textColor: "text-yellow-600", bgLight: "bg-yellow-50", icon: Target },
  { id: "closed", name: "Fechados", color: "bg-green-500", textColor: "text-green-600", bgLight: "bg-green-50", icon: TrendingUp },
  { id: "lost", name: "Não Fechados", color: "bg-red-500", textColor: "text-red-600", bgLight: "bg-red-50", icon: AlertCircle },
  { id: "repeat", name: "Já Comprou", color: "bg-purple-500", textColor: "text-purple-600", bgLight: "bg-purple-50", icon: Users },
  { id: "never", name: "Nunca Comprou", color: "bg-gray-500", textColor: "text-gray-600", bgLight: "bg-gray-50", icon: Clock },
];

export default function CRM() {
  const { leads, loading, addLead, updateLead, deleteLead } = useLeads();
  const isMobile = useIsMobile();
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  // Modal states
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAllContacts, setShowAllContacts] = useState(false);

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.phone || "").includes(searchTerm) ||
    (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLeadsByStage = (stageId: string) => filteredLeads.filter(lead => lead.status === stageId);

  const getStageValue = (stageId: string) => {
    return getLeadsByStage(stageId).reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  };

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLead(leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (draggedLead) {
      const lead = leads.find(l => l.id === draggedLead);
      if (lead && lead.status !== targetStageId) {
        await updateLead(draggedLead, { status: targetStageId });
      }
    }
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleDragEnd = () => {
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleAddLead = () => {
    setEditingLead(null);
    setLeadModalOpen(true);
  };

  const handleSaveLead = async (data: Partial<Lead>) => {
    if (editingLead) {
      await updateLead(editingLead.id, data);
    } else {
      await addLead(data);
    }
  };

  const handleViewProfile = (lead: Lead) => {
    setSelectedLead(lead);
    setProfileModalOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setProfileModalOpen(false);
    setEditingLead(lead);
    setLeadModalOpen(true);
  };

  const handleDeleteLead = async (leadId: string) => {
    await deleteLead(leadId);
    setProfileModalOpen(false);
  };

  const handleWhatsApp = (phone: string | null, name: string) => {
    if (!phone) return;
    const formattedPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Olá ${name}! Tudo bem?`);
    window.open(`https://wa.me/55${formattedPhone}?text=${message}`, '_blank');
  };

  const handleStageClick = (stageId: string) => {
    setExpandedStage(expandedStage === stageId ? null : stageId);
  };

  // Calculate stats
  const hotLeads = leads.filter(l => getDaysAgo(l.created_at) <= 3).length;
  const coldLeads = leads.filter(l => getDaysAgo(l.created_at) > 7).length;
  const highValueLeads = leads.filter(l => (l.estimated_value || 0) >= 5000).length;
  const proposalLeads = leads.filter(l => l.status === "proposal").length;

  const statCards = [
    { value: hotLeads, label: "Leads Quentes", sublabel: "Últimos 3 dias", icon: TrendingUp, color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" },
    { value: coldLeads, label: "Leads Frios", sublabel: "+7 dias sem contato", icon: Clock, color: "text-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    { value: highValueLeads, label: "Alto Valor", sublabel: "R$ 5mil+", icon: Target, color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-200" },
    { value: proposalLeads, label: "Urgentes", sublabel: "Com proposta aberta", icon: AlertCircle, color: "text-purple-500", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  ];

  if (loading) {
    return (
      <Layout title="CRM - Funil de Vendas" subtitle="Gerencie seus contatos e oportunidades">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  // Render lead card (reusable for both views)
  const renderLeadCard = (lead: Lead, stage: typeof stages[0], isDraggable = true) => {
    const daysAgo = getDaysAgo(lead.created_at);

    return (
      <div
        key={lead.id}
        draggable={isDraggable && !isMobile}
        onDragStart={isDraggable ? (e) => handleDragStart(e, lead.id) : undefined}
        onDragEnd={isDraggable ? handleDragEnd : undefined}
        className={cn(
          "bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all",
          isDraggable && !isMobile && "cursor-grab active:cursor-grabbing",
          draggedLead === lead.id && "opacity-50 scale-95"
        )}
      >
        {/* Drag Handle */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {isDraggable && !isMobile && <GripVertical className="w-4 h-4 text-muted-foreground" />}
            <div>
              <h4 className="font-semibold text-foreground">{lead.name}</h4>
              <p className="text-xs text-muted-foreground">
                {daysAgo > 0 ? `Há ${daysAgo} dias` : "Hoje"}
              </p>
            </div>
          </div>
        </div>

        <div className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs mb-3",
          stage.bgLight,
          stage.textColor
        )}>
          <Clock className="w-3 h-3" />
          {daysAgo} dias nesta etapa
        </div>

        <div className="space-y-2 mb-4">
          {lead.phone && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{lead.phone}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-green-600 hover:text-green-700 hover:bg-green-50 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWhatsApp(lead.phone, lead.name);
                }}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
            </div>
          )}

          {lead.company && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{lead.company}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">
              R$ {(lead.estimated_value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              handleViewProfile(lead);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver Perfil
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteLead(lead.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Layout title="CRM - Funil de Vendas" subtitle="Gerencie seus contatos e oportunidades">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div></div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setShowAllContacts(!showAllContacts)}>
            <Users className="w-4 h-4 mr-2" />
            {showAllContacts ? "Ver Funil" : "Ver Todos os Contatos"}
          </Button>
          <Button variant="outline">
            <CalendarDays className="w-4 h-4 mr-2" />
            Virada de Mês
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleAddLead}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className={cn(
              "p-4 rounded-xl border flex items-center gap-3",
              stat.bgColor,
              stat.borderColor
            )}
          >
            <div className={cn("p-2 rounded-full shrink-0", stat.bgColor)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div className="min-w-0">
              <p className={cn("text-xl font-bold", stat.color)}>{stat.value}</p>
              <p className={cn("text-xs font-medium truncate", stat.color)}>{stat.label}</p>
              <p className="text-xs text-muted-foreground truncate">{stat.sublabel}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            className="pl-9 bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Show All Contacts View */}
      {showAllContacts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum contato encontrado</p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const stage = stages.find(s => s.id === lead.status) || stages[0];
              return renderLeadCard(lead, stage, false);
            })
          )}
        </div>
      ) : isMobile ? (
        /* Mobile: Clickable Stages */
        <div className="space-y-3">
          {stages.map((stage) => {
            const stageLeads = getLeadsByStage(stage.id);
            const value = getStageValue(stage.id);
            const isExpanded = expandedStage === stage.id;

            return (
              <Collapsible key={stage.id} open={isExpanded} onOpenChange={() => handleStageClick(stage.id)}>
                <CollapsibleTrigger asChild>
                  <div className={cn("p-4 rounded-xl text-white cursor-pointer", stage.color)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <stage.icon className="w-5 h-5" />
                        <div>
                          <span className="font-medium">{stage.name}</span>
                          <p className="text-xs opacity-80">
                            R$ {(value / 1000).toFixed(1)}k em propostas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{stageLeads.length}</span>
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-3">
                  {stageLeads.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nenhum lead nesta etapa</p>
                  ) : (
                    stageLeads.map((lead) => renderLeadCard(lead, stage, false))
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      ) : (
        /* Desktop: Kanban Board */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {stages.map((stage) => {
              const stageLeads = getLeadsByStage(stage.id);
              const value = getStageValue(stage.id);
              const isDropTarget = dragOverStage === stage.id;

              return (
                <div
                  key={stage.id}
                  className="w-72 shrink-0"
                  onDragOver={(e) => handleDragOver(e, stage.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Stage Header */}
                  <div className={cn("p-3 rounded-xl mb-3 text-white", stage.color)}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <stage.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{stage.name}</span>
                      </div>
                      <span className="text-lg font-bold">{stageLeads.length}</span>
                    </div>
                    <p className="text-xs opacity-80">
                      R$ {(value / 1000).toFixed(1)}k em propostas
                    </p>
                  </div>

                  {/* Drop Zone */}
                  <div
                    className={cn(
                      "min-h-[200px] space-y-3 p-2 rounded-xl transition-all",
                      isDropTarget && "bg-primary/10 border-2 border-dashed border-primary"
                    )}
                  >
                    {stageLeads.map((lead) => renderLeadCard(lead, stage))}

                    {stageLeads.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border-2 border-dashed border-border rounded-xl">
                        Arraste leads aqui
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <LeadModal
        open={leadModalOpen}
        onOpenChange={setLeadModalOpen}
        onSave={handleSaveLead}
        editingLead={editingLead}
      />

      <LeadProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        lead={selectedLead}
        onEdit={() => selectedLead && handleEditLead(selectedLead)}
        onDelete={() => selectedLead && handleDeleteLead(selectedLead.id)}
      />
    </Layout>
  );
}