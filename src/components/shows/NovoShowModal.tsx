import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  DollarSign,
  Plus,
  Trash2,
  Mic2,
  Users,
  Truck,
  Music,
  Utensils,
  Wrench,
  Receipt,
  ChevronDown,
  ChevronUp,
  UserPlus,
  Building2,
  Calculator,
  AlertCircle,
  Lock,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMusicians, Musician } from "@/hooks/useMusicians";
import { useClients, Client } from "@/hooks/useClients";
import { useChecklistTemplates } from "@/hooks/useChecklistTemplates";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { supabase } from "@/integrations/supabase/client";
import TransportCalculatorModal from "@/components/calculadora/TransportCalculatorModal";
import { useFormPersistence, clearAllShowFormData, hasPersistedShowData } from "@/hooks/useFormPersistence";
import { RecurringEventSection, RecurringConfig, generateRecurringDates } from "./RecurringEventSection";
import { useNavigate } from "react-router-dom";

interface EditingShow {
  id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  address: string | null;
  cachet: number;
  status: string;
  event_type: string | null;
  notes: string | null;
  client_id?: string | null;
}

interface NovoShowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowCreated?: (show: ShowData) => void;
  editingShow?: EditingShow | null;
  presetDate?: Date;
}

interface Expense {
  id: string;
  description: string;
  category: string;
  value: number;
  musicianId?: string;
}

export interface ShowData {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  client: string;
  clientPhone: string;
  clientEmail?: string;
  clientCompany?: string;
  clientId?: string;
  type: string;
  status: string;
  notes: string;
  cachet: number;
  expenses: Expense[];
  totalExpenses: number;
  netProfit: number;
  selectedMusicians: SelectedMusician[];
  checklistTemplateId?: string;
}

interface SelectedMusician {
  musicianId: string;
  name: string;
  fee: number;
}

const expenseCategories = [
  { value: "musicos", label: "Músicos", icon: Users },
  { value: "transporte", label: "Transporte", icon: Truck },
  { value: "equipamentos", label: "Equipamentos", icon: Music },
  { value: "alimentacao", label: "Alimentação", icon: Utensils },
  { value: "producao", label: "Produção", icon: Wrench },
  { value: "outros", label: "Outros", icon: Receipt },
];

const showTypes = [
  "Casamento",
  "Corporativo",
  "Aniversário",
  "Formatura",
  "Festival",
  "Bar/Restaurante",
  "Outro",
];

const showStatuses = [
  { value: "scheduled", label: "Agendado", color: "bg-blue-500" },
  { value: "confirmed", label: "Confirmado", color: "bg-primary" },
  { value: "completed", label: "Realizado", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelado", color: "bg-destructive" },
];

const formatCurrency = (value: number): string => {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const initialFormData = {
  name: "",
  date: "",
  time: "",
  venue: "",
  address: "",
  client: "",
  clientPhone: "",
  clientEmail: "",
  clientCompany: "",
  type: "",
  status: "scheduled",
  notes: "",
  cachet: 0,
};

const initialRecurringConfig: RecurringConfig = {
  enabled: false,
  frequency: "weekly",
  dayOfWeek: 1,
  startDate: "",
  endDate: "",
};

export function NovoShowModal({ open, onOpenChange, onShowCreated, editingShow }: NovoShowModalProps) {
  const { musicians, loading: musiciansLoading } = useMusicians();
  const { clients, loading: clientsLoading, addClient } = useClients();
  const { templates: checklistTemplates, loading: templatesLoading } = useChecklistTemplates();
  const { isBlocked } = useFeatureBlocks();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [showPlanLockDialog, setShowPlanLockDialog] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [showTransportCalculator, setShowTransportCalculator] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const [selectedChecklistTemplateId, setSelectedChecklistTemplateId] = useState<string>("");

  // Form persistence - only for new shows, not editing
  const isEditing = !!editingShow;
  
  const {
    value: formData,
    setValue: setFormData,
    reset: resetFormData,
  } = useFormPersistence({
    key: "novo_show_form",
    initialValue: initialFormData,
    enabled: !isEditing,
  });

  const {
    value: expenses,
    setValue: setExpenses,
    reset: resetExpenses,
  } = useFormPersistence<Expense[]>({
    key: "novo_show_expenses",
    initialValue: [],
    enabled: !isEditing,
  });

  const {
    value: selectedMusicians,
    setValue: setSelectedMusicians,
    reset: resetMusicians,
  } = useFormPersistence<SelectedMusician[]>({
    key: "novo_show_musicians",
    initialValue: [],
    enabled: !isEditing,
  });

  const {
    value: persistedClientId,
    setValue: setPersistedClientId,
    reset: resetClientId,
  } = useFormPersistence({
    key: "novo_show_client",
    initialValue: "",
    enabled: !isEditing,
  });

  const {
    value: recurringConfig,
    setValue: setRecurringConfig,
    reset: resetRecurring,
  } = useFormPersistence<RecurringConfig>({
    key: "novo_show_recurring",
    initialValue: initialRecurringConfig,
    enabled: !isEditing,
  });

  const [newExpense, setNewExpense] = useState({
    description: "",
    category: "transporte",
    value: 0,
  });

  // Check for restored data when opening
  useEffect(() => {
    if (open && !isEditing && hasPersistedShowData()) {
      setShowRestoredBanner(true);
      // Also restore clientId
      if (persistedClientId) {
        setSelectedClientId(persistedClientId);
      }
    }
  }, [open, isEditing, persistedClientId]);

  // Load saved musicians and expenses when editing
  const loadShowFinancialData = async (showId: string) => {
    setLoadingData(true);
    try {
      // Load musicians
      const { data: savedMusicians } = await supabase
        .from("show_musicians")
        .select("musician_id, fee, musicians(name)")
        .eq("show_id", showId);

      if (savedMusicians && savedMusicians.length > 0) {
        const loadedMusicians: SelectedMusician[] = savedMusicians.map((m: any) => ({
          musicianId: m.musician_id,
          name: m.musicians?.name || "Músico",
          fee: m.fee || 0,
        }));
        setSelectedMusicians(loadedMusicians);
      }

      // Load expenses
      const { data: savedExpenses } = await supabase
        .from("show_expenses")
        .select("*")
        .eq("show_id", showId);

      if (savedExpenses && savedExpenses.length > 0) {
        const loadedExpenses: Expense[] = savedExpenses.map((e: any) => ({
          id: e.id,
          description: e.description || "",
          category: e.category,
          value: e.amount || 0,
        }));
        setExpenses(loadedExpenses);
      }
    } catch (error) {
      console.error("Error loading show financial data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch last show info for a client to auto-fill
  const fetchClientLastShowInfo = useCallback(async (clientId: string) => {
    try {
      const { data } = await supabase
        .from("shows")
        .select("venue, address, event_type, title")
        .eq("client_id", clientId)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      return data;
    } catch (error) {
      console.error("Error fetching client last show:", error);
      return null;
    }
  }, []);

  // Handle client selection with auto-fill
  const handleClientSelect = useCallback(async (clientId: string) => {
    setSelectedClientId(clientId);
    setPersistedClientId(clientId);
    
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    // Get last show info for this client
    const lastShowInfo = await fetchClientLastShowInfo(clientId);

    setFormData((prev) => ({
      ...prev,
      client: client.name,
      clientPhone: client.phone || "",
      clientEmail: client.email || "",
      clientCompany: client.company || "",
      // Auto-fill from last show if available and current fields are empty
      venue: prev.venue || lastShowInfo?.venue || "",
      address: prev.address || lastShowInfo?.address || "",
      type: prev.type || lastShowInfo?.event_type || "",
      name: prev.name || (lastShowInfo?.title ? `${lastShowInfo.title} (novo)` : ""),
    }));

    if (lastShowInfo?.venue) {
      toast.info("Informações do último show preenchidas automaticamente", {
        description: `Local: ${lastShowInfo.venue}`,
      });
    }
  }, [clients, fetchClientLastShowInfo, setFormData, setPersistedClientId]);

  // Load editing show data when modal opens
  useEffect(() => {
    if (open && editingShow) {
      // Find the client if client_id exists
      const existingClient = editingShow.client_id 
        ? clients.find(c => c.id === editingShow.client_id) 
        : null;
      
      setFormData({
        name: editingShow.title || "",
        date: editingShow.date || "",
        time: editingShow.start_time || "",
        venue: editingShow.venue || "",
        address: editingShow.address || "",
        client: existingClient?.name || "",
        clientPhone: existingClient?.phone || "",
        clientEmail: existingClient?.email || "",
        clientCompany: existingClient?.company || "",
        type: editingShow.event_type || "",
        status: editingShow.status || "scheduled",
        notes: editingShow.notes || "",
        cachet: editingShow.cachet || 0,
      });
      setClientMode("existing");
      setSelectedClientId(editingShow.client_id || "");
      setActiveTab("info");
      setShowTeamSelector(false);
      setRecurringConfig(initialRecurringConfig);
      
      // Load financial data
      loadShowFinancialData(editingShow.id);
    }
  }, [open, editingShow, clients]);

  // Calculate total from musicians + other expenses
  const musiciansCost = selectedMusicians.reduce((sum, m) => sum + m.fee, 0);
  const otherExpenses = expenses.reduce((sum, exp) => sum + exp.value, 0);
  const totalExpenses = musiciansCost + otherExpenses;
  const netProfit = formData.cachet - totalExpenses;

  const handleToggleMusician = (musician: Musician, checked: boolean) => {
    if (checked) {
      setSelectedMusicians([
        ...selectedMusicians,
        {
          musicianId: musician.id,
          name: musician.name,
          fee: musician.rate || 0,
        },
      ]);
    } else {
      setSelectedMusicians(selectedMusicians.filter((m) => m.musicianId !== musician.id));
    }
  };

  const handleUpdateMusicianFee = (musicianId: string, fee: number) => {
    setSelectedMusicians(
      selectedMusicians.map((m) =>
        m.musicianId === musicianId ? { ...m, fee } : m
      )
    );
  };

  const handleAddExpense = () => {
    if (!newExpense.description || newExpense.value <= 0) {
      toast.error("Preencha a descrição e o valor da despesa");
      return;
    }

    const expense: Expense = {
      id: crypto.randomUUID(),
      ...newExpense,
    };

    setExpenses([...expenses, expense]);
    setNewExpense({ description: "", category: "transporte", value: 0 });
    toast.success("Despesa adicionada");
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const clearFormAndStorage = () => {
    resetFormData();
    resetExpenses();
    resetMusicians();
    resetClientId();
    resetRecurring();
    setSelectedClientId("");
    setSelectedChecklistTemplateId("");
    setClientMode("existing");
    setActiveTab("info");
    setShowTeamSelector(false);
    setShowRestoredBanner(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.date || !formData.venue) {
      toast.error("Preencha os campos obrigatórios: Nome, Data e Local");
      return;
    }

    let clientId = selectedClientId || undefined;

    // If creating a new client, save it first
    if (clientMode === "new" && formData.client) {
      const newClient = await addClient({
        name: formData.client,
        phone: formData.clientPhone || null,
        email: formData.clientEmail || null,
        company: formData.clientCompany || null,
      });
      if (newClient) {
        clientId = newClient.id;
      }
    }

    // Handle recurring events
    if (recurringConfig.enabled && !editingShow) {
      const dates = generateRecurringDates(recurringConfig);
      
      if (dates.length === 0) {
        toast.error("Configure o período de recorrência corretamente");
        return;
      }

      if (dates.length > 52) {
        toast.error("Máximo de 52 shows recorrentes permitidos");
        return;
      }

      // Create multiple shows
      for (let i = 0; i < dates.length; i++) {
        const showData: ShowData = {
          id: crypto.randomUUID(),
          ...formData,
          date: dates[i],
          clientId,
          expenses,
          totalExpenses,
          netProfit,
          selectedMusicians,
          checklistTemplateId: selectedChecklistTemplateId || undefined,
        };
        onShowCreated?.(showData);
      }

      toast.success(`${dates.length} shows recorrentes criados com sucesso!`);
    } else {
      // Single show
      const showData: ShowData = {
        id: editingShow?.id || crypto.randomUUID(),
        ...formData,
        clientId,
        expenses,
        totalExpenses,
        netProfit,
        selectedMusicians,
        checklistTemplateId: selectedChecklistTemplateId || undefined,
      };

      onShowCreated?.(showData);
      toast.success(editingShow ? "Show atualizado com sucesso!" : "Show lançado com sucesso!");
    }
    
    // Clear form and storage
    clearFormAndStorage();
    onOpenChange(false);
  };

  const handleDiscardDraft = () => {
    clearAllShowFormData();
    clearFormAndStorage();
    setShowRestoredBanner(false);
    toast.success("Rascunho descartado");
  };

  const getCategoryIcon = (category: string) => {
    const cat = expenseCategories.find((c) => c.value === category);
    return cat?.icon || Receipt;
  };

  const getCategoryLabel = (category: string) => {
    const cat = expenseCategories.find((c) => c.value === category);
    return cat?.label || category;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-primary-foreground" />
            </div>
            {editingShow ? "Editar Show" : "Novo Show"}
          </DialogTitle>
        </DialogHeader>

        {/* Restored Draft Banner */}
        {showRestoredBanner && !isEditing && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Rascunho recuperado! Continue de onde parou.</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscardDraft}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Descartar
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full bg-secondary">
            <TabsTrigger value="info" className="gap-2">
              <Calendar className="w-4 h-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2">
              <Receipt className="w-4 h-4" />
              Resumo
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Evento *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Casamento Silva & Santos"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Evento</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {showTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Data *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Horário
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Local *
                </Label>
                <Input
                  id="venue"
                  placeholder="Nome do local"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  placeholder="Endereço completo"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              {/* Client Section */}
              <div className="space-y-4 md:col-span-2">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <User className="w-4 h-4" /> Cliente
                </Label>
                
                <RadioGroup
                  value={clientMode}
                  onValueChange={(value: "existing" | "new") => {
                    setClientMode(value);
                    if (value === "existing") {
                      setFormData({ ...formData, client: "", clientPhone: "", clientEmail: "", clientCompany: "" });
                    } else {
                      setSelectedClientId("");
                      setPersistedClientId("");
                    }
                  }}
                  className="flex flex-wrap items-center gap-x-6 gap-y-3"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="existing" id="show-existing" className="shrink-0" />
                    <Label htmlFor="show-existing" className="font-normal cursor-pointer text-sm">
                      Selecionar existente
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="new" id="show-new" className="shrink-0" />
                    <Label htmlFor="show-new" className="font-normal cursor-pointer text-sm">
                      Criar novo
                    </Label>
                  </div>
                </RadioGroup>

                {clientMode === "existing" ? (
                  <div className="space-y-2">
                    <Select
                      value={selectedClientId}
                      onValueChange={handleClientSelect}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={clientsLoading ? "Carregando..." : clients.length === 0 ? "Nenhum cliente cadastrado" : "Selecione um cliente"} />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span>{client.name}</span>
                              {client.company && (
                                <span className="text-xs text-muted-foreground">({client.company})</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedClientId && (
                      <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-medium">{formData.client}</span>
                        </div>
                        {formData.clientPhone && (
                          <p className="text-xs text-muted-foreground mt-1">📞 {formData.clientPhone}</p>
                        )}
                        {formData.clientEmail && (
                          <p className="text-xs text-muted-foreground">✉️ {formData.clientEmail}</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-lg bg-secondary/30 border border-border">
                    <div className="space-y-2">
                      <Label htmlFor="newClient" className="text-sm">Nome do Cliente *</Label>
                      <Input
                        id="newClient"
                        placeholder="Nome completo"
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newClientPhone" className="text-sm">Telefone</Label>
                      <Input
                        id="newClientPhone"
                        placeholder="(00) 00000-0000"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newClientEmail" className="text-sm">E-mail</Label>
                      <Input
                        id="newClientEmail"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newClientCompany" className="text-sm">Empresa</Label>
                      <Input
                        id="newClientCompany"
                        placeholder="Nome da empresa"
                        value={formData.clientCompany}
                        onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground md:col-span-2 flex items-center gap-1">
                      <UserPlus className="w-3 h-3" />
                      Este cliente será salvo automaticamente na sua base
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status do Show</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {showStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", status.color)} />
                          {status.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Anotações sobre o evento..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Recurring Events Section - Only for new shows */}
            {!editingShow && (
              isBlocked("checklist") ? (
                <button
                  type="button"
                  onClick={() => {
                    toast.error("Recurso exclusivo do Plano Profissional", {
                      description: "Assine o plano Profissional para criar eventos recorrentes.",
                      action: { label: "Ver Planos", onClick: () => navigate("/planos") },
                    });
                  }}
                  className="flex items-center gap-3 w-full p-4 rounded-xl border border-border bg-muted/50 text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
                >
                  <Lock className="w-5 h-5" />
                  <span className="text-sm font-medium">Evento Recorrente (Plano Profissional)</span>
                  <Crown className="w-5 h-5 ml-auto text-warning" />
                </button>
              ) : (
                <RecurringEventSection
                  config={recurringConfig}
                  onChange={setRecurringConfig}
                  baseDate={formData.date}
                />
              )
            )}

            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("financial")} variant="gradient">
                Próximo: Financeiro
              </Button>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6 mt-4">
            {loadingData && (
              <div className="text-center py-4 text-muted-foreground">
                Carregando dados financeiros...
              </div>
            )}
            
            {/* Cachê */}
            <div className="p-4 rounded-xl bg-success/10 border border-success/20">
              <Label htmlFor="cachet" className="flex items-center gap-2 text-success mb-2">
                <DollarSign className="w-5 h-5" />
                Cachê do Show (Receita)
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-success">R$</span>
                <Input
                  id="cachet"
                  type="number"
                  placeholder="00,00"
                  className="text-2xl font-bold h-14 bg-background"
                  value={formData.cachet || ""}
                  onChange={(e) => setFormData({ ...formData, cachet: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Select Team Members - Collapsible */}
            {isBlocked("checklist") ? (
              <button
                type="button"
                onClick={() => {
                  toast.error("Recurso exclusivo do Plano Profissional", {
                    description: "Assine o plano Profissional para selecionar sua equipe nos shows.",
                    action: { label: "Ver Planos", onClick: () => navigate("/planos") },
                  });
                }}
                className="flex items-center gap-3 w-full p-4 rounded-xl border border-border bg-muted/50 text-muted-foreground cursor-pointer hover:bg-muted transition-colors"
              >
                <Lock className="w-5 h-5" />
                <span className="text-sm font-medium">Selecionar Minha Equipe (Plano Profissional)</span>
                <Crown className="w-5 h-5 ml-auto text-warning" />
              </button>
            ) : (
              <Collapsible open={showTeamSelector} onOpenChange={setShowTeamSelector}>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between p-0 h-auto hover:bg-transparent"
                    >
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Selecionar Minha Equipe
                        {selectedMusicians.length > 0 && (
                          <span className="text-sm font-normal text-muted-foreground">
                            ({selectedMusicians.length} selecionado{selectedMusicians.length > 1 ? "s" : ""})
                          </span>
                        )}
                      </h4>
                      {showTeamSelector ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-4">
                    {musiciansLoading ? (
                      <p className="text-sm text-muted-foreground">Carregando equipe...</p>
                    ) : musicians.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhum músico cadastrado. Cadastre sua equipe em Logística → Equipe & Freelancer.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {musicians.map((musician) => {
                          const selected = selectedMusicians.find((m) => m.musicianId === musician.id);
                          return (
                            <div
                              key={musician.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg transition-colors",
                                selected ? "bg-primary/10" : "bg-secondary/50"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={!!selected}
                                  onCheckedChange={(checked) =>
                                    handleToggleMusician(musician, checked as boolean)
                                  }
                                />
                                <div>
                                  <p className="text-sm font-medium text-foreground">{musician.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {musician.instrument || "Músico"} • Cachê padrão: R${formatCurrency(musician.rate || 0)}
                                  </p>
                                </div>
                              </div>
                              {selected && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">R$</span>
                                  <Input
                                    type="number"
                                    className="w-24 h-8 text-right"
                                    value={selected.fee || ""}
                                    onChange={(e) =>
                                      handleUpdateMusicianFee(musician.id, Number(e.target.value))
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CollapsibleContent>
                  
                  {selectedMusicians.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Equipe</span>
                      <span className="font-bold text-destructive">- R${formatCurrency(musiciansCost)}</span>
                    </div>
                  )}
                </div>
              </Collapsible>
            )}

            {/* Transport Calculator Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTransportCalculator(true)}
                className="gap-2"
              >
                <Calculator className="w-4 h-4" />
                Calcular Combustível
              </Button>
            </div>

            {/* Add Other Expense */}
            <div className="p-4 rounded-xl bg-secondary/50">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-destructive" />
                Adicionar Outras Despesas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Descrição da despesa"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>
                <Select
                  value={newExpense.category}
                  onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.filter(c => c.value !== "musicos").map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="00,00"
                    value={newExpense.value || ""}
                    onChange={(e) => setNewExpense({ ...newExpense, value: Number(e.target.value) })}
                  />
                  <Button onClick={handleAddExpense} size="icon" variant="gradient">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Expense List */}
            {expenses.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground">Outras Despesas Lançadas</h4>
                <div className="space-y-2">
                  {expenses.map((expense) => {
                    const Icon = getCategoryIcon(expense.category);
                    return (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-destructive" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{expense.description}</p>
                            <p className="text-xs text-muted-foreground">{getCategoryLabel(expense.category)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-destructive">- R${formatCurrency(expense.value)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveExpense(expense.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total Summary */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cachê</span>
                  <span className="font-medium text-success">+ R${formatCurrency(formData.cachet)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Equipe ({selectedMusicians.length})</span>
                  <span className="font-medium text-destructive">- R${formatCurrency(musiciansCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Outras despesas ({expenses.length})</span>
                  <span className="font-medium text-destructive">- R${formatCurrency(otherExpenses)}</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between">
                  <span className="font-semibold">Lucro Líquido</span>
                  <span className={cn("font-bold text-lg", netProfit >= 0 ? "text-success" : "text-destructive")}>
                    R${formatCurrency(netProfit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("info")}>
                Voltar
              </Button>
              <Button onClick={() => setActiveTab("summary")} variant="gradient">
                Próximo: Resumo
              </Button>
            </div>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Info Card */}
              <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Informações do Evento
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome</span>
                    <span className="font-medium">{formData.name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data</span>
                    <span className="font-medium">{formData.date || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário</span>
                    <span className="font-medium">{formData.time || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Local</span>
                    <span className="font-medium">{formData.venue || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo</span>
                    <span className="font-medium">{formData.type || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium">
                      {showStatuses.find(s => s.value === formData.status)?.label || formData.status}
                    </span>
                  </div>
                  {recurringConfig.enabled && !editingShow && (
                    <div className="flex justify-between text-primary">
                      <span>Recorrência</span>
                      <span className="font-medium">{generateRecurringDates(recurringConfig).length} shows</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Card */}
              <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-success" />
                  Resumo Financeiro
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cachê</span>
                    <span className="font-medium text-success">R${formatCurrency(formData.cachet)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Despesas</span>
                    <span className="font-medium text-destructive">R${formatCurrency(totalExpenses)}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between">
                    <span className="font-semibold">Lucro Líquido</span>
                    <span className={cn("font-bold", netProfit >= 0 ? "text-success" : "text-destructive")}>
                      R${formatCurrency(netProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Summary */}
            {selectedMusicians.length > 0 && (
              <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Equipe Selecionada ({selectedMusicians.length})
                </h4>
                <div className="space-y-2">
                  {selectedMusicians.map((m) => (
                    <div key={m.musicianId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{m.name}</span>
                      <span className="font-medium text-destructive">R${formatCurrency(m.fee)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses Summary */}
            {expenses.length > 0 && (
              <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-destructive" />
                  Outras Despesas ({expenses.length})
                </h4>
                <div className="space-y-2">
                  {expenses.map((e) => (
                    <div key={e.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{e.description}</span>
                      <span className="font-medium text-destructive">R${formatCurrency(e.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab("financial")}>
                Voltar
              </Button>
              <Button onClick={handleSubmit} variant="gradient" className="gap-2">
                <Mic2 className="w-4 h-4" />
                {editingShow 
                  ? "Salvar Alterações" 
                  : recurringConfig.enabled 
                    ? `Criar ${generateRecurringDates(recurringConfig).length} Shows` 
                    : "Lançar Show"
                }
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Transport Calculator Modal */}
        <TransportCalculatorModal
          open={showTransportCalculator}
          onOpenChange={setShowTransportCalculator}
          onUseValue={(value) => {
            const expense: Expense = {
              id: crypto.randomUUID(),
              description: "Combustível (calculado)",
              category: "transporte",
              value: value,
            };
            setExpenses([...expenses, expense]);
            toast.success("Despesa de transporte adicionada");
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
