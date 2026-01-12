import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Bonus {
  id: string;
  title: string;
  description: string | null;
  content_type: "video" | "link" | "download" | "lesson";
  content_url: string | null;
  thumbnail: string | null;
  completion_rule: "click" | "watch_50" | "watch_100" | "download";
  unlock_delay_hours: number;
  sort_order: number;
  is_active: boolean;
  reward_title: string | null;
  reward_description: string | null;
  reward_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserBonusProgress {
  id: string;
  user_id: string;
  bonus_id: string;
  completed_at: string | null;
  unlocked_at: string;
  created_at: string;
}

export interface BonusWithProgress extends Bonus {
  progress: UserBonusProgress | null;
  status: "locked" | "available" | "completed";
  unlockTime: Date | null;
}

export function useBonuses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bonuses, setBonuses] = useState<BonusWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBonuses = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all bonuses
      const { data: bonusesData, error: bonusesError } = await supabase
        .from("bonuses")
        .select("*")
        .order("sort_order", { ascending: true });

      if (bonusesError) throw bonusesError;

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_bonus_progress")
        .select("*")
        .eq("user_id", user.id);

      if (progressError) throw progressError;

      // Combine bonuses with progress
      const bonusesWithProgress: BonusWithProgress[] = (bonusesData || []).map((bonus, index) => {
        const progress = progressData?.find(p => p.bonus_id === bonus.id) || null;
        
        // Determine status
        let status: "locked" | "available" | "completed" = "locked";
        let unlockTime: Date | null = null;

        if (progress?.completed_at) {
          status = "completed";
        } else if (index === 0) {
          // First bonus is always available
          status = "available";
        } else {
          // Check if previous bonus is completed
          const prevBonus = bonusesData[index - 1];
          const prevProgress = progressData?.find(p => p.bonus_id === prevBonus.id);
          
          if (prevProgress?.completed_at) {
            const completedAt = new Date(prevProgress.completed_at);
            const unlockAt = new Date(completedAt.getTime() + (prevBonus.unlock_delay_hours * 60 * 60 * 1000));
            
            if (new Date() >= unlockAt) {
              status = "available";
            } else {
              status = "locked";
              unlockTime = unlockAt;
            }
          }
        }

        return {
          ...bonus,
          content_type: bonus.content_type as BonusWithProgress["content_type"],
          completion_rule: bonus.completion_rule as BonusWithProgress["completion_rule"],
          progress,
          status,
          unlockTime
        };
      });

      setBonuses(bonusesWithProgress);
    } catch (error) {
      console.error("Error fetching bonuses:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeBonus = async (bonusId: string) => {
    if (!user) return;

    try {
      // Check if progress exists
      const { data: existing } = await supabase
        .from("user_bonus_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("bonus_id", bonusId)
        .single();

      if (existing) {
        // Update existing progress
        const { error } = await supabase
          .from("user_bonus_progress")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new progress
        const { error } = await supabase
          .from("user_bonus_progress")
          .insert({
            user_id: user.id,
            bonus_id: bonusId,
            completed_at: new Date().toISOString(),
            unlocked_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      const bonus = bonuses.find(b => b.id === bonusId);
      if (bonus?.reward_title) {
        toast({
          title: "Recompensa desbloqueada!",
          description: bonus.reward_title,
        });
      }

      fetchBonuses();
    } catch (error) {
      console.error("Error completing bonus:", error);
      toast({
        title: "Erro ao concluir bônus",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  // Admin functions
  const createBonus = async (bonus: Partial<Bonus>) => {
    try {
      const { data: maxOrder } = await supabase
        .from("bonuses")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();

      const newBonus = {
        title: bonus.title || "Novo Bônus",
        description: bonus.description,
        content_type: bonus.content_type || "video",
        content_url: bonus.content_url,
        thumbnail: bonus.thumbnail,
        completion_rule: bonus.completion_rule || "click",
        unlock_delay_hours: bonus.unlock_delay_hours || 24,
        sort_order: (maxOrder?.sort_order || 0) + 1,
        is_active: bonus.is_active ?? true,
        reward_title: bonus.reward_title,
        reward_description: bonus.reward_description,
        reward_url: bonus.reward_url
      };

      const { error } = await supabase
        .from("bonuses")
        .insert(newBonus);

      if (error) throw error;

      toast({
        title: "Bônus criado",
        description: "O bônus foi adicionado à trilha"
      });

      fetchBonuses();
    } catch (error) {
      console.error("Error creating bonus:", error);
      toast({
        title: "Erro ao criar bônus",
        variant: "destructive"
      });
    }
  };

  const updateBonus = async (id: string, updates: Partial<Bonus>) => {
    try {
      const { error } = await supabase
        .from("bonuses")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Bônus atualizado"
      });

      fetchBonuses();
    } catch (error) {
      console.error("Error updating bonus:", error);
      toast({
        title: "Erro ao atualizar bônus",
        variant: "destructive"
      });
    }
  };

  const deleteBonus = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bonuses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Bônus removido"
      });

      fetchBonuses();
    } catch (error) {
      console.error("Error deleting bonus:", error);
      toast({
        title: "Erro ao remover bônus",
        variant: "destructive"
      });
    }
  };

  const reorderBonuses = async (newOrder: { id: string; sort_order: number }[]) => {
    try {
      for (const item of newOrder) {
        await supabase
          .from("bonuses")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id);
      }

      fetchBonuses();
    } catch (error) {
      console.error("Error reordering bonuses:", error);
    }
  };

  useEffect(() => {
    fetchBonuses();
  }, [user]);

  return {
    bonuses,
    loading,
    fetchBonuses,
    completeBonus,
    createBonus,
    updateBonus,
    deleteBonus,
    reorderBonuses
  };
}
