import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  Phone,
  User,
  Radar,
  Music,
  Building2,
  PartyPopper,
  Utensils,
  Landmark,
  Edit,
  Trash2,
  MessageCircle,
  Filter,
  X,
  Clock,
  AlertCircle,
  CalendarPlus,
} from "lucide-react";
import { NovoShowModal } from "@/components/shows/NovoShowModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLeads, Lead } from "@/hooks/useLeads";
import { toast } from "sonner";

const opportunityTypes = [
  { id: "bar", label: "Bar / Restaurante", icon: Utensils },
  { id: "evento", label: "Evento / Festival", icon: PartyPopper },
  { id: "festa", label: "Festas e Bailes", icon: PartyPopper },
  { id: "casamento", label: "Casamento / Buffet", icon: Landmark },
  { id: "produtor", label: "Produtor de Eventos", icon: User },
  { id: "rodeio", label: "Rodeio / Festa de Peão", icon: Music },
  { id: "outro", label: "Outro", icon: Building2 },
];

const contactPeriods = [
  { id: "janeiro", label: "Janeiro" },
  { id: "fevereiro", label: "Fevereiro" },
  { id: "marco", label: "Março" },
  { id: "abril", label: "Abril" },
  { id: "maio", label: "Maio" },
  { id: "junho", label: "Junho" },
  { id: "julho", label: "Julho" },
  { id: "agosto", label: "Agosto" },
  { id: "setembro", label: "Setembro" },
  { id: "outubro", label: "Outubro" },
  { id: "novembro", label: "Novembro" },
  { id: "dezembro", label: "Dezembro" },
  { id: "qualquer", label: "Qualquer época" },
];

const horizonOptions = [
  { id: "3", label: "Próximos 3 meses" },
  { id: "5", label: "Próximos 5 meses" },
  { id: "12", label: "Próximos 12 meses" },
];

const statusOptions = [
  { id: "new", label: "Novo", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
  { id: "contact", label: "Entrar em contato", color: "bg-warning/10 text-warning border-warning/30" },
  { id: "proposal", label: "Proposta enviada", color: "bg-accent/10 text-accent border-accent/30" },
  { id: "closed", label: "Show fechado", color: "bg-green-500/10 text-green-600 border-green-500/30" },
  { id: "lost", label: "Não rolou", color: "bg-destructive/10 text-destructive border-destructive/30" },
];

function getTypeInfo(typeId: string | null) {
  return opportunityTypes.find((t) => t.id === typeId) || opportunityTypes[opportunityTypes.length - 1];
}


function getStatusInfo(statusId: string) {
  return statusOptions.find((s) => s.id === statusId) || statusOptions[0];
}

export default function CRM() {
  const { leads, loading, addLead, updateLead, deleteLead } = useLeads();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterHorizon, setFilterHorizon] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [scheduleLead, setScheduleLead] = useState<Lead | null>(null);
  const [showModalOpen, setShowModalOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formWhen, setFormWhen] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formContactWhen, setFormContactWhen] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStatus, setFormStatus] = useState("new");
  const [formValue, setFormValue] = useState("");

  const resetForm = () => {
    setFormName("");
    setFormType("");
    setFormCity("");
    setFormWhen("");
    setFormContact("");
    setFormPhone("");
    setFormContactWhen("");
    setFormNotes("");
    setFormStatus("new");
    setFormValue("");
  };

  const openNewModal = () => {
    setEditingLead(null);
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormName(lead.name || "");
    setFormType(lead.event_type || "");
    setFormCity(lead.company || ""); // using company field for city
    setFormWhen(lead.source || ""); // using source field for "when it happens"
    setFormContact(lead.email || ""); // using email for contact name
    setFormPhone(lead.phone || "");
    setFormContactWhen(lead.notes?.split("|||CONTACT_WHEN|||")[1] || ""); // stored in notes
    setFormNotes(lead.notes?.split("|||CONTACT_WHEN|||")[0] || "");
    setFormStatus(lead.status || "new");
    setFormValue(lead.estimated_value ? String(lead.estimated_value) : "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error("Informe o nome do evento ou lugar");
      return;
    }

    const notesWithContactWhen = formContactWhen
      ? `${formNotes}|||CONTACT_WHEN|||${formContactWhen}`
      : formNotes;

    const data: Partial<Lead> = {
      name: formName.trim(),
      event_type: formType || null,
      company: formCity.trim() || null, // city stored in company
      source: formWhen.trim() || null, // when it happens stored in source
      email: formContact.trim() || null, // contact name stored in email
      phone: formPhone.trim() || null,
      notes: notesWithContactWhen || null,
      status: formStatus,
      estimated_value: formValue ? Number(formValue) : null,
    };

    if (editingLead) {
      await updateLead(editingLead.id, data);
    } else {
      await addLead(data);
    }
    setModalOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteLead(id);
  };

  const handleWhatsApp = (phone: string | null, name: string) => {
    if (!phone) return;
    let formatted = phone.replace(/\D/g, "");
    if (!formatted.startsWith("55")) formatted = "55" + formatted;
    const msg = encodeURIComponent(`Olá! Tudo bem? Meu nome é [seu nome] e sou músico. Gostaria de saber sobre oportunidades de shows no ${name}.`);
    window.open(`https://wa.me/${formatted}?text=${msg}`, "_blank");
  };

  // Dados do lead prontos para o modal de Novo Show (memoizado para não reiniciar o formulário)
  const schedulePreset = useMemo(() => {
    if (!scheduleLead) return undefined;
    const cleanNotes = (scheduleLead.notes || "").split("|||CONTACT_WHEN|||")[0].trim();
    return {
      name: scheduleLead.name,
      phone: scheduleLead.phone || undefined,
      // no CRM o campo "email" guarda o nome do contato e "company" guarda a cidade
      company: undefined,
      city: scheduleLead.company || undefined,
      eventType: LEAD_TO_SHOW_TYPE[scheduleLead.event_type || ""] || undefined,
      cachet: scheduleLead.estimated_value || undefined,
      notes: cleanNotes || undefined,
    };
  }, [scheduleLead]);



  const monthIds = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

  const withinHorizon = (lead: Lead) => {
    if (!filterHorizon) return true;
    const months = Number(filterHorizon);
    const now = new Date();
    // Data prevista do evento, quando existir
    if (lead.event_date) {
      const [y, m, d] = lead.event_date.split("-").map(Number);
      const eventDate = new Date(y, (m || 1) - 1, d || 1);
      const limit = new Date(now.getFullYear(), now.getMonth() + months, now.getDate());
      return eventDate >= new Date(now.getFullYear(), now.getMonth(), 1) && eventDate <= limit;
    }
    // Senão, usa o mês ideal de contato
    const contactWhen = lead.notes?.split("|||CONTACT_WHEN|||")[1] || "";
    if (!contactWhen) return false;
    if (contactWhen === "qualquer") return true;
    const idx = monthIds.indexOf(contactWhen);
    if (idx < 0) return false;
    const diff = (idx - now.getMonth() + 12) % 12;
    return diff < months;
  };

  const filteredLeads = leads
    .filter((l) => {
      const term = searchTerm.toLowerCase();
      return (
        l.name.toLowerCase().includes(term) ||
        (l.company || "").toLowerCase().includes(term) ||
        (l.phone || "").includes(term)
      );
    })
    .filter((l) => (filterType ? l.event_type === filterType : true))
    .filter((l) => (filterStatus ? l.status === filterStatus : true))
    .filter(withinHorizon)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const hasFilters = filterType || filterStatus || filterHorizon || searchTerm;


  // Stats
  const currentMonth = new Date().getMonth();
  const monthNames = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const currentMonthName = monthNames[currentMonth];

  const totalOpportunities = leads.length;
  const pendingContact = leads.filter((l) => l.status === "contact").length;
  const closedDeals = leads.filter((l) => l.status === "closed").length;
  const contactThisMonth = leads.filter((l) => {
    const contactWhen = l.notes?.split("|||CONTACT_WHEN|||")[1] || "";
    return contactWhen === currentMonthName || contactWhen === "qualquer";
  }).length;

  // Auto-update leads to "contact" status when their contact month arrives
  const autoUpdatedRef = useRef(new Set<string>());
  useEffect(() => {
    if (loading || leads.length === 0) return;
    leads.forEach((lead) => {
      if (autoUpdatedRef.current.has(lead.id)) return;
      if (lead.status !== "new") return;
      const contactWhen = lead.notes?.split("|||CONTACT_WHEN|||")[1] || "";
      if (contactWhen === currentMonthName || contactWhen === "qualquer") {
        autoUpdatedRef.current.add(lead.id);
        updateLead(lead.id, { status: "contact" });
      }
    });
  }, [leads, loading, currentMonthName]);

  if (loading) {
    return (
      <Layout title="CRM do Artista" subtitle="Oportunidades de shows na sua região">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="CRM do Artista" subtitle="Acompanhe oportunidades de shows na sua região">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-muted-foreground">{totalOpportunities} oportunidades</span>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={openNewModal}>
          <Plus className="w-4 h-4" />
          Nova Oportunidade
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-card text-center">
          <p className="text-2xl font-bold text-foreground">{totalOpportunities}</p>
          <p className="text-xs text-muted-foreground font-semibold">No Radar</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-card text-center">
          <p className="text-2xl font-bold text-warning">{pendingContact}</p>
          <p className="text-xs text-muted-foreground font-semibold">Contatar</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-card text-center">
          <p className="text-2xl font-bold text-primary">{contactThisMonth}</p>
          <p className="text-xs text-muted-foreground font-semibold">Este mês</p>
        </div>
        <div className="rounded-2xl bg-card border border-border/50 p-4 shadow-card text-center">
          <p className="text-2xl font-bold text-green-500">{closedDeals}</p>
          <p className="text-xs text-muted-foreground font-semibold">Fechados</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar oportunidade..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType || "all"} onValueChange={(v) => setFilterType(v === "all" ? null : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {opportunityTypes.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? null : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterHorizon || "all"} onValueChange={(v) => setFilterHorizon(v === "all" ? null : v)}>
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Qualquer período</SelectItem>
            {horizonOptions.map((h) => (
              <SelectItem key={h.id} value={h.id}>{h.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(""); setFilterType(null); setFilterStatus(null); setFilterHorizon(null); }} className="h-10 text-muted-foreground gap-1">

            <X className="w-4 h-4" /> Limpar
          </Button>
        )}
      </div>

      {/* Opportunity Cards */}
      {filteredLeads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/50 bg-card p-12 text-center">
          <Radar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-muted-foreground">
            {leads.length === 0 ? "Nenhuma oportunidade cadastrada" : "Nenhum resultado encontrado"}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {leads.length === 0 ? "Comece adicionando festas, bares e eventos da sua região" : "Tente alterar os filtros"}
          </p>
          {leads.length === 0 && (
            <Button className="mt-4 gap-2" onClick={openNewModal}>
              <Plus className="w-4 h-4" /> Adicionar primeira oportunidade
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            const typeInfo = getTypeInfo(lead.event_type);
            const statusInfo = getStatusInfo(lead.status);
            const TypeIcon = typeInfo.icon;
            const contactWhen = lead.notes?.split("|||CONTACT_WHEN|||")[1] || "";
            const notes = lead.notes?.split("|||CONTACT_WHEN|||")[0] || "";
            const isContactMonth = contactWhen === currentMonthName || contactWhen === "qualquer";

            return (
              <div
                key={lead.id}
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-card border p-4 shadow-card transition-all hover:shadow-elevated hover:-translate-y-0.5 group",
                  isContactMonth ? "border-primary/30 ring-1 ring-primary/10" : "border-border/50"
                )}
              >
                {/* Alert badge for contact month */}
                {isContactMonth && (
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 bg-primary/15 text-primary text-[10px] font-bold px-2 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      Contatar agora
                    </div>
                  </div>
                )}

                {/* Type icon + Name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent shadow-md shrink-0">
                    <TypeIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-foreground truncate pr-16">{lead.name}</h3>
                    <p className="text-xs text-muted-foreground">{typeInfo.label}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-3">
                  {lead.company && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                      <span className="truncate">{lead.company}</span>
                    </div>
                  )}
                  {lead.source && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                      <span>Acontece: {lead.source}</span>
                    </div>
                  )}
                  {lead.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                      <span>{lead.phone}</span>
                    </div>
                  )}
                  {contactWhen && contactWhen !== "qualquer" && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                      <span>Contatar em: <span className="capitalize font-medium">{contactWhen}</span></span>
                    </div>
                  )}
                  {lead.estimated_value && lead.estimated_value > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <Music className="w-3.5 h-3.5 shrink-0" />
                      <span>Cachê estimado: R$ {lead.estimated_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5", statusInfo.color)}>
                    {statusInfo.label}
                  </Badge>
                </div>

                {/* Notes */}
                {notes && (
                  <p className="text-[11px] text-muted-foreground/70 italic mb-3 line-clamp-2">{notes}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-border/50">
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => openEditModal(lead)}>
                    <Edit className="w-3 h-3" /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/10"
                    onClick={() => { setScheduleLead(lead); setShowModalOpen(true); }}
                    title="Agendar show com este cliente"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    Agendar
                  </Button>
                  {lead.phone && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                      onClick={() => handleWhatsApp(lead.phone, lead.name)}
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(lead.id)}
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-primary" />
              {editingLead ? "Editar Oportunidade" : "Nova Oportunidade"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label>Nome do evento / lugar *</Label>
              <Input
                placeholder="Ex: Festa do Milho, Bar do João..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {opportunityTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      <div className="flex items-center gap-2">
                        <t.icon className="w-4 h-4" />
                        {t.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <Label>Cidade</Label>
              <Input
                placeholder="Ex: Cruzeiro-SP"
                value={formCity}
                onChange={(e) => setFormCity(e.target.value)}
              />
            </div>

            {/* When it happens */}
            <div className="space-y-1.5">
              <Label>Quando acontece</Label>
              <Input
                placeholder="Ex: Todo agosto, Toda sexta-feira, Mensal..."
                value={formWhen}
                onChange={(e) => setFormWhen(e.target.value)}
              />
            </div>

            {/* Contact name */}
            <div className="space-y-1.5">
              <Label>Nome do contato</Label>
              <Input
                placeholder="Ex: Carlos (produtor)"
                value={formContact}
                onChange={(e) => setFormContact(e.target.value)}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label>Telefone / WhatsApp</Label>
              <Input
                placeholder="(11) 99999-9999"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>

            {/* When to contact */}
            <div className="space-y-1.5">
              <Label>Quando entrar em contato</Label>
              <Select value={formContactWhen} onValueChange={setFormContactWhen}>
                <SelectTrigger>
                  <SelectValue placeholder="Melhor mês para contatar" />
                </SelectTrigger>
                <SelectContent>
                  {contactPeriods.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated value */}
            <div className="space-y-1.5">
              <Label>Cachê estimado (R$)</Label>
              <Input
                type="number"
                placeholder="Ex: 500"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={formStatus} onValueChange={setFormStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                placeholder="Anotações sobre essa oportunidade..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Save */}
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSave}>
              {editingLead ? "Salvar alterações" : "Adicionar ao Radar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule show from lead */}
      <NovoShowModal
        open={showModalOpen}
        onOpenChange={(o) => {
          setShowModalOpen(o);
          if (!o) setScheduleLead(null);
        }}
        onShowCreated={() => {
          setShowModalOpen(false);
          setScheduleLead(null);
          toast.success("Show agendado a partir da oportunidade!");
        }}
        presetClient={schedulePreset}

      />
    </Layout>
  );
}
