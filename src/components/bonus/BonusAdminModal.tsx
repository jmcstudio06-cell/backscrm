import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bonus } from "@/hooks/useBonuses";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { extractYouTubeVideoId } from "@/lib/youtube";

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

// Predefined time options for better UX
const timePresets = [
  { value: 0, label: "Imediato" },
  { value: 24, label: "24 horas" },
  { value: 72, label: "3 dias" },
  { value: 168, label: "1 semana" },
  { value: 360, label: "15 dias" },
  { value: 720, label: "1 mês" },
  { value: 1440, label: "2 meses" },
  { value: 2160, label: "3 meses" },
];

export function BonusAdminModal({ bonus, open, onOpenChange, onSave }: BonusAdminModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [customHours, setCustomHours] = useState(false);
  const [formData, setFormData] = useState<Partial<Bonus>>({
    title: "",
    description: "",
    content_type: "video",
    content_url: "",
    thumbnail: "",
    completion_rule: "click",
    unlock_after_hours: 24,
    is_active: true,
    reward_title: "",
    reward_description: "",
    reward_url: ""
  });

  useEffect(() => {
    if (bonus) {
      setFormData({
        ...bonus,
        unlock_after_hours: bonus.unlock_after_hours
      });
      // Check if it's a custom value
      const isPreset = timePresets.some(p => p.value === bonus.unlock_after_hours);
      setCustomHours(!isPreset);
    } else {
      setFormData({
        title: "",
        description: "",
        content_type: "video",
        content_url: "",
        thumbnail: "",
        completion_rule: "click",
        unlock_after_hours: 24,
        is_active: true,
        reward_title: "",
        reward_description: "",
        reward_url: ""
      });
      setCustomHours(false);
    }
  }, [bonus, open]);

  // Get auto-generated YouTube thumbnail preview
  const getPreviewThumbnail = (): string | null => {
    if (formData.thumbnail) return formData.thumbnail;
    const videoId = extractYouTubeVideoId(formData.content_url);
    if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return null;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 2MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `bonus-thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("bonus-assets")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("bonus-assets")
        .getPublicUrl(filePath);

      setFormData({ ...formData, thumbnail: publicUrl });
      toast.success("Imagem enviada!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveThumbnail = () => {
    setFormData({ ...formData, thumbnail: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const previewUrl = getPreviewThumbnail();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{bonus ? "Editar Prêmio" : "Novo Prêmio"}</DialogTitle>
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
                placeholder="Nome do prêmio"
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

          {/* Timing - Now more prominent */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary" />
              <Label className="text-base font-semibold">Quando liberar?</Label>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              Tempo após o cadastro do usuário para este prêmio ser liberado
            </p>

            {!customHours ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {timePresets.map((preset) => (
                  <Button
                    key={preset.value}
                    type="button"
                    variant={formData.unlock_after_hours === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData({ ...formData, unlock_after_hours: preset.value })}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2 mb-3">
                <Input
                  type="number"
                  min={0}
                  value={formData.unlock_after_hours}
                  onChange={(e) => setFormData({ ...formData, unlock_after_hours: parseInt(e.target.value) || 0 })}
                  className="w-32"
                />
                <span className="flex items-center text-sm text-muted-foreground">horas após cadastro</span>
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCustomHours(!customHours)}
            >
              {customHours ? "Usar opções rápidas" : "Definir horas personalizadas"}
            </Button>
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
            <Label>Thumbnail</Label>
            <div className="space-y-3">
              {previewUrl ? (
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                    }}
                  />
                  {formData.thumbnail && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={handleRemoveThumbnail}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                  {!formData.thumbnail && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      YouTube (auto)
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Nenhuma imagem</span>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload imagem
                </Button>
              </div>

              <Input
                value={formData.thumbnail || ""}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="Ou cole a URL da imagem..."
              />
              <p className="text-xs text-muted-foreground">
                💡 Se deixar vazio e for um vídeo do YouTube, a thumbnail será gerada automaticamente.
              </p>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Prêmio ativo</Label>
          </div>

          {/* Reward section */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Recompensa extra (opcional)</h4>
            
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
              {bonus ? "Salvar alterações" : "Criar prêmio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
