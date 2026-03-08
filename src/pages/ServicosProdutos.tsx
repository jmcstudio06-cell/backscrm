import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2, Package, Search, DollarSign } from "lucide-react";
import { useBudgets, PerformanceType } from "@/hooks/useBudgets";

export default function ServicosProdutos() {
  const { performanceTypes, loading, addPerformanceType, updatePerformanceType, deletePerformanceType } = useBudgets();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = performanceTypes.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!name.trim()) return;

    if (editingId) {
      await updatePerformanceType(editingId, { name, description, price });
      setEditingId(null);
    } else {
      await addPerformanceType({ name, description, price });
    }

    setName("");
    setDescription("");
    setPrice(0);
  };

  const handleEdit = (perf: PerformanceType) => {
    setEditingId(perf.id);
    setName(perf.name);
    setDescription(perf.description || "");
    setPrice(perf.price);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice(0);
  };

  if (loading) {
    return <Layout title="Serviços e Produtos" subtitle="Carregando..."><div className="flex items-center justify-center h-64">Carregando...</div></Layout>;
  }

  return (
    <Layout title="Serviços e Produtos" subtitle="Cadastre seus serviços e produtos para usar nos orçamentos">
      {/* Add/Edit Form */}
      <ChartCard
        title={editingId ? "Editar Serviço" : "Novo Serviço ou Produto"}
        subtitle={editingId ? "Atualize as informações abaixo" : "Preencha para adicionar ao seu catálogo"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do Serviço / Produto</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Show com Banda Completa"
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Preço Base (R$)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className="bg-secondary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que está incluso neste serviço..."
              className="bg-secondary resize-none"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="gradient" onClick={handleSave} disabled={!name.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              {editingId ? "Atualizar" : "Adicionar"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </ChartCard>

      {/* Search */}
      {performanceTypes.length > 3 && (
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviço..."
            className="pl-9 w-64 bg-secondary"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* List */}
      <div className="mt-6">
        <ChartCard
          title="Seu Catálogo"
          subtitle={`${performanceTypes.length} ${performanceTypes.length === 1 ? "item cadastrado" : "itens cadastrados"}`}
        >
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-muted-foreground font-medium">
                {search ? "Nenhum resultado encontrado" : "Nenhum serviço cadastrado ainda"}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {search ? "Tente outro termo de busca" : "Adicione seu primeiro serviço acima para começar a usar nos orçamentos"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((perf) => (
                <div
                  key={perf.id}
                  className="group flex items-start gap-4 p-4 rounded-xl glass hover:shadow-card transition-all"
                >
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{perf.name}</p>
                    {perf.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{perf.description}</p>
                    )}
                    <p className="text-sm font-bold text-primary mt-1">
                      R$ {perf.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(perf)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePerformanceType(perf.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>
    </Layout>
  );
}
