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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContentModalProps {
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
  { id: "marketing", name: "MARKETING" },
  { id: "producao", name: "PRODUÇÃO" },
  { id: "financeiro", name: "FINANCEIRO" },
  { id: "networking", name: "NETWORKING" },
  { id: "carreira", name: "CARREIRA" },
  { id: "tecnica", name: "TÉCNICA MUSICAL" },
  { id: "vendas", name: "VENDAS" },
  { id: "ferramentas", name: "FERRAMENTAS" },
  { id: "outra", name: "OUTRA" },
];

const contentTypes = [
  { value: "link", label: "Link (Canva, site, etc.)" },
  { value: "video", label: "Vídeo (YouTube)" },
];

export function ContentModal({ open, onOpenChange, onSave }: ContentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("outra");
  const [type, setType] = useState("link");
  const [featured, setFeatured] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      await onSave({
        title,
        description,
        url,
        category,
        type,
        featured,
        thumbnail,
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setUrl("");
      setCategory("outra");
      setType("link");
      setFeatured(false);
      setThumbnail("");
      
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Conteúdo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do conteúdo"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do conteúdo"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>URL / Link</Label>
            <Input
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
                  {contentTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === "video" && (
            <div className="space-y-2">
              <Label>URL da Thumbnail</Label>
              <Input
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label>Destaque</Label>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !title.trim()}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
