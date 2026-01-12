import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useBonuses, type Bonus as BonusType, type BonusWithProgress } from "@/hooks/useBonuses";
import { BonusCard } from "@/components/bonus/BonusCard";
import { BonusContentModal } from "@/components/bonus/BonusContentModal";
import { BonusAdminModal } from "@/components/bonus/BonusAdminModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Plus, 
  Settings, 
  Trophy, 
  Target, 
  Gift,
  Sparkles,
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff
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
  const { bonuses, loading, completeBonus, createBonus, updateBonus, deleteBonus, reorderBonuses } = useBonuses();
  
  const [selectedBonus, setSelectedBonus] = useState<BonusWithProgress | null>(null);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<BonusType | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bonusToDelete, setBonusToDelete] = useState<string | null>(null);
  const [adminMode, setAdminMode] = useState(false);

  const completedCount = bonuses.filter(b => b.status === "completed").length;
  const totalCount = bonuses.filter(b => b.is_active).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = bonuses.map((b, i) => ({
      id: b.id,
      sort_order: i === index ? index - 1 : i === index - 1 ? index : i
    }));
    reorderBonuses(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === bonuses.length - 1) return;
    const newOrder = bonuses.map((b, i) => ({
      id: b.id,
      sort_order: i === index ? index + 1 : i === index + 1 ? index : i
    }));
    reorderBonuses(newOrder);
  };

  return (
    <Layout title="Bônus">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-7 h-7 text-primary" />
              Bônus
            </h1>
            <p className="text-muted-foreground">
              Sua trilha de evolução profissional
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
                  Novo Bônus
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Progress Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                    className="text-primary transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{progressPercent}%</span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-semibold mb-1">Sua Jornada</h3>
                <p className="text-muted-foreground">
                  {completedCount} de {totalCount} bônus concluídos
                </p>
              </div>

              <div className="flex gap-4 text-center">
                <div className="p-4 rounded-lg bg-card">
                  <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{completedCount}</div>
                  <div className="text-xs text-muted-foreground">Concluídos</div>
                </div>
                <div className="p-4 rounded-lg bg-card">
                  <Gift className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                  <div className="text-2xl font-bold">
                    {bonuses.filter(b => b.status === "completed" && b.reward_title).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Recompensas</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bonus Trail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Trilha de Bônus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : bonuses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum bônus disponível ainda</p>
                {isAdmin && (
                  <Button className="mt-4" onClick={handleNewBonus}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeiro bônus
                  </Button>
                )}
              </div>
            ) : adminMode ? (
              // Admin list view
              <div className="space-y-2">
                {bonuses.map((bonus, index) => (
                  <div
                    key={bonus.id}
                    className={`
                      flex items-center gap-4 p-4 rounded-lg border
                      ${bonus.is_active ? "bg-card" : "bg-muted/30 opacity-60"}
                    `}
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <GripVertical className="w-4 h-4 rotate-90" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === bonuses.length - 1}
                      >
                        <GripVertical className="w-4 h-4 rotate-90" />
                      </Button>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{bonus.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {bonus.content_type} • {bonus.unlock_delay_hours}h delay
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
              // User journey view
              <div className="relative space-y-6 pl-4">
                {/* Vertical line */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted" />

                {bonuses.filter(b => b.is_active).map((bonus, index) => (
                  <BonusCard
                    key={bonus.id}
                    bonus={bonus}
                    index={index}
                    onComplete={completeBonus}
                    onView={handleViewBonus}
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
            <AlertDialogTitle>Remover bônus?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O progresso dos usuários neste bônus será perdido.
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
