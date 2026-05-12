import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, LayoutTemplate, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useBudgets, Budget, BudgetItem } from "@/hooks/useBudgets";
import { useClients } from "@/hooks/useClients";
import { useMusicians } from "@/hooks/useMusicians";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { BudgetModal } from "@/components/orcamentos/BudgetModal";
import { BudgetPreview } from "@/components/orcamentos/BudgetPreview";
import { BudgetTemplatePreview } from "@/components/orcamentos/BudgetTemplatePreview";
import { BudgetKanbanView } from "@/components/orcamentos/BudgetKanbanView";
import { useCustomization } from "@/hooks/useCustomization";
import { toast } from "sonner";

export default function Orcamentos() {
  const navigate = useNavigate();
  const { budgets, performanceTypes, loading, addBudget, updateBudget, deleteBudget, getBudgetWithItems } = useBudgets();
  const { clients } = useClients();
  const { musicians } = useMusicians();
  const { settings: customization, updateSettings } = useCustomization();
  const { isBlocked } = useFeatureBlocks();

  const enrichedPerformanceTypes = performanceTypes.map((perf) => {
    const musicianIds: string[] = (perf as any).musician_ids || [];
    const teamTotal = musicianIds.reduce((sum, id) => {
      const m = musicians.find((mu) => mu.id === id);
      return sum + (m?.rate || 0);
    }, 0);
    return { ...perf, price: perf.price + teamTotal };
  });

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [previewItems, setPreviewItems] = useState<BudgetItem[]>([]);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [contractPromptBudget, setContractPromptBudget] = useState<Budget | null>(null);

  const filteredBudgets = budgets.filter((b) =>
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

  const handleChangeStage = async (budget: Budget, newStage: string) => {
    await updateBudget(budget.id, { status: newStage });
    if (newStage === "sold") {
      setContractPromptBudget(budget);
    }
  };

  const handleCreateContract = () => {
    const contractsBlocked = isBlocked("contratos");
    if (contractsBlocked) {
      toast.error("Contratos disponíveis apenas no plano Empresarial");
      setContractPromptBudget(null);
      return;
    }
    setContractPromptBudget(null);
    navigate("/contratos");
  };

  if (loading) {
    return (
      <Layout title="Orçamentos" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Orçamentos" subtitle="Acompanhe a jornada de cada proposta no funil">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar orçamentos..." className="pl-9 w-64 bg-secondary" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="gradient" onClick={() => { setSelectedBudget(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

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
            <BudgetTemplatePreview selected={customization.budgetTemplate} onSelect={(t) => updateSettings({ budgetTemplate: t })} />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <BudgetKanbanView
        budgets={filteredBudgets}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={deleteBudget}
        onChangeStage={handleChangeStage}
      />

      <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1 mt-4">
        <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
        Orçamentos parados há mais de 30 dias em uma etapa são arquivados automaticamente. Salve em PDF os importantes!
      </p>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedBudget(null); }}
        onSave={handleSave}
        clients={clients}
        performanceTypes={enrichedPerformanceTypes}
        budget={selectedBudget}
      />
      <BudgetPreview isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} budget={selectedBudget} items={previewItems} />

      <AlertDialog open={!!contractPromptBudget} onOpenChange={(open) => !open && setContractPromptBudget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Orçamento vendido!</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja gerar um contrato para <strong>{contractPromptBudget?.client_name}</strong> agora?
              {isBlocked("contratos") && (
                <span className="block mt-2 text-warning text-xs">
                  Contratos estão disponíveis apenas no plano Empresarial.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Agora não</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateContract} disabled={isBlocked("contratos")}>
              Criar contrato
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
