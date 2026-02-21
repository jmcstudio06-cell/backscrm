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
  Printer,
  Flag,
  Sparkles,
  Check,
  Edit2,
  Trash2,
  Star,
  Users,
  PartyPopper,
  Loader2,
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
import { useRepertoire, Block } from "@/hooks/useRepertoire";

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

export default function Repertorio() {
  const {
    blocks,
    loading,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    addSong,
    updateSong,
    editSongDetails,
    reorderSongs,
    setMainSong,
    deleteSong,
  } = useRepertoire();

  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showSongModal, setShowSongModal] = useState(false);
  const [showEditSongModal, setShowEditSongModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingSongId, setEditingSongId] = useState<string | null>(null);

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
  const mainBlocks = blocks.filter((b) => b.name !== "Coringa").length;
  const totalDuration = blocks
    .filter((b) => b.duration !== "Reserva")
    .reduce((acc, b) => {
      const match = b.duration.match(/(\d+)/);
      return acc + (match ? parseInt(match[1]) : 0);
    }, 0);
  const checkedSongs = blocks.reduce(
    (acc, b) =>
      acc + b.songs.filter((s) => s.checked && s.keyOk && s.chordsReviewed).length,
    0
  );

  const toggleBlockExpand = (blockId: string) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(blockId)) {
      newExpanded.delete(blockId);
    } else {
      newExpanded.add(blockId);
    }
    setExpandedBlocks(newExpanded);
  };

  const handleToggleSongCheck = (
    blockId: string,
    songId: string,
    field: "checked" | "keyOk" | "chordsReviewed"
  ) => {
    const block = blocks.find((b) => b.id === blockId);
    const song = block?.songs.find((s) => s.id === songId);
    if (song) {
      updateSong(blockId, songId, { [field]: !song[field] });
    }
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

  const handleSaveBlock = async () => {
    if (!blockName.trim()) return;

    if (editingBlock) {
      await updateBlock(editingBlock.id, blockName, blockClimate, blockObjective, blockDuration);
    } else {
      const newBlock = await addBlock(blockName, blockClimate, blockObjective, blockDuration || "20min");
      if (newBlock) {
        setExpandedBlocks(new Set([...expandedBlocks, newBlock.id]));
      }
    }
    setShowBlockModal(false);
  };

  const handleDeleteBlock = async (blockId: string) => {
    await deleteBlock(blockId);
  };

  const openAddSongModal = (blockId: string) => {
    setSelectedBlockId(blockId);
    setSongTitle("");
    setSongArtist("");
    setSongKey("");
    setSongDuration("");
    setShowSongModal(true);
  };

  const handleSaveSong = async () => {
    if (!songTitle.trim() || !selectedBlockId) return;
    await addSong(selectedBlockId, songTitle, songArtist, songKey, songDuration || "3:30");
    setShowSongModal(false);
  };

  const handleDeleteSong = async (blockId: string, songId: string) => {
    await deleteSong(blockId, songId);
  };

  const openEditSongModal = (blockId: string, songId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    const song = block?.songs.find((s) => s.id === songId);
    if (!song) return;
    setSelectedBlockId(blockId);
    setEditingSongId(songId);
    setSongTitle(song.title);
    setSongArtist(song.artist);
    setSongKey(song.key);
    setSongDuration(song.duration);
    setShowEditSongModal(true);
  };

  const handleEditSong = async () => {
    if (!songTitle.trim() || !selectedBlockId || !editingSongId) return;
    await editSongDetails(selectedBlockId, editingSongId, songTitle, songArtist, songKey, songDuration);
    setShowEditSongModal(false);
  };

  const moveSong = (blockId: string, songIndex: number, direction: "up" | "down") => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const newIndex = direction === "up" ? songIndex - 1 : songIndex + 1;
    if (newIndex < 0 || newIndex >= block.songs.length) return;
    const newSongs = [...block.songs];
    [newSongs[songIndex], newSongs[newIndex]] = [newSongs[newIndex], newSongs[songIndex]];
    reorderSongs(blockId, newSongs);
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newBlocks = [...blocks];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    reorderBlocks(newBlocks);
  };

  const printBlock = (block: Block) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const songsHtml = block.songs
      .map(
        (song, index) => `
        <tr style="${song.isMain ? "background-color: #f0f9ff; font-weight: bold;" : ""}">
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
            ${song.title}${song.isMain ? " ⭐" : ""}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${song.artist}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${song.key}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${song.duration}</td>
        </tr>
      `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bloco: ${block.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #1f2937; }
          h1 { margin-bottom: 5px; }
          .info { color: #6b7280; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f3f4f6; text-align: left; padding: 10px 8px; border-bottom: 2px solid #e5e7eb; }
          .legend { margin-top: 20px; font-size: 12px; color: #6b7280; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>🎵 ${block.name}</h1>
        <p class="info">
          Clima: ${climateLabels[block.climate]} | 
          Objetivo: ${objectiveLabels[block.objective]} | 
          Duração: ${block.duration} | 
          ${block.songs.length} músicas
        </p>
        
        <table>
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Música</th>
              <th>Artista</th>
              <th style="width: 60px; text-align: center;">Tom</th>
              <th style="width: 70px; text-align: center;">Duração</th>
            </tr>
          </thead>
          <tbody>
            ${songsHtml}
          </tbody>
        </table>
        
        <p class="legend">⭐ = Música principal do bloco</p>
        
        <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer;">
          Imprimir
        </button>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <Layout title="Repertório" subtitle="Planejamento de blocos para o show">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

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
              <p className="text-2xl font-bold text-foreground">
                {checkedSongs}/{totalSongs}
              </p>
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

              {blocks.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Ordem dos Blocos</p>
                  {blocks
                    .filter((b) => b.name !== "Coringa")
                    .map((block, index) => {
                      const ClimateIcon = climateIcons[block.climate];
                      return (
                        <div
                          key={block.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30"
                        >
                          <span className="text-xs font-medium text-muted-foreground w-5">
                            {index + 1}.
                          </span>
                          <div
                            className={cn(
                              "w-6 h-6 rounded flex items-center justify-center",
                              climateColors[block.climate]
                            )}
                          >
                            <ClimateIcon className="w-3 h-3" />
                          </div>
                          <span className="text-sm font-medium text-foreground flex-1">
                            {block.name}
                          </span>
                          <span className="text-xs text-muted-foreground">{block.duration}</span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Crie seu primeiro bloco para começar
                </p>
              )}

              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Legenda de Clima</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(climateLabels).map(([key, label]) => {
                    const Icon = climateIcons[key as Block["climate"]];
                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded text-xs",
                          climateColors[key as Block["climate"]]
                        )}
                      >
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
                <Badge variant={checkedSongs === totalSongs && totalSongs > 0 ? "default" : "secondary"}>
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

          {blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed border-muted-foreground/30 bg-secondary/10">
              <ListMusic className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum bloco criado
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
                Organize seu show em blocos como Abertura, Animado, Romântico, Final e
                Coringa. Cada bloco pode ter várias músicas.
              </p>
              <Button variant="gradient" onClick={openNewBlockModal}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Bloco
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {blocks.map((block, index) => {
                const ClimateIcon = climateIcons[block.climate];
                const ObjectiveIcon = objectiveIcons[block.objective];
                const mainSong = block.songs.find((s) => s.isMain);
                const allChecked =
                  block.songs.length > 0 &&
                  block.songs.every((s) => s.checked && s.keyOk && s.chordsReviewed);
                const isExpanded = expandedBlocks.has(block.id);

                return (
                  <Collapsible
                    key={block.id}
                    open={isExpanded}
                    onOpenChange={() => toggleBlockExpand(block.id)}
                  >
                    <div
                      className={cn(
                        "rounded-xl border transition-all",
                        block.name === "Coringa"
                          ? "border-dashed border-muted-foreground/30 bg-secondary/20"
                          : "border-border bg-card"
                      )}
                    >
                      {/* Block Header */}
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 transition-colors rounded-t-xl">
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(index, "up");
                              }}
                              disabled={index === 0}
                            >
                              <ChevronUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(index, "down");
                              }}
                              disabled={index === blocks.length - 1}
                            >
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </div>

                          <GripVertical className="w-4 h-4 text-muted-foreground" />

                          <div
                            className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              climateColors[block.climate]
                            )}
                          >
                            <ClimateIcon className="w-5 h-5" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground">{block.name}</h3>
                              {allChecked && (
                                <Badge
                                  variant="outline"
                                  className="text-success border-success/30 bg-success/10"
                                >
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

                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => printBlock(block)}
                              title="Imprimir bloco"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditBlockModal(block)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBlock(block.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>

                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </CollapsibleTrigger>

                      {/* Block Songs */}
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-2">
                          {block.songs.map((song, songIndex) => (
                            <div
                              key={song.id}
                              className={cn(
                                "flex items-center gap-2 sm:gap-3 p-3 rounded-lg transition-all",
                                song.isMain
                                  ? "bg-primary/10 border border-primary/20"
                                  : "bg-secondary/50 hover:bg-secondary"
                              )}
                            >
                              <div className="flex flex-col gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => moveSong(block.id, songIndex, "up")}
                                  disabled={songIndex === 0}
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => moveSong(block.id, songIndex, "down")}
                                  disabled={songIndex === block.songs.length - 1}
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </Button>
                              </div>

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
                                  {song.isMain && (
                                    <span className="text-primary ml-2 text-xs">(Principal)</span>
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground">{song.artist}</p>
                              </div>

                              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                                <span>Tom: {song.key}</span>
                                <span>•</span>
                                <span>{song.duration}</span>
                              </div>

                              <div className="hidden sm:flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-1">
                                  <Checkbox
                                    id={`${song.id}-checked`}
                                    checked={song.checked}
                                    onCheckedChange={() =>
                                      handleToggleSongCheck(block.id, song.id, "checked")
                                    }
                                  />
                                  <Label htmlFor={`${song.id}-checked`} className="text-xs">
                                    ✔
                                  </Label>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Checkbox
                                    id={`${song.id}-key`}
                                    checked={song.keyOk}
                                    onCheckedChange={() =>
                                      handleToggleSongCheck(block.id, song.id, "keyOk")
                                    }
                                  />
                                  <Label htmlFor={`${song.id}-key`} className="text-xs">
                                    Tom
                                  </Label>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Checkbox
                                    id={`${song.id}-chords`}
                                    checked={song.chordsReviewed}
                                    onCheckedChange={() =>
                                      handleToggleSongCheck(block.id, song.id, "chordsReviewed")
                                    }
                                  />
                                  <Label htmlFor={`${song.id}-chords`} className="text-xs">
                                    Cifra
                                  </Label>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditSongModal(block.id, song.id)}
                                title="Editar música"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteSong(block.id, song.id)}
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
          )}
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
                <Select
                  value={blockClimate}
                  onValueChange={(v) => setBlockClimate(v as Block["climate"])}
                >
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
                <Select
                  value={blockObjective}
                  onValueChange={(v) => setBlockObjective(v as Block["objective"])}
                >
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
            <Button variant="outline" onClick={() => setShowBlockModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveBlock}>Salvar</Button>
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
            <Button variant="outline" onClick={() => setShowSongModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveSong}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal Editar Música */}
      <Dialog open={showEditSongModal} onOpenChange={setShowEditSongModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Música</DialogTitle>
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
            <Button variant="outline" onClick={() => setShowEditSongModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSong}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
