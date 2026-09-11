import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, CheckCircle2, Clock, Send, PenTool, Eye, MoreVertical, FileSignature, AlertTriangle, Link2, Lock, Pencil, Trash2, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useContracts, Contract } from "@/hooks/useContracts";
import { formatDateBR } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { useBudgets } from "@/hooks/useBudgets";
import { ContractModal } from "@/components/contratos/ContractModal";
import { ContractPreview } from "@/components/contratos/ContractPreview";
import { ClausesModal } from "@/components/contratos/ClausesModal";
import { SignatureLinkModal } from "@/components/contratos/SignatureLinkModal";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { FeatureBlockedDialog } from "@/components/layout/FeatureBlockedDialog";

const statusConfig = {
  draft: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  sent: { label: "Enviado", color: "bg-accent/10 text-accent border-accent/20", icon: Send },
  signed: { label: "Assinado", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
};

export default function Contratos() {
  const { contracts, savedClauses, loading, addContract, updateContract, deleteContract, addSavedClause, updateSavedClause, deleteSavedClause, getDefaultClauses } = useContracts();
  const { clients } = useClients();
  const { performanceTypes } = useBudgets();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isClausesModalOpen, setIsClausesModalOpen] = useState(false);
  const [isSignLinkOpen, setIsSignLinkOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const { isBlocked } = useFeatureBlocks();
  const signatureBlocked = isBlocked("assinatura-digital");
  const [showBlockedDialog, setShowBlockedDialog] = useState(false);

  const openSignatureLink = (contract: Contract) => {
    if (signatureBlocked) {
      setShowBlockedDialog(true);
      return;
    }
    setSelectedContract(contract);
    setIsSignLinkOpen(true);
  };

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
          {/* Busca + botão na mesma linha */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar contratos..." className="pl-9 bg-secondary" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Can action="create">
              <Button variant="gradient" onClick={() => { setSelectedContract(null); setIsModalOpen(true); }} className="shrink-0">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Novo Contrato</span>
              </Button>
            </Can>
          </div>

          <ChartCard title="Contratos Recentes" subtitle="Últimos contratos criados">
            {filteredContracts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Nenhum contrato encontrado.</div>
            ) : (
              <div className="space-y-3">
                {filteredContracts.map((contract) => {
                  const status = statusConfig[contract.status as keyof typeof statusConfig] || statusConfig.draft;
                  const StatusIcon = status.icon;
                  return (
                    <div key={contract.id} className="rounded-xl border bg-card/60 p-3 sm:p-4 hover:shadow-md transition-shadow">
                      {/* Linha superior: ícone + título + status + menu */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileSignature className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{contract.title}</p>
                              <p className="text-xs text-muted-foreground">{contract.contract_number}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Badge variant="outline" className={`${status.color} text-[10px] px-1.5 py-0.5 whitespace-nowrap`}>
                                <StatusIcon className="w-2.5 h-2.5 mr-1" />{status.label}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-background border">
                                  <DropdownMenuItem onClick={() => handleEdit(contract)}>
                                    <Pencil className="w-3.5 h-3.5 mr-2" />Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openSignatureLink(contract)}>
                                    {signatureBlocked && <Lock className="w-3.5 h-3.5 mr-2" />}
                                    {!signatureBlocked && <Link2 className="w-3.5 h-3.5 mr-2" />}
                                    Link de assinatura
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateContract(contract.id, { status: "sent" })}>
                                    <Send className="w-3.5 h-3.5 mr-2" />Marcar Enviado
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateContract(contract.id, { status: "signed", signed_at: new Date().toISOString() })}>
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-2" />Marcar Assinado
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" onClick={() => deleteContract(contract.id)}>
                                    <Trash2 className="w-3.5 h-3.5 mr-2" />Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* Metadados: cliente, valor, data */}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                            <span className="truncate max-w-[140px] font-medium text-foreground/80">{contract.client_name}</span>
                            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                              <DollarSign className="w-3 h-3" />
                              {contract.total_value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {contract.event_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />{formatDateBR(contract.event_date)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botões de ação — com ícone + texto */}
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/60">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 min-w-[120px] gap-1.5 text-xs h-8"
                          onClick={() => handleView(contract)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver contrato
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex-1 min-w-[120px] gap-1.5 text-xs h-8 ${signatureBlocked ? "text-muted-foreground" : "text-primary border-primary/30 hover:bg-primary/5"}`}
                          onClick={() => openSignatureLink(contract)}
                        >
                          {signatureBlocked
                            ? <Lock className="w-3.5 h-3.5" />
                            : <Link2 className="w-3.5 h-3.5" />}
                          Assinatura digital
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
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
              <Can action="create"><Button variant="outline" className="w-full justify-start" onClick={() => { setSelectedContract(null); setIsModalOpen(true); }}><PenTool className="w-4 h-4 mr-2" />Novo Contrato</Button></Can>
              <Button variant="outline" className="w-full justify-start" onClick={() => setIsClausesModalOpen(true)}><FileText className="w-4 h-4 mr-2" />Cláusulas Padrão</Button>
            </div>
          </ChartCard>
        </div>
      </div>

      <ContractModal performanceTypes={performanceTypes} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedContract(null); }} onSave={handleSave} clients={clients} savedClauses={savedClauses} getDefaultClauses={getDefaultClauses} contract={selectedContract} />
      <ContractPreview isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} contract={selectedContract} />
      <ClausesModal isOpen={isClausesModalOpen} onClose={() => setIsClausesModalOpen(false)} clauses={savedClauses} onAdd={addSavedClause} onUpdate={updateSavedClause} onDelete={deleteSavedClause} />
      <FeatureBlockedDialog open={showBlockedDialog} onOpenChange={setShowBlockedDialog} featureName="Assinatura digital de contratos" />
      <SignatureLinkModal isOpen={isSignLinkOpen} onClose={() => setIsSignLinkOpen(false)} contract={selectedContract} />
    </Layout>
  );
}
