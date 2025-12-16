import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, FolderOpen, X } from "lucide-react";
import { toast } from "sonner";

interface ChecklistTemplate {
  id: string;
  name: string;
  tasks: string[];
}

interface ChecklistTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTemplate: (tasks: string[]) => void;
}

const STORAGE_KEY = "checklist_templates";

export function ChecklistTemplatesModal({ 
  open, 
  onOpenChange, 
  onApplyTemplate 
}: ChecklistTemplatesModalProps) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTasks, setNewTasks] = useState<string[]>([""]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTemplates(JSON.parse(stored));
    }
  }, [open]);

  const saveTemplates = (newTemplates: ChecklistTemplate[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error("Digite um nome para a checklist");
      return;
    }

    const validTasks = newTasks.filter(t => t.trim());
    if (validTasks.length === 0) {
      toast.error("Adicione pelo menos uma tarefa");
      return;
    }

    const newTemplate: ChecklistTemplate = {
      id: Date.now().toString(),
      name: newTemplateName.trim(),
      tasks: validTasks,
    };

    saveTemplates([...templates, newTemplate]);
    setIsCreating(false);
    setNewTemplateName("");
    setNewTasks([""]);
    toast.success("Checklist criada com sucesso!");
  };

  const handleDeleteTemplate = (id: string) => {
    saveTemplates(templates.filter(t => t.id !== id));
    toast.success("Checklist excluída!");
  };

  const handleApply = (template: ChecklistTemplate) => {
    onApplyTemplate(template.tasks);
    onOpenChange(false);
    toast.success(`Checklist "${template.name}" aplicada!`);
  };

  const addTaskField = () => {
    setNewTasks([...newTasks, ""]);
  };

  const removeTaskField = (index: number) => {
    if (newTasks.length > 1) {
      setNewTasks(newTasks.filter((_, i) => i !== index));
    }
  };

  const updateTask = (index: number, value: string) => {
    const updated = [...newTasks];
    updated[index] = value;
    setNewTasks(updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Checklists Prontas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isCreating ? (
            <>
              <Button 
                onClick={() => setIsCreating(true)} 
                className="w-full"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Nova Checklist
              </Button>

              {templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma checklist criada ainda</p>
                  <p className="text-sm">Crie uma checklist para reutilizar em seus shows</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div 
                      key={template.id} 
                      className="border border-border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">{template.name}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {template.tasks.slice(0, 3).map((task, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {task}
                          </li>
                        ))}
                        {template.tasks.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{template.tasks.length - 3} tarefas...
                          </li>
                        )}
                      </ul>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleApply(template)}
                      >
                        Aplicar ao Show
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Nova Checklist</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTemplateName("");
                    setNewTasks([""]);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Nome da Checklist</Label>
                <Input
                  placeholder="Ex: Show Completo, Casamento, Corporativo..."
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tarefas</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {newTasks.map((task, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Tarefa ${index + 1}`}
                        value={task}
                        onChange={(e) => updateTask(index, e.target.value)}
                      />
                      {newTasks.length > 1 && (
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

              <Button onClick={handleCreateTemplate} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Checklist
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
