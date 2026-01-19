import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Client } from "@/hooks/useClients";
import { Budget, BudgetItem, PerformanceType } from "@/hooks/useBudgets";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Partial<Budget>, items: Partial<BudgetItem>[]) => void;
  clients: Client[];
  performanceTypes: PerformanceType[];
  budget?: Budget | null;
}

interface ItemRow {
  id: string;
  description: string;
  details: string;
  unit_price: number;
  quantity: number;
}

export function BudgetModal({
  isOpen,
  onClose,
  onSave,
  clients,
  performanceTypes,
  budget,
}: BudgetModalProps) {
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [items, setItems] = useState<ItemRow[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentConditions, setPaymentConditions] = useState("");
  const [notes, setNotes] = useState("");
  const [termsConditions, setTermsConditions] = useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  );
  const [validUntil, setValidUntil] = useState("");

  useEffect(() => {
    if (budget) {
      setClientName(budget.client_name);
      setClientEmail(budget.client_email || "");
      setClientPhone(budget.client_phone || "");
      setClientCompany(budget.client_company || "");
      setClientAddress(budget.client_address || "");
      setDiscount(budget.discount);
      setTax(budget.tax);
      setPaymentConditions(budget.payment_conditions || "");
      setNotes(budget.notes || "");
      setTermsConditions(budget.terms_conditions || "");
      setValidUntil(budget.valid_until || "");
      if (budget.client_id) {
        setClientMode("existing");
        setSelectedClientId(budget.client_id);
      }
      if (budget.items) {
        setItems(
          budget.items.map((item) => ({
            id: item.id,
            description: item.description,
            details: item.details || "",
            unit_price: item.unit_price,
            quantity: item.quantity,
          }))
        );
      }
    } else {
      resetForm();
    }
  }, [budget, isOpen]);

  const resetForm = () => {
    setClientMode("existing");
    setSelectedClientId("");
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setClientCompany("");
    setClientAddress("");
    setItems([]);
    setDiscount(0);
    setTax(0);
    setPaymentConditions("");
    setNotes("");
    setTermsConditions(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    );
    setValidUntil("");
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setClientName(client.name);
      setClientEmail(client.email || "");
      setClientPhone(client.phone || "");
      setClientCompany(client.company || "");
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        details: "",
        unit_price: 0,
        quantity: 1,
      },
    ]);
  };

  const addPerformanceType = (perfType: PerformanceType) => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: perfType.name,
        details: perfType.description || "",
        unit_price: perfType.price,
        quantity: 1,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ItemRow, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const subtotal = items.reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0
  );
  const taxAmount = subtotal * (tax / 100);
  const total = subtotal + taxAmount - discount;

  const handleSave = () => {
    const budgetData: Partial<Budget> = {
      client_id: clientMode === "existing" ? selectedClientId : null,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      client_company: clientCompany,
      client_address: clientAddress,
      subtotal,
      discount,
      tax,
      total,
      payment_conditions: paymentConditions,
      notes,
      terms_conditions: termsConditions,
      valid_until: validUntil || null,
      status: "draft",
    };

    const budgetItems: Partial<BudgetItem>[] = items.map((item, index) => ({
      description: item.description,
      details: item.details,
      unit_price: item.unit_price,
      quantity: item.quantity,
      sort_order: index,
    }));

    onSave(budgetData, budgetItems);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>
            {budget ? "Editar Orçamento" : "Novo Orçamento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Informações do Cliente</Label>
            
            <RadioGroup
              value={clientMode}
              onValueChange={(value) => setClientMode(value as "existing" | "new")}
              className="flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="existing" id="budget-existing" className="shrink-0" />
                <Label htmlFor="budget-existing" className="font-normal cursor-pointer text-sm">Cliente existente</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="new" id="budget-new" className="shrink-0" />
                <Label htmlFor="budget-new" className="font-normal cursor-pointer text-sm">Novo cliente</Label>
              </div>
            </RadioGroup>

            {clientMode === "existing" && (
              <Select value={selectedClientId} onValueChange={handleClientSelect}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.company && `- ${client.company}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do cliente"
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="Nome da empresa"
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className="bg-secondary"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Endereço</Label>
                <Input
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Endereço completo"
                  className="bg-secondary"
                />
              </div>
            </div>
          </div>

          {/* Performance Types */}
          {performanceTypes.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Adicionar Serviço</Label>
              <div className="flex flex-wrap gap-2">
                {performanceTypes.map((perf) => (
                  <Button
                    key={perf.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addPerformanceType(perf)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {perf.name} - R$ {perf.price.toLocaleString("pt-BR")}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Itens do Orçamento</Label>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                <div className="col-span-1"></div>
                <div className="col-span-4">Descrição</div>
                <div className="col-span-2">Preço Unit.</div>
                <div className="col-span-2">Qtd</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1"></div>
              </div>

              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-secondary/50"
                >
                  <div className="col-span-1 flex items-center justify-center">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground ml-1">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="col-span-4">
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      placeholder="Descrição do item"
                      className="bg-background text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)
                      }
                      placeholder="0,00"
                      className="bg-background text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", parseInt(e.target.value) || 1)
                      }
                      min={1}
                      className="bg-background text-sm"
                    />
                  </div>
                  <div className="col-span-2 text-sm font-medium">
                    R$ {(item.unit_price * item.quantity).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum item adicionado. Clique em "Adicionar Item" ou selecione um serviço acima.
                </div>
              )}
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Validade do Orçamento</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label>Condições de Pagamento</Label>
                <Textarea
                  value={paymentConditions}
                  onChange={(e) => setPaymentConditions(e.target.value)}
                  placeholder="Ex: 50% na assinatura, 50% no dia do evento"
                  className="bg-secondary"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-lg bg-secondary/50">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Desconto (R$):</span>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-background text-right"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Taxa (%):</span>
                <Input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  className="w-24 bg-background text-right"
                />
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <Label>Termos e Condições</Label>
            <Textarea
              value={termsConditions}
              onChange={(e) => setTermsConditions(e.target.value)}
              placeholder="Termos e condições do orçamento"
              className="bg-secondary"
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações adicionais"
              className="bg-secondary"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="gradient" onClick={handleSave}>
              {budget ? "Atualizar" : "Criar Orçamento"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
