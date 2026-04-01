import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus, Trash2, Edit2, Package, Search,
  Music, Mic, MicVocal, Guitar, Piano, Drum,
  PartyPopper, GlassWater, Sparkles, Star, Heart,
  Camera, Video, Headphones, Radio, Volume2,
  Users, UserPlus, Briefcase, Award, Crown,
  Disc3, ListMusic, AudioLines, Waves, Zap,
  Church, Building2, Tent, TreePine, Utensils,
  DollarSign, TrendingUp, Eye, ImagePlus, X,
  type LucideIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBudgets, PerformanceType } from "@/hooks/useBudgets";
import { useMusicians } from "@/hooks/useMusicians";
import { validateImageSize, compressImage } from "@/lib/imageUtils";

const ICON_OPTIONS: { name: string; icon: LucideIcon; label: string }[] = [
  { name: "music", icon: Music, label: "Música" },
  { name: "mic", icon: Mic, label: "Microfone" },
  { name: "mic-vocal", icon: MicVocal, label: "Vocal" },
  { name: "guitar", icon: Guitar, label: "Guitarra" },
  { name: "piano", icon: Piano, label: "Piano" },
  { name: "drum", icon: Drum, label: "Bateria" },
  { name: "headphones", icon: Headphones, label: "Fones" },
  { name: "radio", icon: Radio, label: "Rádio" },
  { name: "volume-2", icon: Volume2, label: "Som" },
  { name: "disc-3", icon: Disc3, label: "DJ" },
  { name: "list-music", icon: ListMusic, label: "Playlist" },
  { name: "audio-lines", icon: AudioLines, label: "Áudio" },
  { name: "waves", icon: Waves, label: "Ondas" },
  { name: "party-popper", icon: PartyPopper, label: "Festa" },
  { name: "glass-water", icon: GlassWater, label: "Drinks" },
  { name: "sparkles", icon: Sparkles, label: "Premium" },
  { name: "star", icon: Star, label: "Estrela" },
  { name: "heart", icon: Heart, label: "Amor" },
  { name: "zap", icon: Zap, label: "Energia" },
  { name: "award", icon: Award, label: "Prêmio" },
  { name: "crown", icon: Crown, label: "VIP" },
  { name: "camera", icon: Camera, label: "Foto" },
  { name: "video", icon: Video, label: "Vídeo" },
  { name: "users", icon: Users, label: "Grupo" },
  { name: "user-plus", icon: UserPlus, label: "Freelancer" },
  { name: "briefcase", icon: Briefcase, label: "Negócio" },
  { name: "church", icon: Church, label: "Igreja" },
  { name: "building-2", icon: Building2, label: "Corporativo" },
  { name: "tent", icon: Tent, label: "Ao ar livre" },
  { name: "tree-pine", icon: TreePine, label: "Natureza" },
  { name: "utensils", icon: Utensils, label: "Gastronomia" },
  { name: "package", icon: Package, label: "Pacote" },
];

function getIconComponent(iconName: string): LucideIcon {
  const found = ICON_OPTIONS.find(o => o.name === iconName);
  return found?.icon || Music;
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ServicosProdutos() {
  const { performanceTypes, loading, addPerformanceType, updatePerformanceType, deletePerformanceType } = useBudgets();
  const { musicians } = useMusicians();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState("music");
  const [selectedMusicians, setSelectedMusicians] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [musicianPickerOpen, setMusicianPickerOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const filtered = performanceTypes.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleMusician = (id: string) => {
    setSelectedMusicians(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const selectedMusiciansTotal = selectedMusicians.reduce((sum, id) => {
    const m = musicians.find(mu => mu.id === id);
    return sum + (m?.rate || 0);
  }, 0);

  const totalWithMusicians = price + selectedMusiciansTotal;

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageSize(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setUploadingCover(true);
    try {
      // Comprimir: max 1200px, 70% qualidade → arquivo leve
      const compressed = await compressImage(file, 1200, 0.7);
      const ext = compressed.name.split(".").pop();
      const fileName = `service-cover-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, compressed, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setCoverUrl(data.publicUrl);
      toast.success("Capa enviada!");
    } catch {
      toast.error("Erro ao enviar imagem");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice(0);
    setSelectedIcon("music");
    setSelectedMusicians([]);
    setCoverUrl(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const payload = { name, description, price, icon: selectedIcon, musician_ids: selectedMusicians, cover_url: coverUrl } as any;
    if (editingId) {
      await updatePerformanceType(editingId, payload);
    } else {
      await addPerformanceType(payload);
    }
    setModalOpen(false);
  };

  const handleEdit = (perf: PerformanceType) => {
    setEditingId(perf.id);
    setName(perf.name);
    setDescription(perf.description || "");
    setPrice(perf.price);
    setSelectedIcon((perf as any).icon || "music");
    setSelectedMusicians((perf as any).musician_ids || []);
    setCoverUrl(perf.cover_url || null);
    setModalOpen(true);
  };

  // Stats
  const totalItems = performanceTypes.length;
  const avgPrice = totalItems > 0 ? performanceTypes.reduce((s, p) => {
    const mIds: string[] = (p as any).musician_ids || [];
    const mTotal = mIds.reduce((sum, id) => sum + (musicians.find(mu => mu.id === id)?.rate || 0), 0);
    return s + p.price + mTotal;
  }, 0) / totalItems : 0;
  const maxPerf = performanceTypes.reduce<PerformanceType | null>((best, p) => {
    const mIds: string[] = (p as any).musician_ids || [];
    const total = p.price + mIds.reduce((s, id) => s + (musicians.find(mu => mu.id === id)?.rate || 0), 0);
    const bestIds: string[] = best ? ((best as any).musician_ids || []) : [];
    const bestTotal = best ? best.price + bestIds.reduce((s, id) => s + (musicians.find(mu => mu.id === id)?.rate || 0), 0) : 0;
    return total > bestTotal ? p : best;
  }, null);

  const SelectedIconComp = getIconComponent(selectedIcon);
  const detailPerf = performanceTypes.find(p => p.id === detailId);

  if (loading) {
    return (
      <Layout title="Serviços e Produtos" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>
      </Layout>
    );
  }

  return (
    <Layout title="Serviços e Produtos" subtitle="Seu catálogo profissional de serviços e produtos">

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviço ou produto..."
            className="pl-9 bg-card border-border/50"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button className="bg-primary hover:bg-primary/90 shadow-lg" onClick={handleOpenNew}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Catalog Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mb-5">
            <Package className="w-9 h-9 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            {search ? "Nenhum resultado encontrado" : "Seu catálogo está vazio"}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            {search ? "Tente outro termo de busca" : "Adicione seus serviços e produtos para usar nos orçamentos e impressionar seus clientes."}
          </p>
          {!search && (
            <Button className="mt-6 bg-primary hover:bg-primary/90" onClick={handleOpenNew}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro serviço
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((perf) => {
            const IconComp = getIconComponent((perf as any).icon || "music");
            const perfMusicians: string[] = (perf as any).musician_ids || [];
            const musiciansTotal = perfMusicians.reduce((sum, id) => {
              const m = musicians.find(mu => mu.id === id);
              return sum + (m?.rate || 0);
            }, 0);
            const perfTotal = perf.price + musiciansTotal;

            return (
              <div
                key={perf.id}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col"
                onClick={() => setDetailId(perf.id)}
              >
                {/* Cover Image */}
                {perf.cover_url ? (
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <img src={perf.cover_url} alt={perf.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}

                <div className="relative p-5 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <IconComp className="w-5.5 h-5.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate text-base">{perf.name}</p>
                      {perf.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{perf.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Musicians */}
                  {perfMusicians.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-4">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {perfMusicians.slice(0, 3).map(id => {
                          const m = musicians.find(mu => mu.id === id);
                          if (!m) return null;
                          return (
                            <Badge key={id} variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                              {m.name.split(" ")[0]}
                            </Badge>
                          );
                        })}
                        {perfMusicians.length > 3 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal">
                            +{perfMusicians.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <div>
                      <p className="text-xl font-bold text-primary leading-none">
                        R$ {fmt(perfTotal)}
                      </p>
                      {perfMusicians.length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          base {fmt(perf.price)} + equipe {fmt(musiciansTotal)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => { e.stopPropagation(); handleEdit(perf); }}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); deletePerformanceType(perf.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== CREATE / EDIT MODAL ===== */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10">
                <Package className="w-4 h-4 text-primary" />
              </div>
              {editingId ? "Editar Serviço" : "Novo Serviço ou Produto"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Cover Photo */}
            <div className="space-y-1.5">
              <Label className="text-xs">Foto de Capa (opcional)</Label>
              {coverUrl ? (
                <div className="relative aspect-[3/2] rounded-xl overflow-hidden border border-border">
                  <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverUrl(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors bg-muted/20">
                  <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{uploadingCover ? "Enviando..." : "Clique para adicionar uma capa"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
                </label>
              )}
            </div>

            {/* Icon + Name */}
            <div className="flex items-end gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Ícone</Label>
                <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                  <PopoverTrigger asChild>
                    <button className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-border hover:border-primary flex items-center justify-center transition-all">
                      <SelectedIconComp className="w-6 h-6 text-primary" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3" align="start">
                    <p className="text-sm font-semibold text-foreground mb-3">Escolha um ícone</p>
                    <div className="grid grid-cols-8 gap-1">
                      {ICON_OPTIONS.map(({ name: iconName, icon: Icon, label }) => (
                        <button
                          key={iconName}
                          onClick={() => { setSelectedIcon(iconName); setIconPickerOpen(false); }}
                          title={label}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            selectedIcon === iconName
                              ? "bg-primary text-primary-foreground scale-110 shadow-glow"
                              : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Nome do Serviço / Produto *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Show com Banda Completa" />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label className="text-xs">Preço Base (R$) *</Label>
              <Input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} placeholder="0,00" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs">Descrição (opcional)</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descreva o que está incluso neste serviço..."
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Musician Selector */}
            {musicians.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Equipe incluída neste serviço</Label>
                <Popover open={musicianPickerOpen} onOpenChange={setMusicianPickerOpen}>
                  <PopoverTrigger asChild>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-border hover:border-primary bg-muted/30 text-left transition-all">
                      <Users className="w-5 h-5 text-primary shrink-0" />
                      <span className="flex-1 text-sm text-muted-foreground">
                        {selectedMusicians.length === 0
                          ? "Selecionar músicos da equipe..."
                          : `${selectedMusicians.length} músico${selectedMusicians.length > 1 ? "s" : ""} selecionado${selectedMusicians.length > 1 ? "s" : ""}`}
                      </span>
                      {selectedMusicians.length > 0 && (
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                          + R$ {fmt(selectedMusiciansTotal)}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">Selecionar da equipe</p>
                      <p className="text-xs text-muted-foreground mt-0.5">O cachê será somado ao preço base</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                      {musicians.map(m => {
                        const isSelected = selectedMusicians.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            onClick={() => toggleMusician(m.id)}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                              isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-secondary border border-transparent"
                            }`}
                          >
                            <Checkbox checked={isSelected} className="pointer-events-none" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                              <p className="text-xs text-muted-foreground">{m.instrument || "Sem instrumento"}</p>
                            </div>
                            <span className="text-xs font-bold text-primary whitespace-nowrap">R$ {fmt(m.rate || 0)}</span>
                          </button>
                        );
                      })}
                    </div>
                    {selectedMusicians.length > 0 && (
                      <div className="p-3 border-t border-border bg-muted/30 flex justify-between text-sm">
                        <span className="text-muted-foreground">Total equipe:</span>
                        <span className="font-bold text-primary">R$ {fmt(selectedMusiciansTotal)}</span>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>

                {/* Tags */}
                {selectedMusicians.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedMusicians.map(id => {
                      const m = musicians.find(mu => mu.id === id);
                      if (!m) return null;
                      return (
                        <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-xs font-medium text-primary">
                          {m.name.split(" ")[0]}
                          <button onClick={() => toggleMusician(id)} className="ml-0.5 hover:text-destructive transition-colors">×</button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Total */}
                {selectedMusicians.length > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 mt-2">
                    <span className="text-sm text-muted-foreground">
                      Base R$ {fmt(price)} + Equipe R$ {fmt(selectedMusiciansTotal)}
                    </span>
                    <span className="text-base font-bold text-primary">= R$ {fmt(totalWithMusicians)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleSave} disabled={!name.trim()}>
                {editingId ? "Atualizar" : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailId} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="sm:max-w-md overflow-hidden p-0">
          {detailPerf && (() => {
            const IconComp = getIconComponent((detailPerf as any).icon || "music");
            const perfMusicians: string[] = (detailPerf as any).musician_ids || [];
            const musiciansTotal = perfMusicians.reduce((sum, id) => sum + (musicians.find(mu => mu.id === id)?.rate || 0), 0);
            const perfTotal = detailPerf.price + musiciansTotal;

            return (
              <>
                <DialogHeader className="sr-only">
                  <DialogTitle>Detalhes do Serviço</DialogTitle>
                </DialogHeader>

                {detailPerf.cover_url && (
                  <div className="aspect-[3/2] overflow-hidden">
                    <img src={detailPerf.cover_url} alt={detailPerf.name} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-col items-center text-center pb-4 border-b border-border">
                    {!detailPerf.cover_url && (
                      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-3 shadow-lg">
                        <IconComp className="w-7 h-7 text-primary" />
                      </div>
                    )}
                    <h2 className="text-xl font-bold text-foreground">{detailPerf.name}</h2>
                    {detailPerf.description && (
                      <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">{detailPerf.description}</p>
                    )}
                  </div>

                {/* Price breakdown */}
                <div className="py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Preço base</span>
                    <span className="text-sm font-semibold text-foreground">R$ {fmt(detailPerf.price)}</span>
                  </div>
                  {perfMusicians.length > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Equipe ({perfMusicians.length})</span>
                        <span className="text-sm font-semibold text-foreground">R$ {fmt(musiciansTotal)}</span>
                      </div>
                      <div className="space-y-1.5 pl-3 border-l-2 border-primary/20">
                        {perfMusicians.map(id => {
                          const m = musicians.find(mu => mu.id === id);
                          if (!m) return null;
                          return (
                            <div key={id} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{m.name} · {m.instrument || "—"}</span>
                              <span className="text-foreground font-medium">R$ {fmt(m.rate || 0)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-base font-bold text-foreground">Valor total</span>
                    <span className="text-xl font-bold text-primary">R$ {fmt(perfTotal)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setDetailId(null); handleEdit(detailPerf); }}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => { deletePerformanceType(detailPerf.id); setDetailId(null); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
