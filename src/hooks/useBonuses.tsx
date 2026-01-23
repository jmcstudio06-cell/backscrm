import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useProfile } from "./useProfile";
import { useToast } from "./use-toast";

export interface Bonus {
  id: string;
  title: string;
  description: string | null;
  content_type: "video" | "link" | "download" | "lesson";
  content_url: string | null;
  thumbnail: string | null;
  completion_rule: "click" | "watch_50" | "watch_100" | "download";
  unlock_after_hours: number; // Hours after user registration
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
  timeLabel: string; // e.g. "24h", "3 dias", "15 dias", "1 mês"
}

// Convert hours to readable label
function getTimeLabel(hours: number): string {
  if (hours <= 0) return "Imediato";
  if (hours < 24) return `${hours}h`;
  if (hours < 48) return "1 dia";
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} dias`;
  if (days < 14) return "1 semana";
  if (days < 30) return `${Math.floor(days / 7)} semanas`;
  if (days < 60) return "1 mês";
  
  const months = Math.floor(days / 30);
  return `${months} meses`;
}

export function useBonuses() {
  const { user } = useAuth();
  const { profile } = useProfile();
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
        .order("unlock_after_hours", { ascending: true });

      if (bonusesError) throw bonusesError;

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_bonus_progress")
        .select("*")
        .eq("user_id", user.id);

      if (progressError) throw progressError;

      // Get user registration date from profile or user metadata
      const registrationDate = profile?.created_at 
        ? new Date(profile.created_at) 
        : new Date(user.created_at || Date.now());

      // Calculate status based on time since registration
      const bonusesWithProgress: BonusWithProgress[] = (bonusesData || []).map((bonus) => {
        const progress = progressData?.find(p => p.bonus_id === bonus.id) || null;
        
        // Calculate unlock time based on registration
        const unlockTime = new Date(registrationDate.getTime() + (bonus.unlock_after_hours * 60 * 60 * 1000));
        const now = new Date();
        
        // Determine status
        let status: "locked" | "available" | "completed" = "locked";
        
        if (progress?.completed_at) {
          status = "completed";
        } else if (now >= unlockTime) {
          status = "available";
        } else {
          status = "locked";
        }

        return {
          ...bonus,
          content_type: bonus.content_type as BonusWithProgress["content_type"],
          completion_rule: bonus.completion_rule as BonusWithProgress["completion_rule"],
          progress,
          status,
          unlockTime: status === "locked" ? unlockTime : null,
          timeLabel: getTimeLabel(bonus.unlock_after_hours)
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
      const newBonus = {
        title: bonus.title || "Novo Bônus",
        description: bonus.description,
        content_type: bonus.content_type || "video",
        content_url: bonus.content_url,
        thumbnail: bonus.thumbnail,
        completion_rule: bonus.completion_rule || "click",
        unlock_after_hours: bonus.unlock_after_hours || 24,
        sort_order: bonus.unlock_after_hours || 24, // Use hours as sort order
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
        description: "O prêmio foi adicionado à trajetória"
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
  }, [user, profile]);

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
