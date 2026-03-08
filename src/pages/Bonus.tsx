import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useBonuses, type Bonus as BonusType, type BonusWithProgress } from "@/hooks/useBonuses";
import { PrizeTimelineCard } from "@/components/bonus/PrizeTimelineCard";
import { BonusContentModal } from "@/components/bonus/BonusContentModal";
import { BonusAdminModal } from "@/components/bonus/BonusAdminModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Rocket,
  ChevronRight,
  Star,
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
    <Layout title="Trajetória de Prêmios" subtitle="Prêmios exclusivos que você desbloqueia ao longo da sua jornada">
      <div className="space-y-8">

        {/* Admin controls */}
        {isAdmin && (
          <div className="flex justify-end gap-2">
            <Button
              variant={adminMode ? "default" : "outline"}
              size="sm"
              onClick={() => setAdminMode(!adminMode)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {adminMode ? "Sair do modo admin" : "Gerenciar"}
            </Button>
            {adminMode && (
              <Button size="sm" onClick={handleNewBonus}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Prêmio
              </Button>
            )}
          </div>
        )}

        {/* Hero Progress Card */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-card p-6 sm:p-8">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Sua Jornada</h2>
                  <p className="text-sm text-muted-foreground">
                    {completedCount === totalCount && totalCount > 0
                      ? "Parabéns! Você resgatou todos os prêmios!"
                      : `${completedCount} de ${totalCount} prêmios resgatados`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{progressPercent}%</p>
                <p className="text-xs text-muted-foreground">completo</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <Progress value={progressPercent} className="h-3 bg-muted/50" />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">Início</span>
                <span className="text-xs text-muted-foreground">Todos os prêmios</span>
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-2xl bg-muted/30 border border-border/30">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">{completedCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Resgatados</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-muted/30 border border-border/30">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">{availableCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Disponíveis</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-muted/30 border border-border/30">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xl font-bold text-foreground">{totalCount - completedCount - availableCount}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Bloqueados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Prize CTA */}
        {nextPrize && (
          <div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-primary/20 p-5 cursor-pointer hover:shadow-elevated transition-all duration-300 group"
            onClick={() => handleViewBonus(nextPrize)}
          >
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-colors" />
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg flex-shrink-0 animate-pulse">
                <Star className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-0.5">Prêmio disponível</p>
                <p className="font-bold text-foreground truncate">{nextPrize.title}</p>
                {nextPrize.description && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{nextPrize.description}</p>
                )}
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90 flex-shrink-0">
                Resgatar
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-card">
          <div className="px-6 py-5 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Linha do Tempo</h3>
                <p className="text-xs text-muted-foreground">Seus prêmios ao longo da jornada</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : activeBonuses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-9 h-9 text-muted-foreground/40" />
                </div>
                <p className="text-lg font-semibold text-foreground mb-1">Nenhum prêmio ainda</p>
                <p className="text-sm text-muted-foreground">Os prêmios aparecerão aqui conforme sua jornada avança</p>
                {isAdmin && (
                  <Button className="mt-6" onClick={handleNewBonus}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeiro prêmio
                  </Button>
                )}
              </div>
            ) : adminMode ? (
              <div className="space-y-2">
                {bonuses.map((bonus) => (
                  <div
                    key={bonus.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      bonus.is_active ? "bg-card border-border/50" : "bg-muted/30 opacity-60 border-border/30"
                    }`}
                  >
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {bonus.timeLabel}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-foreground">{bonus.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {bonus.content_type} · {bonus.unlock_after_hours}h após cadastro
                        {bonus.reward_title && " · Com recompensa"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleActive(bonus)}>
                        {bonus.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditBonus(bonus)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteBonus(bonus.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-2">
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
          </div>
        </div>
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
