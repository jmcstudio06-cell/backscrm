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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, FolderOpen, X, Edit2, Check } from "lucide-react";
import { useChecklistTemplates, ChecklistTemplate } from "@/hooks/useChecklistTemplates";
import { cn } from "@/lib/utils";

interface ChecklistTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTemplate?: (tasks: string[]) => void;
  showApplyButton?: boolean;
}

export function ChecklistTemplatesModal({ 
  open, 
  onOpenChange, 
  onApplyTemplate,
  showApplyButton = true,
}: ChecklistTemplatesModalProps) {
  const { templates, loading, addTemplate, updateTemplate, deleteTemplate } = useChecklistTemplates();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formTasks, setFormTasks] = useState<string[]>([""]);

  const resetForm = () => {
    setFormName("");
    setFormTasks([""]);
    setIsCreating(false);
    setEditingId(null);
  };

  const handleStartEdit = (template: ChecklistTemplate) => {
    setEditingId(template.id);
    setFormName(template.name);
    setFormTasks(template.tasks.length > 0 ? template.tasks : [""]);
  };

  const handleSave = async () => {
    const validTasks = formTasks.filter(t => t.trim());
    
    if (!formName.trim()) return;
    if (validTasks.length === 0) return;

    if (editingId) {
      await updateTemplate(editingId, formName.trim(), validTasks);
    } else {
      await addTemplate(formName.trim(), validTasks);
    }
    
    resetForm();
  };

  const handleApply = (template: ChecklistTemplate) => {
    onApplyTemplate?.(template.tasks);
    onOpenChange(false);
  };

  const addTaskField = () => {
    setFormTasks([...formTasks, ""]);
  };

  const removeTaskField = (index: number) => {
    if (formTasks.length > 1) {
      setFormTasks(formTasks.filter((_, i) => i !== index));
    }
  };

  const updateTask = (index: number, value: string) => {
    const updated = [...formTasks];
    updated[index] = value;
    setFormTasks(updated);
  };

  const isFormMode = isCreating || editingId;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Modelos de Checklist
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isFormMode ? (
            <>
              <Button 
                onClick={() => setIsCreating(true)} 
                className="w-full"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Modelo
              </Button>

              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum modelo criado ainda</p>
                  <p className="text-sm">Crie um modelo para reutilizar em seus shows</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div 
                      key={template.id} 
                      className="border border-border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground">{template.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {template.tasks.length} tarefas
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStartEdit(template)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {template.tasks.slice(0, 4).map((task, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            <span className="truncate">{task}</span>
                          </li>
                        ))}
                        {template.tasks.length > 4 && (
                          <li className="text-xs text-muted-foreground pl-3.5">
                            +{template.tasks.length - 4} tarefas...
                          </li>
                        )}
                      </ul>
                      {showApplyButton && onApplyTemplate && (
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleApply(template)}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Aplicar ao Show
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {editingId ? "Editar Modelo" : "Novo Modelo"}
                </h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={resetForm}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Nome do Modelo</Label>
                <Input
                  placeholder="Ex: Show Completo, Casamento, Corporativo..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tarefas do Checklist</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formTasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Tarefa ${index + 1}`}
                        value={task}
                        onChange={(e) => updateTask(index, e.target.value)}
                      />
                      {formTasks.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 flex-shrink-0"
                          onClick={() => removeTaskField(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTaskField}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Tarefa
                </Button>
              </div>

              <Button 
                onClick={handleSave} 
                className="w-full"
                disabled={!formName.trim() || formTasks.filter(t => t.trim()).length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Salvar Alterações" : "Criar Modelo"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
