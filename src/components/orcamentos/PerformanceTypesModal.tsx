import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PerformanceType } from "@/hooks/useBudgets";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface PerformanceTypesModalProps {
  isOpen: boolean;
  onClose: () => void;
  performanceTypes: PerformanceType[];
  onAdd: (data: Partial<PerformanceType>) => Promise<PerformanceType | undefined>;
  onUpdate: (id: string, data: Partial<PerformanceType>) => Promise<PerformanceType | undefined>;
  onDelete: (id: string) => Promise<void>;
}

export function PerformanceTypesModal({
  isOpen,
  onClose,
  performanceTypes,
  onAdd,
  onUpdate,
  onDelete,
}: PerformanceTypesModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!name.trim()) return;
    
    if (editingId) {
      await onUpdate(editingId, { name, description, price });
      setEditingId(null);
    } else {
      await onAdd({ name, description, price });
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
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background">
        <DialogHeader>
          <DialogTitle>Tipos de Performance / Serviços</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Form */}
          <div className="p-4 rounded-lg bg-secondary/50 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Serviço</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Show com Banda Completa"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Preço Base (R$)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className="bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do serviço"
                className="bg-background"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="gradient" onClick={handleAdd}>
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

          {/* List */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Serviços Cadastrados</Label>
            
            {performanceTypes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum serviço cadastrado ainda.
              </div>
            ) : (
              <div className="space-y-2">
                {performanceTypes.map((perf) => (
                  <div
                    key={perf.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{perf.name}</div>
                      {perf.description && (
                        <div className="text-sm text-muted-foreground">
                          {perf.description}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-primary">
                        R$ {perf.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(perf)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(perf.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
