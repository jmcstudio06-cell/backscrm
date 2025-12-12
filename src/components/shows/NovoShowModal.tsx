import { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMusicians, Musician } from "@/hooks/useMusicians";
import { supabase } from "@/integrations/supabase/client";

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
}

interface NovoShowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowCreated?: (show: ShowData) => void;
  editingShow?: EditingShow | null;
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
  type: string;
  status: string;
  notes: string;
  cachet: number;
  expenses: Expense[];
  totalExpenses: number;
  netProfit: number;
  selectedMusicians: SelectedMusician[];
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

export function NovoShowModal({ open, onOpenChange, onShowCreated, editingShow }: NovoShowModalProps) {
  const { musicians, loading: musiciansLoading } = useMusicians();
  const [activeTab, setActiveTab] = useState("info");
  const [showTeamSelector, setShowTeamSelector] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    venue: "",
    address: "",
    client: "",
    clientPhone: "",
    type: "",
    status: "scheduled",
    notes: "",
    cachet: 0,
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedMusicians, setSelectedMusicians] = useState<SelectedMusician[]>([]);
  const [newExpense, setNewExpense] = useState({
    description: "",
    category: "transporte",
    value: 0,
  });

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

  // Load editing show data when modal opens
  useEffect(() => {
    if (open && editingShow) {
      setFormData({
        name: editingShow.title || "",
        date: editingShow.date || "",
        time: editingShow.start_time || "",
        venue: editingShow.venue || "",
        address: editingShow.address || "",
        client: "",
        clientPhone: "",
        type: editingShow.event_type || "",
        status: editingShow.status || "scheduled",
        notes: editingShow.notes || "",
        cachet: editingShow.cachet || 0,
      });
      setActiveTab("info");
      setShowTeamSelector(false);
      
      // Load financial data
      loadShowFinancialData(editingShow.id);
    } else if (open && !editingShow) {
      // Reset form for new show
      setFormData({
        name: "",
        date: "",
        time: "",
        venue: "",
        address: "",
        client: "",
        clientPhone: "",
        type: "",
        status: "scheduled",
        notes: "",
        cachet: 0,
      });
      setExpenses([]);
      setSelectedMusicians([]);
      setActiveTab("info");
      setShowTeamSelector(false);
    }
  }, [open, editingShow]);

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

  const handleSubmit = () => {
    if (!formData.name || !formData.date || !formData.venue) {
      toast.error("Preencha os campos obrigatórios: Nome, Data e Local");
      return;
    }

    const showData: ShowData = {
      id: editingShow?.id || crypto.randomUUID(),
      ...formData,
      expenses,
      totalExpenses,
      netProfit,
      selectedMusicians,
    };

    onShowCreated?.(showData);
    toast.success(editingShow ? "Show atualizado com sucesso!" : "Show lançado com sucesso!");
    
    // Reset form
    setFormData({
      name: "",
      date: "",
      time: "",
      venue: "",
      address: "",
      client: "",
      clientPhone: "",
      type: "",
      status: "scheduled",
      notes: "",
      cachet: 0,
    });
    setExpenses([]);
    setSelectedMusicians([]);
    setActiveTab("info");
    setShowTeamSelector(false);
    onOpenChange(false);
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

              <div className="space-y-2">
                <Label htmlFor="client" className="flex items-center gap-2">
                  <User className="w-4 h-4" /> Cliente
                </Label>
                <Input
                  id="client"
                  placeholder="Nome do cliente"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefone do Cliente</Label>
                <Input
                  id="clientPhone"
                  placeholder="(00) 00000-0000"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
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
                {editingShow ? "Salvar Alterações" : "Lançar Show"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
