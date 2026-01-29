import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  TrendingUp,
  Clock,
  Target,
  AlertCircle,
  Phone,
  Users,
  Filter,
  X,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useLeads, Lead } from "@/hooks/useLeads";
import { LeadModal } from "@/components/crm/LeadModal";
import { LeadProfileModal } from "@/components/crm/LeadProfileModal";
import { CRMKanbanView } from "@/components/crm/CRMKanbanView";
import { CRMListView } from "@/components/crm/CRMListView";

const stages = [
  { id: "new", name: "Leads Novos", shortName: "Novo", color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50", borderColor: "border-blue-200", icon: Users },
  { id: "contact", name: "Em Contato", shortName: "Contato", color: "bg-cyan-500", textColor: "text-cyan-600", bgLight: "bg-cyan-50", borderColor: "border-cyan-200", icon: Phone },
  { id: "proposal", name: "Com Proposta", shortName: "Proposta", color: "bg-yellow-500", textColor: "text-yellow-600", bgLight: "bg-yellow-50", borderColor: "border-yellow-200", icon: Target },
  { id: "negotiation", name: "Negociação", shortName: "Negociação", color: "bg-orange-500", textColor: "text-orange-600", bgLight: "bg-orange-50", borderColor: "border-orange-200", icon: Clock },
  { id: "closed", name: "Fechados", shortName: "Fechado", color: "bg-green-500", textColor: "text-green-600", bgLight: "bg-green-50", borderColor: "border-green-200", icon: TrendingUp },
  { id: "lost", name: "Perdidos", shortName: "Perdido", color: "bg-red-500", textColor: "text-red-600", bgLight: "bg-red-50", borderColor: "border-red-200", icon: AlertCircle },
];

const daysFilters = [
  { id: "all", name: "Todos" },
  { id: "today", name: "Hoje" },
  { id: "3days", name: "Até 3 dias" },
  { id: "7days", name: "Até 7 dias" },
  { id: "30days", name: "Até 30 dias" },
  { id: "old", name: "+30 dias" },
];

export default function CRM() {
  const { leads, loading, addLead, updateLead, deleteLead, fetchLeadHistory } = useLeads();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedDaysFilter, setSelectedDaysFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // Modal states
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const getDaysAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filterByDays = (lead: Lead) => {
    const daysAgo = getDaysAgo(lead.created_at);
    switch (selectedDaysFilter) {
      case "today": return daysAgo <= 1;
      case "3days": return daysAgo <= 3;
      case "7days": return daysAgo <= 7;
      case "30days": return daysAgo <= 30;
      case "old": return daysAgo > 30;
      default: return true;
    }
  };

  const filteredLeads = leads
    .filter(lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone || "").includes(searchTerm) ||
      (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(lead => selectedStage ? lead.status === selectedStage : true)
    .filter(filterByDays)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getLeadsByStage = (stageId: string) => leads.filter(lead => lead.status === stageId);

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

  const handleChangeStage = async (leadId: string, newStageId: string) => {
    await updateLead(leadId, { status: newStageId });
  };

  const handleWhatsApp = (phone: string | null, name: string) => {
    if (!phone) return;
    let formattedPhone = phone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }
    const message = encodeURIComponent(`Olá ${name}! Tudo bem?`);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const clearFilters = () => {
    setSelectedStage(null);
    setSelectedDaysFilter("all");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedStage || selectedDaysFilter !== "all" || searchTerm;

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
      <Layout title="CRM - Gestão de Leads" subtitle="Gerencie seus contatos e oportunidades">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="CRM - Gestão de Leads" subtitle="Gerencie seus contatos e oportunidades">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* View Mode Toggle */}
        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as "kanban" | "list")}>
          <ToggleGroupItem value="kanban" aria-label="Kanban" className="gap-2 px-3">
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Kanban</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="Lista" className="gap-2 px-3">
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Lista</span>
          </ToggleGroupItem>
        </ToggleGroup>

        <Button className="bg-primary hover:bg-primary/90" onClick={handleAddLead}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
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

      {/* Filters Section */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Stage Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Filter className="w-4 h-4" />
              Etapa:
            </span>
            <div className="flex flex-wrap gap-1">
              {stages.map((stage) => {
                const count = getLeadsByStage(stage.id).length;
                const isSelected = selectedStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                      isSelected
                        ? cn(stage.color, "text-white")
                        : cn(stage.bgLight, stage.textColor, "hover:opacity-80")
                    )}
                  >
                    {stage.shortName}
                    <Badge variant="secondary" className={cn(
                      "h-5 min-w-5 px-1.5 text-[10px]",
                      isSelected ? "bg-white/20 text-white" : ""
                    )}>
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Days Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tempo:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {daysFilters.find(f => f.id === selectedDaysFilter)?.name}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {daysFilters.map((filter) => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => setSelectedDaysFilter(filter.id)}
                    className={selectedDaysFilter === filter.id ? "bg-muted" : ""}
                  >
                    {filter.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-muted-foreground">
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* View Content */}
      {viewMode === "kanban" ? (
        <CRMKanbanView
          leads={filteredLeads}
          onViewProfile={handleViewProfile}
          onDelete={handleDeleteLead}
          onChangeStage={handleChangeStage}
          onWhatsApp={handleWhatsApp}
        />
      ) : (
        <CRMListView
          leads={filteredLeads}
          onViewProfile={handleViewProfile}
          onDelete={handleDeleteLead}
          onChangeStage={handleChangeStage}
          onWhatsApp={handleWhatsApp}
        />
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
        fetchLeadHistory={fetchLeadHistory}
      />
    </Layout>
  );
}
