import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, CheckCircle2, XCircle, Clock, Send, Eye, MoreVertical, AlertTriangle, LayoutTemplate } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useBudgets } from "@/hooks/useBudgets";
import { formatDateBR } from "@/lib/utils";
import { useClients } from "@/hooks/useClients";
import { BudgetModal } from "@/components/orcamentos/BudgetModal";
import { BudgetPreview } from "@/components/orcamentos/BudgetPreview";

import { BudgetTemplatePreview } from "@/components/orcamentos/BudgetTemplatePreview";
import { useCustomization } from "@/hooks/useCustomization";
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
  const { settings: customization, updateSettings } = useCustomization();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [previewItems, setPreviewItems] = useState<BudgetItem[]>([]);
  const [templateOpen, setTemplateOpen] = useState(false);

  const filteredBudgets = budgets.filter(b => 
    b.client_name.toLowerCase().includes(search.toLowerCase()) ||
    b.budget_number.toLowerCase().includes(search.toLowerCase())
  );

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
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar orçamentos..." className="pl-9 w-64 bg-secondary" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="gradient" onClick={() => { setSelectedBudget(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* Template Selector - Collapsible */}
      <Collapsible open={templateOpen} onOpenChange={setTemplateOpen} className="mb-6">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 rounded-xl glass hover:shadow-card transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm">Layout do Orçamento</p>
                <p className="text-xs text-muted-foreground">
                  Modelo atual: <span className="font-medium text-primary capitalize">{customization.budgetTemplate}</span>
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
              {templateOpen ? "Fechar" : "Alterar"}
            </span>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="p-4 rounded-xl glass-subtle">
            <BudgetTemplatePreview 
              selected={customization.budgetTemplate} 
              onSelect={(t) => updateSettings({ budgetTemplate: t })} 
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Budgets Table */}
      <ChartCard title="Seus Orçamentos" subtitle={`${budgets.length} ${budgets.length === 1 ? "proposta criada" : "propostas criadas"}`}>
        {filteredBudgets.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary/60" />
            </div>
            <p className="text-muted-foreground font-medium">Nenhum orçamento encontrado</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Crie seu primeiro orçamento profissional</p>
            <Button variant="gradient" size="sm" className="mt-4" onClick={() => { setSelectedBudget(null); setIsModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Orçamento
            </Button>
          </div>
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

      <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1 mt-2">
        <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
        Apenas os 5 orçamentos mais recentes são armazenados. Os mais antigos são excluídos automaticamente. Salve em PDF!
      </p>

      <BudgetModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedBudget(null); }} onSave={handleSave} clients={clients} performanceTypes={performanceTypes} budget={selectedBudget} />
      <BudgetPreview isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} budget={selectedBudget} items={previewItems} />
      
    </Layout>
  );
}
