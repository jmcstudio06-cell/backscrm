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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMusicians, Musician } from "@/hooks/useMusicians";

interface NovoShowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShowCreated?: (show: ShowData) => void;
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

export function NovoShowModal({ open, onOpenChange, onShowCreated }: NovoShowModalProps) {
  const { musicians, loading: musiciansLoading } = useMusicians();
  const [activeTab, setActiveTab] = useState("info");
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
      id: crypto.randomUUID(),
      ...formData,
      expenses,
      totalExpenses,
      netProfit,
      selectedMusicians,
    };

    onShowCreated?.(showData);
    toast.success("Show lançado com sucesso!");
    
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

  const getStatusLabel = (status: string) => {
    const s = showStatuses.find((st) => st.value === status);
    return s?.label || status;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-primary-foreground" />
            </div>
            Novo Show
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

            {/* Select Team Members */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Selecionar Minha Equipe
              </h4>
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
              {selectedMusicians.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Equipe</span>
                  <span className="font-bold text-destructive">- R${formatCurrency(musiciansCost)}</span>
                </div>
              )}
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
                          <span className="font-semibold text-destructive">
                            - R${formatCurrency(expense.value)}
                          </span>
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

            {/* Summary Card */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Receita (Cachê)</span>
                <span className="font-bold text-success">
                  + R${formatCurrency(formData.cachet)}
                </span>
              </div>
              {selectedMusicians.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Equipe ({selectedMusicians.length})</span>
                  <span className="font-bold text-destructive">
                    - R${formatCurrency(musiciansCost)}
                  </span>
                </div>
              )}
              {expenses.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Outras Despesas</span>
                  <span className="font-bold text-destructive">
                    - R${formatCurrency(otherExpenses)}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-foreground">Lucro Líquido</span>
                  <span className={cn("text-xl font-bold", netProfit >= 0 ? "text-primary" : "text-destructive")}>
                    R${formatCurrency(netProfit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button onClick={() => setActiveTab("info")} variant="outline">
                Voltar
              </Button>
              <Button onClick={() => setActiveTab("summary")} variant="gradient">
                Próximo: Resumo
              </Button>
            </div>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-6 mt-4">
            <div className="p-4 rounded-xl bg-secondary/50">
              <h4 className="font-semibold text-foreground mb-4">Dados do Evento</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Evento:</span>
                  <p className="font-medium text-foreground">{formData.name || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <p className="font-medium text-foreground">{formData.type || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Data:</span>
                  <p className="font-medium text-foreground">
                    {formData.date ? new Date(formData.date).toLocaleDateString("pt-BR") : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Horário:</span>
                  <p className="font-medium text-foreground">{formData.time || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Local:</span>
                  <p className="font-medium text-foreground">{formData.venue || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Cliente:</span>
                  <p className="font-medium text-foreground">{formData.client || "-"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      showStatuses.find(s => s.value === formData.status)?.color
                    )} />
                    <p className="font-medium text-foreground">{getStatusLabel(formData.status)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Summary */}
            {selectedMusicians.length > 0 && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Equipe Escalada ({selectedMusicians.length})
                </h4>
                <div className="space-y-2">
                  {selectedMusicians.map((m) => (
                    <div key={m.musicianId} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{m.name}</span>
                      <span className="font-medium text-foreground">R${formatCurrency(m.fee)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-center">
                <p className="text-xs text-success mb-1">RECEITA</p>
                <p className="text-2xl font-bold text-success">
                  R${formatCurrency(formData.cachet)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
                <p className="text-xs text-destructive mb-1">DESPESAS</p>
                <p className="text-2xl font-bold text-destructive">
                  R${formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <p className="text-xs text-primary mb-1">LUCRO LÍQUIDO</p>
                <p className={cn("text-2xl font-bold", netProfit >= 0 ? "text-primary" : "text-destructive")}>
                  R${formatCurrency(netProfit)}
                </p>
              </div>
            </div>

            {/* Expenses Breakdown */}
            {(expenses.length > 0 || selectedMusicians.length > 0) && (
              <div className="p-4 rounded-xl bg-secondary/50">
                <h4 className="font-semibold text-foreground mb-3">Despesas por Categoria</h4>
                <div className="space-y-2">
                  {selectedMusicians.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Músicos</span>
                      </div>
                      <span className="font-medium text-foreground">
                        R${formatCurrency(musiciansCost)}
                      </span>
                    </div>
                  )}
                  {expenseCategories.filter(c => c.value !== "musicos").map((cat) => {
                    const categoryTotal = expenses
                      .filter((exp) => exp.category === cat.value)
                      .reduce((sum, exp) => sum + exp.value, 0);
                    if (categoryTotal === 0) return null;
                    return (
                      <div key={cat.value} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{cat.label}</span>
                        </div>
                        <span className="font-medium text-foreground">
                          R${formatCurrency(categoryTotal)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <p className="text-sm text-accent flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Ao confirmar, este show será registrado e os dados serão enviados para os módulos correspondentes baseado no status.
              </p>
            </div>

            <div className="flex justify-between">
              <Button onClick={() => setActiveTab("financial")} variant="outline">
                Voltar
              </Button>
              <Button onClick={handleSubmit} variant="gradient" className="gap-2">
                <Mic2 className="w-4 h-4" />
                Lançar Show
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
