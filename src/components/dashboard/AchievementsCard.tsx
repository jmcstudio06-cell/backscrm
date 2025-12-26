import { useState } from "react";
import { 
  Trophy, Star, Zap, Target, TrendingUp, Users, 
  Calendar, DollarSign, Award, Crown, Flame, Medal,
  ChevronRight, Lock, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  shadowColor: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
  category: "shows" | "revenue" | "leads" | "engagement";
}

interface AchievementsCardProps {
  showsTotal: number;
  leadsTotal: number;
  revenueTotal: number;
  loginStreak?: number;
}

export function AchievementsCard({
  showsTotal,
  leadsTotal,
  revenueTotal,
  loginStreak = 0,
}: AchievementsCardProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const achievements: Achievement[] = [
    // Shows achievements
    {
      id: "first_show",
      name: "Primeiro Palco",
      description: "Realize seu primeiro show",
      icon: Star,
      gradient: "from-amber-400 to-yellow-500",
      shadowColor: "shadow-amber-500/30",
      unlocked: showsTotal >= 1,
      progress: Math.min(showsTotal, 1),
      maxProgress: 1,
      category: "shows",
    },
    {
      id: "shows_10",
      name: "Artista em Ascensão",
      description: "Realize 10 shows",
      icon: Zap,
      gradient: "from-violet-500 to-purple-600",
      shadowColor: "shadow-violet-500/30",
      unlocked: showsTotal >= 10,
      progress: Math.min(showsTotal, 10),
      maxProgress: 10,
      category: "shows",
    },
    {
      id: "shows_50",
      name: "Veterano dos Palcos",
      description: "Realize 50 shows",
      icon: Crown,
      gradient: "from-rose-500 to-pink-600",
      shadowColor: "shadow-rose-500/30",
      unlocked: showsTotal >= 50,
      progress: Math.min(showsTotal, 50),
      maxProgress: 50,
      category: "shows",
    },
    // Revenue achievements
    {
      id: "revenue_1k",
      name: "Primeira Conquista",
      description: "Fature R$ 1.000 em shows",
      icon: DollarSign,
      gradient: "from-emerald-400 to-green-500",
      shadowColor: "shadow-emerald-500/30",
      unlocked: revenueTotal >= 1000,
      progress: Math.min(revenueTotal, 1000),
      maxProgress: 1000,
      category: "revenue",
    },
    {
      id: "revenue_10k",
      name: "Profissional",
      description: "Fature R$ 10.000 em shows",
      icon: TrendingUp,
      gradient: "from-cyan-500 to-blue-600",
      shadowColor: "shadow-cyan-500/30",
      unlocked: revenueTotal >= 10000,
      progress: Math.min(revenueTotal, 10000),
      maxProgress: 10000,
      category: "revenue",
    },
    {
      id: "revenue_50k",
      name: "Estrela",
      description: "Fature R$ 50.000 em shows",
      icon: Award,
      gradient: "from-orange-500 to-red-600",
      shadowColor: "shadow-orange-500/30",
      unlocked: revenueTotal >= 50000,
      progress: Math.min(revenueTotal, 50000),
      maxProgress: 50000,
      category: "revenue",
    },
    // Leads achievements
    {
      id: "leads_5",
      name: "Networking",
      description: "Feche 5 leads",
      icon: Users,
      gradient: "from-sky-400 to-blue-500",
      shadowColor: "shadow-sky-500/30",
      unlocked: leadsTotal >= 5,
      progress: Math.min(leadsTotal, 5),
      maxProgress: 5,
      category: "leads",
    },
    {
      id: "leads_25",
      name: "Conectado",
      description: "Feche 25 leads",
      icon: Target,
      gradient: "from-fuchsia-500 to-purple-600",
      shadowColor: "shadow-fuchsia-500/30",
      unlocked: leadsTotal >= 25,
      progress: Math.min(leadsTotal, 25),
      maxProgress: 25,
      category: "leads",
    },
    // Engagement achievements
    {
      id: "streak_7",
      name: "Consistente",
      description: "Acesse o app por 7 dias seguidos",
      icon: Flame,
      gradient: "from-red-500 to-orange-600",
      shadowColor: "shadow-red-500/30",
      unlocked: loginStreak >= 7,
      progress: Math.min(loginStreak, 7),
      maxProgress: 7,
      category: "engagement",
    },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalAchievements = achievements.length;

  const displayAchievements = achievements.slice(0, 6);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-xl">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 shadow-lg shadow-amber-500/30">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Conquistas</h3>
                <p className="text-xs text-slate-400">
                  {unlockedCount} de {totalAchievements} desbloqueadas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">{unlockedCount}</span>
            </div>
          </div>

          {/* Achievement grid */}
          <div className="grid grid-cols-3 gap-3">
            {displayAchievements.map((achievement) => {
              const Icon = achievement.icon;
              const progress = achievement.progress || 0;
              const maxProgress = achievement.maxProgress || 1;
              const progressPercent = Math.round((progress / maxProgress) * 100);

              return (
                <button
                  key={achievement.id}
                  onClick={() => setSelectedAchievement(achievement)}
                  className={cn(
                    "relative group flex flex-col items-center p-3 rounded-xl transition-all duration-300",
                    achievement.unlocked
                      ? "bg-slate-800/80 hover:bg-slate-700/80 cursor-pointer"
                      : "bg-slate-800/30 cursor-pointer opacity-60 hover:opacity-80"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                      achievement.unlocked
                        ? `bg-gradient-to-br ${achievement.gradient} shadow-lg ${achievement.shadowColor}`
                        : "bg-slate-700"
                    )}
                  >
                    {achievement.unlocked ? (
                      <Icon className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] mt-2 text-center font-medium line-clamp-2",
                      achievement.unlocked ? "text-white" : "text-slate-500"
                    )}
                  >
                    {achievement.name}
                  </span>
                  {!achievement.unlocked && (
                    <span className="text-[9px] text-slate-600 mt-0.5">
                      {progressPercent}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* View all button */}
          {achievements.length > 6 && (
            <button className="w-full mt-4 flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-white transition-colors py-2">
              Ver todas as conquistas
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Achievement Detail Modal */}
      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-white max-w-sm">
          {selectedAchievement && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center shadow-lg",
                      selectedAchievement.unlocked
                        ? `bg-gradient-to-br ${selectedAchievement.gradient} ${selectedAchievement.shadowColor}`
                        : "bg-slate-700"
                    )}
                  >
                    {selectedAchievement.unlocked ? (
                      <selectedAchievement.icon className="w-7 h-7 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{selectedAchievement.name}</h3>
                    <p className="text-sm text-slate-400 font-normal">
                      {selectedAchievement.description}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Progresso</span>
                  <span className="text-white font-medium">
                    {selectedAchievement.progress?.toLocaleString("pt-BR")} / {selectedAchievement.maxProgress?.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r transition-all duration-500",
                      selectedAchievement.gradient
                    )}
                    style={{
                      width: `${Math.round(((selectedAchievement.progress || 0) / (selectedAchievement.maxProgress || 1)) * 100)}%`,
                    }}
                  />
                </div>
                {selectedAchievement.unlocked && (
                  <div className="flex items-center justify-center gap-2 mt-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                    <Medal className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">Conquista Desbloqueada!</span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
