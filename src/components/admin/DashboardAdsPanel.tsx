import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, Trash2, Plus, ImageIcon, ArrowUp, ArrowDown } from "lucide-react";

type Ad = {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  cta_label: string;
  cta_url: string;
  image_url: string;
  active: boolean;
  sort_order: number;
};

const EMPTY = {
  title: "",
  description: "",
  badge: "",
  cta_label: "Saiba mais",
  cta_url: "",
  image_url: "",
  active: true,
  sort_order: 0,
};

export function DashboardAdsPanel() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("dashboard_ads")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) toast.error("Erro ao carregar anúncios");
    setAds((data as Ad[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `ads/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("app-assets")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("app-assets").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("Imagem enviada");
    } catch (e) {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!form.title.trim() || !form.cta_url.trim() || !form.image_url) {
      toast.error("Preencha título, link do botão e imagem");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      badge: form.badge?.trim() || null,
      cta_label: form.cta_label.trim() || "Saiba mais",
      cta_url: form.cta_url.trim(),
      image_url: form.image_url,
      active: form.active,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = editingId
      ? await supabase.from("dashboard_ads").update(payload).eq("id", editingId)
      : await supabase.from("dashboard_ads").insert(payload);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar anúncio");
      return;
    }
    toast.success(editingId ? "Anúncio atualizado" : "Anúncio criado");
    setForm({ ...EMPTY });
    setEditingId(null);
    load();
  }

  async function toggleActive(ad: Ad) {
    const { error } = await supabase
      .from("dashboard_ads")
      .update({ active: !ad.active })
      .eq("id", ad.id);
    if (error) return toast.error("Erro ao atualizar");
    load();
  }

  async function move(ad: Ad, dir: -1 | 1) {
    const { error } = await supabase
      .from("dashboard_ads")
      .update({ sort_order: ad.sort_order + dir })
      .eq("id", ad.id);
    if (error) return toast.error("Erro ao reordenar");
    load();
  }

  async function remove(ad: Ad) {
    if (!confirm(`Excluir o anúncio "${ad.title}"?`)) return;
    const { error } = await supabase.from("dashboard_ads").delete().eq("id", ad.id);
    if (error) return toast.error("Erro ao excluir");
    toast.success("Anúncio excluído");
    if (editingId === ad.id) {
      setEditingId(null);
      setForm({ ...EMPTY });
    }
    load();
  }

  function edit(ad: Ad) {
    setEditingId(ad.id);
    setForm({
      title: ad.title,
      description: ad.description ?? "",
      badge: ad.badge ?? "",
      cta_label: ad.cta_label,
      cta_url: ad.cta_url,
      image_url: ad.image_url,
      active: ad.active,
      sort_order: ad.sort_order,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            {editingId ? "Editar anúncio" : "Novo anúncio do dashboard"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Imagem (recomendado 1792 × 1024 px)</Label>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                }}
                disabled={uploading}
              />
              {uploading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>
            {form.image_url && (
              <img
                src={form.image_url}
                alt="Pré-visualização do anúncio"
                className="mt-2 w-full max-w-md rounded-xl border border-border object-cover"
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Selo (badge)</Label>
              <Input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="Ex: Novidade"
              />
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Ranking de Shows"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Texto curto que aparece abaixo do título"
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Texto do botão (CTA)</Label>
              <Input
                value={form.cta_label}
                onChange={(e) => setForm({ ...form, cta_label: e.target.value })}
                placeholder="Ver ranking"
              />
            </div>
            <div className="space-y-2">
              <Label>Link do botão</Label>
              <Input
                value={form.cta_url}
                onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
                placeholder="/ranking ou https://..."
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 items-end">
            <div className="space-y-2">
              <Label>Ordem de exibição</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <Label className="mb-0">Ativo no dashboard</Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={saving || uploading}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {editingId ? "Salvar alterações" : "Criar anúncio"}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm({ ...EMPTY });
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anúncios cadastrados ({ads.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : ads.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum anúncio cadastrado. Enquanto isso, os banners padrão continuam aparecendo no
              dashboard.
            </p>
          ) : (
            ads.map((ad) => (
              <div
                key={ad.id}
                className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl border border-border bg-card"
              >
                <img
                  src={ad.image_url}
                  alt={ad.title}
                  className="w-full sm:w-40 h-24 object-cover rounded-lg"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{ad.title}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        ad.active
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {ad.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{ad.description}</p>
                  <p className="text-xs text-primary mt-1 truncate">
                    {ad.cta_label} → {ad.cta_url}
                  </p>
                </div>
                <div className="flex sm:flex-col gap-2 items-center">
                  <Button size="sm" variant="outline" onClick={() => edit(ad)}>
                    Editar
                  </Button>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => move(ad, -1)} aria-label="Subir">
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => move(ad, 1)} aria-label="Descer">
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleActive(ad)}
                      aria-label="Ativar/desativar"
                    >
                      <Upload className="w-4 h-4 rotate-180" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(ad)}
                      aria-label="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
