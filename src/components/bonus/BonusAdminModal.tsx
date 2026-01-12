import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bonus } from "@/hooks/useBonuses";

interface BonusAdminModalProps {
  bonus: Bonus | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (bonus: Partial<Bonus>) => void;
}

const contentTypes = [
  { value: "video", label: "Vídeo" },
  { value: "link", label: "Link externo" },
  { value: "download", label: "Download" },
  { value: "lesson", label: "Aula interna" }
];

const completionRules = [
  { value: "click", label: "Ao acessar" },
  { value: "watch_50", label: "Assistir 50%" },
  { value: "watch_100", label: "Assistir 100%" },
  { value: "download", label: "Ao baixar" }
];

export function BonusAdminModal({ bonus, open, onOpenChange, onSave }: BonusAdminModalProps) {
  const [formData, setFormData] = useState<Partial<Bonus>>({
    title: "",
    description: "",
    content_type: "video",
    content_url: "",
    thumbnail: "",
    completion_rule: "click",
    unlock_delay_hours: 24,
    is_active: true,
    reward_title: "",
    reward_description: "",
    reward_url: ""
  });

  useEffect(() => {
    if (bonus) {
      setFormData(bonus);
    } else {
      setFormData({
        title: "",
        description: "",
        content_type: "video",
        content_url: "",
        thumbnail: "",
        completion_rule: "click",
        unlock_delay_hours: 24,
        is_active: true,
        reward_title: "",
        reward_description: "",
        reward_url: ""
      });
    }
  }, [bonus, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bonus ? "Editar Bônus" : "Novo Bônus"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nome do bônus"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do conteúdo"
                rows={3}
              />
            </div>
          </div>

          {/* Content settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de conteúdo</Label>
              <Select
                value={formData.content_type}
                onValueChange={(value) => setFormData({ ...formData, content_type: value as Bonus["content_type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Regra de conclusão</Label>
              <Select
                value={formData.completion_rule}
                onValueChange={(value) => setFormData({ ...formData, completion_rule: value as Bonus["completion_rule"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {completionRules.map(rule => (
                    <SelectItem key={rule.value} value={rule.value}>
                      {rule.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="content_url">URL do conteúdo</Label>
            <Input
              id="content_url"
              value={formData.content_url || ""}
              onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="thumbnail">URL da thumbnail</Label>
            <Input
              id="thumbnail"
              value={formData.thumbnail || ""}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {/* Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unlock_delay">Tempo para liberar próximo (horas)</Label>
              <Input
                id="unlock_delay"
                type="number"
                min={0}
                value={formData.unlock_delay_hours}
                onChange={(e) => setFormData({ ...formData, unlock_delay_hours: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Bônus ativo</Label>
            </div>
          </div>

          {/* Reward section */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Recompensa (opcional)</h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="reward_title">Título da recompensa</Label>
                <Input
                  id="reward_title"
                  value={formData.reward_title || ""}
                  onChange={(e) => setFormData({ ...formData, reward_title: e.target.value })}
                  placeholder="Ex: Flyer exclusivo"
                />
              </div>

              <div>
                <Label htmlFor="reward_description">Descrição da recompensa</Label>
                <Textarea
                  id="reward_description"
                  value={formData.reward_description || ""}
                  onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })}
                  placeholder="Detalhes sobre a recompensa"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="reward_url">URL da recompensa</Label>
                <Input
                  id="reward_url"
                  value={formData.reward_url || ""}
                  onChange={(e) => setFormData({ ...formData, reward_url: e.target.value })}
                  placeholder="Link para download ou acesso"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {bonus ? "Salvar alterações" : "Criar bônus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
