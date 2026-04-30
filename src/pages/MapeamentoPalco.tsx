import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin, Calendar, Trash2, Copy, FileText, Music, Layers } from "lucide-react";
import { useStageMappings, StageMapping } from "@/hooks/useStageMappings";
import { StageMappingEditor } from "@/components/stage-mapping/StageMappingEditor";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function MapeamentoPalco() {
  const { mappings, loading, addMapping, updateMapping, deleteMapping } = useStageMappings();

  const [selectedMapping, setSelectedMapping] = useState<StageMapping | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mappingToDelete, setMappingToDelete] = useState<string | null>(null);

  // Sincroniza o selectedMapping com os dados mais recentes
  useEffect(() => {
    if (selectedMapping) {
      const updatedMapping = mappings.find((m) => m.id === selectedMapping.id);

      if (updatedMapping) {
        setSelectedMapping(updatedMapping);
      }
    }
  }, [mappings]);

  const handleCreateMapping = async () => {
    const newMapping = await addMapping({ name: "Novo Mapeamento" });
    if (newMapping) setSelectedMapping(newMapping);
  };

  const handleDuplicate = async (mapping: StageMapping) => {
    if (mappings.length >= 3) {
      toast.error("Limite de 3 mapeamentos atingido.");
      return;
    }

    const newMapping = await addMapping({
      name: `${mapping.name} (cópia)`,
      artist_name: mapping.artist_name,
      event_name: mapping.event_name,
      event_date: mapping.event_date,
      event_location: mapping.event_location,
      technical_contact: mapping.technical_contact,
      technical_phone: mapping.technical_phone,
      stage_layout: mapping.stage_layout,
      input_list: mapping.input_list,
      materials_checklist: mapping.materials_checklist,
      observations: mapping.observations,
    });

    if (newMapping) setSelectedMapping(newMapping);
  };

  const handleSaveMapping = async (updates: Partial<StageMapping>) => {
    if (selectedMapping) {
      const updated = await updateMapping(selectedMapping.id, updates);

      if (updated) {
        setSelectedMapping(updated);
      }
    }
  };

  const handleDeleteMapping = async () => {
    if (mappingToDelete) {
      await deleteMapping(mappingToDelete);
      setMappingToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const confirmDelete = (id: string) => {
    setMappingToDelete(id);
    setDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <Layout title="Mapeamento de Palco" subtitle="Organize sua estrutura técnica">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (selectedMapping) {
    return (
      <Layout title="Mapeamento de Palco" subtitle="Rider Técnico">
        <StageMappingEditor
          mapping={selectedMapping}
          onSave={handleSaveMapping}
          onBack={() => setSelectedMapping(null)}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Mapeamento de Palco" subtitle="Organize sua estrutura técnica para cada show">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs font-medium">
              {mappings.length}/3 mapeamentos
            </Badge>
          </div>

          <Button onClick={handleCreateMapping} disabled={mappings.length >= 3} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Mapeamento
          </Button>
        </div>

        {mappings.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-5">
                  <Layers className="w-10 h-10 text-primary/40" />
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum mapeamento de palco</h3>

                <p className="text-muted-foreground max-w-lg mb-6 text-sm leading-relaxed">
                  Crie seu rider técnico profissional com mapeamento de palco visual, input list automática e checklist
                  de materiais.
                </p>

                <Button onClick={handleCreateMapping} size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Criar Primeiro Mapeamento
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mappings.map((mapping) => (
              <Card
                key={mapping.id}
                className="group hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => {
                  const freshMapping = mappings.find((m) => m.id === mapping.id);
                  setSelectedMapping(freshMapping || mapping);
                }}
              >
                <div className="h-1.5 w-full" style={{ background: "var(--gradient-primary)" }} />

                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>

                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{mapping.name}</CardTitle>

                        {mapping.artist_name && (
                          <p className="text-sm text-muted-foreground truncate">{mapping.artist_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(mapping);
                        }}
                        title="Duplicar"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(mapping.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {mapping.event_name && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{mapping.event_name}</span>
                      </div>
                    )}

                    {mapping.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {(() => {
                            const m = mapping.event_date?.match(/^(\d{4})-(\d{2})-(\d{2})/);
                            if (m) {
                              return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).toLocaleDateString("pt-BR");
                            }
                            return new Date(mapping.event_date).toLocaleDateString("pt-BR");
                          })()}
                        </span>
                      </div>
                    )}

                    {mapping.event_location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{mapping.event_location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-3 border-t mt-3">
                      <Badge variant="secondary" className="text-[11px]">
                        <Music className="w-3 h-3 mr-1" />
                        {mapping.input_list.length} canais
                      </Badge>

                      <Badge variant="secondary" className="text-[11px]">
                        <Layers className="w-3 h-3 mr-1" />
                        {mapping.stage_layout.length} elementos
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Mapeamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este mapeamento de palco? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMapping} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
