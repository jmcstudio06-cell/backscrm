import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useBonuses, type Bonus as BonusType, type BonusWithProgress } from "@/hooks/useBonuses";
import { PrizeTimelineCard } from "@/components/bonus/PrizeTimelineCard";
import { BonusContentModal } from "@/components/bonus/BonusContentModal";
import { BonusAdminModal } from "@/components/bonus/BonusAdminModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Settings, 
  Trophy, 
  Gift,
  Sparkles,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Rocket
} from "lucide-react";
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

export default function BonusPage() {
  useRequireAuth();
  const { isAdmin } = useAdmin();
  const { bonuses, loading, completeBonus, createBonus, updateBonus, deleteBonus } = useBonuses();
  
  const [selectedBonus, setSelectedBonus] = useState<BonusWithProgress | null>(null);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<BonusType | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bonusToDelete, setBonusToDelete] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false);

  const activeBonuses = bonuses.filter(b => b.is_active);
  const completedCount = activeBonuses.filter(b => b.status === "completed").length;
  const availableCount = activeBonuses.filter(b => b.status === "available").length;
  const totalCount = activeBonuses.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Get next available prize
  const nextPrize = activeBonuses.find(b => b.status === "available" && !b.progress?.completed_at);

  const handleViewBonus = (bonus: BonusWithProgress) => {
    setSelectedBonus(bonus);
    setContentModalOpen(true);
  };

  const handleEditBonus = (bonus: BonusType) => {
    setEditingBonus(bonus);
    setAdminModalOpen(true);
  };

  const handleNewBonus = () => {
    setEditingBonus(null);
    setAdminModalOpen(true);
  };

  const handleSaveBonus = (data: Partial<BonusType>) => {
    if (editingBonus) {
      updateBonus(editingBonus.id, data);
    } else {
      createBonus(data);
    }
  };

  const handleDeleteBonus = (id: string) => {
    setBonusToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (bonusToDelete) {
      deleteBonus(bonusToDelete);
      setBonusToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleToggleActive = (bonus: BonusType) => {
    updateBonus(bonus.id, { is_active: !bonus.is_active });
  };

  return (
    <Layout title="Trajetória de Prêmios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-500" />
              Trajetória de Prêmios
            </h1>
            <p className="text-muted-foreground">
              Prêmios exclusivos que você desbloqueia ao longo da sua jornada
            </p>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant={adminMode ? "default" : "outline"}
                onClick={() => setAdminMode(!adminMode)}
              >
                <Settings className="w-4 h-4 mr-2" />
                {adminMode ? "Sair do modo admin" : "Gerenciar"}
              </Button>
              {adminMode && (
                <Button onClick={handleNewBonus}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Prêmio
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30">
            <CardContent className="py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Gift className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prêmios Resgatados</p>
                <p className="text-2xl font-bold">{completedCount} <span className="text-sm font-normal text-muted-foreground">/ {totalCount}</span></p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30">
            <CardContent className="py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disponíveis Agora</p>
                <p className="text-2xl font-bold">{availableCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
            <CardContent className="py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className="text-2xl font-bold">{progressPercent}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Prize Alert */}
        {nextPrize && (
          <Card className="bg-gradient-to-r from-primary/10 via-amber-500/10 to-primary/10 border-primary/30 animate-pulse-slow">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Prêmio disponível para resgate!</p>
                  <p className="font-semibold">{nextPrize.title}</p>
                </div>
                <Button onClick={() => handleViewBonus(nextPrize)}>
                  Resgatar agora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prize Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Linha do Tempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : activeBonuses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum prêmio disponível ainda</p>
                {isAdmin && (
                  <Button className="mt-4" onClick={handleNewBonus}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeiro prêmio
                  </Button>
                )}
              </div>
            ) : adminMode ? (
              // Admin list view
              <div className="space-y-2">
                {bonuses.map((bonus) => (
                  <div
                    key={bonus.id}
                    className={`
                      flex items-center gap-4 p-4 rounded-lg border
                      ${bonus.is_active ? "bg-card" : "bg-muted/30 opacity-60"}
                    `}
                  >
                    <Badge variant="outline" className="shrink-0">
                      {bonus.timeLabel}
                    </Badge>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{bonus.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {bonus.content_type} • {bonus.unlock_after_hours}h após cadastro
                        {bonus.reward_title && " • Com recompensa"}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(bonus)}
                        title={bonus.is_active ? "Desativar" : "Ativar"}
                      >
                        {bonus.is_active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditBonus(bonus)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteBonus(bonus.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // User timeline view
              <div className="py-4">
                {activeBonuses.map((bonus, index) => (
                  <PrizeTimelineCard
                    key={bonus.id}
                    bonus={bonus}
                    onComplete={completeBonus}
                    onView={handleViewBonus}
                    isLast={index === activeBonuses.length - 1}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <BonusContentModal
        bonus={selectedBonus}
        open={contentModalOpen}
        onOpenChange={setContentModalOpen}
        onComplete={completeBonus}
      />

      <BonusAdminModal
        bonus={editingBonus}
        open={adminModalOpen}
        onOpenChange={setAdminModalOpen}
        onSave={handleSaveBonus}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover prêmio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O progresso dos usuários neste prêmio será perdido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
