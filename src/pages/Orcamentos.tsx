import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, CheckCircle2, XCircle, Clock, Send, Eye, Download, MoreVertical, Calculator, DollarSign, Settings, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useBudgets } from "@/hooks/useBudgets";
import { formatDateBR } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { BudgetModal } from "@/components/orcamentos/BudgetModal";
import { BudgetPreview } from "@/components/orcamentos/BudgetPreview";
import { PerformanceTypesModal } from "@/components/orcamentos/PerformanceTypesModal";
import { Budget, BudgetItem } from "@/hooks/useBudgets";

const statusConfig = {
  draft: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  sent: { label: "Enviado", color: "bg-accent/10 text-accent border-accent/20", icon: Send },
  approved: { label: "Aprovado", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  rejected: { label: "Rejeitado", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

export default function Orcamentos() {
  const { budgets, performanceTypes, loading, addBudget, updateBudget, deleteBudget, getBudgetWithItems, addPerformanceType, updatePerformanceType, deletePerformanceType } = useBudgets();
  const { clients } = useClients();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTypesModalOpen, setIsTypesModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [previewItems, setPreviewItems] = useState<BudgetItem[]>([]);

  const filteredBudgets = budgets.filter(b => 
    b.client_name.toLowerCase().includes(search.toLowerCase()) ||
    b.budget_number.toLowerCase().includes(search.toLowerCase())
  );

  const totalApproved = budgets.filter(b => b.status === "approved").reduce((acc, b) => acc + b.total, 0);
  const totalPending = budgets.filter(b => b.status === "pending" || b.status === "sent").reduce((acc, b) => acc + b.total, 0);

  const handleSave = async (budgetData: Partial<Budget>, items: Partial<BudgetItem>[]) => {
    if (selectedBudget) {
      await updateBudget(selectedBudget.id, budgetData, items);
    } else {
      await addBudget(budgetData, items);
    }
    setSelectedBudget(null);
  };

  const handleView = async (budget: Budget) => {
    const fullBudget = await getBudgetWithItems(budget.id);
    if (fullBudget) {
      setSelectedBudget(fullBudget);
      setPreviewItems(fullBudget.items || []);
      setIsPreviewOpen(true);
    }
  };

  const handleEdit = async (budget: Budget) => {
    const fullBudget = await getBudgetWithItems(budget.id);
    if (fullBudget) {
      setSelectedBudget(fullBudget);
      setIsModalOpen(true);
    }
  };

  if (loading) {
    return <Layout title="Orçamentos" subtitle="Carregando..."><div className="flex items-center justify-center h-64">Carregando...</div></Layout>;
  }

  return (
    <Layout title="Orçamentos" subtitle="Crie e gerencie propostas comerciais">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{budgets.length}</p>
              <p className="text-xs text-muted-foreground">Total de Orçamentos</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{budgets.filter(b => b.status === "approved").length}</p>
              <p className="text-xs text-muted-foreground">Aprovados</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">R$ {(totalPending / 1000).toFixed(0)}k</p>
              <p className="text-xs text-muted-foreground">Em Negociação</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">R$ {(totalApproved / 1000).toFixed(0)}k</p>
              <p className="text-xs text-muted-foreground">Valor Aprovado</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1 mb-2">
        <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
        Apenas os 5 orçamentos mais recentes são armazenados. Os mais antigos são excluídos automaticamente. Salve em PDF!
      </p>


      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar orçamentos..." className="pl-9 w-64 bg-secondary" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsTypesModalOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Serviços
          </Button>
          <Button variant="gradient" onClick={() => { setSelectedBudget(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* Budgets Table */}
      <ChartCard title="Lista de Orçamentos" subtitle="Todas as propostas enviadas">
        {filteredBudgets.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Nenhum orçamento encontrado.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orçamento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudgets.map((budget) => {
                const status = statusConfig[budget.status as keyof typeof statusConfig] || statusConfig.draft;
                const StatusIcon = status.icon;
                return (
                  <TableRow key={budget.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{budget.budget_number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{budget.client_name}</TableCell>
                    <TableCell><span className="font-semibold text-success">R$ {budget.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></TableCell>
                    <TableCell className="text-muted-foreground">{budget.valid_until ? formatDateBR(budget.valid_until) : "-"}</TableCell>
                    <TableCell><Badge variant="outline" className={status.color}><StatusIcon className="w-3 h-3 mr-1" />{status.label}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(budget)}><Eye className="w-4 h-4" /></Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-background border">
                            <DropdownMenuItem onClick={() => handleEdit(budget)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateBudget(budget.id, { status: "sent" })}>Marcar Enviado</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateBudget(budget.id, { status: "approved" })}>Marcar Aprovado</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteBudget(budget.id)}>Excluir</DropdownMenuItem>
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

      <BudgetModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedBudget(null); }} onSave={handleSave} clients={clients} performanceTypes={performanceTypes} budget={selectedBudget} />
      <BudgetPreview isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} budget={selectedBudget} items={previewItems} />
      <PerformanceTypesModal isOpen={isTypesModalOpen} onClose={() => setIsTypesModalOpen(false)} performanceTypes={performanceTypes} onAdd={addPerformanceType} onUpdate={updatePerformanceType} onDelete={deletePerformanceType} />
    </Layout>
  );
}
