import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { SavedClause } from "@/hooks/useContracts";

interface ClausesModalProps {
  isOpen: boolean;
  onClose: () => void;
  clauses: SavedClause[];
  onAdd: (data: Partial<SavedClause>) => Promise<SavedClause | undefined>;
  onUpdate: (id: string, data: Partial<SavedClause>) => Promise<SavedClause | undefined>;
  onDelete: (id: string) => Promise<void>;
}

export function ClausesModal({ isOpen, onClose, clauses, onAdd, onUpdate, onDelete }: ClausesModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) return;
    if (editingId) {
      await onUpdate(editingId, { title, content });
      setEditingId(null);
    } else {
      await onAdd({ title, content, sort_order: clauses.length, is_default: false });
    }
    setTitle(""); setContent("");
  };

  const handleEdit = (clause: SavedClause) => {
    setEditingId(clause.id); setTitle(clause.title); setContent(clause.content);
  };

  const handleCancel = () => { setEditingId(null); setTitle(""); setContent(""); };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-background">
        <DialogHeader><DialogTitle>Gerenciar Cláusulas Salvas</DialogTitle></DialogHeader>
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-secondary/50 space-y-4">
            <div className="space-y-2"><Label>Título da Cláusula</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: CANCELAMENTO E MULTA" className="bg-background" /></div>
            <div className="space-y-2"><Label>Conteúdo</Label><Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Texto completo da cláusula..." className="bg-background min-h-[100px]" /></div>
            <div className="flex gap-2">
              <Button variant="gradient" onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />{editingId ? "Atualizar" : "Salvar"}</Button>
              {editingId && <Button variant="outline" onClick={handleCancel}>Cancelar</Button>}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-base font-semibold">Cláusulas Salvas</Label>
            {clauses.length === 0 ? <div className="text-center py-8 text-muted-foreground">Nenhuma cláusula salva ainda.</div> : (
              <div className="space-y-2">
                {clauses.map(clause => (
                  <div key={clause.id} className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1"><div className="font-medium">{clause.title}</div><div className="text-sm text-muted-foreground line-clamp-2">{clause.content}</div></div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(clause)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(clause.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
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
