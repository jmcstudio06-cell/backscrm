import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Plus, Trash2, Edit2, Package, Search,
  Music, Mic, MicVocal, Guitar, Piano, Drum,
  PartyPopper, GlassWater, Sparkles, Star, Heart,
  Camera, Video, Headphones, Radio, Volume2,
  Users, UserPlus, Briefcase, Award, Crown,
  Disc3, ListMusic, AudioLines, Waves, Zap,
  Church, Building2, Tent, TreePine, Utensils,
  type LucideIcon,
} from "lucide-react";
import { useBudgets, PerformanceType } from "@/hooks/useBudgets";

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

export default function ServicosProdutos() {
  const { performanceTypes, loading, addPerformanceType, updatePerformanceType, deletePerformanceType } = useBudgets();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState("music");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const filtered = performanceTypes.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!name.trim()) return;

    if (editingId) {
      await updatePerformanceType(editingId, { name, description, price, icon: selectedIcon } as any);
      setEditingId(null);
    } else {
      await addPerformanceType({ name, description, price, icon: selectedIcon } as any);
    }

    setName("");
    setDescription("");
    setPrice(0);
    setSelectedIcon("music");
  };

  const handleEdit = (perf: PerformanceType) => {
    setEditingId(perf.id);
    setName(perf.name);
    setDescription(perf.description || "");
    setPrice(perf.price);
    setSelectedIcon((perf as any).icon || "music");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice(0);
    setSelectedIcon("music");
  };

  const SelectedIconComp = getIconComponent(selectedIcon);

  if (loading) {
    return <Layout title="Serviços e Produtos" subtitle="Carregando..."><div className="flex items-center justify-center h-64">Carregando...</div></Layout>;
  }

  return (
    <Layout title="Serviços e Produtos" subtitle="Cadastre seus serviços e produtos para usar nos orçamentos">
      {/* Add/Edit Form */}
      <ChartCard
        title={editingId ? "Editar Serviço" : "Novo Serviço ou Produto"}
        subtitle={editingId ? "Atualize as informações abaixo" : "Preencha para adicionar ao seu catálogo"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-4 items-end">
            {/* Icon Picker */}
            <div className="space-y-2">
              <Label>Ícone</Label>
              <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                <PopoverTrigger asChild>
                  <button
                    className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-border hover:border-primary flex items-center justify-center transition-all"
                    title="Escolher ícone"
                  >
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

            <div className="space-y-2">
              <Label>Nome do Serviço / Produto</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Show com Banda Completa"
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label>Preço Base (R$)</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
                className="bg-secondary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que está incluso neste serviço..."
              className="bg-secondary resize-none"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="gradient" onClick={handleSave} disabled={!name.trim()}>
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
      </ChartCard>

      {/* Search */}
      {performanceTypes.length > 3 && (
        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviço..."
            className="pl-9 w-64 bg-secondary"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* List */}
      <div className="mt-6">
        <ChartCard
          title="Seu Catálogo"
          subtitle={`${performanceTypes.length} ${performanceTypes.length === 1 ? "item cadastrado" : "itens cadastrados"}`}
        >
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary/60" />
              </div>
              <p className="text-muted-foreground font-medium">
                {search ? "Nenhum resultado encontrado" : "Nenhum serviço cadastrado ainda"}
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {search ? "Tente outro termo de busca" : "Adicione seu primeiro serviço acima para começar a usar nos orçamentos"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((perf) => {
                const IconComp = getIconComponent((perf as any).icon || "music");
                return (
                  <div
                    key={perf.id}
                    className="group flex items-start gap-4 p-4 rounded-xl glass hover:shadow-card transition-all"
                  >
                    <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <IconComp className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{perf.name}</p>
                      {perf.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{perf.description}</p>
                      )}
                      <p className="text-sm font-bold text-primary mt-1">
                        R$ {perf.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(perf)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deletePerformanceType(perf.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>
      </div>
    </Layout>
  );
}
