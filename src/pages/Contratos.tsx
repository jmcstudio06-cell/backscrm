import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, CheckCircle2, Clock, Send, PenTool, Download, Eye, MoreVertical, FileSignature, AlertTriangle, Link2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useContracts, Contract } from "@/hooks/useContracts";
import { formatDateBR } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { ContractModal } from "@/components/contratos/ContractModal";
import { ContractPreview } from "@/components/contratos/ContractPreview";
import { ClausesModal } from "@/components/contratos/ClausesModal";
import { SignatureLinkModal } from "@/components/contratos/SignatureLinkModal";

const statusConfig = {
  draft: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  sent: { label: "Enviado", color: "bg-accent/10 text-accent border-accent/20", icon: Send },
  signed: { label: "Assinado", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
};

export default function Contratos() {
  const { contracts, savedClauses, loading, addContract, updateContract, deleteContract, addSavedClause, updateSavedClause, deleteSavedClause, getDefaultClauses } = useContracts();
  const { clients } = useClients();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isClausesModalOpen, setIsClausesModalOpen] = useState(false);
  const [isSignLinkOpen, setIsSignLinkOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const filteredContracts = contracts.filter(c => 
    c.client_name.toLowerCase().includes(search.toLowerCase()) ||
    c.contract_number.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (contractData: Partial<Contract>) => {
    if (selectedContract) {
      await updateContract(selectedContract.id, contractData);
    } else {
      await addContract(contractData);
    }
    setSelectedContract(null);
  };

  const handleView = (contract: Contract) => {
    setSelectedContract(contract);
    setIsPreviewOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  if (loading) {
    return <Layout title="Contratos" subtitle="Carregando..."><div className="flex items-center justify-center h-64">Carregando...</div></Layout>;
  }

  return (
    <Layout title="Contratos" subtitle="Gerencie seus contratos e documentos">


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar contratos..." className="pl-9 w-64 bg-secondary" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button variant="gradient" onClick={() => { setSelectedContract(null); setIsModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />Novo Contrato
            </Button>
          </div>

          <ChartCard title="Contratos Recentes" subtitle="Últimos contratos criados">
            {filteredContracts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Nenhum contrato encontrado.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data Evento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => {
                    const status = statusConfig[contract.status as keyof typeof statusConfig] || statusConfig.draft;
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileSignature className="w-5 h-5 text-primary" /></div>
                            <div><span className="font-medium text-foreground block">{contract.title}</span><span className="text-xs text-muted-foreground">{contract.contract_number}</span></div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{contract.client_name}</TableCell>
                        <TableCell><span className="font-semibold text-success">R$ {contract.total_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></TableCell>
                        <TableCell className="text-muted-foreground">{contract.event_date ? formatDateBR(contract.event_date) : "-"}</TableCell>
                        <TableCell><Badge variant="outline" className={status.color}><StatusIcon className="w-3 h-3 mr-1" />{status.label}</Badge></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleView(contract)}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" title="Link de assinatura" onClick={() => { setSelectedContract(contract); setIsSignLinkOpen(true); }}>
                              <Link2 className="w-4 h-4 text-primary" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-background border">
                                <DropdownMenuItem onClick={() => handleEdit(contract)}>Editar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setSelectedContract(contract); setIsSignLinkOpen(true); }}>Link de assinatura</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateContract(contract.id, { status: "sent" })}>Marcar Enviado</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateContract(contract.id, { status: "signed", signed_at: new Date().toISOString() })}>Marcar Assinado</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => deleteContract(contract.id)}>Excluir</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </ChartCard>

          <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1">
            <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
            Apenas os 5 contratos mais recentes são armazenados. Os mais antigos são excluídos automaticamente. Salve em PDF!
          </p>
        </div>

        <div className="space-y-6">
          <ChartCard title="Cláusulas Salvas" subtitle="Modelos reutilizáveis">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {savedClauses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma cláusula salva</p>
              ) : (
                savedClauses.map((clause) => (
                  <div key={clause.id} className="p-2 rounded bg-secondary/50 text-sm">
                    <span className="font-medium">{clause.title}</span>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setIsClausesModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />Gerenciar Cláusulas
            </Button>
          </ChartCard>

          <ChartCard title="Ações Rápidas">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => { setSelectedContract(null); setIsModalOpen(true); }}><PenTool className="w-4 h-4 mr-2" />Novo Contrato</Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setIsClausesModalOpen(true)}><FileText className="w-4 h-4 mr-2" />Cláusulas Padrão</Button>
            </div>
          </ChartCard>
        </div>
      </div>

      <ContractModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedContract(null); }} onSave={handleSave} clients={clients} savedClauses={savedClauses} getDefaultClauses={getDefaultClauses} contract={selectedContract} />
      <ContractPreview isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} contract={selectedContract} />
      <ClausesModal isOpen={isClausesModalOpen} onClose={() => setIsClausesModalOpen(false)} clauses={savedClauses} onAdd={addSavedClause} onUpdate={updateSavedClause} onDelete={deleteSavedClause} />
    </Layout>
  );
}
