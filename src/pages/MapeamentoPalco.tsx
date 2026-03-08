import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Trash2,
  Edit,
  FileText
} from "lucide-react";
import { useStageMappings, StageMapping } from "@/hooks/useStageMappings";
import { StageMappingEditor } from "@/components/stage-mapping/StageMappingEditor";
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

export default function MapeamentoPalco() {
  const { mappings, loading, addMapping, updateMapping, deleteMapping } = useStageMappings();
  const [selectedMapping, setSelectedMapping] = useState<StageMapping | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mappingToDelete, setMappingToDelete] = useState<string | null>(null);

  const handleCreateMapping = async () => {
    const newMapping = await addMapping({
      name: "Novo Mapeamento",
    });
    if (newMapping) {
      setSelectedMapping(newMapping);
    }
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
          <p className="text-sm text-muted-foreground">{mappings.length}/3 mapeamentos</p>
          <Button onClick={handleCreateMapping} disabled={mappings.length >= 3}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Mapeamento
          </Button>
        </div>

        {mappings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4">
                  <MapPin className="w-8 h-8 text-primary/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum mapeamento de palco
                </h3>
                <p className="text-muted-foreground max-w-md mb-6 text-sm">
                  Crie seu primeiro mapeamento de palco para organizar a estrutura técnica 
                  do seu show e gerar riders profissionais.
                </p>
                <Button onClick={handleCreateMapping}>
                  <Plus className="w-4 h-4 mr-2" />
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
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedMapping(mapping)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{mapping.name}</CardTitle>
                        {mapping.artist_name && (
                          <p className="text-sm text-muted-foreground">{mapping.artist_name}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDelete(mapping.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {mapping.event_name && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>{mapping.event_name}</span>
                      </div>
                    )}
                    {mapping.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(mapping.event_date).toLocaleDateString("pt-BR")}</span>
                      </div>
                    )}
                    {mapping.event_location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{mapping.event_location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 pt-2 border-t mt-3">
                      <span className="text-xs">
                        {mapping.input_list.length} canais
                      </span>
                      <span className="text-xs">
                        {mapping.stage_layout.length} elementos
                      </span>
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
