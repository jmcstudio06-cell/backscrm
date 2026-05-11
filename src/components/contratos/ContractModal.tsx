import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, Check } from "lucide-react";
import { Client } from "@/hooks/useClients";
import { Contract, ContractClause, SavedClause } from "@/hooks/useContracts";
import { cn } from "@/lib/utils";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: Partial<Contract>) => void;
  clients: Client[];
  savedClauses: SavedClause[];
  getDefaultClauses: () => ContractClause[];
  contract?: Contract | null;
}

export function ContractModal({ isOpen, onClose, onSave, clients, savedClauses, getDefaultClauses, contract }: ContractModalProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [artistDocument, setArtistDocument] = useState("");
  const [artistAddress, setArtistAddress] = useState("");
  const [artistPhone, setArtistPhone] = useState("");
  const [artistEmail, setArtistEmail] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientDocument, setClientDocument] = useState("");
  const [clientRg, setClientRg] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventDuration, setEventDuration] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [totalValue, setTotalValue] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentTerms, setPaymentTerms] = useState("");
  const [clauses, setClauses] = useState<ContractClause[]>([]);

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

  useEffect(() => {
    if (contract) {
      setTitle(contract.title);
      setArtistName(contract.artist_name || "");
      setArtistDocument(contract.artist_document || "");
      setArtistAddress(contract.artist_address || "");
      setArtistPhone(contract.artist_phone || "");
      setArtistEmail(contract.artist_email || "");
      setClientName(contract.client_name);
      setClientDocument(contract.client_document || "");
      setClientRg((contract as Contract & { client_rg?: string | null }).client_rg || "");
      setClientAddress(contract.client_address || "");
      setClientPhone(contract.client_phone || "");
      setClientEmail(contract.client_email || "");
      setEventDate(contract.event_date || "");
      setEventTime(contract.event_time || "");
      setEventDuration(contract.event_duration || "");
      setEventLocation(contract.event_location || "");
      setEventType(contract.event_type || "");
      setTotalValue(contract.total_value);
      setDiscount(contract.discount);
      setPaymentTerms(contract.payment_terms || "");
      setClauses(contract.clauses || []);
      if (contract.client_id) setSelectedClientId(contract.client_id);
    } else {
      resetForm();
    }
  }, [contract, isOpen]);

  const resetForm = () => {
    setSelectedClientId("");
    setTitle("");
    setArtistName("");
    setArtistDocument("");
    setArtistAddress("");
    setArtistPhone("");
    setArtistEmail("");
    setClientName("");
    setClientDocument("");
    setClientRg("");
    setClientAddress("");
    setClientPhone("");
    setClientEmail("");
    setEventDate("");
    setEventTime("");
    setEventDuration("");
    setEventLocation("");
    setEventType("");
    setTotalValue(0);
    setDiscount(0);
    setPaymentTerms("");
    setClauses([]);
  };

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setClientName(client.name);
      setClientEmail(client.email || "");
      setClientPhone(client.phone || "");
      setClientDocument(client.cpf || "");
      setClientRg(client.rg || "");
      setClientAddress(client.address || "");
    }
    setClientSearchOpen(false);
  };

  const loadDefaultClauses = () => setClauses(getDefaultClauses());
  const addClause = () => setClauses([...clauses, { title: "", content: "", sort_order: clauses.length + 1 }]);
  const removeClause = (index: number) => setClauses(clauses.filter((_, i) => i !== index));
  const updateClause = (index: number, field: keyof ContractClause, value: string | number) => {
    setClauses(clauses.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };
  const moveClause = (index: number, direction: "up" | "down") => {
    const newClauses = [...clauses];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newClauses.length) return;
    [newClauses[index], newClauses[newIndex]] = [newClauses[newIndex], newClauses[index]];
    setClauses(newClauses);
  };
  const addSavedClause = (clause: SavedClause) => {
    setClauses([...clauses, { title: clause.title, content: clause.content, sort_order: clauses.length + 1 }]);
  };

  const handleSave = () => {
    const contractData: Partial<Contract> = {
      client_id: selectedClientId || null,
      title,
      artist_name: artistName,
      artist_document: artistDocument,
      artist_address: artistAddress,
      artist_phone: artistPhone,
      artist_email: artistEmail,
      client_name: clientName,
      client_document: clientDocument,
      client_address: clientAddress,
      client_phone: clientPhone,
      client_email: clientEmail,
      event_date: eventDate || null,
      event_time: eventTime,
      event_duration: eventDuration,
      event_location: eventLocation,
      event_type: eventType,
      total_value: totalValue,
      discount,
      payment_terms: paymentTerms,
      clauses: clauses.map((c, i) => ({ ...c, sort_order: i + 1 })),
      status: "draft",
    };
    onSave(contractData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader><DialogTitle>{contract ? "Editar Contrato" : "Novo Contrato"}</DialogTitle></DialogHeader>
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label>Título do Contrato</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Contrato de Prestação de Serviços Artísticos" className="bg-secondary" />
          </div>

          {/* Artist Info */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Dados do Artista/Empresa (CONTRATADA)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome/Razão Social</Label><Input value={artistName} onChange={e => setArtistName(e.target.value)} className="bg-secondary" /></div>
              <div className="space-y-2"><Label>CPF/CNPJ</Label><Input value={artistDocument} onChange={e => setArtistDocument(e.target.value)} className="bg-secondary" /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={artistPhone} onChange={e => setArtistPhone(e.target.value)} className="bg-secondary" /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={artistEmail} onChange={e => setArtistEmail(e.target.value)} className="bg-secondary" /></div>
              <div className="col-span-2 space-y-2"><Label>Endereço</Label><Input value={artistAddress} onChange={e => setArtistAddress(e.target.value)} className="bg-secondary" /></div>
            </div>
          </div>

          {/* Client Info */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Dados do Cliente (CONTRATANTE)</Label>
            <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={clientSearchOpen} className="w-full justify-between bg-secondary">
                  {selectedClient ? selectedClient.name : "Pesquisar cliente cadastrado..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-background border" align="start">
                <Command>
                  <CommandInput placeholder="Digite para buscar..." />
                  <CommandList>
                    <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                    <CommandGroup>
                      {clients.map((client) => (
                        <CommandItem
                          key={client.id}
                          value={client.name}
                          onSelect={() => handleClientSelect(client.id)}
                        >
                          <Check className={cn("mr-2 h-4 w-4", selectedClientId === client.id ? "opacity-100" : "opacity-0")} />
                          {client.name}
                          {client.company && <span className="ml-2 text-muted-foreground text-sm">({client.company})</span>}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nome</Label><Input value={clientName} onChange={e => setClientName(e.target.value)} className="bg-secondary" /></div>
              <div className="space-y-2"><Label>CPF/CNPJ</Label><Input value={clientDocument} onChange={e => setClientDocument(e.target.value)} placeholder="000.000.000-00" className="bg-secondary" /></div>
              <div className="space-y-2"><Label>RG</Label><Input value={clientRg} onChange={e => setClientRg(e.target.value)} placeholder="00.000.000-0" className="bg-secondary" /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="bg-secondary" /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={clientEmail} onChange={e => setClientEmail(e.target.value)} className="bg-secondary" /></div>
              <div className="space-y-2"><Label>Endereço</Label><Input value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Cidade - UF" className="bg-secondary" /></div>
            </div>
          </div>

          {/* Event Info */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Dados do Evento</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Data</Label><Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="bg-secondary" /></div>
              <div className="space-y-2"><Label>Horário</Label><Input value={eventTime} onChange={e => setEventTime(e.target.value)} placeholder="19h00 às 23h00" className="bg-secondary" /></div>
              <div className="space-y-2"><Label>Duração</Label><Input value={eventDuration} onChange={e => setEventDuration(e.target.value)} placeholder="4 horas" className="bg-secondary" /></div>
              <div className="space-y-2"><Label>Tipo de Evento</Label><Input value={eventType} onChange={e => setEventType(e.target.value)} placeholder="Casamento, Corporativo..." className="bg-secondary" /></div>
              <div className="col-span-2 space-y-2"><Label>Local</Label><Input value={eventLocation} onChange={e => setEventLocation(e.target.value)} className="bg-secondary" /></div>
            </div>
          </div>

          {/* Financial */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Valores</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Valor Total (R$)</Label><Input type="number" value={totalValue} onChange={e => setTotalValue(parseFloat(e.target.value) || 0)} className="bg-secondary" /></div>
              <div className="space-y-2"><Label>Desconto (R$)</Label><Input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="bg-secondary" /></div>
              <div className="space-y-2"><Label>Valor Final</Label><div className="h-10 flex items-center font-bold text-primary">R$ {(totalValue - discount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div></div>
            </div>
            <div className="space-y-2"><Label>Forma de Pagamento</Label><Textarea value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder="Ex: 50% na assinatura, 50% no dia do evento" className="bg-secondary" /></div>
          </div>

          {/* Clauses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Cláusulas do Contrato</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadDefaultClauses}>Carregar Padrão</Button>
                <Button variant="outline" size="sm" onClick={addClause}><Plus className="w-4 h-4 mr-1" />Adicionar</Button>
              </div>
            </div>
            {savedClauses.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {savedClauses.map(sc => <Button key={sc.id} variant="ghost" size="sm" onClick={() => addSavedClause(sc)}>+ {sc.title}</Button>)}
              </div>
            )}
            <div className="space-y-3">
              {clauses.map((clause, index) => (
                <div key={index} className="p-4 rounded-lg bg-secondary/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input value={clause.title} onChange={e => updateClause(index, "title", e.target.value)} placeholder="Título da cláusula" className="bg-background font-semibold" />
                    <Button variant="ghost" size="icon" onClick={() => moveClause(index, "up")} disabled={index === 0}><ChevronUp className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => moveClause(index, "down")} disabled={index === clauses.length - 1}><ChevronDown className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeClause(index)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                  <Textarea value={clause.content} onChange={e => updateClause(index, "content", e.target.value)} placeholder="Conteúdo da cláusula" className="bg-background min-h-[100px]" />
                </div>
              ))}
              {clauses.length === 0 && <div className="text-center py-8 text-muted-foreground">Clique em "Carregar Padrão" para usar o modelo de contrato ou adicione cláusulas manualmente.</div>}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button variant="gradient" onClick={handleSave}>{contract ? "Atualizar" : "Criar Contrato"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}