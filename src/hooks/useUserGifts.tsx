import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface UserGift {
  id: string;
  user_id: string;
  gift_type: string;
  gift_title: string;
  gift_description: string | null;
  is_enabled: boolean;
  enabled_at: string | null;
  is_claimed: boolean;
  claimed_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserGiftWithProfile extends UserGift {
  profile?: {
    name: string | null;
    email: string | null;
    created_at: string;
  };
}

export function useUserGifts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gifts, setGifts] = useState<UserGift[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGifts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_gifts")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setGifts((data as UserGift[]) || []);
    } catch (error) {
      console.error("Error fetching gifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimGift = async (giftId: string) => {
    if (!user) return false;

    try {
      const gift = gifts.find(g => g.id === giftId);
      if (!gift) return false;

      // Check if expired
      if (gift.expires_at && new Date(gift.expires_at) < new Date()) {
        toast({
          title: "Tempo expirado!",
          description: "O prazo para resgatar este bônus já passou.",
          variant: "destructive"
        });
        return false;
      }

      // Check if already claimed
      if (gift.is_claimed) {
        toast({
          title: "Já resgatado",
          description: "Você já resgatou este bônus.",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from("user_gifts")
        .update({
          is_claimed: true,
          claimed_at: new Date().toISOString()
        })
        .eq("id", giftId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "🎁 Bônus liberado com sucesso!",
        description: `Você ganhou acesso por tempo indeterminado à ${gift.gift_title}!`,
      });

      fetchGifts();
      return true;
    } catch (error) {
      console.error("Error claiming gift:", error);
      toast({
        title: "Erro ao resgatar bônus",
        description: "Tente novamente",
        variant: "destructive"
      });
      return false;
    }
  };

  // Check if user has an available gift to claim
  const getAvailableGift = () => {
    return gifts.find(g => 
      g.is_enabled && 
      !g.is_claimed && 
      (!g.expires_at || new Date(g.expires_at) > new Date())
    );
  };

  useEffect(() => {
    fetchGifts();
  }, [user]);

  return {
    gifts,
    loading,
    fetchGifts,
    claimGift,
    getAvailableGift
  };
}

// Admin hook
export function useAdminGifts() {
  const { toast } = useToast();
  const [allGifts, setAllGifts] = useState<UserGiftWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllGifts = async () => {
    try {
      // First get all gifts
      const { data: giftsData, error: giftsError } = await supabase
        .from("user_gifts")
        .select("*")
        .order("created_at", { ascending: false });

      if (giftsError) throw giftsError;

      // Get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, name, email, created_at");

      if (profilesError) throw profilesError;

      // Combine data
      const giftsWithProfiles: UserGiftWithProfile[] = ((giftsData as UserGift[]) || []).map(gift => {
        const profile = profilesData?.find(p => p.user_id === gift.user_id);
        return {
          ...gift,
          profile: profile ? {
            name: profile.name,
            email: profile.email,
            created_at: profile.created_at
          } : undefined
        };
      });

      setAllGifts(giftsWithProfiles);
    } catch (error) {
      console.error("Error fetching all gifts:", error);
    } finally {
      setLoading(false);
    }
  };

  const enableGift = async (userId: string, giftType: string = "agenda_access") => {
    try {
      // Check if gift already exists
      const { data: existing } = await supabase
        .from("user_gifts")
        .select("*")
        .eq("user_id", userId)
        .eq("gift_type", giftType)
        .single();

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

      if (existing) {
        const { error } = await supabase
          .from("user_gifts")
          .update({
            is_enabled: true,
            enabled_at: new Date().toISOString(),
            expires_at: expiresAt,
            is_claimed: false,
            claimed_at: null
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_gifts")
          .insert({
            user_id: userId,
            gift_type: giftType,
            is_enabled: true,
            enabled_at: new Date().toISOString(),
            expires_at: expiresAt
          });

        if (error) throw error;
      }

      toast({
        title: "Bônus liberado!",
        description: "O usuário tem 10 minutos para resgatar."
      });

      fetchAllGifts();
    } catch (error) {
      console.error("Error enabling gift:", error);
      toast({
        title: "Erro ao liberar bônus",
        variant: "destructive"
      });
    }
  };

  const disableGift = async (giftId: string) => {
    try {
      const { error } = await supabase
        .from("user_gifts")
        .update({
          is_enabled: false
        })
        .eq("id", giftId);

      if (error) throw error;

      toast({
        title: "Bônus desativado"
      });

      fetchAllGifts();
    } catch (error) {
      console.error("Error disabling gift:", error);
      toast({
        title: "Erro ao desativar bônus",
        variant: "destructive"
      });
    }
  };

  const deleteGift = async (giftId: string) => {
    try {
      const { error } = await supabase
        .from("user_gifts")
        .delete()
        .eq("id", giftId);

      if (error) throw error;

      toast({
        title: "Bônus removido"
      });

      fetchAllGifts();
    } catch (error) {
      console.error("Error deleting gift:", error);
      toast({
        title: "Erro ao remover bônus",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAllGifts();
  }, []);

  return {
    allGifts,
    loading,
    fetchAllGifts,
    enableGift,
    disableGift,
    deleteGift
  };
}
