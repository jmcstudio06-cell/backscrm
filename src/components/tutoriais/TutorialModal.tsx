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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface TutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    title: string;
    description: string;
    url: string;
    category: string;
    type: string;
    featured: boolean;
    thumbnail: string;
  }) => Promise<void>;
}

const categories = [
  { id: "primeiros-passos", name: "Primeiros Passos" },
  { id: "agenda", name: "Agenda" },
  { id: "financeiro", name: "Financeiro" },
  { id: "crm", name: "CRM" },
  { id: "contratos", name: "Contratos" },
  { id: "orcamentos", name: "Orçamentos" },
  { id: "equipe", name: "Equipe" },
  { id: "metas", name: "Metas" },
  { id: "dicas", name: "Dicas" },
  { id: "geral", name: "Geral" },
];

export function TutorialModal({ open, onOpenChange, onSave }: TutorialModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("geral");
  const [type, setType] = useState("video");
  const [featured, setFeatured] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        url: url.trim(),
        category,
        type,
        featured,
        thumbnail: thumbnail.trim(),
      });
      resetForm();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setUrl("");
    setCategory("geral");
    setType("video");
    setFeatured(false);
    setThumbnail("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Tutorial</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Como criar um show"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do tutorial"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL (Link ou Vídeo)</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Vídeo</SelectItem>
                  <SelectItem value="link">Link/Artigo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">URL da Thumbnail (opcional)</Label>
            <Input
              id="thumbnail"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="featured">Destacar tutorial</Label>
            <Switch
              id="featured"
              checked={featured}
              onCheckedChange={setFeatured}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
