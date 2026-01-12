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
  DollarSign,
  Eye,
  Trash2,
  MessageCircle,
  Users,
  Filter,
  X,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useLeads, Lead } from "@/hooks/useLeads";
import { LeadModal } from "@/components/crm/LeadModal";
import { LeadProfileModal } from "@/components/crm/LeadProfileModal";

const stages = [
  { id: "new", name: "Leads Novos", shortName: "Novo", color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50", borderColor: "border-blue-200", icon: Users },
  { id: "proposal", name: "Com Proposta", shortName: "Proposta", color: "bg-yellow-500", textColor: "text-yellow-600", bgLight: "bg-yellow-50", borderColor: "border-yellow-200", icon: Target },
  { id: "closed", name: "Fechados", shortName: "Fechado", color: "bg-green-500", textColor: "text-green-600", bgLight: "bg-green-50", borderColor: "border-green-200", icon: TrendingUp },
  { id: "lost", name: "Não Fechados", shortName: "Perdido", color: "bg-red-500", textColor: "text-red-600", bgLight: "bg-red-50", borderColor: "border-red-200", icon: AlertCircle },
  { id: "repeat", name: "Já Comprou", shortName: "Recorrente", color: "bg-purple-500", textColor: "text-purple-600", bgLight: "bg-purple-50", borderColor: "border-purple-200", icon: Users },
  { id: "never", name: "Nunca Comprou", shortName: "Nunca", color: "bg-gray-500", textColor: "text-gray-600", bgLight: "bg-gray-50", borderColor: "border-gray-200", icon: Clock },
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
      <div className="flex justify-end mb-6">
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

      {/* List View */}
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
          {filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              Nenhum lead encontrado
              {hasActiveFilters && (
                <p className="text-xs mt-2">Tente ajustar os filtros</p>
              )}
            </div>
          ) : (
            filteredLeads.map((lead) => {
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

                  {/* Stage Dropdown - Clickable to change */}
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
                          onClick={() => handleChangeStage(lead.id, s.id)}
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
                        onClick={() => handleWhatsApp(lead.phone, lead.name)}
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewProfile(lead)}
                      title="Ver perfil"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteLead(lead.id)}
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

        {/* Footer with count */}
        {filteredLeads.length > 0 && (
          <div className="p-3 bg-muted/30 border-t border-border text-xs text-muted-foreground text-center">
            {filteredLeads.length} {filteredLeads.length === 1 ? "lead encontrado" : "leads encontrados"}
          </div>
        )}
      </div>

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
