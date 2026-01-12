import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Music,
  ListMusic,
  Clock,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Flame,
  Heart,
  Zap,
  Flag,
  Sparkles,
  Check,
  Edit2,
  Trash2,
  Star,
  Target,
  Users,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  duration: string;
  isMain: boolean;
  checked: boolean;
  keyOk: boolean;
  chordsReviewed: boolean;
}

interface Block {
  id: string;
  name: string;
  climate: "animado" | "medio" | "calmo";
  objective: "segurar" | "levantar" | "finalizar" | "transicao";
  duration: string;
  songs: Song[];
  isExpanded: boolean;
}

const climateIcons = {
  animado: Flame,
  medio: Zap,
  calmo: Heart,
};

const climateLabels = {
  animado: "Animado",
  medio: "Médio",
  calmo: "Calmo",
};

const climateColors = {
  animado: "text-orange-500 bg-orange-500/10",
  medio: "text-yellow-500 bg-yellow-500/10",
  calmo: "text-blue-500 bg-blue-500/10",
};

const objectiveIcons = {
  segurar: Users,
  levantar: PartyPopper,
  finalizar: Flag,
  transicao: Sparkles,
};

const objectiveLabels = {
  segurar: "Segurar Público",
  levantar: "Levantar",
  finalizar: "Finalizar",
  transicao: "Transição",
};

// Dados de exemplo
const initialBlocks: Block[] = [
  {
    id: "1",
    name: "Abertura",
    climate: "medio",
    objective: "segurar",
    duration: "20min",
    isExpanded: true,
    songs: [
      { id: "1a", title: "Evidências", artist: "Chitãozinho & Xororó", key: "G", duration: "4:32", isMain: true, checked: true, keyOk: true, chordsReviewed: true },
      { id: "1b", title: "Shallow", artist: "Lady Gaga", key: "G", duration: "3:37", isMain: false, checked: true, keyOk: true, chordsReviewed: false },
      { id: "1c", title: "Perfect", artist: "Ed Sheeran", key: "Ab", duration: "4:23", isMain: false, checked: false, keyOk: false, chordsReviewed: false },
    ],
  },
  {
    id: "2",
    name: "Animado",
    climate: "animado",
    objective: "levantar",
    duration: "30min",
    isExpanded: false,
    songs: [
      { id: "2a", title: "Sweet Child O' Mine", artist: "Guns N' Roses", key: "D", duration: "5:56", isMain: true, checked: true, keyOk: true, chordsReviewed: true },
      { id: "2b", title: "Bohemian Rhapsody", artist: "Queen", key: "Bb", duration: "5:55", isMain: false, checked: true, keyOk: true, chordsReviewed: true },
      { id: "2c", title: "País Tropical", artist: "Jorge Ben Jor", key: "A", duration: "3:28", isMain: false, checked: false, keyOk: true, chordsReviewed: false },
    ],
  },
  {
    id: "3",
    name: "Romântico",
    climate: "calmo",
    objective: "transicao",
    duration: "25min",
    isExpanded: false,
    songs: [
      { id: "3a", title: "Trem Bala", artist: "Ana Vilela", key: "C", duration: "4:15", isMain: true, checked: true, keyOk: true, chordsReviewed: true },
      { id: "3b", title: "Asa Branca", artist: "Luiz Gonzaga", key: "D", duration: "3:45", isMain: false, checked: true, keyOk: true, chordsReviewed: true },
    ],
  },
  {
    id: "4",
    name: "Final",
    climate: "animado",
    objective: "finalizar",
    duration: "15min",
    isExpanded: false,
    songs: [
      { id: "4a", title: "We Are The Champions", artist: "Queen", key: "F", duration: "3:00", isMain: true, checked: true, keyOk: true, chordsReviewed: true },
    ],
  },
  {
    id: "5",
    name: "Coringa",
    climate: "medio",
    objective: "segurar",
    duration: "Reserva",
    isExpanded: false,
    songs: [
      { id: "5a", title: "Ai Se Eu Te Pego", artist: "Michel Teló", key: "G", duration: "2:54", isMain: false, checked: true, keyOk: true, chordsReviewed: true },
      { id: "5b", title: "Macarena", artist: "Los Del Rio", key: "Bb", duration: "3:30", isMain: false, checked: true, keyOk: true, chordsReviewed: true },
    ],
  },
];

export default function Repertorio() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showSongModal, setShowSongModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // Form states
  const [blockName, setBlockName] = useState("");
  const [blockClimate, setBlockClimate] = useState<Block["climate"]>("medio");
  const [blockObjective, setBlockObjective] = useState<Block["objective"]>("segurar");
  const [blockDuration, setBlockDuration] = useState("");
  
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songKey, setSongKey] = useState("");
  const [songDuration, setSongDuration] = useState("");

  // Stats
  const totalSongs = blocks.reduce((acc, b) => acc + b.songs.length, 0);
  const mainBlocks = blocks.filter(b => b.name !== "Coringa").length;
  const totalDuration = blocks
    .filter(b => b.duration !== "Reserva")
    .reduce((acc, b) => {
      const match = b.duration.match(/(\d+)/);
      return acc + (match ? parseInt(match[1]) : 0);
    }, 0);
  const checkedSongs = blocks.reduce((acc, b) => 
    acc + b.songs.filter(s => s.checked && s.keyOk && s.chordsReviewed).length, 0
  );

  const toggleBlockExpand = (blockId: string) => {
    setBlocks(blocks.map(b => 
      b.id === blockId ? { ...b, isExpanded: !b.isExpanded } : b
    ));
  };

  const toggleSongCheck = (blockId: string, songId: string, field: "checked" | "keyOk" | "chordsReviewed") => {
    setBlocks(blocks.map(b => 
      b.id === blockId 
        ? { 
            ...b, 
            songs: b.songs.map(s => 
              s.id === songId ? { ...s, [field]: !s[field] } : s
            ) 
          } 
        : b
    ));
  };

  const setMainSong = (blockId: string, songId: string) => {
    setBlocks(blocks.map(b => 
      b.id === blockId 
        ? { 
            ...b, 
            songs: b.songs.map(s => ({ ...s, isMain: s.id === songId })) 
          } 
        : b
    ));
  };

  const openNewBlockModal = () => {
    setEditingBlock(null);
    setBlockName("");
    setBlockClimate("medio");
    setBlockObjective("segurar");
    setBlockDuration("");
    setShowBlockModal(true);
  };

  const openEditBlockModal = (block: Block) => {
    setEditingBlock(block);
    setBlockName(block.name);
    setBlockClimate(block.climate);
    setBlockObjective(block.objective);
    setBlockDuration(block.duration);
    setShowBlockModal(true);
  };

  const saveBlock = () => {
    if (!blockName.trim()) return;

    if (editingBlock) {
      setBlocks(blocks.map(b => 
        b.id === editingBlock.id 
          ? { ...b, name: blockName, climate: blockClimate, objective: blockObjective, duration: blockDuration }
          : b
      ));
    } else {
      const newBlock: Block = {
        id: Date.now().toString(),
        name: blockName,
        climate: blockClimate,
        objective: blockObjective,
        duration: blockDuration || "20min",
        isExpanded: true,
        songs: [],
      };
      setBlocks([...blocks, newBlock]);
    }
    setShowBlockModal(false);
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
  };

  const openAddSongModal = (blockId: string) => {
    setSelectedBlockId(blockId);
    setSongTitle("");
    setSongArtist("");
    setSongKey("");
    setSongDuration("");
    setShowSongModal(true);
  };

  const saveSong = () => {
    if (!songTitle.trim() || !selectedBlockId) return;

    const newSong: Song = {
      id: Date.now().toString(),
      title: songTitle,
      artist: songArtist,
      key: songKey,
      duration: songDuration || "3:30",
      isMain: false,
      checked: false,
      keyOk: false,
      chordsReviewed: false,
    };

    setBlocks(blocks.map(b => 
      b.id === selectedBlockId 
        ? { ...b, songs: [...b.songs, newSong] }
        : b
    ));
    setShowSongModal(false);
  };

  const deleteSong = (blockId: string, songId: string) => {
    setBlocks(blocks.map(b => 
      b.id === blockId 
        ? { ...b, songs: b.songs.filter(s => s.id !== songId) }
        : b
    ));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...blocks];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  return (
    <Layout title="Repertório" subtitle="Planejamento de blocos para o show">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ListMusic className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{mainBlocks}</p>
              <p className="text-xs text-muted-foreground">Blocos</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Music className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalSongs}</p>
              <p className="text-xs text-muted-foreground">Músicas</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalDuration}min</p>
              <p className="text-xs text-muted-foreground">Duração Total</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{checkedSongs}/{totalSongs}</p>
              <p className="text-xs text-muted-foreground">Conferidas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Resumo do Show */}
        <div className="space-y-6">
          <ChartCard title="Resumo do Show">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-1">Duração Planejada</p>
                <p className="text-lg font-bold text-foreground">{totalDuration} minutos</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Ordem dos Blocos</p>
                {blocks.filter(b => b.name !== "Coringa").map((block, index) => {
                  const ClimateIcon = climateIcons[block.climate];
                  return (
                    <div key={block.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30">
                      <span className="text-xs font-medium text-muted-foreground w-5">{index + 1}.</span>
                      <div className={cn("w-6 h-6 rounded flex items-center justify-center", climateColors[block.climate])}>
                        <ClimateIcon className="w-3 h-3" />
                      </div>
                      <span className="text-sm font-medium text-foreground flex-1">{block.name}</span>
                      <span className="text-xs text-muted-foreground">{block.duration}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Legenda de Clima</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(climateLabels).map(([key, label]) => {
                    const Icon = climateIcons[key as Block["climate"]];
                    return (
                      <div key={key} className={cn("flex items-center gap-1 px-2 py-1 rounded text-xs", climateColors[key as Block["climate"]])}>
                        <Icon className="w-3 h-3" />
                        {label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Check Visual">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                <span className="text-sm text-foreground">Músicas conferidas</span>
                <Badge variant={checkedSongs === totalSongs ? "default" : "secondary"}>
                  {checkedSongs}/{totalSongs}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>✔ Música conferida</p>
                <p>✔ Tom verificado</p>
                <p>✔ Cifras revisadas</p>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Main Content - Blocos */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-foreground">Blocos do Show</h2>
            <Button variant="gradient" onClick={openNewBlockModal}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Bloco
            </Button>
          </div>

          <div className="space-y-3">
            {blocks.map((block, index) => {
              const ClimateIcon = climateIcons[block.climate];
              const ObjectiveIcon = objectiveIcons[block.objective];
              const mainSong = block.songs.find(s => s.isMain);
              const allChecked = block.songs.length > 0 && block.songs.every(s => s.checked && s.keyOk && s.chordsReviewed);
              
              return (
                <Collapsible 
                  key={block.id} 
                  open={block.isExpanded}
                  onOpenChange={() => toggleBlockExpand(block.id)}
                >
                  <div className={cn(
                    "rounded-xl border transition-all",
                    block.name === "Coringa" 
                      ? "border-dashed border-muted-foreground/30 bg-secondary/20" 
                      : "border-border bg-card"
                  )}>
                    {/* Block Header */}
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 transition-colors rounded-t-xl">
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5"
                            onClick={(e) => { e.stopPropagation(); moveBlock(index, "up"); }}
                            disabled={index === 0}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5"
                            onClick={(e) => { e.stopPropagation(); moveBlock(index, "down"); }}
                            disabled={index === blocks.length - 1}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", climateColors[block.climate])}>
                          <ClimateIcon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{block.name}</h3>
                            {allChecked && (
                              <Badge variant="outline" className="text-success border-success/30 bg-success/10">
                                <Check className="w-3 h-3 mr-1" />
                                OK
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <ObjectiveIcon className="w-3 h-3" />
                              {objectiveLabels[block.objective]}
                            </span>
                            <span>•</span>
                            <span>{block.songs.length} músicas</span>
                            <span>•</span>
                            <span>{block.duration}</span>
                            {mainSong && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-warning" />
                                  {mainSong.title}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => openEditBlockModal(block)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteBlock(block.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        
                        {block.isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>

                    {/* Block Songs */}
                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-2">
                        {block.songs.map((song) => (
                          <div 
                            key={song.id}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg transition-all",
                              song.isMain 
                                ? "bg-primary/10 border border-primary/20" 
                                : "bg-secondary/50 hover:bg-secondary"
                            )}
                          >
                            <Button
                              variant={song.isMain ? "default" : "ghost"}
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => setMainSong(block.id, song.id)}
                              title="Definir como principal"
                            >
                              <Star className={cn("w-4 h-4", song.isMain && "fill-current")} />
                            </Button>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">
                                {song.title}
                                {song.isMain && <span className="text-primary ml-2 text-xs">(Principal)</span>}
                              </p>
                              <p className="text-xs text-muted-foreground">{song.artist}</p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                              <span>Tom: {song.key}</span>
                              <span>•</span>
                              <span>{song.duration}</span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="flex items-center gap-1">
                                <Checkbox 
                                  id={`${song.id}-checked`}
                                  checked={song.checked}
                                  onCheckedChange={() => toggleSongCheck(block.id, song.id, "checked")}
                                />
                                <Label htmlFor={`${song.id}-checked`} className="text-xs">✔</Label>
                              </div>
                              <div className="flex items-center gap-1">
                                <Checkbox 
                                  id={`${song.id}-key`}
                                  checked={song.keyOk}
                                  onCheckedChange={() => toggleSongCheck(block.id, song.id, "keyOk")}
                                />
                                <Label htmlFor={`${song.id}-key`} className="text-xs">Tom</Label>
                              </div>
                              <div className="flex items-center gap-1">
                                <Checkbox 
                                  id={`${song.id}-chords`}
                                  checked={song.chordsReviewed}
                                  onCheckedChange={() => toggleSongCheck(block.id, song.id, "chordsReviewed")}
                                />
                                <Label htmlFor={`${song.id}-chords`} className="text-xs">Cifra</Label>
                              </div>
                            </div>

                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => deleteSong(block.id, song.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        
                        <Button 
                          variant="outline" 
                          className="w-full mt-2"
                          onClick={() => openAddSongModal(block.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Música
                        </Button>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Novo/Editar Bloco */}
      <Dialog open={showBlockModal} onOpenChange={setShowBlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBlock ? "Editar Bloco" : "Novo Bloco"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Bloco</Label>
              <Input 
                placeholder="Ex: Abertura, Animado, Romântico..."
                value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Clima</Label>
                <Select value={blockClimate} onValueChange={(v) => setBlockClimate(v as Block["climate"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="animado">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Animado
                      </div>
                    </SelectItem>
                    <SelectItem value="medio">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Médio
                      </div>
                    </SelectItem>
                    <SelectItem value="calmo">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-blue-500" />
                        Calmo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Select value={blockObjective} onValueChange={(v) => setBlockObjective(v as Block["objective"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="segurar">Segurar Público</SelectItem>
                    <SelectItem value="levantar">Levantar</SelectItem>
                    <SelectItem value="finalizar">Finalizar</SelectItem>
                    <SelectItem value="transicao">Transição</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duração Aproximada</Label>
              <Input 
                placeholder="Ex: 20min, 30min..."
                value={blockDuration}
                onChange={(e) => setBlockDuration(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockModal(false)}>Cancelar</Button>
            <Button onClick={saveBlock}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Música */}
      <Dialog open={showSongModal} onOpenChange={setShowSongModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Música</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input 
                placeholder="Nome da música"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Artista</Label>
              <Input 
                placeholder="Nome do artista"
                value={songArtist}
                onChange={(e) => setSongArtist(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tom</Label>
                <Input 
                  placeholder="Ex: C, G, Am..."
                  value={songKey}
                  onChange={(e) => setSongKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duração</Label>
                <Input 
                  placeholder="Ex: 3:45"
                  value={songDuration}
                  onChange={(e) => setSongDuration(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSongModal(false)}>Cancelar</Button>
            <Button onClick={saveSong}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
